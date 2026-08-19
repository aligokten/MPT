/* ============================================================
   ÜYE EKRANLARI
   ============================================================ */
import * as S from "../store.js";
import {
  esc, icon, barChart, lineChart, ring, gauge, stackBar,
  openModal, closeModal, modalShell, toast, confirmDialog, initials,
} from "../ui.js";

const GNAME = (id) => (S.MUSCLE_GROUPS.find((g) => g.id === id) || {}).name || id;
const kg = (n) => `${(+n).toLocaleString("tr-TR", { maximumFractionDigits: 1 })} kg`;
const tl = (n) => `${(+n).toLocaleString("tr-TR")} ₺`;

/* ------------------------------------------------------------
   1) ANA SAYFA
   ------------------------------------------------------------ */
export function home(ctx) {
  const { user } = ctx;
  const id = user.id;
  const week = S.weekVolume(id);
  const prof = S.memberProfile(id);
  const pkg = S.packageOf(id);
  const ms = S.measuresOf(id);
  const last = ms[ms.length - 1];
  const first = ms[0];
  const b = S.bmi(id);
  const nut = S.nutritionOf(id, S.today()) || S.nutritionRange(id).slice(-1)[0];
  const tot = S.nutritionTotals(nut);
  const upcoming = S.sessionsOf(id).filter((s) => s.status === "planned" && s.date >= S.today()).slice(0, 4);
  const notifs = S.notificationsOf(id).slice(0, 3);
  const groups = S.groupDistribution(id, 30);
  const doneThisWeek = week.filter((d) => d.minutes > 0).length;
  const goalPerWeek = 3;
  const st = S.streak(id);
  const events = S.load().events.filter((e) => e.date >= S.today()).sort((a, c) => a.date.localeCompare(c.date)).slice(0, 2);
  const photos = S.photosOf(id).slice(0, 3);

  const totalVolume = week.reduce((s, d) => s + d.volume, 0);
  const totalMin = week.reduce((s, d) => s + d.minutes, 0);

  const html = `
  <div class="page-head">
    <div>
      <h1>Merhaba, ${esc(user.name.split(" ")[0])}</h1>
      <p>${esc(S.dayName(S.today()))}, ${esc(S.fmtDate(S.today()))} · Hedefin: ${esc(prof?.goal || "-")}</p>
    </div>
    <div class="page-head__actions">
      <a class="btn" href="#/schedule">${icon("calendar", 16)} Ders Programı</a>
      <a class="btn btn--primary" href="#/progress">${icon("scale", 16)} Ölçüm Ekle</a>
    </div>
  </div>

  <div class="grid dash">

    <!-- Aktivite (vurgu kart) -->
    <div class="card card--accent c4">
      <div class="card__head">
        <span class="card__title">${icon("flame")} Aktivite</span>
        <button class="icon-btn" style="background:rgba(0,0,0,.18);border-color:transparent;color:#fff" title="Detay">${icon("chevron", 16)}</button>
      </div>
      ${st > 0 ? `<div class="notice">${icon("star", 16)} <span>${st} gündür serini sürdürüyorsun</span></div>` : ""}
      <div class="segment mt-4" data-seg>
        <button class="is-active" data-range="7">Hafta</button>
        <button data-range="30">Ay</button>
        <button data-range="90">3 Ay</button>
      </div>
      <div class="mt-4">
        <div class="row row--between">
          <b>Bu hafta</b>
          <span class="badge" style="background:rgba(0,0,0,.2);color:#fff">${totalMin} dk</span>
        </div>
        <div class="mt-3" data-chart style="color:#fff">
          ${barChart(week.map((d) => ({ label: d.label, value: d.minutes })), { highlight: 6 })}
        </div>
      </div>
      <div class="row row--between mt-4" style="border-top:1px solid rgba(255,255,255,.18);padding-top:12px">
        <span class="small">Bugün ${week[6].minutes ? `${week[6].groups.map(GNAME).join(", ")}` : "planlı antrenman yok"}</span>
        <b>${(totalVolume / 1000).toFixed(1)} ton</b>
      </div>
    </div>

    <!-- Haftalık hedef -->
    <div class="card c3">
      <div class="card__head"><span class="card__title">${icon("target")} Haftalık Hedef</span>
        <a class="icon-btn" href="#/workouts">${icon("arrow", 15)}</a></div>
      <div class="row" style="justify-content:center">
        ${ring((doneThisWeek / goalPerWeek) * 100, { value: `${doneThisWeek}/${goalPerWeek}`, label: "Seans", color: "#f05a1e",
          second: { pct: (totalMin / 240) * 100, color: "#b6f24a" }, track: "var(--surface-3)" })}
      </div>
      <div class="legend mt-4" style="justify-content:center">
        <span><i style="background:#f05a1e"></i>Seans</span>
        <span><i style="background:#b6f24a"></i>Süre</span>
      </div>
      <div class="list mt-4" style="border-top:1px solid var(--line-soft);padding-top:6px">
        <div class="list__item"><div class="list__body"><span>Bu hafta süre</span></div><b>${totalMin} / 240 dk</b></div>
        <div class="list__item"><div class="list__body"><span>Kaldırılan tonaj</span></div><b>${(totalVolume / 1000).toFixed(1)} ton</b></div>
        <div class="list__item"><div class="list__body"><span>Aktif seri</span></div><b>${st} gün</b></div>
      </div>
    </div>

    <!-- Tonaj trendi -->
    <div class="card c5">
      <div class="card__head">
        <span class="card__title">${icon("chart")} Antrenman Yoğunluğu</span>
        <span class="badge badge--orange">Son 7 gün</span>
      </div>
      ${lineChart(week.map((d) => ({ label: d.label, value: Math.round(d.volume / 100) / 10 })),
        { height: 214, stroke: "#f05a1e" })}
      <div class="row row--between mt-3 small muted">
        <span>Toplam kaldırılan: <b style="color:var(--text)">${(totalVolume / 1000).toFixed(1)} ton</b></span>
        <span>Ortalama RPE: <b style="color:var(--text)">${(S.workoutsOf(id).slice(0, 5).reduce((s, w) => s + (w.rpe || 7), 0) / Math.max(1, Math.min(5, S.workoutsOf(id).length))).toFixed(1)}</b></span>
      </div>
    </div>

    <!-- BMI -->
    <div class="card c3">
      <div class="card__head"><span class="card__title">${icon("scale")} Vücut Kitle İndeksi</span></div>
      <div class="row" style="justify-content:center">
        ${b ? gauge(Math.min(100, ((b.value - 15) / 20) * 100), { value: b.value, label: bmiLabel(b.value) }) : ""}
      </div>
      <div class="row row--between mt-3 small">
        <span class="muted">Güncel kilo</span><b>${b ? kg(b.weight) : "-"}</b>
      </div>
      <div class="row row--between mt-2 small">
        <span class="muted">Başlangıçtan bu yana</span>
        <b style="color:${last && first && last.weight <= first.weight ? "var(--green)" : "var(--orange-2)"}">
          ${last && first ? (last.weight - first.weight > 0 ? "+" : "") + (last.weight - first.weight).toFixed(1) + " kg" : "-"}
        </b>
      </div>
    </div>

    <!-- Su -->
    <div class="card c3">
      <div class="card__head"><span class="card__title">${icon("water")} Su Takibi</span>
        <a class="icon-btn" href="#/nutrition">${icon("arrow", 15)}</a></div>
      <div class="big-num">${(nut?.water || 0).toFixed(1)} <span class="small muted">/ ${S.DAILY_TARGET.water} lt</span></div>
      <div class="row mt-4" style="gap:5px;align-items:flex-end;height:64px">
        ${Array.from({ length: 10 }, (_, i) => {
          const on = i < Math.round(((nut?.water || 0) / S.DAILY_TARGET.water) * 10);
          return `<span style="flex:1;height:${28 + (i % 4) * 11}px;border-radius:99px;background:${on ? "var(--orange)" : "var(--surface-3)"}"></span>`;
        }).join("")}
      </div>
      <button class="btn btn--sm mt-4" data-water>${icon("plus", 14)} 250 ml ekle</button>
    </div>

    <!-- Beslenme -->
    <div class="card c6">
      <div class="card__head"><span class="card__title">${icon("apple")} Bugünün Beslenmesi</span>
        <a class="btn btn--sm" href="#/nutrition">Tümünü gör</a></div>
      <div class="row wrap" style="gap:24px">
        <div>
          <div class="big-num">${tot.kcal}<span class="small muted"> kcal</span></div>
          <div class="small muted">Hedef ${S.DAILY_TARGET.kcal} kcal · kalan ${Math.max(0, S.DAILY_TARGET.kcal - tot.kcal)}</div>
        </div>
        <div style="flex:1;min-width:220px">
          ${macroRow("Protein", tot.protein, S.DAILY_TARGET.protein, "#f05a1e")}
          ${macroRow("Karbonhidrat", tot.carb, S.DAILY_TARGET.carb, "#ffc555")}
          ${macroRow("Yağ", tot.fat, S.DAILY_TARGET.fat, "#5aa9ff")}
        </div>
      </div>
      <div class="mt-4">${stackBar([
        { label: "Protein", value: tot.protein * 4, color: "#f05a1e" },
        { label: "Karbonhidrat", value: tot.carb * 4, color: "#ffc555" },
        { label: "Yağ", value: tot.fat * 9, color: "#5aa9ff" },
      ])}</div>
    </div>

    <!-- Üyelik -->
    <div class="card c4">
      <div class="card__head"><span class="card__title">${icon("ticket")} Üyelik Paketi</span>
        <a class="icon-btn" href="#/membership">${icon("arrow", 15)}</a></div>
      ${pkg ? packageMini(pkg) : `<div class="empty">Aktif paket yok</div>`}
    </div>

    <!-- Yaklaşan dersler -->
    <div class="card c4">
      <div class="card__head"><span class="card__title">${icon("calendar")} Yaklaşan Dersler</span>
        <a class="btn btn--sm" href="#/schedule">Program</a></div>
      <div class="list">
        ${upcoming.length ? upcoming.map((s) => `
          <div class="list__item">
            <span class="list__ico">${icon("dumbbell")}</span>
            <div class="list__body">
              <b>${esc(s.type)} · ${esc(GNAME(s.group))}</b>
              <span>${esc(S.relative(s.date))} · ${esc(s.time)} · ${esc(s.room)}</span>
            </div>
            <span class="badge badge--orange">${esc(S.fmtShort(s.date))}</span>
          </div>`).join("") : `<div class="empty">Planlı ders bulunmuyor</div>`}
      </div>
    </div>

    <!-- Bildirimler -->
    <div class="card c4">
      <div class="card__head"><span class="card__title">${icon("bell")} Antrenörden</span>
        <a class="btn btn--sm" href="#/notifications">Tümü</a></div>
      <div class="list">
        ${notifs.length ? notifs.map((n) => `
          <div class="list__item">
            <span class="list__ico" style="${n.read ? "" : "background:var(--orange-soft);color:var(--orange-2)"}">${icon(n.kind === "package" ? "ticket" : n.kind === "workout" ? "dumbbell" : "info")}</span>
            <div class="list__body">
              <b>${esc(n.title)}</b>
              <span>${esc(S.relative(n.date))}</span>
            </div>
            ${n.read ? "" : `<span class="badge badge--orange">Yeni</span>`}
          </div>`).join("") : `<div class="empty">Bildirim yok</div>`}
      </div>
    </div>

    <!-- Ağırlık -->
    <div class="card c6">
      <div class="card__head"><span class="card__title">${icon("chart")} Ağırlık Takibi</span>
        <span class="badge badge--green">Son 12 hafta</span></div>
      ${lineChart(ms.map((m) => ({ label: S.fmtShort(m.date), value: m.weight })), { height: 232, stroke: "#b6f24a", fill: "rgba(182,242,74,.16)" })}
    </div>

    <!-- Kas grubu dağılımı -->
    <div class="card c6">
      <div class="card__head"><span class="card__title">${icon("dumbbell")} Kas Grubu Dağılımı</span>
        <span class="badge">Son 30 gün</span></div>
      <div class="stack">
        ${groups.length ? groups.map((g, i) => {
          const max = groups[0].count;
          return `<div>
            <div class="row row--between small"><span>${esc(g.name)}</span><b>${g.count} antrenman</b></div>
            <div class="bar mt-2"><i style="width:${(g.count / max) * 100}%;opacity:${1 - i * 0.1}"></i></div>
          </div>`;
        }).join("") : `<div class="empty">Kayıt yok</div>`}
      </div>
    </div>

    <!-- Etkinlikler -->
    <div class="card c6">
      <div class="card__head"><span class="card__title">${icon("party")} Salon Etkinlikleri</span>
        <a class="btn btn--sm" href="#/events">Tümü</a></div>
      <div class="stack">
        ${events.map((e) => `
          <div class="event" style="flex-direction:row;align-items:center">
            <div class="event__date"><b>${new Date(e.date).getDate()}</b><span>${S.fmtShort(e.date).split(" ")[1]}</span></div>
            <div style="flex:1;min-width:0">
              <b>${esc(e.title)}</b>
              <div class="small muted">${esc(e.time)} · ${esc(e.place)}</div>
            </div>
            <span class="badge ${e.attendees.includes(id) ? "badge--green" : ""}">${e.attendees.includes(id) ? "Kayıtlı" : `${e.attendees.length}/${e.capacity}`}</span>
          </div>`).join("") || `<div class="empty">Yaklaşan etkinlik yok</div>`}
      </div>
    </div>

    <!-- Galeri -->
    <div class="card c6">
      <div class="card__head"><span class="card__title">${icon("image")} Gelişim Albümü</span>
        <a class="btn btn--sm" href="#/gallery">Albüm</a></div>
      <div class="album" style="grid-template-columns:repeat(3,1fr)">
        ${photos.map((p) => photoTile(p, false)).join("") || `<div class="empty">Fotoğraf yok</div>`}
      </div>
    </div>
  </div>`;

  const mount = (root) => {
    root.querySelector("[data-water]")?.addEventListener("click", () => {
      const d = S.load();
      let entry = d.nutrition.find((n) => n.memberId === id && n.date === S.today());
      if (!entry) { entry = { id: S.newId("n"), memberId: id, date: S.today(), water: 0, meals: [] }; d.nutrition.push(entry); }
      entry.water = +(entry.water + 0.25).toFixed(2);
      S.save();
      toast("250 ml su eklendi", "ok");
      ctx.rerender();
    });

    root.querySelectorAll("[data-seg] button").forEach((btn) => {
      btn.addEventListener("click", () => {
        root.querySelectorAll("[data-seg] button").forEach((b) => b.classList.remove("is-active"));
        btn.classList.add("is-active");
        const days = +btn.dataset.range;
        const holder = root.querySelector("[data-chart]");
        holder.innerHTML = barChart(rangeSeries(id, days), { highlight: -1 });
      });
    });
  };

  return { html, mount };
}

