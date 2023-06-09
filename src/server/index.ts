import express from 'express'
import session from 'cookie-session'
import { api } from './api'

export const app = express()
app.use(session({ secret: process.env['SESSION_SECRET'] }))
app.use(api)

// [ ] - add postgres with schema support
// [ ] - add env
