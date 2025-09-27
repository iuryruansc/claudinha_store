export function initEntradaProduto({
  btnSelector,
  inputSelector,
  modalSelector,
  endpoint,
  onError,
}) {
  const btn = document.querySelector(btnSelector);
  const input = document.querySelector(inputSelector);
  const modalEl = document.querySelector(modalSelector);
  const modal = new bootstrap.Modal(modalEl);

  btn.addEventListener("click", async () => {
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
      return onError(err.error.message, err.error.details);
    }

    const { id_produto, nome, preco } = await res.json();
    modalEl.querySelector("[data-field=produtoId]").value = id_produto;
    modalEl.querySelector("[data-field=produtoNome]").value = nome;
    modalEl.querySelector("[data-field=produtoValor]").value = preco;
    input.value = "";
    modal.show();
  });
}