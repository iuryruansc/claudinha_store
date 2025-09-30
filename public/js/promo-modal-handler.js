document.addEventListener('DOMContentLoaded', () => {
    const promoModalEl = document.getElementById('promoModal');
    if (!promoModalEl) return;

    const promoForm = document.getElementById('promo-form');
    const modalTitle = document.getElementById('promoModalLabel');
    const promoIdInput = document.getElementById('id_desconto');
    const promoModal = new bootstrap.Modal(promoModalEl);

    const formatDateForInput = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        // Ajusta para o fuso horário local para evitar problemas de um dia a menos
        const offset = date.getTimezoneOffset();
        const adjustedDate = new Date(date.getTime() - (offset*60*1000));
        return adjustedDate.toISOString().split('T')[0];
    };

    // Listener para o botão "Criar Nova Promoção"
    const btnNovaPromo = document.getElementById('btn-nova-promo');
    if(btnNovaPromo) {
        btnNovaPromo.addEventListener('click', () => {
            promoForm.reset();
            modalTitle.textContent = 'Criar Nova Promoção';
            promoIdInput.value = '';
            promoForm.action = '/admin/promocoes/save';
        });
    }

    // Listener para os botões "Editar" (usando delegação de eventos na página toda)
    document.body.addEventListener('click', async (event) => {
        const editButton = event.target.closest('.edit-promo-btn');
        if (!editButton) return;

        const promoId = editButton.dataset.promoId;
        
        try {
            const response = await fetch(`/admin/promocoes/json/${promoId}`);
            if (!response.ok) throw new Error('Promoção não encontrada.');
            
            const promo = await response.json();

            // Preenche o formulário do modal com os dados da promoção
            modalTitle.textContent = `Editar Promoção: ${promo.lote?.produto?.nome || ''}`;
            promoIdInput.value = promo.id_desconto;
            document.getElementById('id_lote').value = promo.id_lote;
            document.getElementById('tipo').value = promo.tipo;
            document.getElementById('valor').value = promo.valor;
            document.getElementById('data_inicio').value = formatDateForInput(promo.data_inicio);
            document.getElementById('data_fim').value = formatDateForInput(promo.data_fim);
            document.getElementById('observacao').value = promo.observacao || '';
            
            // Define a action do formulário para a rota de atualização
            promoForm.action = `/admin/promocoes/update/${promo.id_desconto}`;

        } catch (error) {
            console.error('Erro ao buscar dados da promoção:', error);
            alert('Não foi possível carregar os dados para edição.');
            promoModal.hide();
        }
    });

     promoForm.addEventListener('submit', async (event) => {
        event.preventDefault(); 
        
        const isUpdate = !!promoIdInput.value;

        if (!isUpdate) {
            promoForm.submit();
            return;
        }

        const url = promoForm.action;
        const formData = new FormData(promoForm);
        const data = Object.fromEntries(formData.entries());

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });

            const result = await response.json();

            if (response.ok) {
                window.location.reload();
            } else {
                throw new Error(result.message || 'Erro ao atualizar a promoção.');
            }
        } catch (error) {
            console.error('Erro ao enviar o formulário:', error);
            alert(error.message);
        }
    });

    promoModalEl.addEventListener('hidden.bs.modal', () => {
        promoForm.reset();
    });
});