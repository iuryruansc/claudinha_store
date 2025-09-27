; (function () {
  function showSuccessPopup(message, detail = '') {
    Swal.fire({
      icon: 'success',
      title: message,
      text: detail,
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 2000,
      timerProgressBar: true
    });
  }
  // Anexa ao escopo global
  window.showSuccessPopup = showSuccessPopup;
})();
