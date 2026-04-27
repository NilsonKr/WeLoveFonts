import { useEffect, useRef, useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'

import { getFontMetrics } from '@server/fonts'

export const Route = createFileRoute('/')({ component: App })

function App() {
  const fontInput = useRef<HTMLInputElement>(null)
  const [fonts, setFonts] = useState<string[]>([])

  useEffect(() => {
    if (fontInput.current) {
      fontInput.current.setAttribute("webkitdirectory", "");
      fontInput.current.setAttribute("directory", "");
    }
  }, [])

  const fontFaceCss = (file: File) => {
    const fontName = file.name.replace(/\.[^/.]+$/, "").split('-')[0]; // remove extension
    const fontUrl = URL.createObjectURL(file);

    return `
        @font-face {
          font-family: '${fontName}';
          src: url('${fontUrl}');
        }
      `
  }

  const handleFontMetrics = async (fontFiles: File[], fontNames: string[]) => {

    const getFontFile = (fontName: string) => {
      return fontFiles.find(f => f.name === fontName) as File
    }

    const fontsList: File[] = fontFiles.reduce((list: File[], file) => fontNames.includes(file.name) ? [...list, getFontFile(file.name)] : [...list], [])

    const promiseBufferList = fontsList.map(async fontFile => new Uint8Array(await (fontFile as File).arrayBuffer()))
    const fontsBufferList = await Promise.all(promiseBufferList)

    const fontMetrics = await getFontMetrics({ data: { fontsBufferList: fontsBufferList } })

    console.log(fontMetrics)

  }

  const handleFontInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return

    const fontFiles = Array.from(e.target.files)

    // const fontRegex = /\.(ttf|otf|woff|woff2|eot)$/i
    const fontRegex = /\.ttf$/i

    const regularFonts = fontFiles.filter((file) => fontRegex.test(file.name)).filter(file => file.name.includes('Regular'))
    const fontNames = regularFonts.map(file => file.name)


    await handleFontMetrics(fontFiles, fontNames)

    // Append font-familys to html
    const style = document.createElement("style");
    style.innerHTML = `
      ${regularFonts.map(file => fontFaceCss(file)).join('\n')}
    `;
    document.head.appendChild(style);

    setFonts(fontNames)
  }

  return (
    <main className="page-wrap px-4 pb-8 pt-14">
      <section className="island-shell rise-in relative overflow-hidden rounded-[2rem] px-6 py-10 sm:px-10 sm:py-14">
        <div className="pointer-events-none absolute -left-20 -top-24 h-56 w-56 rounded-full bg-[radial-gradient(circle,rgba(79,184,178,0.32),transparent_66%)]" />
        <div className="pointer-events-none absolute -bottom-20 -right-20 h-56 w-56 rounded-full bg-[radial-gradient(circle,rgba(47,106,74,0.18),transparent_66%)]" />
        <p className="island-kicker mb-3">TanStack Start Base Template</p>
        <h1 className="display-title mb-5 max-w-3xl text-4xl leading-[1.02] font-bold tracking-tight text-[var(--sea-ink)] sm:text-6xl">
          Start simple, ship quickly.
        </h1>
        <p className="mb-8 max-w-2xl text-base text-[var(--sea-ink-soft)] sm:text-lg">
          This base starter intentionally keeps things light: two routes, clean
          structure, and the essentials you need to build from scratch.
        </p>
        <div className="flex flex-wrap gap-3">
          <a
            href="/about"
            className="rounded-full border border-[rgba(50,143,151,0.3)] bg-[rgba(79,184,178,0.14)] px-5 py-2.5 text-sm font-semibold text-[var(--lagoon-deep)] no-underline transition hover:-translate-y-0.5 hover:bg-[rgba(79,184,178,0.24)]"
          >
            About This Starter
          </a>


          <input
            ref={fontInput}
            type="file" id="fileInput" hidden
            onChange={handleFontInputChange}
          />
          <label
            htmlFor="fileInput" id="customButton"
            className="rounded-full border border-[rgba(23,58,64,0.2)] bg-white/50 px-5 py-2.5 text-sm font-semibold text-[var(--sea-ink)] no-underline transition hover:-translate-y-0.5 hover:border-[rgba(23,58,64,0.35)] cursor-pointer"
          >
            Select your files
          </label>

        </div>
      </section>

      <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {fonts.map((title, index) => (
          <article
            key={title}
            className="island-shell feature-card rise-in rounded-2xl p-5"
            style={{ animationDelay: `${index * 90 + 80}ms`, fontFamily: title.split('-')[0] }}
          >
            <h2 className="mb-2 text-base font-semibold text-[var(--sea-ink)]">
              {title}
            </h2>
            <p className="m-0 text-sm text-[var(--sea-ink-soft)]" style={{ lineHeight: 'initial' }}>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
            </p>
          </article>
        ))}
      </section>
    </main>
  )
}
