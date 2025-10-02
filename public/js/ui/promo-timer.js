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
            const tempoRestanteMs = fim - agora;

            progressBar.classList.remove('bg-success', 'bg-info', 'bg-warning', 'bg-danger', 'bg-secondary');

            if (tempoRestanteMs > 0 && agora >= inicio) {

                let porcentagemRestante = (tempoRestanteMs / duracaoTotal) * 100;
                porcentagemRestante = Math.max(0, Math.min(100, porcentagemRestante));

                progressBar.style.width = porcentagemRestante + '%';

                if (porcentagemRestante <= 20) {
                    progressBar.classList.add('bg-danger');
                } else if (porcentagemRestante <= 50) {
                    progressBar.classList.add('bg-warning');
                } else {
                    progressBar.classList.add('bg-success');
                }

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

            } else if (agora < inicio) {
                // 3. Promoção AGENDADA
                remainingEl.textContent = 'Agendada';
                progressBar.style.width = '100%';
                progressBar.classList.add('bg-info'); 

            } else {
                // 4. Promoção ENCERRADA
                remainingEl.textContent = 'Encerrada';
                progressBar.style.width = '0%';
                progressBar.classList.add('bg-secondary');
            }
        });
    }

    updatePromoTimers();
    setInterval(updatePromoTimers, 60000);
});