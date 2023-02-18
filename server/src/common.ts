// Regex constants
export const SERIE_REGEX = RegExp(/[a-zA-Z][0-9][0-9][a-zA-Z][0-9][0-9]/g);
export const SPECIAL_CHARACTERS_REGEX = RegExp(/[^a-zA-Z0-9'-]/g);
export const YEAR_REGEX = RegExp(/[0-9]{4}(?![A-Za-z0-9])/g);
export const RESOLUTION_REGEX = RegExp(/[0-9]{4}p(?![A-Za-z0-9])|[0-9]{4}i(?![A-Za-z0-9])/g);
export const FOUR_NUMBERS_REGEX = RegExp(/[0-9]{4}/g);
export const SEASON_REGEX = RegExp(/s[0-9]{2}|S[0-9]{2}/g);
export const EPISODE_REGEX = RegExp(/e[0-9]{2}./g);
export const MULTI_EPISODE_REGEX = RegExp(/e[0-9]{2}e[0-9]{2}./g);
export const NUMBER_REGEX = RegExp(/[0-9]/g)
export const DUPLICATE_SPACES_REGEX = RegExp(/\s\s+/g);
export const BYTES_PER_MB = 1024 ** 2;

// Folder constants
const DIR = "/Volumes/Kerbol/Plex";
const COMPLETED_DIR = `${DIR}/Downloaded/Completed`;
const MOVIE_DIR = `${DIR}/Movies`;
const MINI_SERIE_DIR = `${DIR}/Mini-Series`;
const SERIE_DIR = `${DIR}/Series`;

export { DIR, COMPLETED_DIR, MOVIE_DIR, MINI_SERIE_DIR, SERIE_DIR };