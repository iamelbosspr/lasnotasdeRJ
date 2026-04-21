'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Palette, Atom, Monitor, Music, Dumbbell,
  Languages, Globe, Calculator, BookOpen,
  Pencil, Check, X, Heart,
  RotateCcw, TrendingUp, Trophy, Star, GraduationCap
} from 'lucide-react';

const STORAGE_KEY = 'raphael_grades_ciem_2025_p4_v1';

const INITIAL_SUBJECTS = [
  { id: 'art',      name: 'Arte',              code: 'ART',                evaluations: Array(20).fill(0), nd: 0,   cnd: '' },
  { id: 'science',  name: 'Ciencias',          code: 'SCIENCE',            evaluations: [100,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0], nd: 0,   cnd: '' },
  { id: 'computer', name: 'Computación',       code: 'COMPUTER',           evaluations: Array(20).fill(0), nd: 96,  cnd: 'A' },
  { id: 'baile',    name: 'Baile',             code: 'BAILE',              evaluations: Array(20).fill(0), nd: 100, cnd: 'A' },
  { id: 'pe',       name: 'Educación Física',  code: 'PHYSICAL EDUCATION', evaluations: Array(20).fill(0), nd: 0,   cnd: '' },
  { id: 'english',  name: 'Inglés',            code: 'ENGLISH',            evaluations: [98,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0], nd: 99,  cnd: '' },
  { id: 'social',   name: 'Estudios Sociales', code: 'SOCIAL STUDIES',     evaluations: [72,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0], nd: 0,   cnd: '' },
  { id: 'math',     name: 'Matemáticas',       code: 'MATHEMATICS',        evaluations: [73,100,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0], nd: 0,   cnd: '' },
  { id: 'spanish',  name: 'Español',           code: 'SPANISH',            evaluations: [75,90,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0], nd: 0,   cnd: '' },
];

type Subject = typeof INITIAL_SUBJECTS[0];

const ICON_MAP: Record<string, React.ElementType> = {
  art: Palette, science: Atom, computer: Monitor, baile: Music,
  pe: Dumbbell, english: Languages, social: Globe, math: Calculator, spanish: BookOpen,
};

const calcAverage = (subject: Subject): number | null => {
  const grades = subject.evaluations.filter(v => v > 0);
  if (subject.nd > 0) grades.push(subject.nd);
  if (grades.length === 0) return null;
  return grades.reduce((a, b) => a + b, 0) / grades.length;
};

const gradeColor = (avg: number | null) => {
  if (avg === null) return { bg: '#EEEAE0', fg: '#8B8578', label: 'Sin calificar' };
  if (avg >= 95)   return { bg: '#E8F0E6', fg: '#2D5F3F', label: 'Excelente' };
  if (avg >= 85)   return { bg: '#F0EBD8', fg: '#8B6B1F', label: 'Notable' };
  if (avg >= 70)   return { bg: '#F5E6D8', fg: '#A0562A', label: 'Bueno' };
  return               { bg: '#F5D8D3', fg: '#A83F34', label: 'A mejorar' };
};

const cndLabel = (cnd: string) => {
  if (cnd === 'A') return 'Excelente';
  if (cnd === 'B') return 'Bueno';
  if (cnd === 'C') return 'Regular';
  if (cnd === 'D') return 'Deficiente';
  return '—';
};

/* ─── Stat Card ─── */
function StatCard({ icon, label, value, small = false }: { icon: React.ReactNode; label: string; value: React.ReactNode; small?: boolean }) {
  return (
    <div style={{ padding: '18px 20px', background: 'rgba(255,252,244,0.6)', border: '1px solid rgba(31,27,21,0.08)', borderRadius: 14 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#6B665D', marginBottom: 10 }}>
        {icon}
        <span style={{ fontSize: 9, letterSpacing: '0.28em', textTransform: 'uppercase' as const, fontWeight: 500 }}>{label}</span>
      </div>
      <div style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: small ? 20 : 32, fontWeight: 400, letterSpacing: '-0.02em', lineHeight: 1, color: '#1F1B15' }}>
        {value}
      </div>
    </div>
  );
}

