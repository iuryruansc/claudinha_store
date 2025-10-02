const socket = io();

socket.on('connect', () => {
    console.log('Socket.IO Service: Conectado com sucesso!');
});

export function on(eventName, callback) {
    socket.on(eventName, callback);
}

export function emit(eventName, data) {
    socket.emit(eventName, data);
}

export function disconnect() {
    socket.disconnect();
    console.log('Socket.IO Service: Desconectado manualmente pelo cliente.');
}