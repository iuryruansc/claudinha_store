export function showSuccessPopup(message) {
    const container = document.getElementById('error-popup-container') || document.body;
    const alertDiv = document.createElement('div');
    
    // Usa classes de sucesso do Bootstrap (alert-success)
    alertDiv.className = 'alert alert-success alert-dismissible fade show shadow-sm';
    alertDiv.style.position = 'fixed';
    alertDiv.style.top = '20px';
    alertDiv.style.right = '20px';
    alertDiv.style.zIndex = '1050'; // Garante que fique acima de outros elementos
    alertDiv.setAttribute('role', 'alert');

    alertDiv.innerHTML = `
        <i class="bi bi-check-circle-fill me-2"></i>
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;

    container.prepend(alertDiv);

    // Remove o pop-up após 4 segundos
    setTimeout(() => {
        const alertInstance = bootstrap.Alert.getOrCreateInstance(alertDiv);
        if (alertInstance) {
            alertInstance.close();
        }
    }, 4000);
}