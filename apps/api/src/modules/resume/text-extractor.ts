/**
 * Extracts plain text from an uploaded resume buffer.
 * PDF → pdf-parse, DOCX → mammoth, TXT → utf-8.
 */
export async function extractText(buffer: Buffer, mimeType: string): Promise<string> {
  if (mimeType.includes('pdf')) {
    const pdfParse = (await import('pdf-parse')).default;
    const data = await pdfParse(buffer);
    return normalize(data.text);
  }
  if (mimeType.includes('word') || mimeType.includes('officedocument')) {
    const mammoth = await import('mammoth');
    const { value } = await mammoth.extractRawText({ buffer });
    return normalize(value);
  }
  return normalize(buffer.toString('utf-8'));
}

function normalize(text: string): string {
  return text
    .replace(/\r\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/[ \t]{2,}/g, ' ')
    .trim();
}
