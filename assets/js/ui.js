/* ============================================================
   UI yardımcıları — ikonlar, grafikler, modal, toast
   ============================================================ */

export const esc = (s) =>
  String(s ?? "").replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

export const initials = (name) =>
  String(name).trim().split(/\s+/).slice(0, 2).map((w) => w[0]).join("").toUpperCase();

/* ---------- İkon seti (stroke tabanlı, 24x24) ---------- */
const PATHS = {
  home:      '<rect x="3" y="3" width="7" height="7" rx="2"/><rect x="14" y="3" width="7" height="7" rx="2"/><rect x="3" y="14" width="7" height="7" rx="2"/><rect x="14" y="14" width="7" height="7" rx="2"/>',
  dumbbell:  '<path d="M4 9v6M7 7v10M17 7v10M20 9v6M7 12h10"/>',
  heart:     '<path d="M12 20s-7-4.5-7-9.5A4.5 4.5 0 0 1 12 8a4.5 4.5 0 0 1 7 2.5C19 15.5 12 20 12 20z"/>',
  calendar:  '<rect x="3" y="5" width="18" height="16" rx="3"/><path d="M8 3v4M16 3v4M3 10h18"/>',
  flame:     '<path d="M12 3s4 4 4 8a4 4 0 0 1-8 0c0-1.5 1-3 1-3s-3 2-3 5a6 6 0 0 0 12 0c0-5-6-10-6-10z"/>',
  bell:      '<path d="M18 15V10a6 6 0 1 0-12 0v5l-2 3h16l-2-3z"/><path d="M10 21h4"/>',
  user:      '<circle cx="12" cy="8" r="4"/><path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6"/>',
  users:     '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c1-3.5 3.5-5.5 6.5-5.5s5.5 2 6.5 5.5"/><path d="M16 5.5a3.5 3.5 0 0 1 0 7M18 14c2 .8 3.3 2.6 3.9 5"/>',
  chart:     '<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>',
  target:    '<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="4"/><circle cx="12" cy="12" r="1"/>',
  moon:      '<path d="M20 14a8 8 0 1 1-10-10 7 7 0 0 0 10 10z"/>',
  sun:       '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.5 1.5M17.5 17.5 19 19M19 5l-1.5 1.5M6.5 17.5 5 19"/>',
  settings:  '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.6 1.6 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-1.8-.3 1.6 1.6 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1A1.6 1.6 0 0 0 9 19.4a1.6 1.6 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.6 1.6 0 0 0 .3-1.8 1.6 1.6 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1A1.6 1.6 0 0 0 4.6 9a1.6 1.6 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.6 1.6 0 0 0 1.8.3H9a1.6 1.6 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.6 1.6 0 0 0 1 1.5 1.6 1.6 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.6 1.6 0 0 0-.3 1.8V9a1.6 1.6 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.6 1.6 0 0 0-1.5 1z"/>',
  plus:      '<path d="M12 5v14M5 12h14"/>',
  close:     '<path d="M18 6 6 18M6 6l12 12"/>',
  check:     '<path d="m5 13 4 4L19 7"/>',
  arrow:     '<path d="M7 17 17 7M9 7h8v8"/>',
  chevron:   '<path d="m6 9 6 6 6-6"/>',
  search:    '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
  image:     '<rect x="3" y="4" width="18" height="16" rx="3"/><circle cx="8.5" cy="9.5" r="1.5"/><path d="m4 17 5-5 4 4 3-2 4 4"/>',
  apple:     '<path d="M12 8c-2-3-6-2-6 2s2 8 4.5 8c.9 0 1-.6 1.5-.6s.6.6 1.5.6C16 18 18 13 18 10s-4-5-6-2z"/><path d="M12 8c0-2 1-3.5 3-4"/>',
  scale:     '<path d="M4 20h16M7 20V9h10v11"/><path d="M12 9V5"/><circle cx="12" cy="4" r="1.5"/>',
  ticket:    '<path d="M4 8a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2 2 2 0 0 0 0 4 2 2 0 0 1 0 4 2 2 0 0 1-2 2H6a2 2 0 0 1-2-2 2 2 0 0 0 0-4 2 2 0 0 1 0-4z"/><path d="M14 6v12"/>',
  party:     '<path d="m4 20 5-13 8 8-13 5z"/><path d="M14 4v2M18 6l1.5-1.5M20 10h2"/>',
  clock:     '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.5 2"/>',
  send:      '<path d="m4 12 16-8-6 16-2.5-6.5L4 12z"/>',
  clipboard: '<rect x="6" y="4" width="12" height="17" rx="2"/><path d="M9 4V3h6v1"/><path d="M9.5 11h5M9.5 15h3"/>',
  logout:    '<path d="M14 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8"/><path d="m17 8 4 4-4 4M21 12H10"/>',
  water:     '<path d="M12 3s6 6.5 6 10.5A6 6 0 0 1 6 13.5C6 9.5 12 3 12 3z"/>',
  trash:     '<path d="M4 7h16M9 7V5h6v2M6 7l1 13h10l1-13"/>',
  edit:      '<path d="M4 20h4l10-10-4-4L4 16v4z"/><path d="m14 6 4 4"/>',
  timer:     '<circle cx="12" cy="13" r="8"/><path d="M12 9v4M9 2h6"/>',
  info:      '<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/>',
  refresh:   '<path d="M4 12a8 8 0 0 1 13.7-5.6L20 8"/><path d="M20 4v4h-4"/><path d="M20 12a8 8 0 0 1-13.7 5.6L4 16"/><path d="M4 20v-4h4"/>',
  star:      '<path d="m12 4 2.3 5 5.7.6-4.2 3.8 1.2 5.6L12 16.2 7 19l1.2-5.6L4 9.6 9.7 9 12 4z"/>',
  trophy:    '<path d="M8 4h8v5a4 4 0 0 1-8 0V4z"/><path d="M8 6H5v1a3 3 0 0 0 3 3M16 6h3v1a3 3 0 0 1-3 3"/><path d="M10 17h4M9 20h6M12 13v4"/>',
};

