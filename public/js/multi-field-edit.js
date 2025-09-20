import { showErrorPopup } from '/js/show-error-popup.js';

export function setupMultiFieldEdit({
    formSelector,
    inputFields = [],
    selectFields = [],
    requiredFields = [],
    redirectUrl,
    fieldMap = {},
    errorMessages = {
        unchanged: 'Nenhuma alteração foi feita.',
        required: 'Preencha todos os campos obrigatórios.',
        network: 'Ocorreu um erro de rede. Tente novamente mais tarde.',
    }
}) {
    const form = document.querySelector(formSelector);
    const button = form.querySelector('button[type="submit"]');

    if (!form || !button) return;

    const inputs = inputFields.map(sel => document.querySelector(sel));
    const selects = selectFields.map(sel => document.querySelector(sel));

    const fields = {};
    const originalValues = {};

    for (const [key, selector] of Object.entries(fieldMap)) {
        const el = document.querySelector(selector);
        if (el) {
            fields[key] = el;
            originalValues[key] = el.value.trim();
        }
    }

    function validateForm() {
        const allRequiredFilled = requiredFields.every(key => {
            const el = fields[key];
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

        const updatedValues = {};
        for (const [key, el] of Object.entries(fields)) {
            let value = el.value.trim();
            
            if (key === 'preco') {
                value = value.replace(',', '.');
            }

            updatedValues[key] = value;
        }

        const isUnchanged = Object.keys(updatedValues).every(
            key => updatedValues[key] === originalValues[key]
        );

        if (isUnchanged) {
            showErrorPopup(errorMessages.unchanged);
            return;
        }

        const missingRequired = requiredFields.some(key => !updatedValues[key]);
        if (missingRequired) {
            showErrorPopup(errorMessages.required);
            return;
        }

        try {
            const response = await fetch(form.getAttribute('action'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedValues),
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
    validateForm();
}
