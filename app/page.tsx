'use client';

import React, { useState, useEffect, useMemo } from 'react';

const STORAGE_KEY = 'raphael_grades_ciem_2025_p4_v1';

const INITIAL_SUBJECTS = [
  { id: 'art',      name: 'Arte',              code: 'ART',                emoji: '🎨', evaluations: Array(20).fill(0), nd: 0,   cnd: '' },
  { id: 'science',  name: 'Ciencias',          code: 'SCIENCE',            emoji: '🔬', evaluations: [100,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0], nd: 0,   cnd: '' },
  { id: 'computer', name: 'Computación',       code: 'COMPUTER',           emoji: '💻', evaluations: Array(20).fill(0), nd: 96,  cnd: 'A' },
  { id: 'baile',    name: 'Baile',             code: 'BAILE',              emoji: '🎵', evaluations: Array(20).fill(0), nd: 100, cnd: 'A' },
  { id: 'pe',       name: 'Educación Física',  code: 'PHYSICAL EDUCATION', emoji: '⚽', evaluations: Array(20).fill(0), nd: 0,   cnd: '' },
  { id: 'english',  name: 'Inglés',            code: 'ENGLISH',            emoji: '🌐', evaluations: [98,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0], nd: 99,  cnd: '' },
  { id: 'social',   name: 'Estudios Sociales', code: 'SOCIAL STUDIES',     emoji: '🗺️', evaluations: [72,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0], nd: 0,   cnd: '' },
  { id: 'math',     name: 'Matemáticas',       code: 'MATHEMATICS',        emoji: '🔢', evaluations: [73,100,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0], nd: 0,   cnd: '' },
  { id: 'spanish',  name: 'Español',           code: 'SPANISH',            emoji: '📖', evaluations: [75,90,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0], nd: 0,   cnd: '' },
];

type Subject = typeof INITIAL_SUBJECTS[0];

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
  return '—';
};

const ey: React.CSSProperties = {
  fontSize: 10, letterSpacing: '0.28em',
  textTransform: 'uppercase', fontWeight: 500, color: '#6B665D',
};

function StatCard({ icon, label, value, small = false }: {
  icon: string; label: string; value: React.ReactNode; small?: boolean;
}) {
  return (
    <div style={{ padding: '18px 20px', background: 'rgba(255,252,244,0.7)', border: '1px solid rgba(31,27,21,0.08)', borderRadius: 14 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#6B665D', marginBottom: 10 }}>
        <span style={{ fontSize: 14 }}>{icon}</span>
        <span style={{ ...ey, fontSize: 9 }}>{label}</span>
      </div>
      <div style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: small ? 18 : 30, fontWeight: 400, letterSpacing: '-0.02em', lineHeight: 1, color: '#1F1B15' }}>
        {value}
      </div>
    </div>
  );
}

