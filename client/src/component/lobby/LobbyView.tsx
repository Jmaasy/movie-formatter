import React, { useContext, useState } from 'react';
import { SocketContext } from '../../provider/SocketProvider';
import { setupEventHandlers } from './LobbyEventHandler';
import { FileMapper } from './LobbyType';
import './LobbyView.css';

export const LobbyView: React.FC = () => {   
    const [ fileState, setFileState ] = useState<FileMapper[][]>();
    const [ verifyHidden, setVerifyHidden ] = useState<boolean>(true);
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

    const updateType = (inner: number, newValue: string) => {
        if(changedFileState != undefined) {
            const changedFileStateUpdated = changedFileState.map((v, k) => {
                if(k == inner) {
                    return v.map((x, k2) => {
                        x.isMiniSerie = false;
                        x.isSerie = false;
                        x.isMovie = false;

                        if(newValue == "0") x.isMovie = true;
                        if(newValue == "1") x.isSerie = true;
                        if(newValue == "2") x.isMiniSerie = true;
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

    const verifyMoveFiles = () => {
        setVerifyHidden(false);
    }

    const cancelMoveFiles = () => {
        setVerifyHidden(true);
    }

    let enabledCount = 0;

    return (
        <div className="f">
            {
                fileState?.map((x, index2) => {
                
                    const enabled = (changedFileState != null && changedFileState[index2][0].enabled) ? "enabled" : "disabled";
                    const duplicate = (x[0].duplicate) ? "entry-duplicate": "";

                    let yayeet = "0"
                    if(x[0].isSerie) yayeet = "1"
                    if(x[0].isMiniSerie) yayeet = "2"

                    const f = (
                        <span className={'entry-head field-' + enabled}>
                            <select onChange={e => updateType(index2, e.target.value)} value={yayeet}>
                                {(x[0].isMovie) ? (<option value="0" selected>Movie</option>): (<option value="0">Movie</option>)}
                                {(x[0].isSerie) ? (<option value="1" selected>Serie</option>): (<option value="1">Serie</option>)}
                                {(x[0].isMiniSerie) ? (<option value="2" selected>Mini Serie</option>): (<option value="2">Mini Serie</option>)}
                            </select>
                            {
                                (duplicate) ? (
                                    <span>
                                        Duplicate entry detected, It will be deleted when enabled.
                                    </span>
                                ) : ("")
                            }
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
                            <span>Episode Name</span>
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
                                    <input name='season' type="text" onChange={e => updateD(index2, index, null, null, e.target.value, null)} placeholder={y.serie?.season.toUpperCase()}></input>
                                    <input name='episode' type="text" onChange={e => updateD(index2, index, null, null, null, e.target.value)} placeholder={y.serie?.episode.toUpperCase()}></input>
                                </span>
                            )
                        }
                    })

                    return (
                        <div className={"entry " + duplicate}>
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
            <button onClick={_ => verifyMoveFiles()}>Hagrid gogogo ({enabledCount})</button>

            <span className={(verifyHidden) ? "verify-hidden" : "verify"} onClick={_ => cancelMoveFiles()}>
                <div>
                    <button onClick={_ => moveFiles()}>JUST DO IT!</button>
                    <button onClick={_ => cancelMoveFiles()}>Nah</button>
                </div>
            </span>
        </div>
    );
};