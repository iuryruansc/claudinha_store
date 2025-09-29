import { showErrorPopup } from "/js/lib/show-error-popup.js";

export function setupSingleFieldEdit({
    formSelector,
    inputName,
    redirectUrl,
    errorMessages = {
        empty: 'O campo não pode ser vazio.',
        unchanged: 'O valor não foi alterado. Requisição não enviada.',
        network: 'Ocorreu um erro de rede. Tente novamente mais tarde.',
    },
    fieldKey
}) {
    const form = document.querySelector(formSelector);
    if (!form) return;

    const input = form.querySelector(`input[name="${inputName}"]`);
    const button = form.querySelector('button[type="submit"]');
    const originalValue = input.value;

    form.addEventListener('submit', async function (event) {
        event.preventDefault();

        const newValue = input.value.trim();

        if (newValue.length === 0) {
            showErrorPopup(errorMessages.empty);
            return;
        }

        if (newValue === originalValue) {
            showErrorPopup(errorMessages.unchanged);
            return;
        }

        try {
            const response = await fetch(form.getAttribute('action'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ [fieldKey]: newValue }),
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

    input.addEventListener('input', function () {
        if (this.value.trim().length > 0) {
            button.removeAttribute('disabled');
        } else {
            button.setAttribute('disabled', 'disabled');
        }
    });
}
