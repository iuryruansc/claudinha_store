document.addEventListener('DOMContentLoaded', () => {
    
    function updatePromoTimers() {
        const promoCards = document.querySelectorAll('.promo-card');
        
        promoCards.forEach(card => {
            const progressBar = card.querySelector('.promo-bar');
            const remainingEl = card.querySelector('.promo-remaining');

            if (!progressBar || !remainingEl) return;

            const inicio = new Date(progressBar.dataset.inicio);
            const fim = new Date(progressBar.dataset.fim);
            const agora = new Date();

            if (isNaN(inicio.getTime()) || isNaN(fim.getTime())) return;

            const duracaoTotal = fim - inicio;
            const tempoDecorrido = agora - inicio;
            
            let porcentagem = (tempoDecorrido / duracaoTotal) * 100;
            porcentagem = Math.max(0, Math.min(100, porcentagem));

            progressBar.style.width = porcentagem + '%';

            const tempoRestanteMs = fim - agora;

            if (tempoRestanteMs > 0 && agora >= inicio) {
                const dias = Math.floor(tempoRestanteMs / (1000 * 60 * 60 * 24));
                const horas = Math.floor((tempoRestanteMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                
                let textoRestante = 'Termina em ';
                if (dias > 0) {
                    textoRestante += `${dias}d ${horas}h`;
                } else if (horas > 0) {
                    textoRestante += `${horas}h`;
                } else {
                    const minutos = Math.floor((tempoRestanteMs % (1000 * 60 * 60)) / (1000 * 60));
                    textoRestante += `${minutos} min`;
                }
                remainingEl.textContent = textoRestante;
                progressBar.classList.remove('bg-secondary', 'bg-info');
                progressBar.classList.add('bg-success');
            } else if (agora < inicio) {
                remainingEl.textContent = 'Agendada';
                progressBar.style.width = '100%';
                progressBar.classList.remove('bg-success', 'bg-secondary');
                progressBar.classList.add('bg-info');
            } else {
                remainingEl.textContent = 'Encerrada';
                progressBar.style.width = '100%';
                progressBar.classList.remove('bg-success', 'bg-info');
                progressBar.classList.add('bg-secondary');
            }
        });
    }

    updatePromoTimers();
    setInterval(updatePromoTimers, 60000); // Atualiza a cada minuto
});