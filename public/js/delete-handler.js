import { showErrorPopup } from "/js/show-error-popup.js";

export function setupRowDelete(deleteForms, toggleExcluir, tableBody) {
    toggleExcluir.addEventListener('change', function () {
        tableBody.classList.toggle('delete-enabled', this.checked)
    });

    deleteForms.forEach(form => {
        form.addEventListener('submit', async function (event) {
            event.preventDefault();
            if (confirm('Você tem certeza que deseja excluir estas?')) {
                const formAction = this.getAttribute('action');
                try {
                    const response = await fetch(formAction, {
                        method: 'POST'
                    });

                    if (response.ok) {
                        const row = form.closest('tr');
                        if (row) {
                            row.remove();
                        }
                    } else {
                        const errorData = await response.json();
                        showErrorPopup(errorData.error.message, errorData.error.details);
                    }
                } catch (error) {
                    console.error('Erro de rede:', error);
                    showErrorPopup('Ocorreu um erro de rede. Tente novamente mais tarde');
                }
            }
        });
    });
}
