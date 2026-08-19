/* ============================================================
   Veri katmanı — localStorage tabanlı demo veritabanı
   ============================================================ */

const DB_KEY = "mpt.db.v3";

/* ---------- Tarih yardımcıları ---------- */
export const iso = (d) => {
  const x = new Date(d);
  return `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, "0")}-${String(x.getDate()).padStart(2, "0")}`;
};
export const today = () => iso(new Date());
export const addDays = (base, n) => {
  const d = new Date(base);
  d.setDate(d.getDate() + n);
  return iso(d);
};
export const daysBetween = (a, b) =>
  Math.round((new Date(b) - new Date(a)) / 86400000);

const AY = ["Ocak","Şubat","Mart","Nisan","Mayıs","Haziran","Temmuz","Ağustos","Eylül","Ekim","Kasım","Aralık"];
const GUN = ["Pazar","Pazartesi","Salı","Çarşamba","Perşembe","Cuma","Cumartesi"];

export const fmtDate = (s) => {
  const d = new Date(s);
  return `${d.getDate()} ${AY[d.getMonth()]} ${d.getFullYear()}`;
};
export const fmtShort = (s) => {
  const d = new Date(s);
  return `${d.getDate()} ${AY[d.getMonth()].slice(0, 3)}`;
};
export const dayName = (s) => GUN[new Date(s).getDay()];
const GUN_KISA = ["Paz", "Pzt", "Sal", "Çar", "Per", "Cum", "Cmt"];
export const dayShort = (s) => GUN_KISA[new Date(s).getDay()];
export const relative = (s) => {
  const diff = daysBetween(today(), s);
  if (diff === 0) return "Bugün";
  if (diff === 1) return "Yarın";
  if (diff === -1) return "Dün";
  if (diff < 0) return `${-diff} gün önce`;
  return `${diff} gün sonra`;
};

const uid = (p = "id") => `${p}_${Math.random().toString(36).slice(2, 9)}`;

/* ---------- Sabitler ---------- */
export const MUSCLE_GROUPS = [
  { id: "gogus",   name: "Göğüs",       icon: "chest" },
  { id: "sirt",    name: "Sırt",        icon: "back" },
  { id: "bacak",   name: "Bacak",       icon: "leg" },
  { id: "omuz",    name: "Omuz",        icon: "shoulder" },
  { id: "kol",     name: "Kol (Biceps/Triceps)", icon: "arm" },
  { id: "karin",   name: "Karın / Core", icon: "core" },
  { id: "kardiyo", name: "Kardiyo",     icon: "cardio" },
  { id: "fullbody",name: "Full Body",   icon: "body" },
];

export const EXERCISE_LIBRARY = {
  gogus:   ["Bench Press", "Incline Dumbbell Press", "Dumbbell Fly", "Cable Crossover", "Push Up", "Dips"],
  sirt:    ["Lat Pulldown", "Barbell Row", "Seated Cable Row", "Pull Up", "T-Bar Row", "Face Pull"],
  bacak:   ["Squat", "Leg Press", "Romanian Deadlift", "Leg Extension", "Leg Curl", "Lunge", "Calf Raise"],
  omuz:    ["Shoulder Press", "Lateral Raise", "Front Raise", "Rear Delt Fly", "Arnold Press", "Upright Row"],
  kol:     ["Barbell Curl", "Hammer Curl", "Preacher Curl", "Triceps Pushdown", "Skull Crusher", "Dips"],
  karin:   ["Plank", "Crunch", "Hanging Leg Raise", "Russian Twist", "Cable Crunch", "Mountain Climber"],
  kardiyo: ["Koşu Bandı", "Bisiklet", "Kürek", "Eliptik", "HIIT Sprint", "Ip Atlama"],
  fullbody:["Deadlift", "Clean & Press", "Kettlebell Swing", "Burpee", "Thruster", "Farmer Walk"],
};

export const MEAL_TYPES = ["Kahvaltı", "Ara Öğün", "Öğle", "İkindi", "Akşam", "Gece"];

