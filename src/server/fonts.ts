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
  .inputValidator((data: { fontsBufferList: Array<[string, Uint8Array<ArrayBuffer>[]]> }) => data)
  .handler(async ({ data }) => {
    const metricsFromBufferList = data.fontsBufferList.reduce((acc,[subFamily, bufferList]) => {
      const fontMetricsList: FontMetrics[] = bufferList.reduce((acc, buffer) =>{
        const fontMetrics: Font = fontkit.create(buffer)
         
        return [...acc, {
          fullName: fontMetrics.fullName,
          familyName: fontMetrics.familyName,
          subFamilyName: fontMetrics.subfamilyName,
          unitsPerEm: fontMetrics.unitsPerEm,
          ascent: fontMetrics.ascent,
          descent: fontMetrics.descent,
          capHeight: fontMetrics.capHeight,
          xHeight: fontMetrics.xHeight,
          lineGap: fontMetrics.lineGap,
        }] 
      },[] as FontMetrics[])
      
      return {...acc, [subFamily]: fontMetricsList}
    }, {})
    
  

     return metricsFromBufferList
  })
  