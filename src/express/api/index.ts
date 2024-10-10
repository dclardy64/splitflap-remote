import { Router } from "express"

import manual from './manual'
import queue from './queue'
import spotify from './spotify'
import scores from './scores'

import { mode, setMode } from "../../flapMode"
import { splitflap } from "../../splitflap"

const router = Router()

// Link all '/api' routes
router.use('/manual', manual)
router.use('/queue', queue)
router.use('/spotify', spotify)
router.use('/scores', scores)

router.get('/', (req, res) => {
    res.send({ mode, flaps: splitflap.GetFlaps() })
})

router.post('/home', async (req, res) => {
    splitflap.ResetFlaps()
    await splitflap.WaitForEndOfMovement()
    res.status(204).send()
})

router.post('/abort', async (req, res) => {
    await setMode('manual')
    res.status(204).send()
})

/*
router.post('/reset', async (req, res) => {
    await splitflap.HardReset()
    res.status(204).send()
})
*/

export default router