/* ---------- Tohum veri ---------- */
function seed() {
  const t = new Date();
  const trainerId = "u_koc";

  const users = [
    { id: trainerId, role: "trainer", name: "Emre Yılmaz", email: "koc@milaspt.com", pass: "1234", title: "Baş Antrenör" },
    { id: "u_ayse",  role: "member", name: "Ayşe Demir",  email: "ayse@milaspt.com",  pass: "1234" },
    { id: "u_mert",  role: "member", name: "Mert Kaya",   email: "mert@milaspt.com",  pass: "1234" },
    { id: "u_zeynep",role: "member", name: "Zeynep Arslan", email: "zeynep@milaspt.com", pass: "1234" },
    { id: "u_can",   role: "member", name: "Can Öztürk",  email: "can@milaspt.com",   pass: "1234" },
  ];

  const members = [
    { userId: "u_ayse",  phone: "0532 111 22 33", birth: "1994-04-12", height: 168, startWeight: 74.5, goal: "Yağ yakımı & kondisyon", joined: addDays(t, -240), trainerId },
    { userId: "u_mert",  phone: "0533 444 55 66", birth: "1990-09-02", height: 182, startWeight: 88.0, goal: "Kas kütlesi artışı",     joined: addDays(t, -420), trainerId },
    { userId: "u_zeynep",phone: "0534 777 88 99", birth: "1998-01-25", height: 172, startWeight: 61.0, goal: "Güç & postür",           joined: addDays(t, -95),  trainerId },
    { userId: "u_can",   phone: "0535 000 11 22", birth: "1987-11-30", height: 178, startWeight: 95.5, goal: "Kilo verme",             joined: addDays(t, -30),  trainerId },
  ];

  const packages = [
    { id: uid("pk"), memberId: "u_ayse",  name: "PT 3x / Hafta — 6 Ay", total: 72, used: 51, start: addDays(t, -160), end: addDays(t, 22),  price: 24000, paid: 24000, freeze: 0 },
    { id: uid("pk"), memberId: "u_mert",  name: "PT 2x / Hafta — 3 Ay", total: 24, used: 21, start: addDays(t, -78),  end: addDays(t, 12),  price: 11000, paid: 8000,  freeze: 1 },
    { id: uid("pk"), memberId: "u_zeynep",name: "Grup Dersi Sınırsız — 1 Yıl", total: 0, used: 38, start: addDays(t, -95), end: addDays(t, 270), price: 18000, paid: 18000, freeze: 0 },
    { id: uid("pk"), memberId: "u_can",   name: "PT 3x / Hafta — 1 Ay Deneme", total: 12, used: 4, start: addDays(t, -30), end: addDays(t, 1), price: 4500, paid: 4500, freeze: 0 },
  ];

  /* --- Antrenman geçmişi --- */
  const plan = [
    ["gogus", ["Bench Press", "Incline Dumbbell Press", "Cable Crossover"]],
    ["sirt", ["Lat Pulldown", "Barbell Row", "Face Pull"]],
    ["bacak", ["Squat", "Leg Press", "Leg Curl"]],
    ["omuz", ["Shoulder Press", "Lateral Raise", "Rear Delt Fly"]],
    ["kol", ["Barbell Curl", "Triceps Pushdown", "Hammer Curl"]],
    ["kardiyo", ["Koşu Bandı", "Bisiklet"]],
  ];
  const workouts = [];
  members.forEach((m, mi) => {
    for (let i = 0; i < 26; i++) {
      const back = i * 2 + (mi % 2);
      if (back > 60) break;
      const date = addDays(t, -back);
      const [group, names] = plan[(i + mi) % plan.length];
      const exercises = names.map((name, ei) => ({
        name,
        sets: Array.from({ length: group === "kardiyo" ? 1 : 4 }, (_, si) => ({
          reps: group === "kardiyo" ? 1 : 12 - si * 2,
          weight: group === "kardiyo" ? 0 : Math.round((20 + ei * 10 + si * 5 + mi * 5) / 2.5) * 2.5,
          rest: 75,
        })),
        note: "",
      }));
      workouts.push({
        id: uid("w"), memberId: m.userId, trainerId, date, group,
        duration: group === "kardiyo" ? 35 : 62,
        rpe: 6 + ((i + mi) % 4),
        note: i === 0 ? "Form çok iyiydi, ağırlıkları kademeli artırıyoruz." : "",
        exercises,
      });
    }
  });

  /* --- Ağırlık / ölçüm --- */
  const measures = [];
  members.forEach((m) => {
    for (let i = 12; i >= 0; i--) {
      const drift = m.startWeight > 80 ? -0.55 : m.startWeight > 70 ? -0.42 : 0.18;
      measures.push({
        id: uid("ms"), memberId: m.userId, date: addDays(t, -i * 7),
        weight: +(m.startWeight + drift * (12 - i) + (i % 3 === 0 ? 0.3 : -0.2)).toFixed(1),
        fat: +(26 - (12 - i) * 0.35).toFixed(1),
        muscle: +(31 + (12 - i) * 0.22).toFixed(1),
        waist: +(84 - (12 - i) * 0.5).toFixed(1),
        chest: +(96 + (12 - i) * 0.1).toFixed(1),
        arm: +(31 + (12 - i) * 0.12).toFixed(1),
      });
    }
  });

  /* --- Beslenme --- */
  const mealPool = [
    ["Kahvaltı", "Yulaf + yaban mersini + protein tozu", 430, 32, 55, 9],
    ["Ara Öğün", "Badem + yeşil elma", 210, 6, 22, 12],
    ["Öğle", "Izgara tavuk + bulgur + salata", 620, 48, 62, 16],
    ["İkindi", "Yoğurt + ceviz", 240, 14, 12, 15],
    ["Akşam", "Somon + fırın sebze", 580, 42, 28, 30],
  ];
  const nutrition = [];
  members.forEach((m) => {
    for (let i = 0; i < 14; i++) {
      nutrition.push({
        id: uid("n"), memberId: m.userId, date: addDays(t, -i),
        water: 1.4 + ((i % 4) * 0.4),
        meals: mealPool.slice(0, 5 - (i % 2)).map(([type, name, kcal, p, c, f]) => ({
          id: uid("ml"), type, name,
          kcal: kcal + (i % 3) * 15, protein: p, carb: c, fat: f,
        })),
      });
    }
  });

  /* --- Ders programı --- */
  const sessions = [];
  const slots = ["07:30", "09:00", "18:00", "19:30"];
  members.forEach((m, mi) => {
    for (let i = -10; i <= 12; i++) {
      const d = new Date(t); d.setDate(d.getDate() + i);
      const dow = d.getDay();
      const isMemberDay = (dow + mi) % 3 === 0 && dow !== 0;
      if (!isMemberDay) continue;
      sessions.push({
        id: uid("s"), memberId: m.userId, trainerId, date: iso(d),
        time: slots[(i + mi + 10) % slots.length],
        type: (i + mi) % 4 === 0 ? "Grup Dersi" : "Kişisel Antrenman",
        group: plan[Math.abs(i + mi) % plan.length][0],
        status: i < 0 ? (Math.abs(i) === 5 ? "cancelled" : "done") : "planned",
        room: (i + mi) % 2 === 0 ? "Stüdyo A" : "Fonksiyonel Alan",
      });
    }
  });

  /* --- Etkinlikler --- */
  const events = [
    { id: uid("ev"), title: "Sabah Koşusu — Sahil Parkuru", date: addDays(t, 3),  time: "07:00", place: "Milas Sahil", capacity: 30, desc: "8 km tempolu koşu, ardından esneme ve kahvaltı.", attendees: ["u_mert"], cover: "#f05a1e" },
    { id: uid("ev"), title: "Vücut Analizi Günü (InBody)", date: addDays(t, 6),  time: "10:00", place: "MPT Stüdyo A", capacity: 40, desc: "Ücretsiz vücut kompozisyon ölçümü ve birebir değerlendirme.", attendees: ["u_ayse", "u_zeynep"], cover: "#b6f24a" },
    { id: uid("ev"), title: "Fonksiyonel Antrenman Workshop", date: addDays(t, 12), time: "18:30", place: "Fonksiyonel Alan", capacity: 20, desc: "Kettlebell ve TRX teknikleri üzerine 2 saatlik atölye.", attendees: [], cover: "#5aa9ff" },
    { id: uid("ev"), title: "Beslenme Semineri: Kış Dönemi", date: addDays(t, 19), time: "20:00", place: "Toplantı Salonu", capacity: 50, desc: "Diyetisyen Selin Ak ile mevsimsel beslenme planlaması.", attendees: ["u_ayse"], cover: "#ffc555" },
    { id: uid("ev"), title: "MPT Yıl Sonu Turnuvası", date: addDays(t, -8), time: "11:00", place: "MPT Ana Salon", capacity: 60, desc: "Deadlift & plank yarışması. Geçmiş etkinlik.", attendees: ["u_mert", "u_can"], cover: "#7c7c88" },
  ];

  /* --- Fotoğraf albümü --- */
  const photos = [];
  members.forEach((m) => {
    [0, 30, 60].forEach((back, i) => {
      photos.push({
        id: uid("ph"), memberId: m.userId, date: addDays(t, -back),
        title: ["Güncel durum", "1. ay", "2. ay"][i],
        tag: back === 0 ? "Güncel" : "Gelişim",
        src: null,
      });
    });
  });

  /* --- Bildirimler --- */
  const notifications = [
    { id: uid("nt"), memberId: "u_ayse", from: trainerId, title: "Yarınki antrenman saati değişti", body: "Merhaba Ayşe, yarınki seansı 18:00 yerine 19:30'a alıyoruz. Uygun musun?", date: addDays(t, 0), read: false, kind: "info" },
    { id: uid("nt"), memberId: "u_ayse", from: trainerId, title: "Bacak günü hedefin güncellendi", body: "Squat çalışma ağırlığını 45 kg'a çıkardım. Isınma setlerini atlama.", date: addDays(t, -2), read: false, kind: "workout" },
    { id: uid("nt"), memberId: "u_ayse", from: trainerId, title: "Paketin bitmek üzere", body: "Paketinde 21 seans kaldı ve 22 gün sonra sona eriyor. Yenileme için resepsiyona uğrayabilirsin.", date: addDays(t, -5), read: true, kind: "package" },
    { id: uid("nt"), memberId: "u_mert", from: trainerId, title: "Ödeme hatırlatması", body: "Paketinin 3.000 TL'lik bakiyesi bulunuyor.", date: addDays(t, -1), read: false, kind: "package" },
    { id: uid("nt"), memberId: "all", from: trainerId, title: "Salon bakım çalışması", body: "Cumartesi 09:00-12:00 arasında kardiyo alanı bakımda olacaktır.", date: addDays(t, -3), read: false, kind: "info" },
  ];

  /* --- Talepler --- */
  const requests = [
    { id: uid("rq"), memberId: "u_mert", sessionId: sessions.find(s => s.memberId === "u_mert" && s.status === "planned")?.id || null,
      type: "postpone", reason: "İş seyahati nedeniyle o saatte salonda olamayacağım.",
      newDate: addDays(t, 4), newTime: "19:30", status: "pending", createdAt: addDays(t, 0), response: "" },
    { id: uid("rq"), memberId: "u_zeynep", sessionId: sessions.find(s => s.memberId === "u_zeynep" && s.status === "planned")?.id || null,
      type: "cancel", reason: "Rahatsızlandım, bu haftayı dinlenerek geçireceğim.",
      newDate: "", newTime: "", status: "pending", createdAt: addDays(t, -1), response: "" },
    { id: uid("rq"), memberId: "u_ayse", sessionId: null,
      type: "postpone", reason: "Ailevi bir durum çıktı.", newDate: addDays(t, -4), newTime: "18:00",
      status: "approved", createdAt: addDays(t, -6), response: "Onaylandı, yeni saatte görüşürüz." },
  ];

  return { users, members, packages, workouts, measures, nutrition, sessions, events, photos, notifications, requests };
}