function rangeSeries(id, days) {
  if (days === 7) {
    return S.weekVolume(id).map((d) => ({ label: d.label, value: d.minutes }));
  }
  const buckets = days === 30 ? 4 : 12;
  const size = Math.round(days / buckets);
  const out = [];
  for (let b = buckets - 1; b >= 0; b--) {
    const to = S.addDays(new Date(), -b * size);
    const from = S.addDays(new Date(), -(b + 1) * size + 1);
    const mins = S.load().workouts
      .filter((w) => w.memberId === id && w.date >= from && w.date <= to)
      .reduce((s, w) => s + w.duration, 0);
    out.push({ label: S.fmtShort(to), value: mins });
  }
  return out;
}

const bmiLabel = (v) => (v < 18.5 ? "Zayıf" : v < 25 ? "Normal" : v < 30 ? "Fazla kilolu" : "Obez");

function macroRow(label, val, target, color) {
  return `<div class="mt-2">
    <div class="row row--between small"><span class="muted">${esc(label)}</span>
      <span><b>${Math.round(val)}g</b> <span class="muted">/ ${target}g</span></span></div>
    <div class="bar mt-2"><i style="width:${Math.min(100, (val / target) * 100)}%;background:${color}"></i></div>
  </div>`;
}

function packageMini(pkg) {
  const left = pkg.total ? pkg.total - pkg.used : null;
  const daysLeft = S.daysBetween(S.today(), pkg.end);
  const pct = pkg.total ? (pkg.used / pkg.total) * 100 : Math.max(0, 100 - (daysLeft / 365) * 100);
  return `
    <b style="font-size:15px">${esc(pkg.name)}</b>
    <div class="row row--between small muted mt-2">
      <span>${S.fmtShort(pkg.start)} — ${S.fmtShort(pkg.end)}</span>
      <span class="badge ${daysLeft < 15 ? "badge--red" : "badge--green"}">${daysLeft > 0 ? `${daysLeft} gün kaldı` : "Süresi doldu"}</span>
    </div>
    <div class="bar mt-3"><i style="width:${Math.min(100, pct)}%"></i></div>
    <div class="row row--between mt-3">
      <div><div class="big-num" style="font-size:24px">${pkg.total ? left : "∞"}</div><span class="small muted">Kalan seans</span></div>
      <div style="text-align:right"><div class="big-num" style="font-size:24px">${pkg.used}</div><span class="small muted">Kullanılan</span></div>
    </div>
    <div class="list mt-3" style="border-top:1px solid var(--line-soft);padding-top:6px">
      <div class="list__item"><div class="list__body"><span>Haftalık ders hakkı</span></div>
        <b>${esc((pkg.name.match(/(\d+)x/) || [, "-"])[1])}x</b></div>
      <div class="list__item"><div class="list__body"><span>Dondurma hakkı</span></div><b>${pkg.freeze} kez</b></div>
      <div class="list__item"><div class="list__body"><span>Ödeme durumu</span></div>
        <b style="color:${pkg.paid >= pkg.price ? "var(--green)" : "var(--red)"}">
          ${pkg.paid >= pkg.price ? "Tamamlandı" : tl(pkg.price - pkg.paid) + " bakiye"}</b></div>
    </div>`;
}

