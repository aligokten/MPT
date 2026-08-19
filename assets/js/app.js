/* ============================================================
   MILAS PERSONAL TRAINING — uygulama çekirdeği
   Yönlendirme, kabuk (shell) ve giriş ekranı
   ============================================================ */
import * as S from "./store.js";
import { icon, logoMark, esc, initials, applyTheme, savedTheme, toast, confirmDialog } from "./ui.js";
import * as M from "./views/member.js";
import * as T from "./views/trainer.js";

const app = document.getElementById("app");

/* ---------- Menüler ---------- */
const MEMBER_NAV = [
  { path: "home",          label: "Ana Sayfa",   icon: "home",      view: M.home },
  { path: "workouts",      label: "Antrenmanlar",icon: "dumbbell",  view: M.workouts },
  { path: "schedule",      label: "Ders Programı", icon: "calendar",view: M.schedule },
  { path: "nutrition",     label: "Beslenme",    icon: "apple",     view: M.nutrition },
  { path: "progress",      label: "Gelişim",     icon: "chart",     view: M.progress },
  { path: "membership",    label: "Üyeliğim",    icon: "ticket",    view: M.membership },
  { path: "events",        label: "Etkinlikler", icon: "party",     view: M.events },
  { path: "gallery",       label: "Albüm",       icon: "image",     view: M.gallery },
  { path: "notifications", label: "Bildirimler", icon: "bell",      view: M.notifications },
];

const TRAINER_NAV = [
  { path: "t/dashboard", label: "Panel",         icon: "home",      view: T.dashboard },
  { path: "t/entry",     label: "Antrenman Gir", icon: "dumbbell",  view: T.entry },
  { path: "t/members",   label: "Üyeler",        icon: "users",     view: T.members },
  { path: "t/planning",  label: "Ders Planlama", icon: "calendar",  view: T.planning },
  { path: "t/requests",  label: "Talepler",      icon: "send",      view: T.requests },
  { path: "t/notify",    label: "Bildirimler",   icon: "bell",      view: T.notify },
  { path: "t/events",    label: "Etkinlikler",   icon: "party",     view: T.eventsAdmin },
];

/* Üst sekmelerde gösterilecekler (referans tasarımdaki pill menü) */
const TOP_TABS = {
  member: ["home", "workouts", "progress", "schedule"],
  trainer: ["t/dashboard", "t/entry", "t/members", "t/planning"],
};

