import { toPng } from 'html-to-image';
import { jsPDF } from 'jspdf';

export const generatePDFDoc = async (element: HTMLElement): Promise<jsPDF> => {
  // Create an off-screen container formatted at standard A4 pixel width (794px)
  const container = document.createElement('div');
  container.style.position = 'absolute';
  container.style.left = '-9999px';
  container.style.top = '0';
  container.style.width = '794px';
  container.style.backgroundColor = '#ffffff';
  container.style.color = '#0f172a';
  container.style.zIndex = '-9999';

  const clone = element.cloneNode(true) as HTMLElement;

  // Unconstrain scroll height & max dimensions on the clone
  clone.style.maxHeight = 'none';
  clone.style.height = 'auto';
  clone.style.overflow = 'visible';
  clone.style.width = '100%';
  clone.style.padding = '32px';
  clone.style.backgroundColor = '#ffffff';
  clone.style.color = '#0f172a';

  // Remove non-printable action UI from clone
  const noPrints = clone.querySelectorAll('.no-print, .no-print-bg');
  noPrints.forEach((el) => el.remove());

  container.appendChild(clone);
  document.body.appendChild(container);

  try {
    // Generate high-resolution PNG using browser's native DOM layout engine
    const imgData = await toPng(clone, {
      quality: 0.95,
      pixelRatio: 2,
      backgroundColor: '#ffffff',
      cacheBust: true,
      skipFonts: false
    });

    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    // Create an Image instance to obtain original dimensions
    const img = new Image();
    img.src = imgData;
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = (e) => reject(e);
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (img.height * pdfWidth) / img.width;
    const pageHeight = pdf.internal.pageSize.getHeight();

    if (pdfHeight <= pageHeight) {
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    } else {
      let position = 0;
      let heightLeft = pdfHeight;

      pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);
      heightLeft -= pageHeight;

      while (heightLeft > 0) {
        position -= pageHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);
        heightLeft -= pageHeight;
      }
    }

    return pdf;
  } finally {
    if (document.body.contains(container)) {
      document.body.removeChild(container);
    }
  }
};

export const generatePDFBlob = async (element: HTMLElement): Promise<Blob> => {
  const pdf = await generatePDFDoc(element);
  return pdf.output('blob');
};

export const downloadPDF = async (element: HTMLElement, fileName: string) => {
  const pdf = await generatePDFDoc(element);
  pdf.save(fileName);
};
