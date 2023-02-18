import { SPECIAL_CHARACTERS_REGEX } from "../common";
import { COMPLETED_DIR } from "../common";
import * as fs from 'fs';

export const isValidYear = (value: number) => (value > 1800 && value <= new Date().getFullYear());
export const filterDirectories = (folders: string[]) => folders.filter(path => {
    const dir = fs.lstatSync(`${COMPLETED_DIR}/${path}`).isDirectory();
    const dirSpecialCharacter = path.match(SPECIAL_CHARACTERS_REGEX) != null;
    return dir && dirSpecialCharacter;
});