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

  const finalY = (doc as unknown as { lastAutoTable?: { finalY?: number } }).lastAutoTable?.finalY || 90;
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

  const signatureY = finalY + 80;

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

export interface CharacterSheetData {
  name: string;
  archetype: string;
  occupation: string;
  want: string;
  need: string;
  wound: string;
  fear: string;
  virtue: string;
  flaw: string;
  contradiction: string;
  authorName?: string;
  schoolName?: string;
  grade?: string;
}

export const generateCharacterWorksheetPDF = async (char: CharacterSheetData) => {
  const doc = new jsPDF({ format: 'letter', orientation: 'portrait' });
  const pageWidth = doc.internal.pageSize.getWidth();

  const loadImage = (src: string): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      if (!src.startsWith('data:')) {
        img.crossOrigin = 'Anonymous';
      }
      img.onload = () => resolve(img);
      img.onerror = (e) => reject(e);
      img.src = src;
    });
  };

  // Header Background bar
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(0, 0, pageWidth, 38, 'F');

  // Accent gradient line
  doc.setFillColor(244, 63, 94); // rose-500
  doc.rect(0, 38, pageWidth, 3, 'F');

  try {
    const imgLogo = await loadImage(logoEditorial);
    doc.addImage(imgLogo, 'PNG', 12, 4, 28, 28);
  } catch (e) {
    console.warn("Could not load logo", e);
  }

  // Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(255, 255, 255);
  doc.text('FICHA TRIDIMENSIONAL DE PERSONAJE', 45, 18);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(203, 213, 225);
  doc.text('Suite Creatika · Laboratorio de Escritura y Dramaturgia · Editorial Lluvia de Ideas', 45, 26);

  // Student details bar
  doc.setFillColor(241, 245, 249);
  doc.roundedRect(12, 46, pageWidth - 24, 16, 2, 2, 'F');

  doc.setFontSize(9);
  doc.setTextColor(51, 65, 85);
  doc.setFont('helvetica', 'bold');
  doc.text('Estudiante / Creador:', 16, 56);
  doc.setFont('helvetica', 'normal');
  doc.text(char.authorName || '_______________________________', 53, 56);

  doc.setFont('helvetica', 'bold');
  doc.text('Grado / Sección:', 125, 56);
  doc.setFont('helvetica', 'normal');
  doc.text(char.grade || '___________', 153, 56);

  // Left Column: Character details
  const leftColX = 12;
  const leftColWidth = 118;

  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(leftColX, 66, leftColWidth, 195, 3, 3, 'FD');

  doc.setFillColor(244, 63, 94);
  doc.roundedRect(leftColX, 66, leftColWidth, 8, 3, 3, 'F');
  doc.rect(leftColX, 71, leftColWidth, 3, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(255, 255, 255);
  doc.text('DATOS PSICOLÓGICOS Y NARRATIVOS', leftColX + 6, 72);

  let curY = 82;
  const renderField = (label: string, value: string, icon: string = '•') => {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(15, 23, 42);
    doc.text(`${icon} ${label}:`, leftColX + 5, curY);
    curY += 4.5;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(71, 85, 105);
    const lines = doc.splitTextToSize(value || '(Sin especificar)', leftColWidth - 10);
    doc.text(lines, leftColX + 5, curY);
    curY += lines.length * 4.2 + 3.5;
  };

  renderField('Nombre del Personaje', char.name || 'Héroe Anónimo', '🏷️');
  renderField('Arquetipo y Rol', `${char.archetype || 'Arquetipo'} · ${char.occupation || 'Sin rol'}`, '🎭');
  renderField('Deseo Externo (The Want)', char.want || 'Lo que persigue en el mundo ordinario', '🎯');
  renderField('Necesidad Interna (The Need)', char.need || 'La verdad o lección moral que debe aprender', '💎');
  renderField('Herida del Pasado (The Ghost/Wound)', char.wound || 'El dolor o trauma que lo marcó', '🥀');
  renderField('Mayor Miedo (The Fear)', char.fear || 'Aquello a lo que más teme enfrentarse', '⚡');
  renderField('Virtud Luminosa', char.virtue || 'Su mayor fortaleza moral o habilidad', '✨');
  renderField('Defecto Trágico (The Flaw)', char.flaw || 'Su debilidad o punto ciego', '⚠️');
  renderField('Paradoja Central / Contradicción', char.contradiction || 'La paradoja interna que lo hace único y humano', '🔄');

  // Right Column: Drawing Box + Character Arc Notes
  const rightColX = 136;
  const rightColWidth = pageWidth - rightColX - 12;

  // Box 1: Drawing Box
  doc.setFillColor(250, 250, 250);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(rightColX, 66, rightColWidth, 105, 3, 3, 'FD');

  doc.setFillColor(147, 51, 234);
  doc.roundedRect(rightColX, 66, rightColWidth, 8, 3, 3, 'F');
  doc.rect(rightColX, 71, rightColWidth, 3, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(255, 255, 255);
  doc.text('ILUSTRACIÓN DEL PERSONAJE', rightColX + 6, 72);

  doc.setFont('helvetica', 'italic');
  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184);
  doc.text('Dibuja o pega el aspecto visual de tu personaje:', rightColX + 6, 82);

  // Box 2: Teacher notes & reflection
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(rightColX, 176, rightColWidth, 85, 3, 3, 'FD');

  doc.setFillColor(2, 132, 199);
  doc.roundedRect(rightColX, 176, rightColWidth, 8, 3, 3, 'F');
  doc.rect(rightColX, 181, rightColWidth, 3, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(255, 255, 255);
  doc.text('EL ARCO DE TRANSFORMACIÓN', rightColX + 6, 182);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(15, 23, 42);
  doc.text('1. ¿Cómo inicia en el Acto 1?', rightColX + 5, 192);
  doc.line(rightColX + 5, 199, rightColX + rightColWidth - 5, 199);

  doc.text('2. ¿Cuál es su momento de mayor prueba?', rightColX + 5, 210);
  doc.line(rightColX + 5, 217, rightColX + rightColWidth - 5, 217);

  doc.text('3. ¿Cómo se transforma al final?', rightColX + 5, 228);
  doc.line(rightColX + 5, 235, rightColX + rightColWidth - 5, 235);

  doc.setFont('helvetica', 'bold');
  doc.text('Firma del Docente / Sello:', rightColX + 5, 250);
  doc.line(rightColX + 44, 250, rightColX + rightColWidth - 5, 250);

  // Footer
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184);
  doc.text('© 2026 Editorial Lluvia de Ideas · Plataforma Educativa Interactiva · www.lluviadeideas.com', pageWidth / 2, 270, { align: 'center' });

  const fileName = (char.name || 'personaje').toLowerCase().replace(/\s+/g, '_');
  doc.save(`Ficha_Personaje_${fileName}.pdf`);
};

