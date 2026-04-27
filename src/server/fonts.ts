import { createServerFn } from '@tanstack/react-start'
import { type Font } from 'fontkit'
import { createRequire } from 'module'


const require = createRequire(import.meta.url)
const fontkit = require('fontkit')

export const getFontMetrics = createServerFn({ method: 'POST' })
  .inputValidator((data: { fontBuffer: number[] }) => data)
  .handler(async ({ data }) => {
    const buffer = Buffer.from(data.fontBuffer)
    const font = fontkit.create(buffer) as Font

     return {
      familyName: font.familyName,
      unitsPerEm: font.unitsPerEm,
      ascent: font.ascent,
      descent: font.descent,
      capHeight: font.capHeight,
      xHeight: font.xHeight,
      lineGap: font.lineGap,
    }
  })
  