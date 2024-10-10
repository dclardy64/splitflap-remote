import { Server as SocketServer } from 'socket.io'
import { splitflap } from './splitflap'
import { mode } from './flapMode'

import type { Server } from 'http'

const io = new SocketServer({ path: "/api/socketio" })

export const InitalizeSocketIO = (server: Server) => {
    io.on('connection', (socket) => {
        socket.emit('mode', mode)
        socket.emit('flaps', splitflap.GetFlaps())
    })
    
    splitflap.on('flaps', ({ flaps }) => io.emit('flaps', flaps))
    splitflap.on('state', (state) => io.emit('state', state))
    splitflap.on('general-state', (state) => io.emit('general-state', state))
    splitflap.on('log', (log) => io.emit('log', log))

    io.attach(server)
}

export default io