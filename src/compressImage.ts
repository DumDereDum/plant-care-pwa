const MAX_PX = 1024
const QUALITY = 0.82

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => { URL.revokeObjectURL(url); resolve(img) }
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Failed to load image')) }
    img.src = url
  })
}

function canvasToBlob(canvas: HTMLCanvasElement, type: string, quality: number): Promise<Blob | null> {
  return new Promise((resolve) => canvas.toBlob(resolve, type, quality))
}

/**
 * Detect MIME type from the first bytes of an image buffer.
 * Used when creating a Blob for display (we don't store the type separately).
 */
export function imageMimeType(buf: ArrayBuffer): string {
  const b = new Uint8Array(buf, 0, 12)
  // WebP: RIFF....WEBP
  if (b[0] === 0x52 && b[1] === 0x49 && b[2] === 0x46 && b[3] === 0x46 &&
      b[8] === 0x57 && b[9] === 0x45 && b[10] === 0x42 && b[11] === 0x50) {
    return 'image/webp'
  }
  // JPEG: FF D8 FF
  if (b[0] === 0xFF && b[1] === 0xD8 && b[2] === 0xFF) return 'image/jpeg'
  return 'image/jpeg'
}

/**
 * Resize to MAX_PX on the longest side and encode as WebP (falling back to
 * JPEG on browsers that do not support WebP canvas output, e.g. older Safari).
 * Returns an ArrayBuffer — NOT a Blob — so it survives IndexedDB round-trips
 * on iOS Safari and Android WebView without being silently corrupted.
 */
export async function compressImage(file: File): Promise<ArrayBuffer> {
  const img = await loadImage(file)
  const scale = Math.min(1, MAX_PX / Math.max(img.naturalWidth, img.naturalHeight))
  const canvas = document.createElement('canvas')
  canvas.width = Math.round(img.naturalWidth * scale)
  canvas.height = Math.round(img.naturalHeight * scale)
  canvas.getContext('2d')!.drawImage(img, 0, 0, canvas.width, canvas.height)

  const webp = await canvasToBlob(canvas, 'image/webp', QUALITY)
  const blob = (webp?.type === 'image/webp' ? webp : null)
    ?? await canvasToBlob(canvas, 'image/jpeg', QUALITY)

  if (!blob) throw new Error('Image compression failed')
  return blob.arrayBuffer()
}
