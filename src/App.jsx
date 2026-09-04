import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Dumbbell, Plus, X, Check, Play, Clock, TrendingUp, History as HistoryIcon,
  ListChecks, ChevronRight, ChevronLeft, Trophy, Trash2, Edit3, Save,
  Calculator, Scale, Timer, MoreVertical, Flame, ArrowLeft, Search, Award,
  Download, Upload, Database, CloudUpload
} from "lucide-react";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid
} from "recharts";
import * as XLSX from "xlsx";

/* ---------- Design tokens ---------- */
const C = {
  bg: "#0F1115",
  bg2: "#171A21",
  card: "#1D212B",
  cardHi: "#252A36",
  line: "#2C323F",
  text: "#F2F4F8",
  sub: "#8A93A6",
  dim: "#5B6475",
  accent: "#FF5A1F",      // signature energetic orange
  accentDim: "#7A3218",
  green: "#2ED573",
  blue: "#3B82F6",
  gold: "#FFC531",
};

/* ---------- Default exercise library (IT) ---------- */
const MUSCLES = ["Petto","Schiena","Spalle","Gambe","Bicipiti","Tricipiti","Addome"];
const EQUIP = ["Bilanciere","Manubri","Macchina","Cavi","Corpo libero"];

const DEFAULT_EXERCISES = [
  ["Panca piana bilanciere","Petto","Bilanciere"],
  ["Panca inclinata manubri","Petto","Manubri"],
  ["Chest press","Petto","Macchina"],
  ["Croci ai cavi","Petto","Cavi"],
  ["Panca piana manubri","Petto","Manubri"],
  ["Dip alle parallele","Petto","Corpo libero"],
  ["Stacco da terra","Schiena","Bilanciere"],
  ["Lat machine","Schiena","Cavi"],
  ["Rematore bilanciere","Schiena","Bilanciere"],
  ["Rematore manubrio","Schiena","Manubri"],
  ["Pulley basso","Schiena","Cavi"],
  ["Trazioni","Schiena","Corpo libero"],
  ["Military press bilanciere","Spalle","Bilanciere"],
  ["Alzate laterali manubri","Spalle","Manubri"],
  ["Shoulder press manubri","Spalle","Manubri"],
  ["Alzate frontali","Spalle","Manubri"],
  ["Alzate posteriori","Spalle","Manubri"],
  ["Arnold press","Spalle","Manubri"],
  ["Squat bilanciere","Gambe","Bilanciere"],
  ["Leg press","Gambe","Macchina"],
  ["Affondi manubri","Gambe","Manubri"],
  ["Leg extension","Gambe","Macchina"],
  ["Leg curl","Gambe","Macchina"],
  ["Stacco rumeno","Gambe","Bilanciere"],
  ["Hip thrust","Gambe","Bilanciere"],
  ["Calf raise","Gambe","Macchina"],
  ["Curl bilanciere","Bicipiti","Bilanciere"],
  ["Curl manubri","Bicipiti","Manubri"],
  ["Curl a martello","Bicipiti","Manubri"],
  ["Curl ai cavi","Bicipiti","Cavi"],
  ["Curl panca Scott","Bicipiti","Macchina"],
  ["French press","Tricipiti","Bilanciere"],
  ["Pushdown ai cavi","Tricipiti","Cavi"],
  ["Estensioni sopra la testa","Tricipiti","Manubri"],
  ["Crunch","Addome","Corpo libero"],
  ["Plank","Addome","Corpo libero"],
  ["Russian twist","Addome","Corpo libero"],
  ["Leg raise","Addome","Corpo libero"],
].map((e, i) => ({ id: `def-${i}`, name: e[0], muscle: e[1], equip: e[2], custom: false }));

/* Exercises from the user's REBEL scheda (stable ids, referenced by the example) */
const REBEL_EXERCISES = [
  ["rb01","Croci pectoral machine","Petto","Macchina"],
  ["rb02","Chest press vertical","Petto","Macchina"],
  ["rb03","Spinte con manubri su panca 59°","Petto","Manubri"],
  ["rb04","Alzate laterali al cavo","Spalle","Cavi"],
  ["rb05","Hammer curl alternato seduto","Bicipiti","Manubri"],
  ["rb06","Curl bilanciere EZ panca Scott","Bicipiti","Bilanciere"],
  ["rb07","Face pull al cavo","Spalle","Cavi"],
  ["rb08","Adductor machine","Gambe","Macchina"],
  ["rb09","Hack squat","Gambe","Macchina"],
  ["rb10","Leg extension (scheda)","Gambe","Macchina"],
  ["rb11","Lat machine presa inversa","Schiena","Cavi"],
  ["rb12","Super power row mono.","Schiena","Macchina"],
  ["rb13","Aperture posteriori peck back","Spalle","Macchina"],
  ["rb14","French press bilanciere EZ","Tricipiti","Bilanciere"],
  ["rb15","Alzate laterali multiflight","Spalle","Macchina"],
  ["rb16","Spinte panca 65° al multipower","Petto","Macchina"],
  ["rb17","Spinte su panca 32° al multipower","Petto","Macchina"],
  ["rb18","Croci alla multistation","Petto","Cavi"],
  ["rb19","Curl sbarra dritta al cavo basso","Bicipiti","Cavi"],
  ["rb20","Spider curl su panca 32°","Bicipiti","Manubri"],
  ["rb21","Dip su panca/parallele","Tricipiti","Corpo libero"],
  ["rb22","Rematore T-bar presa media","Schiena","Bilanciere"],
  ["rb23","High row mono. presa stretta","Schiena","Macchina"],
  ["rb24","Remate su panca 32°","Schiena","Manubri"],
  ["rb25","Leg curl sdraiato","Gambe","Macchina"],
  ["rb26","Hyperextension con manubri","Schiena","Corpo libero"],
  ["rb27","Leg press orizzontale","Gambe","Macchina"],
  ["rb28","Push down corda lunga","Tricipiti","Cavi"],
].map(e => ({ id: e[0], name: e[1], muscle: e[2], equip: e[3], custom: false }));

const BUILTIN = [...DEFAULT_EXERCISES, ...REBEL_EXERCISES];

/* The user's REBEL scheda as ready routines (name, exId, sets count, reps, rec, superset) */
const rex = (exId, sets, reps, rec, superset=false) => {
  const e = REBEL_EXERCISES.find(x => x.id === exId);
  return { exId, name: e.name, muscle: e.muscle, sets: Array.from({length:sets}, () => ({})), reps, rec, superset };
};
const EXAMPLE_SCHEDA = [
  { id:"ex-a1", name:"Allenamento 1", exercises:[
    rex("rb01",2,"10/12",90), rex("rb02",3,"8/10",90), rex("rb03",3,"8/10",90),
    rex("rb04",3,"10+10",90), rex("rb05",3,"8/10",null,true), rex("rb06",3,"12-10-8",90),
    rex("rb07",2,"12",60),
  ]},
  { id:"ex-a2", name:"Allenamento 2", exercises:[
    rex("rb08",2,"12",60), rex("rb09",3,"6/8",90), rex("rb10",3,"10/12",90),
    rex("rb11",3,"12-10-8",null,true), rex("rb12",3,"10+10",90),
    rex("rb13",2,"12",60), rex("rb14",3,"10",90),
  ]},
  { id:"ex-a3", name:"Allenamento 3", exercises:[
    rex("rb15",2,"10",90), rex("rb16",3,"6/8",90), rex("rb17",3,"8/10",90),
    rex("rb18",2,"10/12",90), rex("rb19",3,"10",null,true), rex("rb20",3,"8/10",90),
    rex("rb21",2,"MAX",60),
  ]},
  { id:"ex-a4", name:"Allenamento 4", exercises:[
    rex("rb22",3,"12-10-8",90), rex("rb23",3,"10+10",90), rex("rb24",2,"12",null,true),
    rex("rb25",3,"10",90), rex("rb26",3,"10",90), rex("rb27",3,"8/10",90),
    rex("rb28",3,"12",90),
  ]},
];

/* Convert a routine into an active workout, carrying reps target / rec / superset */
function routineToWorkout(r) {
  return {
    id: uid(), name: r.name, start: Date.now(),
    exercises: r.exercises.map(re => {
      const n = re.sets?.length || re.setsCount || 1;
      return {
        exId: re.exId, name: re.name, muscle: re.muscle, notes:"",
        target: re.reps || "", rec: re.rec ?? null, superset: !!re.superset,
        sets: Array.from({length:n}, () => ({ id:uid(), weight:"", reps:"", done:false, warmup:false })),
      };
    }),
  };
}
const normName = (s) => (s||"").toLowerCase().replace(/[^a-z0-9]/g,"");