function photoTile(p, deletable = true) {
  return `<div class="photo" data-photo="${p.id}">
    ${p.src ? `<img class="photo__img" src="${esc(p.src)}" alt="${esc(p.title)}">` :
      `<div class="photo__ph" style="background:linear-gradient(150deg,var(--surface-2),var(--surface-3))">${esc(S.fmtShort(p.date))}</div>`}
    <div class="photo__meta"><b>${esc(p.title)}</b><span>${esc(S.fmtDate(p.date))}</span></div>
    ${deletable ? `<button class="photo__del" data-del="${p.id}" title="Sil">${icon("trash", 14)}</button>` : ""}
  </div>`;
}

/* ------------------------------------------------------------
   2) ANTRENMANLAR
   ------------------------------------------------------------ */
export function workouts(ctx) {
  const id = ctx.user.id;
  const all = S.workoutsOf(id);
  const filter = ctx.query.g || "all";
  const list = filter === "all" ? all : all.filter((w) => w.group === filter);
  const groups = S.groupDistribution(id, 3650);

  const html = `
  <div class="page-head">
    <div><h1>Antrenmanlarım</h1>
      <p>Antrenörünün sisteme girdiği tüm setler ve tekrarlar</p></div>
    <div class="page-head__actions">
      <span class="badge badge--orange">${all.length} kayıt</span>
      <span class="badge badge--green">${S.streak(id)} gün seri</span>
    </div>
  </div>

  <div class="grid dash">
    <div class="card c3">
      <div class="card__head"><span class="card__title">${icon("dumbbell")} Kas Grupları</span></div>
      <div class="stack">
        <a class="member-pick ${filter === "all" ? "is-active" : ""}" href="#/workouts">
          <span class="list__ico">${icon("home", 16)}</span><div class="list__body"><b>Tümü</b><span>${all.length} antrenman</span></div></a>
        ${groups.map((g) => `
          <a class="member-pick ${filter === g.id ? "is-active" : ""}" href="#/workouts?g=${g.id}">
            <span class="list__ico">${icon("dumbbell", 16)}</span>
            <div class="list__body"><b>${esc(g.name)}</b><span>${g.count} antrenman</span></div></a>`).join("")}
      </div>
    </div>

    <div class="card c9">
      <div class="card__head">
        <span class="card__title">${icon("clipboard")} ${filter === "all" ? "Antrenman Günlüğü" : GNAME(filter) + " Günlüğü"}</span>
        <span class="card__sub">${list.length} kayıt</span>
      </div>
      <div class="stack">
        ${list.length ? list.slice(0, 40).map((w, i) => workoutCard(w, i)).join("") : `<div class="empty"><b>Kayıt yok</b>Bu kas grubunda henüz antrenman girilmemiş.</div>`}
      </div>
    </div>
  </div>`;

  const mount = (root) => {
    root.querySelectorAll("[data-toggle-w]").forEach((h) => {
      h.addEventListener("click", () => {
        const body = h.parentElement.querySelector("[data-wbody]");
        body.style.display = body.style.display === "none" ? "" : "none";
      });
    });
  };
  return { html, mount };
}

function workoutCard(w, index = 0) {
  const volume = w.exercises.reduce((s, e) => s + e.sets.reduce((v, st) => v + st.reps * st.weight, 0), 0);
  return `<div class="exercise">
    <div class="row wrap" data-toggle-w style="cursor:pointer">
      <span class="event__date"><b>${new Date(w.date).getDate()}</b><span>${S.fmtShort(w.date).split(" ")[1]}</span></span>
      <div style="flex:1;min-width:160px">
        <b style="font-size:15px">${esc(GNAME(w.group))}</b>
        <div class="small muted">${esc(S.dayName(w.date))} · ${w.duration} dk · ${w.exercises.length} hareket · RPE ${w.rpe || "-"}</div>
      </div>
      <span class="badge badge--orange">${(volume / 1000).toFixed(1)} ton</span>
      ${icon("chevron", 16)}
    </div>
    <div data-wbody class="mt-4" ${index > 0 ? 'style="display:none"' : ""}>
      ${w.exercises.map((e) => `
        <div class="mt-3">
          <div class="row row--between">
            <b>${esc(e.name)}</b>
            <span class="small muted">${e.sets.length} set</span>
          </div>
          <div class="sets">
            ${e.sets.map((s, i) => `<span class="set-chip"><span>${i + 1}.</span> <b>${s.reps}</b> tekrar ${s.weight ? `× <b>${s.weight}</b> kg` : ""}</span>`).join("")}
          </div>
          ${e.note ? `<div class="small muted mt-2">${icon("info", 12)} ${esc(e.note)}</div>` : ""}
        </div>`).join("")}
      ${w.note ? `<div class="notice mt-4" style="background:var(--orange-soft);color:var(--orange-2)">${icon("info", 16)} <span>${esc(w.note)}</span></div>` : ""}
    </div>
  </div>`;
}

/* ------------------------------------------------------------
   3) BESLENME
   ------------------------------------------------------------ */
