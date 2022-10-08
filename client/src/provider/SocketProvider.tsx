import React, { ReactElement, useState } from 'react';
import { io, Socket } from 'socket.io-client';

export type SocketType = {
    socket: Socket,
    lastUpdatedTimestamp: Number,
    connectionWasLost: Number
}

export type SocketProviderProperties = {
    children: ReactElement,
    value: SocketType | null
}

export type SocketStateHandler = {
    socket: Socket | null,
    socketConnectionWasLost: Number
}

export const SocketContext = React.createContext<SocketStateHandler | null>(null);

export const SocketProvider = (props: SocketProviderProperties) => {
    const [socket, setSocketState] = useState(props.value);

    const state: SocketStateHandler = {
        socket: socket?.socket ?? null,
        socketConnectionWasLost: socket?.connectionWasLost ?? 0
    }

    socket?.socket?.on('disconnect', () => {
        setSocketState({...socket, lastUpdatedTimestamp: Date.now(), connectionWasLost: 1});
    });

    socket?.socket?.on('connect', () => {
        if(socket.connectionWasLost) {
            setSocketState({...socket, lastUpdatedTimestamp: Date.now(), connectionWasLost: -1});
        } else {
            setSocketState({...socket, lastUpdatedTimestamp: Date.now(), connectionWasLost: 0});
        }
    });

    return (
        <SocketContext.Provider value={state}>
            {props.children}
        </SocketContext.Provider>
    );
};

export const startupSocketState = (): SocketType => {
    const socket = io(`http://192.168.86.26:5000`, {secure: true, timeout: 100, reconnectionDelay: 1000, reconnectionDelayMax:1000, transports: ["websocket"]});
    // const socket = io(`http://localhost:5000`, {secure: true, timeout: 100, reconnectionDelay: 1000, reconnectionDelayMax:1000, transports: ["websocket"]});
    return {
        socket: socket,
        lastUpdatedTimestamp: Date.now(),
        connectionWasLost: 0
    }
}