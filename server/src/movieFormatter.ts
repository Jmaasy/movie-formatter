import { Socket } from "socket.io";
import { buildResponse, emitToSelf } from "./response";
import * as fs from 'fs';
import { DownloadFormatted, Movie, Serie } from "./downloadFormatted";
import Logger from "./logger";
import Detection from "./detection/detection";
import Move from "./move";

class MovieFormatter {

    serieRegex = RegExp(/[a-zA-Z][0-9][0-9][a-zA-Z][0-9][0-9]/g);
    specialCharacterRegex = RegExp(/[^a-zA-Z0-9'-]/g);
    yearRegex = RegExp(/[0-9]{4}(?![A-Za-z0-9])/g);
    fourNumbersRegex = RegExp(/[0-9]{4}/g);
    duplicateSpacesRegex = RegExp(/\s\s+/g);

    // preDir = "/mnt/nas"
    preDir = "/Volumes/Kerbol"

    dir = this.preDir + "/Plex/Downloaded/Completed/";
    dirMovie = this.preDir + "/Plex/Movies/";
    dirMiniSerie = this.preDir + "/Plex/Mini-Series/";
    dirSerie = this.preDir + "/Plex/Series/";
    
    detection = new Detection();
    move = new Move();

    retrieveMovies(socket: Socket) {
        Promise.all(this.detection.detectSeries()).then(seriesFound => {
            const seriesFoundMapped = seriesFound.map(x => {
                return x.episodes.map(episode => {
                    let serie = true;
                    let miniserie = false;
                    
                    if(x.type == "TV mini-series") {
                        serie = false;
                        miniserie = true;
                    }
    
                    return {
                        isMovie: false,
                        isSerie: serie,
                        isMiniSerie: miniserie,
        
                        serie: {
                            episodeTitle: "",
                            episode: episode.number,
                            season: episode.season
                        },
    
                        year: 0,
                        title: x.title.title,
                        newTitle: x.title.title,
    
                        originalDir: episode.folder,
                        originalFileName: episode.file,
    
                        duplicate: false,
                        enabled: true
                    } as DownloadFormatted  
                })
            })

            const moviesFound = this.detection.detectMovies()
                .filter(x => {
                    return seriesFoundMapped.filter(xx => {
                        return xx.filter(xxx => {
                            return xxx.originalDir.includes(x.folder) || xxx.originalFileName.includes(x.folder);
                        }).length > 0
                    }).length == 0;
                })
                .map(x => {
                    const formatted = x.title
                        .toLowerCase().split(' ')
                        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                        .join(' ');
                    const alreadyExists = fs.existsSync(this.dirMovie + formatted);

                    return [{
                        isMovie: true,
                        isSerie: false,
                        isMiniSerie: false,
        
                        serie: null,
        
                        year: Number(x.year),
                        title: x.title,
                        newTitle: x.title,
                        
                        originalDir: x.folder,
                        originalFileName: x.folder,
        
                        duplicate: alreadyExists,
                        enabled: !alreadyExists
                    } as DownloadFormatted]
                });

            const detectedEntities = seriesFoundMapped.concat(moviesFound);
            const resp = buildResponse(detectedEntities, false, "");
            
            Logger.DEBUG(`detected ${detectedEntities.length} entities`);
            emitToSelf(socket, "files-retrieved", resp);
        });
    }

    moveFiles(socket: Socket, files: DownloadFormatted[][]) {
        console.log(files);

        const movies = files.filter(x => {
            return x.filter(xx => xx.isMovie)
        }).flat().map(x => {
            return {
                title: x.title,
                year: x.year,
                detectionType: "",
                folder: x.originalDir + "/" + x.originalFileName
            } as Movie
        })

        this.move.execute(socket, movies, []);

        // files.forEach(x => {
        //     x.filter(z => z.enabled)
        //      .forEach(y => {
        //         let rootDir = this.dirMovie;
        //         if(y.isMiniSerie) rootDir = this.dirMiniSerie;
        //         if(y.isSerie) rootDir = this.dirSerie;

        //         const extension = y.originalFileName.split(".");
        //         const dirrrr = this.dir;

        //         if(y.isMiniSerie || y.isSerie) {

        //             if(y.duplicate && y.enabled) {
        //                 Logger.INFO("Removing duplicate");

        //                 fs.rm(dirrrr + y.originalDir, { recursive: true, force: true }, (err) => {
        //                     const resp = buildResponse(null, false, "");
        //                     emitToSelf(socket, "files-moved", resp);
        //                 });
        //             } else {
        //                 Logger.INFO("Moving file(s)");

        //                 if (!fs.existsSync(rootDir + y.title)){
        //                     fs.mkdirSync(rootDir + y.title);
        //                 }

        //                 if (!fs.existsSync(rootDir + y.title + "/" + y.serie.season.toUpperCase())){
        //                     fs.mkdirSync(rootDir + y.title + "/" + y.serie.season.toUpperCase());
        //                 }

        //                 const episodeTitle = (y.serie.episodeTitle == "") ? "" : " " + y.serie.episodeTitle;

        //                 fs.rename(
        //                     this.dir + y.originalDir + "/" + y.originalFileName, 
        //                     rootDir + y.title + "/" + y.serie.season.toUpperCase() + "/" + y.title + " - " + y.serie.season.toUpperCase() + y.serie.episode.toUpperCase() + episodeTitle + "." + extension[extension.length - 1], 
        //                     (err) => {
        //                         if (err) throw err;
        //                         fs.readdir(this.dir + y.originalDir, function(_, files) {
        //                             if (!files.length || files.filter(x => !x.includes(".mp4") && !x.includes(".mkv")).length == 0) {
        //                                 fs.rm(dirrrr + y.originalDir, { recursive: true, force: true }, (err) => {
        //                                     const resp = buildResponse(null, false, "");
        //                                     emitToSelf(socket, "files-moved", resp);
        //                                 });
        //                                 this.retrieveMovies(socket);
        //                             }
        //                         });
        //                     }
        //                 );
        //             }
        //         } else {
        //             const dirFolder = y.title.split("(")[0].trim();

        //             if(y.duplicate && y.enabled) {
        //                 Logger.INFO("Removing duplicate");

        //                 fs.rm(dirrrr + y.originalDir, { recursive: true, force: true }, (err) => {
        //                     const resp = buildResponse(null, false, "");
        //                     emitToSelf(socket, "files-moved", resp);
        //                 });
        //             } else {
        //                 Logger.INFO("Moving file(s)");

        //                 if (!fs.existsSync(rootDir + dirFolder)){
        //                     fs.mkdirSync(rootDir + dirFolder);
        //                 }

        //                 fs.rename           (
        //                     this.dir + y.originalDir + "/" + y.originalFileName, 
        //                     rootDir + dirFolder + "/" + y.title + "." + extension[extension.length - 1], 
        //                     (err) => {
        //                         if (err) throw err;
        //                         fs.readdir(dirrrr + y.originalDir, function(_, files) {
        //                             if (!files.length || !files.some(yeet => yeet.includes(".mp4") || yeet.includes(".mkv")) || files.length == 0) {
        //                                 fs.rm(dirrrr + y.originalDir, { recursive: true, force: true }, (err) => {
        //                                     const resp = buildResponse(null, false, "");
        //                                     emitToSelf(socket, "files-moved", resp);
        //                                 });
        //                             }
        //                         });
        //                     }
        //                 );
        //             }
        //         }
        //     })
        // })
    }
}

export default MovieFormatter