export function icon(name, size = 18, cls = "") {
  const d = PATHS[name] || PATHS.info;
  return `<svg class="${cls}" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"
    aria-hidden="true">${d}</svg>`;
}

export const logoMark = (size = 30) => `
<svg width="${size}" height="${size}" viewBox="0 0 40 40" fill="none" aria-hidden="true">
  <rect width="40" height="40" rx="12" fill="url(#mptg)"/>
  <path d="M11 27V13l6 8 6-8v14" stroke="#fff" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M27 13h2.5a3.5 3.5 0 0 1 0 7H27v7" stroke="#fff" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>
  <defs><linearGradient id="mptg" x1="0" y1="0" x2="40" y2="40">
    <stop stop-color="#ff8a3d"/><stop offset="1" stop-color="#e8490f"/>
  </linearGradient></defs>
</svg>`;

/* ============================================================
   GRAFİKLER (bağımlılıksız inline SVG)
   ============================================================ */

/** Dikey çubuk grafik — referans görseldeki haftalık aktivite kartı.
    Etiketler SVG dışında HTML olarak çizilir; böylece grafik genişlerken yazı bozulmaz. */
export function barChart(data, opts = {}) {
  const { height = 170, highlight = -1, color = "#fff", dim = "rgba(0,0,0,.35)" } = opts;
  const max = Math.max(1, ...data.map((d) => d.value));
  const n = data.length || 1;
  const w = 100 / n;
  const bw = w * 0.44;
  const active = (i) => i === highlight || (highlight === -1 && i === n - 1);

  const bars = data.map((d, i) => {
    const h = (d.value / max) * 96;
    const x = i * w + w / 2;
    return `<rect x="${(x - bw / 2).toFixed(2)}" y="${(100 - h).toFixed(2)}"
      width="${bw.toFixed(2)}" height="${Math.max(h, 1.5).toFixed(2)}" rx="1.4"
      fill="${active(i) ? color : dim}"><title>${esc(d.label)}: ${d.value}</title></rect>`;
  }).join("");

  const grid = [0, 25, 50, 75].map((p) =>
    `<line x1="0" x2="100" y1="${100 - p}" y2="${100 - p}" stroke="currentColor"
      stroke-opacity=".13" stroke-dasharray="1 2" stroke-width=".4"/>`).join("");

  return `<div class="chart-box">
    <svg class="chart" viewBox="0 0 100 100" preserveAspectRatio="none" style="height:${height}px">
      ${grid}${bars}
    </svg>
    <div class="chart-x">
      ${data.map((d, i) => `<span class="${active(i) ? "is-on" : ""}">${esc(d.label)}</span>`).join("")}
    </div>
  </div>`;
}

