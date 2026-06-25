import { useState, useEffect, useCallback, useMemo } from "react";
import { Plane, RotateCcw, CheckCircle2, Circle, Radio, Gauge as GaugeIcon } from "lucide-react";
import { predictCGPA } from "./prediction";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";

/* ----------------------------- CURRICULUM DATA ---------------------------- */
const SEMESTERS = [
  {
    id: 1,
    name: "Year 1 · Semester 1",
    courses: [
      { code: "PHY 4101", title: "Physics", type: "T", credit: 3.0 },
      { code: "AVE 4101", title: "Electrical Circuits Analysis I", type: "T", credit: 3.0 },
      { code: "MAT 4101", title: "Differential and Integral Calculus", type: "T", credit: 3.0 },
      { code: "ASE 4101", title: "Introduction to Aeronautical Engineering", type: "T", credit: 3.0 },
      { code: "HUM 4101", title: "Communicative English", type: "T", credit: 3.0 },
      { code: "PHY 4102", title: "Physics Sessional", type: "S", credit: 1.5 },
      { code: "AVE 4102", title: "Electrical Circuits Analysis I Sessional", type: "S", credit: 1.5 },
      { code: "ASE 4102", title: "Aeronautical Engineering Drawing", type: "S", credit: 1.5 },
      { code: "HUM 4102", title: "Communicative English Sessional (Tech. Report Writing)", type: "S", credit: 0.75 },
    ],
  },
  {
    id: 2,
    name: "Year 1 · Semester 2",
    courses: [
      { code: "AVE 4201", title: "Electrical Circuits Analysis II", type: "T", credit: 3.0 },
      { code: "CHM 4201", title: "Chemistry", type: "T", credit: 3.0 },
      { code: "MAT 4203", title: "Ordinary and Partial Differential Equations", type: "T", credit: 3.0 },
      { code: "CSE 4201", title: "Computer Programming and Application", type: "T", credit: 3.0 },
      { code: "HUM 4203", title: "Bangladesh Studies and Sociology", type: "T", credit: 3.0 },
      { code: "AVE 4202", title: "Electrical Circuits Analysis II Sessional", type: "S", credit: 0.75 },
      { code: "CHM 4202", title: "Chemistry Sessional", type: "S", credit: 0.75 },
      { code: "ASE 4202", title: "Workshop Technology Sessional", type: "S", credit: 1.5 },
      { code: "CSE 4202", title: "Computer Programming and Application Sessional", type: "S", credit: 1.5 },
    ],
  },
  {
    id: 3,
    name: "Year 2 · Semester 1",
    courses: [
      { code: "AVE 4301", title: "Electronic Circuit I", type: "T", credit: 3.0 },
      { code: "ASE 4341", title: "Thermodynamics", type: "T", credit: 3.0 },
      { code: "ASE 4353", title: "Engineering Mechanics (Statics & Dynamics)", type: "T", credit: 4.0 },
      { code: "MAT 4305", title: "Linear Algebra, Coordinate Geometry and Complex Variables", type: "T", credit: 3.0 },
      { code: "CSE 4305", title: "Data Structures and Algorithm", type: "T", credit: 3.0 },
      { code: "AVE 4302", title: "Electronic Circuit I Sessional", type: "S", credit: 1.5 },
      { code: "ASE 4342", title: "Thermodynamics Sessional", type: "S", credit: 0.75 },
      { code: "CSE 4306", title: "Data Structures and Algorithm Sessional", type: "S", credit: 1.5 },
    ],
  },
  {
    id: 4,
    name: "Year 2 · Semester 2",
    courses: [
      { code: "AVE 4401", title: "Electronic Circuits II", type: "T", credit: 3.0 },
      { code: "AVE 4403", title: "Electric Machines and Drives", type: "T", credit: 3.0 },
      { code: "MAT 4407", title: "Fourier and Laplace Transform", type: "T", credit: 3.0 },
      { code: "AVE 4405", title: "Digital Logic and Computer Design", type: "T", credit: 3.0 },
      { code: "HUM 4413", title: "Engineering Economics", type: "T", credit: 3.0 },
      { code: "AVE 4402", title: "Electronic Circuits II Sessional", type: "S", credit: 1.5 },
      { code: "AVE 4404", title: "Electric Machines and Drives Sessional", type: "S", credit: 1.5 },
      { code: "AVE 4406", title: "Digital Logic and Computer Design Sessional", type: "S", credit: 1.5 },
    ],
  },
  {
    id: 5,
    name: "Year 3 · Semester 1",
    courses: [
      { code: "AVE 4501", title: "Signals and Systems", type: "T", credit: 3.0 },
      { code: "AVE 4503", title: "Microprocessor and Microcontroller Systems", type: "T", credit: 3.0 },
      { code: "AVE 4505", title: "Electromagnetic Field Theory", type: "T", credit: 3.0 },
      { code: "ASE 4513", title: "Aerodynamics", type: "T", credit: 3.0 },
      { code: "MAT 4509", title: "Probability & Statistics", type: "T", credit: 3.0 },
      { code: "AVE 4502", title: "Signals and Systems Sessional", type: "S", credit: 0.75 },
      { code: "AVE 4504", title: "Microprocessor and Microcontroller Systems Sessional", type: "S", credit: 0.75 },
      { code: "AVE 4510", title: "Modelling & Simulation Sessional", type: "S", credit: 1.5 },
      { code: "ASE 4514", title: "Aerodynamics Sessional", type: "S", credit: 1.5 },
    ],
  },
  {
    id: 6,
    name: "Year 3 · Semester 2",
    courses: [
      { code: "AVE 4601", title: "Communication Systems", type: "T", credit: 3.0 },
      { code: "AVE 4603", title: "Real Time Embedded Systems", type: "T", credit: 3.0 },
      { code: "AVE 4605", title: "Microwave and Antennas", type: "T", credit: 3.0 },
      { code: "AVE 4607", title: "Numerical Methods", type: "T", credit: 3.0 },
      { code: "AVE 4609", title: "Control Systems", type: "T", credit: 3.0 },
      { code: "AVE 4600", title: "Industrial Training", type: "S", credit: 1.0 },
      { code: "AVE 4602", title: "Communication Systems Sessional", type: "S", credit: 1.5 },
      { code: "AVE 4604", title: "Real Time Embedded Systems Sessional", type: "S", credit: 0.75 },
      { code: "AVE 4608", title: "Numerical Methods Sessional", type: "S", credit: 0.75 },
      { code: "AVE 4610", title: "Control Systems Sessional", type: "S", credit: 0.75 },
    ],
  },
  {
    id: 7,
    name: "Year 4 · Semester 1",
    courses: [
      { code: "AVE 4701", title: "Digital Signal Processing", type: "T", credit: 3.0 },
      { code: "AVE 4703", title: "Aircraft Electrical, Instrument and Autopilot Systems", type: "T", credit: 3.0 },
      { code: "AVE 4705", title: "Avionics System Design", type: "T", credit: 3.0 },
      { code: "AVE 4707", title: "Engineering Ethics & Professionalism", type: "T", credit: 2.0 },
      { code: "AVE 47XX", title: "Elective – I", type: "T", credit: 3.0 },
      { code: "AVE 4702", title: "Digital Signal Processing Sessional", type: "S", credit: 0.75 },
      { code: "AVE 4704", title: "Aircraft Electrical, Instrument and Autopilot Systems Sessional", type: "S", credit: 1.5 },
      { code: "AVE 4706", title: "Avionics System Design Sessional", type: "S", credit: 0.75 },
      { code: "AVE 4700A", title: "Final Year Research and Design Project (Part I)", type: "S", credit: 4.5 },
    ],
  },
  {
    id: 8,
    name: "Year 4 · Semester 2",
    courses: [
      { code: "AVE 4801", title: "Radar System Engineering", type: "T", credit: 3.0 },
      { code: "AVE 4803", title: "Aircraft Communication, Navigation & Surveillance System", type: "T", credit: 3.0 },
      { code: "ASE 4807", title: "Industrial & Business Management", type: "T", credit: 3.0 },
      { code: "AVE 48XX", title: "Elective – II", type: "T", credit: 3.0 },
      { code: "AVE 4802", title: "Radar System Engineering Sessional", type: "S", credit: 1.5 },
      { code: "AVE 4804", title: "Aircraft Communication, Navigation & Surveillance System Sessional", type: "S", credit: 1.5 },
      { code: "AVE 48XXS", title: "Elective – II Sessional", type: "S", credit: 0.75 },
      { code: "AVE 4700B", title: "Final Year Research and Design Project (Part II)", type: "S", credit: 4.5 },
    ],
  },
];

