import { Socket } from "socket.io";
import { buildResponse, emitToSelf } from "./response";
import * as fs from 'node:fs';
import { DownloadFormatted, MiniSerie, Serie } from "./downloadFormatted";

class MovieFormatter {
    retrieveMovies(socket: Socket) {
        // const dir = '/mnt/nas/plex/downloaded';
        const dir = '/Users/jeffreymaas/Downloads/';
        const formatted: DownloadFormatted[] = [];

        fs.readdir(dir, (_, downloads) => {
            downloads.forEach(download => {
                if(download.includes(".mkv") != false || download.includes(".mp4") != false) {
                    const titleWithoutSpecialCharacters = download.replace(/[^a-zA-Z0-9]/g, " ")
                    const regexYear = titleWithoutSpecialCharacters.match(RegExp("[0-9]{4}"));
                    
                    let year = -1;
                    let season = "";
                    let episode = "";
                    let serie: Serie | null = null;
                    let miniSerie: MiniSerie | null = null;

                    if(regexYear.length > 0) {
                        year = (regexYear.length > 0 && (regexYear[0].charAt(0) == "2" || regexYear[0].charAt(0) == "1" && regexYear[0].charAt(0) == "1" && regexYear[0].charAt(1) == "9" && Number(regexYear[0].charAt(2)) >= 5)) ? Number(regexYear[0]) : -1 ;
                    }

                    const isMovie = titleWithoutSpecialCharacters.match(RegExp("[a-zA-Z][0-9][0-9][a-zA-Z][0-9][0-9]")).length == 0;
                    const isSerie = titleWithoutSpecialCharacters.match(RegExp("[a-zA-Z][0-9][0-9][a-zA-Z][0-9][0-9]")).length > 0;
                    let isMiniSerie = false;

                    if(isSerie) {
                        season = titleWithoutSpecialCharacters.match(RegExp("[a-zA-Z][0-9][0-9][a-zA-Z][0-9][0-9]"))[0].split("e")[0].toLowerCase();
                        episode = "e" + titleWithoutSpecialCharacters.match(RegExp("[a-zA-Z][0-9][0-9][a-zA-Z][0-9][0-9]"))[0].split("e")[1].toLowerCase();

                    }

                    const title = 
                        titleWithoutSpecialCharacters
                            .replace(season, "")
                            .replace(episode, "")
                            .split(regexYear[0])[0]
                            .replace(/\s\s+/g, ' ');

                    formatted.push(
                        {
                            isMovie: isMovie,
                            isSerie: isSerie,
                            isMiniSerie: isMiniSerie,

                            serie: serie,
                            miniSerie: miniSerie,

                            year: year,
                            title: title
                        }
                    )
                }
            });

            formatted.map(x => {
                if(x.isSerie) {
                    const titleParts = x.title
                        .split(" ")
                        .map(part => {
                            const exists = formatted.filter(x => x.title.includes(part));
                            return {
                                existsIn: exists.length - 1,
                                needle: part
                            }
                        });

                        console.log(titleParts);
                }
            })

        });
    }

    renameMovie() {

    }
}

export default MovieFormatter