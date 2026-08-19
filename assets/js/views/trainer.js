/* ============================================================
   ANTRENÖR EKRANLARI
   ============================================================ */
import * as S from "../store.js";
import {
  esc, icon, barChart, lineChart, ring, openModal, closeModal,
  modalShell, toast, confirmDialog, initials,
} from "../ui.js";

const GNAME = (id) => (S.MUSCLE_GROUPS.find((g) => g.id === id) || {}).name || id;
const tl = (n) => `${(+n).toLocaleString("tr-TR")} ₺`;

const avatar = (name, size = 38) =>
  `<span class="avatar" style="width:${size}px;height:${size}px;background:linear-gradient(140deg,#ff8a3d,#e8490f)">${esc(initials(name))}</span>`;

/* ------------------------------------------------------------
   1) ANTRENÖR PANELİ
   ------------------------------------------------------------ */
export function dashboard(ctx) {
  const members = S.allMembers();
  const db = S.load();
  const todaySessions = db.sessions
    .filter((s) => s.date === S.today())
    .sort((a, b) => a.time.localeCompare(b.time));
  const pending = S.pendingRequests();
  const recent = db.workouts.slice().sort((a, b) => b.date.localeCompare(a.date)).slice(0, 6);
  const expiring = members
    .map((m) => ({ m, p: S.packageOf(m.userId) }))
    .filter((x) => x.p && S.daysBetween(S.today(), x.p.end) <= 30)
    .sort((a, b) => a.p.end.localeCompare(b.p.end));

  const weekLoad = [];
  for (let i = 6; i >= 0; i--) {
    const d = S.addDays(new Date(), -i);
    weekLoad.push({ label: S.dayShort(d), value: db.sessions.filter((s) => s.date === d).length });
  }

  const html = `
  <div class="page-head">
    <div><h1>Antrenör Paneli</h1><p>${esc(S.dayName(S.today()))}, ${esc(S.fmtDate(S.today()))} · ${members.length} aktif üye</p></div>
    <div class="page-head__actions">
      <a class="btn" href="#/t/notify">${icon("bell", 16)} Bildirim Gönder</a>
      <a class="btn btn--primary" href="#/t/entry">${icon("plus", 16)} Antrenman Gir</a>
    </div>
  </div>

  <div class="grid dash">
    <div class="card card--accent c4">
      <div class="card__head"><span class="card__title">${icon("calendar")} Bugünün Programı</span>
        <span class="badge" style="background:rgba(0,0,0,.2);color:#fff">${todaySessions.length} ders</span></div>
      <div class="list">
        ${todaySessions.length ? todaySessions.map((s) => {
          const u = S.userById(s.memberId);
          return `<div class="list__item" style="border-color:rgba(255,255,255,.18)">
            <span class="list__ico" style="background:rgba(0,0,0,.2);color:#fff">${esc(s.time.slice(0, 2))}</span>
            <div class="list__body"><b>${esc(u?.name)}</b><span style="color:rgba(255,255,255,.75)">${esc(s.time)} · ${esc(GNAME(s.group))} · ${esc(s.room)}</span></div>
            <a class="btn btn--sm" style="background:rgba(0,0,0,.22);border-color:transparent;color:#fff" href="#/t/entry?m=${s.memberId}">Gir</a>
          </div>`;
        }).join("") : `<div class="empty" style="color:rgba(255,255,255,.75)">Bugün planlı ders yok</div>`}
      </div>
    </div>

    <div class="card c3">
      <div class="card__head"><span class="card__title">${icon("chart")} Haftalık Ders Yükü</span></div>
      ${barChart(weekLoad, { height: 158, color: "var(--orange)", dim: "var(--surface-3)" })}
      <div class="row row--between mt-3 small muted">
        <span>Toplam</span><b style="color:var(--text)">${weekLoad.reduce((s, d) => s + d.value, 0)} ders</b>
      </div>
    </div>

    <div class="card c5">
      <div class="card__head"><span class="card__title">${icon("send")} Bekleyen Talepler</span>
        <a class="btn btn--sm" href="#/t/requests">Tümü</a></div>
      <div class="list">
        ${pending.length ? pending.slice(0, 4).map((r) => {
          const u = S.userById(r.memberId);
          return `<div class="list__item">
            ${avatar(u?.name || "?")}
            <div class="list__body">
              <b>${esc(u?.name)} — ${reqLabel(r.type)}</b>
              <span>${esc(r.reason.slice(0, 70))}${r.reason.length > 70 ? "…" : ""}</span>
            </div>
            <a class="btn btn--sm btn--primary" href="#/t/requests">İncele</a>
          </div>`;
        }).join("") : `<div class="empty">Bekleyen talep yok</div>`}
      </div>
    </div>

    <div class="card c8">
      <div class="card__head"><span class="card__title">${icon("users")} Üyeler</span>
        <a class="btn btn--sm" href="#/t/members">Detaylı görünüm</a></div>
      <div class="table-wrap">
        <table>
          <thead><tr><th>Üye</th><th>Paket</th><th>Kalan seans</th><th>Son antrenman</th><th>Kilo değişimi</th><th></th></tr></thead>
          <tbody>
            ${members.map((m) => {
              const p = S.packageOf(m.userId);
              const ws = S.workoutsOf(m.userId);
              const ms = S.measuresOf(m.userId);
              const diff = ms.length > 1 ? +(ms[ms.length - 1].weight - ms[0].weight).toFixed(1) : 0;
              return `<tr>
                <td><div class="row">${avatar(m.user.name, 32)}<div><b>${esc(m.user.name)}</b><div class="small muted">${esc(m.goal)}</div></div></div></td>
                <td>${esc(p?.name.split("—")[0] || "-")}</td>
                <td>${p?.total ? `${p.total - p.used}/${p.total}` : "∞"}</td>
                <td>${ws[0] ? `${esc(S.relative(ws[0].date))}<div class="small muted">${esc(GNAME(ws[0].group))}</div>` : "-"}</td>
                <td><span class="badge ${diff <= 0 ? "badge--green" : "badge--orange"}">${diff > 0 ? "+" : ""}${diff} kg</span></td>
                <td style="text-align:right">
                  <a class="btn btn--sm" href="#/t/members?m=${m.userId}">${icon("arrow", 14)}</a>
                </td>
              </tr>`;
            }).join("")}
          </tbody>
        </table>
      </div>
    </div>

    <div class="card c4">
      <div class="card__head"><span class="card__title">${icon("ticket")} Yaklaşan Paket Bitişleri</span></div>
      <div class="list">
        ${expiring.length ? expiring.map(({ m, p }) => {
          const left = S.daysBetween(S.today(), p.end);
          return `<div class="list__item">
            ${avatar(m.user.name)}
            <div class="list__body"><b>${esc(m.user.name)}</b><span>${esc(p.name)}</span></div>
            <span class="badge ${left <= 7 ? "badge--red" : "badge--yellow"}">${left > 0 ? `${left} gün` : "Bitti"}</span>
          </div>`;
        }).join("") : `<div class="empty">Yakın zamanda biten paket yok</div>`}
      </div>
    </div>

    <div class="card c12">
      <div class="card__head"><span class="card__title">${icon("clipboard")} Son Girilen Antrenmanlar</span></div>
      <div class="table-wrap">
        <table>
          <thead><tr><th>Tarih</th><th>Üye</th><th>Kas grubu</th><th>Hareket</th><th>Tonaj</th><th>Süre</th></tr></thead>
          <tbody>
            ${recent.map((w) => {
              const vol = w.exercises.reduce((s, e) => s + e.sets.reduce((v, st) => v + st.reps * st.weight, 0), 0);
              return `<tr>
                <td>${esc(S.fmtShort(w.date))}<div class="small muted">${esc(S.relative(w.date))}</div></td>
                <td>${esc(S.userById(w.memberId)?.name || "-")}</td>
                <td><span class="badge badge--orange">${esc(GNAME(w.group))}</span></td>
                <td>${w.exercises.length} hareket · ${w.exercises.reduce((s, e) => s + e.sets.length, 0)} set</td>
                <td>${(vol / 1000).toFixed(1)} ton</td>
                <td>${w.duration} dk</td>
              </tr>`;
            }).join("")}
          </tbody>
        </table>
      </div>
    </div>
  </div>`;
  return { html };
}