const GRADE_SCALE = [
  { label: "A+", point: 4.0, marks: "80% and above" },
  { label: "A", point: 3.75, marks: "75% to less than 80%" },
  { label: "A-", point: 3.5, marks: "70% to less than 75%" },
  { label: "B+", point: 3.25, marks: "65% to less than 70%" },
  { label: "B", point: 3.0, marks: "60% to less than 65%" },
  { label: "B-", point: 2.75, marks: "55% to less than 60%" },
  { label: "C+", point: 2.5, marks: "50% to less than 55%" },
  { label: "C", point: 2.25, marks: "45% to less than 50%" },
  { label: "D", point: 2.0, marks: "40% to less than 45%" },
  { label: "F", point: 0.0, marks: "Less than 40%" },
];
const POINTS = Object.fromEntries(GRADE_SCALE.map((g) => [g.label, g.point]));

const STORAGE_PREFIX = "avionics-cgpa:sem-";

/* -------------------------------- HELPERS --------------------------------- */

function semStats(courses, semGrades) {
  let totalCredit = 0,
    gradedCredit = 0,
    points = 0,
    attemptedCredit = 0;
  courses.forEach((c) => {
    totalCredit += c.credit;
    const g = semGrades?.[c.code];
    if (g && POINTS[g] !== undefined) {
      attemptedCredit += c.credit;
      if (g !== "F") {
        gradedCredit += c.credit;
        points += c.credit * POINTS[g];
      }
    }
  });
  return {
    totalCredit,
    gradedCredit,
    attemptedCredit,
    gpa: gradedCredit > 0 ? points / gradedCredit : (attemptedCredit > 0 ? 0 : null),
    points,
    complete: attemptedCredit === totalCredit && totalCredit > 0,
  };
}