/** Alan + çizgi grafiği — ağırlık/kalori trendi */
export function lineChart(points, opts = {}) {
  const { height = 190, stroke = "#f05a1e", fill = "rgba(240,90,30,.18)", labels = true, dots = true } = opts;
  if (!points.length) return `<div class="empty">Veri yok</div>`;
  const vals = points.map((p) => p.value);
  const min = Math.min(...vals), max = Math.max(...vals);
  const pad = (max - min) * 0.25 || 1;
  const lo = min - pad, hi = max + pad;
  const X = (i) => (points.length === 1 ? 50 : (i / (points.length - 1)) * 96 + 2);
  const Y = (v) => 96 - ((v - lo) / (hi - lo)) * 92;

  const line = points.map((p, i) => `${i ? "L" : "M"}${X(i).toFixed(2)},${Y(p.value).toFixed(2)}`).join(" ");
  const area = `${line} L${X(points.length - 1).toFixed(2)},100 L${X(0).toFixed(2)},100 Z`;
  const id = "g" + Math.random().toString(36).slice(2, 7);

  /* Son nokta işareti HTML olarak konumlanır: SVG eksen ölçeklemesi daireyi ezmesin */
  const lastX = X(points.length - 1), lastY = Y(points[points.length - 1].value);
  const marks = dots
    ? `<span class="chart-dot" style="left:${lastX}%;top:${lastY}%;background:${stroke}"></span>`
    : "";

  const grid = [0, 1, 2, 3].map((k) =>
    `<line x1="0" x2="100" y1="${8 + k * 28}" y2="${8 + k * 28}" stroke="currentColor"
       stroke-opacity=".1" stroke-width=".4"/>`).join("");

  const step = Math.max(1, Math.ceil(points.length / 6));
  const last = points.length - 1;
  /* Son etiket her zaman yazılır; ona çok yakın ara etiket atlanır ki üst üste binmesin */
  const showTick = (i) =>
    points.length < 9 || i === last || (i % step === 0 && last - i >= Math.ceil(step / 2));
  const ticks = labels ? `<div class="chart-x">
    ${points.map((p, i) => `<span>${showTick(i) ? esc(p.label) : ""}</span>`).join("")}</div>` : "";

  return `<div class="chart-box">
    <svg class="chart" viewBox="0 0 100 100" preserveAspectRatio="none" style="height:${height}px">
      <defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="${fill}"/><stop offset="1" stop-color="transparent"/>
      </linearGradient></defs>
      ${grid}
      <path d="${area}" fill="url(#${id})"/>
      <path d="${line}" fill="none" stroke="${stroke}" stroke-width="1.4"
        vector-effect="non-scaling-stroke" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
    ${marks}
    ${ticks}
  </div>`;
}

/** Halka (donut) — adım/hedef göstergesi */
export function ring(pct, opts = {}) {
  const { size = 132, label = "", value = "", stroke = 11, color = "#f05a1e", track = "rgba(255,255,255,.09)", second = null } = opts;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const p = Math.max(0, Math.min(100, pct));
  const dash = (p / 100) * c;
  const sec = second ? `<circle cx="${size / 2}" cy="${size / 2}" r="${r}" fill="none" stroke="${second.color}" stroke-width="${stroke}"
      stroke-linecap="round" stroke-dasharray="${(second.pct / 100) * c} ${c}"
      transform="rotate(-90 ${size / 2} ${size / 2})" opacity=".55"/>` : "";
  return `<div class="ring-stat" style="width:${size}px;height:${size}px">
    <svg width="${size}" height="${size}">
      <circle cx="${size / 2}" cy="${size / 2}" r="${r}" fill="none" stroke="${track}" stroke-width="${stroke}"/>
      ${sec}
      <circle cx="${size / 2}" cy="${size / 2}" r="${r}" fill="none" stroke="${color}" stroke-width="${stroke}"
        stroke-linecap="round" stroke-dasharray="${dash.toFixed(1)} ${c.toFixed(1)}"
        transform="rotate(-90 ${size / 2} ${size / 2})"/>
    </svg>
    <div class="ring-stat__val"><b>${esc(value)}</b><span>${esc(label)}</span></div>
  </div>`;
}

