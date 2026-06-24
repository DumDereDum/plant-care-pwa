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
 * Resize to MAX_PX on the longest side and encode as WebP (falling back to
 * JPEG on browsers that do not support WebP canvas output, e.g. older Safari).
 * The original file is never modified or stored.
 */
export async function compressImage(file: File): Promise<Blob> {
  const img = await loadImage(file)
  const scale = Math.min(1, MAX_PX / Math.max(img.naturalWidth, img.naturalHeight))
  const canvas = document.createElement('canvas')
  canvas.width = Math.round(img.naturalWidth * scale)
  canvas.height = Math.round(img.naturalHeight * scale)
  canvas.getContext('2d')!.drawImage(img, 0, 0, canvas.width, canvas.height)

  const webp = await canvasToBlob(canvas, 'image/webp', QUALITY)
  if (webp?.type === 'image/webp') return webp

  // Safari <17 returns a PNG when asked for WebP — fall back to JPEG
  const jpeg = await canvasToBlob(canvas, 'image/jpeg', QUALITY)
  if (jpeg) return jpeg

  throw new Error('Image compression failed')
}
