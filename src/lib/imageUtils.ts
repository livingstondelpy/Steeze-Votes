/**
 * Helper utility to resize and compress uploaded images before storing them in state/localStorage.
 * Enforces file size limits and converts images to lightweight JPEG Data URLs.
 */

export interface ImageOptimizationOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  maxFileSizeMB?: number;
}

export function processAndCompressImage(
  file: File,
  options: ImageOptimizationOptions = {}
): Promise<{ success: boolean; dataUrl?: string; error?: string }> {
  const {
    maxWidth = 1200,
    maxHeight = 1200,
    quality = 0.8,
    maxFileSizeMB = 5,
  } = options;

  return new Promise((resolve) => {
    // Check file size
    if (file.size > maxFileSizeMB * 1024 * 1024) {
      resolve({
        success: false,
        error: `File size exceeds ${maxFileSizeMB}MB limit. Please upload a smaller image file.`,
      });
      return;
    }

    // Check image MIME type
    if (!file.type.startsWith('image/')) {
      resolve({
        success: false,
        error: 'Please select a valid image file (JPEG, PNG, WebP).',
      });
      return;
    }

    const reader = new FileReader();
    reader.onerror = () => {
      resolve({ success: false, error: 'Failed to read image file.' });
    };

    reader.onload = (event) => {
      const img = new Image();
      img.onerror = () => {
        resolve({ success: false, error: 'Failed to decode image data.' });
      };

      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Calculate aspect-preserved dimensions
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve({ success: false, error: 'Could not create canvas context for compression.' });
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', quality);

        resolve({
          success: true,
          dataUrl,
        });
      };

      img.src = event.target?.result as string;
    };

    reader.readAsDataURL(file);
  });
}