function gaugeColor(gpa) {
  if (gpa === null) return "#94A3B8"; // slate-400
  if (gpa >= 3.75) return "#10B981"; // emerald-500
  if (gpa >= 3.0) return "#0EA5E9"; // sky-500
  if (gpa >= 2.5) return "#F59E0B"; // amber-500
  return "#EF4444"; // red-500
}

function getFunnyMessage(cgpa) {
  if (cgpa === null) return { icon: "🧐", text: "আগে রেজাল্ট তো ইনপুট দাও বস!" };
  if (cgpa === 4.00) return { icon: "👽", text: "ভাই, তুমি তো মনে হয় এলিয়েন! সবার নাগালের বাইরে চলে যাচ্ছ, এটা কিন্তু ঠিক না।" };
  if (cgpa >= 3.75) return { icon: "🔥", text: "কোপাইয়া দিছো! এইবার মিষ্টি খাওয়াও।" };
  if (cgpa >= 3.50) return { icon: "🚀", text: "সেই লেভেলের রেজাল্ট! চালিয়ে যাও।" };
  if (cgpa >= 3.00) return { icon: "👍", text: "মোটামুটি ভালো, তবে আরেকটু পুশ করলে আরো ভালো হইতো।" };
  if (cgpa >= 2.50) return { icon: "😅", text: "পাস তো করছো, এইটাই বড় কথা! এবার একটু সিরিয়াস হও।" };
  if (cgpa >= 2.00) return { icon: "😬", text: "টানাটানি করে পাস! দোস্ত, পড়ালেখা একটু কর।" };
  return { icon: "💀", text: "আরে চিল, নিউটনও তো ফেল করছিল! (নাকি?)" };
}

function FunnyMessageCard({ cgpa }) {
  const msg = getFunnyMessage(cgpa);
  return (
    <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-orange-200 rounded-3xl p-8 shadow-sm flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">
      <div className="text-6xl sm:text-7xl shrink-0">{msg.icon}</div>
      <div className="flex-1">
        <p className="text-sm font-bold text-orange-600 uppercase tracking-widest mb-2">Status Report</p>
        <p className="text-orange-950 font-bold text-2xl sm:text-3xl leading-snug" style={{fontFamily: "'Bangla', sans-serif"}}>
          {msg.text}
        </p>
      </div>
    </div>
  );
}

