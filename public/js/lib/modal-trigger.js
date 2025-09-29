export function initModalTrigger({
  btnSelector,
  inputSelector,
  modalSelector,
  endpoint,
  onError,
  onSuccess,
}) {
  const btn = document.querySelector(btnSelector);
  const input = document.querySelector(inputSelector);
  const modalEl = document.querySelector(modalSelector);

  if (!btn || !input || !modalEl) {
    console.error("Seletores do Modal Trigger não encontrados.", { btnSelector, inputSelector, modalSelector });
    return;
  }

  const modal = new bootstrap.Modal(modalEl);

  const triggerAction = async () => {
    const codigo = input.value.trim();
    if (!codigo) {
      return onError("Informe um código de barras.");
    }

    let res;
    try {
      res = await fetch(`${endpoint}?codigo_barras=${encodeURIComponent(codigo)}`);
    } catch {
      return onError("Falha na conexão. Tente novamente.");
    }

    if (!res.ok) {
      const err = await res.json();
      return onError(err.error.message || 'Produto não encontrado.');
    }

    const data = await res.json();

    if (onSuccess) {
      onSuccess(data, modalEl);
    }

    input.value = "";
    modal.show();
  };

  btn.addEventListener("click", triggerAction);

  input.addEventListener("keypress", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      triggerAction();
    }
  });
}