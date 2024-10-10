import { Router } from "express"
import { z } from 'zod'
import { splitflap } from "../../splitflap"
import { setMode } from "../../flapMode"

const router = Router()

router.post('/', async (req, res) => {
    await setMode('manual')
    const { flaps } = await requestBody().parseAsync(req.body)
    splitflap.SetFlaps(flaps)
    await splitflap.WaitForEndOfMovement()
    res.status(204).send()
})

export default router

const requestBody = () => z.object({
    flaps: z.string().length(splitflap.GetModuleCount())
})