import express from 'express'
import session from 'cookie-session'
import { api } from './api'
import helmet from 'helmet'
import compression from 'compression'

export const app = express()
app.use(session({ secret: process.env['SESSION_SECRET'] }))

app.use(api)

if (!process.env['VITE']) {
  app.use(helmet())
  app.use(compression())
  const frontendFiles = process.cwd() + '/dist'
  app.use(express.static(frontendFiles))
  app.get('/*', (_, res) => {
    res.sendFile(frontendFiles + '/index.html')
  })
  app.listen(process.env['PORT'] || 3001, () => console.log('Server started'))
}
