import { render } from "react-dom";
import { App } from './App';
import { SocketProvider, startupSocketState } from "./provider/SocketProvider";

render(
    <SocketProvider value={startupSocketState()}>
        <App />
    </SocketProvider>,
    document.getElementById("root")
);