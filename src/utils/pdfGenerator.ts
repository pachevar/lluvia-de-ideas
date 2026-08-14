import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import logoEditorial from '../assets/logo editorial.png';
import { CONTACT } from '../constants';

export interface PDFQuoteData {
  id?: string;
  clientCompany?: string;
  clientName?: string;
  clientEmail?: string;
  clientPhone?: string;
  items: { type: string, description: string, quantity: number, unitPrice: number }[];
  subtotal: number;
  validDays: number;
  createdAt: number;
  sealUrl?: string | null;
  signatureUrl?: string | null;
  signerName?: string;
}

export const generateCotizacionPDF = async (quote: PDFQuoteData) => {
  const doc = new jsPDF({ format: 'letter' });
  
  const loadImage = (src: string): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      if (!src.startsWith('data:')) {
        img.crossOrigin = 'Anonymous';
      }
      img.onload = () => resolve(img);
      img.onerror = (e) => reject(e);
      
      // Bypass Firebase Storage CORS issues for jsPDF Canvas
      if (src.includes('firebasestorage.googleapis.com')) {
        img.src = 'https://api.allorigins.win/raw?url=' + encodeURIComponent(src);
      } else {
        img.src = src;
      }
    });
  };

  try {
    const imgLogo = await loadImage(logoEditorial);
    doc.addImage(imgLogo, 'PNG', 14, 10, 35, 35);
  } catch (e) {
    console.warn("Could not load logo image", e);
  }

  doc.setFontSize(24);
  doc.setTextColor(147, 51, 234); // primary color
  doc.setFont('helvetica', 'bold');
  doc.text('COTIZACIÓN', 120, 25);

  doc.setFontSize(12);
  doc.setTextColor(30, 30, 30);
  doc.text('Lluvia de Ideas Editorial S.A.', 120, 32);

  doc.setFontSize(10);
  doc.setTextColor(80, 80, 80);
  doc.setFont('helvetica', 'normal');
  doc.text(`NIT: ${CONTACT.nit}`, 120, 38);
  doc.text(`Tel: ${CONTACT.phoneDisplay}`, 120, 43);
  doc.text(`Correo: ${CONTACT.email}`, 120, 48);
  
  doc.setFont('helvetica', 'bold');
  doc.text('Fecha:', 120, 55);
  doc.setFont('helvetica', 'normal');
  doc.text(new Date(quote.createdAt).toLocaleDateString('es-GT'), 134, 55);

  doc.setDrawColor(220, 220, 220);
  doc.line(14, 62, 200, 62);

  doc.setFontSize(12);
  doc.setTextColor(40, 40, 40);
  doc.setFont('helvetica', 'bold');
  doc.text('Datos del Cliente', 14, 70);

  doc.setFontSize(10);
  doc.setTextColor(60, 60, 60);
  
  doc.setFont('helvetica', 'bold');
  doc.text('Cliente:', 14, 77);
  doc.setFont('helvetica', 'normal');
  doc.text(quote.clientName || '', 30, 77);

  doc.setFont('helvetica', 'bold');
  doc.text('Empresa:', 14, 82);
  doc.setFont('helvetica', 'normal');
  doc.text(quote.clientCompany || '', 32, 82);

  doc.setFont('helvetica', 'bold');
  doc.text('Correo:', 14, 87);
  doc.setFont('helvetica', 'normal');
  doc.text(quote.clientEmail || '', 30, 87);

  doc.setFont('helvetica', 'bold');
  doc.text('Teléfono:', 120, 77);
  doc.setFont('helvetica', 'normal');
  doc.text(quote.clientPhone || '', 138, 77);

  const tableData = quote.items.map(item => [
    item.type === 'producto' ? 'Producto' : 'Servicio',
    item.description,
    item.quantity.toString(),
    `Q${Number(item.unitPrice).toFixed(2)}`,
    `Q${(item.quantity * item.unitPrice).toFixed(2)}`
  ]);

  autoTable(doc, {
    startY: 95,
    head: [['Tipo', 'Descripción', 'Cant.', 'Precio Unit.', 'Subtotal']],
    body: tableData,
    theme: 'striped',
    headStyles: { fillColor: [168, 85, 247] },
    margin: { top: 10 },
  });

  const finalY = (doc as any).lastAutoTable.finalY || 90;
  doc.setFontSize(12);
  doc.setTextColor(30, 30, 30);
  doc.setFont('helvetica', 'bold');
  doc.text('Total General:', 140, finalY + 12);
  doc.setTextColor(147, 51, 234);
  doc.text(`Q${Number(quote.subtotal).toFixed(2)}`, 172, finalY + 12);

  doc.setFontSize(11);
  doc.setTextColor(40, 40, 40);
  doc.setFont('helvetica', 'bold');
  doc.text('Datos para pago / depósito:', 14, finalY + 25);
  
  doc.setFontSize(10);
  doc.setTextColor(80, 80, 80);
  doc.setFont('helvetica', 'normal');
  doc.text('Banco:', 14, finalY + 32);
  doc.setFont('helvetica', 'bold');
  doc.text(CONTACT.bankName, 27, finalY + 32);

  doc.setFont('helvetica', 'normal');
  doc.text('Tipo de Cuenta:', 14, finalY + 37);
  doc.setFont('helvetica', 'bold');
  doc.text(CONTACT.bankAccountType, 42, finalY + 37);

  doc.setFont('helvetica', 'normal');
  doc.text('No. de Cuenta:', 14, finalY + 42);
  doc.setFont('helvetica', 'bold');
  doc.text(CONTACT.bankAccount, 40, finalY + 42);

  doc.setFont('helvetica', 'normal');
  doc.text('A nombre de:', 14, finalY + 47);
  doc.setFont('helvetica', 'bold');
  doc.text(CONTACT.bankAccountHolder, 38, finalY + 47);

  doc.setFont('helvetica', 'italic');
  doc.setFontSize(9);
  doc.setTextColor(100, 100, 100);
  doc.text('Nos regimos al régimen tributario del 5%.', 14, finalY + 57);
  
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(220, 38, 38);
  doc.text(`Cotización válida por ${quote.validDays} días.`, 14, finalY + 62);

  if (quote.id) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(0, 102, 204);
    const onlineUrl = `${CONTACT.siteUrl}/cotizacion/${quote.id}`;
    doc.textWithLink(`Ver versión en línea: ${onlineUrl}`, 14, finalY + 68, { url: onlineUrl });
  }

  let signatureY = finalY + 80;

  if (quote.signatureUrl) {
    try {
      const sigImg = await loadImage(quote.signatureUrl);
      doc.addImage(sigImg, 'PNG', 20, signatureY, 40, 20);
    } catch (e) {
      console.warn("Could not load signature image", e);
    }
    
    if (quote.signerName) {
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(30, 30, 30);
      doc.setFontSize(10);
      doc.text(quote.signerName, 40, signatureY + 25, { align: 'center' });
      doc.setDrawColor(30, 30, 30);
      doc.setLineWidth(0.5);
      doc.line(20, signatureY + 21, 60, signatureY + 21);
    }
  } else if (quote.signerName) {
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(30, 30, 30);
      doc.setFontSize(10);
      doc.text(quote.signerName, 40, signatureY + 25, { align: 'center' });
      doc.setDrawColor(30, 30, 30);
      doc.setLineWidth(0.5);
      doc.line(20, signatureY + 21, 60, signatureY + 21);
  }
  
  if (quote.sealUrl) {
    try {
      const sealImg = await loadImage(quote.sealUrl);
      doc.addImage(sealImg, 'PNG', 140, signatureY, 30, 30);
    } catch (e) {
      console.warn("Could not load seal image", e);
    }
  }

  doc.save(`Cotizacion_LluviaDeIdeas_${new Date(quote.createdAt).getTime()}.pdf`);
};
