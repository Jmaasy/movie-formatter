import { BYTES_PER_MB, COMPLETED_DIR, DUPLICATE_SPACES_REGEX, EPISODE_REGEX, MULTI_EPISODE_REGEX, NUMBER_REGEX, RESOLUTION_REGEX, SPECIAL_CHARACTERS_REGEX, YEAR_REGEX } from "../common";
import { isValidYear } from "./validator";
import * as fs from 'fs';
import { Episode, Movie } from "../downloadFormatted";

class FileDetection {

    detectMovies(folder: string): Movie {
        const files = fs.readdirSync(`${COMPLETED_DIR}/${folder}`)
        const mediaFiles = files.filter(file => file.includes(".mkv") != false || file.includes(".mp4") != false);
        
        if(mediaFiles.length == 0) {
            return { title: "", year: -1, detectionType: "NONE", folder: null } as Movie
        }

        const mediaFilesSize: [number, number][] = mediaFiles.map((file, index) => {
            const stats = fs.statSync(`${COMPLETED_DIR}/${folder}/${file}`);
            return [index, stats.size / BYTES_PER_MB]
        });

        const sortedMediaFileSize = mediaFilesSize.sort((fileSizeA, fileSizeB) => fileSizeA[1] > fileSizeB[1] ? -1 : 1);
        const largestFile = mediaFiles[sortedMediaFileSize[0][0]];

        const titleWithoutSpecialCharacters = largestFile.replace(SPECIAL_CHARACTERS_REGEX, " ")
        const isYearFound = YEAR_REGEX.test(titleWithoutSpecialCharacters);
        const yearMatchList = titleWithoutSpecialCharacters.match(YEAR_REGEX);
        const year = (isYearFound && isValidYear(Number(yearMatchList[0]))) ? Number(yearMatchList[0]) : -1 ;

        const lowerCaseRawTitle = titleWithoutSpecialCharacters.toLowerCase()
        const removedYear = lowerCaseRawTitle.split(year.toString())[0];

        const filteredTitle = removedYear
            .split(RESOLUTION_REGEX)[0]
            .replace(NUMBER_REGEX, '')
            .replace(DUPLICATE_SPACES_REGEX, ' ')
            .trim()
            .split(" ")
            .map(x => x.charAt(0).toUpperCase() + x.slice(1))
            .join(" ");

        return { title: filteredTitle, year: year, detectionType: "FILE", folder: folder } as Movie
    }

    detectEpisodes(seasons: string[], title: string, folder: string): Episode[] {
        if(seasons.length > 1) {
            return seasons.flatMap(season => {
                return this.validateEpisode(season, `${folder}/${season}`);
            });
        }

        return this.validateEpisode(seasons[0], folder);
    }

    validateEpisode(season: string, folder: string) {
        const files = fs.readdirSync(`${COMPLETED_DIR}/${folder}`)
        const mediaFiles = files.filter(file => file.includes(".mkv") != false || file.includes(".mp4") != false);
        const mediaFilesAtLeastOneGb = mediaFiles.filter(file => {
            const stats = fs.statSync(`${COMPLETED_DIR}/${folder}/${file}`);
            const atleastOneGb = (stats.size / BYTES_PER_MB) > 1024
            return atleastOneGb
        })
        
        const mediaFilesContainsEpisode = mediaFilesAtLeastOneGb.filter(file => {
            const matchedEpisode = file.toLowerCase().match(EPISODE_REGEX)
            return matchedEpisode != null
        })

        return mediaFilesContainsEpisode.map(file => {
            const multiEpisodeRegex = file.toLowerCase().match(MULTI_EPISODE_REGEX);
            const episodeRegex = file.toLowerCase().match(EPISODE_REGEX)[0].replace(".", "");

            return {
                number: (multiEpisodeRegex == null) ? episodeRegex: multiEpisodeRegex[0].replace(".", ""),
                season: season,
                file: file,
                folder: folder
            } as Episode
        })
    }
}

export default FileDetection;