function SubjectCard({ subject, isEditing, draft, setDraft, onStartEdit, onCancel, onSave, canEditNow }: {
  subject: Subject; isEditing: boolean; draft: Subject | null;
  setDraft: React.Dispatch<React.SetStateAction<Subject | null>>;
  onStartEdit: () => void; onCancel: () => void; onSave: () => void; canEditNow: boolean;
}) {
  const avg = calcAverage(subject);
  const color = gradeColor(avg);
  const data = isEditing && draft ? draft : subject;
  const dataAvg = calcAverage(data);
  const dataColor = gradeColor(dataAvg);

  const updateEval = (idx: number, val: string) => {
    const v = val === '' ? 0 : Math.max(0, Math.min(100, parseInt(val, 10) || 0));
    setDraft(d => d ? { ...d, evaluations: d.evaluations.map((e, i) => i === idx ? v : e) } : d);
  };

  return (
    <article style={{
      background: '#FFFCF4', border: '1px solid rgba(31,27,21,0.09)',
      borderRadius: 18, padding: 24, position: 'relative', overflow: 'hidden',
      transition: 'transform .3s ease, box-shadow .3s ease',
    }}>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: color.fg }} />

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 42, height: 42, borderRadius: 10, background: color.bg, display: 'grid', placeItems: 'center', fontSize: 20 }}>
            {subject.emoji}
          </div>
          <div>
            <div style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: 22, fontWeight: 400, letterSpacing: '-0.01em', color: '#1F1B15' }}>
              {subject.name}
            </div>
            <div style={{ ...ey, fontSize: 9, marginTop: 2 }}>{subject.code}</div>
          </div>
        </div>
        {!isEditing && canEditNow && (
          <button onClick={onStartEdit} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 999, fontSize: 12, fontWeight: 500, border: '1px solid rgba(31,27,21,0.15)', background: 'transparent', cursor: 'pointer', color: '#1F1B15' }}>
            ✏️ Editar
          </button>
        )}
        {isEditing && (
          <div style={{ display: 'flex', gap: 6 }}>
            <button onClick={onCancel} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '6px 12px', borderRadius: 999, fontSize: 12, border: '1px solid rgba(31,27,21,0.15)', background: 'transparent', cursor: 'pointer' }}>
              ✕ Cancelar
            </button>
            <button onClick={onSave} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '6px 12px', borderRadius: 999, fontSize: 12, border: '1px solid #1F1B15', background: '#1F1B15', color: '#FBF7EE', cursor: 'pointer', fontWeight: 500 }}>
              ✓ Guardar
            </button>
          </div>
        )}
      </div>

      {/* Average */}
      <div style={{ marginTop: 20, display: 'flex', alignItems: 'baseline', gap: 12 }}>
        <div style={{ fontFamily: "'Fraunces', Georgia, serif", fontWeight: 300, letterSpacing: '-0.04em', fontSize: 72, lineHeight: 0.9, color: dataAvg !== null ? '#1F1B15' : '#B8AF9C' }}>
          {dataAvg !== null ? dataAvg.toFixed(1) : '—'}
        </div>
        <span style={{ display: 'inline-flex', alignItems: 'center', padding: '3px 10px', borderRadius: 999, fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 500, background: dataColor.bg, color: dataColor.fg }}>
          {dataColor.label}
        </span>
      </div>

      {/* Progress bar */}
      <div style={{ background: 'rgba(31,27,21,0.08)', borderRadius: 999, height: 6, overflow: 'hidden', marginTop: 14 }}>
        <div style={{ height: '100%', borderRadius: 999, width: `${dataAvg !== null ? Math.min(100, dataAvg) : 0}%`, background: dataColor.fg, transition: 'width 1s ease' }} />
      </div>

      {/* Evaluations grid */}
      <div style={{ marginTop: 20 }}>
        <div style={{ ...ey, fontSize: 9, marginBottom: 10 }}>Evaluaciones</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(10, minmax(0, 1fr))', gap: 4 }}>
          {data.evaluations.map((val, i) => {
            const isEmpty = val === 0;
            const c = gradeColor(val > 0 ? val : null);
            return (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                <div style={{ fontSize: 8, color: '#A89F8C', fontFamily: 'monospace' }}>E{i + 1}</div>
                {isEditing ? (
                  <input type="number" min="0" max="100" value={val || ''} onChange={e => updateEval(i, e.target.value)}
                    style={{ fontFamily: 'monospace', fontSize: 12, textAlign: 'center', width: '100%', background: '#FFFBF0', border: '1px solid rgba(31,27,21,0.2)', borderRadius: 4, padding: '3px 1px', color: '#1F1B15', outline: 'none' }} />
                ) : (
                  <div style={{ width: '100%', aspectRatio: '1', display: 'grid', placeItems: 'center', borderRadius: 5, background: isEmpty ? 'rgba(31,27,21,0.04)' : c.bg, color: isEmpty ? '#C0B8A3' : c.fg, fontFamily: 'monospace', fontSize: 10, fontWeight: 600 }}>
                    {isEmpty ? '—' : val}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ND & CND */}
      <div style={{ marginTop: 16, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <div style={{ padding: '10px 14px', background: data.nd > 0 ? gradeColor(data.nd).bg : 'rgba(31,27,21,0.03)', border: '1px solid rgba(31,27,21,0.06)', borderRadius: 10 }}>
          <div style={{ ...ey, fontSize: 9, marginBottom: 6, color: data.nd > 0 ? gradeColor(data.nd).fg : '#8B8578' }}>Nota Diaria</div>
          {isEditing ? (
            <input type="number" min="0" max="100" value={data.nd || ''} onChange={e => setDraft(d => d ? { ...d, nd: Math.max(0, Math.min(100, parseInt(e.target.value, 10) || 0)) } : d)}
              style={{ width: '100%', background: 'transparent', border: 'none', outline: 'none', fontFamily: 'monospace', fontSize: 20, fontWeight: 600, color: '#1F1B15' }} />
          ) : (
            <div style={{ fontFamily: 'monospace', fontSize: 22, fontWeight: 600, color: data.nd > 0 ? gradeColor(data.nd).fg : '#B8AF9C' }}>{data.nd > 0 ? data.nd : '—'}</div>
          )}
        </div>
        <div style={{ padding: '10px 14px', background: data.cnd === 'A' ? gradeColor(100).bg : data.cnd === 'B' ? gradeColor(85).bg : 'rgba(31,27,21,0.03)', border: '1px solid rgba(31,27,21,0.06)', borderRadius: 10 }}>
          <div style={{ ...ey, fontSize: 9, marginBottom: 6 }}>Conducta</div>
          {isEditing ? (
            <input type="text" value={data.cnd || ''} maxLength={1} onChange={e => setDraft(d => d ? { ...d, cnd: e.target.value.toUpperCase().slice(0, 1) } : d)}
              placeholder="A/B/C" style={{ width: '100%', background: 'transparent', border: 'none', outline: 'none', fontFamily: 'monospace', fontSize: 20, fontWeight: 600, color: '#1F1B15' }} />
          ) : (
            <div>
              <div style={{ fontFamily: 'monospace', fontSize: 22, fontWeight: 600, color: data.cnd ? '#1F1B15' : '#B8AF9C' }}>{data.cnd || '—'}</div>
              {data.cnd && <div style={{ fontSize: 10, color: '#6B665D', marginTop: 2 }}>{cndLabel(data.cnd)}</div>}
            </div>
          )}
        </div>
      </div>
    </article>
  );
}

export default function BoletinRaphaelJulian() {
  const [subjects, setSubjects] = useState<Subject[]>(INITIAL_SUBJECTS);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Subject | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [saveFlash, setSaveFlash] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length === INITIAL_SUBJECTS.length) setSubjects(parsed);
      }
    } catch { /* ignore */ }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(subjects));
      setSaveFlash(true);
      setTimeout(() => setSaveFlash(false), 1200);
    } catch { /* ignore */ }
  }, [subjects, loaded]);

  const overallAverage = useMemo(() => {
    const avgs = subjects.map(calcAverage).filter((v): v is number => v !== null);
    if (!avgs.length) return null;
    return avgs.reduce((a, b) => a + b, 0) / avgs.length;
  }, [subjects]);

  const stats = useMemo(() => {
    const withGrades = subjects.filter(s => calcAverage(s) !== null);
    const allGrades = subjects.flatMap(s => { const a = [...s.evaluations.filter(v => v > 0)]; if (s.nd > 0) a.push(s.nd); return a; });
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

  return (
    <div style={{ minHeight: '100vh', background: 'radial-gradient(ellipse at top, #FBF7EE 0%, #F4EDE0 60%, #EFE6D4 100%)', fontFamily: "'DM Sans', system-ui, sans-serif", color: '#1F1B15' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300..900;1,9..144,400..900&family=DM+Sans:opsz,wght@9..40,300..700&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
      `}</style>

      {/* TOP BAR */}
      <header style={{ padding: '20px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(31,27,21,0.10)', flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 36, height: 36, borderRadius: 8, background: '#1F1B15', color: '#FBF7EE', display: 'grid', placeItems: 'center', fontSize: 18 }}>🎓</div>
          <div>
            <div style={ey}>CIEM · Boletín Académico</div>
            <div style={{ fontSize: 13, fontWeight: 500, marginTop: 2 }}>Año 2025 · 3er Grado · Grupo X · Período 4</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ ...ey, display: 'flex', alignItems: 'center', gap: 6, color: saveFlash ? '#2D5F3F' : '#6B665D', transition: 'color .3s' }}>
            <span style={{ width: 6, height: 6, borderRadius: 999, background: saveFlash ? '#2D5F3F' : '#C08A1E', display: 'inline-block', transition: 'background .3s' }} />
            {saveFlash ? 'Guardado' : 'Listo'}
          </span>
          <button onClick={resetAll} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '8px 14px', borderRadius: 999, fontSize: 12, fontWeight: 500, border: '1px solid rgba(31,27,21,0.15)', background: 'transparent', cursor: 'pointer' }}>
            ↺ Restablecer
          </button>
        </div>
      </header>

      {/* HERO */}
      <section style={{ padding: '56px 32px 40px' }}>
        <div style={ey}>Estudiante · Expediente 2025-0078</div>
        <h1 style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: 'clamp(52px, 9vw, 120px)', fontWeight: 300, lineHeight: 0.92, letterSpacing: '-0.035em', marginTop: 20 }}>
          Raphael <em style={{ color: '#C08A1E', fontStyle: 'italic' }}>Julian</em>
        </h1>
        <div style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: 'clamp(20px, 3vw, 30px)', fontStyle: 'italic', fontWeight: 300, color: '#6B665D', marginTop: 8 }}>
          Castrillo Braffett
        </div>
        <div style={{ marginTop: 36, width: 140, borderTop: '2px solid #C08A1E' }} />
      </section>

      {/* OVERALL AVERAGE */}
      <section style={{ padding: '0 32px 56px' }}>
        <div style={ey}>Promedio General</div>
        <div style={{ fontFamily: "'Fraunces', Georgia, serif", fontWeight: 300, letterSpacing: '-0.04em', fontSize: 'clamp(120px, 20vw, 240px)', lineHeight: 0.9, color: overallAverage !== null ? '#1F1B15' : '#A89F8C', marginTop: 8 }}>
          {overallAverage !== null ? overallAverage.toFixed(1) : '—'}
        </div>
        {overallAverage !== null && (
          <p style={{ fontFamily: "'Fraunces', Georgia, serif", fontStyle: 'italic', fontSize: 20, color: '#6B665D', marginTop: 16 }}>
            {overallAverage >= 95 ? 'Un desempeño excepcional.' : overallAverage >= 90 ? 'Un desempeño sobresaliente.' : overallAverage >= 80 ? 'Un desempeño muy sólido.' : 'Progreso constante.'}
          </p>
        )}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 16, marginTop: 40, maxWidth: 800 }}>
          <StatCard icon="📚" label="Con notas" value={`${stats.active}/${stats.total}`} />
          <StatCard icon="⭐" label="Notas perfectas" value={stats.perfect} />
          <StatCard icon="📈" label="Nota más alta" value={stats.highest ?? '—'} />
          <StatCard icon="🏆" label="Mejor asignatura" value={stats.best?.name ?? '—'} small />
        </div>
      </section>

      <div style={{ padding: '0 32px' }}><div style={{ borderTop: '1px solid rgba(31,27,21,0.12)' }} /></div>

      {/* SUBJECTS */}
      <section style={{ padding: '48px 32px 0' }}>
        <div style={ey}>Las asignaturas</div>
        <h2 style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: 'clamp(28px, 4vw, 48px)', fontWeight: 300, letterSpacing: '-0.02em', lineHeight: 1, marginTop: 8 }}>
          Nueve materias, <em style={{ color: '#C08A1E' }}>un año.</em>
        </h2>
        <p style={{ marginTop: 14, fontSize: 13, color: '#6B665D', maxWidth: 500 }}>
          Pulsa <strong style={{ color: '#1F1B15' }}>Editar</strong> para actualizar las evaluaciones conforme CIEM las publique.
        </p>
      </section>

      <section style={{ padding: '32px 32px 80px', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 20 }}>
        {subjects.map((s) => (
          <SubjectCard key={s.id} subject={s}
            isEditing={editingId === s.id} draft={editingId === s.id ? draft : null}
            setDraft={setDraft} onStartEdit={() => startEdit(s)}
            onCancel={cancelEdit} onSave={saveEdit}
            canEditNow={editingId === null || editingId === s.id}
          />
        ))}
      </section>

      <div style={{ padding: '0 32px' }}><div style={{ borderTop: '2px solid #C08A1E', width: 100 }} /></div>
      <footer style={{ padding: '64px 32px', textAlign: 'center' }}>
        <div style={{ fontSize: 32 }}>❤️</div>
        <p style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: 'clamp(20px, 3vw, 30px)', fontStyle: 'italic', fontWeight: 300, color: '#1F1B15', maxWidth: 620, margin: '20px auto 0', lineHeight: 1.3 }}>
          Creado con amor por el <span style={{ color: '#C08A1E' }}>papá</span> de Raphael Julian.
        </p>
        <p style={{ marginTop: 16, fontSize: 13, color: '#6B665D' }}>
          Cada nota cuenta una historia. Cada esfuerzo, un paso. Estamos orgullosos de ti, campeón.
        </p>
        <div style={{ ...ey, marginTop: 32, opacity: 0.6 }}>CIEM · Año Académico 2025 · Período 4</div>
      </footer>
    </div>
  );
}
