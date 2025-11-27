import { showErrorPopup } from '/js/lib/show-error-popup.js';
import { showSuccessPopup } from '/js/lib/show-success-popup.js';

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

    function getProcessedValue(key, element) {
        let value = element.value.trim();

        if (key === 'preco_venda' || key === 'preco_compra' || key.toLowerCase().includes('preco')) {
            value = value.replace(',', '.');

            if (value !== '') {
                const n = Number.parseFloat(value);
                return Number.isFinite(n) ? Number(n.toFixed(2)) : value;
            }
        }
        return value;
    }

    for (const [key, selector] of Object.entries(fieldMap)) {
        const el = document.querySelector(selector);
        if (el) {
            fields[key] = el;
            originalValues[key] = getProcessedValue(key, el);
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
            updatedValues[key] = getProcessedValue(key, el);
        }

        const isUnchanged = Object.keys(updatedValues).every(
            key => updatedValues[key] === originalValues[key]
        );

        if (isUnchanged) {
            showErrorPopup(errorMessages.unchanged);
            return;
        }

        const missingRequired = requiredFields.some(key => {
            const val = updatedValues[key];
            return val === '' || val === null || val === undefined;
        });

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
                const successData = await response.json();
                showSuccessPopup(successData.message);

                setTimeout(() => {
                    window.location.href = redirectUrl;
                }, 500);
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