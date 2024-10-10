import { Router } from "express"
import { z } from 'zod'
import { splitflap } from "../../splitflap"
import { setMode, mode } from "../../flapMode"

const router = Router()

router.post('/', async (req, res) => {
    await setMode('queue')
    splitflapQueue = await parseRequestBody(req.body)
    loop()
    res.status(204).send()
})

export default router

type Queue = {
    loop: boolean,
    queue: Array<{
        flaps: string,
        delay: number,
        await: boolean
    }>
}

let splitflapQueue: Queue

const parseRequestBody = async (body: unknown): Promise<Queue> => z.object({
    loop: z.boolean(),
    queue: z.array(z.object({
        flaps: z.string().length(splitflap.GetModuleCount()),
        delay: z.coerce.number().default(1000),
        await: z.boolean().default(true)
    }))
}).parseAsync(body)

let timeout: undefined | NodeJS.Timeout
let isActive = false
let abort = false

export const AbortQueue = async () => {
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

const loop = async (index: number = 0) => {
    isActive = true
    if (splitflapQueue.queue.length < 1 || abort || mode !== 'queue') {
        isActive = false
        return
    }
    splitflap.SetFlaps(splitflapQueue.queue[index].flaps)
    if (splitflapQueue.queue[index].await)
        await splitflap.WaitForEndOfMovement()
    if (abort || mode !== 'queue') {
        isActive = false
        return
    }
    const delay = splitflapQueue.queue[index].delay
    if (index + 1 === splitflapQueue.queue.length) {
        index = 0
        if (!splitflapQueue.loop) {
            isActive = false
            timeout = setTimeout(async () => await setMode('manual'), delay)
            return
        }
    } else {
        index++
    }
    isActive = false
    timeout = setTimeout(() => loop(index), delay)
}