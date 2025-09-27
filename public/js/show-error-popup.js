export function showErrorPopup(message, details = [], dismissAfter = 3000) {
    const container = document.getElementById('error-popup-container');
    if (!container) return console.error('Container não encontrado.');

    container.innerHTML = '';

    const popup = document.createElement('div');
    popup.className = 'alert-custom';
    popup.setAttribute('role', 'alert');

    // Ícone + texto principal
    popup.innerHTML = `
    <i class="bi bi-exclamation-triangle-fill icon" aria-hidden="true"></i>
    <div>
      <strong>${message}</strong>
      ${Array.isArray(details) && details.length
            ? `<ul>${details.map(d => `<li>${d}</li>`).join('')}</ul>`
            : ''}
    </div>
    <button class="close-btn" aria-label="Fechar">&times;</button>
  `;

    container.appendChild(popup);

    function fadeAndRemove() {
        popup.classList.add('fade-out');
        popup.addEventListener('animationend', () => popup.remove());
    }

    const timer = setTimeout(fadeAndRemove, dismissAfter);

    popup.querySelector('.close-btn')
        .addEventListener('click', () => {
            clearTimeout(timer);
            fadeAndRemove();
        });
}
