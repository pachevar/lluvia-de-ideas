import { useMemo, useState } from 'react';
import QRCode from 'qrcode';
import {
  CHALLENGE_ASTROS, SUN_CARD_CM, SUN_DIAMETER_KM, formatMeters, getScaleDiameterMm, getScaleDistances,
  type ChallengeAstro
} from '../../data/solarScaleChallenge';

type CardAstro = { id: string; name: string; icon: string; color: string; subtitle: string; footer: string };

const SUN_CARD: CardAstro = {
  id: 'sol', name: 'El Sol', icon: '☀️', color: '#f59e0b',
  subtitle: `Diámetro en la tarjeta: ${SUN_CARD_CM} cm`,
  footer: `${SUN_DIAMETER_KM.toLocaleString('es-GT')} km reales`
};

const toCard = (a: ChallengeAstro): CardAstro => {
  const d = getScaleDistances(a);
  return {
    id: a.id, name: a.name, icon: a.icon, color: a.color,
    subtitle: `Mide ${getScaleDiameterMm(a).toFixed(1)} mm a escala · Sol = ${SUN_CARD_CM} cm`,
    footer: `${a.meanMkm.toLocaleString('es-GT')} M km reales · a escala ${formatMeters(d.mean)}`
  };
};

const escapeXml = (s: string) => s.replace(/[<>&"']/g, c => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&apos;' }[c] as string));

/** Dibuja solo los módulos del QR como un único <path> (nítido y ligero). */
function qrPath(text: string, size: number, offset: number): string {
  const qr = QRCode.create(text, { errorCorrectionLevel: 'M' });
  const n = qr.modules.size;
  const cell = size / n;
  let d = '';
  for (let y = 0; y < n; y++) {
    for (let x = 0; x < n; x++) {
      if (qr.modules.get(x, y)) {
        d += `M${(offset + x * cell).toFixed(3)} ${(offset + y * cell).toFixed(3)}h${cell.toFixed(3)}v${cell.toFixed(3)}h-${cell.toFixed(3)}z`;
      }
    }
  }
  return d;
}

/** SVG del solo código QR con zona de silencio. */
function buildQrOnlySvg(url: string): string {
  const size = 512, margin = 32;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size + margin * 2} ${size + margin * 2}" width="${size + margin * 2}" height="${size + margin * 2}">` +
    `<rect width="100%" height="100%" fill="#ffffff"/><path d="${qrPath(url, size, margin)}" fill="#0b1020"/></svg>`;
}

/** SVG de la tarjeta completa: título, QR y datos a escala. */
function buildCardSvg(card: CardAstro, url: string): string {
  const W = 600, H = 780, qrSize = 420, qrX = (W - qrSize) / 2, qrY = 180;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" font-family="Arial, Helvetica, sans-serif">` +
    `<rect width="${W}" height="${H}" rx="36" fill="#ffffff"/>` +
    `<rect x="12" y="12" width="${W - 24}" height="${H - 24}" rx="28" fill="none" stroke="${card.color}" stroke-width="8"/>` +
    `<text x="${W / 2}" y="92" text-anchor="middle" font-size="56" font-weight="800" fill="#0b1020">${escapeXml(card.icon)} ${escapeXml(card.name)}</text>` +
    `<text x="${W / 2}" y="140" text-anchor="middle" font-size="24" fill="#334155">${escapeXml(card.subtitle)}</text>` +
    `<path d="${qrPath(url, qrSize, 0)}" transform="translate(${qrX} ${qrY})" fill="#0b1020"/>` +
    `<text x="${W / 2}" y="${qrY + qrSize + 52}" text-anchor="middle" font-size="26" font-weight="700" fill="#0b1020">Escanea y clava tu planeta con el GPS</text>` +
    `<text x="${W / 2}" y="${qrY + qrSize + 92}" text-anchor="middle" font-size="22" fill="#475569">${escapeXml(card.footer)}</text>` +
    `<text x="${W / 2}" y="${H - 40}" text-anchor="middle" font-size="18" fill="#94a3b8">Lluvia de Ideas · Reto de Escala</text>` +
    `</svg>`;
}

const download = (blob: Blob, filename: string) => {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 2000);
};

async function svgToPngBlob(svg: string, scale = 2): Promise<Blob> {
  const url = URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml;charset=utf-8' }));
  try {
    const img = new Image();
    await new Promise<void>((res, rej) => { img.onload = () => res(); img.onerror = () => rej(new Error('No se pudo renderizar el SVG')); img.src = url; });
    const canvas = document.createElement('canvas');
    canvas.width = (img.naturalWidth || 600) * scale;
    canvas.height = (img.naturalHeight || 780) * scale;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas no disponible');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    return await new Promise<Blob>((res, rej) => canvas.toBlob(b => (b ? res(b) : rej(new Error('PNG vacío'))), 'image/png'));
  } finally { URL.revokeObjectURL(url); }
}

