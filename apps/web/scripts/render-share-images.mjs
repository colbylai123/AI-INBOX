// Renders public/og-image.png and the app icons from scripts/share-images.html.
// Run it again after changing the product name, logo or headline:
//   node scripts/render-share-images.mjs
// Needs Playwright's Chromium (npx playwright install chromium).
import path from 'node:path'
import { chromium } from 'playwright'

const here = import.meta.dirname
const pub = path.join(here, '../public')

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1200, height: 630 } })
await page.goto(`file://${path.join(here, 'share-images.html')}`)
await page.evaluate(() => document.fonts.ready)

await page.locator('#og').screenshot({ path: path.join(pub, 'og-image.png') })
const icon = page.locator('#icon')
for (const [name, size] of [
  ['icon-512.png', 512],
  ['icon-192.png', 192],
  ['apple-touch-icon.png', 180],
]) {
  await page.setViewportSize({ width: 1200, height: 630 })
  await icon.evaluate((el, s) => {
    el.style.width = `${s}px`
    el.style.height = `${s}px`
  }, size)
  await icon.screenshot({ path: path.join(pub, name) })
}
await browser.close()
