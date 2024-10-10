import axios from 'axios'

interface Team {
    full_name: string
    medium_name: string
    short_name: string
    score: number
}
export interface Game {
    id: number
    status: 'pre_game' | 'half_over' | 'in_progress' | 'final'
    date: string,
    type: string
    home: Team
    away: Team
}

export const GetScores = async (league: 'nhl' | 'mlb' | 'nba' | 'nfl') => {
    const { event_ids } = await axios.get(`http://api.thescore.com/${league}/schedule?utc_offset=-${ new Date().getTimezoneOffset() * 60 }`)
        .then((res) => res.data.current_group)
    return axios.get(`http://api.thescore.com/${league}/events?id.in=${ encodeURIComponent(event_ids) }`).then((res) => {
        const scores: Array<Game> = res.data.map((event: any): Game => {
            return {
                id: event.id,
                status: event.status,
                date: event.game_date,
                type: event.game_type,
                home: {
                    full_name: event.home_team.full_name,
                    medium_name: event.home_team.medium_name,
                    short_name: event.home_team.short_name,
                    score: event.box_score?.score?.home?.score || 0
                },
                away: {
                    full_name: event.away_team.full_name,
                    medium_name: event.away_team.medium_name,
                    short_name: event.away_team.short_name,
                    score: event.box_score?.score?.away?.score || 0
                }
            }
        })
        return scores.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    })
}

export const validateLeague = (league: string) => {
    switch (league) {
        case 'nhl':
        case 'nfl':
        case 'nba':
        case 'mlb':
            return league
        default:
            throw new Error("Invalid league parameter")
    }
}