export function nutrition(ctx) {
  const id = ctx.user.id;
  const date = ctx.query.d || S.today();
  const entry = S.nutritionOf(id, date);
  const tot = S.nutritionTotals(entry);
  const range = S.nutritionRange(id).slice(-14);
  const T = S.DAILY_TARGET;

  const html = `
  <div class="page-head">
    <div><h1>Beslenme Takibi</h1><p>${esc(S.fmtDate(date))} · ${esc(S.relative(date))}</p></div>
    <div class="page-head__actions">
      <input type="date" class="btn" value="${date}" data-date style="padding:9px 14px">
      <button class="btn btn--primary" data-add>${icon("plus", 16)} Öğün Ekle</button>
    </div>
  </div>

  <div class="grid dash">
    <div class="card card--accent c4">
      <div class="card__head"><span class="card__title">${icon("flame")} Günlük Kalori</span></div>
      <div class="big-num" style="font-size:42px">${tot.kcal}</div>
      <div class="small">Hedef ${T.kcal} kcal</div>
      <div class="bar mt-4"><i style="width:${Math.min(100, (tot.kcal / T.kcal) * 100)}%"></i></div>
      <div class="row row--between mt-3 small">
        <span>${tot.kcal > T.kcal ? "Hedef aşıldı" : `${T.kcal - tot.kcal} kcal kaldı`}</span>
        <span>${Math.round((tot.kcal / T.kcal) * 100)}%</span>
      </div>
      <div class="row row--between mt-5" style="border-top:1px solid rgba(255,255,255,.18);padding-top:14px">
        <div><b>${Math.round(tot.protein)}g</b><div class="small">Protein</div></div>
        <div><b>${Math.round(tot.carb)}g</b><div class="small">Karbonhidrat</div></div>
        <div><b>${Math.round(tot.fat)}g</b><div class="small">Yağ</div></div>
      </div>
    </div>

    <div class="card c4">
      <div class="card__head"><span class="card__title">${icon("target")} Makro Dağılımı</span></div>
      ${macroRow("Protein", tot.protein, T.protein, "#f05a1e")}
      ${macroRow("Karbonhidrat", tot.carb, T.carb, "#ffc555")}
      ${macroRow("Yağ", tot.fat, T.fat, "#5aa9ff")}
      <div class="mt-4">${stackBar([
        { label: "P", value: tot.protein * 4, color: "#f05a1e" },
        { label: "K", value: tot.carb * 4, color: "#ffc555" },
        { label: "Y", value: tot.fat * 9, color: "#5aa9ff" },
      ])}</div>
      <div class="legend mt-3">
        <span><i style="background:#f05a1e"></i>Protein</span>
        <span><i style="background:#ffc555"></i>Karbonhidrat</span>
        <span><i style="background:#5aa9ff"></i>Yağ</span>
      </div>
    </div>

    <div class="card c4">
      <div class="card__head"><span class="card__title">${icon("water")} Su</span></div>
      <div class="row" style="justify-content:center">
        ${ring(((entry?.water || 0) / T.water) * 100, { value: `${(entry?.water || 0).toFixed(2)}`, label: `/ ${T.water} litre`, color: "#5aa9ff", track: "var(--surface-3)" })}
      </div>
      <div class="row mt-4" style="gap:8px;justify-content:center">
        <button class="btn btn--sm" data-w="-0.25">− 250 ml</button>
        <button class="btn btn--sm btn--primary" data-w="0.25">+ 250 ml</button>
        <button class="btn btn--sm" data-w="0.5">+ 500 ml</button>
      </div>
    </div>

    <div class="card c7">
      <div class="card__head"><span class="card__title">${icon("apple")} Öğünler</span>
        <span class="card__sub">${entry?.meals.length || 0} kayıt</span></div>
      <div class="list">
        ${entry?.meals.length ? entry.meals.map((m) => `
          <div class="list__item">
            <span class="list__ico">${icon("apple")}</span>
            <div class="list__body">
              <b>${esc(m.name)}</b>
              <span>${esc(m.type)} · P ${m.protein}g · K ${m.carb}g · Y ${m.fat}g</span>
            </div>
            <b>${m.kcal} kcal</b>
            <button class="icon-btn" data-delmeal="${m.id}" title="Sil">${icon("trash", 15)}</button>
          </div>`).join("") : `<div class="empty"><b>Öğün girilmemiş</b>Bu güne ait beslenme kaydı yok.</div>`}
      </div>
    </div>

    <div class="card c5">
      <div class="card__head"><span class="card__title">${icon("chart")} Kalori Trendi</span>
        <span class="badge">Son 14 gün</span></div>
      ${lineChart(range.map((n) => ({ label: S.fmtShort(n.date), value: S.nutritionTotals(n).kcal })), { height: 190 })}
      <div class="row row--between small muted mt-3">
        <span>Ortalama: <b style="color:var(--text)">${Math.round(range.reduce((s, n) => s + S.nutritionTotals(n).kcal, 0) / Math.max(1, range.length))} kcal</b></span>
        <span>Hedef: <b style="color:var(--text)">${T.kcal} kcal</b></span>
      </div>
    </div>
  </div>`;

  const mount = (root) => {
    root.querySelector("[data-date]").addEventListener("change", (e) => {
      location.hash = `#/nutrition?d=${e.target.value}`;
    });
    root.querySelectorAll("[data-w]").forEach((b) => b.addEventListener("click", () => {
      const d = S.load();
      let en = d.nutrition.find((n) => n.memberId === id && n.date === date);
      if (!en) { en = { id: S.newId("n"), memberId: id, date, water: 0, meals: [] }; d.nutrition.push(en); }
      en.water = Math.max(0, +(en.water + parseFloat(b.dataset.w)).toFixed(2));
      S.save(); ctx.rerender();
    }));
    root.querySelectorAll("[data-delmeal]").forEach((b) => b.addEventListener("click", () => {
      const en = S.nutritionOf(id, date);
      en.meals = en.meals.filter((m) => m.id !== b.dataset.delmeal);
      S.save(); toast("Öğün silindi"); ctx.rerender();
    }));
    root.querySelector("[data-add]").addEventListener("click", () => openMealModal(id, date, ctx));
  };
  return { html, mount };
}

function openMealModal(id, date, ctx) {
  openModal(modalShell("Öğün Ekle", `
    <div class="field"><label>Öğün tipi</label>
      <select id="m-type">${S.MEAL_TYPES.map((t) => `<option>${t}</option>`).join("")}</select></div>
    <div class="field"><label>Ne yedin?</label><input id="m-name" placeholder="Örn. Izgara tavuk + pirinç"></div>
    <div class="row" style="gap:10px">
      <div class="field" style="flex:1"><label>Kalori</label><input id="m-kcal" type="number" min="0" value="400"></div>
      <div class="field" style="flex:1"><label>Protein (g)</label><input id="m-p" type="number" min="0" value="30"></div>
    </div>
    <div class="row" style="gap:10px">
      <div class="field" style="flex:1"><label>Karbonhidrat (g)</label><input id="m-c" type="number" min="0" value="40"></div>
      <div class="field" style="flex:1"><label>Yağ (g)</label><input id="m-f" type="number" min="0" value="12"></div>
    </div>`,
    `<button class="btn" data-close>Vazgeç</button><button class="btn btn--primary" id="m-save">Kaydet</button>`, "apple"),
    { onMount: (m) => {
      m.querySelector("#m-save").addEventListener("click", () => {
        const name = m.querySelector("#m-name").value.trim();
        if (!name) return toast("Öğün adı gerekli", "err");
        const d = S.load();
        let en = d.nutrition.find((n) => n.memberId === id && n.date === date);
        if (!en) { en = { id: S.newId("n"), memberId: id, date, water: 0, meals: [] }; d.nutrition.push(en); }
        en.meals.push({
          id: S.newId("ml"), type: m.querySelector("#m-type").value, name,
          kcal: +m.querySelector("#m-kcal").value || 0,
          protein: +m.querySelector("#m-p").value || 0,
          carb: +m.querySelector("#m-c").value || 0,
          fat: +m.querySelector("#m-f").value || 0,
        });
        S.save(); closeModal(); toast("Öğün eklendi", "ok"); ctx.rerender();
      });
    } });
}

/* ------------------------------------------------------------
   4) GELİŞİM / ÖLÇÜM
   ------------------------------------------------------------ */
