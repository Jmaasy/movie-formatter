
type DownloadFormatted = {
    isMovie: boolean,
    isSerie: boolean,
    isMiniSerie: boolean,

    serie: Serie | null,

    year: Number
    title: String
    newTitle: String
};

type Serie = {
    episodeTitle: String,
    season: String,
    episode: String
};

type MiniSerie = {
    episodeTitle: String,
    season: String,
    episode: String
};

type NeedleFinder = {

}

export { DownloadFormatted, Serie, MiniSerie, NeedleFinder };