/* Per-set target reps placeholder: "12-10-8" -> per set; "10/12","10+10","MAX" -> whole */
function targetForSet(target, i, total) {
  if (!target) return "";
  const t = String(target).trim();
  const parts = t.split("-").map(s => s.trim());
  if (parts.length === total && parts.every(p => /^\d+$/.test(p))) return parts[i];
  return t;
}

/* ---------- Storage helpers (browser localStorage — persists per-device/browser) ---------- */
const store = {
  async get(key, fallback) {
    try { const v = localStorage.getItem(key); return v != null ? JSON.parse(v) : fallback; }
    catch { return fallback; }
  },
  async set(key, val) {
    try { localStorage.setItem(key, JSON.stringify(val)); } catch (e) { console.error(e); }
  },
};

/* ---------- Utils ---------- */
const uid = () => Math.random().toString(36).slice(2, 10);
const fmtDate = (ts) => new Date(ts).toLocaleDateString("it-IT", { day:"2-digit", month:"short", year:"numeric" });
const fmtTime = (ts) => new Date(ts).toLocaleTimeString("it-IT", { hour:"2-digit", minute:"2-digit" });
const fmtDur = (s) => { const m=Math.floor(s/60), h=Math.floor(m/60); return h>0?`${h}h ${m%60}m`:`${m}m ${s%60}s`; };
// Epley formula
const est1RM = (w, r) => r > 0 ? Math.round(w * (1 + r/30)) : 0;

/* ---------- Excel backup engine ---------- */
const sanitizeSheet = (name, used) => {
  let s = (name || "Split").replace(/[\[\]\:\*\?\/\\]/g, " ").trim().slice(0, 28) || "Split";
  let base = s, i = 2;
  while (used.has(s.toLowerCase())) { s = `${base.slice(0,26)} ${i++}`; }
  used.add(s.toLowerCase());
  return s;
};

function buildWorkbook({ history, routines, exercises, bodyLog }) {
  const wb = XLSX.utils.book_new();
  const used = new Set();

  // Riepilogo
  const summary = [["Data","Split","Durata (min)","Volume (kg)","Serie","Esercizi"]];
  history.forEach(w => summary.push([
    fmtDate(w.start), w.name, Math.round((w.duration||0)/60),
    Math.round(w.volume||0), w.totalSets||0, w.exercises.length
  ]));
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(summary), sanitizeSheet("Riepilogo", used));

  // One tab per split (grouped by workout name)
  const groups = {};
  history.forEach(w => { (groups[w.name] = groups[w.name] || []).push(w); });
  Object.entries(groups).forEach(([name, ws]) => {
    const rows = [["Data","Esercizio","Serie","Kg","Reps","1RM stim.","Riscaldam."]];
    ws.forEach(w => w.exercises.forEach(ex => ex.sets.forEach((s, si) => rows.push([
      fmtDate(w.start), ex.name, si+1, +s.weight||0, +s.reps||0,
      est1RM(+s.weight||0, +s.reps||0), s.warmup ? "sì" : ""
    ]))));
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(rows), sanitizeSheet(name, used));
  });

  // Body weight
  const bw = [["Data","Peso (kg)"]];
  bodyLog.forEach(b => bw.push([fmtDate(b.date), b.kg]));
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(bw), sanitizeSheet("Peso corporeo", used));

  // Lossless backup (JSON chunked down column A of a "_dati" sheet)
  const payload = JSON.stringify({
    v: 1, exportedAt: Date.now(),
    exercises: exercises.filter(e => e.custom),
    routines, history, bodyLog,
  });
  const chunks = payload.match(/[\s\S]{1,30000}/g) || [""];
  const dataSheet = XLSX.utils.aoa_to_sheet(chunks.map(c => [c]));
  XLSX.utils.book_append_sheet(wb, dataSheet, "_dati");

  return wb;
}

function downloadWorkbook(wb) {
  const out = XLSX.write(wb, { bookType: "xlsx", type: "array" });
  const blob = new Blob([out], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `GymTracker_${new Date().toISOString().slice(0,10)}.xlsx`;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function parseWorkbook(file) {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => {
      try {
        const wb = XLSX.read(new Uint8Array(r.result), { type: "array" });
        const sh = wb.Sheets["_dati"];
        if (!sh || !sh["!ref"]) throw new Error("File senza backup dati");
        const range = XLSX.utils.decode_range(sh["!ref"]);
        let json = "";
        for (let row = range.s.r; row <= range.e.r; row++) {
          const cell = sh[XLSX.utils.encode_cell({ c: 0, r: row })];
          if (cell && cell.v != null) json += cell.v;
        }
        resolve(JSON.parse(json));
      } catch (e) { reject(e); }
    };
    r.onerror = () => reject(new Error("Lettura file fallita"));
    r.readAsArrayBuffer(file);
  });
}

/* ---------- App ---------- */
export default function App() {
  const [loaded, setLoaded] = useState(false);
  const [tab, setTab] = useState("workout");
  const [exercises, setExercises] = useState([]);
  const [routines, setRoutines] = useState([]);
  const [history, setHistory] = useState([]);
  const [bodyLog, setBodyLog] = useState([]);
  const [active, setActive] = useState(null);      // in-progress workout
  const [toast, setToast] = useState(null);

  // load all
  useEffect(() => {
    (async () => {
      const [cust, rt, hi, bl, act] = await Promise.all([
        store.get("customExercises", []),
        store.get("routines", []),
        store.get("history", []),
        store.get("bodyLog", []),
        store.get("activeWorkout", null),
      ]);
      setExercises([...BUILTIN, ...cust]);
      setRoutines(rt); setHistory(hi); setBodyLog(bl); setActive(act);
      setLoaded(true);
    })();
  }, []);

  const showToast = useCallback((msg, icon) => {
    setToast({ msg, icon }); setTimeout(() => setToast(null), 2600);
  }, []);

  const saveCustom = (list) => { const c = list.filter(e=>e.custom); store.set("customExercises", c); };
  const updateExercises = (list) => { setExercises(list); saveCustom(list); };
  const updateRoutines = (list) => { setRoutines(list); store.set("routines", list); };
  const updateHistory = (list) => { setHistory(list); store.set("history", list); };
  const updateBody = (list) => { setBodyLog(list); store.set("bodyLog", list); };
  const updateActive = (w) => { setActive(w); store.set("activeWorkout", w); };

  const restoreAll = (data, mode = "replace") => {
    if (data.exercises) {
      const custom = mode === "merge"
        ? [...exercises.filter(e => e.custom), ...data.exercises].filter((e, i, a) => a.findIndex(x => x.id === e.id) === i)
        : data.exercises;
      updateExercises([...BUILTIN, ...custom]);
    }
    const mergeById = (cur, inc) => mode === "merge"
      ? [...cur, ...inc].filter((e, i, a) => a.findIndex(x => x.id === e.id) === i) : inc;
    if (data.routines) updateRoutines(mergeById(routines, data.routines));
    if (data.history)  updateHistory(mergeById(history, data.history).sort((a,b)=>a.start-b.start));
    if (data.bodyLog)  updateBody(mode === "merge" ? [...bodyLog, ...data.bodyLog] : data.bodyLog);
  };

  if (!loaded) return (
    <div style={{background:C.bg,color:C.sub}} className="min-h-screen flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <Dumbbell className="animate-pulse" size={40} color={C.accent}/>
        <span>Carico i tuoi allenamenti…</span>
      </div>
    </div>
  );

  return (
    <div style={{background:C.bg, color:C.text}} className="min-h-screen font-sans antialiased select-none">
      <div className="max-w-md mx-auto pb-24 min-h-screen relative" style={{background:C.bg}}>
        {tab==="workout" && (
          <WorkoutTab
            active={active} setActive={updateActive}
            exercises={exercises} routines={routines}
            history={history} setHistory={updateHistory}
            showToast={showToast}
          />
        )}
        {tab==="history" && <HistoryTab history={history} setHistory={updateHistory} exercises={exercises}/>}
        {tab==="routines" && (
          <RoutinesTab routines={routines} setRoutines={updateRoutines}
            exercises={exercises} setExercises={updateExercises}
            active={active} setActive={updateActive} setTab={setTab} showToast={showToast}/>
        )}
        {tab==="exercises" && <ExercisesTab exercises={exercises} setExercises={updateExercises} history={history}/>}
        {tab==="progress" && <ProgressTab history={history} exercises={exercises} bodyLog={bodyLog} setBodyLog={updateBody}
          routines={routines} restoreAll={restoreAll} showToast={showToast}/>}

        {toast && (
          <div className="fixed left-1/2 -translate-x-1/2 bottom-24 z-50 px-4 py-2.5 rounded-xl flex items-center gap-2 shadow-lg"
               style={{background:C.cardHi, border:`1px solid ${C.line}`}}>
            {toast.icon}<span className="text-sm font-medium">{toast.msg}</span>
          </div>
        )}

        <BottomNav tab={tab} setTab={setTab} activeRunning={!!active}/>
      </div>
    </div>
  );
}

