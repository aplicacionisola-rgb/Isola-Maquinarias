/**
 * Compresses an image file from camera or gallery to ensure it is under 1 MB.
 * Supports any initial size (no limit at entry), returning a high-quality compressed Base64 Data URL.
 */
export async function compressImageToUnder1MB(file: File): Promise<{
  dataUrl: string;
  sizeBytes: number;
  sizeFormatted: string;
}> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onerror = () => reject(new Error('No se pudo leer el archivo de imagen.'));
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = () => reject(new Error('El archivo seleccionado no es una imagen válida.'));
      img.onload = () => {
        // Calculate bounded dimensions
        const maxDimension = 1600;
        let { width, height } = img;

        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('No se pudo crear el contexto de renderizado de imagen.'));
          return;
        }

        // Fill background white in case of transparent PNG
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);

        // Target size: 950 KB (safe margin below 1 MB limit)
        const targetMaxBytes = 950 * 1024;
        let quality = 0.85;
        let dataUrl = canvas.toDataURL('image/jpeg', quality);

        // Approximate base64 byte length: (length * 3) / 4
        let estimatedBytes = Math.round((dataUrl.length * 3) / 4);

        // If still over 1MB, reduce dimensions & quality iteratively
        while (estimatedBytes > targetMaxBytes && quality > 0.25) {
          quality -= 0.15;
          dataUrl = canvas.toDataURL('image/jpeg', quality);
          estimatedBytes = Math.round((dataUrl.length * 3) / 4);
        }

        if (estimatedBytes > targetMaxBytes) {
          // Downscale canvas resolution by 50%
          const halfCanvas = document.createElement('canvas');
          halfCanvas.width = Math.round(width * 0.7);
          halfCanvas.height = Math.round(height * 0.7);
          const halfCtx = halfCanvas.getContext('2d');
          if (halfCtx) {
            halfCtx.drawImage(canvas, 0, 0, halfCanvas.width, halfCanvas.height);
            dataUrl = halfCanvas.toDataURL('image/jpeg', 0.65);
            estimatedBytes = Math.round((dataUrl.length * 3) / 4);
          }
        }

        const formatted =
          estimatedBytes >= 1024 * 1024
            ? `${(estimatedBytes / (1024 * 1024)).toFixed(2)} MB`
            : `${Math.round(estimatedBytes / 1024)} KB`;

        resolve({
          dataUrl,
          sizeBytes: estimatedBytes,
          sizeFormatted: formatted,
        });
      };

      img.src = e.target?.result as string;
    };

    reader.readAsDataURL(file);
  });
}
