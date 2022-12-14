export type FileMapper = {
    isMovie: boolean,
    isSerie: boolean,
    isMiniSerie: boolean,

    serie: Serie | null,

    year: Number
    title: string
    newTitle: string,

    originalDir: string,
    originalFileName: string,

    duplicate: boolean,
    enabled: boolean
};

export type Serie = {
    episodeTitle: string,
    season: string,
    episode: string
};