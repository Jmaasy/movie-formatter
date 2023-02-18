import { COMPLETED_DIR, DUPLICATE_SPACES_REGEX, NUMBER_REGEX, RESOLUTION_REGEX, SEASON_REGEX, SPECIAL_CHARACTERS_REGEX, YEAR_REGEX } from "../common";
import { isValidYear } from "./validator";
import * as fs from 'fs';
import { DetectedSeasons, DetectedTitle, Movie } from "../downloadFormatted";

class FolderDetection {

    detectMovies(folder: string): Movie {
        const titleWithoutSpecialCharacters = folder.replace(SPECIAL_CHARACTERS_REGEX, " ")
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

        return { title: filteredTitle, year: year, detectionType: "FOLDER", folder: folder } as Movie
    }

    detectSerieTitle(folder: string): DetectedTitle {
        const titleWithoutSpecialCharacters = folder.replace(SPECIAL_CHARACTERS_REGEX, " ")
        const titleWithoutSeason = titleWithoutSpecialCharacters
            .toLowerCase()
            .split(SEASON_REGEX);

        if(titleWithoutSeason.length == 1) {
            const files = fs.readdirSync(`${COMPLETED_DIR}/${folder}/`);
            const directories = files.filter(file => {
                return fs.lstatSync(`${COMPLETED_DIR}/${folder}/${file}`).isDirectory();
            })

            const seasons = directories.filter(x => x.toLowerCase().match(SEASON_REGEX))
            if(seasons != null && seasons.length > 0) {
                return {
                    title: titleWithoutSpecialCharacters.replace(NUMBER_REGEX, ""),
                    folder: folder
                }
            } else {
                return {
                    title: null,
                    folder: folder
                }
            }
        }

        return {
            title: titleWithoutSeason[0],
            folder: folder
        } as DetectedTitle
    }

    detectSeasons(folder: string) {
        const titleWithoutSpecialCharacters = folder.replace(SPECIAL_CHARACTERS_REGEX, " ")
        const season = titleWithoutSpecialCharacters
            .toLowerCase()
            .match(SEASON_REGEX);

        if(season == null) {
            const files = fs.readdirSync(`${COMPLETED_DIR}/${folder}/`);
            const directories = files.filter(file => {
                return fs.lstatSync(`${COMPLETED_DIR}/${folder}/${file}`).isDirectory();
            })

            const seasons = directories.filter(x => x.match(SEASON_REGEX))

            return {
                seasons: seasons,
                folder: folder
            } as DetectedSeasons
        }

        return {
            seasons: season,
            folder: folder
        } as DetectedSeasons
    }
}

export default FolderDetection;