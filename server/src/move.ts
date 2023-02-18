import { Socket } from "socket.io";
import { Movie, Serie } from "./downloadFormatted";

class Move {

    execute(socket: Socket, movies: Movie[], series: Serie[]) {
        console.log(movies);

        movies.forEach(movie => {
            console.log(movie)
        })
    }

    removeDirectoryRecursive() {

    }

    // moveFiles(socket: Socket, files: DownloadFormatted[][]) {
    //     files.forEach(x => {
    //         x.filter(z => z.enabled)
    //          .forEach(y => {
    //             let rootDir = this.dirMovie;
    //             if(y.isMiniSerie) rootDir = this.dirMiniSerie;
    //             if(y.isSerie) rootDir = this.dirSerie;

    //             const extension = y.originalFileName.split(".");
    //             const dirrrr = this.dir;

    //             if(y.isMiniSerie || y.isSerie) {

    //                 if(y.duplicate && y.enabled) {
    //                     Logger.INFO("Removing duplicate");

    //                     fs.rm(dirrrr + y.originalDir, { recursive: true, force: true }, (err) => {
    //                         const resp = buildResponse(null, false, "");
    //                         emitToSelf(socket, "files-moved", resp);
    //                     });
    //                 } else {
    //                     Logger.INFO("Moving file(s)");

    //                     if (!fs.existsSync(rootDir + y.title)){
    //                         fs.mkdirSync(rootDir + y.title);
    //                     }

    //                     if (!fs.existsSync(rootDir + y.title + "/" + y.serie.season.toUpperCase())){
    //                         fs.mkdirSync(rootDir + y.title + "/" + y.serie.season.toUpperCase());
    //                     }

    //                     const episodeTitle = (y.serie.episodeTitle == "") ? "" : " " + y.serie.episodeTitle;

    //                     fs.rename(
    //                         this.dir + y.originalDir + "/" + y.originalFileName, 
    //                         rootDir + y.title + "/" + y.serie.season.toUpperCase() + "/" + y.title + " - " + y.serie.season.toUpperCase() + y.serie.episode.toUpperCase() + episodeTitle + "." + extension[extension.length - 1], 
    //                         (err) => {
    //                             if (err) throw err;
    //                             fs.readdir(this.dir + y.originalDir, function(_, files) {
    //                                 if (!files.length || files.filter(x => !x.includes(".mp4") && !x.includes(".mkv")).length == 0) {
    //                                     fs.rm(dirrrr + y.originalDir, { recursive: true, force: true }, (err) => {
    //                                         const resp = buildResponse(null, false, "");
    //                                         emitToSelf(socket, "files-moved", resp);
    //                                     });
    //                                     this.retrieveMovies(socket);
    //                                 }
    //                             });
    //                         }
    //                     );
    //                 }
    //             } else {
    //                 const dirFolder = y.title.split("(")[0].trim();

    //                 if(y.duplicate && y.enabled) {
    //                     Logger.INFO("Removing duplicate");

    //                     fs.rm(dirrrr + y.originalDir, { recursive: true, force: true }, (err) => {
    //                         const resp = buildResponse(null, false, "");
    //                         emitToSelf(socket, "files-moved", resp);
    //                     });
    //                 } else {
    //                     Logger.INFO("Moving file(s)");

    //                     if (!fs.existsSync(rootDir + dirFolder)){
    //                         fs.mkdirSync(rootDir + dirFolder);
    //                     }

    //                     fs.rename           (
    //                         this.dir + y.originalDir + "/" + y.originalFileName, 
    //                         rootDir + dirFolder + "/" + y.title + "." + extension[extension.length - 1], 
    //                         (err) => {
    //                             if (err) throw err;
    //                             fs.readdir(dirrrr + y.originalDir, function(_, files) {
    //                                 if (!files.length || !files.some(yeet => yeet.includes(".mp4") || yeet.includes(".mkv")) || files.length == 0) {
    //                                     fs.rm(dirrrr + y.originalDir, { recursive: true, force: true }, (err) => {
    //                                         const resp = buildResponse(null, false, "");
    //                                         emitToSelf(socket, "files-moved", resp);
    //                                     });
    //                                 }
    //                             });
    //                         }
    //                     );
    //                 }
    //             }
    //         })
    //     })
    // }
}

export default Move;