function prepareChartData(perSemStats) {
  const completedSemesters = [];
  const futureSemesters = [];

  let runningPoints = 0;
  let runningCredits = 0;

  const data = SEMESTERS.map((s) => {
    const st = perSemStats[s.id];
    
    if (st.gpa !== null) {
      runningPoints += st.points;
      runningCredits += st.gradedCredit;
      const cgpa = runningCredits > 0 ? runningPoints / runningCredits : null;
      
      completedSemesters.push({
        id: s.id,
        sgpa: st.gpa,
        points: st.points,
        credits: st.gradedCredit
      });
      
      return {
        name: `S${s.id}`,
        sgpa: Number(st.gpa.toFixed(2)),
        cgpa: Number(cgpa.toFixed(2)),
        predictedSgpa: null,
        predictedCgpa: null
      };
    } else {
      futureSemesters.push({
        id: s.id,
        credits: st.totalCredit > 0 ? st.totalCredit : s.courses.reduce((a, c) => a + c.credit, 0)
      });
      return {
        name: `S${s.id}`,
        sgpa: null,
        cgpa: null,
      };
    }
  });

  const predictionResult = predictCGPA(completedSemesters, futureSemesters);
  
  if (predictionResult.projections) {
    let simPoints = runningPoints;
    let simCredits = runningCredits;

    predictionResult.projections.forEach(p => {
      const targetData = data.find(d => d.name === `S${p.id}`);
      if (targetData && p.likelySgpa !== null) {
        simPoints += p.likelySgpa * p.credits;
        simCredits += p.credits;
        const simCgpa = simCredits > 0 ? simPoints / simCredits : null;
        
        targetData.predictedSgpa = Number(p.likelySgpa.toFixed(2));
        targetData.predictedCgpa = Number(simCgpa.toFixed(2));
      }
    });
  }

  // Link the last known real point to the predicted path for a smooth line
  if (completedSemesters.length > 0 && futureSemesters.length > 0) {
     const lastIdx = completedSemesters.length - 1;
     data[lastIdx].predictedSgpa = data[lastIdx].sgpa;
     data[lastIdx].predictedCgpa = data[lastIdx].cgpa;
  }

  return { chartData: data, ranges: predictionResult.ranges };
}

/* -------------------------------- GAUGE UI -------------------------------- */

function Gauge({ value, size = 220 }) {
  const r = 80;
  const cx = 100,
    cy = 100;
  const circumference = Math.PI * r;
  const pct = value === null ? 0 : Math.min(value, 4) / 4;
  const dash = circumference * pct;
  const color = gaugeColor(value);

  return (
    <svg viewBox="0 0 200 120" width={size} height={size * 0.6} className="overflow-visible">
      <defs>
        <filter id="glow">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <path
        d={`M 20 100 A ${r} ${r} 0 0 1 180 100`}
        fill="none"
        stroke="#E2E8F0"
        strokeWidth="14"
        strokeLinecap="round"
      />
      <path
        d={`M 20 100 A ${r} ${r} 0 0 1 180 100`}
        fill="none"
        stroke={color}
        strokeWidth="14"
        strokeLinecap="round"
        strokeDasharray={`${dash} ${circumference}`}
        filter="url(#glow)"
        style={{ transition: "stroke-dasharray 0.6s ease, stroke 0.6s ease" }}
      />
      {[0, 1, 2, 3, 4].map((t) => {
        const angle = Math.PI - (t / 4) * Math.PI;
        const x1 = cx + (r - 14) * Math.cos(angle);
        const y1 = cy - (r - 14) * Math.sin(angle);
        const x2 = cx + (r - 4) * Math.cos(angle);
        const y2 = cy - (r - 4) * Math.sin(angle);
        return <line key={t} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#CBD5E1" strokeWidth="1.5" />;
      })}
      <text x="100" y="92" textAnchor="middle" className="font-mono" fontSize="34" fontWeight="700" fill="#0F172A">
        {value === null ? "—" : value.toFixed(2)}
      </text>
      <text x="100" y="112" textAnchor="middle" fontSize="10" letterSpacing="2" fill="#64748B">
        CGPA / 4.00
      </text>
    </svg>
  );
}

/* -------------------------------- STORAGE --------------------------------- */

function loadSemester(semId) {
  try {
    const raw = localStorage.getItem(`${STORAGE_PREFIX}${semId}`);
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    return {};
  }
}

function saveSemester(semId, semGrades) {
  try {
    localStorage.setItem(`${STORAGE_PREFIX}${semId}`, JSON.stringify(semGrades));
    return true;
  } catch (e) {
    return false;
  }
}

/* ------------------------------- MAIN APP --------------------------------- */

