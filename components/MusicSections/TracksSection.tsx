import { FC, useContext, useEffect, useRef, useState } from "react";
import MusicItem from "../MusicItems/MusicItem/MusicItem";
import TopMusicItem from "../MusicItems/TopMusicItem/TopMusicItem";
import LoadingButton from "../Buttons/LoadingButton/LoadingButton";
import useRankSaver from "../../lib/hooks/useRankSaver";
import { LangContext } from "../../lib/contexts/LangContext";
import { MusicListContext } from "../../lib/contexts/MusicListContext";
import { TrackContent, RankList } from "../../lib/types";
import styles from "./MusicSection.module.scss";
import splitArtists from "../../lib/tools/splitArtists";

interface Props {
    timeLimit: string,
    getData: (url: string) => any,
    tracksRanks: RankList | null
}

const TracksSection: FC<Props> = ({ timeLimit, getData, tracksRanks }) => {
    const { trackList, dispatchTrackList } = useContext(MusicListContext);
    const [ranking, dispatchRanking] = useRankSaver(trackList, "tracks", timeLimit);
    const [buttonLoading, setButtonLoading] = useState(false);
    const firstUpdate = useRef(true);
    const { Stats: lang } = useContext(LangContext);

    useEffect(() => {
        if(firstUpdate.current) {
            firstUpdate.current = false;
            return;
        }

        const getNewTracks = async () => {
            const newTrackList = await getData(`https://api.spotify.com/v1/me/top/tracks?time_range=${timeLimit}&limit=10`);
            dispatchTrackList({ type: "reset", value: newTrackList.items as TrackContent[] });
            dispatchRanking({ type: "changeTime", value: newTrackList.items, contentType: "tracks", timeLimit: timeLimit });
        }

        getNewTracks();
    }, [timeLimit])

    const getMore = async () => {
        setButtonLoading(true);
        const newTrackList = await getData(`https://api.spotify.com/v1/me/top/tracks?time_range=${timeLimit}&limit=10&offset=${trackList.length}`);
        setButtonLoading(false);
        dispatchTrackList({ type: "add", value: newTrackList.items });
        dispatchRanking({ type: "add", value: newTrackList.items, contentType: "tracks", timeLimit: timeLimit });
    }

    return (
        <section className={`${styles.tracksSection} ${styles.musicSection}`}>
            <svg className={styles.wave} width="1600" height="300" viewBox="0 0 1600 300">
                <path d="M289.5 141.008C131.5 162.803 27.6667 264.115 0 300H1600V85.187C1507 40.8289 1354.7 -26.5375 1174 10.9244C998.5 47.3082 996 154.465 743.5 191.347C548.714 219.799 481 114.593 289.5 141.008Z"/>
            </svg>
            <div className={styles.background}/>
            <div className={styles.content}>
                <h2 className={styles.title}>{lang.tracks}</h2>
                <ul className={styles.topMusicContainer}>
                    {trackList.map((track, index) => {
                        if(index < 3) {
                            return (
                                <li key={index}>
                                    <TopMusicItem
                                        key={index}
                                        url={track.external_urls.spotify}
                                        image={track.album.images[0].url}
                                        name={track.name}
                                        rank={index + 1}
                                        oldRanks={tracksRanks}
                                        id={track.id}
                                        artists={splitArtists(track.artists)}
                                    />
                                    { index < 2 ? <hr className={styles.separator}/> : null }
                                </li>
                            )
                        }
                    })}
                </ul>
                <ul className={styles.musicContainer}>
                    {trackList.map((track, index) => {
                        if(index > 2) {
                            return (
                                <li key={index}>
                                    <MusicItem
                                        key={index}
                                        url={track.external_urls.spotify}
                                        image={track.album.images[2].url}
                                        name={track.name}
                                        rank={index + 1}
                                        oldRanks={tracksRanks}
                                        id={track.id}
                                        artists={splitArtists(track.artists)}
                                    />
                                    { index < trackList.length - 1 ? <hr className={styles.separator}/> : null }
                                </li>
                            )
                        }
                    })}
                </ul>
                {trackList.length < 40 ?
                    <LoadingButton className={styles.button} onClick={getMore} loading={buttonLoading}>
                        <svg width="15" height="15" viewBox="0 0 15 15">
                            <path d="M6.89941 8.89954L6.89941 14.8995H8.89941V8.89954H14.8994V6.89954L8.89941 6.89954V0.899536L6.89941 0.899536V6.89954H0.899414L0.899414 8.89954H6.89941Z"/>
                        </svg>
                        <span>{lang.more}</span>
                    </LoadingButton>
                    :
                    null
                }
            </div>
        </section>
    )
}

export default TracksSection;