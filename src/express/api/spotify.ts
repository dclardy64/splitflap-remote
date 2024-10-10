
import { Router } from 'express'

import SpotifyWebApi from 'spotify-web-api-node'

import { CONFIG } from '../../config'
import { mode, setMode } from '../../flapMode'

import { splitflap } from '../../splitflap'

const router = Router()

router.get('/', async (req, res) => {
    if (spotifyApi === undefined) {
        res.status(400).send({ error: "Spotify has not been setup. Edit the config.yaml file." })
        return
    }
    setMode('spotify')
    const { code } = req.query
    if (typeof code !== 'string') {
        res.redirect(`https://accounts.spotify.com/en/authorize?client_id=${spotifyApi.getClientId()}&response_type=code&redirect_uri=${spotifyApi.getRedirectURI()}&scope=user-read-private%20user-read-currently-playing`)
        return
    }
    const { body: { access_token, refresh_token, expires_in } } = await spotifyApi.authorizationCodeGrant(code)
    spotifyApi.setAccessToken(access_token)
    spotifyApi.setRefreshToken(refresh_token)
    tokenExpirationEpoch = new Date().getTime() / 1000 + expires_in
    res.redirect('/#/spotify')
    loop()
})

export default router

const spotifyApi = CONFIG.spotify === undefined ? undefined : new SpotifyWebApi({ clientId: CONFIG.spotify.client_id, clientSecret: CONFIG.spotify.client_secret, redirectUri: CONFIG.spotify.redirect_uri })

let tokenExpirationEpoch = 0

let timeout: undefined | NodeJS.Timeout
let isActive = false
let abort = false

export const AbortSpotify = async () => {
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

const loop = async () => {
    isActive = true
    if (abort || mode !== 'spotify') {
        isActive = false
        return
    }
    const secondsLeft = Math.floor(tokenExpirationEpoch - new Date().getTime() / 1000)
    if (secondsLeft * 1000 < CONFIG.spotify!.refresh_interval + 60000) {
        const { body: { expires_in } } = await spotifyApi!.refreshAccessToken()
        tokenExpirationEpoch = new Date().getTime() / 1000 + expires_in
        console.log('REFRESHED SPOTIFY TOKEN')
    }
    if (abort || mode !== 'spotify') {
        isActive = false
        return
    }
    await spotifyApi!.getMyCurrentPlayingTrack().then((data) => {
        const item: any = data.body.item
        if (!item) {
            splitflap.SetFlaps('')
        } else {
            const trackTitle: string = item.name
            const artistName: string = item.artists === undefined ? '' : item.artists[0].name
            const track = trackTitle.split('(')[0].split(' - ')[0].toUpperCase().padEnd(15, ' ').replace(/[^a-zA-Z0-9,.?@!&#$\-'\s]/g, ' ')
            const artist = artistName.split('(')[0].split(' - ')[0].toUpperCase().padStart(15 - (track.length - 15), ' ').replace(/[^a-zA-Z0-9,.?@!&#$\-'\s]/g, ' ')
            splitflap.SetFlaps(track + artist)
        }
    }).catch((err) => {
        console.error('Something went wrong!', err);
    })
    if (abort || mode !== 'spotify') {
        isActive = false
        return
    }
    isActive = false
    timeout = setTimeout(loop, CONFIG.spotify!.refresh_interval)
}