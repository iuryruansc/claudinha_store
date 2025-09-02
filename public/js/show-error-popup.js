export function showErrorPopup(message, details = []) {
    const popupContainer = document.getElementById('error-popup-container');
    if (!popupContainer) {
        console.error('No element with ID "error-popup-container" found.');
        return;
    }

    popupContainer.innerHTML = '';
    const popup = document.createElement('div');
    popup.className = 'alert alert-danger alert-dismissible fade show mt-3';
    popup.setAttribute('role', 'alert');
    popup.innerHTML = `
        <strong>${message}</strong>
        ${details && details.length > 0 ? `<ul>${details.map(d => `<li>${d}</li>`).join('')}</ul>` : ''}
        <button type="button" class="close" data-dismiss="alert" aria-label="Close">
            <span aria-hidden="true">&times;</span>
        </button>
    `;

    popupContainer.appendChild(popup);

    const closeButton = popup.querySelector('.close');
    if (closeButton) {
        closeButton.addEventListener('click', () => {
            popup.remove();
        });
    }
}
