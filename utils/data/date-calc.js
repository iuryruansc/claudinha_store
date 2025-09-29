function calcularTempoAtras(data) {
    const agora = new Date();
    const diffSegundos = Math.round((agora - new Date(data)) / 1000);

    const minutos = Math.round(diffSegundos / 60);
    const horas = Math.round(minutos / 60);
    const dias = Math.round(horas / 24);
    const meses = Math.round(dias / 30);
    const anos = Math.round(dias / 365);

    if (diffSegundos < 60) {
        return 'agora mesmo';
    } else if (minutos < 60) {
        return `há ${minutos} minuto(s)`;
    } else if (horas < 24) {
        return `há ${horas} hora(s)`;
    } else if (dias === 1) {
        return 'ontem';
    } else if (dias < 30) {
        return `há ${dias} dia(s)`;
    } else if (meses < 12) {
        return `há ${meses} mes(es)`;
    } else {
        return `há ${anos} ano(s)`;
    }
}

module.exports = {
    calcularTempoAtras
}