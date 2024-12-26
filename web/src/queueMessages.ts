import type { Queue } from "./components/QueueEditor.vue"

const queues: Array<Queue> = [
    {
        name: 'White To Black Loop',
        loop: false,
        queue: [
        {
            flaps: "                        ",
            delay: 0,
            await: true
        },
        {
            flaps: "!!!!!!!!!!!!!!!!!!!!!!!!",
            delay: 500,
            await: true
        }
        ]
    }
]

export default queues
