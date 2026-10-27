import { formatBytes, maxUploadBytes, uploadProblem } from './upload-rules'

const file = (name: string, size = 1000) => new File([new Uint8Array(size)], name)

describe('uploadProblem', () => {
  it('accepts PDF, Word and Excel files', () => {
    for (const name of ['quote.pdf', 'po.DOCX', 'rates.xlsx']) {
      expect(uploadProblem(file(name))).toBeNull()
    }
  })

  it('rejects other file types', () => {
    expect(uploadProblem(file('photo.png'))).toBe("photo.png isn't a PDF, Word or Excel file.")
  })

  it('rejects files over the size limit', () => {
    expect(uploadProblem(file('big.pdf', maxUploadBytes + 1))).toBe('big.pdf is larger than 20 MB.')
  })
})

describe('formatBytes', () => {
  it('uses the largest sensible unit', () => {
    expect(formatBytes(512)).toBe('512 B')
    expect(formatBytes(48_000)).toBe('47 KB')
    expect(formatBytes(1_572_864)).toBe('1.5 MB')
  })
})
