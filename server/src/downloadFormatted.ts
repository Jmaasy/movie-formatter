type DownloadFormatted = {
    isMovie: boolean,
    isSerie: boolean,
    isMiniSerie: boolean,

    serie: Serie | null,

    year: Number,
    title: String,
    newTitle: String,

    enabled: boolean
};

type Serie = {
    episodeTitle: String,
    season: String,
    episode: String
};

export { DownloadFormatted, Serie };