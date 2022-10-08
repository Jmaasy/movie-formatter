import { Socket } from "socket.io";
import { buildResponse, emitToSelf } from "./response";
import * as fs from 'fs';
import { DownloadFormatted, Serie } from "./downloadFormatted";
import Logger from "./logger";

class MovieFormatter {

    serieRegex = RegExp(/[a-zA-Z][0-9][0-9][a-zA-Z][0-9][0-9]/g);
    specialCharacterRegex = RegExp(/[^a-zA-Z0-9'-]/g);
    yearRegex = RegExp(/[0-9]{4}(?![A-Za-z0-9])/g);
    fourNumbersRegex = RegExp(/[0-9]{4}/g);
    duplicateSpacesRegex = RegExp(/\s\s+/g);

    preDir = "/mnt/nas"

    dir = this.preDir + "/Plex/Downloaded/";
    dirMovie = this.preDir + "/Plex/Movies/";
    dirMiniSerie = this.preDir + "/Plex/Mini-Series/";
    dirSerie = this.preDir + "/Plex/Series/";
    
    retrieveMovies(socket: Socket) {
        let directories: string[] = [];
        let allFiles: DownloadFormatted[][] = [];

        Logger.INFO("retrieving movies");

        fs.promises.readdir(this.dir).then(res => {
            directories = res.filter(path => {
                const dir = fs.lstatSync(this.dir + path).isDirectory();
                const dirSpecialCharacter = this.specialCharacterRegex.test(path);
                return dir && dirSpecialCharacter;
            });         
        }, err => {
        }).finally(() => {
            Logger.INFO(`found ${directories.length} directories`);

            directories.forEach((path, index) => {
                let yeet: DownloadFormatted[] = [];
                fs.promises.readdir(this.dir + path).then(files => {
                    files.forEach(file => {
                        if(file.includes(".mkv") != false || file.includes(".mp4") != false) {
                            const size = fs.statSync(this.dir + path + "/" + file).size;
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
                                    
                                    originalDir: path,
                                    originalFileName: file,
                                    originalSize: size,
                                    
                                    enabled: fs.statSync(this.dir + path + "/" + file).size == size
                                }
                            )
                        }
                    });        
                }).finally(() => {
                    Logger.INFO(`found ${yeet.length} files`);

                    if(yeet.length > 0) {
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

                    }

                    Logger.INFO(`status: ${directories.length}/${allFiles.length}`);

                    if(directories.length == allFiles.length) {
                        const ffffffff = allFiles.map(d => {
                            return d.filter(x => {
                                const asdf = x.originalFileName.split(".")
                                if(x.isMovie) {
                                    const dirFolder = x.title.split("(")[0].trim();
                                    const formtattedTitle = x.title.split(" ").join("\ ").split("(").join("\(").split(")").join("\)")

                                    const alreadyExists = fs.existsSync(this.dirMovie + dirFolder + "/" + formtattedTitle + "." + asdf[asdf.length - 1])

                                    if(alreadyExists) return false;
                                    return true;
                                } else {
                                    const episodeTitle = (x.serie.episodeTitle == "") ? "" : " " + x.serie.episodeTitle;
                                    const fffff = (x.isSerie) ? this.dirSerie : this.dirMiniSerie ;    
                                    const alreadyExists = fs.existsSync(
                                        fffff + x.title + "/" + x.serie.season.toUpperCase() + "/" + x.title + " - " + x.serie.season.toUpperCase() + x.serie.episode.toUpperCase() + episodeTitle + "." + asdf[asdf.length - 1]
                                    );

                                    if(alreadyExists) return false;
                                    return true;
                                }
    
                            })
                        }).filter(x => x.length != 0)
                        const resp = buildResponse(ffffffff, false, "");
                        Logger.DEBUG(`retrieved ${ffffffff.length} files`);
                        emitToSelf(socket, "files-retrieved", resp);
                    }
                });
            })
        });
    }

    moveFiles(socket: Socket, files: DownloadFormatted[][]) {
        files.forEach(x => {
            x.filter(z => z.enabled)
             .forEach(y => {
                const size = fs.statSync(this.dir + y.originalDir + "/" + y.originalFileName).size;
                if(size != y.originalSize) {
                    Logger.INFO("Size differences, item not moved since it is still being downloaded.");
                } else {
                    let rootDir = this.dirMovie;
                    if(y.isMiniSerie) rootDir = this.dirMiniSerie;
                    if(y.isSerie) rootDir = this.dirSerie;

                    if (!fs.existsSync(rootDir + "/" + y.title)){
                        fs.mkdirSync(rootDir + "/" + y.title);
                    }

                    const extension = y.originalFileName.split(".");
                    const dirrrr = this.dir;

                    if(y.isMiniSerie || y.isSerie) {
                        if (!fs.existsSync(rootDir + "/" + y.title + "/" + y.serie.season.toUpperCase())){
                            fs.mkdirSync(rootDir + "/" + y.title + "/" + y.serie.season.toUpperCase());
                        }

                        const episodeTitle = (y.serie.episodeTitle == "") ? "" : " " + y.serie.episodeTitle;

                        fs.rename(
                            this.dir + y.originalDir + "/" + y.originalFileName, 
                            rootDir + y.title + "/" + y.serie.season.toUpperCase() + "/" + y.title + " - " + y.serie.season.toUpperCase() + y.serie.episode.toUpperCase() + episodeTitle + "." + extension[extension.length - 1], 
                            (err) => {
                                if (err) throw err;
                                fs.readdir(this.dir + y.originalDir, function(_, files) {
                                    if (!files.length || files.filter(x => !x.includes(".mp4") && !x.includes(".mkv")).length == 0) {
                                        fs.rmSync(dirrrr + y.originalDir, { recursive: true, force: true });
                                        this.retrieveMovies(socket);
                                    }
                                });
                            }
                        );
                    } else {
                        const dirFolder = y.title.split("(")[0].trim();
                        if (!fs.existsSync(rootDir + "/" + dirFolder)){
                            fs.mkdirSync(rootDir + "/" + dirFolder);
                        }

                        fs.rename(
                            this.dir + y.originalDir + "/" + y.originalFileName, 
                            rootDir + dirFolder + "/" + y.title + "." + extension[extension.length - 1], 
                            (err) => {
                                if (err) throw err;
                                fs.readdir(dirrrr + y.originalDir, function(_, files) {
                                    if (!files.length || files.filter(x => !x.includes(".mp4") && !x.includes(".mkv")).length == 0) {
                                        fs.rm(dirrrr + y.originalDir, (err) => {
                                            console.log(err);
                                            const resp = buildResponse(null, false, "");
                                            emitToSelf(socket, "files-moved", resp);
                                        });
                                    }
                                });
                            }
                        );
                    }
                }
            })
        })
    }
}

export default MovieFormatter