const reqLabel = (t) =>
  t === "cancel" ? "İptal talebi" : t === "postpone" ? "Erteleme talebi"
    : t === "package" ? "Üyelik talebi" : "Mesaj";

/* ------------------------------------------------------------
   2) ANTRENMAN GİRİŞİ
   ------------------------------------------------------------ */
export function entry(ctx) {
  const members = S.allMembers();
  const selected = ctx.query.m || members[0]?.userId;
  const member = members.find((m) => m.userId === selected);
  const recent = S.workoutsOf(selected).slice(0, 5);

  const html = `
  <div class="page-head">
    <div><h1>Antrenman Girişi</h1><p>Üyenin çalıştığı kas grubunu, hareketleri ve setleri kaydet</p></div>
  </div>

  <div class="grid dash">
    <div class="card c3">
      <div class="card__head"><span class="card__title">${icon("users")} Üye Seç</span></div>
      <div class="stack">
        ${members.map((m) => `
          <a class="member-pick ${m.userId === selected ? "is-active" : ""}" href="#/t/entry?m=${m.userId}">
            ${avatar(m.user.name)}
            <div class="list__body"><b>${esc(m.user.name)}</b><span>${esc(m.goal)}</span></div>
          </a>`).join("")}
      </div>
    </div>

    <div class="card c6">
      <div class="card__head">
        <span class="card__title">${icon("dumbbell")} Yeni Antrenman — ${esc(member?.user.name || "")}</span>
      </div>

      <div class="row wrap" style="gap:10px">
        <div class="field" style="flex:1;min-width:150px"><label>Tarih</label>
          <input id="w-date" type="date" value="${S.today()}"></div>
        <div class="field" style="flex:1;min-width:150px"><label>Kas grubu</label>
          <select id="w-group">${S.MUSCLE_GROUPS.map((g) => `<option value="${g.id}">${esc(g.name)}</option>`).join("")}</select></div>
      </div>
      <div class="row wrap" style="gap:10px">
        <div class="field" style="flex:1;min-width:120px"><label>Süre (dk)</label><input id="w-dur" type="number" min="10" value="60"></div>
        <div class="field" style="flex:1;min-width:120px"><label>Zorluk (RPE 1-10)</label><input id="w-rpe" type="number" min="1" max="10" value="8"></div>
      </div>

      <div class="row row--between mt-3">
        <b>Hareketler</b>
        <button class="btn btn--sm btn--primary" id="add-ex">${icon("plus", 14)} Hareket Ekle</button>
      </div>
      <div class="stack mt-3" id="ex-list"></div>

      <div class="field mt-4"><label>Antrenör notu (üye görür)</label>
        <textarea id="w-note" placeholder="Örn. Squat derinliği iyileşti, ağırlığı 5 kg artırdık."></textarea></div>

      <div class="row mt-4" style="gap:10px">
        <button class="btn btn--primary" id="w-save">${icon("check", 16)} Antrenmanı Kaydet</button>
        <button class="btn" id="w-notify">${icon("bell", 16)} Kaydet ve bildir</button>
      </div>
    </div>

    <div class="card c3">
      <div class="card__head"><span class="card__title">${icon("clock")} Son Antrenmanlar</span></div>
      <div class="list">
        ${recent.length ? recent.map((w) => `
          <div class="list__item">
            <span class="list__ico">${icon("dumbbell", 16)}</span>
            <div class="list__body"><b>${esc(GNAME(w.group))}</b>
              <span>${esc(S.fmtShort(w.date))} · ${w.exercises.length} hareket</span></div>
            <button class="btn btn--sm" data-copy="${w.id}">Kopyala</button>
          </div>`).join("") : `<div class="empty">Kayıt yok</div>`}
      </div>
      <div class="notice mt-4" style="background:var(--surface-2)">
        ${icon("info", 16)} <span class="small">"Kopyala" son antrenmanın hareketlerini forma yükler.</span>
      </div>
    </div>
  </div>`;

  const mount = (root) => {
    const list = root.querySelector("#ex-list");
    const groupSel = root.querySelector("#w-group");

    const exerciseBlock = (name = "", sets = [{ reps: 12, weight: 20 }]) => {
      const lib = S.EXERCISE_LIBRARY[groupSel.value] || [];
      const el = document.createElement("div");
      el.className = "exercise";
      el.innerHTML = `
        <div class="row" style="gap:10px">
          <div class="field" style="flex:1;margin:0"><label>Hareket</label>
            <input list="ex-lib" class="ex-name" value="${esc(name)}" placeholder="${esc(lib[0] || "Hareket adı")}"></div>
          <button class="icon-btn ex-del" title="Hareketi kaldır" style="margin-top:18px">${icon("trash", 15)}</button>
        </div>
        <div class="stack mt-3 set-list"></div>
        <button class="btn btn--sm mt-3 add-set">${icon("plus", 13)} Set ekle</button>`;

      const setList = el.querySelector(".set-list");
      const addSet = (s = { reps: 12, weight: 20 }) => {
        const r = document.createElement("div");
        r.className = "set-row";
        r.innerHTML = `
          <span class="set-no">${setList.children.length + 1}</span>
          <div class="field"><label>Tekrar</label><input class="s-reps" type="number" min="1" value="${s.reps}"></div>
          <div class="field"><label>Ağırlık (kg)</label><input class="s-weight" type="number" min="0" step="2.5" value="${s.weight}"></div>
          <div class="field"><label>Dinlenme (sn)</label><input class="s-rest" type="number" min="0" step="15" value="${s.rest || 75}"></div>
          <button class="icon-btn s-del" title="Seti sil">${icon("close", 15)}</button>`;
        r.querySelector(".s-del").addEventListener("click", () => { r.remove(); renumber(setList); });
        setList.appendChild(r);
      };
      sets.forEach(addSet);
      el.querySelector(".add-set").addEventListener("click", () => addSet({ reps: 10, weight: 20 }));
      el.querySelector(".ex-del").addEventListener("click", () => el.remove());
      list.appendChild(el);
    };

    const renumber = (setList) => {
      [...setList.children].forEach((r, i) => { r.querySelector(".set-no").textContent = i + 1; });
    };

    /* hareket kütüphanesi datalist */
    const dl = document.createElement("datalist");
    dl.id = "ex-lib";
    const fillLib = () => {
      dl.innerHTML = (S.EXERCISE_LIBRARY[groupSel.value] || [])
        .map((n) => `<option value="${esc(n)}">`).join("");
    };
    fillLib();
    root.appendChild(dl);
    groupSel.addEventListener("change", fillLib);

    root.querySelector("#add-ex").addEventListener("click", () => exerciseBlock());
    exerciseBlock();

    const collect = () => [...list.children].map((el) => ({
      name: el.querySelector(".ex-name").value.trim() || "Hareket",
      note: "",
      sets: [...el.querySelectorAll(".set-row")].map((r) => ({
        reps: +r.querySelector(".s-reps").value || 0,
        weight: +r.querySelector(".s-weight").value || 0,
        rest: +r.querySelector(".s-rest").value || 60,
      })),
    })).filter((e) => e.sets.length);

    const persist = (notify) => {
      const exercises = collect();
      if (!exercises.length) return toast("En az bir hareket ve set gir", "err");
      const d = S.load();
      const w = {
        id: S.newId("w"), memberId: selected, trainerId: ctx.user.id,
        date: root.querySelector("#w-date").value,
        group: groupSel.value,
        duration: +root.querySelector("#w-dur").value || 60,
        rpe: +root.querySelector("#w-rpe").value || 8,
        note: root.querySelector("#w-note").value.trim(),
        exercises,
      };
      d.workouts.push(w);

      /* seans varsa tamamlandı say + paket seansını düş */
      const s = d.sessions.find((x) => x.memberId === selected && x.date === w.date && x.status === "planned");
      if (s) s.status = "done";
      const p = d.packages.find((x) => x.memberId === selected);
      if (p && p.total) p.used = Math.min(p.total, p.used + 1);

      if (notify) {
        d.notifications.push({
          id: S.newId("nt"), memberId: selected, from: ctx.user.id,
          title: `${GNAME(w.group)} antrenmanın kaydedildi`,
          body: `${S.fmtDate(w.date)} tarihli antrenmanın panele işlendi: ${exercises.length} hareket, ${exercises.reduce((a, e) => a + e.sets.length, 0)} set.${w.note ? " Not: " + w.note : ""}`,
          date: S.today(), read: false, kind: "workout",
        });
      }
      S.save();
      toast(notify ? "Antrenman kaydedildi ve üyeye bildirildi" : "Antrenman kaydedildi", "ok");
      ctx.rerender();
    };

    root.querySelector("#w-save").addEventListener("click", () => persist(false));
    root.querySelector("#w-notify").addEventListener("click", () => persist(true));

    root.querySelectorAll("[data-copy]").forEach((b) => b.addEventListener("click", () => {
      const w = S.load().workouts.find((x) => x.id === b.dataset.copy);
      groupSel.value = w.group;
      fillLib();
      root.querySelector("#w-dur").value = w.duration;
      list.innerHTML = "";
      w.exercises.forEach((e) => exerciseBlock(e.name, e.sets));
      toast("Hareketler forma yüklendi");
    }));
  };

  return { html, mount };
}

