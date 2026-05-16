import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface EducationItem {
  institution?: string;
  degree?: string;
  year_start?: string | number;
  year_end?: string | number;
}

interface ExperienceItem {
  company?: string;
  position?: string;
  year_start?: string | number;
  year_end?: string | number;
  current?: boolean;
  description?: string;
}

interface CVData {
  full_name?: string;
  email?: string;
  phone?: string;
  location?: string;
  bio?: string;
  skills?: string[];
  availability?: string;
  hourly_rate?: string;
  education?: EducationItem[];
  experience?: ExperienceItem[];
  portfolio_images?: string[];
  avatar_url?: string;
}

async function toBase64(url: string): Promise<string | null> {
  try {
    const res = await fetch(url);
    const blob = await res.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

export async function generateCV(data: CVData) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const pageW = doc.internal.pageSize.getWidth();
  const margin = 16;
  let y = 16;

  // Header color band
  doc.setFillColor(22, 163, 74); // emerald-600
  doc.rect(0, 0, pageW, 40, 'F');

  // Avatar
  if (data.avatar_url) {
    const imgData = await toBase64(data.avatar_url);
    if (imgData) {
      try {
        doc.addImage(imgData, 'JPEG', margin, 8, 24, 24);
      } catch {
        // skip image if fails
      }
    }
  }

  // Name & title
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text(data.full_name || 'Sin nombre', margin + (data.avatar_url ? 30 : 0), 20);

  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  const contactParts: string[] = [];
  if (data.email) contactParts.push(data.email);
  if (data.phone) contactParts.push(data.phone);
  if (data.location) contactParts.push(data.location);
  if (contactParts.length) {
    doc.text(contactParts.join('  ·  '), margin + (data.avatar_url ? 30 : 0), 28);
  }

  y = 48;
  
  // Reset text color to dark for the rest of the document
  doc.setTextColor(30, 30, 30);

  // Bio
  if (data.bio) {
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Perfil', margin, y);
    y += 6;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const bioLines = doc.splitTextToSize(data.bio, pageW - margin * 2);
    doc.text(bioLines, margin, y);
    y += bioLines.length * 4.5 + 4;
  }

  // Skills
  if (data.skills?.length) {
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Habilidades', margin, y);
    y += 6;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const skillsText = data.skills.join('  ·  ');
    const skillLines = doc.splitTextToSize(skillsText, pageW - margin * 2);
    doc.text(skillLines, margin, y);
    y += skillLines.length * 4.5 + 4;
  }

  // Availability / Rate
  if (data.availability || data.hourly_rate) {
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Disponibilidad', margin, y);
    y += 6;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const availParts: string[] = [];
    if (data.availability) availParts.push(`Tipo: ${data.availability}`);
    if (data.hourly_rate) availParts.push(`Tarifa: ${data.hourly_rate}`);
    doc.text(availParts.join('  ·  '), margin, y);
    y += 8;
  }

  // Education table
  if (data.education?.length) {
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Educación', margin, y);
    y += 4;
    autoTable(doc, {
      startY: y,
      margin: { left: margin, right: margin },
      head: [['Institución', 'Título', 'Año inicio', 'Año fin']],
      body: data.education.map(e => [
        e.institution || '-',
        e.degree || '-',
        String(e.year_start || '-'),
        String(e.year_end || '-'),
      ]),
      theme: 'striped',
      headStyles: { fillColor: [22, 163, 74], textColor: 255, fontStyle: 'bold' },
      styles: { fontSize: 9, cellPadding: 2 },
    });
    y = (doc as any).lastAutoTable.finalY + 6;
  }

  // Experience table
  if (data.experience?.length) {
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Experiencia laboral', margin, y);
    y += 4;
    autoTable(doc, {
      startY: y,
      margin: { left: margin, right: margin },
      head: [['Empresa', 'Cargo', 'Periodo', 'Descripción']],
      body: data.experience.map(e => [
        e.company || '-',
        e.position || '-',
        `${e.year_start || ''} – ${e.current ? 'Actual' : (e.year_end || '')}`,
        e.description || '-',
      ]),
      theme: 'striped',
      headStyles: { fillColor: [22, 163, 74], textColor: 255, fontStyle: 'bold' },
      styles: { fontSize: 9, cellPadding: 2 },
      columnStyles: { 3: { cellWidth: 'auto' } },
    });
    y = (doc as any).lastAutoTable.finalY + 6;
  }

  // Portfolio
  if (data.portfolio_images?.length) {
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Portafolio', margin, y);
    y += 6;
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    data.portfolio_images.forEach((url, i) => {
      doc.textWithLink(`${i + 1}. Ver imagen`, margin, y, { url });
      y += 4.5;
    });
    y += 2;
  }

  // Footer
  const pageH = doc.internal.pageSize.getHeight();
  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  doc.text('Generado con LocalWork · Aguachica, Cesar, Colombia', margin, pageH - 8);

  const safeName = (data.full_name || 'cv').replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '_').toLowerCase();
  doc.save(`cv_${safeName}.pdf`);
}
