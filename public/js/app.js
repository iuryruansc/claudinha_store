import { on, disconnect } from './services/socket-service.js';

console.log('Global app script loaded. Listening for forceDisconnect.');

on('forceDisconnect', (message) => {
    disconnect();

    Swal.fire({
        icon: 'warning',
        title: 'Sessão Encerrada',
        text: message,
        allowOutsideClick: false,
        allowEscapeKey: false,
        confirmButtonText: 'Entendido'
    }).then(() => {
        window.location.reload();
    });
});