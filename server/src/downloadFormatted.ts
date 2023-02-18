type DownloadFormatted = {
    isMovie: boolean,
    isSerie: boolean,
    isMiniSerie: boolean,

    serie: S | null,

    year: Number,
    title: string,
    newTitle: string,

    originalDir: string,
    originalFileName: string,

    duplicate: boolean,
    enabled: boolean
};

type S = {
    episodeTitle: string,
    season: string,
    episode: string
};

type DetectedTitle = {
    title: string,
    folder: string
}

type DetectedSeasons = {
    seasons: string[],
    folder: string
}

type Episode = {
    number: string,
    season: string,
    file: string,
    folder: string
}

type Serie = {
    title: DetectedTitle,
    episodes: Episode[],
    type: string
};

type Movie = {
    title: string,
    year: Number,
    detectionType: string,
    folder: string
}

export { DownloadFormatted, Serie, DetectedTitle, Episode, DetectedSeasons, Movie };