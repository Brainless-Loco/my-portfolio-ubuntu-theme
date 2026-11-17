const maxSourceImageBytes = 15 * 1024 * 1024;
const maxEmbeddedImageCharacters = 420_000;

export async function imageFileToDataUrl(file: File): Promise<string> {
  if (!file.type.startsWith('image/') || file.type === 'image/svg+xml') {
    throw new Error('Choose a raster image such as PNG, JPEG, or WebP.');
  }
  if (file.size > maxSourceImageBytes) {
    throw new Error('Choose an image smaller than 15 MB.');
  }

  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    throw new Error('This image could not be decoded by the browser.');
  }

  try {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Image processing is unavailable in this browser.');

    let scale = Math.min(1, 1600 / Math.max(bitmap.width, bitmap.height));
    for (let resizeAttempt = 0; resizeAttempt < 7; resizeAttempt += 1) {
      canvas.width = Math.max(1, Math.round(bitmap.width * scale));
      canvas.height = Math.max(1, Math.round(bitmap.height * scale));
      context.clearRect(0, 0, canvas.width, canvas.height);
      context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);

      for (const quality of [0.86, 0.72, 0.58, 0.45]) {
        const dataUrl = canvas.toDataURL('image/webp', quality);
        if (dataUrl.length <= maxEmbeddedImageCharacters) return dataUrl;
      }
      scale *= 0.75;
    }

    throw new Error('This image is too detailed to embed safely. Choose a smaller image.');
  } finally {
    bitmap.close();
  }
}

export async function imageUrlToDataUrl(url: string): Promise<string> {
  let response: Response;
  try {
    response = await fetch(url, { mode: 'cors' });
  } catch {
    throw new Error('This image host blocks embedding. Download the image and upload the file instead.');
  }
  if (!response.ok) throw new Error(`Image could not be fetched (HTTP ${response.status}).`);

  const blob = await response.blob();
  if (!blob.type.startsWith('image/')) {
    throw new Error('The URL did not return an image.');
  }
  if (blob.size > maxSourceImageBytes) {
    throw new Error('Choose an image smaller than 15 MB.');
  }

  return imageFileToDataUrl(new File([blob], 'embedded-image', { type: blob.type }));
}