/** Yarım gösterge — stres/BMI benzeri ölçek */
export function gauge(pct, opts = {}) {
  const { size = 150, value = "", label = "", color = "#f05a1e" } = opts;
  const r = size / 2 - 12;
  const cx = size / 2, cy = size / 2 + 4;
  const c = Math.PI * r;
  const dash = (Math.max(0, Math.min(100, pct)) / 100) * c;
  const id = "gg" + Math.random().toString(36).slice(2, 7);
  return `<div class="ring-stat" style="width:${size}px;height:${size * 0.66}px">
    <svg width="${size}" height="${size * 0.66}" viewBox="0 0 ${size} ${size * 0.66}">
      <defs><linearGradient id="${id}" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stop-color="#b6f24a"/><stop offset=".55" stop-color="#ffc555"/><stop offset="1" stop-color="${color}"/>
      </linearGradient></defs>
      <path d="M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}" fill="none"
        stroke="currentColor" stroke-opacity=".12" stroke-width="9" stroke-linecap="round"/>
      <path d="M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}" fill="none"
        stroke="url(#${id})" stroke-width="9" stroke-linecap="round"
        stroke-dasharray="${dash.toFixed(1)} ${c.toFixed(1)}"/>
    </svg>
    <div class="ring-stat__val" style="top:36%"><b>${esc(value)}</b><span>${esc(label)}</span></div>
  </div>`;
}

/** Yatay yığın — makro dağılımı */
export function stackBar(items) {
  const total = items.reduce((s, i) => s + i.value, 0) || 1;
  return `<div style="display:flex;height:10px;border-radius:99px;overflow:hidden;gap:2px">
    ${items.map((i) => `<span title="${esc(i.label)}" style="width:${(i.value / total) * 100}%;background:${i.color}"></span>`).join("")}
  </div>`;
}

/* ============================================================
   Modal & Toast
   ============================================================ */
let modalEl = null;

export function openModal(html, { wide = false, onMount } = {}) {
  closeModal();
  modalEl = document.createElement("div");
  modalEl.className = "modal-backdrop";
  modalEl.innerHTML = `<div class="modal ${wide ? "modal--wide" : ""}" role="dialog" aria-modal="true">${html}</div>`;
  modalEl.addEventListener("mousedown", (e) => { if (e.target === modalEl) closeModal(); });
  document.body.appendChild(modalEl);
  document.body.style.overflow = "hidden";
  modalEl.querySelectorAll("[data-close]").forEach((b) => b.addEventListener("click", closeModal));
  onMount?.(modalEl.firstElementChild);
  const first = modalEl.querySelector("input,select,textarea");
  first?.focus();
  return modalEl.firstElementChild;
}

export function closeModal() {
  if (!modalEl) return;
  modalEl.remove();
  modalEl = null;
  document.body.style.overflow = "";
}

document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeModal(); });

export function modalShell(title, bodyHtml, footHtml, iconName = "info") {
  return `
    <div class="modal__head">
      <span class="list__ico">${icon(iconName)}</span>
      <h3>${esc(title)}</h3>
      <button class="icon-btn" data-close aria-label="Kapat">${icon("close", 16)}</button>
    </div>
    ${bodyHtml}
    <div class="modal__foot">${footHtml}</div>`;
}

export function toast(message, kind = "") {
  let host = document.querySelector(".toasts");
  if (!host) {
    host = document.createElement("div");
    host.className = "toasts";
    document.body.appendChild(host);
  }
  const el = document.createElement("div");
  el.className = `toast ${kind ? "toast--" + kind : ""}`;
  el.textContent = message;
  host.appendChild(el);
  setTimeout(() => { el.style.opacity = "0"; el.style.transition = "opacity .3s"; }, 2600);
  setTimeout(() => el.remove(), 3000);
}

export function confirmDialog(title, text, onYes, yesLabel = "Evet, devam et") {
  openModal(modalShell(title, `<p class="muted">${esc(text)}</p>`,
    `<button class="btn" data-close>Vazgeç</button>
     <button class="btn btn--primary" id="cf-yes">${esc(yesLabel)}</button>`, "info"),
    { onMount: (m) => m.querySelector("#cf-yes").addEventListener("click", () => { closeModal(); onYes(); }) });
}

/* ---------- Tema ---------- */
export function applyTheme(t) {
  document.documentElement.setAttribute("data-theme", t);
  localStorage.setItem("mpt.theme", t);
}
export const savedTheme = () => localStorage.getItem("mpt.theme") || "dark";