export function progress(ctx) {
  const id = ctx.user.id;
  const ms = S.measuresOf(id);
  const last = ms[ms.length - 1] || {};
  const prev = ms[ms.length - 2] || last;
  const first = ms[0] || last;
  const b = S.bmi(id);
  const prof = S.memberProfile(id);
  const metric = ctx.query.m || "weight";
  const METRICS = [
    { k: "weight", n: "Kilo", u: "kg", c: "#f05a1e" },
    { k: "fat", n: "Yağ Oranı", u: "%", c: "#ffc555" },
    { k: "muscle", n: "Kas Oranı", u: "%", c: "#b6f24a" },
    { k: "waist", n: "Bel", u: "cm", c: "#5aa9ff" },
    { k: "chest", n: "Göğüs", u: "cm", c: "#ff8a3d" },
    { k: "arm", n: "Kol", u: "cm", c: "#c084fc" },
  ];
  const cur = METRICS.find((x) => x.k === metric) || METRICS[0];

  const delta = (k) => +( (last[k] ?? 0) - (prev[k] ?? 0) ).toFixed(1);
  const total = (k) => +( (last[k] ?? 0) - (first[k] ?? 0) ).toFixed(1);

  const html = `
  <div class="page-head">
    <div><h1>Gelişim & Ölçüm</h1><p>Boy ${prof?.height || "-"} cm · Son ölçüm ${last.date ? S.fmtDate(last.date) : "-"}</p></div>
    <div class="page-head__actions">
      <button class="btn btn--primary" data-add>${icon("plus", 16)} Yeni Ölçüm</button>
    </div>
  </div>

  <div class="grid dash">
    ${METRICS.slice(0, 4).map((m) => `
      <a class="card c3" href="#/progress?m=${m.k}" style="${metric === m.k ? "border-color:var(--orange-line)" : ""}">
        <div class="row row--between">
          <span class="card__title" style="font-size:13px">${esc(m.n)}</span>
          <span class="badge ${delta(m.k) === 0 ? "" : (m.k === "muscle" ? (delta(m.k) > 0 ? "badge--green" : "badge--red") : (delta(m.k) < 0 ? "badge--green" : "badge--red"))}">
            ${delta(m.k) > 0 ? "+" : ""}${delta(m.k)}${m.u}
          </span>
        </div>
        <div class="big-num mt-3">${last[m.k] ?? "-"}<span class="small muted"> ${m.u}</span></div>
        <div class="small muted mt-2">Başlangıçtan ${total(m.k) > 0 ? "+" : ""}${total(m.k)} ${m.u}</div>
      </a>`).join("")}

    <div class="card c8">
      <div class="card__head">
        <span class="card__title">${icon("chart")} ${esc(cur.n)} Değişimi</span>
        <div class="segment">
          ${METRICS.map((m) => `<button class="${metric === m.k ? "is-active" : ""}" data-metric="${m.k}">${esc(m.n)}</button>`).join("")}
        </div>
      </div>
      ${lineChart(ms.map((m) => ({ label: S.fmtShort(m.date), value: m[cur.k] })), { height: 240, stroke: cur.c, fill: cur.c + "2b" })}
    </div>

    <div class="card c4">
      <div class="card__head"><span class="card__title">${icon("scale")} Vücut Kitle İndeksi</span></div>
      <div class="row" style="justify-content:center">
        ${b ? gauge(Math.min(100, ((b.value - 15) / 20) * 100), { value: b.value, label: bmiLabel(b.value), size: 190 }) : ""}
      </div>
      <div class="small muted mt-4">BMI = kilo (kg) / boy (m)²</div>
      <div class="row row--between mt-3 small"><span class="muted">Zayıf</span><span class="muted">Normal</span><span class="muted">Fazla</span><span class="muted">Obez</span></div>
      <div class="bar mt-2"><i style="width:${Math.min(100, ((b?.value || 20) / 40) * 100)}%"></i></div>
    </div>

    <div class="card c12">
      <div class="card__head"><span class="card__title">${icon("clipboard")} Ölçüm Geçmişi</span>
        <span class="card__sub">${ms.length} kayıt</span></div>
      <div class="table-wrap">
        <table>
          <thead><tr><th>Tarih</th><th>Kilo</th><th>Yağ %</th><th>Kas %</th><th>Bel</th><th>Göğüs</th><th>Kol</th><th></th></tr></thead>
          <tbody>
            ${[...ms].reverse().map((m) => `
              <tr>
                <td><b>${esc(S.fmtDate(m.date))}</b><div class="small muted">${esc(S.relative(m.date))}</div></td>
                <td>${m.weight} kg</td><td>${m.fat}%</td><td>${m.muscle}%</td>
                <td>${m.waist} cm</td><td>${m.chest} cm</td><td>${m.arm} cm</td>
                <td style="text-align:right"><button class="icon-btn" data-delms="${m.id}">${icon("trash", 15)}</button></td>
              </tr>`).join("")}
          </tbody>
        </table>
      </div>
    </div>
  </div>`;

  const mount = (root) => {
    root.querySelectorAll("[data-metric]").forEach((b2) =>
      b2.addEventListener("click", () => { location.hash = `#/progress?m=${b2.dataset.metric}`; }));
    root.querySelectorAll("[data-delms]").forEach((b2) =>
      b2.addEventListener("click", () => confirmDialog("Ölçümü sil", "Bu ölçüm kaydı kalıcı olarak silinecek.", () => {
        const d = S.load();
        d.measures = d.measures.filter((x) => x.id !== b2.dataset.delms);
        S.save(); toast("Ölçüm silindi"); ctx.rerender();
      }, "Sil")));
    root.querySelector("[data-add]").addEventListener("click", () => {
      openModal(modalShell("Yeni Ölçüm", `
        <div class="field"><label>Tarih</label><input id="ms-date" type="date" value="${S.today()}"></div>
        <div class="row" style="gap:10px">
          <div class="field" style="flex:1"><label>Kilo (kg)</label><input id="ms-w" type="number" step="0.1" value="${last.weight || 70}"></div>
          <div class="field" style="flex:1"><label>Yağ oranı (%)</label><input id="ms-f" type="number" step="0.1" value="${last.fat || 22}"></div>
        </div>
        <div class="row" style="gap:10px">
          <div class="field" style="flex:1"><label>Kas oranı (%)</label><input id="ms-m" type="number" step="0.1" value="${last.muscle || 33}"></div>
          <div class="field" style="flex:1"><label>Bel (cm)</label><input id="ms-wa" type="number" step="0.1" value="${last.waist || 80}"></div>
        </div>
        <div class="row" style="gap:10px">
          <div class="field" style="flex:1"><label>Göğüs (cm)</label><input id="ms-c" type="number" step="0.1" value="${last.chest || 95}"></div>
          <div class="field" style="flex:1"><label>Kol (cm)</label><input id="ms-a" type="number" step="0.1" value="${last.arm || 32}"></div>
        </div>`,
        `<button class="btn" data-close>Vazgeç</button><button class="btn btn--primary" id="ms-save">Kaydet</button>`, "scale"),
        { onMount: (m) => m.querySelector("#ms-save").addEventListener("click", () => {
          const d = S.load();
          d.measures.push({
            id: S.newId("ms"), memberId: id, date: m.querySelector("#ms-date").value,
            weight: +m.querySelector("#ms-w").value, fat: +m.querySelector("#ms-f").value,
            muscle: +m.querySelector("#ms-m").value, waist: +m.querySelector("#ms-wa").value,
            chest: +m.querySelector("#ms-c").value, arm: +m.querySelector("#ms-a").value,
          });
          S.save(); closeModal(); toast("Ölçüm kaydedildi", "ok"); ctx.rerender();
        }) });
    });
  };
  return { html, mount };
}

/* ------------------------------------------------------------
   5) DERS PROGRAMI + ERTELEME/İPTAL TALEBİ
   ------------------------------------------------------------ */
