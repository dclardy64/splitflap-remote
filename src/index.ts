
import http from 'http'


import { CONFIG } from './config'

import app from './express'

import { splitflap, InitalizeSplitflap } from './splitflap'
import { InitalizeSocketIO } from './socketio'

const server = http.createServer(app)

const main = async () => {
  await InitalizeSplitflap()

  splitflap.SetModuleIndexMapping([
    0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 26, 28,
    1, 3, 5, 7, 9, 11, 13, 15, 17, 19, 21, 23, 25, 27, 29,
  ])

  InitalizeSocketIO(server)

  server.listen(CONFIG.server.port, async () => {
    console.log(`Server started on port: ${ CONFIG.server.port }`)
  })
}

main()