/* ------------------------------------------------------------
   3) ÜYE YÖNETİMİ
   ------------------------------------------------------------ */
export function members(ctx) {
  const list = S.allMembers();
  const sel = ctx.query.m;
  if (sel) return memberDetail(ctx, sel);

  const html = `
  <div class="page-head">
    <div><h1>Üyeler</h1><p>${list.length} aktif üye · paket, gelişim ve antrenman özetleri</p></div>
    <div class="page-head__actions">
      <button class="btn btn--primary" data-new>${icon("plus", 16)} Yeni Üye</button>
    </div>
  </div>

  <div class="grid dash">
    ${list.map((m) => {
      const p = S.packageOf(m.userId);
      const ws = S.workoutsOf(m.userId);
      const ms = S.measuresOf(m.userId);
      const left = p?.total ? p.total - p.used : null;
      const daysLeft = p ? S.daysBetween(S.today(), p.end) : 0;
      return `<div class="card c4">
        <div class="row">
          ${avatar(m.user.name, 48)}
          <div style="flex:1;min-width:0">
            <b style="font-size:15px">${esc(m.user.name)}</b>
            <div class="small muted">${esc(m.user.email)}</div>
          </div>
          <a class="icon-btn" href="#/t/members?m=${m.userId}">${icon("arrow", 15)}</a>
        </div>
        <div class="row row--between mt-4 small">
          <span class="muted">${esc(p?.name || "Paket yok")}</span>
          <span class="badge ${daysLeft < 15 ? "badge--red" : "badge--green"}">${daysLeft > 0 ? daysLeft + " gün" : "Bitti"}</span>
        </div>
        <div class="bar mt-3"><i style="width:${p?.total ? (p.used / p.total) * 100 : 50}%"></i></div>
        <div class="row row--between mt-4">
          <div><b>${ws.length}</b><div class="small muted">Antrenman</div></div>
          <div><b>${left ?? "∞"}</b><div class="small muted">Kalan seans</div></div>
          <div><b>${ms.length ? ms[ms.length - 1].weight : "-"}</b><div class="small muted">Kilo (kg)</div></div>
        </div>
        <div class="row mt-4" style="gap:8px">
          <a class="btn btn--sm btn--block" href="#/t/entry?m=${m.userId}">${icon("plus", 13)} Antrenman</a>
          <button class="btn btn--sm btn--block" data-notify="${m.userId}">${icon("bell", 13)} Bildir</button>
        </div>
      </div>`;
    }).join("")}
  </div>`;

  const mount = (root) => {
    root.querySelectorAll("[data-notify]").forEach((b) =>
      b.addEventListener("click", () => notifyModal(ctx, b.dataset.notify)));
    root.querySelector("[data-new]").addEventListener("click", () => newMemberModal(ctx));
  };
  return { html, mount };
}