export function schedule(ctx) {
  const id = ctx.user.id;
  const all = S.sessionsOf(id);
  const upcoming = all.filter((s) => s.date >= S.today() && s.status === "planned");
  const past = all.filter((s) => s.date < S.today() || s.status !== "planned").reverse();
  const reqs = S.requestsOf(id);
  const cal = buildCalendar(all);

  const html = `
  <div class="page-head">
    <div><h1>Ders Programı</h1><p>Yaklaşan seanslarını görüntüle, erteleme veya iptal talebi oluştur</p></div>
    <div class="page-head__actions">
      <span class="badge badge--orange">${upcoming.length} planlı ders</span>
      ${reqs.filter((r) => r.status === "pending").length ? `<span class="badge badge--yellow">${reqs.filter((r) => r.status === "pending").length} bekleyen talep</span>` : ""}
    </div>
  </div>

  <div class="grid dash">
    <div class="card c4">
      <div class="card__head"><span class="card__title">${icon("calendar")} ${esc(cal.title)}</span></div>
      <div class="calendar">
        ${["Pt","Sa","Ça","Pe","Cu","Ct","Pa"].map((d) => `<div class="calendar__dow">${d}</div>`).join("")}
        ${cal.cells.map((c) => `
          <div class="calendar__day ${c.off ? "is-off" : ""} ${c.today ? "is-today" : ""}">
            ${c.day}${c.has ? "<i></i>" : ""}
          </div>`).join("")}
      </div>
      <div class="legend mt-4"><span><i style="background:var(--orange)"></i>Ders günü</span></div>
    </div>

    <div class="card c8">
      <div class="card__head"><span class="card__title">${icon("clock")} Yaklaşan Dersler</span></div>
      <div class="stack">
        ${upcoming.length ? upcoming.map((s) => `
          <div class="exercise">
            <div class="row wrap">
              <span class="event__date"><b>${new Date(s.date).getDate()}</b><span>${S.fmtShort(s.date).split(" ")[1]}</span></span>
              <div style="flex:1;min-width:170px">
                <b style="font-size:15px">${esc(s.type)}</b>
                <div class="small muted">${esc(S.dayName(s.date))} · ${esc(s.time)} · ${esc(s.room)} · ${esc(GNAME(s.group))}</div>
              </div>
              <span class="badge badge--green">${esc(S.relative(s.date))}</span>
              <button class="btn btn--sm" data-postpone="${s.id}">${icon("clock", 14)} Ertele</button>
              <button class="btn btn--sm btn--danger" data-cancel="${s.id}">${icon("close", 14)} İptal</button>
            </div>
          </div>`).join("") : `<div class="empty"><b>Planlı ders yok</b>Antrenörün yeni ders planladığında burada görünecek.</div>`}
      </div>
    </div>

    <div class="card c6">
      <div class="card__head"><span class="card__title">${icon("send")} Taleplerim</span></div>
      <div class="list">
        ${reqs.length ? reqs.map((r) => {
          const s = S.load().sessions.find((x) => x.id === r.sessionId);
          return `<div class="list__item">
            <span class="list__ico">${icon(r.type === "cancel" ? "close" : "clock")}</span>
            <div class="list__body">
              <b>${r.type === "cancel" ? "İptal talebi" : "Erteleme talebi"}${s ? ` · ${S.fmtShort(s.date)} ${s.time}` : ""}</b>
              <span>${esc(r.reason)}${r.newDate ? ` → ${S.fmtShort(r.newDate)} ${esc(r.newTime)}` : ""}</span>
              ${r.response ? `<span style="color:var(--text-2)">Yanıt: ${esc(r.response)}</span>` : ""}
            </div>
            <span class="badge ${r.status === "approved" ? "badge--green" : r.status === "rejected" ? "badge--red" : "badge--yellow"}">
              ${r.status === "approved" ? "Onaylandı" : r.status === "rejected" ? "Reddedildi" : "Beklemede"}
            </span>
          </div>`;
        }).join("") : `<div class="empty">Henüz talep oluşturmadın</div>`}
      </div>
    </div>

    <div class="card c6">
      <div class="card__head"><span class="card__title">${icon("clipboard")} Geçmiş Dersler</span></div>
      <div class="table-wrap">
        <table>
          <thead><tr><th>Tarih</th><th>Ders</th><th>Kas grubu</th><th>Durum</th></tr></thead>
          <tbody>
            ${past.slice(0, 12).map((s) => `<tr>
              <td>${esc(S.fmtShort(s.date))} · ${esc(s.time)}</td>
              <td>${esc(s.type)}</td>
              <td>${esc(GNAME(s.group))}</td>
              <td><span class="badge ${s.status === "done" ? "badge--green" : s.status === "cancelled" ? "badge--red" : "badge--yellow"}">
                ${s.status === "done" ? "Tamamlandı" : s.status === "cancelled" ? "İptal" : s.status === "postponed" ? "Ertelendi" : "Planlı"}</span></td>
            </tr>`).join("") || `<tr><td colspan="4" class="muted">Kayıt yok</td></tr>`}
          </tbody>
        </table>
      </div>
    </div>
  </div>`;

  const mount = (root) => {
    root.querySelectorAll("[data-postpone]").forEach((b) =>
      b.addEventListener("click", () => requestModal(ctx, b.dataset.postpone, "postpone")));
    root.querySelectorAll("[data-cancel]").forEach((b) =>
      b.addEventListener("click", () => requestModal(ctx, b.dataset.cancel, "cancel")));
  };
  return { html, mount };
}

function requestModal(ctx, sessionId, type) {
  const s = S.load().sessions.find((x) => x.id === sessionId);
  const isCancel = type === "cancel";
  openModal(modalShell(isCancel ? "Ders İptal Talebi" : "Ders Erteleme Talebi", `
    <div class="notice mt-2" style="background:var(--surface-2)">
      ${icon("calendar", 16)} <span>${esc(S.fmtDate(s.date))} · ${esc(s.time)} · ${esc(s.type)}</span>
    </div>
    ${isCancel ? "" : `
    <div class="row mt-4" style="gap:10px">
      <div class="field" style="flex:1"><label>Yeni tarih</label><input id="rq-date" type="date" min="${S.today()}" value="${S.addDays(new Date(), 2)}"></div>
      <div class="field" style="flex:1"><label>Yeni saat</label>
        <select id="rq-time">${["07:30","09:00","12:00","18:00","19:30","21:00"].map((t) => `<option ${t === s.time ? "selected" : ""}>${t}</option>`).join("")}</select></div>
    </div>`}
    <div class="field mt-3"><label>Gerekçe</label>
      <textarea id="rq-reason" placeholder="${isCancel ? "İptal nedenini kısaca yaz" : "Erteleme nedenini kısaca yaz"}"></textarea></div>
    <p class="small muted">Talebin antrenörüne iletilecek ve onaylandığında bildirim alacaksın.</p>`,
    `<button class="btn" data-close>Vazgeç</button>
     <button class="btn ${isCancel ? "btn--danger" : "btn--primary"}" id="rq-save">Talebi Gönder</button>`, isCancel ? "close" : "clock"),
    { onMount: (m) => m.querySelector("#rq-save").addEventListener("click", () => {
      const reason = m.querySelector("#rq-reason").value.trim();
      if (!reason) return toast("Lütfen bir gerekçe yaz", "err");
      const d = S.load();
      d.requests.push({
        id: S.newId("rq"), memberId: ctx.user.id, sessionId, type, reason,
        newDate: isCancel ? "" : m.querySelector("#rq-date").value,
        newTime: isCancel ? "" : m.querySelector("#rq-time").value,
        status: "pending", createdAt: S.today(), response: "",
      });
      S.save(); closeModal();
      toast(isCancel ? "İptal talebin gönderildi" : "Erteleme talebin gönderildi", "ok");
      ctx.rerender();
    }) });
}

function buildCalendar(sessions) {
  const now = new Date();
  const y = now.getFullYear(), mo = now.getMonth();
  const firstDow = (new Date(y, mo, 1).getDay() + 6) % 7;
  const days = new Date(y, mo + 1, 0).getDate();
  const set = new Set(sessions.map((s) => s.date));
  const cells = [];
  const prevDays = new Date(y, mo, 0).getDate();
  for (let i = firstDow - 1; i >= 0; i--) cells.push({ day: prevDays - i, off: true, has: false, today: false });
  for (let d = 1; d <= days; d++) {
    const ds = S.iso(new Date(y, mo, d));
    cells.push({ day: d, off: false, has: set.has(ds), today: ds === S.today() });
  }
  while (cells.length % 7) cells.push({ day: cells.length - firstDow - days + 1, off: true, has: false, today: false });
  return { title: now.toLocaleDateString("tr-TR", { month: "long", year: "numeric" }), cells };
}

/* ------------------------------------------------------------
   6) ÜYELİK
   ------------------------------------------------------------ */
