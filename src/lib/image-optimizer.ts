/**
 * @fileOverview Utilitaire d'optimisation d'images HD pour StayFloow.
 * Permet de redimensionner et compresser les images côté client avant l'envoi en base.
 */

/**
 * Optimise une image Base64 en la redimensionnant et en la compressant.
 * @param base64 L'image source en format Data URL.
 * @param maxWidth Largeur maximale d'arrivée (800px pour sécurité Firestore).
 * @param quality Qualité de compression JPEG (0.6 pour équilibre poids/visuel).
 * @returns Promise<string> L'image optimisée en Base64.
 */
export async function optimizeImage(base64: string, maxWidth = 800, quality = 0.6): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = base64;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;

      // Calcul du ratio pour le redimensionnement proportionnel
      if (width > maxWidth) {
        height = Math.round((height * maxWidth) / width);
        width = maxWidth;
      }

      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error("Impossible d'obtenir le contexte 2D du canvas"));
        return;
      }

      // Dessiner l'image avec lissage
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, width, height);

      // Exportation en JPEG compressé
      const optimizedBase64 = canvas.toDataURL('image/jpeg', quality);
      resolve(optimizedBase64);
    };
    img.onerror = (err) => reject(err);
  });
}