function memberDetail(ctx, id) {
  const m = S.allMembers().find((x) => x.userId === id);
  if (!m) return { html: `<div class="empty">Üye bulunamadı</div>` };
  const p = S.packageOf(id);
  const ws = S.workoutsOf(id);
  const ms = S.measuresOf(id);
  const photos = S.photosOf(id);
  const groups = S.groupDistribution(id, 60);
  const nut = S.nutritionRange(id).slice(-10);

  const html = `
  <div class="page-head">
    <div class="row">
      <a class="icon-btn" href="#/t/members">${icon("chevron", 16, "")}</a>
      ${avatar(m.user.name, 52)}
      <div><h1 style="font-size:28px">${esc(m.user.name)}</h1>
        <p>${esc(m.goal)} · ${esc(m.phone)} · Üyelik: ${esc(S.fmtDate(m.joined))}</p></div>
    </div>
    <div class="page-head__actions">
      <button class="btn" data-notify="${id}">${icon("bell", 16)} Bildirim</button>
      <a class="btn btn--primary" href="#/t/entry?m=${id}">${icon("plus", 16)} Antrenman Gir</a>
    </div>
  </div>

  <div class="grid dash">
    <div class="card card--accent c4">
      <div class="card__head"><span class="card__title">${icon("ticket")} Paket</span></div>
      <b style="font-size:17px">${esc(p?.name || "-")}</b>
      <div class="small mt-2">${p ? `${S.fmtDate(p.start)} — ${S.fmtDate(p.end)}` : ""}</div>
      <div class="bar mt-4"><i style="width:${p?.total ? (p.used / p.total) * 100 : 50}%"></i></div>
      <div class="row row--between mt-4">
        <div><div class="big-num" style="font-size:24px">${p?.total ? p.total - p.used : "∞"}</div><span class="small">Kalan</span></div>
        <div><div class="big-num" style="font-size:24px">${p?.used ?? 0}</div><span class="small">Kullanılan</span></div>
        <div><div class="big-num" style="font-size:24px">${p ? S.daysBetween(S.today(), p.end) : 0}</div><span class="small">Gün</span></div>
      </div>
      ${p && p.paid < p.price ? `<div class="notice mt-4">${icon("info", 16)} Bakiye: ${tl(p.price - p.paid)}</div>` : ""}
      <button class="btn btn--sm mt-4" data-pkg style="background:rgba(0,0,0,.2);border-color:transparent;color:#fff">${icon("edit", 13)} Paketi düzenle</button>
    </div>

    <div class="card c8">
      <div class="card__head"><span class="card__title">${icon("chart")} Kilo Gelişimi</span>
        <span class="badge badge--green">${ms.length} ölçüm</span></div>
      ${lineChart(ms.map((x) => ({ label: S.fmtShort(x.date), value: x.weight })), { height: 200, stroke: "#b6f24a", fill: "rgba(182,242,74,.16)" })}
    </div>

    <div class="card c4">
      <div class="card__head"><span class="card__title">${icon("dumbbell")} Kas Grubu Dengesi</span><span class="card__sub">60 gün</span></div>
      <div class="stack">
        ${groups.map((g, i) => `<div>
          <div class="row row--between small"><span>${esc(g.name)}</span><b>${g.count}</b></div>
          <div class="bar mt-2"><i style="width:${(g.count / groups[0].count) * 100}%;opacity:${1 - i * .1}"></i></div>
        </div>`).join("") || `<div class="empty">Kayıt yok</div>`}
      </div>
    </div>

    <div class="card c4">
      <div class="card__head"><span class="card__title">${icon("apple")} Kalori (son 10 gün)</span></div>
      ${barChart(nut.map((n) => ({ label: S.fmtShort(n.date).split(" ")[0], value: S.nutritionTotals(n).kcal })),
        { height: 172, color: "var(--orange)", dim: "var(--surface-3)" })}
      <div class="row row--between small muted mt-3"><span>Ortalama</span>
        <b style="color:var(--text)">${Math.round(nut.reduce((s, n) => s + S.nutritionTotals(n).kcal, 0) / Math.max(1, nut.length))} kcal</b></div>
    </div>

    <div class="card c4">
      <div class="card__head"><span class="card__title">${icon("image")} Gelişim Albümü</span></div>
      <div class="album" style="grid-template-columns:repeat(3,1fr)">
        ${photos.slice(0, 6).map((ph) => `<div class="photo">
          ${ph.src ? `<img class="photo__img" src="${esc(ph.src)}" alt="">`
            : `<div class="photo__ph">${esc(S.fmtShort(ph.date))}</div>`}
          <div class="photo__meta"><b>${esc(ph.title)}</b><span>${esc(S.fmtShort(ph.date))}</span></div>
        </div>`).join("") || `<div class="empty">Fotoğraf yok</div>`}
      </div>
    </div>

    <div class="card c12">
      <div class="card__head"><span class="card__title">${icon("clipboard")} Antrenman Geçmişi</span>
        <span class="card__sub">${ws.length} kayıt</span></div>
      <div class="table-wrap">
        <table>
          <thead><tr><th>Tarih</th><th>Kas grubu</th><th>Hareketler</th><th>Set</th><th>Tonaj</th><th>RPE</th><th></th></tr></thead>
          <tbody>
            ${ws.slice(0, 20).map((w) => {
              const vol = w.exercises.reduce((s, e) => s + e.sets.reduce((v, st) => v + st.reps * st.weight, 0), 0);
              return `<tr>
                <td>${esc(S.fmtDate(w.date))}</td>
                <td><span class="badge badge--orange">${esc(GNAME(w.group))}</span></td>
                <td>${esc(w.exercises.map((e) => e.name).join(", ").slice(0, 60))}</td>
                <td>${w.exercises.reduce((s, e) => s + e.sets.length, 0)}</td>
                <td>${(vol / 1000).toFixed(1)} ton</td>
                <td>${w.rpe || "-"}</td>
                <td style="text-align:right"><button class="icon-btn" data-delw="${w.id}">${icon("trash", 15)}</button></td>
              </tr>`;
            }).join("")}
          </tbody>
        </table>
      </div>
    </div>
  </div>`;

  const mount = (root) => {
    root.querySelector("[data-notify]")?.addEventListener("click", () => notifyModal(ctx, id));
    root.querySelectorAll("[data-delw]").forEach((b) => b.addEventListener("click", () =>
      confirmDialog("Antrenmanı sil", "Bu antrenman kaydı silinecek.", () => {
        const d = S.load();
        d.workouts = d.workouts.filter((w) => w.id !== b.dataset.delw);
        S.save(); toast("Antrenman silindi"); ctx.rerender();
      }, "Sil")));
    root.querySelector("[data-pkg]")?.addEventListener("click", () => {
      openModal(modalShell("Paketi Düzenle", `
        <div class="field"><label>Paket adı</label><input id="p-name" value="${esc(p?.name || "")}"></div>
        <div class="row" style="gap:10px">
          <div class="field" style="flex:1"><label>Toplam seans (0 = sınırsız)</label><input id="p-total" type="number" value="${p?.total ?? 0}"></div>
          <div class="field" style="flex:1"><label>Kullanılan</label><input id="p-used" type="number" value="${p?.used ?? 0}"></div>
        </div>
        <div class="row" style="gap:10px">
          <div class="field" style="flex:1"><label>Başlangıç</label><input id="p-start" type="date" value="${p?.start || S.today()}"></div>
          <div class="field" style="flex:1"><label>Bitiş</label><input id="p-end" type="date" value="${p?.end || S.today()}"></div>
        </div>
        <div class="row" style="gap:10px">
          <div class="field" style="flex:1"><label>Ücret (₺)</label><input id="p-price" type="number" value="${p?.price ?? 0}"></div>
          <div class="field" style="flex:1"><label>Ödenen (₺)</label><input id="p-paid" type="number" value="${p?.paid ?? 0}"></div>
        </div>`,
        `<button class="btn" data-close>Vazgeç</button><button class="btn btn--primary" id="p-save">Kaydet</button>`, "ticket"),
        { onMount: (mo) => mo.querySelector("#p-save").addEventListener("click", () => {
          const d = S.load();
          let pk = d.packages.find((x) => x.memberId === id);
          if (!pk) { pk = { id: S.newId("pk"), memberId: id, freeze: 0 }; d.packages.push(pk); }
          pk.name = mo.querySelector("#p-name").value;
          pk.total = +mo.querySelector("#p-total").value;
          pk.used = +mo.querySelector("#p-used").value;
          pk.start = mo.querySelector("#p-start").value;
          pk.end = mo.querySelector("#p-end").value;
          pk.price = +mo.querySelector("#p-price").value;
          pk.paid = +mo.querySelector("#p-paid").value;
          S.save(); closeModal(); toast("Paket güncellendi", "ok"); ctx.rerender();
        }) });
    });
  };
  return { html, mount };
}

