// Export README_Tecnico.md to a Word .docx using the 'docx' library
// Usage: node scripts/export-readme-docx.cjs

const fs = require('fs');
const path = require('path');
const { Document, Packer, Paragraph, HeadingLevel, TextRun } = require('docx');

function parseMarkdownToDocxElements(md) {
  const paragraphs = [];
  let inCode = false;
  let codeLines = [];
  const lines = md.split(/\r?\n/);

  const headingMap = [HeadingLevel.TITLE, HeadingLevel.HEADING_1, HeadingLevel.HEADING_2, HeadingLevel.HEADING_3, HeadingLevel.HEADING_4, HeadingLevel.HEADING_5, HeadingLevel.HEADING_6];

  for (let line of lines) {
    // Toggle code block
    if (line.trim().startsWith('```')) {
      if (inCode) {
        const codeText = codeLines.join('\n');
        paragraphs.push(
          new Paragraph({
            children: [
              new TextRun({ text: codeText, font: 'Courier New' })
            ]
          })
        );
        codeLines = [];
        inCode = false;
      } else {
        inCode = true;
      }
      continue;
    }

    if (inCode) {
      codeLines.push(line);
      continue;
    }

    // Headings #..######
    const hMatch = line.match(/^(#{1,6})\s+(.*)$/);
    if (hMatch) {
      const level = Math.min(hMatch[1].length, 6);
      const text = hMatch[2];
      paragraphs.push(new Paragraph({ text, heading: headingMap[level] }));
      continue;
    }

    // Unordered list items - or *
    const liMatch = line.match(/^\s*[-*]\s+(.*)$/);
    if (liMatch) {
      const itemText = liMatch[1];
      paragraphs.push(
        new Paragraph({
          children: [new TextRun({ text: `• ${itemText}` })]
        })
      );
      continue;
    }

    // Blank line
    if (line.trim() === '') {
      paragraphs.push(new Paragraph(''));
      continue;
    }

    // Regular paragraph
    paragraphs.push(new Paragraph(line));
  }

  return paragraphs;
}

async function main() {
  try {
    const readmePath = path.resolve(__dirname, '../README_Tecnico.md');
    const outputPath = path.resolve(__dirname, '../README_Tecnico.docx');
    const md = fs.readFileSync(readmePath, 'utf-8');

    const children = parseMarkdownToDocxElements(md);
    const doc = new Document({ sections: [{ properties: {}, children }] });

    const buffer = await Packer.toBuffer(doc);
    fs.writeFileSync(outputPath, buffer);
    console.log('DOCX generado en:', outputPath);
  } catch (err) {
    console.error('Error generando DOCX:', err);
    process.exit(1);
  }
}

main();