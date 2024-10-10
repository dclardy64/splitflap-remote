import { load } from 'node-yaml-config';

import { z } from 'zod'

const configSchema = z.object({
  server: z.object({
    port: z.number().min(0).max(65535)
  }),
  spotify: z.object({
    client_id: z.string(),
    client_secret: z.string(),
    redirect_uri: z.string(),
    refresh_interval: z.number().min(1000)
  }).optional(),
  scoreboard: z.object({
    refresh_interval: z.number()
  })
})

export const isDevMode = (process.env.NODE_ENV || 'development') === 'development'

export const CONFIG = configSchema.parse(load('./config.yaml'))