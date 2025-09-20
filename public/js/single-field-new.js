import { showErrorPopup } from '/js/show-error-popup.js'

export function setupSingleFieldNew({
    formSelector,
    inputName,
    redirectUrl,
    errorMessages = {
        empty: 'O campo não pode ser vazio.',
        network: 'Ocorreu um erro de rede. Tente novamente mais tarde.',
    },
    fieldKey
}) {
    const form = document.querySelector(formSelector);
    if (!form) return;

    const input = form.querySelector(`input[name="${inputName}"]`);
    const button = form.querySelector('button[type="submit"]');
    
    input.addEventListener('input', function () {
        if (this.value.trim().length > 0) {
            button.removeAttribute('disabled');
        } else {
            button.setAttribute('disabled', 'disabled');
        }
    });

    form.addEventListener('submit', async function (event) {
        event.preventDefault();

        const value = input.value.trim();

        if (value.length === 0) {
            showErrorPopup(errorMessages.empty);
            return;
        }

        try {
            const response = await fetch(form.getAttribute('action'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ [fieldKey]: value }),
            });

            if (response.ok) {
                window.location.href = redirectUrl;
            } else {
                const errorData = await response.json();
                showErrorPopup(errorData.error.message, errorData.error.details);
            }
        } catch (error) {
            console.error('Erro de rede:', error);
            showErrorPopup(errorMessages.network);
        }
    });
}