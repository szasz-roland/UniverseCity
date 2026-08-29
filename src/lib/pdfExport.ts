import type { PlacedSubject, Subject } from '@/types/curriculum';
import { colorFor } from '@/lib/colors';
import { DAY_END, DAY_START, DAYS, fmt } from '@/lib/grid';
import { PDF_FONT_BASE64 } from '@/data/pdfFont.generated';

const FONT_NAME = 'Inter';
const MARGIN = 28;
const HEADER_H = 24;
const HOUR_H = 26;
const GUTTER_W = 34;

function hexToRgb(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

/** Builds and downloads a PDF snapshot of the current timetable. Loads jsPDF lazily. */
export async function exportTimetablePdf(
  placed: PlacedSubject[],
  subjects: Subject[],
  conflicts: Set<string>,
): Promise<void> {
  const { jsPDF } = await import('jspdf');

  const hours = DAY_END - DAY_START;
  const dayColW = 150;
  const gridW = GUTTER_W + dayColW * DAYS.length;
  const gridH = HEADER_H + hours * HOUR_H;
  const pageW = gridW + MARGIN * 2;
  const pageH = gridH + MARGIN * 2 + 20;

  const doc = new jsPDF({
    orientation: pageW > pageH ? 'landscape' : 'portrait',
    unit: 'pt',
    format: [pageW, pageH],
  });

  doc.addFileToVFS('Inter-Regular.ttf', PDF_FONT_BASE64);
  doc.addFont('Inter-Regular.ttf', FONT_NAME, 'normal');
  doc.setFont(FONT_NAME, 'normal');

  const gx = MARGIN;
  const gy = MARGIN + 20;

  doc.setFontSize(14);
  doc.setTextColor(43, 43, 51);
  doc.text('Tanrend', MARGIN, MARGIN + 4);

  // Hour gridlines + labels.
  doc.setFontSize(8);
  doc.setDrawColor(226, 223, 214);
  for (let h = 0; h <= hours; h++) {
    const y = gy + HEADER_H + h * HOUR_H;
    doc.setLineWidth(h % 2 === 0 ? 0.75 : 0.4);
    doc.line(gx, y, gx + gridW - MARGIN * 0, y);
    if (h < hours) {
      doc.setTextColor(138, 136, 150);
      doc.text(fmt((DAY_START + h) * 60), gx + GUTTER_W - 6, y + 10, { align: 'right' });
    }
  }

  // Day columns + headers.
  doc.setFontSize(10);
  DAYS.forEach((d, i) => {
    const x = gx + GUTTER_W + i * dayColW;
    doc.setTextColor(43, 43, 51);
    doc.text(d, x + dayColW / 2, gy + 16, { align: 'center' });
    doc.setDrawColor(236, 234, 227);
    doc.setLineWidth(0.5);
    doc.line(x, gy, x, gy + HEADER_H + hours * HOUR_H);
  });
  doc.line(
    gx + GUTTER_W + DAYS.length * dayColW,
    gy,
    gx + GUTTER_W + DAYS.length * dayColW,
    gy + HEADER_H + hours * HOUR_H,
  );

  // Placed blocks.
  placed.forEach((p) => {
    const s = subjects.find((x) => x.id === p.subjectId);
    if (!s) return;
    const c = colorFor(p.subjectId);
    const [br, bg, bb] = hexToRgb(c.bg);
    const [ir, ig, ib] = hexToRgb(c.ink);
    const bad = conflicts.has(p.uid);

    const x = gx + GUTTER_W + p.day * dayColW + 2;
    const y = gy + HEADER_H + ((p.start - DAY_START * 60) / 60) * HOUR_H;
    const w = dayColW - 4;
    const h = (p.dur / 60) * HOUR_H;

    doc.setFillColor(br, bg, bb);
    doc.setDrawColor(bad ? 217 : ir, bad ? 83 : ig, bad ? 79 : ib);
    doc.setLineWidth(bad ? 1.2 : 0.75);
    doc.roundedRect(x, y, w, h, 3, 3, 'FD');

    doc.setTextColor(ir, ig, ib);
    doc.setFontSize(7);
    const nameLines = doc.splitTextToSize(s.name, w - 8);
    doc.text(nameLines, x + 5, y + 11);
    doc.setFontSize(7.5);
    doc.text(`${fmt(p.start)}–${fmt(p.start + p.dur)}`, x + 5, y + h - 5);

    if (bad) {
      doc.setTextColor(184, 50, 46);
      doc.setFontSize(7);
      doc.text('ütközés', x + w - 5, y + h - 5, { align: 'right' });
    }
  });

  doc.save('tanrend.pdf');
}
