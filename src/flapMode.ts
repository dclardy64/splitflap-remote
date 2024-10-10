type Mode = 'manual' | 'queue' | 'spotify' | 'scoreboard' | 'config'
let mode: Mode = 'manual';

import { AbortQueue } from "./express/api/queue";
import { AbortSpotify } from "./express/api/spotify";
import { AbortScores } from "./express/api/scores";

import io from './socketio'

const setMode = async (flapMode: Mode) => {
    if (mode === 'queue')
        await AbortQueue()
    else if (mode === 'spotify')
        await AbortSpotify()
    else if (mode === 'scoreboard')
        await AbortScores()
    mode = flapMode
    io.emit('mode', mode)
}
export { mode, setMode }