import { COMPLETED_DIR } from "../common";
import * as fs from 'fs';
import FolderDetection from "./folderDetection";
import FileDetection from "./fileDetection";
import { filterDirectories } from "./validator";
import fetch from "node-fetch";
import { Serie, Movie } from "../downloadFormatted";

class Detection {

    folderDetection = new FolderDetection();
    fileDetection = new FileDetection();

    detectMovies(): Movie[] {
        const folders = fs.readdirSync(COMPLETED_DIR);
        return filterDirectories(folders).map(folderName => {
            const folderBased = this.folderDetection.detectMovies(folderName);
            const fileBased = this.fileDetection.detectMovies(folderName);
            if(folderBased.year == fileBased.year && folderBased.title == fileBased.title && folderBased.year != -1) return folderBased
            else if (fileBased.year == -1 && folderBased.year != -1) return folderBased
            else if (folderBased.year == -1 && fileBased.year != -1) return fileBased
            else return { title: folderBased.title, year: -1, detectionType: "DEFAULT", folder: folderBased.folder } as Movie
        });
    }

    detectSeries() {
        const folders = fs.readdirSync(COMPLETED_DIR);
        return filterDirectories(folders)
            .map(folderName => this.folderDetection.detectSerieTitle(folderName))
            .filter(detectedTitle => detectedTitle.title != null)
            .map(detectedTitle => {
                const detectedSeasons = this.folderDetection.detectSeasons(detectedTitle.folder);        
                const detectedEpisodes = this.fileDetection.detectEpisodes(detectedSeasons.seasons, detectedTitle.title, detectedTitle.folder);

                return {
                    title: detectedTitle,
                    episodes: detectedEpisodes
                };
            }).map(serie => {
                return fetch(`https://v3.sg.media-imdb.com/suggestion/x/${serie.title.title}.json?includeVideos=1`)
                    .then(x=>x.json())
                    .then(x=> {
                        return {
                            title: serie.title,
                            episodes: serie.episodes,
                            type: x.d[0].q
                        } as Serie;
                    })
            });
    }
}

export default Detection;