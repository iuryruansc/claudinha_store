import { showErrorPopup } from "/js/show-error-popup.js";

export function setupRowDelete(deleteForms, toggleExcluir, tableBody) {
    toggleExcluir.addEventListener('change', function () {
        tableBody.classList.toggle('delete-enabled', this.checked)
    });

    deleteForms.forEach(form => {
        form.addEventListener('submit', async function (event) {
            event.preventDefault();
            if (confirm('Você tem certeza que deseja excluir essas informações?')) {
                try {
                    const response = await fetch(this.getAttribute('action'), {
                        method: 'POST'
                    });

                    if (response.ok) {
                        const row = form.closest('tr');
                        if (row) {
                            row.remove();
                        }
                        window.location.reload();
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