function newMemberModal(ctx) {
  openModal(modalShell("Yeni Üye", `
    <div class="field"><label>Ad Soyad</label><input id="nm-name" placeholder="Örn. Elif Yıldız"></div>
    <div class="row" style="gap:10px">
      <div class="field" style="flex:1"><label>E-posta</label><input id="nm-mail" placeholder="uye@milaspt.com"></div>
      <div class="field" style="flex:1"><label>Telefon</label><input id="nm-phone" placeholder="0500 000 00 00"></div>
    </div>
    <div class="row" style="gap:10px">
      <div class="field" style="flex:1"><label>Boy (cm)</label><input id="nm-h" type="number" value="170"></div>
      <div class="field" style="flex:1"><label>Başlangıç kilosu</label><input id="nm-w" type="number" step="0.1" value="70"></div>
    </div>
    <div class="field"><label>Hedef</label><input id="nm-goal" placeholder="Örn. Yağ yakımı"></div>
    <div class="field"><label>Geçici şifre</label><input id="nm-pass" value="1234"></div>`,
    `<button class="btn" data-close>Vazgeç</button><button class="btn btn--primary" id="nm-save">Üyeyi Ekle</button>`, "user"),
    { onMount: (m) => m.querySelector("#nm-save").addEventListener("click", () => {
      const name = m.querySelector("#nm-name").value.trim();
      const mail = m.querySelector("#nm-mail").value.trim();
      if (!name || !mail) return toast("Ad ve e-posta zorunlu", "err");
      const d = S.load();
      if (d.users.some((u) => u.email.toLowerCase() === mail.toLowerCase())) return toast("Bu e-posta zaten kayıtlı", "err");
      const uidv = S.newId("u");
      d.users.push({ id: uidv, role: "member", name, email: mail, pass: m.querySelector("#nm-pass").value || "1234" });
      d.members.push({
        userId: uidv, phone: m.querySelector("#nm-phone").value, birth: "",
        height: +m.querySelector("#nm-h").value, startWeight: +m.querySelector("#nm-w").value,
        goal: m.querySelector("#nm-goal").value || "Genel kondisyon", joined: S.today(), trainerId: ctx.user.id,
      });
      d.measures.push({
        id: S.newId("ms"), memberId: uidv, date: S.today(),
        weight: +m.querySelector("#nm-w").value, fat: 22, muscle: 33, waist: 80, chest: 95, arm: 32,
      });
      d.packages.push({
        id: S.newId("pk"), memberId: uidv, name: "PT 2x / Hafta — 3 Ay", total: 24, used: 0,
        start: S.today(), end: S.addDays(new Date(), 90), price: 11000, paid: 0, freeze: 0,
      });
      S.save(); closeModal(); toast("Üye eklendi", "ok"); ctx.rerender();
    }) });
}

/* ------------------------------------------------------------
   4) TALEPLER
   ------------------------------------------------------------ */
