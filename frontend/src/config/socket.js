import socket from 'socket.io-client';

let socketInstance = null;

export const initializeSocket = (projectId) => {
    if (socketInstance) {
        socketInstance.disconnect();
        socketInstance = null; // Good practice to nullify after disconnect
    }

    socketInstance = socket(import.meta.env.VITE_API_URL, {
        auth: {
            token: localStorage.getItem('token')
        },
        query: {
            projectId
        }
    });

    // Optional: Basic connection event listeners for debugging or global state
    socketInstance.on('connect', () => {
        console.log('Socket connected:', socketInstance.id);
    });

    socketInstance.on('disconnect', (reason) => {
        console.log('Socket disconnected:', reason);
    });

    socketInstance.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
    });

    return socketInstance;
};

export const disconnectSocket = () => {
    if (socketInstance) {
        console.log('Disconnecting socket:', socketInstance.id);
        socketInstance.disconnect();
        socketInstance = null;
    }
};

export const receiveMessage = (eventName, cb) => {
    if (socketInstance && cb) {
        socketInstance.on(eventName, cb);
    } else {
        console.warn('Socket not initialized or callback not provided for receiveMessage:', eventName);
    }
};

export const sendMessage = (eventName, data) => {
    if (socketInstance) {
        socketInstance.emit(eventName, data);
    } else {
        console.warn('Socket not initialized, cannot send message:', eventName, data);
    }
};

export const removeListener = (eventName, cb) => {
    if (socketInstance && cb) {
        socketInstance.off(eventName, cb);
    } else {
        console.warn('Socket not initialized or callback not provided for removeListener:', eventName);
    }
};
