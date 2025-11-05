const fs = require('fs')
const path = require('path')
let pdfParse = require('pdf-parse')
if (typeof pdfParse !== 'function' && pdfParse && pdfParse.default) {
  pdfParse = pdfParse.default
}

async function main() {
  const pdfPathArg = process.argv[2]
  const pdfPath = pdfPathArg || path.resolve('2.1. Rúbrica parcial_Idat_Desarrollo de interfaces 2_17022025 (1).pdf')
  const outPath = path.resolve('rubrica.txt')

  if (!fs.existsSync(pdfPath)) {
    console.error(`[ERROR] No se encontró el PDF en: ${pdfPath}`)
    process.exit(1)
  }

  try {
    const dataBuffer = fs.readFileSync(pdfPath)
    let text = ''
    let pages = 0
    if (typeof pdfParse === 'function') {
      const data = await pdfParse(dataBuffer)
      text = data.text
      pages = data.numpages || 0
    } else if (pdfParse && pdfParse.PDFParse) {
      const Parser = pdfParse.PDFParse
      const parser = new Parser({ verbosity: pdfParse.VerbosityLevel?.ERRORS || 0 })
      const data = await parser.parse(dataBuffer)
      text = data.text || ''
      pages = data.numpages || 0
    } else {
      throw new Error('Paquete pdf-parse no compatible en este entorno')
    }

    text = text.replace(/\r\n/g, '\n').replace(/\u0000/g, '')
    fs.writeFileSync(outPath, text, 'utf8')
    console.log(`[OK] Texto extraído a: ${outPath}`)
    console.log(`Páginas: ${pages}`)
  } catch (err) {
    console.error('[ERROR] Falló la extracción del PDF:', err.message)
    process.exit(1)
  }
}

main()