export function requests(ctx) {
  const all = S.load().requests.slice().sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const pending = all.filter((r) => r.status === "pending");
  const handled = all.filter((r) => r.status !== "pending");

  const card = (r) => {
    const u = S.userById(r.memberId);
    const s = S.load().sessions.find((x) => x.id === r.sessionId);
    return `<div class="card ${r.status === "pending" ? "" : "card--flat"} c6">
      <div class="row">
        ${avatar(u?.name || "?", 44)}
        <div style="flex:1;min-width:0">
          <b>${esc(u?.name || "-")}</b>
          <div class="small muted">${esc(S.relative(r.createdAt))} · ${reqLabel(r.type)}</div>
        </div>
        <span class="badge ${r.type === "cancel" ? "badge--red" : r.type === "postpone" ? "badge--yellow" : "badge--blue"}">${reqLabel(r.type)}</span>
      </div>
      ${s ? `<div class="notice mt-4" style="background:var(--surface-2)">
        ${icon("calendar", 16)} <span>${esc(S.fmtDate(s.date))} · ${esc(s.time)} · ${esc(s.type)} · ${esc(GNAME(s.group))}</span></div>` : ""}
      <p class="mt-3">${esc(r.reason)}</p>
      ${r.newDate ? `<div class="notice mt-3" style="background:var(--orange-soft);color:var(--orange-2)">
        ${icon("clock", 16)} <span>Önerilen yeni zaman: ${esc(S.fmtDate(r.newDate))} · ${esc(r.newTime)}</span></div>` : ""}
      ${r.response ? `<div class="small muted mt-3">${icon("send", 12)} Yanıtın: ${esc(r.response)}</div>` : ""}
      <div class="row mt-4" style="gap:8px">
        ${r.status === "pending" ? `
          <button class="btn btn--sm btn--primary" data-ok="${r.id}">${icon("check", 14)} Onayla</button>
          <button class="btn btn--sm btn--danger" data-no="${r.id}">${icon("close", 14)} Reddet</button>`
        : `<span class="badge ${r.status === "approved" ? "badge--green" : "badge--red"}">
             ${r.status === "approved" ? "Onaylandı" : "Reddedildi"}</span>`}
      </div>
    </div>`;
  };

  const html = `
  <div class="page-head">
    <div><h1>Üye Talepleri</h1><p>Erteleme, iptal ve üyelik talepleri</p></div>
    <div class="page-head__actions">
      <span class="badge badge--yellow">${pending.length} bekleyen</span>
      <span class="badge">${handled.length} sonuçlanmış</span>
    </div>
  </div>

  <div class="grid dash">
    ${pending.length ? pending.map(card).join("")
      : `<div class="card c12"><div class="empty"><b>Bekleyen talep yok</b>Tüm talepler sonuçlandırıldı.</div></div>`}
    ${handled.length ? `<div class="c12 mt-3"><h3 style="font-size:16px;font-weight:600">Geçmiş Talepler</h3></div>` : ""}
    ${handled.map(card).join("")}
  </div>`;

  const mount = (root) => {
    const resolve = (rid, approve) => {
      const r = S.load().requests.find((x) => x.id === rid);
      const u = S.userById(r.memberId);
      openModal(modalShell(approve ? "Talebi Onayla" : "Talebi Reddet", `
        <p class="muted">${esc(u?.name)} — ${reqLabel(r.type)}</p>
        <div class="field mt-4"><label>Üyeye iletilecek yanıt</label>
          <textarea id="rs-msg">${approve ? "Talebin onaylandı." : "Talebin bu kez onaylanamadı."}</textarea></div>`,
        `<button class="btn" data-close>Vazgeç</button>
         <button class="btn ${approve ? "btn--primary" : "btn--danger"}" id="rs-ok">${approve ? "Onayla" : "Reddet"}</button>`,
        approve ? "check" : "close"),
        { onMount: (m) => m.querySelector("#rs-ok").addEventListener("click", () => {
          const d = S.load();
          const req = d.requests.find((x) => x.id === rid);
          req.status = approve ? "approved" : "rejected";
          req.response = m.querySelector("#rs-msg").value.trim();

          const s = d.sessions.find((x) => x.id === req.sessionId);
          if (approve && s) {
            if (req.type === "cancel") s.status = "cancelled";
            if (req.type === "postpone") {
              s.status = "postponed";
              d.sessions.push({
                ...s, id: S.newId("s"), date: req.newDate || s.date,
                time: req.newTime || s.time, status: "planned",
              });
            }
          }
          d.notifications.push({
            id: S.newId("nt"), memberId: req.memberId, from: ctx.user.id,
            title: `${reqLabel(req.type)} ${approve ? "onaylandı" : "reddedildi"}`,
            body: req.response || (approve ? "Talebin onaylandı." : "Talebin reddedildi."),
            date: S.today(), read: false, kind: "info",
          });
          S.save(); closeModal();
          toast(approve ? "Talep onaylandı ve üyeye bildirildi" : "Talep reddedildi", approve ? "ok" : "");
          ctx.rerender();
        }) });
    };
    root.querySelectorAll("[data-ok]").forEach((b) => b.addEventListener("click", () => resolve(b.dataset.ok, true)));
    root.querySelectorAll("[data-no]").forEach((b) => b.addEventListener("click", () => resolve(b.dataset.no, false)));
  };
  return { html, mount };
}

/* ------------------------------------------------------------
   5) BİLDİRİM GÖNDER
   ------------------------------------------------------------ */
