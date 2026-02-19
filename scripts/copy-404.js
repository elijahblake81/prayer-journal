import { copyFileSync, existsSync } from 'fs'
import { join } from 'path'

const dist = join(process.cwd(), 'dist')
const index = join(dist, 'index.html')
const fallback = join(dist, '404.html')

if (existsSync(index)) {
  copyFileSync(index, fallback)
  console.log('Copied index.html to 404.html for SPA routing')
}
