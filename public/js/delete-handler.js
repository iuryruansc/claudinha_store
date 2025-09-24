import { showErrorPopup } from "/js/show-error-popup.js";

export function setupRowDelete(deleteForms, toggleExcluir, tableBody) {
    toggleExcluir.addEventListener('change', function () {
        const newlyVisibleTooltips = Array.from(document.querySelectorAll('.excluir-btn')).filter(el => el.offsetParent !== null);
        newlyVisibleTooltips.forEach(el => new bootstrap.Tooltip(el));
        tableBody.classList.toggle('delete-enabled', this.checked)
    });

    deleteForms.forEach(form => {
        form.addEventListener('submit', async function (event) {
            event.preventDefault();

            if (confirm('Você tem certeza que deseja excluir essas informações?')) {
                try {
                    const response = await fetch(this.getAttribute('action'), {
                        method: 'POST',
                        headers: { 'Accept': 'application/json' }
                    });

                    let data;
                    try {
                        data = await response.json();
                    } catch (jsonError) {
                        console.warn('Resposta não era JSON:', jsonError);
                        showErrorPopup('Erro inesperado ao interpretar a resposta do servidor.');
                        return;
                    }

                    if (response.ok) {
                        const row = form.closest('tr');
                        if (row) row.remove();
                        window.location.reload();
                    } else {
                        const mensagem = data.error?.message || 'Erro ao excluir.';
                        const detalhes = data.error?.details || [];
                        showErrorPopup(mensagem, detalhes);
                    }
                } catch (error) {
                    console.error('Erro de rede:', error);
                    showErrorPopup('Erro de rede. Verifique sua conexão ou tente novamente mais tarde.');
                }
            }
        });

    });
}
