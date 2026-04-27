import { createServerFn } from '@tanstack/react-start'
import { type Font } from 'fontkit'
import { createRequire } from 'module'


const require = createRequire(import.meta.url)
const fontkit = require('fontkit')

type FontMetrics = {
  fullName: string
  familyName: string
  subFamilyName: string
  unitsPerEm: number
  ascent: number
  descent: number
  capHeight: number
  xHeight: number
  lineGap: number
}

export const getFontMetrics = createServerFn({ method: 'POST' })
  .inputValidator((data: { fontsBufferList: Uint8Array<ArrayBuffer>[] }) => data)
  .handler(async ({ data }) => {
    const extractedBufferList = data.fontsBufferList.map(b => Buffer.from(b))
    const outputFontsMetrics: FontMetrics[] = extractedBufferList.map(b => {
      const fontMetrics: Font = fontkit.create(b)

      return {
        fullName: fontMetrics.fullName,
        familyName: fontMetrics.familyName,
        subFamilyName: fontMetrics.subfamilyName,
        unitsPerEm: fontMetrics.unitsPerEm,
        ascent: fontMetrics.ascent,
        descent: fontMetrics.descent,
        capHeight: fontMetrics.capHeight,
        xHeight: fontMetrics.xHeight,
        lineGap: fontMetrics.lineGap,
      }
    })

     return outputFontsMetrics
  })
  