import { on } from '/js/services/socket-service.js';

$(document).ready(function () {
    const table = $('#table-data').DataTable();

    $('#table-data tbody').on('click', 'button.expand-btn', function () {
        const tr = $(this).closest('tr');
        const row = table.row(tr);
        const icon = $(this).find('i');

        if (row.child.isShown()) {
            row.child.hide();
            tr.removeClass('dt-hasChild');
            icon.removeClass('bi-chevron-up').addClass('bi-chevron-down');
        } else {
            const detailsHtml = decodeURIComponent(tr.data('details'));
            row.child(detailsHtml).show();
            tr.addClass('dt-hasChild');
            icon.removeClass('bi-chevron-down').addClass('bi-chevron-up');
        }
    });

    on('dashboard:vendaRealizada', (data) => {
        if (data.novaVendaFormatada) {
            const venda = data.novaVendaFormatada;

            const novaLinha = table.row.add([
                `<button class="btn btn-sm btn-outline-secondary expand-btn"><i class="bi bi-chevron-down"></i></button>`,
                venda.clienteNome,
                venda.data,
                venda.resumoItens,
                venda.valorTotal,
                venda.statusHtml,
                venda.acoesHtml
            ]);

            $(novaLinha.node()).attr('data-details', encodeURIComponent(venda.detailsHtml));

            table.draw(false);

            $(novaLinha.node()).addClass('table-success');
            setTimeout(() => {
                $(novaLinha.node()).removeClass('table-success');
            }, 2000);

            Toastify({
                text: `Nova venda #${venda.id_venda} registrada!`,
                duration: 3000,
                gravity: "top",
                position: "right",
                backgroundColor: "#198754",
            }).showToast();
        }
    });
});