/* ---------- Store ---------- */
let db = null;

export function load() {
  if (db) return db;
  try {
    const raw = localStorage.getItem(DB_KEY);
    db = raw ? JSON.parse(raw) : seed();
  } catch {
    db = seed();
  }
  save();
  return db;
}
export function save() {
  try { localStorage.setItem(DB_KEY, JSON.stringify(db)); } catch { /* kota dolu olabilir */ }
}
export function reset() {
  db = seed();
  save();
}
export const newId = uid;

/* ---------- Oturum ---------- */
const SESSION_KEY = "mpt.session";
export function login(email, pass) {
  const d = load();
  const u = d.users.find(
    (x) => x.email.toLowerCase() === String(email).trim().toLowerCase() && x.pass === pass
  );
  if (!u) return null;
  localStorage.setItem(SESSION_KEY, u.id);
  return u;
}
export function logout() { localStorage.removeItem(SESSION_KEY); }
export function currentUser() {
  const id = localStorage.getItem(SESSION_KEY);
  if (!id) return null;
  return load().users.find((u) => u.id === id) || null;
}

/* ---------- Sorgular ---------- */
export const userById = (id) => load().users.find((u) => u.id === id);
export const memberProfile = (id) => load().members.find((m) => m.userId === id);
export const allMembers = () =>
  load().members.map((m) => ({ ...m, user: userById(m.userId) }));

