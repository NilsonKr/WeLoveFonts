import { createServerFn } from '@tanstack/react-start'
import { type Font } from 'fontkit'
import { createRequire } from 'module'

import { computePatchTarget, patchFontMetrics } from '#/lib/normalizeFonts.server'

const require = createRequire(import.meta.url)
const fontkit = require('fontkit')

type FontMetrics =Record<string, any> & {
  fontBuffers:  Uint8Array<ArrayBuffer>[]
          // fullName: fontMetrics.fullName,
          // familyName: fontMetrics.familyName,
          // subFamilyName: fontMetrics.subfamilyName,
          // unitsPerEm: fontMetrics.unitsPerEm,
          // ascent: fontMetrics.ascent,
          // descent: fontMetrics.descent,
          // capHeight: fontMetrics.capHeight,
          // xHeight: fontMetrics.xHeight,
          // lineGap: fontMetrics.lineGap,
}

export const getFontMetrics = createServerFn({ method: 'POST' })
  .inputValidator((data: { fontsBufferList: Array<[string, Uint8Array<ArrayBuffer>[]]> }) => data)
  .handler(async ({ data }) => {
    const buffersWithTargetMetrics: Array<[string, FontMetrics]> = data.fontsBufferList.reduce((acc, [subFamily, bufferList]) => {
      const targetMetrics = computePatchTarget(bufferList, fontkit)
        
      const fontMetrics = {
        ...targetMetrics, 
        fontBuffers: bufferList
      }

      return [...acc, [subFamily, fontMetrics]]
      
    }, [] as Array<[string, FontMetrics]>)
    
    //Output
    const regular = buffersWithTargetMetrics.find(([string,]) =>string === 'Regular') as [string, FontMetrics]
  
    const outputFonts = regular[1].fontBuffers.map(b => {
      const patchedBuffer = patchFontMetrics(b, regular[1].capHeightRatio, fontkit)
      const fontInfo: Font = fontkit.create(patchedBuffer)
      return [fontInfo.fullName, patchedBuffer.toString('base64')]
    })

     return outputFonts
  })
  