export function notify(ctx) {
  const list = S.allMembers();
  const sent = S.load().notifications.slice().sort((a, b) => b.date.localeCompare(a.date)).slice(0, 12);

  const html = `
  <div class="page-head">
    <div><h1>Bildirim Gönder</h1><p>Tek bir üyeye veya tüm salona duyuru gönder</p></div>
  </div>

  <div class="grid dash">
    <div class="card c5">
      <div class="card__head"><span class="card__title">${icon("send")} Yeni Bildirim</span></div>
      <div class="field"><label>Alıcı</label>
        <select id="n-to">
          <option value="all">Tüm üyeler (${list.length})</option>
          ${list.map((m) => `<option value="${m.userId}">${esc(m.user.name)}</option>`).join("")}
        </select></div>
      <div class="field"><label>Tür</label>
        <select id="n-kind">
          <option value="info">Genel bilgilendirme</option>
          <option value="workout">Antrenman</option>
          <option value="package">Üyelik / ödeme</option>
        </select></div>
      <div class="field"><label>Başlık</label><input id="n-title" placeholder="Örn. Yarınki ders saati değişti"></div>
      <div class="field"><label>Mesaj</label><textarea id="n-body" placeholder="Bildirim metni..."></textarea></div>
      <button class="btn btn--primary btn--block" id="n-send">${icon("send", 16)} Gönder</button>
      <div class="row mt-4 wrap" style="gap:8px">
        ${[["Ders saati değişikliği", "Yarınki seans saatimiz güncellendi, lütfen paneli kontrol et."],
           ["Paket hatırlatması", "Paketinin süresi yaklaşıyor, yenilemek için resepsiyona uğrayabilirsin."],
           ["Motivasyon", "Bu hafta harika gidiyorsun, aynı disiplinle devam!"]]
          .map(([t, b]) => `<button class="btn btn--sm" data-tpl='${esc(JSON.stringify([t, b]))}'>${esc(t)}</button>`).join("")}
      </div>
    </div>

    <div class="card c7">
      <div class="card__head"><span class="card__title">${icon("bell")} Gönderilen Bildirimler</span></div>
      <div class="list">
        ${sent.map((n) => `
          <div class="list__item">
            <span class="list__ico">${icon(n.kind === "package" ? "ticket" : n.kind === "workout" ? "dumbbell" : "info")}</span>
            <div class="list__body">
              <b>${esc(n.title)}</b>
              <span>${esc(n.memberId === "all" ? "Tüm üyeler" : S.userById(n.memberId)?.name || "-")} · ${esc(S.relative(n.date))}</span>
            </div>
            <span class="badge ${n.read ? "badge--green" : ""}">${n.read ? "Okundu" : "Okunmadı"}</span>
          </div>`).join("") || `<div class="empty">Henüz bildirim gönderilmedi</div>`}
      </div>
    </div>
  </div>`;

  const mount = (root) => {
    root.querySelectorAll("[data-tpl]").forEach((b) => b.addEventListener("click", () => {
      const [t, body] = JSON.parse(b.dataset.tpl);
      root.querySelector("#n-title").value = t;
      root.querySelector("#n-body").value = body;
    }));
    root.querySelector("#n-send").addEventListener("click", () => {
      const title = root.querySelector("#n-title").value.trim();
      const body = root.querySelector("#n-body").value.trim();
      if (!title || !body) return toast("Başlık ve mesaj zorunlu", "err");
      const d = S.load();
      d.notifications.push({
        id: S.newId("nt"), memberId: root.querySelector("#n-to").value, from: ctx.user.id,
        title, body, date: S.today(), read: false, kind: root.querySelector("#n-kind").value,
      });
      S.save(); toast("Bildirim gönderildi", "ok"); ctx.rerender();
    });
  };
  return { html, mount };
}

function notifyModal(ctx, memberId) {
  const u = S.userById(memberId);
  openModal(modalShell(`${u?.name} — Bildirim`, `
    <div class="field"><label>Başlık</label><input id="q-title" placeholder="Başlık"></div>
    <div class="field"><label>Mesaj</label><textarea id="q-body" placeholder="Mesajın..."></textarea></div>`,
    `<button class="btn" data-close>Vazgeç</button><button class="btn btn--primary" id="q-send">Gönder</button>`, "bell"),
    { onMount: (m) => m.querySelector("#q-send").addEventListener("click", () => {
      const title = m.querySelector("#q-title").value.trim();
      const body = m.querySelector("#q-body").value.trim();
      if (!title || !body) return toast("Başlık ve mesaj zorunlu", "err");
      const d = S.load();
      d.notifications.push({
        id: S.newId("nt"), memberId, from: ctx.user.id, title, body,
        date: S.today(), read: false, kind: "info",
      });
      S.save(); closeModal(); toast("Bildirim gönderildi", "ok");
    }) });
}

/* ------------------------------------------------------------
   6) ETKİNLİK YÖNETİMİ
   ------------------------------------------------------------ */
export function eventsAdmin(ctx) {
  const list = S.load().events.slice().sort((a, b) => b.date.localeCompare(a.date));

  const html = `
  <div class="page-head">
    <div><h1>Etkinlik Yönetimi</h1><p>Salon etkinliklerini oluştur ve katılımcıları takip et</p></div>
    <div class="page-head__actions">
      <button class="btn btn--primary" data-new>${icon("plus", 16)} Yeni Etkinlik</button>
    </div>
  </div>

  <div class="grid dash">
    ${list.map((e) => `
      <div class="card c4 ${e.date < S.today() ? "card--flat" : ""}">
        <div class="row" style="align-items:flex-start">
          <div class="event__date" style="background:${e.cover}22;color:${e.cover}">
            <b>${new Date(e.date).getDate()}</b><span>${S.fmtShort(e.date).split(" ")[1]}</span></div>
          <div style="flex:1;min-width:0">
            <b>${esc(e.title)}</b>
            <div class="small muted mt-2">${esc(e.time)} · ${esc(e.place)}</div>
          </div>
          <button class="icon-btn" data-del="${e.id}">${icon("trash", 15)}</button>
        </div>
        <p class="small muted mt-3">${esc(e.desc)}</p>
        <div class="row row--between mt-4">
          <span class="badge badge--orange">${e.attendees.length}/${e.capacity} katılımcı</span>
          <span class="badge">${e.date < S.today() ? "Tamamlandı" : S.relative(e.date)}</span>
        </div>
        ${e.attendees.length ? `<div class="row wrap mt-3" style="gap:6px">
          ${e.attendees.map((a) => `<span class="badge">${esc(S.userById(a)?.name || "-")}</span>`).join("")}</div>` : ""}
      </div>`).join("")}
  </div>`;

  const mount = (root) => {
    root.querySelector("[data-new]").addEventListener("click", () => {
      openModal(modalShell("Yeni Etkinlik", `
        <div class="field"><label>Başlık</label><input id="e-title" placeholder="Örn. Sabah Koşusu"></div>
        <div class="row" style="gap:10px">
          <div class="field" style="flex:1"><label>Tarih</label><input id="e-date" type="date" value="${S.addDays(new Date(), 7)}"></div>
          <div class="field" style="flex:1"><label>Saat</label><input id="e-time" type="time" value="18:00"></div>
        </div>
        <div class="row" style="gap:10px">
          <div class="field" style="flex:1"><label>Yer</label><input id="e-place" value="MPT Stüdyo A"></div>
          <div class="field" style="flex:1"><label>Kontenjan</label><input id="e-cap" type="number" value="25"></div>
        </div>
        <div class="field"><label>Açıklama</label><textarea id="e-desc"></textarea></div>`,
        `<button class="btn" data-close>Vazgeç</button><button class="btn btn--primary" id="e-save">Oluştur</button>`, "party"),
        { onMount: (m) => m.querySelector("#e-save").addEventListener("click", () => {
          const title = m.querySelector("#e-title").value.trim();
          if (!title) return toast("Başlık zorunlu", "err");
          const d = S.load();
          d.events.push({
            id: S.newId("ev"), title, date: m.querySelector("#e-date").value,
            time: m.querySelector("#e-time").value, place: m.querySelector("#e-place").value,
            capacity: +m.querySelector("#e-cap").value || 20,
            desc: m.querySelector("#e-desc").value, attendees: [],
            cover: ["#f1592a", "#b6f24a", "#5aa9ff", "#ffc555"][d.events.length % 4],
          });
          d.notifications.push({
            id: S.newId("nt"), memberId: "all", from: ctx.user.id,
            title: `Yeni etkinlik: ${title}`,
            body: `${S.fmtDate(m.querySelector("#e-date").value)} · ${m.querySelector("#e-time").value} · ${m.querySelector("#e-place").value}`,
            date: S.today(), read: false, kind: "info",
          });
          S.save(); closeModal(); toast("Etkinlik oluşturuldu ve duyuruldu", "ok"); ctx.rerender();
        }) });
    });
    root.querySelectorAll("[data-del]").forEach((b) => b.addEventListener("click", () =>
      confirmDialog("Etkinliği sil", "Etkinlik ve katılım kayıtları silinecek.", () => {
        const d = S.load();
        d.events = d.events.filter((e) => e.id !== b.dataset.del);
        S.save(); toast("Etkinlik silindi"); ctx.rerender();
      }, "Sil")));
  };
  return { html, mount };
}

