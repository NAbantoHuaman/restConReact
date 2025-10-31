export interface ReservationForReceipt {
  date: string; 
  time: string; 
  customerName: string;
  guests: number;
  tableLabel: string; 
  zoneLabel?: string; 
  consumptionTypeLabel?: string; 
  phone?: string;
  email?: string;
  specialRequests?: string;
  location?: string; 
  qrData?: string; 
  qrUrl?: string; 
}

export interface ReceiptLabels {
  title: string; 
  date: string;
  time: string;
  customer: string;
  guests: string;
  table: string;
  zone?: string;
  consumption?: string;
  phone?: string;
  email?: string;
  notes?: string;
  location?: string;
  qr?: string; 
}

export function createReservationReceiptHTML(data: ReservationForReceipt, labels: ReceiptLabels) {
  const safe = (v?: string) => (v ? String(v) : "");
  const d = safe(data.date);
  const t = safe(data.time);
  const special = safe(data.specialRequests);
  const qrTarget = data.qrUrl ? String(data.qrUrl) : (data.qrData ? String(data.qrData) : undefined);
  const qrSrc = qrTarget
    ? `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrTarget)}`
    : '';

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${labels.title}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif; background:#f6f6f6; margin:0; padding:24px; }
    .receipt { max-width: 680px; margin: 0 auto; background:#fff; border:1px solid #e5e5e5; border-radius:12px; }
    .header { padding:20px 24px; border-bottom:1px solid #eee; display:flex; justify-content:space-between; align-items:center; }
    .header h1 { font-size:20px; margin:0; color:#111; }
    .meta { font-size:12px; color:#666; }
    .content { padding:16px 24px; }
    .row { display:flex; gap:16px; margin-bottom:8px; }
    .col { flex:1; }
    .label { font-size:12px; color:#666; margin-bottom:4px; }
    .value { font-size:14px; color:#111; font-weight:600; }
    .section { margin-top:16px; padding-top:12px; border-top:1px dashed #ddd; }
    .notes { white-space:pre-wrap; font-size:13px; color:#333; }
    .footer { padding:16px 24px; border-top:1px solid #eee; font-size:12px; color:#666; }
    .qr-box { display:flex; align-items:center; gap:12px; }
    .qr-img { width:160px; height:160px; border:1px solid #eee; border-radius:8px; padding:8px; background:#fff; }
    .qr-text { font-size:12px; color:#666; word-break:break-word; }
  </style>
</head>
<body>
  <div class="receipt">
    <div class="header">
      <h1>${labels.title}</h1>
      <div class="meta">${new Date().toLocaleString()}</div>
    </div>
    <div class="content">
      <div class="row">
        <div class="col">
          <div class="label">${labels.date}</div>
          <div class="value">${d}</div>
        </div>
        <div class="col">
          <div class="label">${labels.time}</div>
          <div class="value">${t}</div>
        </div>
      </div>
      <div class="row">
        <div class="col">
          <div class="label">${labels.customer}</div>
          <div class="value">${safe(data.customerName)}</div>
        </div>
        <div class="col">
          <div class="label">${labels.guests}</div>
          <div class="value">${data.guests}</div>
        </div>
      </div>
      <div class="row">
        <div class="col">
          <div class="label">${labels.table}</div>
          <div class="value">${safe(data.tableLabel)}</div>
        </div>
        ${data.zoneLabel ? `<div class="col"><div class="label">${labels.zone || 'Zona'}</div><div class="value">${safe(data.zoneLabel)}</div></div>` : ''}
      </div>
      ${data.consumptionTypeLabel ? `<div class="row"><div class="col"><div class="label">${labels.consumption || 'Consumo'}</div><div class="value">${safe(data.consumptionTypeLabel)}</div></div></div>` : ''}
      ${(data.phone || data.email) ? `
      <div class="row section">
        ${data.phone ? `<div class="col"><div class="label">${labels.phone || 'Teléfono'}</div><div class="value">${safe(data.phone)}</div></div>` : ''}
        ${data.email ? `<div class="col"><div class="label">${labels.email || 'Correo'}</div><div class="value">${safe(data.email)}</div></div>` : ''}
      </div>` : ''}
      ${special ? `
      <div class="section">
        <div class="label">${labels.notes || 'Notas'}</div>
        <div class="notes">${special}</div>
      </div>` : ''}
      ${qrSrc ? `
      <div class="section">
        <div class="label">${labels.qr || 'Código QR'}</div>
        <div class="qr-box">
          <img class="qr-img" alt="QR" src="${qrSrc}" />
        </div>
      </div>` : ''}
    </div>
    <div class="footer">
      ${labels.location ? `${labels.location}: ${safe(data.location)}` : safe(data.location || '')}
    </div>
  </div>
</body>
</html>`;
}

export function downloadReceipt(fileName: string, html: string) {
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}