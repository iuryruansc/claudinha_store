import { showErrorPopup } from "/js/lib/show-error-popup.js";

export function setupRowDelete(deleteForms, toggleExcluir, tableBody) {

    toggleExcluir.addEventListener("change", () => {
        tableBody.classList.toggle("delete-enabled", toggleExcluir.checked);

        if (toggleExcluir.checked) {

            document
                .querySelectorAll(".excluir-btn")
                .forEach((btn) => {
                    if (btn.offsetParent !== null && !btn._tooltip) {

                        btn._tooltip = new bootstrap.Tooltip(btn);
                    }
                });
        }
    });

    deleteForms.forEach((form) => {
        form.addEventListener("submit", async (event) => {
            event.preventDefault();
            if (!confirm("Confirma exclusão?")) return;

            try {
                const response = await fetch(form.action, {
                    method: "POST",
                    headers: { Accept: "application/json" }
                });

                if (response.ok) {
                    const row = form.closest("tr");
                    if (row) row.remove();
                    return;
                }

                const contentType = response.headers.get("content-type") || "";
                let data = {};

                if (contentType.includes("application/json")) {
                    try {
                        data = await response.json();
                    } catch {
                        showErrorPopup("Erro inesperado ao interpretar resposta do servidor.");
                        return;
                    }
                }

                const msg = data.error?.message || "Erro ao excluir.";
                const det = data.error?.details || [];
                showErrorPopup(msg, det);

            } catch (networkError) {
                showErrorPopup(
                    "Erro de rede ao excluir. Verifique sua conexão."
                );
            }
        });
    });
}