export const packageOf = (id) => load().packages.find((p) => p.memberId === id);
export const workoutsOf = (id) =>
  load().workouts.filter((w) => w.memberId === id).sort((a, b) => b.date.localeCompare(a.date));
export const measuresOf = (id) =>
  load().measures.filter((m) => m.memberId === id).sort((a, b) => a.date.localeCompare(b.date));
export const nutritionOf = (id, date) =>
  load().nutrition.find((n) => n.memberId === id && n.date === date);
export const nutritionRange = (id) =>
  load().nutrition.filter((n) => n.memberId === id).sort((a, b) => a.date.localeCompare(b.date));
export const sessionsOf = (id) =>
  load().sessions.filter((s) => s.memberId === id).sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));
export const photosOf = (id) =>
  load().photos.filter((p) => p.memberId === id).sort((a, b) => b.date.localeCompare(a.date));
export const notificationsOf = (id) =>
  load().notifications
    .filter((n) => n.memberId === id || n.memberId === "all")
    .sort((a, b) => b.date.localeCompare(a.date));
export const unreadCount = (id) => notificationsOf(id).filter((n) => !n.read).length;
export const requestsOf = (id) =>
  load().requests.filter((r) => r.memberId === id).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
export const pendingRequests = () =>
  load().requests.filter((r) => r.status === "pending").sort((a, b) => b.createdAt.localeCompare(a.createdAt));