export function membership(ctx) {
  const id = ctx.user.id;
  const pkg = S.packageOf(id);
  const prof = S.memberProfile(id);
  const sessions = S.sessionsOf(id);
  const doneCount = sessions.filter((s) => s.status === "done").length;
  const daysLeft = pkg ? S.daysBetween(S.today(), pkg.end) : 0;
  const totalDays = pkg ? S.daysBetween(pkg.start, pkg.end) : 1;

  const html = `
  <div class="page-head">
    <div><h1>Üyeliğim</h1><p>Paket durumu, ödeme geçmişi ve üyelik bilgilerin</p></div>
    <div class="page-head__actions">
      <button class="btn" data-freeze>${icon("timer", 16)} Dondurma Talebi</button>
      <button class="btn btn--primary" data-renew>${icon("refresh", 16)} Paket Yenile</button>
    </div>
  </div>

  <div class="grid dash">
    <div class="card card--accent c5">
      <div class="card__head"><span class="card__title">${icon("ticket")} Aktif Paket</span>
        <span class="badge" style="background:rgba(0,0,0,.22);color:#fff">${daysLeft > 0 ? "Aktif" : "Süresi doldu"}</span></div>
      <h2 style="font-size:24px;font-weight:600;letter-spacing:-.02em">${esc(pkg?.name || "-")}</h2>
      <div class="small mt-2">${pkg ? `${S.fmtDate(pkg.start)} — ${S.fmtDate(pkg.end)}` : ""}</div>
      <div class="bar mt-5"><i style="width:${Math.min(100, ((totalDays - daysLeft) / totalDays) * 100)}%"></i></div>
      <div class="row row--between mt-3 small"><span>${Math.max(0, totalDays - daysLeft)} gün geçti</span><span>${Math.max(0, daysLeft)} gün kaldı</span></div>
      <div class="row row--between mt-5" style="border-top:1px solid rgba(255,255,255,.2);padding-top:16px">
        <div><div class="big-num">${pkg?.total ? pkg.total - pkg.used : "∞"}</div><span class="small">Kalan seans</span></div>
        <div><div class="big-num">${pkg?.used ?? 0}</div><span class="small">Kullanılan</span></div>
        <div><div class="big-num">${pkg?.freeze ?? 0}</div><span class="small">Dondurma hakkı</span></div>
      </div>
    </div>

    <div class="card c3">
      <div class="card__head"><span class="card__title">${icon("target")} Seans Kullanımı</span></div>
      <div class="row" style="justify-content:center">
        ${ring(pkg?.total ? (pkg.used / pkg.total) * 100 : 60, {
          value: pkg?.total ? `${Math.round((pkg.used / pkg.total) * 100)}%` : "∞",
          label: "Kullanıldı", track: "var(--surface-3)" })}
      </div>
      <div class="row row--between mt-4 small"><span class="muted">Tamamlanan ders</span><b>${doneCount}</b></div>
      <div class="row row--between mt-2 small"><span class="muted">Üyelik başlangıcı</span><b>${esc(S.fmtShort(prof?.joined || ""))}</b></div>
    </div>

    <div class="card c4">
      <div class="card__head"><span class="card__title">${icon("user")} Üyelik Bilgileri</span></div>
      <div class="list">
        ${[["Ad Soyad", ctx.user.name], ["E-posta", ctx.user.email], ["Telefon", prof?.phone],
           ["Doğum tarihi", prof?.birth ? S.fmtDate(prof.birth) : "-"], ["Boy", prof?.height + " cm"],
           ["Hedef", prof?.goal], ["Antrenör", S.userById(prof?.trainerId)?.name]]
          .map(([k, v]) => `<div class="list__item"><div class="list__body"><span>${esc(k)}</span><b>${esc(v || "-")}</b></div></div>`).join("")}
      </div>
    </div>

    <div class="card c12">
      <div class="card__head"><span class="card__title">${icon("clipboard")} Ödeme Geçmişi</span></div>
      <div class="table-wrap">
        <table>
          <thead><tr><th>Tarih</th><th>Açıklama</th><th>Tutar</th><th>Yöntem</th><th>Durum</th></tr></thead>
          <tbody>
            <tr><td>${esc(S.fmtDate(pkg?.start || S.today()))}</td><td>${esc(pkg?.name || "-")} — peşinat</td>
              <td>${tl(Math.round((pkg?.paid || 0) / 2))}</td><td>Kredi kartı</td><td><span class="badge badge--green">Ödendi</span></td></tr>
            <tr><td>${esc(S.fmtShort(S.addDays(pkg?.start || S.today(), 30)))}</td><td>2. taksit</td>
              <td>${tl(Math.round((pkg?.paid || 0) / 2))}</td><td>Havale</td><td><span class="badge badge--green">Ödendi</span></td></tr>
            ${pkg && pkg.paid < pkg.price ? `<tr><td>${esc(S.fmtDate(pkg.end))}</td><td>Kalan bakiye</td>
              <td>${tl(pkg.price - pkg.paid)}</td><td>-</td><td><span class="badge badge--red">Bekliyor</span></td></tr>` : ""}
          </tbody>
        </table>
      </div>
      <div class="row row--between mt-4" style="border-top:1px solid var(--line-soft);padding-top:14px">
        <span class="muted">Toplam paket bedeli</span>
        <b style="font-size:18px">${tl(pkg?.price || 0)}</b>
      </div>
    </div>
  </div>`;

  const mount = (root) => {
    root.querySelector("[data-renew]").addEventListener("click", () =>
      sendTrainerRequest(ctx, "Paket yenileme talebi", "Üyelik paketimi yenilemek istiyorum."));
    root.querySelector("[data-freeze]").addEventListener("click", () =>
      sendTrainerRequest(ctx, "Üyelik dondurma talebi", "Üyeliğimi belirli bir süre dondurmak istiyorum."));
  };
  return { html, mount };
}

function sendTrainerRequest(ctx, title, placeholder) {
  openModal(modalShell(title, `
    <div class="field"><label>Mesajın</label><textarea id="tr-msg" placeholder="${esc(placeholder)}"></textarea></div>
    <p class="small muted">Talebin antrenörünün panelinde görünecek.</p>`,
    `<button class="btn" data-close>Vazgeç</button><button class="btn btn--primary" id="tr-send">Gönder</button>`, "send"),
    { onMount: (m) => m.querySelector("#tr-send").addEventListener("click", () => {
      const msg = m.querySelector("#tr-msg").value.trim() || placeholder;
      const d = S.load();
      d.requests.push({
        id: S.newId("rq"), memberId: ctx.user.id, sessionId: null, type: "package",
        reason: `${title}: ${msg}`, newDate: "", newTime: "",
        status: "pending", createdAt: S.today(), response: "",
      });
      S.save(); closeModal(); toast("Talebin iletildi", "ok");
    }) });
}

/* ------------------------------------------------------------
   7) ETKİNLİKLER
   ------------------------------------------------------------ */
export function events(ctx) {
  const id = ctx.user.id;
  const all = S.load().events.slice().sort((a, b) => a.date.localeCompare(b.date));
  const upcoming = all.filter((e) => e.date >= S.today());
  const past = all.filter((e) => e.date < S.today()).reverse();
  const mine = upcoming.filter((e) => e.attendees.includes(id));

  const card = (e, isPast) => `
    <div class="card ${isPast ? "card--flat" : ""} c4">
      <div class="row" style="align-items:flex-start;gap:14px">
        <div class="event__date" style="background:${e.cover}22;color:${e.cover}">
          <b>${new Date(e.date).getDate()}</b><span>${S.fmtShort(e.date).split(" ")[1]}</span>
        </div>
        <div style="flex:1;min-width:0">
          <b style="font-size:15px">${esc(e.title)}</b>
          <div class="small muted mt-2">${icon("clock", 12)} ${esc(e.time)} · ${icon("home", 12)} ${esc(e.place)}</div>
        </div>
      </div>
      <p class="small muted mt-4">${esc(e.desc)}</p>
      <div class="row row--between mt-4">
        <span class="badge ${e.attendees.length >= e.capacity ? "badge--red" : "badge--green"}">
          ${icon("users", 12)} ${e.attendees.length}/${e.capacity} kişi
        </span>
        ${isPast ? `<span class="badge">Tamamlandı</span>` :
          e.attendees.includes(id)
            ? `<button class="btn btn--sm" data-leave="${e.id}">${icon("close", 14)} Kaydı iptal et</button>`
            : `<button class="btn btn--sm btn--primary" data-join="${e.id}" ${e.attendees.length >= e.capacity ? "disabled" : ""}>${icon("check", 14)} Katıl</button>`}
      </div>
    </div>`;

  const html = `
  <div class="page-head">
    <div><h1>Salon Etkinlikleri</h1><p>MPT topluluğunun etkinliklerine katıl</p></div>
    <div class="page-head__actions">
      <span class="badge badge--orange">${upcoming.length} yaklaşan</span>
      <span class="badge badge--green">${mine.length} kaydım</span>
    </div>
  </div>

  <div class="grid dash">
    ${upcoming.length ? upcoming.map((e) => card(e, false)).join("") : `<div class="card c12"><div class="empty"><b>Yaklaşan etkinlik yok</b>Yeni etkinlikler eklendiğinde burada göreceksin.</div></div>`}
    ${past.length ? `<div class="c12" style="margin-top:8px"><h3 style="font-size:16px;font-weight:600">Geçmiş Etkinlikler</h3></div>` : ""}
    ${past.map((e) => card(e, true)).join("")}
  </div>`;

  const mount = (root) => {
    root.querySelectorAll("[data-join]").forEach((b) => b.addEventListener("click", () => {
      const e = S.load().events.find((x) => x.id === b.dataset.join);
      e.attendees.push(id); S.save(); toast("Etkinliğe kaydoldun", "ok"); ctx.rerender();
    }));
    root.querySelectorAll("[data-leave]").forEach((b) => b.addEventListener("click", () => {
      const e = S.load().events.find((x) => x.id === b.dataset.leave);
      e.attendees = e.attendees.filter((a) => a !== id); S.save(); toast("Kaydın iptal edildi"); ctx.rerender();
    }));
  };
  return { html, mount };
}