export interface StorySheetData {
  title: string;
  authorName?: string;
  genre?: string;
  character: { name: string; desc: string; emoji?: string };
  environment: { name: string; desc: string; emoji?: string };
  atmosphere: { name: string; desc: string; emoji?: string };
  motivation: { name: string; desc: string; emoji?: string };
  generatedStoryText: string;
}

export const generateStoryWorksheetPDF = async (story: StorySheetData) => {
  const doc = new jsPDF({ format: 'letter', orientation: 'portrait' });
  const pageWidth = doc.internal.pageSize.getWidth();

  const loadImage = (src: string): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      if (!src.startsWith('data:')) {
        img.crossOrigin = 'Anonymous';
      }
      img.onload = () => resolve(img);
      img.onerror = (e) => reject(e);
      img.src = src;
    });
  };

  // Header Background bar
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(0, 0, pageWidth, 38, 'F');

  // Accent gradient line
  doc.setFillColor(168, 85, 247); // purple-500
  doc.rect(0, 38, pageWidth, 3, 'F');

  try {
    const imgLogo = await loadImage(logoEditorial);
    doc.addImage(imgLogo, 'PNG', 12, 4, 28, 28);
  } catch (e) {
    console.warn("Could not load logo", e);
  }

  // Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(255, 255, 255);
  doc.text('MANUSCRITO DE ESCRITURA CREATIVA', 45, 18);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(203, 213, 225);
  doc.text('Máquina de Cuentos · Suite Creatika · Editorial Lluvia de Ideas', 45, 26);

  // Story Title & Author Box
  doc.setFillColor(241, 245, 249);
  doc.roundedRect(12, 46, pageWidth - 24, 20, 2, 2, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text(`Título: «${story.title || 'Historia Sin Título'}»`, 16, 55);

  doc.setFontSize(9);
  doc.setTextColor(71, 85, 105);
  doc.setFont('helvetica', 'bold');
  doc.text('Autor(a):', 16, 62);
  doc.setFont('helvetica', 'normal');
  doc.text(story.authorName || 'Estudiante Creador', 32, 62);

  doc.setFont('helvetica', 'bold');
  doc.text('Género:', 120, 62);
  doc.setFont('helvetica', 'normal');
  doc.text(story.genre || 'Fantasía / Aventura', 135, 62);

  // Slot Elements Matrix (4 columns)
  const elemY = 70;
  const colW = (pageWidth - 24 - 15) / 4;
  const elements = [
    { label: 'PERSONAJE', data: story.character, color: [244, 63, 94] },
    { label: 'ENTORNO', data: story.environment, color: [16, 185, 129] },
    { label: 'ATMÓSFERA', data: story.atmosphere, color: [2, 132, 199] },
    { label: 'MOTIVACIÓN', data: story.motivation, color: [234, 179, 8] }
  ];

  elements.forEach((elem, idx) => {
    const x = 12 + idx * (colW + 5);
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(x, elemY, colW, 36, 2, 2, 'FD');

    doc.setFillColor(elem.color[0], elem.color[1], elem.color[2]);
    doc.rect(x, elemY, colW, 4, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(elem.color[0], elem.color[1], elem.color[2]);
    doc.text(elem.label, x + 3, elemY + 8);

    doc.setFontSize(8);
    doc.setTextColor(15, 23, 42);
    doc.text(elem.data.name || 'Elemento', x + 3, elemY + 14);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(100, 116, 139);
    const descLines = doc.splitTextToSize(elem.data.desc || '', colW - 6);
    doc.text(descLines.slice(0, 4), x + 3, elemY + 19);
  });

  // Story Text Area
  const storyBoxY = 111;
  const storyBoxHeight = 110;
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(12, storyBoxY, pageWidth - 24, storyBoxHeight, 3, 3, 'FD');

  doc.setFillColor(147, 51, 234);
  doc.roundedRect(12, storyBoxY, pageWidth - 24, 7, 3, 3, 'F');
  doc.rect(12, storyBoxY + 4, pageWidth - 24, 3, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(255, 255, 255);
  doc.text('TEXTO DEL CUENTO / MANUSCRITO', 16, storyBoxY + 5.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(30, 41, 59);
  const storyLines = doc.splitTextToSize(story.generatedStoryText || '(Escribe tu relato aquí)', pageWidth - 36);
  doc.text(storyLines.slice(0, 22), 16, storyBoxY + 14);

  // Reflection / Evaluation section
  const reflY = 226;
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(12, reflY, pageWidth - 24, 38, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(15, 23, 42);
  doc.text('💡 Taller de Comprensión y Reflexión en el Aula:', 16, reflY + 8);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  doc.text('1. ¿Cuál es el conflicto principal y cómo se resuelve?', 16, reflY + 15);
  doc.text('2. ¿Qué valores o enseñanzas transmite la decisión del personaje?', 16, reflY + 22);
  doc.text('3. Continúa la historia: ¿Qué sucederá después del final?', 16, reflY + 29);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text('Revisado por:', 130, reflY + 33);
  doc.line(152, reflY + 33, pageWidth - 16, reflY + 33);

  // Footer
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184);
  doc.text('© 2026 Editorial Lluvia de Ideas · Plataforma Educativa Interactiva · www.lluviadeideas.com', pageWidth / 2, 272, { align: 'center' });

  const fileName = (story.title || 'cuento').toLowerCase().replace(/\s+/g, '_');
  doc.save(`Cuento_${fileName}.pdf`);
};

