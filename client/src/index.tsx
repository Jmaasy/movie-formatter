import { render } from "react-dom";
import { App } from './App';
import { LobbyProvider, startupLobbyState } from "./provider/LobbyProvider";

render(
    <LobbyProvider value={startupLobbyState()}>
        <App />
    </LobbyProvider>,
    document.getElementById("root")
);