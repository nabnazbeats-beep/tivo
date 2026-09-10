import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

export interface ExportOptions {
  filename?: string;
  isTicket?: boolean;
}

/**
 * Exporte un élément DOM sous forme d'image pure (JPEG ou PNG)
 * Seul le document ciblé (facture, reçu ou ticket) est capturé, sans l'interface de l'application.
 */
export async function exportElementAsImage(
  elementId: string,
  filename = 'document-tivo',
  format: 'jpeg' | 'png' = 'jpeg'
): Promise<boolean> {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error(`Élément #${elementId} introuvable pour l'export image`);
    return false;
  }

  try {
    const canvas = await html2canvas(element, {
      scale: 3, // Haute résolution nette pour mobile & impression
      useCORS: true,
      backgroundColor: '#ffffff',
      logging: false,
      windowWidth: element.scrollWidth,
      windowHeight: element.scrollHeight,
    });

    const mimeType = format === 'jpeg' ? 'image/jpeg' : 'image/png';
    const extension = format === 'jpeg' ? 'jpg' : 'png';
    const quality = format === 'jpeg' ? 0.95 : 1.0;

    const dataUrl = canvas.toDataURL(mimeType, quality);
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = `${filename}.${extension}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    return true;
  } catch (error) {
    console.error("Erreur lors de l'export de l'image:", error);
    return false;
  }
}

/**
 * Exporte un élément DOM sous forme de fichier PDF propre et autonome.
 * Seul le document ciblé (reçu, facture ou ticket thermique) est exporté.
 */
export async function exportElementAsPDF(
  elementId: string,
  filename = 'document-tivo',
  isTicket = false
): Promise<boolean> {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error(`Élément #${elementId} introuvable pour l'export PDF`);
    return false;
  }

  try {
    const canvas = await html2canvas(element, {
      scale: 3, // Haute résolution
      useCORS: true,
      backgroundColor: '#ffffff',
      logging: false,
      windowWidth: element.scrollWidth,
      windowHeight: element.scrollHeight,
    });

    const imgData = canvas.toDataURL('image/jpeg', 0.95);
    const imgWidth = canvas.width;
    const imgHeight = canvas.height;

    if (isTicket) {
      // Pour un ticket de caisse thermique (format rouleau 80mm compact)
      const pdfWidth = 80; // 80mm
      const pdfHeight = Math.max(100, (imgHeight * pdfWidth) / imgWidth);

      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: [pdfWidth, pdfHeight],
      });

      pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`${filename}.pdf`);
    } else {
      // Pour une facture ou rapport comptable standard A4
      const pdf = new jsPDF('portrait', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      // Marge de 10mm de chaque côté
      const margin = 10;
      const targetWidth = pageWidth - margin * 2;
      const targetHeight = (imgHeight * targetWidth) / imgWidth;

      // Si le document dépasse une page, on ajuste ou on centre
      if (targetHeight <= pageHeight - margin * 2) {
        // Tient sur une seule page propre
        pdf.addImage(imgData, 'JPEG', margin, margin, targetWidth, targetHeight);
      } else {
        // Document multipage ou ajusté
        const scaleFactor = (pageHeight - margin * 2) / targetHeight;
        const finalWidth = targetWidth * scaleFactor;
        const posX = (pageWidth - finalWidth) / 2;
        pdf.addImage(imgData, 'JPEG', posX, margin, finalWidth, pageHeight - margin * 2);
      }

      pdf.save(`${filename}.pdf`);
    }

    return true;
  } catch (error) {
    console.error("Erreur lors de l'export du PDF:", error);
    return false;
  }
}

/**
 * Lance l'impression isolée du document SEUL.
 * Masque automatiquement tout le reste de l'application (en-tête, onglets, bas de page, boutons).
 */
export function printElementOnly(elementId: string, isTicket = false): void {
  const element = document.getElementById(elementId);
  if (!element) {
    console.warn(`Élément #${elementId} non trouvé, fallback vers window.print() standard`);
    window.print();
    return;
  }

  // Activer la classe d'isolation sur le body et sur l'élément cible
  document.body.classList.add('tivo-printing-isolated');
  element.classList.add('tivo-printable-isolated');
  if (isTicket) {
    element.classList.add('tivo-printable-ticket');
  }

  const cleanup = () => {
    document.body.classList.remove('tivo-printing-isolated');
    element.classList.remove('tivo-printable-isolated');
    element.classList.remove('tivo-printable-ticket');
    window.removeEventListener('afterprint', cleanup);
  };

  window.addEventListener('afterprint', cleanup);

  // Déclencher la boîte d'impression native du navigateur
  setTimeout(() => {
    window.print();
    // Sécurité supplémentaire si afterprint n'est pas déclenché par certains mobiles
    setTimeout(cleanup, 2500);
  }, 100);
}
