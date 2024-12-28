import { Router } from 'express'
import { z } from 'zod'
import { mode, setMode } from '../../flapMode'
import { Game, GetScores } from '../../lib/Scores'
import { splitflap } from '../../splitflap'
import { CONFIG } from '../../config'

const router = Router()

router.get('/:league', async (req, res) => {
    const league = await leagueSchema.parseAsync(req.params.league)
    const scores = await GetScores(league)
    res.send(scores)
})

router.post('/:league/:event', async (req, res) => {
    const league = await leagueSchema.parseAsync(req.params.league)
    const eventId = await z.coerce.number().parseAsync(req.params.event)
    const games = await GetScores(league)
    const game = games.find((game) => game.id === eventId)

    const scoreMode = await scoreModeSchema.parseAsync(req.query.mode) || 'column'
    if (game === undefined) {
        res.status(400).send({ error: 'Unable to locate event.' })
        return
    }
    await setMode('scoreboard')
    res.status(204).send()
    loop(league, game, scoreMode)
})

export default router

const leagueSchema = z.union([
    z.literal('nhl'),
    z.literal('mlb'),
    z.literal('nfl'),
    z.literal('nba')
])
const scoreModeSchema = z.union([z.literal('column'), z.literal('row')]).optional()

type League = z.infer<typeof leagueSchema>

let timeout: undefined | NodeJS.Timeout
let isActive = false
let abort = false

export const AbortScores = async () => {
    abort = true
    if (timeout !== undefined)
        clearTimeout(timeout)
    return new Promise<void>((resolve, reject) => {
        const interval = setInterval((): void => {
            if (!isActive) {
                clearInterval(interval)
                abort = false
                resolve()
            }
        }, 0)
    })
}

const centerWord = (length: number, word: string): string => word.padStart(word.length + Math.floor((length - word.length) / 2), ' ').padEnd(length, ' ')
// Columns Example
//  '  TOR  @  MTL  '
//  '   0       0   ' 
const createColumns = (game: Game) => (centerWord(5, game.away.short_name) + '  ' + centerWord(5, game.home.short_name) + centerWord(5, game.away.score + '') + '  ' + centerWord(5, game.home.score + '')).toUpperCase()
// Rows Example:
// 'LEAFS        0 '
// 'CANADIENS    0 '
const createRows = (game: Game) => (game.away.medium_name.split(' ').pop()?.slice(0, 9).padEnd(9) + centerWord(3, `${game.away.score}`) + game.home.medium_name.split(' ').pop()?.slice(0, 9).padEnd(9) + centerWord(3, `${game.home.score}`)).toUpperCase()

const loop = async (league: League, { id }: Game, style: 'column' | 'row' = 'row') => {
    isActive = true
    if (abort || mode !== 'scoreboard') {
        isActive = false
        return
    }
    const game = (await GetScores(league)).find((g) => g.id === id)
    if (game === undefined || abort || mode !== 'scoreboard') {
        isActive = false
        return
    }
    splitflap.SetFlaps(style === 'column' ?  createColumns(game) :  createRows(game))
    await splitflap.WaitForEndOfMovement()

    if (abort || mode !== 'scoreboard' || game.status === 'final') {
        isActive = false
        return
    }

    if (game.status === 'pre_game') {
        const diff = ((new Date(game.date)).getTime() - Date.now())
        if (diff > 0) {
            timeout = setTimeout(async () => loop(league, game), diff)
            isActive = false
            return
        }
    }
    isActive = false
    timeout = setTimeout(() => loop(league, game), CONFIG.scoreboard.refresh_interval)
}