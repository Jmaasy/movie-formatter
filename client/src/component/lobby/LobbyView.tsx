import React, { useContext, useState } from 'react';
import { SocketContext } from '../../provider/SocketProvider';
import { setupEventHandlers } from './LobbyEventHandler';
import { FileMapper } from './LobbyType';
import './LobbyView.css';

export const LobbyView: React.FC = () => {   
    const [ fileState, setFileState ] = useState<FileMapper[][]>();
    const [ changedFileState, setChangedFileState ] = useState<FileMapper[][]>();
    const { socket } = useContext(SocketContext)!!;
    setupEventHandlers(socket, setFileState, setChangedFileState);

    const updateEnabled = (
        inner: number,
        enabled: boolean | null
    ) => {
        if(enabled != null && changedFileState != null) {
            const changedFileStateUpdated = changedFileState.map((v, k) => {
                if(k == inner) {
                    return v.map((x, k2) => {
                        x.enabled = enabled;
                        return x;
                    });
                } else {
                    return v;
                }
            });

            setChangedFileState(changedFileStateUpdated);
        }
    }

    const updateD = (
        inner: number,
        outer: number,
        
        title: string | null,
        subtitle: string | null,
        season: string | null,
        episode: string | null
    ) => {
        if(changedFileState != undefined) {
            const changedFileStateUpdated = changedFileState.map((v, k) => {
                if(k == inner) {
                    return v.map((x, k2) => {

                        if(k2 == outer) {
                            if(title != null) x.title = title;
                            if(subtitle != null && !x.isMovie) x.serie!!.episodeTitle = subtitle;
                            if(season != null && !x.isMovie) x.serie!!.season = season;
                            if(episode != null && !x.isMovie) x.serie!!.episode = episode;
                        }
                        return x;
                    })
                } else return v;
            })

            setChangedFileState(changedFileStateUpdated);
        }
    }

    const moveFiles = () => {
        socket?.emit("move-files", changedFileState);
    }

    let enabledCount = 0;

    return (
        <div className="f">
            {
                fileState?.map((x, index2) => {
                
                    const enabled = (changedFileState != null && changedFileState[index2][0].enabled) ? "enabled" : "disabled";

                    const f = (
                        <span className={'entry-head field-' + enabled}>
                            {(x[0].isMovie) ? "Movie": ""}
                            {(x[0].isSerie) ? "Serie": ""}
                            {(x[0].isMiniSerie) ? "Mini Serie": ""}
                        </span>
                    );

                    if(enabled == "enabled") enabledCount += 1;
                    
                    const h = (x[0].isMovie) ? (
                        <span className={"entry-wrapper entry-wrapper-head field-" + enabled}>
                            <span>Title</span>
                        </span>
                    ) : (
                        <span className={"entry-wrapper entry-wrapper-head field-" + enabled}>
                            <span>Title</span>
                            <span>Subtitle</span>
                            <span>Season</span>
                            <span>Episode</span>
                        </span>
                    )
                

                    const z = x.map((y, index) => {
                        if(y.isMovie) {
                            return (
                                <span className={'entry-wrapper field-' + enabled}>
                                    <input name='title' type="text" placeholder={y.title}></input>
                                </span>
                            )
                        } else {
                            return (
                                <span className={'entry-wrapper field-' + enabled}>
                                    <input name='title' type="text" onChange={e => updateD(index2, index, e.target.value, null, null, null)} placeholder={y.title}></input>
                                    <input name='subtitle' type="text" onChange={e => updateD(index2, index, null, e.target.value, null, null)} placeholder={y.serie?.episodeTitle}></input>
                                    <input name='season' type="text" onChange={e => updateD(index2, index, null, null, e.target.value, null)} placeholder={y.serie?.season}></input>
                                    <input name='episode' type="text" onChange={e => updateD(index2, index, null, null, null, e.target.value)} placeholder={y.serie?.episode}></input>
                                </span>
                            )
                        }
                    })

                    return (
                        <div className="entry">
                            <label className="container">
                                <input name='enabled' type="checkbox" onChange={e => updateEnabled(index2, e.target.checked)} checked={x[0].enabled}></input>
                                <span className="checkmark"></span>
                            </label>
                            {f}
                            {h}
                            {z}
                        </div>
                    )
                })
            }
            <button onClick={_ => moveFiles()}>Hagrid gogogo ({enabledCount})</button>
        </div>
    );
};