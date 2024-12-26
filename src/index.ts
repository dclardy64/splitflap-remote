
import http from 'http'


import { CONFIG } from './config'

import app from './express'

import { splitflap, InitalizeSplitflap } from './splitflap'
import { InitalizeSocketIO } from './socketio'

const server = http.createServer(app)

const main = async () => {
  await InitalizeSplitflap()

  splitflap.SetModuleIndexMapping([
    0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11,
    12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23,
  ])

  InitalizeSocketIO(server)

  server.listen(CONFIG.server.port, async () => {
    console.log(`Server started on port: ${ CONFIG.server.port }`)
  })
}

main()
