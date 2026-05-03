const DEFAULT_PDF_FILE_NAME = 'apresentacao-comercial-beleza-carioca.pdf';
const PRINT_PAGE_SELECTOR = '.bc-commercial-print-page';

type DownloadSlidesPdfOptions = {
  rootElement: HTMLElement;
  fileName?: string;
};

function prepareHiddenHostForCapture(rootElement: HTMLElement) {
  const host = rootElement.closest('.bc-commercial-print-host') as HTMLElement | null;

  if (!host) {
    return () => undefined;
  }

  const previousStyles = {
    opacity: host.style.opacity,
    left: host.style.left,
    top: host.style.top,
    zIndex: host.style.zIndex,
    pointerEvents: host.style.pointerEvents,
  };

  host.style.opacity = '1';
  host.style.left = '-99999px';
  host.style.top = '0';
  host.style.zIndex = '-1';
  host.style.pointerEvents = 'none';

  return () => {
    host.style.opacity = previousStyles.opacity;
    host.style.left = previousStyles.left;
    host.style.top = previousStyles.top;
    host.style.zIndex = previousStyles.zIndex;
    host.style.pointerEvents = previousStyles.pointerEvents;
  };
}

async function waitForFontsAndPaint() {
  if (typeof document !== 'undefined' && 'fonts' in document) {
    await (document as Document & { fonts: FontFaceSet }).fonts.ready;
  }

  await new Promise<void>((resolve) => {
    window.requestAnimationFrame(() => resolve());
  });
}

export async function downloadSlidesPdf({
  rootElement,
  fileName = DEFAULT_PDF_FILE_NAME,
}: DownloadSlidesPdfOptions) {
  const pages = Array.from(
    rootElement.querySelectorAll<HTMLElement>(PRINT_PAGE_SELECTOR),
  );

  if (pages.length === 0) {
    throw new Error('Nenhuma pagina foi encontrada para gerar o PDF.');
  }

  const restoreHost = prepareHiddenHostForCapture(rootElement);

  try {
    await waitForFontsAndPaint();

    const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
      import('html2canvas'),
      import('jspdf'),
    ]);

    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: true,
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const captureScale = Math.max(2, window.devicePixelRatio || 1);

    for (let pageIndex = 0; pageIndex < pages.length; pageIndex += 1) {
      const pageElement = pages[pageIndex];
      const canvas = await html2canvas(pageElement, {
        scale: captureScale,
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false,
      });

      const imageRatio = canvas.width / canvas.height;
      const pageRatio = pdfWidth / pdfHeight;

      let renderWidth = pdfWidth;
      let renderHeight = pdfHeight;

      if (imageRatio > pageRatio) {
        renderHeight = pdfWidth / imageRatio;
      } else {
        renderWidth = pdfHeight * imageRatio;
      }

      const offsetX = (pdfWidth - renderWidth) / 2;
      const offsetY = (pdfHeight - renderHeight) / 2;

      if (pageIndex > 0) {
        pdf.addPage('a4', 'portrait');
      }

      pdf.addImage(
        canvas.toDataURL('image/png'),
        'PNG',
        offsetX,
        offsetY,
        renderWidth,
        renderHeight,
      );
    }

    pdf.save(fileName);
  } finally {
    restoreHost();
  }
}

export async function downloadCommercialPresentationPdf(
  options: DownloadSlidesPdfOptions,
) {
  return downloadSlidesPdf(options);
}
