import { showErrorPopup } from '/js/show-error-popup.js';

export function setupMultiFieldNew({
    formSelector,
    inputFields = [],
    selectFields = [],
    requiredFields = [],
    redirectUrl,
    fieldMap = {},
    errorMessages = {
        network: 'Ocorreu um erro de rede. Tente novamente mais tarde.',
    }
}) {
    const form = document.querySelector(formSelector);
    const button = form.querySelector('button[type="submit"]');

    if (!form || !button) return;

    const inputs = inputFields.map(sel => document.querySelector(sel));
    const selects = selectFields.map(sel => document.querySelector(sel));

    function validateForm() {
        const allRequiredFilled = requiredFields.every(key => {
            const selector = fieldMap[key];
            const el = document.querySelector(selector);
            return el && el.value.trim().length > 0;
        });


        if (allRequiredFilled) {
            button.removeAttribute('disabled');
        } else {
            button.setAttribute('disabled', 'disabled');
        }
    }

    [...inputs, ...selects].forEach(el => {
        if (!el) return;
        const eventType = el.tagName === 'SELECT' ? 'change' : 'input';
        el.addEventListener(eventType, validateForm);
    });

    form.addEventListener('submit', async function (event) {
        event.preventDefault();

        const payload = {};
        for (const [key, selector] of Object.entries(fieldMap)) {
            const el = document.querySelector(selector);
            if (el) payload[key] = el.value;
        }

        try {
            const response = await fetch(form.getAttribute('action'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
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
