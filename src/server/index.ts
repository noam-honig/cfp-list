import express from 'express'
import session from 'cookie-session'
import { api } from './api'
//import helmet from 'helmet'
import compression from 'compression'
import { cfpRepo } from '../shared/cfp'
import fs from 'fs'
import { formatDate } from '../shared/utils'

export const app = express()
app.use(session({ secret: process.env['SESSION_SECRET'] || 'Dev secret' }))

app.use(api)

if (!process.env['VITE']) {
  //app.use(helmet())
  app.use(compression())
  const frontendFiles = process.cwd() + '/dist'
  const index = frontendFiles + '/index.html';
  app.get('/', (req, res) => {
    const cfpId = req.query?.cfp;
    if (cfpId) {
      api.withRemult(req, res, async () => {
        const cfp = await cfpRepo.findId(cfpId! as string);
        if (cfp) {
          res.send(fs.readFileSync(index).toString().replace("<!--TITLE-->", " - " + cfp.conferenceName).replace("<!--META-->",
            `
<meta
name="description"
property="og:description"
content="CFP Deadline: ${formatDate(cfp.cfpDate)}"
/>
<meta
property="og:image"
content="${cfp.image}"
/>
`
          ))

        } else {
          res.sendFile(index)
        }
      })
      return;
    }

    res.sendFile(index)
  })
  app.use(express.static(frontendFiles))
  app.get('/*', (_, res) => {
    res.sendFile(index)

  })
  app.listen(process.env['PORT'] || 3001, () => console.log('Server started'))
}
