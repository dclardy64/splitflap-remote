import type { Queue } from "./components/QueueEditor.vue"

const queues: Array<Queue> = [
    {
        name: 'White To Black Loop',
        loop: false,
        queue: [
        {
            flaps: "wwwwwwwwwwwwwwwwwwwwwwwwwwwwww",
            delay: 0,
            await: true
        },
        {
            flaps: " wwwwwwwwwwwwwwwwwwwwwwwwwwwww",
            delay: 50,
            await: false
        },
        {
            flaps: "  wwwwwwwwwwwwwwwwwwwwwwwwwwww",
            delay: 50,
            await: false
        },
        {
            flaps: "   wwwwwwwwwwwwwwwwwwwwwwwwwww",
            delay: 50,
            await: false
        },
        {
            flaps: "    wwwwwwwwwwwwwwwwwwwwwwwwww",
            delay: 50,
            await: false
        },
        {
            flaps: "     wwwwwwwwwwwwwwwwwwwwwwwww",
            delay: 50,
            await: false
        },
        {
            flaps: "      wwwwwwwwwwwwwwwwwwwwwwww",
            delay: 50,
            await: false
        },
        {
            flaps: "       wwwwwwwwwwwwwwwwwwwwwww",
            delay: 50,
            await: false
        },
        {
            flaps: "        wwwwwwwwwwwwwwwwwwwwww",
            delay: 50,
            await: false
        },
        {
            flaps: "         wwwwwwwwwwwwwwwwwwwww",
            delay: 50,
            await: false
        },
        {
            flaps: "          wwwwwwwwwwwwwwwwwwww",
            delay: 50,
            await: false
        },
        {
            flaps: "           wwwwwwwwwwwwwwwwwww",
            delay: 50,
            await: false
        },
        {
            flaps: "            wwwwwwwwwwwwwwwwww",
            delay: 50,
            await: false
        },
        {
            flaps: "             wwwwwwwwwwwwwwwww",
            delay: 50,
            await: false
        },
        {
            flaps: "              wwwwwwwwwwwwwwww",
            delay: 50,
            await: false
        },
        {
            flaps: "               wwwwwwwwwwwwwww",
            delay: 50,
            await: false
        },
        {
            flaps: "               wwwwwwwwwwwwww ",
            delay: 50,
            await: false
        },
        {
            flaps: "               wwwwwwwwwwwww  ",
            delay: 50,
            await: false
        },
        {
            flaps: "               wwwwwwwwwwww   ",
            delay: 50,
            await: false
        },
        {
            flaps: "               wwwwwwwwwww    ",
            delay: 50,
            await: false
        },
        {
            flaps: "               wwwwwwwwww     ",
            delay: 50,
            await: false
        },
        {
            flaps: "               wwwwwwwww      ",
            delay: 50,
            await: false
        },
        {
            flaps: "               wwwwwwww       ",
            delay: 50,
            await: false
        },
        {
            flaps: "               wwwwwww        ",
            delay: 50,
            await: false
        },
        {
            flaps: "               wwwwww         ",
            delay: 50,
            await: false
        },
        {
            flaps: "               wwwww          ",
            delay: 50,
            await: false
        },
        {
            flaps: "               wwww           ",
            delay: 50,
            await: false
        },
        {
            flaps: "               www            ",
            delay: 50,
            await: false
        },
        {
            flaps: "               ww             ",
            delay: 50,
            await: false
        },
        {
            flaps: "               w              ",
            delay: 50,
            await: false
        },
        {
            flaps: "                              ",
            delay: 500,
            await: true
        }
        ]
    }
]

export default queues