/* ─── Meta Block (ND / CND) ─── */
function MetaBlock({ label, isEditing, value, display, sub, color, onChange, type, placeholder, maxLength }: {
  label: string; isEditing: boolean; value: string | number; display: React.ReactNode;
  sub?: string | null; color: ReturnType<typeof gradeColor> | null;
  onChange: (v: string) => void; type: string; placeholder?: string; maxLength?: number;
}) {
  return (
    <div style={{ padding: '12px 14px', background: color ? color.bg : 'rgba(31,27,21,0.03)', border: '1px solid rgba(31,27,21,0.06)', borderRadius: 10 }}>
      <div style={{ fontSize: 9, letterSpacing: '0.28em', textTransform: 'uppercase' as const, fontWeight: 500, marginBottom: 6, color: color ? color.fg : '#8B8578' }}>{label}</div>
      {isEditing ? (
        <input type={type} value={value || ''} onChange={e => onChange(e.target.value)} placeholder={placeholder || '0'}
          maxLength={maxLength}
          style={{ width: '100%', background: 'transparent', border: 'none', outline: 'none', fontFamily: "'JetBrains Mono', monospace", fontSize: 20, fontWeight: 500, color: color ? color.fg : '#1F1B15' }} />
      ) : (
        <div>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 22, fontWeight: 500, color: color ? color.fg : '#B8AF9C' }}>{display}</div>
          {sub && <div style={{ fontSize: 10, color: color ? color.fg : '#8B8578', opacity: 0.75, marginTop: 2 }}>{sub}</div>}
        </div>
      )}
    </div>
  );
}

