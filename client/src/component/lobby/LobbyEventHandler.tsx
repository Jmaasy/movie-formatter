import { Socket } from "socket.io-client";
import { FileMapper } from "./LobbyType";

export const setupEventHandlers = (
    socket: Socket | null,
    setFileState: React.Dispatch<React.SetStateAction<FileMapper[][] | undefined>>,
    setChangedFileState: React.Dispatch<React.SetStateAction<FileMapper[][] | undefined>>
) => {
    if(socket != null) {
        socket.off("files-retrieved").on("files-retrieved", event => {
            console.log(event);
            
            setFileState(event.content);
            setChangedFileState(event.content);
        });
    }
};