/* ------------------------------------------------------------
   7) DERS PLANLAMA
   ------------------------------------------------------------ */
export function planning(ctx) {
  const db = S.load();
  const from = S.today();
  const upcoming = db.sessions
    .filter((s) => s.date >= from)
    .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));
  const byDay = {};
  upcoming.forEach((s) => { (byDay[s.date] = byDay[s.date] || []).push(s); });

  const html = `
  <div class="page-head">
    <div><h1>Ders Planlama</h1><p>Üyelere yeni seans planla, programı yönet</p></div>
    <div class="page-head__actions">
      <button class="btn btn--primary" data-new>${icon("plus", 16)} Ders Planla</button>
    </div>
  </div>

  <div class="grid dash">
    ${Object.keys(byDay).slice(0, 9).map((date) => `
      <div class="card c4">
        <div class="card__head">
          <span class="card__title">${icon("calendar")} ${esc(S.fmtShort(date))}</span>
          <span class="card__sub">${esc(S.dayName(date))} · ${byDay[date].length} ders</span>
        </div>
        <div class="list">
          ${byDay[date].map((s) => `
            <div class="list__item">
              <span class="list__ico">${esc(s.time.slice(0, 5))}</span>
              <div class="list__body">
                <b>${esc(S.userById(s.memberId)?.name || "-")}</b>
                <span>${esc(s.type)} · ${esc(GNAME(s.group))} · ${esc(s.room)}</span>
              </div>
              <span class="badge ${s.status === "planned" ? "badge--green" : s.status === "cancelled" ? "badge--red" : "badge--yellow"}">
                ${s.status === "planned" ? "Planlı" : s.status === "cancelled" ? "İptal" : s.status === "postponed" ? "Ertelendi" : "Bitti"}</span>
              <button class="icon-btn" data-dels="${s.id}">${icon("trash", 14)}</button>
            </div>`).join("")}
        </div>
      </div>`).join("") || `<div class="card c12"><div class="empty"><b>Planlı ders yok</b>Yeni ders planlayarak başla.</div></div>`}
  </div>`;

  const mount = (root) => {
    root.querySelectorAll("[data-dels]").forEach((b) => b.addEventListener("click", () =>
      confirmDialog("Dersi sil", "Bu ders programdan kaldırılacak.", () => {
        const d = S.load();
        d.sessions = d.sessions.filter((s) => s.id !== b.dataset.dels);
        S.save(); toast("Ders silindi"); ctx.rerender();
      }, "Sil")));

    root.querySelector("[data-new]")?.addEventListener("click", () => {
      const list = S.allMembers();
      openModal(modalShell("Ders Planla", `
        <div class="field"><label>Üye</label>
          <select id="s-member">${list.map((m) => `<option value="${m.userId}">${esc(m.user.name)}</option>`).join("")}</select></div>
        <div class="row" style="gap:10px">
          <div class="field" style="flex:1"><label>Tarih</label><input id="s-date" type="date" value="${S.addDays(new Date(), 1)}"></div>
          <div class="field" style="flex:1"><label>Saat</label><input id="s-time" type="time" value="18:00"></div>
        </div>
        <div class="row" style="gap:10px">
          <div class="field" style="flex:1"><label>Ders tipi</label>
            <select id="s-type"><option>Kişisel Antrenman</option><option>Grup Dersi</option><option>Ölçüm & Değerlendirme</option></select></div>
          <div class="field" style="flex:1"><label>Kas grubu</label>
            <select id="s-group">${S.MUSCLE_GROUPS.map((g) => `<option value="${g.id}">${esc(g.name)}</option>`).join("")}</select></div>
        </div>
        <div class="field"><label>Salon / alan</label>
          <select id="s-room"><option>Stüdyo A</option><option>Fonksiyonel Alan</option><option>Ağırlık Salonu</option><option>Kardiyo Alanı</option></select></div>`,
        `<button class="btn" data-close>Vazgeç</button><button class="btn btn--primary" id="s-save">Planla</button>`, "calendar"),
        { onMount: (m) => m.querySelector("#s-save").addEventListener("click", () => {
          const d = S.load();
          const memberId = m.querySelector("#s-member").value;
          const date = m.querySelector("#s-date").value;
          const time = m.querySelector("#s-time").value;
          d.sessions.push({
            id: S.newId("s"), memberId, trainerId: ctx.user.id, date, time,
            type: m.querySelector("#s-type").value, group: m.querySelector("#s-group").value,
            status: "planned", room: m.querySelector("#s-room").value,
          });
          d.notifications.push({
            id: S.newId("nt"), memberId, from: ctx.user.id,
            title: "Yeni ders planlandı",
            body: `${S.fmtDate(date)} · ${time} · ${m.querySelector("#s-type").value} (${m.querySelector("#s-room").value})`,
            date: S.today(), read: false, kind: "info",
          });
          S.save(); closeModal(); toast("Ders planlandı ve üyeye bildirildi", "ok"); ctx.rerender();
        }) });
    });
  };
  return { html, mount };
}