/* ---------- Yönlendirme ---------- */
function parseHash() {
  const raw = location.hash.replace(/^#\/?/, "") || "";
  const [path, qs] = raw.split("?");
  const query = {};
  new URLSearchParams(qs || "").forEach((v, k) => (query[k] = v));
  return { path: path || "", query };
}

function render() {
  const user = S.currentUser();
  if (!user) return renderLogin();

  const nav = user.role === "trainer" ? TRAINER_NAV : MEMBER_NAV;
  let { path, query } = parseHash();
  if (!path || !nav.some((n) => n.path === path)) {
    path = nav[0].path;
    history.replaceState(null, "", `#/${path}`);
  }
  const item = nav.find((n) => n.path === path);

  const ctx = {
    user, query, path,
    rerender: () => render(),
    refreshBadge: () => updateBadge(user),
  };

  app.innerHTML = shell(user, nav, path);
  const outlet = app.querySelector("#outlet");
  const out = item.view(ctx);
  outlet.innerHTML = out.html;
  out.mount?.(outlet);

  bindShell(user, ctx);
  window.scrollTo({ top: 0 });
}

/* ---------- Kabuk ---------- */
function shell(user, nav, path) {
  const tabs = (TOP_TABS[user.role === "trainer" ? "trainer" : "member"] || [])
    .map((p) => nav.find((n) => n.path === p))
    .filter(Boolean);
  const unread = user.role === "member" ? S.unreadCount(user.id) : S.pendingRequests().length;

  return `
  <div class="shell">
    <aside class="rail">
      <div class="rail__logo">${logoMark(34)}</div>
      ${nav.map((n) => `
        <a class="rail__btn ${n.path === path ? "is-active" : ""}" href="#/${n.path}" title="${esc(n.label)}">
          ${icon(n.icon, 19)}
        </a>`).join("")}
      <div class="rail__spacer"></div>
      <button class="rail__btn" data-reset title="Demo verilerini sıfırla">${icon("refresh", 19)}</button>
      <button class="rail__btn" data-logout title="Çıkış yap">${icon("logout", 19)}</button>
    </aside>

    <main class="main">
      <div class="container">
        <header class="topbar">
          <nav class="tabs">
            ${tabs.map((t) => `
              <a class="tab ${t.path === path ? "is-active" : ""}" href="#/${t.path}">
                ${icon(t.icon, 15)} ${esc(t.label)}
              </a>`).join("")}
          </nav>

          <div class="topbar__right">
            <div class="theme-toggle">
              <button data-theme="light" class="${savedTheme() === "light" ? "is-active" : ""}" title="Açık tema">${icon("sun", 15)}</button>
              <button data-theme="dark" class="${savedTheme() === "dark" ? "is-active" : ""}" title="Koyu tema">${icon("moon", 15)}</button>
            </div>
            <a class="icon-btn" href="#/${user.role === "trainer" ? "t/requests" : "notifications"}" title="Bildirimler">
              ${icon("bell", 17)}
              ${unread ? `<span class="icon-btn__dot" data-badge>${unread}</span>` : ""}
            </a>
            <button class="avatar-btn" data-profile>
              <span class="avatar" style="background:linear-gradient(140deg,#ff8a3d,#e8490f)">${esc(initials(user.name))}</span>
              <span class="small">${esc(user.name.split(" ")[0])}</span>
              ${icon("chevron", 14)}
            </button>
          </div>
        </header>

        <div id="outlet"></div>
      </div>
    </main>
  </div>`;
}

function updateBadge(user) {
  const el = app.querySelector("[data-badge]");
  if (!el) return;
  const n = user.role === "member" ? S.unreadCount(user.id) : S.pendingRequests().length;
  if (n) el.textContent = n; else el.remove();
}

function bindShell(user, ctx) {
  app.querySelectorAll("[data-theme]").forEach((b) =>
    b.addEventListener("click", () => { applyTheme(b.dataset.theme); render(); }));

  app.querySelector("[data-logout]").addEventListener("click", () =>
    confirmDialog("Çıkış yap", "Oturumu kapatmak istediğine emin misin?", () => {
      S.logout(); location.hash = ""; render();
    }, "Çıkış yap"));

  app.querySelector("[data-reset]").addEventListener("click", () =>
    confirmDialog("Demo verilerini sıfırla",
      "Tüm kayıtlar başlangıç demo verisine döner. Eklediğin veriler silinir.", () => {
        S.reset(); toast("Demo verileri sıfırlandı", "ok"); render();
      }, "Sıfırla"));

  app.querySelector("[data-profile]").addEventListener("click", () => {
    const prof = user.role === "member" ? S.memberProfile(user.id) : null;
    import("./ui.js").then(({ openModal, modalShell }) => {
      openModal(modalShell("Profil", `
        <div class="row">
          <span class="avatar" style="width:56px;height:56px;font-size:18px;background:linear-gradient(140deg,#ff8a3d,#e8490f)">${esc(initials(user.name))}</span>
          <div><b style="font-size:16px">${esc(user.name)}</b>
            <div class="small muted">${esc(user.email)} · ${user.role === "trainer" ? "Antrenör" : "Üye"}</div></div>
        </div>
        ${prof ? `<div class="list mt-4">
          ${[["Telefon", prof.phone], ["Boy", prof.height + " cm"], ["Hedef", prof.goal],
             ["Üyelik başlangıcı", S.fmtDate(prof.joined)], ["Antrenör", S.userById(prof.trainerId)?.name]]
            .map(([k, v]) => `<div class="list__item"><div class="list__body"><span>${esc(k)}</span><b>${esc(v || "-")}</b></div></div>`).join("")}
        </div>` : ""}`,
        `<button class="btn" data-close>Kapat</button>`, "user"));
    });
  });
}

/* ---------- Giriş ekranı ---------- */
function renderLogin() {
  app.innerHTML = `
  <div class="auth">
    <div class="auth__art">
      <div class="row" style="gap:12px;position:relative;z-index:2">
        ${logoMark(38)}
        <div><b style="color:#fff;letter-spacing:.04em">MILAS</b>
          <div style="color:rgba(255,255,255,.8);font-size:11px;letter-spacing:.22em">PERSONAL TRAINING</div></div>
      </div>
      <div class="auth__quote">
        <h2>Her tekrar,<br>bir sonraki<br>versiyonun.</h2>
        <p>Antrenmanlarını, ölçümlerini, beslenmeni ve üyeliğini tek panelden takip et.
           Antrenörün girdiği her set anında burada.</p>
      </div>
      <div class="auth__stats">
        <div class="auth__stat"><b>320+</b><span>Aktif üye</span></div>
        <div class="auth__stat"><b>18</b><span>Haftalık ders</span></div>
        <div class="auth__stat"><b>9</b><span>Uzman antrenör</span></div>
      </div>
    </div>

    <div class="auth__panel">
      <div class="auth__box">
        <div class="auth__logo">
          ${logoMark(40)}
          <div><b style="letter-spacing:.04em">MILAS</b>
            <div class="small muted" style="letter-spacing:.2em">PERSONAL TRAINING</div></div>
        </div>
        <h1>Üye Girişi</h1>
        <p>Panele erişmek için hesabınla giriş yap.</p>

        <div class="auth__error" id="err"></div>
        <form id="login-form">
          <div class="field"><label>E-posta</label>
            <input id="email" type="email" autocomplete="username" value="ayse@milaspt.com" required></div>
          <div class="field"><label>Şifre</label>
            <input id="pass" type="password" autocomplete="current-password" value="1234" required></div>
          <button class="btn btn--primary btn--block mt-3" type="submit">${icon("logout", 16)} Giriş Yap</button>
        </form>

        <div class="auth__hint">
          <b>Demo hesapları</b><br>
          Üye: <code>ayse@milaspt.com</code> · <code>mert@milaspt.com</code> · <code>zeynep@milaspt.com</code><br>
          Antrenör: <code>koc@milaspt.com</code><br>
          Tüm hesapların şifresi: <code>1234</code>
        </div>
        <div class="row mt-4" style="gap:8px;flex-wrap:wrap">
          <button class="btn btn--sm" data-quick="ayse@milaspt.com">Üye olarak gir</button>
          <button class="btn btn--sm" data-quick="koc@milaspt.com">Antrenör olarak gir</button>
        </div>
      </div>
    </div>
  </div>`;

  const err = app.querySelector("#err");
  const submit = (email, pass) => {
    const u = S.login(email, pass);
    if (!u) {
      err.textContent = "E-posta veya şifre hatalı. Demo şifresi: 1234";
      err.classList.add("is-on");
      return;
    }
    location.hash = u.role === "trainer" ? "#/t/dashboard" : "#/home";
    render();
  };

  app.querySelector("#login-form").addEventListener("submit", (e) => {
    e.preventDefault();
    submit(app.querySelector("#email").value, app.querySelector("#pass").value);
  });
  app.querySelectorAll("[data-quick]").forEach((b) =>
    b.addEventListener("click", () => submit(b.dataset.quick, "1234")));
}

/* ---------- Başlat ---------- */
applyTheme(savedTheme());
S.load();
window.addEventListener("hashchange", render);
render();
