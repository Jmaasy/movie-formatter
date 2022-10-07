import { Socket } from "socket.io";
import { buildResponse, emitToSelf } from "./response";
import * as fs from 'node:fs';
import { DownloadFormatted, Serie } from "./downloadFormatted";
import Logger from "./logger";

class MovieFormatter {

    serieRegex = RegExp(/[a-zA-Z][0-9][0-9][a-zA-Z][0-9][0-9]/g);
    specialCharacterRegex = RegExp(/[^a-zA-Z0-9'-]/g);
    yearRegex = RegExp(/[0-9]{4}(?![A-Za-z0-9])/g);
    fourNumbersRegex = RegExp(/[0-9]{4}/g);
    duplicateSpacesRegex = RegExp(/\s\s+/g);

    dir = "/Users/jeffreymaas/nas/Plex/Downloaded/";

    retrieveMovies(socket: Socket) {
        let directories: string[] = [];
        let allFiles: DownloadFormatted[][] = [];

        Logger.INFO("retrieving movies");

        fs.promises.readdir(this.dir).then(res => {
            directories = res.filter(path => {
                const dir = fs.lstatSync(this.dir + path).isDirectory();
                const dirSpecialCharacter = this.specialCharacterRegex.test(path);
                return dir == dirSpecialCharacter;
            });         
        }, err => {
        }).finally(() => {
            directories.forEach((path, index) => {
                let yeet: DownloadFormatted[] = [];
                fs.promises.readdir(this.dir + path).then(files => {

                    files.forEach(file => {
                        if(file.includes(".mkv") != false || file.includes(".mp4") != false) {
                            const titleWithoutSpecialCharacters = file.replace(this.specialCharacterRegex, " ")
                            const yearFound = this.yearRegex.test(titleWithoutSpecialCharacters);
                            const regexYear = titleWithoutSpecialCharacters.match(this.yearRegex);
                            const regexYearOrResolution = titleWithoutSpecialCharacters.match(this.fourNumbersRegex);
    
                            let season = "";
                            let episode = "";
                            let serie: Serie | null = null;
                            let year: Number | null = null;
        
                            if(yearFound) {
                                year = (
                                        regexYear[0].charAt(0) == "2" || 
                                        regexYear[0].charAt(0) == "1" && 
                                        regexYear[0].charAt(0) == "1" && 
                                        regexYear[0].charAt(1) == "9" && 
                                        Number(regexYear[0].charAt(2)) >= 5
                                ) ? Number(regexYear[0]) : -1 ;
                            }
        
                            const isMovie = titleWithoutSpecialCharacters.match(this.serieRegex) == null;
                            const isSerie = titleWithoutSpecialCharacters.match(this.serieRegex) != null;
    
                            let isMiniSerie = false;
        
                            if(isSerie) {
                                season = titleWithoutSpecialCharacters.match(this.serieRegex)[0].toLowerCase().split("e")[0];
                                episode = "e" + titleWithoutSpecialCharacters.match(this.serieRegex)[0].toLowerCase().split("e")[1];

                                serie = {
                                    episodeTitle: "",
                                    season: season,
                                    episode: episode
                                }
                            }
    
                            let title = 
                                titleWithoutSpecialCharacters
                                    .toLowerCase()
                                    .replace(season, "")
                                    .replace(episode, "")
                                    .split(regexYearOrResolution[0])[0]
                                    .replace(this.duplicateSpacesRegex, ' ')
                                    .trim()
                                    .split(" ")
                                    .map(x => x.charAt(0).toUpperCase() + x.slice(1))
                                    .join(" ");
                                title += (year != null) ? " (" + year + ")" : "";

                            yeet.push(
                                {
                                    isMovie: isMovie,
                                    isSerie: isSerie,
                                    isMiniSerie: isMiniSerie,
        
                                    serie: serie,
        
                                    year: year,
                                    title: title,
                                    newTitle: null,
                                    
                                    enabled: true
                                }
                            )
                        }
                    });
                }).finally(() => {
                    const f = yeet.map(x => {
                        if(x.isSerie) {
                            return x.title
                                .split(" ")
                                .map(part => {
                                    const exists = yeet.filter(x => x.title.includes(part));
                                    return {
                                        existsIn: exists.length - 1,
                                        needle: part
                                    }
                                });
                        }
                    });

                    const maxMatch = (yeet[0].isSerie || yeet[0].isMiniSerie) ? Math.max(...f.map(x => x.map(y => y.existsIn)).flat(2)) : -1;
                    let ff = yeet.map(x => {
                        if(x.isSerie) {
                            const yayeet = x.title
                                .split(" ")
                                .map(part => {
                                    const exists = yeet.filter(x => x.title.includes(part));
                                    return {
                                        existsIn: exists.length - 1,
                                        needle: part
                                    }
                                });

                            x.serie.episodeTitle = yayeet.filter(x => x.existsIn != maxMatch).map(x => x.needle).join(" ");   
                            x.newTitle = yayeet.filter(x => x.existsIn == maxMatch).map(x => x.needle).join(" ");                    
                        }

                        return x;
                    });

                    ff = ff.map(x => {
                        if(x.newTitle != null) {
                            x.title = x.newTitle;
                            x.newTitle = null;
                        }
                        return x;
                    })

                    if(ff[0].isSerie && ff.length < 6) {
                        ff.forEach(fff => {
                            fff.isMiniSerie = true;
                            fff.isSerie = false;
                        })
                    }

                    allFiles.push(ff);

                    if(directories.length == allFiles.length) {
                        const resp = buildResponse(allFiles, false, "");
                        Logger.DEBUG("retrieved movies");
                        console.log(resp);
                        emitToSelf(socket, "files-retrieved", resp);
                    }
                });
            })
        });
    }

    renameMovie() {

    }
}

export default MovieFormatter