/* ---------- Türetilmiş metrikler ---------- */
export function weekVolume(memberId) {
  /* Son 7 günün gün gün toplam kaldırılan tonajı + süresi */
  const out = [];
  for (let i = 6; i >= 0; i--) {
    const date = addDays(new Date(), -i);
    const ws = load().workouts.filter((w) => w.memberId === memberId && w.date === date);
    const volume = ws.reduce((sum, w) =>
      sum + w.exercises.reduce((s, e) =>
        s + e.sets.reduce((v, st) => v + st.reps * st.weight, 0), 0), 0);
    out.push({
      date,
      label: dayShort(date),
      minutes: ws.reduce((s, w) => s + w.duration, 0),
      volume,
      groups: ws.map((w) => w.group),
    });
  }
  return out;
}

export function streak(memberId) {
  const dates = new Set(load().workouts.filter((w) => w.memberId === memberId).map((w) => w.date));
  let n = 0;
  for (let i = 0; i < 90; i++) {
    const d = addDays(new Date(), -i);
    if (dates.has(d)) n++;
    else if (i > 0 && n > 0) break;
  }
  return n;
}

export function groupDistribution(memberId, days = 30) {
  const from = addDays(new Date(), -days);
  const counts = {};
  load().workouts
    .filter((w) => w.memberId === memberId && w.date >= from)
    .forEach((w) => { counts[w.group] = (counts[w.group] || 0) + 1; });
  return MUSCLE_GROUPS
    .map((g) => ({ ...g, count: counts[g.id] || 0 }))
    .filter((g) => g.count > 0)
    .sort((a, b) => b.count - a.count);
}

export function nutritionTotals(entry) {
  const base = { kcal: 0, protein: 0, carb: 0, fat: 0 };
  if (!entry) return base;
  entry.meals.forEach((m) => {
    base.kcal += m.kcal; base.protein += m.protein; base.carb += m.carb; base.fat += m.fat;
  });
  return base;
}

export function bmi(memberId) {
  const p = memberProfile(memberId);
  const ms = measuresOf(memberId);
  if (!p || !ms.length) return null;
  const w = ms[ms.length - 1].weight;
  const h = p.height / 100;
  return { value: +(w / (h * h)).toFixed(1), weight: w };
}

export const DAILY_TARGET = { kcal: 2200, protein: 140, carb: 230, fat: 70, water: 3 };