/* ─── Subject Card ─── */
function SubjectCard({ subject, index, isEditing, draft, setDraft, onStartEdit, onCancel, onSave, canEditNow }: {
  subject: Subject; index: number; isEditing: boolean; draft: Subject | null;
  setDraft: React.Dispatch<React.SetStateAction<Subject | null>>;
  onStartEdit: () => void; onCancel: () => void; onSave: () => void; canEditNow: boolean;
}) {
  const Icon = ICON_MAP[subject.id] || BookOpen;
  const avg = calcAverage(subject);
  const color = gradeColor(avg);
  const data = isEditing && draft ? draft : subject;
  const dataAvg = calcAverage(data);

  const updateEval = (idx: number, val: string) => {
    const v = val === '' ? 0 : Math.max(0, Math.min(100, parseInt(val, 10) || 0));
    setDraft(d => d ? { ...d, evaluations: d.evaluations.map((e, i) => i === idx ? v : e) } : d);
  };
  const updateNd = (val: string) => {
    const v = val === '' ? 0 : Math.max(0, Math.min(100, parseInt(val, 10) || 0));
    setDraft(d => d ? { ...d, nd: v } : d);
  };
  const updateCnd = (val: string) => setDraft(d => d ? { ...d, cnd: val.toUpperCase().slice(0, 1) } : d);

  return (
    <article style={{
      background: '#FFFCF4', border: '1px solid rgba(31,27,21,0.09)', borderRadius: 18,
      padding: 24, position: 'relative', overflow: 'hidden',
      animationDelay: `${index * 0.06}s`,
      transition: 'transform .35s cubic-bezier(.2,.8,.2,1), box-shadow .35s ease',
    }}
      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-3px)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 18px 40px -18px rgba(31,27,21,.18)'; }}
      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'; (e.currentTarget as HTMLElement).style.boxShadow = 'none'; }}
    >
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: color.fg }} />

      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: color.bg, color: color.fg, display: 'grid', placeItems: 'center' }}>
            <Icon size={20} strokeWidth={1.6} />
          </div>
          <div>
            <div style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: 22, fontWeight: 400, letterSpacing: '-0.01em', color: '#1F1B15' }}>{subject.name}</div>
            <div style={{ fontSize: 9, letterSpacing: '0.28em', textTransform: 'uppercase' as const, fontWeight: 500, marginTop: 2, color: '#6B665D' }}>{subject.code}</div>
          </div>
        </div>
        {!isEditing && canEditNow && (
          <button onClick={onStartEdit} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 999, fontSize: 12, fontWeight: 500, border: '1px solid rgba(31,27,21,0.15)', background: 'transparent', cursor: 'pointer', color: '#1F1B15', transition: 'all .2s' }}>
            <Pencil size={12} strokeWidth={1.8} /> Editar
          </button>
        )}
        {isEditing && (
          <div style={{ display: 'flex', gap: 6 }}>
            <button onClick={onCancel} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 999, fontSize: 12, border: '1px solid rgba(31,27,21,0.15)', background: 'transparent', cursor: 'pointer' }}>
              <X size={13} strokeWidth={2} /> Cancelar
            </button>
            <button onClick={onSave} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 999, fontSize: 12, border: '1px solid #1F1B15', background: '#1F1B15', color: '#FBF7EE', cursor: 'pointer' }}>
              <Check size={13} strokeWidth={2} /> Guardar
            </button>
          </div>
        )}
      </div>

      <div style={{ marginTop: 22, display: 'flex', alignItems: 'baseline', gap: 12 }}>
        <div style={{ fontFamily: "'Fraunces', Georgia, serif", fontWeight: 300, letterSpacing: '-0.04em', fontSize: 72, lineHeight: 0.9, color: dataAvg !== null ? '#1F1B15' : '#B8AF9C' }}>
          {dataAvg !== null ? dataAvg.toFixed(1) : '—'}
        </div>
        <span style={{ display: 'inline-flex', alignItems: 'center', padding: '3px 10px', borderRadius: 999, fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase' as const, fontWeight: 500, background: gradeColor(dataAvg).bg, color: gradeColor(dataAvg).fg }}>
          {gradeColor(dataAvg).label}
        </span>
      </div>

      <div style={{ background: 'rgba(31,27,21,0.08)', borderRadius: 999, height: 6, overflow: 'hidden', marginTop: 14 }}>
        <div style={{ height: '100%', borderRadius: 999, width: `${dataAvg !== null ? Math.min(100, dataAvg) : 0}%`, background: dataAvg !== null ? gradeColor(dataAvg).fg : '#D8D0BF', transition: 'width 1s cubic-bezier(.2,.8,.2,1)' }} />
      </div>

      <div style={{ marginTop: 22 }}>
        <div style={{ fontSize: 9, letterSpacing: '0.28em', textTransform: 'uppercase' as const, fontWeight: 500, color: '#6B665D', marginBottom: 10 }}>Evaluaciones</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(10, minmax(0, 1fr))', gap: 4 }}>
          {data.evaluations.map((val, i) => {
            const isEmpty = val === 0;
            const c = gradeColor(val > 0 ? val : null);
            return (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                <div style={{ fontSize: 8, color: '#A89F8C', fontFamily: "'JetBrains Mono', monospace" }}>E{i + 1}</div>
                {isEditing ? (
                  <input type="number" min="0" max="100" value={val || ''} onChange={e => updateEval(i, e.target.value)}
                    style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 13, textAlign: 'center', width: '100%', background: 'transparent', border: '1px solid rgba(31,27,21,0.2)', borderRadius: 4, padding: '4px 2px', color: '#1F1B15', outline: 'none' }} />
                ) : (
                  <div style={{ width: '100%', aspectRatio: '1', display: 'grid', placeItems: 'center', borderRadius: 5, background: isEmpty ? 'rgba(31,27,21,0.04)' : c.bg, color: isEmpty ? '#C0B8A3' : c.fg, fontFamily: "'JetBrains Mono', monospace", fontSize: 11, fontWeight: 500 }}>
                    {isEmpty ? '—' : val}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div style={{ marginTop: 22, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <MetaBlock label="Nota Diaria" isEditing={isEditing} value={data.nd} display={data.nd > 0 ? data.nd : '—'} color={data.nd > 0 ? gradeColor(data.nd) : null} onChange={updateNd} type="number" />
        <MetaBlock label="Conducta" isEditing={isEditing} value={data.cnd} display={data.cnd || '—'} sub={data.cnd ? cndLabel(data.cnd) : null} color={data.cnd === 'A' ? gradeColor(100) : data.cnd === 'B' ? gradeColor(85) : data.cnd === 'C' ? gradeColor(75) : null} onChange={updateCnd} type="text" placeholder="A/B/C/D" maxLength={1} />
      </div>
    </article>
  );
}

/* ─── Main Page ─── */
export default function BoletinRaphaelJulian() {
  const [subjects, setSubjects] = useState<Subject[]>(INITIAL_SUBJECTS);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Subject | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [saveFlash, setSaveFlash] = useState(false);

  // Load from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length === INITIAL_SUBJECTS.length) {
          setSubjects(parsed);
        }
      }
    } catch { /* ignore */ }
    setLoaded(true);
  }, []);

  // Save to localStorage on change
  useEffect(() => {
    if (!loaded) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(subjects));
      setSaveFlash(true);
      setTimeout(() => setSaveFlash(false), 1200);
    } catch { /* ignore */ }
  }, [subjects, loaded]);

  const overallAverage = useMemo(() => {
    const averages = subjects.map(calcAverage).filter((v): v is number => v !== null);
    if (averages.length === 0) return null;
    return averages.reduce((a, b) => a + b, 0) / averages.length;
  }, [subjects]);

  const stats = useMemo(() => {
    const withGrades = subjects.filter(s => calcAverage(s) !== null);
    const allGrades = subjects.flatMap(s => { const arr = [...s.evaluations.filter(v => v > 0)]; if (s.nd > 0) arr.push(s.nd); return arr; });
    return {
      active: withGrades.length,
      total: subjects.length,
      perfect: allGrades.filter(g => g === 100).length,
      highest: allGrades.length ? Math.max(...allGrades) : null,
      best: withGrades.length ? withGrades.reduce((a, b) => (calcAverage(a) ?? 0) >= (calcAverage(b) ?? 0) ? a : b) : null,
    };
  }, [subjects]);

  const startEdit = (s: Subject) => { setDraft(JSON.parse(JSON.stringify(s))); setEditingId(s.id); };
  const cancelEdit = () => { setEditingId(null); setDraft(null); };
  const saveEdit = () => { if (draft) setSubjects(prev => prev.map(s => s.id === draft.id ? draft : s)); setEditingId(null); setDraft(null); };
  const resetAll = () => { if (window.confirm('¿Restablecer todas las notas a los valores originales?')) setSubjects(INITIAL_SUBJECTS); };

  const ey: React.CSSProperties = { fontSize: 10, letterSpacing: '0.28em', textTransform: 'uppercase', fontWeight: 500, color: '#6B665D' };

  return (
    <div style={{ minHeight: '100vh', background: 'radial-gradient(ellipse at top, #FBF7EE 0%, #F4EDE0 60%, #EFE6D4 100%)', fontFamily: "'DM Sans', system-ui, sans-serif", color: '#1F1B15' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300..900;1,9..144,400..900&family=DM+Sans:opsz,wght@9..40,300..700&family=JetBrains+Mono:wght@300..600&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #FBF7EE; }
      `}</style>

      {/* TOP BAR */}
      <header style={{ padding: '20px 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(31,27,21,0.10)', flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 36, height: 36, borderRadius: 8, background: '#1F1B15', color: '#FBF7EE', display: 'grid', placeItems: 'center' }}>
            <GraduationCap size={18} strokeWidth={1.8} />
          </div>
          <div>
            <div style={ey}>CIEM · Boletín Académico</div>
            <div style={{ fontSize: 13, fontWeight: 500 }}>Año 2025 · 3er Grado · Grupo X · Período 4</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ ...ey, display: 'flex', alignItems: 'center', gap: 6, color: saveFlash ? '#2D5F3F' : '#6B665D', transition: 'color .3s' }}>
            <span style={{ width: 6, height: 6, borderRadius: 999, background: saveFlash ? '#2D5F3F' : '#C08A1E', transition: 'all .3s' }} />
            {saveFlash ? 'Guardado' : 'Sincronizado'}
          </span>
          <button onClick={resetAll} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '8px 14px', borderRadius: 999, fontSize: 12, fontWeight: 500, border: '1px solid rgba(31,27,21,0.15)', background: 'transparent', cursor: 'pointer' }}>
            <RotateCcw size={13} strokeWidth={1.8} /> Restablecer
          </button>
        </div>
      </header>

      {/* HERO */}
      <section style={{ padding: '56px 40px 40px' }}>
        <div style={ey}>Estudiante · Expediente 2025-0078</div>
        <h1 style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: 'clamp(56px, 9vw, 128px)', fontWeight: 300, lineHeight: 0.92, letterSpacing: '-0.035em', marginTop: 24 }}>
          Raphael{' '}
          <span style={{ fontStyle: 'italic', color: '#C08A1E' }}>Julian</span>
        </h1>
        <div style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: 'clamp(22px, 3vw, 32px)', fontStyle: 'italic', fontWeight: 300, color: '#6B665D', marginTop: 8 }}>
          Castrillo Braffett
        </div>
        <div style={{ marginTop: 40, width: 140, borderTop: '2px solid #C08A1E' }} />
      </section>

      {/* OVERALL AVERAGE */}
      <section style={{ padding: '0 40px 56px', display: 'grid', gridTemplateColumns: '1fr auto', gap: 40, alignItems: 'end', flexWrap: 'wrap' }}>
        <div>
          <div style={ey}>Promedio General</div>
          <div style={{ fontFamily: "'Fraunces', Georgia, serif", fontWeight: 300, letterSpacing: '-0.04em', fontSize: 'clamp(140px, 22vw, 260px)', lineHeight: 0.9, color: overallAverage !== null ? '#1F1B15' : '#A89F8C' }}>
            {overallAverage !== null ? overallAverage.toFixed(1) : '—'}
          </div>
          {overallAverage !== null && (
            <div style={{ fontFamily: "'Fraunces', Georgia, serif", fontStyle: 'italic', fontSize: 22, color: '#6B665D', marginTop: 16 }}>
              {overallAverage >= 95 ? 'Un desempeño excepcional.' : overallAverage >= 90 ? 'Un desempeño sobresaliente.' : overallAverage >= 80 ? 'Un desempeño muy sólido.' : 'Progreso constante.'}
            </div>
          )}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, minWidth: 320 }}>
          <StatCard icon={<BookOpen size={16} strokeWidth={1.8} />} label="Con notas" value={`${stats.active}/${stats.total}`} />
          <StatCard icon={<Star size={16} strokeWidth={1.8} />} label="Notas 100" value={stats.perfect} />
          <StatCard icon={<TrendingUp size={16} strokeWidth={1.8} />} label="Nota más alta" value={stats.highest ?? '—'} />
          <StatCard icon={<Trophy size={16} strokeWidth={1.8} />} label="Mejor asignatura" value={stats.best ? stats.best.name : '—'} small />
        </div>
      </section>

      <div style={{ padding: '0 40px' }}><div style={{ borderTop: '1px solid rgba(31,27,21,0.12)' }} /></div>

      {/* SUBJECTS */}
      <section style={{ padding: '48px 40px 0' }}>
        <div style={ey}>Las asignaturas</div>
        <h2 style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: 'clamp(32px, 4vw, 52px)', fontWeight: 300, letterSpacing: '-0.02em', lineHeight: 1, marginTop: 8 }}>
          Nueve materias, <span style={{ fontStyle: 'italic', color: '#C08A1E' }}>un año.</span>
        </h2>
        <p style={{ marginTop: 16, fontSize: 13, color: '#6B665D', maxWidth: 500 }}>
          Pulsa <strong style={{ color: '#1F1B15' }}>Editar</strong> en cualquier asignatura para actualizar las evaluaciones conforme CIEM las publique.
        </p>
      </section>

      <section style={{ padding: '32px 40px 80px', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 24 }}>
        {subjects.map((s, i) => (
          <SubjectCard key={s.id} subject={s} index={i}
            isEditing={editingId === s.id} draft={editingId === s.id ? draft : null}
            setDraft={setDraft} onStartEdit={() => startEdit(s)}
            onCancel={cancelEdit} onSave={saveEdit}
            canEditNow={editingId === null || editingId === s.id}
          />
        ))}
      </section>

      <div style={{ padding: '0 40px' }}><div style={{ borderTop: '2px solid #C08A1E', width: 140 }} /></div>

      {/* FOOTER */}
      <footer style={{ padding: '80px 40px', textAlign: 'center' }}>
        <Heart size={28} strokeWidth={1.5} style={{ margin: '0 auto', color: '#C08A1E' }} fill="#C08A1E" />
        <p style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: 'clamp(22px, 3vw, 32px)', fontStyle: 'italic', fontWeight: 300, color: '#1F1B15', maxWidth: 680, margin: '24px auto 0', lineHeight: 1.3 }}>
          Creado con amor por el <span style={{ color: '#C08A1E' }}>papá</span> de Raphael Julian.
        </p>
        <p style={{ marginTop: 20, fontSize: 13, color: '#6B665D' }}>
          Cada nota cuenta una historia. Cada esfuerzo, un paso. Estamos orgullosos de ti, campeón.
        </p>
        <div style={{ ...ey, marginTop: 40, opacity: 0.7 }}>CIEM · Año Académico 2025 · Período 4</div>
      </footer>
    </div>
  );
}