export default function AdminTabSolarQr() {
  const defaultBase = typeof window !== 'undefined' ? `${window.location.origin}/sistema-solar` : 'https://lluviadeideas-educativo.web.app/sistema-solar';
  const [baseUrl, setBaseUrl] = useState(defaultBase);
  const [status, setStatus] = useState('');

  const cards = useMemo(() => [SUN_CARD, ...CHALLENGE_ASTROS.map(toCard)], []);
  const urlFor = (id: string) => `${baseUrl.replace(/\/+$/, '')}?reto=1&astro=${id}`;

  const previews = useMemo(
    () => cards.map(c => ({ card: c, url: urlFor(c.id), svg: buildCardSvg(c, urlFor(c.id)) })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [cards, baseUrl]
  );

  const downloadSvg = (id: string, kind: 'card' | 'qr') => {
    const p = previews.find(x => x.card.id === id);
    if (!p) return;
    const svg = kind === 'card' ? p.svg : buildQrOnlySvg(p.url);
    download(new Blob([svg], { type: 'image/svg+xml' }), `qr-sistema-solar-${id}${kind === 'qr' ? '-solo-qr' : ''}.svg`);
  };

  const downloadPng = async (id: string) => {
    const p = previews.find(x => x.card.id === id);
    if (!p) return;
    try {
      download(await svgToPngBlob(p.svg), `qr-sistema-solar-${id}.png`);
    } catch (e) { setStatus(e instanceof Error ? e.message : 'Error al generar PNG'); }
  };

  const downloadAll = async (format: 'svg' | 'png') => {
    setStatus(`Descargando ${previews.length} archivos ${format.toUpperCase()}…`);
    for (const p of previews) {
      if (format === 'svg') downloadSvg(p.card.id, 'card'); else await downloadPng(p.card.id);
      await new Promise(r => setTimeout(r, 350));
    }
    setStatus('Descarga completa. Si el navegador bloqueó alguna, permite descargas múltiples.');
  };

  return (
    <div className="admin-card card-glass animate-fade-in" style={{ marginTop: 24 }}>
      <h3 style={{ marginTop: 0 }}>🌍 Reto de Escala: códigos QR de los planetas</h3>
      <p style={{ color: '#94a3b8', lineHeight: 1.5 }}>
        Un QR por astro (Sol de {SUN_CARD_CM} cm). Las tarjetas son reutilizables: el código de sala y el grupo se piden al escanear.
        Descarga cada tarjeta en <strong>SVG</strong> (vectorial, ideal para imprimir a cualquier tamaño o enviar por WhatsApp) o <strong>PNG</strong>.
      </p>

      <label htmlFor="solar-qr-base" style={{ display: 'block', fontWeight: 700, margin: '12px 0 6px' }}>Dirección base del reto</label>
      <input
        id="solar-qr-base" type="url" value={baseUrl} onChange={e => setBaseUrl(e.target.value)}
        style={{ width: '100%', minHeight: 44, fontSize: 16, padding: '8px 12px', borderRadius: 10, border: '1px solid rgba(56,189,248,0.4)', background: 'rgba(2,6,23,0.8)', color: '#f8fafc', boxSizing: 'border-box' }}
      />

      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', margin: '14px 0' }}>
        <button type="button" className="btn btn-primary" style={{ minHeight: 44 }} onClick={() => downloadAll('svg')}>⬇️ Todos en SVG</button>
        <button type="button" className="btn" style={{ minHeight: 44 }} onClick={() => downloadAll('png')}>⬇️ Todos en PNG</button>
      </div>
      {status && <p style={{ color: '#7dd3fc', margin: '0 0 12px' }}>{status}</p>}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 16 }}>
        {previews.map(p => (
          <div key={p.card.id} style={{ background: 'rgba(15,23,42,0.7)', border: `1px solid ${p.card.color}66`, borderRadius: 16, padding: 12, display: 'flex', flexDirection: 'column', gap: 10 }}>
            <img
              alt={`Tarjeta QR de ${p.card.name}`}
              src={`data:image/svg+xml;utf8,${encodeURIComponent(p.svg)}`}
              style={{ width: '100%', borderRadius: 12, background: '#fff' }}
            />
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <button type="button" className="btn btn-primary" style={{ flex: '1 1 90px', minHeight: 44 }} onClick={() => downloadSvg(p.card.id, 'card')}>SVG</button>
              <button type="button" className="btn" style={{ flex: '1 1 90px', minHeight: 44 }} onClick={() => downloadPng(p.card.id)}>PNG</button>
              <button type="button" className="btn" style={{ flex: '1 1 100%', minHeight: 44 }} onClick={() => downloadSvg(p.card.id, 'qr')}>SVG solo QR</button>
            </div>
            <code style={{ fontSize: '0.7rem', color: '#94a3b8', wordBreak: 'break-all' }}>{p.url}</code>
          </div>
        ))}
      </div>
    </div>
  );
}