/* ------------------------------------------------------------
   8) FOTOĞRAF ALBÜMÜ
   ------------------------------------------------------------ */
export function gallery(ctx) {
  const id = ctx.user.id;
  const photos = S.photosOf(id);

  const html = `
  <div class="page-head">
    <div><h1>Fotoğraf Albümüm</h1><p>Gelişimini görsel olarak takip et — fotoğraflar yalnızca sana ve antrenörüne açıktır</p></div>
    <div class="page-head__actions">
      <button class="btn btn--primary" data-upload>${icon("plus", 16)} Fotoğraf Ekle</button>
    </div>
  </div>

  <div class="grid dash">
    <div class="card c12">
      <div class="card__head"><span class="card__title">${icon("image")} Tüm Fotoğraflar</span>
        <span class="card__sub">${photos.length} kare</span></div>
      ${photos.length ? `<div class="album">${photos.map((p) => photoTile(p)).join("")}</div>`
        : `<div class="empty"><b>Albüm boş</b>İlk gelişim fotoğrafını ekleyerek başla.</div>`}
    </div>
  </div>
  <input type="file" accept="image/*" data-file hidden>`;

  const mount = (root) => {
    const file = root.querySelector("[data-file]");
    root.querySelector("[data-upload]").addEventListener("click", () => file.click());
    file.addEventListener("change", () => {
      const f = file.files[0];
      if (!f) return;
      if (f.size > 2.5 * 1024 * 1024) return toast("Dosya çok büyük (maks. 2.5 MB)", "err");
      const r = new FileReader();
      r.onload = () => {
        openModal(modalShell("Fotoğraf Ekle", `
          <img src="${r.result}" style="width:100%;border-radius:14px;max-height:320px;object-fit:cover">
          <div class="field mt-4"><label>Başlık</label><input id="ph-title" value="Güncel durum"></div>
          <div class="field"><label>Tarih</label><input id="ph-date" type="date" value="${S.today()}"></div>`,
          `<button class="btn" data-close>Vazgeç</button><button class="btn btn--primary" id="ph-save">Albüme ekle</button>`, "image"),
          { onMount: (m) => m.querySelector("#ph-save").addEventListener("click", () => {
            const d = S.load();
            d.photos.push({
              id: S.newId("ph"), memberId: id, date: m.querySelector("#ph-date").value,
              title: m.querySelector("#ph-title").value.trim() || "Fotoğraf", tag: "Gelişim", src: r.result,
            });
            S.save(); closeModal(); toast("Fotoğraf eklendi", "ok"); ctx.rerender();
          }) });
      };
      r.readAsDataURL(f);
    });

    root.querySelectorAll("[data-del]").forEach((b) => b.addEventListener("click", (e) => {
      e.stopPropagation();
      confirmDialog("Fotoğrafı sil", "Bu fotoğraf albümünden kalıcı olarak silinecek.", () => {
        const d = S.load();
        d.photos = d.photos.filter((p) => p.id !== b.dataset.del);
        S.save(); toast("Fotoğraf silindi"); ctx.rerender();
      }, "Sil");
    }));

    root.querySelectorAll("[data-photo]").forEach((el) => el.addEventListener("click", () => {
      const p = S.load().photos.find((x) => x.id === el.dataset.photo);
      openModal(modalShell(p.title, `
        ${p.src ? `<img src="${esc(p.src)}" style="width:100%;border-radius:14px">`
          : `<div class="photo" style="aspect-ratio:4/3"><div class="photo__ph">${esc(S.fmtShort(p.date))}</div></div>`}
        <p class="muted mt-4">${esc(S.fmtDate(p.date))} · ${esc(p.tag)}</p>`,
        `<button class="btn" data-close>Kapat</button>`, "image"), { wide: true });
    }));
  };
  return { html, mount };
}

/* ------------------------------------------------------------
   9) BİLDİRİMLER
   ------------------------------------------------------------ */
export function notifications(ctx) {
  const id = ctx.user.id;
  const list = S.notificationsOf(id);

  const html = `
  <div class="page-head">
    <div><h1>Bildirimler</h1><p>Antrenöründen ve salondan gelen tüm mesajlar</p></div>
    <div class="page-head__actions">
      <button class="btn" data-readall>${icon("check", 16)} Tümünü okundu işaretle</button>
    </div>
  </div>

  <div class="grid dash">
    <div class="card c8">
      <div class="card__head"><span class="card__title">${icon("bell")} Gelen Kutusu</span>
        <span class="card__sub">${list.filter((n) => !n.read).length} okunmamış</span></div>
      <div class="list" style="padding-left:12px">
        ${list.length ? list.map((n) => `
          <div class="msg ${n.read ? "" : "msg--unread"}">
            <span class="list__ico" style="${n.read ? "" : "background:var(--orange-soft);color:var(--orange-2)"}">
              ${icon(n.kind === "package" ? "ticket" : n.kind === "workout" ? "dumbbell" : "info")}</span>
            <div class="list__body">
              <div class="row row--between">
                <b>${esc(n.title)}</b>
                <span class="small muted">${esc(S.relative(n.date))}</span>
              </div>
              <p class="small muted mt-2">${esc(n.body)}</p>
              <div class="row mt-2 small muted">
                ${icon("user", 12)} ${esc(S.userById(n.from)?.name || "Salon")}
                ${n.memberId === "all" ? `<span class="badge">Tüm üyeler</span>` : ""}
              </div>
            </div>
          </div>`).join("") : `<div class="empty">Bildirim yok</div>`}
      </div>
    </div>

    <div class="card c4">
      <div class="card__head"><span class="card__title">${icon("send")} Antrenöre Yaz</span></div>
      <p class="small muted">Sorunu veya talebini doğrudan antrenörüne iletebilirsin.</p>
      <div class="field mt-4"><label>Mesajın</label><textarea id="nt-msg" placeholder="Merhaba koç, ..."></textarea></div>
      <button class="btn btn--primary btn--block" id="nt-send">${icon("send", 16)} Gönder</button>
    </div>
  </div>`;

  const mount = (root) => {
    root.querySelector("[data-readall]").addEventListener("click", () => {
      S.load().notifications.forEach((n) => { if (n.memberId === id || n.memberId === "all") n.read = true; });
      S.save(); toast("Tümü okundu olarak işaretlendi", "ok"); ctx.rerender();
    });
    root.querySelector("#nt-send").addEventListener("click", () => {
      const v = root.querySelector("#nt-msg").value.trim();
      if (!v) return toast("Mesaj boş olamaz", "err");
      const d = S.load();
      d.requests.push({
        id: S.newId("rq"), memberId: id, sessionId: null, type: "message",
        reason: v, newDate: "", newTime: "", status: "pending", createdAt: S.today(), response: "",
      });
      S.save(); toast("Mesajın antrenörüne iletildi", "ok"); ctx.rerender();
    });
    /* Görüntülenen bildirimleri okundu say */
    setTimeout(() => {
      S.load().notifications.forEach((n) => { if (n.memberId === id) n.read = true; });
      S.save();
      ctx.refreshBadge?.();
    }, 1500);
  };
  return { html, mount };
}