/* ---------- Bottom nav ---------- */
function BottomNav({ tab, setTab, activeRunning }) {
  const items = [
    ["workout","Allena",Play],
    ["history","Storico",HistoryIcon],
    ["routines","Routine",ListChecks],
    ["exercises","Esercizi",Dumbbell],
    ["progress","Progressi",TrendingUp],
  ];
  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md z-40"
         style={{background:C.bg2, borderTop:`1px solid ${C.line}`}}>
      <div className="grid grid-cols-5">
        {items.map(([id,label,Icon]) => {
          const on = tab===id;
          return (
            <button key={id} onClick={()=>setTab(id)}
              className="flex flex-col items-center gap-1 py-2.5 relative transition-colors"
              style={{color:on?C.accent:C.dim}}>
              <div className="relative">
                <Icon size={22}/>
                {id==="workout" && activeRunning &&
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full animate-pulse" style={{background:C.green}}/>}
              </div>
              <span className="text-[10px] font-medium">{label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

/* ---------- Header ---------- */
function Header({ title, sub, right, onBack }) {
  return (
    <div className="sticky top-0 z-30 px-4 pt-5 pb-3" style={{background:C.bg}}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 min-w-0">
          {onBack && <button onClick={onBack} className="p-1 -ml-1"><ArrowLeft size={22} color={C.sub}/></button>}
          <div className="min-w-0">
            <h1 className="text-2xl font-bold tracking-tight truncate">{title}</h1>
            {sub && <p className="text-sm truncate" style={{color:C.sub}}>{sub}</p>}
          </div>
        </div>
        {right}
      </div>
    </div>
  );
}

/* ---------- WORKOUT TAB ---------- */
function WorkoutTab({ active, setActive, exercises, routines, history, setHistory, showToast }) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const [restTimer, setRestTimer] = useState(null); // {end, dur}
  const [now, setNow] = useState(Date.now());
  const [elapsed, setElapsed] = useState(0);

  // tick
  useEffect(() => { const t = setInterval(()=>setNow(Date.now()), 1000); return ()=>clearInterval(t); }, []);
  useEffect(() => { if (active) setElapsed(Math.floor((now-active.start)/1000)); }, [now, active]);

  // rest timer sound-ish (vibrate)
  useEffect(() => {
    if (!restTimer) return;
    if (now >= restTimer.end) {
      if (navigator.vibrate) navigator.vibrate([200,100,200]);
      setRestTimer(null);
    }
  }, [now, restTimer]);

  const lastSetsFor = (exId) => {
    for (let i=history.length-1; i>=0; i--) {
      const ex = history[i].exercises.find(e=>e.exId===exId);
      if (ex) return ex.sets;
    }
    return null;
  };
  const prFor = (exId) => {
    let best = 0;
    history.forEach(w => w.exercises.forEach(e => {
      if (e.exId===exId) e.sets.forEach(s => { if(s.done && s.weight>best) best=s.weight; });
    }));
    return best;
  };

  const start = (fromRoutine) => {
    setActive(fromRoutine
      ? routineToWorkout(fromRoutine)
      : { id: uid(), name: "Allenamento", start: Date.now(), exercises: [] });
  };

  const update = (fn) => { const w = structuredClone(active); fn(w); setActive(w); };

  const addExercises = (picks) => {
    update(w => {
      picks.forEach(ex => w.exercises.push({
        exId: ex.id, name: ex.name, muscle: ex.muscle, notes:"",
        sets: [{ id:uid(), weight:"", reps:"", done:false, warmup:false }],
      }));
    });
    setPickerOpen(false);
  };

  const finish = () => {
    const done = structuredClone(active);
    done.exercises = done.exercises
      .map(e => ({ ...e, sets: e.sets.filter(s=>s.done) }))
      .filter(e => e.sets.length);
    if (!done.exercises.length) { discard(); showToast("Allenamento vuoto, annullato", <X size={16} color={C.accent}/>); return; }
    done.end = Date.now(); done.duration = Math.floor((done.end-done.start)/1000);
    done.volume = done.exercises.reduce((t,e)=>t+e.sets.reduce((s,x)=>s+(+x.weight||0)*(+x.reps||0),0),0);
    done.totalSets = done.exercises.reduce((t,e)=>t+e.sets.length,0);
    setHistory([...history, done]);
    setActive(null);
    showToast(`Salvato! ${Math.round(done.volume)} kg di volume`, <Check size={16} color={C.green}/>);
  };
  const discard = () => setActive(null);

  /* ----- no active workout: start screen ----- */
  if (!active) {
    return (
      <>
        <Header title="Allena" sub={history.length ? `${history.length} allenamenti completati` : "Inizia il tuo percorso"}/>
        <div className="px-4">
          <button onClick={()=>start()}
            className="w-full rounded-2xl py-4 flex items-center justify-center gap-2 font-bold text-lg shadow-lg active:scale-[.98] transition-transform"
            style={{background:C.accent, color:"#fff"}}>
            <Play size={22} fill="#fff"/> Avvia allenamento vuoto
          </button>

          {routines.length>0 && (
            <div className="mt-6">
              <p className="text-sm font-semibold mb-2" style={{color:C.sub}}>Le tue routine</p>
              <div className="space-y-2">
                {routines.map(r => (
                  <button key={r.id} onClick={()=>start(r)}
                    className="w-full rounded-xl p-3.5 flex items-center justify-between active:scale-[.98] transition-transform text-left"
                    style={{background:C.card, border:`1px solid ${C.line}`}}>
                    <div className="min-w-0">
                      <p className="font-semibold truncate">{r.name}</p>
                      <p className="text-xs truncate" style={{color:C.sub}}>
                        {r.exercises.map(e=>e.name).join(" · ")}
                      </p>
                    </div>
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ml-2" style={{background:C.accentDim}}>
                      <Play size={16} color={C.accent} fill={C.accent}/>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {history.length>0 && (
            <div className="mt-6">
              <p className="text-sm font-semibold mb-2" style={{color:C.sub}}>Ultimo allenamento</p>
              <MiniHistoryCard w={history[history.length-1]}/>
            </div>
          )}
        </div>
      </>
    );
  }

  /* ----- active workout ----- */
  const totalVol = active.exercises.reduce((t,e)=>t+e.sets.reduce((s,x)=>s+(x.done?(+x.weight||0)*(+x.reps||0):0),0),0);
  const doneSets = active.exercises.reduce((t,e)=>t+e.sets.filter(s=>s.done).length,0);

  return (
    <>
      {/* live stats bar */}
      <div className="sticky top-0 z-30 px-4 pt-5 pb-3" style={{background:C.bg}}>
        <div className="flex items-center justify-between mb-3">
          <input
            value={active.name}
            onChange={e=>update(w=>{w.name=e.target.value;})}
            className="text-2xl font-bold bg-transparent outline-none w-full mr-2"
            style={{color:C.text}}
          />
          <button onClick={finish}
            className="px-4 py-2 rounded-xl font-bold text-sm shrink-0 active:scale-95 transition-transform"
            style={{background:C.green, color:"#04220f"}}>Fine</button>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <Stat icon={<Clock size={15}/>} label="Durata" value={fmtDur(elapsed)}/>
          <Stat icon={<Flame size={15}/>} label="Volume" value={`${Math.round(totalVol)} kg`}/>
          <Stat icon={<Check size={15}/>} label="Serie" value={doneSets}/>
        </div>
      </div>

      {/* rest timer banner */}
      {restTimer && (
        <RestBanner end={restTimer.end} now={now}
          add={(s)=>setRestTimer(r=>({...r, end:r.end+s*1000}))}
          skip={()=>setRestTimer(null)}/>
      )}

      <div className="px-4 space-y-4 mt-1">
        {active.exercises.map((ex, ei) => (
          <ExerciseCard key={ex.exId+ei} ex={ex} idx={ei}
            last={lastSetsFor(ex.exId)} pr={prFor(ex.exId)}
            onUpdate={fn=>update(w=>fn(w.exercises[ei]))}
            onRemove={()=>update(w=>w.exercises.splice(ei,1))}
            onSetDone={(setDur)=>setRestTimer({ end: Date.now()+setDur*1000, dur:setDur })}
            showToast={showToast}
          />
        ))}

        <button onClick={()=>setPickerOpen(true)}
          className="w-full rounded-xl py-3.5 flex items-center justify-center gap-2 font-semibold active:scale-[.98] transition-transform"
          style={{background:C.card, border:`1px dashed ${C.line}`, color:C.accent}}>
          <Plus size={18}/> Aggiungi esercizio
        </button>

        <button onClick={()=>{ if(confirm("Annullare l'allenamento in corso?")) discard(); }}
          className="w-full rounded-xl py-3 font-medium text-sm active:scale-[.98] transition-transform"
          style={{color:C.accent, background:"transparent", border:`1px solid ${C.accentDim}`}}>
          Annulla allenamento
        </button>
      </div>

      {pickerOpen && (
        <ExercisePicker exercises={exercises} onClose={()=>setPickerOpen(false)} onPick={addExercises}/>
      )}
    </>
  );
}

function Stat({ icon, label, value }) {
  return (
    <div className="rounded-xl p-2.5" style={{background:C.card, border:`1px solid ${C.line}`}}>
      <div className="flex items-center gap-1 mb-0.5" style={{color:C.sub}}>{icon}<span className="text-[11px]">{label}</span></div>
      <p className="font-bold tabular-nums" style={{color:C.text}}>{value}</p>
    </div>
  );
}

/* ---------- Rest banner ---------- */
function RestBanner({ end, now, add, skip }) {
  const left = Math.max(0, Math.ceil((end-now)/1000));
  const mm = String(Math.floor(left/60)).padStart(2,"0");
  const ss = String(left%60).padStart(2,"0");
  return (
    <div className="sticky z-20 mx-4 mb-2 rounded-xl px-4 py-3 flex items-center justify-between" style={{top:150, background:C.accentDim, border:`1px solid ${C.accent}`}}>
      <div className="flex items-center gap-2">
        <Timer size={18} color={C.accent}/>
        <span className="font-bold tabular-nums text-lg" style={{color:C.text}}>{mm}:{ss}</span>
        <span className="text-xs" style={{color:C.sub}}>recupero</span>
      </div>
      <div className="flex items-center gap-2">
        <button onClick={()=>add(15)} className="px-2.5 py-1 rounded-lg text-xs font-semibold" style={{background:C.card,color:C.text}}>+15s</button>
        <button onClick={skip} className="px-2.5 py-1 rounded-lg text-xs font-semibold" style={{background:C.accent,color:"#fff"}}>Salta</button>
      </div>
    </div>
  );
}

/* ---------- Exercise card (during workout) ---------- */
function ExerciseCard({ ex, idx, last, pr, onUpdate, onRemove, onSetDone, showToast }) {
  const [menu, setMenu] = useState(false);
  const [restSec, setRestSec] = useState(ex.rec || 90);
  const [showCalc, setShowCalc] = useState(false);

  const toggleDone = (si) => {
    const set = ex.sets[si];
    const wasDone = set.done;
    onUpdate(e => { e.sets[si].done = !wasDone; });
    if (!wasDone) {
      // check PR
      const w = +set.weight || 0;
      if (w > 0 && w > pr && !set.warmup) showToast(`Nuovo record: ${w} kg!`, <Trophy size={16} color={C.gold}/>);
      onSetDone(restSec);
    }
  };

  return (
    <div className="rounded-2xl overflow-hidden" style={{background:C.card, border:`1px solid ${C.line}`}}>
      <div className="flex items-center justify-between px-3.5 py-3" style={{borderBottom:`1px solid ${C.line}`}}>
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-sm font-bold" style={{background:C.accentDim, color:C.accent}}>{idx+1}</div>
          <div className="min-w-0">
            <p className="font-bold truncate flex items-center gap-1.5" style={{color:C.accent}}>
              {ex.name}
              {ex.superset && <span className="text-[9px] px-1 py-0.5 rounded font-bold shrink-0" style={{background:C.gold,color:"#3a2b00"}}>SS</span>}
            </p>
            <p className="text-[11px]" style={{color:C.sub}}>
              {ex.muscle}
              {ex.target && <span className="ml-2" style={{color:C.text}}>obiettivo {ex.target}</span>}
              {pr>0 && <span className="ml-2" style={{color:C.gold}}>PR {pr}kg</span>}
            </p>
          </div>
        </div>
        <div className="relative shrink-0">
          <button onClick={()=>setMenu(m=>!m)} className="p-1.5"><MoreVertical size={18} color={C.sub}/></button>
          {menu && (
            <div className="absolute right-0 top-8 z-20 rounded-xl py-1 w-44 shadow-xl" style={{background:C.cardHi, border:`1px solid ${C.line}`}}
                 onMouseLeave={()=>setMenu(false)}>
              <div className="px-3 py-2 flex items-center justify-between">
                <span className="text-xs" style={{color:C.sub}}>Recupero</span>
                <select value={restSec} onChange={e=>setRestSec(+e.target.value)} className="bg-transparent text-sm font-semibold outline-none" style={{color:C.text}}>
                  {[30,45,60,90,120,150,180].map(v=><option key={v} value={v} style={{background:C.card}}>{v}s</option>)}
                </select>
              </div>
              <button onClick={()=>{setShowCalc(true);setMenu(false);}} className="w-full px-3 py-2 text-left text-sm flex items-center gap-2" style={{color:C.text}}>
                <Calculator size={15}/> Calcola dischi
              </button>
              <button onClick={()=>{onRemove();setMenu(false);}} className="w-full px-3 py-2 text-left text-sm flex items-center gap-2" style={{color:C.accent}}>
                <Trash2 size={15}/> Rimuovi esercizio
              </button>
            </div>
          )}
        </div>
      </div>

      {/* set header */}
      <div className="grid grid-cols-[28px_1fr_1fr_1fr_36px] gap-1 px-3.5 pt-2.5 pb-1 text-[11px] font-semibold" style={{color:C.dim}}>
        <span className="text-center">SET</span>
        <span className="text-center">PREC.</span>
        <span className="text-center">KG</span>
        <span className="text-center">REPS</span>
        <span></span>
      </div>

      {ex.sets.map((s, si) => {
        const prev = last?.[si];
        return (
          <div key={s.id} className="grid grid-cols-[28px_1fr_1fr_1fr_36px] gap-1 px-3.5 py-1.5 items-center"
               style={{background: s.done ? "rgba(46,213,115,0.08)" : "transparent"}}>
            <button onClick={()=>onUpdate(e=>{e.sets[si].warmup=!e.sets[si].warmup;})}
              className="text-center font-bold text-sm" style={{color: s.warmup?C.gold:C.sub}}>
              {s.warmup ? "W" : si+1}
            </button>
            <span className="text-center text-xs tabular-nums" style={{color:C.dim}}>
              {prev ? `${prev.weight||0}×${prev.reps||0}` : "—"}
            </span>
            <input inputMode="decimal" value={s.weight} placeholder={prev?String(prev.weight):"0"}
              onChange={e=>onUpdate(x=>{x.sets[si].weight=e.target.value;})}
              className="text-center rounded-lg py-1.5 outline-none tabular-nums font-semibold w-full"
              style={{background:C.bg2, color:C.text}}/>
            <input inputMode="numeric" value={s.reps}
              placeholder={targetForSet(ex.target, si, ex.sets.length) || (prev?String(prev.reps):"0")}
              onChange={e=>onUpdate(x=>{x.sets[si].reps=e.target.value;})}
              className="text-center rounded-lg py-1.5 outline-none tabular-nums font-semibold w-full"
              style={{background:C.bg2, color:C.text}}/>
            <button onClick={()=>toggleDone(si)}
              className="w-8 h-8 rounded-lg flex items-center justify-center mx-auto active:scale-90 transition-transform"
              style={{background: s.done?C.green:C.bg2, color: s.done?"#04220f":C.dim}}>
              <Check size={16} strokeWidth={3}/>
            </button>
          </div>
        );
      })}

      <div className="flex gap-2 px-3.5 py-2.5">
        <button onClick={()=>onUpdate(e=>{
          const l=e.sets[e.sets.length-1]||{};
          e.sets.push({id:uid(),weight:l.weight||"",reps:"",done:false,warmup:false});
        })}
          className="flex-1 rounded-lg py-2 text-sm font-semibold flex items-center justify-center gap-1" style={{background:C.bg2,color:C.text}}>
          <Plus size={15}/> Serie
        </button>
        {ex.sets.length>1 && (
          <button onClick={()=>onUpdate(e=>{e.sets.pop();})}
            className="px-3 rounded-lg py-2" style={{background:C.bg2,color:C.sub}}><X size={16}/></button>
        )}
      </div>

      {showCalc && <PlateCalc onClose={()=>setShowCalc(false)}/>}
    </div>
  );
}

/* ---------- Plate calculator ---------- */
function PlateCalc({ onClose }) {
  const [target, setTarget] = useState(60);
  const [bar, setBar] = useState(20);
  const plates = [25,20,15,10,5,2.5,1.25];
  const perSide = Math.max(0, (target - bar) / 2);
  let rem = perSide; const used = [];
  plates.forEach(p => { const n = Math.floor(rem/p); if(n>0){ used.push([p,n]); rem = +(rem-n*p).toFixed(3); } });

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center" style={{background:"rgba(0,0,0,.6)"}} onClick={onClose}>
      <div className="w-full max-w-md rounded-t-3xl p-5" style={{background:C.bg2, border:`1px solid ${C.line}`}} onClick={e=>e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-lg flex items-center gap-2"><Calculator size={20} color={C.accent}/> Dischi per lato</h3>
          <button onClick={onClose}><X size={22} color={C.sub}/></button>
        </div>
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div>
            <label className="text-xs" style={{color:C.sub}}>Peso totale (kg)</label>
            <input type="number" value={target} onChange={e=>setTarget(+e.target.value)}
              className="w-full rounded-xl py-2.5 px-3 mt-1 outline-none font-bold text-lg tabular-nums" style={{background:C.card,color:C.text}}/>
          </div>
          <div>
            <label className="text-xs" style={{color:C.sub}}>Bilanciere (kg)</label>
            <select value={bar} onChange={e=>setBar(+e.target.value)}
              className="w-full rounded-xl py-2.5 px-3 mt-1 outline-none font-bold text-lg" style={{background:C.card,color:C.text}}>
              {[20,15,10,7].map(b=><option key={b} value={b} style={{background:C.card}}>{b} kg</option>)}
            </select>
          </div>
        </div>
        <div className="rounded-xl p-4" style={{background:C.card}}>
          {used.length ? (
            <div className="flex flex-wrap gap-2">
              {used.map(([p,n],i)=>(
                <div key={i} className="px-3 py-2 rounded-lg font-bold tabular-nums" style={{background:C.accentDim,color:C.accent}}>
                  {n} × {p}kg
                </div>
              ))}
            </div>
          ) : <p className="text-sm" style={{color:C.sub}}>Solo il bilanciere.</p>}
          {rem>0.01 && <p className="text-xs mt-3" style={{color:C.gold}}>⚠ {rem}kg non raggiungibili per lato con questi dischi</p>}
        </div>
      </div>
    </div>
  );
}

/* ---------- Exercise picker ---------- */
function ExercisePicker({ exercises, onClose, onPick, single=false }) {
  const [q, setQ] = useState("");
  const [muscle, setMuscle] = useState("Tutti");
  const [sel, setSel] = useState([]);
  const filtered = exercises.filter(e =>
    (muscle==="Tutti"||e.muscle===muscle) && e.name.toLowerCase().includes(q.toLowerCase())
  );
  const toggle = (ex) => {
    if (single) { onPick([ex]); return; }
    setSel(s => s.find(x=>x.id===ex.id) ? s.filter(x=>x.id!==ex.id) : [...s, ex]);
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col max-w-md mx-auto" style={{background:C.bg}}>
      <div className="px-4 pt-5 pb-2 sticky top-0" style={{background:C.bg}}>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xl font-bold">Aggiungi esercizio</h2>
          <button onClick={onClose}><X size={24} color={C.sub}/></button>
        </div>
        <div className="flex items-center gap-2 rounded-xl px-3 py-2.5 mb-3" style={{background:C.card}}>
          <Search size={18} color={C.sub}/>
          <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Cerca…" autoFocus
            className="bg-transparent outline-none w-full" style={{color:C.text}}/>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4">
          {["Tutti",...MUSCLES].map(m=>(
            <button key={m} onClick={()=>setMuscle(m)}
              className="px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap"
              style={{background: muscle===m?C.accent:C.card, color: muscle===m?"#fff":C.sub}}>{m}</button>
          ))}
        </div>
      </div>
      <div className="flex-1 overflow-y-auto px-4 pb-28">
        {filtered.map(ex=>{
          const on = sel.find(x=>x.id===ex.id);
          return (
            <button key={ex.id} onClick={()=>toggle(ex)}
              className="w-full flex items-center justify-between py-3 px-1 text-left" style={{borderBottom:`1px solid ${C.line}`}}>
              <div>
                <p className="font-semibold" style={{color:on?C.accent:C.text}}>{ex.name}</p>
                <p className="text-xs" style={{color:C.sub}}>{ex.muscle} · {ex.equip}</p>
              </div>
              {!single && (
                <div className="w-6 h-6 rounded-md flex items-center justify-center shrink-0"
                     style={{background:on?C.accent:"transparent", border:`1.5px solid ${on?C.accent:C.line}`}}>
                  {on && <Check size={15} color="#fff" strokeWidth={3}/>}
                </div>
              )}
            </button>
          );
        })}
        {!filtered.length && <p className="text-center py-8" style={{color:C.sub}}>Nessun esercizio trovato</p>}
      </div>
      {!single && sel.length>0 && (
        <div className="sticky bottom-0 p-4 max-w-md mx-auto w-full" style={{background:C.bg}}>
          <button onClick={()=>onPick(sel)}
            className="w-full rounded-xl py-3.5 font-bold" style={{background:C.accent,color:"#fff"}}>
            Aggiungi {sel.length} eserciz{sel.length>1?"i":"o"}
          </button>
        </div>
      )}
    </div>
  );
}

/* ---------- HISTORY TAB ---------- */
function MiniHistoryCard({ w }) {
  return (
    <div className="rounded-xl p-3.5" style={{background:C.card, border:`1px solid ${C.line}`}}>
      <div className="flex items-center justify-between mb-1">
        <p className="font-semibold truncate">{w.name}</p>
        <span className="text-xs" style={{color:C.sub}}>{fmtDate(w.start)}</span>
      </div>
      <div className="flex gap-4 text-xs" style={{color:C.sub}}>
        <span className="flex items-center gap-1"><Clock size={13}/>{fmtDur(w.duration)}</span>
        <span className="flex items-center gap-1"><Flame size={13}/>{Math.round(w.volume)}kg</span>
        <span className="flex items-center gap-1"><Check size={13}/>{w.totalSets} serie</span>
      </div>
    </div>
  );
}

function HistoryTab({ history, setHistory, exercises }) {
  const [detail, setDetail] = useState(null);
  const sorted = [...history].reverse();

  if (detail) {
    const w = history.find(h=>h.id===detail);
    return (
      <>
        <Header title={w.name} sub={`${fmtDate(w.start)} · ${fmtTime(w.start)}`} onBack={()=>setDetail(null)}
          right={<button onClick={()=>{ if(confirm("Eliminare questo allenamento?")){ setHistory(history.filter(h=>h.id!==detail)); setDetail(null);} }}><Trash2 size={20} color={C.accent}/></button>}/>
        <div className="px-4">
          <div className="grid grid-cols-3 gap-2 mb-4">
            <Stat icon={<Clock size={15}/>} label="Durata" value={fmtDur(w.duration)}/>
            <Stat icon={<Flame size={15}/>} label="Volume" value={`${Math.round(w.volume)}kg`}/>
            <Stat icon={<Check size={15}/>} label="Serie" value={w.totalSets}/>
          </div>
          {w.exercises.map((ex,i)=>(
            <div key={i} className="rounded-xl p-3.5 mb-2.5" style={{background:C.card, border:`1px solid ${C.line}`}}>
              <p className="font-bold mb-2" style={{color:C.accent}}>{ex.name}</p>
              {ex.sets.map((s,si)=>(
                <div key={si} className="flex items-center gap-3 py-0.5 text-sm">
                  <span className="w-5 text-center font-bold" style={{color:s.warmup?C.gold:C.sub}}>{s.warmup?"W":si+1}</span>
                  <span className="tabular-nums" style={{color:C.text}}>{s.weight||0} kg × {s.reps||0}</span>
                  <span className="tabular-nums text-xs ml-auto" style={{color:C.dim}}>1RM ~{est1RM(+s.weight||0,+s.reps||0)}kg</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      </>
    );
  }

  const byMonth = {};
  sorted.forEach(w => { const k = new Date(w.start).toLocaleDateString("it-IT",{month:"long",year:"numeric"}); (byMonth[k]=byMonth[k]||[]).push(w); });

  return (
    <>
      <Header title="Storico" sub={`${history.length} allenamenti`}/>
      <div className="px-4">
        {!history.length && <Empty icon={<HistoryIcon size={36}/>} text="Nessun allenamento ancora. Completa il primo!"/>}
        {Object.entries(byMonth).map(([month, ws])=>(
          <div key={month} className="mb-4">
            <p className="text-xs font-semibold mb-2 capitalize" style={{color:C.dim}}>{month}</p>
            <div className="space-y-2">
              {ws.map(w=>(
                <button key={w.id} onClick={()=>setDetail(w.id)} className="w-full text-left active:scale-[.99] transition-transform">
                  <MiniHistoryCard w={w}/>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

/* ---------- ROUTINES TAB ---------- */
function RoutinesTab({ routines, setRoutines, exercises, setExercises, active, setActive, setTab, showToast }) {
  const [editing, setEditing] = useState(null); // routine object or "new"
  const [picker, setPicker] = useState(false);

  const startEdit = (r) => setEditing(r || { id:uid(), name:"Nuova routine", exercises:[] });
  const saveRoutine = () => {
    const exists = routines.find(r=>r.id===editing.id);
    setRoutines(exists ? routines.map(r=>r.id===editing.id?editing:r) : [...routines, editing]);
    setEditing(null);
  };

  // Add imported routines + any new exercises to the library (dedupe by name)
  const importRoutines = (newRoutines, newExercises=[]) => {
    if (newExercises.length) {
      const have = new Set(exercises.map(e=>normName(e.name)));
      const add = newExercises.filter(e=>!have.has(normName(e.name)));
      if (add.length) setExercises([...exercises, ...add]);
    }
    const existingNames = new Set(routines.map(r=>r.name.toLowerCase()));
    const fresh = newRoutines.filter(r=>!existingNames.has(r.name.toLowerCase()));
    if (!fresh.length) { showToast("Queste routine ci sono già", <X size={16} color={C.accent}/>); return; }
    setRoutines([...routines, ...fresh]);
    showToast(`${fresh.length} allenamenti importati`, <Check size={16} color={C.green}/>);
    setTab && setTab("routines");
  };

  if (editing) {
    return (
      <>
        <Header title="Modifica routine" onBack={()=>setEditing(null)}
          right={<button onClick={saveRoutine} className="px-3 py-1.5 rounded-lg font-bold text-sm" style={{background:C.green,color:"#04220f"}}>Salva</button>}/>
        <div className="px-4">
          <input value={editing.name} onChange={e=>setEditing({...editing,name:e.target.value})}
            className="w-full rounded-xl py-3 px-4 mb-4 outline-none font-semibold" style={{background:C.card,color:C.text}}/>
          {editing.exercises.map((ex,i)=>(
            <div key={i} className="flex items-center justify-between rounded-xl p-3.5 mb-2" style={{background:C.card, border:`1px solid ${C.line}`}}>
              <div>
                <p className="font-semibold" style={{color:C.text}}>{ex.name}</p>
                <p className="text-xs" style={{color:C.sub}}>{ex.muscle} · {ex.sets.length} serie</p>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={()=>setEditing({...editing, exercises: editing.exercises.map((e,j)=>j===i?{...e,sets:[...e.sets,{}]}:e)})}
                  className="w-7 h-7 rounded-lg flex items-center justify-center" style={{background:C.bg2}}><Plus size={15} color={C.sub}/></button>
                <span className="text-sm w-4 text-center tabular-nums" style={{color:C.text}}>{ex.sets.length}</span>
                <button onClick={()=>setEditing({...editing, exercises: editing.exercises.map((e,j)=>j===i&&e.sets.length>1?{...e,sets:e.sets.slice(0,-1)}:e)})}
                  className="w-7 h-7 rounded-lg flex items-center justify-center" style={{background:C.bg2}}><X size={15} color={C.sub}/></button>
                <button onClick={()=>setEditing({...editing, exercises: editing.exercises.filter((_,j)=>j!==i)})} className="ml-1">
                  <Trash2 size={16} color={C.accent}/></button>
              </div>
            </div>
          ))}
          <button onClick={()=>setPicker(true)}
            className="w-full rounded-xl py-3.5 flex items-center justify-center gap-2 font-semibold" style={{background:C.card, border:`1px dashed ${C.line}`, color:C.accent}}>
            <Plus size={18}/> Aggiungi esercizio
          </button>
        </div>
        {picker && (
          <ExercisePicker exercises={exercises} onClose={()=>setPicker(false)}
            onPick={picks=>{ setEditing({...editing, exercises:[...editing.exercises, ...picks.map(p=>({exId:p.id,name:p.name,muscle:p.muscle,sets:[{},{},{}]}))]}); setPicker(false); }}/>
        )}
      </>
    );
  }

  return (
    <>
      <Header title="Routine" sub="Template riutilizzabili"
        right={<button onClick={()=>startEdit()} className="w-9 h-9 rounded-xl flex items-center justify-center" style={{background:C.accent}}><Plus size={20} color="#fff"/></button>}/>
      <div className="px-4">
        <SchedaImport onImport={importRoutines} exercises={exercises} showToast={showToast}/>
        {!routines.length && <Empty icon={<ListChecks size={36}/>} text="Importa la tua scheda o creane una per avviare gli allenamenti più velocemente."/>}
        <div className="space-y-2.5">
          {routines.map(r=>(
            <div key={r.id} className="rounded-xl p-4" style={{background:C.card, border:`1px solid ${C.line}`}}>
              <div className="flex items-center justify-between mb-1">
                <p className="font-bold">{r.name}</p>
                <div className="flex gap-2">
                  <button onClick={()=>startEdit(r)}><Edit3 size={17} color={C.sub}/></button>
                  <button onClick={()=>{ if(confirm("Eliminare la routine?")) setRoutines(routines.filter(x=>x.id!==r.id)); }}><Trash2 size={17} color={C.accent}/></button>
                </div>
              </div>
              <p className="text-xs mb-3" style={{color:C.sub}}>{r.exercises.map(e=>e.name).join(" · ")||"Nessun esercizio"}</p>
              <button onClick={()=>{ setActive(routineToWorkout(r)); setTab("workout"); }}
                className="w-full rounded-lg py-2.5 font-semibold flex items-center justify-center gap-2" style={{background:C.accentDim,color:C.accent}}>
                <Play size={16} fill={C.accent}/> Avvia routine
              </button>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

/* ---------- Scheda import (AI-powered) ---------- */
const fileToB64 = (file) => new Promise((res, rej) => {
  const r = new FileReader();
  r.onload = () => res(String(r.result).split(",")[1]);
  r.onerror = () => rej(new Error("Lettura file fallita"));
  r.readAsDataURL(file);
});

const guessEquip = (name) => {
  const n = name.toLowerCase();
  if (/cavo|cavi|pulley|multistation/.test(n)) return "Cavi";
  if (/manubr|hammer|manubrio/.test(n)) return "Manubri";
  if (/bilanciere|ez|sbarra|bar\b|t-bar/.test(n)) return "Bilanciere";
  if (/dip|trazion|hyperext|plank|crunch|parallele/.test(n)) return "Corpo libero";
  return "Macchina";
};

async function parseSchedaWithAI(file) {
  // L'analisi AI del PDF/foto richiede una funzione server con una chiave API
  // (vedi guida "sync automatico con backend"). In questa build statica per
  // GitHub Pages è disattivata: usa "Scheda d'esempio" oppure crea/modifica
  // la routine a mano, o chiedi a Claude di prepararti il JSON da incollare.
  throw new Error("Non disponibile in questa versione offline. Usa \"Scheda d'esempio\" o crea la routine a mano.");
}

// Turn extracted workouts into routines + new library exercises
function workoutsToRoutines(workouts, library) {
  const byName = new Map(library.map(e => [normName(e.name), e]));
  const newExercises = [];
  const routines = workouts.map(w => ({
    id: uid(), name: w.name || "Allenamento",
    exercises: (w.exercises||[]).map(ex => {
      let lib = byName.get(normName(ex.name));
      if (!lib) {
        lib = { id:"cust-"+uid(), name:ex.name, muscle: MUSCLES.includes(ex.muscle)?ex.muscle:"Petto", equip:guessEquip(ex.name), custom:true };
        byName.set(normName(ex.name), lib); newExercises.push(lib);
      }
      const n = Math.max(1, +ex.sets || 1);
      return { exId:lib.id, name:lib.name, muscle:lib.muscle, sets:Array.from({length:n},()=>({})),
               reps: ex.reps||"", rec: ex.rec ?? null, superset: !!ex.superset };
    }),
  }));
  return { routines, newExercises };
}

function SchedaImport({ onImport, exercises, showToast }) {
  const loadExample = () => {
    const routines = EXAMPLE_SCHEDA.map(r => ({ ...r, id: uid(),
      exercises: r.exercises.map(ex => ({ ...ex, sets: ex.sets.map(()=>({})) })) }));
    onImport(routines, []);
  };

  return (
    <div className="rounded-2xl p-4 mb-4" style={{background:C.card, border:`1px solid ${C.line}`}}>
      <div className="flex items-center gap-2 mb-1">
        <CloudUpload size={18} color={C.accent}/><span className="font-bold">Importa scheda</span>
      </div>
      <p className="text-xs mb-3.5" style={{color:C.sub}}>
        In questa versione l'analisi automatica da PDF/foto non è disponibile (serve un servizio online).
        Carica la scheda d'esempio o crea/modifica una routine a mano.
      </p>
      <button onClick={loadExample}
        className="w-full rounded-xl py-3 flex items-center justify-center gap-2 active:scale-95 transition-transform"
        style={{background:C.accent, color:"#fff"}}>
        <ListChecks size={20}/><span className="text-sm font-semibold">Carica scheda d'esempio</span>
      </button>
    </div>
  );
}

/* ---------- EXERCISES TAB ---------- */
function ExercisesTab({ exercises, setExercises, history }) {
  const [q, setQ] = useState("");
  const [muscle, setMuscle] = useState("Tutti");
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ name:"", muscle:"Petto", equip:"Bilanciere" });

  const filtered = exercises.filter(e=>(muscle==="Tutti"||e.muscle===muscle)&&e.name.toLowerCase().includes(q.toLowerCase()));
  const timesUsed = (exId) => history.reduce((t,w)=>t+(w.exercises.some(e=>e.exId===exId)?1:0),0);

  const add = () => {
    if(!form.name.trim()) return;
    setExercises([...exercises, { id:"cust-"+uid(), ...form, name:form.name.trim(), custom:true }]);
    setForm({ name:"", muscle:"Petto", equip:"Bilanciere" }); setAdding(false);
  };

  return (
    <>
      <Header title="Esercizi" sub={`${exercises.length} disponibili`}
        right={<button onClick={()=>setAdding(true)} className="w-9 h-9 rounded-xl flex items-center justify-center" style={{background:C.accent}}><Plus size={20} color="#fff"/></button>}/>
      <div className="px-4">
        <div className="flex items-center gap-2 rounded-xl px-3 py-2.5 mb-3" style={{background:C.card}}>
          <Search size={18} color={C.sub}/>
          <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Cerca esercizio…" className="bg-transparent outline-none w-full" style={{color:C.text}}/>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4">
          {["Tutti",...MUSCLES].map(m=>(
            <button key={m} onClick={()=>setMuscle(m)} className="px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap"
              style={{background:muscle===m?C.accent:C.card, color:muscle===m?"#fff":C.sub}}>{m}</button>
          ))}
        </div>
        <div className="mt-1">
          {filtered.map(ex=>(
            <div key={ex.id} className="flex items-center justify-between py-3" style={{borderBottom:`1px solid ${C.line}`}}>
              <div>
                <p className="font-semibold flex items-center gap-2">{ex.name}
                  {ex.custom && <span className="text-[10px] px-1.5 py-0.5 rounded" style={{background:C.accentDim,color:C.accent}}>tuo</span>}</p>
                <p className="text-xs" style={{color:C.sub}}>{ex.muscle} · {ex.equip} · usato {timesUsed(ex.id)}×</p>
              </div>
              {ex.custom && <button onClick={()=>setExercises(exercises.filter(e=>e.id!==ex.id))}><Trash2 size={16} color={C.accent}/></button>}
            </div>
          ))}
        </div>
      </div>

      {adding && (
        <div className="fixed inset-0 z-50 flex items-end justify-center" style={{background:"rgba(0,0,0,.6)"}} onClick={()=>setAdding(false)}>
          <div className="w-full max-w-md rounded-t-3xl p-5" style={{background:C.bg2,border:`1px solid ${C.line}`}} onClick={e=>e.stopPropagation()}>
            <h3 className="font-bold text-lg mb-4">Nuovo esercizio</h3>
            <input value={form.name} onChange={e=>setForm({...form,name:e.target.value})} placeholder="Nome esercizio" autoFocus
              className="w-full rounded-xl py-3 px-4 mb-3 outline-none" style={{background:C.card,color:C.text}}/>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <select value={form.muscle} onChange={e=>setForm({...form,muscle:e.target.value})} className="rounded-xl py-3 px-3 outline-none" style={{background:C.card,color:C.text}}>
                {MUSCLES.map(m=><option key={m} style={{background:C.card}}>{m}</option>)}
              </select>
              <select value={form.equip} onChange={e=>setForm({...form,equip:e.target.value})} className="rounded-xl py-3 px-3 outline-none" style={{background:C.card,color:C.text}}>
                {EQUIP.map(m=><option key={m} style={{background:C.card}}>{m}</option>)}
              </select>
            </div>
            <button onClick={add} className="w-full rounded-xl py-3.5 font-bold" style={{background:C.accent,color:"#fff"}}>Aggiungi</button>
          </div>
        </div>
      )}
    </>
  );
}

/* ---------- PROGRESS TAB ---------- */
function ProgressTab({ history, exercises, bodyLog, setBodyLog, routines, restoreAll, showToast }) {
  const [exId, setExId] = useState(null);
  const [picker, setPicker] = useState(false);
  const [bw, setBw] = useState("");

  // aggregate stats
  const totalVol = history.reduce((t,w)=>t+w.volume,0);
  const totalSets = history.reduce((t,w)=>t+w.totalSets,0);
  const streak = calcStreak(history);

  // per-exercise progression
  const exData = [];
  if (exId) {
    history.forEach(w => {
      const ex = w.exercises.find(e=>e.exId===exId);
      if (ex) {
        const best = ex.sets.filter(s=>!s.warmup).reduce((b,s)=>Math.max(b, est1RM(+s.weight||0,+s.reps||0)),0);
        const topW = ex.sets.reduce((b,s)=>Math.max(b,+s.weight||0),0);
        if (best>0) exData.push({ date:fmtDate(w.start), e1rm:best, top:topW });
      }
    });
  }
  const selEx = exercises.find(e=>e.id===exId);

  const addBw = () => { if(!bw) return; setBodyLog([...bodyLog, {date:Date.now(), kg:+bw}]); setBw(""); };
  const bwData = bodyLog.map(b=>({ date:fmtDate(b.date), kg:b.kg }));

  return (
    <>
      <Header title="Progressi"/>
      <div className="px-4">
        <div className="grid grid-cols-2 gap-2.5 mb-5">
          <BigStat icon={<Flame size={18}/>} label="Volume totale" value={`${(totalVol/1000).toFixed(1)}t`} color={C.accent}/>
          <BigStat icon={<Award size={18}/>} label="Allenamenti" value={history.length} color={C.blue}/>
          <BigStat icon={<Check size={18}/>} label="Serie totali" value={totalSets} color={C.green}/>
          <BigStat icon={<Flame size={18}/>} label="Streak" value={`${streak} sett.`} color={C.gold}/>
        </div>

        {/* Exercise progression */}
        <div className="rounded-2xl p-4 mb-5" style={{background:C.card,border:`1px solid ${C.line}`}}>
          <button onClick={()=>setPicker(true)} className="w-full flex items-center justify-between mb-3">
            <span className="font-bold">{selEx ? selEx.name : "Scegli un esercizio"}</span>
            <ChevronRight size={18} color={C.sub}/>
          </button>
          {exId && exData.length>1 ? (
            <>
              <ResponsiveContainer width="100%" height={180}>
                <LineChart data={exData} margin={{top:5,right:5,left:-20,bottom:0}}>
                  <CartesianGrid stroke={C.line} vertical={false}/>
                  <XAxis dataKey="date" tick={{fill:C.dim,fontSize:10}} tickLine={false} axisLine={false}/>
                  <YAxis tick={{fill:C.dim,fontSize:10}} tickLine={false} axisLine={false}/>
                  <Tooltip contentStyle={{background:C.cardHi,border:`1px solid ${C.line}`,borderRadius:12,color:C.text}}/>
                  <Line type="monotone" dataKey="e1rm" name="1RM stim." stroke={C.accent} strokeWidth={2.5} dot={{r:3,fill:C.accent}}/>
                  <Line type="monotone" dataKey="top" name="Peso max" stroke={C.blue} strokeWidth={2} dot={{r:2}}/>
                </LineChart>
              </ResponsiveContainer>
              <div className="flex justify-center gap-4 mt-2 text-xs" style={{color:C.sub}}>
                <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 rounded" style={{background:C.accent}}/>1RM stimato</span>
                <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 rounded" style={{background:C.blue}}/>Peso massimo</span>
              </div>
            </>
          ) : (
            <p className="text-sm text-center py-6" style={{color:C.sub}}>
              {exId ? "Servono almeno 2 allenamenti con questo esercizio." : "Seleziona un esercizio per vedere la progressione."}
            </p>
          )}
        </div>

        {/* Body weight */}
        <div className="rounded-2xl p-4" style={{background:C.card,border:`1px solid ${C.line}`}}>
          <div className="flex items-center gap-2 mb-3">
            <Scale size={18} color={C.green}/><span className="font-bold">Peso corporeo</span>
          </div>
          <div className="flex gap-2 mb-3">
            <input inputMode="decimal" value={bw} onChange={e=>setBw(e.target.value)} placeholder="kg oggi"
              className="flex-1 rounded-xl py-2.5 px-3 outline-none tabular-nums" style={{background:C.bg2,color:C.text}}/>
            <button onClick={addBw} className="px-4 rounded-xl font-semibold" style={{background:C.green,color:"#04220f"}}>Salva</button>
          </div>
          {bwData.length>1 && (
            <ResponsiveContainer width="100%" height={140}>
              <LineChart data={bwData} margin={{top:5,right:5,left:-20,bottom:0}}>
                <CartesianGrid stroke={C.line} vertical={false}/>
                <XAxis dataKey="date" tick={{fill:C.dim,fontSize:10}} tickLine={false} axisLine={false}/>
                <YAxis domain={["auto","auto"]} tick={{fill:C.dim,fontSize:10}} tickLine={false} axisLine={false}/>
                <Tooltip contentStyle={{background:C.cardHi,border:`1px solid ${C.line}`,borderRadius:12,color:C.text}}/>
                <Line type="monotone" dataKey="kg" stroke={C.green} strokeWidth={2.5} dot={{r:3,fill:C.green}}/>
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        <BackupSection history={history} routines={routines} exercises={exercises}
          bodyLog={bodyLog} restoreAll={restoreAll} showToast={showToast}/>
      </div>

      {picker && (
        <ExercisePicker exercises={exercises} single onClose={()=>setPicker(false)}
          onPick={picks=>{ setExId(picks[0].id); setPicker(false); }}/>
      )}
    </>
  );
}

/* ---------- Backup / Excel sync ---------- */
function BackupSection({ history, routines, exercises, bodyLog, restoreAll, showToast }) {
  const fileRef = useRef(null);
  const [busy, setBusy] = useState(false);

  const exportXlsx = () => {
    if (!history.length && !routines.length) { showToast("Niente da esportare ancora", <X size={16} color={C.accent}/>); return; }
    try {
      downloadWorkbook(buildWorkbook({ history, routines, exercises, bodyLog }));
      showToast("Excel esportato", <Check size={16} color={C.green}/>);
    } catch (e) { showToast("Errore export: " + e.message, <X size={16} color={C.accent}/>); }
  };

  const onFile = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setBusy(true);
    try {
      const data = await parseWorkbook(file);
      const mode = (history.length || routines.length)
        ? (confirm("Vuoi UNIRE questi dati a quelli attuali?\n\nOK = unisci · Annulla = sostituisci tutto") ? "merge" : "replace")
        : "replace";
      restoreAll(data, mode);
      showToast("Dati importati", <Check size={16} color={C.green}/>);
    } catch (err) {
      showToast("File non valido: " + err.message, <X size={16} color={C.accent}/>);
    } finally { setBusy(false); }
  };

  const lastWorkout = history.length ? fmtDate(history[history.length-1].start) : "—";

  return (
    <div className="rounded-2xl p-4 mt-5" style={{background:C.card, border:`1px solid ${C.line}`}}>
      <div className="flex items-center gap-2 mb-1">
        <Database size={18} color={C.accent}/><span className="font-bold">Backup Excel</span>
      </div>
      <p className="text-xs mb-4" style={{color:C.sub}}>
        Un file .xlsx con una scheda per ogni split. Contiene un backup completo:
        importalo su un nuovo dispositivo per ritrovare tutto.
      </p>

      <div className="grid grid-cols-2 gap-2.5 mb-3">
        <button onClick={exportXlsx}
          className="rounded-xl py-3 flex flex-col items-center gap-1.5 active:scale-95 transition-transform"
          style={{background:C.accentDim, color:C.accent}}>
          <Download size={20}/><span className="text-sm font-semibold">Esporta</span>
        </button>
        <button onClick={()=>fileRef.current?.click()} disabled={busy}
          className="rounded-xl py-3 flex flex-col items-center gap-1.5 active:scale-95 transition-transform"
          style={{background:C.bg2, color:C.text, opacity:busy?0.5:1}}>
          <Upload size={20}/><span className="text-sm font-semibold">{busy?"Importo…":"Importa"}</span>
        </button>
      </div>

      <div className="flex items-center justify-between text-xs px-1" style={{color:C.dim}}>
        <span>{history.length} allenamenti salvati</span>
        <span>Ultimo: {lastWorkout}</span>
      </div>

      <input ref={fileRef} type="file" accept=".xlsx,.xls" onChange={onFile} className="hidden"/>
    </div>
  );
}

function BigStat({ icon, label, value, color }) {
  return (
    <div className="rounded-2xl p-4" style={{background:C.card,border:`1px solid ${C.line}`}}>
      <div style={{color}} className="mb-2">{icon}</div>
      <p className="text-2xl font-bold tabular-nums">{value}</p>
      <p className="text-xs" style={{color:C.sub}}>{label}</p>
    </div>
  );
}

function calcStreak(history) {
  if (!history.length) return 0;
  const weeks = new Set(history.map(w=>{ const d=new Date(w.start); const on=new Date(d); on.setDate(d.getDate()-((d.getDay()+6)%7)); return on.toISOString().slice(0,10); }));
  let streak=0; const cur=new Date(); cur.setDate(cur.getDate()-((cur.getDay()+6)%7));
  for(;;){ const k=cur.toISOString().slice(0,10); if(weeks.has(k)){streak++; cur.setDate(cur.getDate()-7);} else break; }
  return streak;
}

/* ---------- Empty state ---------- */
function Empty({ icon, text }) {
  return (
    <div className="flex flex-col items-center text-center py-16 px-6" style={{color:C.dim}}>
      <div className="mb-3" style={{color:C.line}}>{icon}</div>
      <p className="text-sm" style={{color:C.sub}}>{text}</p>
    </div>
  );
}
