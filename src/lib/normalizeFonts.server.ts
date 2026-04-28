import { type Font as FontKitType } from 'fontkit'
import { Font } from 'fonteditor-core'

export function computePatchTarget(buffers: Uint8Array<ArrayBuffer>[], fontkit: any) {
  const ratios = buffers.map(buf => {
    const font = fontkit.create(buf)
    return font.capHeight / font.unitsPerEm
  })

  const avg = ratios.reduce((a, b) => a + b, 0) / ratios.length

  return { capHeightRatio: Math.round(avg * 1000) / 1000 }
}

export function patchFontMetrics(buffer: Uint8Array<ArrayBuffer>, capHeightRatio: number,  fontkit: any): Buffer {
  // Use fontkit to read the original metrics
  const fk: FontKitType = fontkit.create(buffer)
  const upm = fk.unitsPerEm
  const originalCapHeight = fk.capHeight
  const targetCapHeight = Math.round(capHeightRatio * upm)
  const scale = targetCapHeight / originalCapHeight

  const newAscent = Math.round(fk.ascent * scale)
  const newDescent = Math.round(fk.descent * scale)

  // Use fonteditor-core to write the patched values back
  const charCodeStrings = String.fromCharCode(buffer[0], buffer[1], buffer[2], buffer[3])
  const type = charCodeStrings.startsWith('OTTO') ? 'otf' : 'ttf'

  const arrayBuffer = buffer.buffer.slice(
    buffer.byteOffset,
    buffer.byteOffset + buffer.byteLength
  )

  const font = Font.create(arrayBuffer, {
    type,
    hinting: true,
    compound2simple: false,
  })

  const data = font.get()

  data['OS/2'].sTypoAscender = newAscent
  data['OS/2'].sTypoDescender = newDescent
  data['OS/2'].sTypoLineGap = 0
  data['OS/2'].usWinAscent = newAscent
  data['OS/2'].usWinDescent = Math.abs(newDescent)
  data['OS/2'].sCapHeight = targetCapHeight
  data['OS/2'].sxHeight = Math.round((fk.xHeight / fk.capHeight) * targetCapHeight) // scale xHeight proportionally too

  data.hhea.ascent = newAscent
  data.hhea.descent = newDescent
  data.hhea.lineGap = 0
  
  font.set(data)

  const outputBuffer = font.write({
    type: 'ttf',
    hinting: true,
  })


  return Buffer.from(outputBuffer as ArrayBuffer)
}