export default function App() {
  const [grades, setGrades] = useState(() =>
    Object.fromEntries(SEMESTERS.map((s) => [s.id, loadSemester(s.id)]))
  );
  const [activeSem, setActiveSem] = useState(1);
  const [flash, setFlash] = useState(false);

  const persist = useCallback((semId, semGrades) => {
    const ok = saveSemester(semId, semGrades);
    if (ok) {
      setFlash(true);
      setTimeout(() => setFlash(false), 900);
    }
  }, []);

  const updateGrade = (semId, code, label) => {
    setGrades((prev) => {
      const semGrades = { ...(prev[semId] || {}) };
      if (label === "—") delete semGrades[code];
      else semGrades[code] = label;
      const next = { ...prev, [semId]: semGrades };
      persist(semId, semGrades);
      return next;
    });
  };

  const resetSemester = (semId) => {
    if (!window.confirm(`Clear all grades for Semester ${semId}?`)) return;
    setGrades((prev) => {
      const next = { ...prev, [semId]: {} };
      persist(semId, {});
      return next;
    });
  };

  const resetAll = () => {
    if (!window.confirm("Clear every saved grade across all 8 semesters? This cannot be undone.")) return;
    SEMESTERS.forEach((s) => persist(s.id, {}));
    setGrades(Object.fromEntries(SEMESTERS.map((s) => [s.id, {}])));
  };

  const perSemStats = useMemo(
    () => Object.fromEntries(SEMESTERS.map((s) => [s.id, semStats(s.courses, grades[s.id])])),
    [grades]
  );

  const { chartData, ranges } = useMemo(() => prepareChartData(perSemStats), [perSemStats]);

  const overall = useMemo(() => {
    let points = 0,
      gradedCredit = 0,
      attemptedCredit = 0;
    Object.values(perSemStats).forEach((s) => {
      points += s.points;
      gradedCredit += s.gradedCredit;
      attemptedCredit += s.attemptedCredit;
    });
    return { 
      gpa: gradedCredit > 0 ? points / gradedCredit : (attemptedCredit > 0 ? 0 : null), 
      gradedCredit 
    };
  }, [perSemStats]);

  const totalProgramCredit = SEMESTERS.reduce(
    (acc, s) => acc + s.courses.reduce((a, c) => a + c.credit, 0),
    0
  );

  const current = SEMESTERS.find((s) => s.id === activeSem);
  const currentStats = perSemStats[activeSem];

  return (
    <div className="min-h-screen w-full bg-slate-100 text-slate-800 font-sans">
      <div className="max-w-[1400px] mx-auto px-4 py-8 sm:px-8">
        
        {/* HEADER */}
        <div className="flex items-start sm:items-center justify-between mb-8 pb-4 border-b border-slate-300 gap-2">
          <div className="flex items-center gap-3 sm:gap-4 min-w-0">
            <div className="p-2 sm:p-3 rounded-2xl bg-gradient-to-br from-indigo-100 to-white border border-indigo-200 shadow-sm shrink-0">
              <Plane className="w-6 h-6 sm:w-7 sm:h-7 text-indigo-600" strokeWidth={2} />
            </div>
            <div className="min-w-0">
              <h1 className="text-[13px] sm:text-2xl font-bold tracking-tight text-slate-900 font-mono truncate">
                AAUB CGPA CALCULATOR
              </h1>
              <p className="text-[10px] sm:text-sm text-slate-500 tracking-wide mt-0.5 truncate">
                (Avionics Engineering)
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs font-medium px-2.5 sm:px-3 py-1.5 rounded-full bg-white border border-emerald-200 shadow-sm shrink-0 mt-1 sm:mt-0">
            <Radio className="w-3 h-3 sm:w-4 sm:h-4 text-emerald-500" />
            <span className="text-emerald-600">{flash ? "SAVED" : "STANDBY"}</span>
          </div>
        </div>

        {/* LAYOUT: LEFT & RIGHT COLUMNS */}
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_480px] gap-8">
          
          {/* LEFT COLUMN: Main CGPA Form and Overall Gauge */}
          <div className="flex flex-col gap-6">
            
            {/* TOP LEFT: GAUGE & SEMESTER SUMMARY (Now side by side on large screens) */}
            <div className="grid grid-cols-1 md:grid-cols-[250px_1fr] gap-6">
              <div className="rounded-2xl bg-gradient-to-br from-indigo-50 to-white border border-indigo-100 p-6 flex flex-col items-center justify-center shadow-sm">
                <Gauge value={overall.gpa} />
                <div className="mt-4 px-4 py-2 bg-white/60 rounded-lg border border-indigo-50 text-center w-full">
                  <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-1">
                    Overall Progress
                  </p>
                  <p className="text-sm font-mono text-slate-800 font-bold">
                    {overall.gradedCredit.toFixed(2)} / {totalProgramCredit.toFixed(2)} CREDITS
                  </p>
                </div>
              </div>

              {/* SEMESTER STRIP */}
              <div className="rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-teal-100 p-5 shadow-sm">
                <p className="text-xs font-bold uppercase tracking-widest text-teal-800 mb-4 flex items-center gap-1.5">
                  <GaugeIcon className="w-4 h-4" /> Semester Summary
                </p>
                <div className="grid grid-cols-4 gap-2.5">
                  {SEMESTERS.map((s) => {
                    const st = perSemStats[s.id];
                    const isActive = activeSem === s.id;
                    const color = gaugeColor(st.gpa);
                    return (
                      <button
                        key={s.id}
                        onClick={() => setActiveSem(s.id)}
                        className={`relative rounded-xl p-2.5 flex flex-col items-center gap-1.5 border-2 transition-all bg-white/80 ${
                          isActive
                            ? "border-teal-500 shadow-sm"
                            : "border-transparent hover:bg-white"
                        }`}
                      >
                        {st.complete ? (
                          <CheckCircle2 className="w-3.5 h-3.5" style={{ color }} />
                        ) : (
                          <Circle className="w-3.5 h-3.5 text-slate-300" />
                        )}
                        <span className="text-[11px] font-bold text-slate-500">S{s.id}</span>
                        <span
                          className="text-sm font-mono font-bold"
                          style={{ color: st.gpa === null ? "#94A3B8" : color }}
                        >
                          {st.gpa === null ? "—" : st.gpa.toFixed(2)}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* MOBILE ONLY MESSAGE AREA (Between Overall CGPA & Semester Details) */}
            <div className="block xl:hidden">
              <FunnyMessageCard cgpa={overall.gpa} />
            </div>

            {/* SEMESTER DETAIL (The main form) */}
            <div className="rounded-2xl bg-white border border-slate-200 shadow-md shadow-slate-200 overflow-hidden flex flex-col flex-1">
              <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-5 border-b border-slate-100 bg-gradient-to-r from-blue-50 to-indigo-50">
                <div>
                  <h2 className="font-bold text-lg text-slate-800">{current.name}</h2>
                  <p className="text-sm text-slate-500 mt-0.5">
                    Credits: {currentStats.totalCredit.toFixed(2)}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-xs text-slate-500 font-bold tracking-widest uppercase">Sem GPA</p>
                    <p
                      className="font-mono text-2xl font-bold"
                      style={{ color: gaugeColor(currentStats.gpa) }}
                    >
                      {currentStats.gpa === null ? "—" : currentStats.gpa.toFixed(2)}
                    </p>
                  </div>
                  <button
                    onClick={() => resetSemester(activeSem)}
                    title="Clear this semester"
                    className="p-2.5 rounded-lg border border-slate-200 hover:border-red-200 hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors bg-white"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="divide-y divide-slate-100">
                {current.courses.map((c) => {
                  const grade = grades[activeSem]?.[c.code] || "—";
                  const isFailed = grade === "F";
                  return (
                    <div
                      key={c.code}
                      className={`flex items-center gap-3 sm:gap-4 px-4 sm:px-6 py-4 transition-colors ${
                        isFailed ? "bg-red-50/60 hover:bg-red-50" : "hover:bg-slate-50"
                      }`}
                    >
                      <span
                        className={`shrink-0 text-xs font-bold px-2 py-1 rounded-md border text-center ${
                          isFailed
                            ? "border-red-200 text-red-600 bg-white"
                            : c.type === "T"
                            ? "border-sky-200 text-sky-700 bg-sky-50"
                            : "border-amber-200 text-amber-700 bg-amber-50"
                        }`}
                      >
                        <span className="hidden sm:inline">{c.type === "T" ? "THEORY" : "SESSION"}</span>
                        <span className="sm:hidden">{c.type}</span>
                      </span>
                      <span className={`hidden sm:inline-block text-xs font-mono font-bold w-16 shrink-0 ${isFailed ? "text-red-400" : "text-slate-400"}`}>
                        {c.code.split(" ")[1]}
                      </span>
                      <div className="flex-1 min-w-0 flex flex-col justify-center">
                        <span className={`text-sm sm:text-base font-medium truncate ${isFailed ? "text-red-900" : "text-slate-700"}`} title={c.title}>
                          {c.title}
                        </span>
                        <span className={`sm:hidden text-[10px] font-mono mt-0.5 font-bold ${isFailed ? "text-red-500" : "text-slate-400"}`}>
                          {c.credit.toFixed(2)} cr
                        </span>
                      </div>
                      <span className={`hidden sm:inline-block text-xs font-mono w-12 text-right shrink-0 font-bold ${isFailed ? "text-red-500" : "text-slate-500"}`}>
                        {c.credit.toFixed(2)} cr
                      </span>
                      <select
                        value={grade}
                        onChange={(e) => updateGrade(activeSem, c.code, e.target.value)}
                        className={`shrink-0 border rounded-lg text-sm font-mono font-bold px-2 sm:px-3 py-1.5 sm:py-2 focus:outline-none focus:ring-2 cursor-pointer transition-colors shadow-sm ${
                          isFailed
                            ? "bg-red-50 border-red-300 text-red-700 focus:ring-red-500/50 focus:border-red-500 hover:border-red-400"
                            : "bg-slate-50 border-slate-200 text-slate-800 focus:ring-indigo-500/50 focus:border-indigo-500 hover:border-slate-300"
                        }`}
                      >
                        <option value="—">—</option>
                        {GRADE_SCALE.map((g) => (
                          <option key={g.label} value={g.label}>
                            {g.label} ({g.point.toFixed(2)})
                          </option>
                        ))}
                      </select>
                    </div>
                  );
                })}
              </div>

              <div className="mt-auto flex items-center justify-between px-6 py-4 bg-slate-50 border-t border-slate-200">
                <button
                  onClick={() => setActiveSem((s) => Math.max(1, s - 1))}
                  disabled={activeSem === 1}
                  className="text-sm font-bold px-4 py-2 rounded-lg border border-slate-200 text-slate-600 disabled:opacity-40 disabled:hover:bg-transparent hover:bg-slate-200 transition-colors bg-white shadow-sm"
                >
                  ← PREVIOUS
                </button>
                <span className="text-xs font-bold text-slate-400 tracking-wider">SEM {activeSem} OF 8</span>
                <button
                  onClick={() => setActiveSem((s) => Math.min(8, s + 1))}
                  disabled={activeSem === 8}
                  className="text-sm font-bold px-4 py-2 rounded-lg border border-slate-200 text-slate-600 disabled:opacity-40 disabled:hover:bg-transparent hover:bg-slate-200 transition-colors bg-white shadow-sm"
                >
                  NEXT →
                </button>
              </div>
            </div>

            <button
              onClick={resetAll}
              className="mt-2 text-sm font-bold px-4 py-3 rounded-xl border border-red-200 text-red-500 hover:bg-red-50 hover:text-red-600 transition-colors shadow-sm bg-white"
            >
              CLEAR ALL SAVED DATA
            </button>

          </div>

          {/* RIGHT COLUMN: Insights, Graph, Grading Table */}
          <div className="flex flex-col gap-6">
            
            {/* FUNNY MESSAGE AREA (Desktop Only) */}
            <div className="hidden xl:block">
              <FunnyMessageCard cgpa={overall.gpa} />
            </div>

            {/* CHART AREA */}
            <div className="bg-gradient-to-br from-slate-50 to-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col">
              <div className="flex flex-col gap-2 mb-4">
                <h2 className="text-sm font-bold text-slate-800 uppercase tracking-widest flex items-center gap-2">
                  <GaugeIcon className="w-4 h-4 text-indigo-500" />
                  Performance Graph
                </h2>
                {ranges && (
                  <div className="flex items-center gap-3">
                    <div className="bg-indigo-50 text-indigo-700 text-xs font-bold px-3 py-1.5 rounded-lg border border-indigo-200 shadow-sm">
                      EXPECTED FINAL CGPA: <span className="text-base font-mono ml-1">{ranges.likely.toFixed(2)}</span>
                    </div>
                    <span className="text-[10px] font-medium text-slate-500 uppercase tracking-wide">
                      Range: {ranges.conservative.toFixed(2)} (Safe) — {ranges.optimistic.toFixed(2)} (Opt)
                    </span>
                  </div>
                )}
              </div>
              <p className="text-[11px] text-slate-600 font-medium uppercase tracking-wide mb-1">
                <span className="font-bold text-slate-800">SGPA/CGPA:</span> Real Data &nbsp;&middot;&nbsp; 
                <span className="font-bold text-slate-800">Thin lines:</span> Projected
              </p>
              <p className="text-[10px] text-slate-400 mb-4 italic leading-tight">
                * Note: Predictions are purely mathematical estimates based on rhythm, trend, and decay, not actual reality.
              </p>
              <div className="w-full h-80 bg-white/60 rounded-xl p-2 border border-slate-100">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} />
                    <YAxis domain={[0, 4.0]} axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} />
                    <Tooltip 
                      contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                      labelStyle={{ fontWeight: 'bold', color: '#334155', marginBottom: '4px' }}
                    />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', fontWeight: 'bold', color: '#475569' }} />
                    <Line type="monotone" dataKey="sgpa" name="Real SGPA" stroke="#8b5cf6" strokeWidth={3} dot={{ r: 5, strokeWidth: 2 }} activeDot={{ r: 7 }} />
                    <Line type="monotone" dataKey="cgpa" name="Real CGPA" stroke="#0ea5e9" strokeWidth={3} dot={{ r: 5, strokeWidth: 2 }} activeDot={{ r: 7 }} />
                    <Line type="monotone" dataKey="predictedSgpa" name="Predicted SGPA" stroke="#c4b5fd" strokeWidth={1.5} dot={{ r: 5, fill: "#f5f3ff", stroke: "#8b5cf6", strokeWidth: 2 }} activeDot={{ r: 7 }} />
                    <Line type="monotone" dataKey="predictedCgpa" name="Predicted CGPA" stroke="#7dd3fc" strokeWidth={1.5} dot={{ r: 5, fill: "#f0f9ff", stroke: "#0ea5e9", strokeWidth: 2 }} activeDot={{ r: 7 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* GRADING SCALE TABLE */}
            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border border-cyan-100 rounded-2xl p-6 shadow-sm overflow-hidden">
              <p className="text-sm font-bold text-cyan-900 uppercase tracking-widest mb-4">Grading Scale</p>
              <div className="overflow-x-auto bg-white/60 rounded-xl border border-cyan-50/50">
                <table className="w-full text-left border-collapse min-w-[300px]">
                  <thead>
                    <tr className="border-b border-cyan-100">
                      <th className="py-2.5 px-3 text-[10px] font-bold text-cyan-800 uppercase">Mark Range</th>
                      <th className="py-2.5 px-3 text-[10px] font-bold text-cyan-800 uppercase">Grade</th>
                      <th className="py-2.5 px-3 text-[10px] font-bold text-cyan-800 uppercase text-right">Point</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-cyan-50">
                    {GRADE_SCALE.map((g) => (
                      <tr key={g.label} className="hover:bg-white/80 transition-colors">
                        <td className="py-2 px-3 text-[11px] font-medium text-slate-600">{g.marks}</td>
                        <td className="py-2 px-3">
                          <span className="inline-block font-mono font-bold text-xs bg-cyan-100 text-cyan-800 px-1.5 py-0.5 rounded border border-cyan-200">
                            {g.label}
                          </span>
                        </td>
                        <td className="py-2 px-3 text-[11px] font-mono font-bold text-slate-700 text-right">{g.point.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        </div>

        {/* FOOTER */}
        <div className="mt-12 pt-6 border-t border-slate-300 flex flex-col items-center justify-center gap-1 text-center">
          <p className="text-sm text-slate-600">
            Designed and Developed with <span className="text-red-500">❤️</span> By{" "}
            <a 
              href="https://rezwanzani.me" 
              target="_blank" 
              rel="noreferrer"
              className="font-bold text-indigo-600 hover:text-indigo-500 transition-colors underline decoration-indigo-200 underline-offset-4"
            >
              Md. Rezwan Zani
            </a>
          </p>
          <p className="text-xs text-slate-500 max-w-lg mt-2">
            CGPA = Σ(credit hours × grade point) ÷ Σ(credit hours), across all graded courses. 
            Failed courses are excluded from total credits in CGPA.
          </p>
        </div>

      </div>
    </div>
  );
}
