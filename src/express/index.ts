
import express from 'express'
import type { ErrorRequestHandler } from "express"

import nocache from 'nocache'

import 'express-async-errors'

import { isDevMode } from '../config'

import api from './api'

const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
  res.status(400).send({ error: err.message })
  next(err)
}

const app = express()

app.set('etag', false)
app.use(express.json())
app.use(nocache())
app.use(errorHandler)
app.use('/api', api)

if (!isDevMode) {
  app.use('/', express.static('web/dist'))
} else {
  console.log('DEV MODE')
}

export default app