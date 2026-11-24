import React, { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { calcCholqij } from '../../data/cholqijData';
import { soundEffects } from '../../utils/soundEffects';

function getTodayIso(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export type CalendarTheme = 'observatory-night' | 'solar-parchment' | 'high-contrast';

interface MayaDatePickerModalProps {
  isOpen: boolean;
  value: string;
  theme: CalendarTheme;
  onSelect: (isoDate: string) => void;
  onClose: () => void;
}

type PickerView = 'days' | 'months' | 'years';

const MONTHS_ES = [
  'Enero',
  'Febrero',
  'Marzo',
  'Abril',
  'Mayo',
  'Junio',
  'Julio',
  'Agosto',
  'Septiembre',
  'Octubre',
  'Noviembre',
  'Diciembre',
];

const WEEKDAYS_ES = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

function parseIsoParts(iso: string): { year: number; month: number; day: number } {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!match) {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth(), day: now.getDate() };
  }
  return {
    year: Number(match[1]),
    month: Math.max(0, Math.min(11, Number(match[2]) - 1)),
    day: Math.max(1, Math.min(31, Number(match[3]))),
  };
}

function toIso(year: number, monthZeroBased: number, day: number): string {
  const y = String(year).padStart(4, '0');
  const m = String(monthZeroBased + 1).padStart(2, '0');
  const d = String(day).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function formatGregorianLongEs(iso: string): string {
  const { year, month, day } = parseIsoParts(iso);
  const date = new Date(year, month, day);
  return date.toLocaleDateString('es-GT', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export const MayaDatePickerModal: React.FC<MayaDatePickerModalProps> = ({
  isOpen,
  value,
  theme,
  onSelect,
  onClose,
}) => {
  const todayIso = useMemo(() => getTodayIso(), []);
  const initialParts = useMemo(() => parseIsoParts(value), [value]);

  const [draftIso, setDraftIso] = useState<string>(value);
  const [viewYear, setViewYear] = useState<number>(initialParts.year);
  const [viewMonth, setViewMonth] = useState<number>(initialParts.month);
  const [viewMode, setViewMode] = useState<PickerView>('days');
  const [yearInput, setYearInput] = useState<string>(String(initialParts.year));
  const [gridAnimKey, setGridAnimKey] = useState<number>(0);

  useEffect(() => {
    if (!isOpen) return;
    const parts = parseIsoParts(value);
    setDraftIso(value);
    setViewYear(parts.year);
    setViewMonth(parts.month);
    setYearInput(String(parts.year));
    setViewMode('days');
  }, [isOpen, value]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  const draftCholqij = useMemo(() => calcCholqij(draftIso), [draftIso]);

  const calendarCells = useMemo(() => {
    const firstDay = new Date(viewYear, viewMonth, 1);
    // Lunes = 0 ... Domingo = 6
    const startOffset = (firstDay.getDay() + 6) % 7;
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const prevMonthDays = new Date(viewYear, viewMonth, 0).getDate();

    const cells: Array<{
      iso: string;
      day: number;
      inCurrentMonth: boolean;
      cholqijLabel: string;
      emoji: string;
    }> = [];

    for (let i = startOffset - 1; i >= 0; i--) {
      const d = prevMonthDays - i;
      const m = viewMonth === 0 ? 11 : viewMonth - 1;
      const y = viewMonth === 0 ? viewYear - 1 : viewYear;
      const iso = toIso(y, m, d);
      const res = calcCholqij(iso);
      cells.push({
        iso,
        day: d,
        inCurrentMonth: false,
        cholqijLabel: `${res.energy}`,
        emoji: res.nawal.emoji,
      });
    }

    for (let d = 1; d <= daysInMonth; d++) {
      const iso = toIso(viewYear, viewMonth, d);
      const res = calcCholqij(iso);
      cells.push({
        iso,
        day: d,
        inCurrentMonth: true,
        cholqijLabel: `${res.energy}`,
        emoji: res.nawal.emoji,
      });
    }

    const remaining = (7 - (cells.length % 7)) % 7;
    for (let d = 1; d <= remaining; d++) {
      const m = viewMonth === 11 ? 0 : viewMonth + 1;
      const y = viewMonth === 11 ? viewYear + 1 : viewYear;
      const iso = toIso(y, m, d);
      const res = calcCholqij(iso);
      cells.push({
        iso,
        day: d,
        inCurrentMonth: false,
        cholqijLabel: `${res.energy}`,
        emoji: res.nawal.emoji,
      });
    }

    return cells;
  }, [viewYear, viewMonth]);

  const yearBlockStart = Math.floor(viewYear / 12) * 12;
  const yearList = useMemo(
    () => Array.from({ length: 12 }, (_, idx) => yearBlockStart + idx),
    [yearBlockStart]
  );

  if (!isOpen) return null;

  const shiftMonth = (delta: number) => {
    soundEffects.playClick();
    let nextMonth = viewMonth + delta;
    let nextYear = viewYear;
    if (nextMonth < 0) {
      nextMonth = 11;
      nextYear -= 1;
    } else if (nextMonth > 11) {
      nextMonth = 0;
      nextYear += 1;
    }
    setViewMonth(nextMonth);
    setViewYear(nextYear);
    setYearInput(String(nextYear));
    setGridAnimKey((k) => k + 1);
  };

  const applyAndClose = (iso: string) => {
    soundEffects.playClick();
    onSelect(iso);
    onClose();
  };

  const jumpToPreset = (iso: string) => {
    soundEffects.playClick();
    const parts = parseIsoParts(iso);
    setDraftIso(iso);
    setViewYear(parts.year);
    setViewMonth(parts.month);
    setYearInput(String(parts.year));
    setViewMode('days');
    setGridAnimKey((k) => k + 1);
  };

  const handleYearJumpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseInt(yearInput, 10);
    if (!Number.isNaN(parsed) && parsed >= 1000 && parsed <= 2500) {
      soundEffects.playClick();
      setViewYear(parsed);
      setViewMode('months');
      setGridAnimKey((k) => k + 1);
    }
  };

  return createPortal(
    <div
      className="cm-modal-backdrop"
      data-theme={theme}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Selector de fecha gregoriana y Cholq'ij"
    >
      <div className="cm-date-modal-card" onClick={(e) => e.stopPropagation()}>
        {/* Cabecera del modal */}
        <div className="cm-date-modal-header">
          <div>
            <span className="cm-badge">🗓️ Selector Astronómico</span>
            <h3 style={{ margin: '6px 0 0', fontFamily: 'Georgia, serif', fontSize: '1.35rem' }}>
              Elige una fecha o tu nacimiento
            </h3>
          </div>
          <button
            type="button"
            className="cm-btn cm-btn-secondary"
            onClick={onClose}
            aria-label="Cerrar selector de fecha"
          >
            ✕
          </button>
        </div>

        {/* Atajos rápidos */}
        <div className="cm-date-presets">
          <button
            type="button"
            className="cm-preset-chip"
            onClick={() => jumpToPreset(todayIso)}
          >
            ☀️ Hoy
          </button>
          <button
            type="button"
            className="cm-preset-chip"
            onClick={() => jumpToPreset('2012-12-21')}
          >
            ✨ 13 Baktun (2012)
          </button>
          <button
            type="button"
            className="cm-preset-chip"
            onClick={() => {
              soundEffects.playClick();
              setViewYear(2000);
              setYearInput('2000');
              setViewMode('years');
              setGridAnimKey((k) => k + 1);
            }}
          >
            🎂 Década 2000
          </button>
          <button
            type="button"
            className="cm-preset-chip"
            onClick={() => {
              soundEffects.playClick();
              setViewYear(1990);
              setYearInput('1990');
              setViewMode('years');
              setGridAnimKey((k) => k + 1);
            }}
          >
            🎂 Década 1990
          </button>
        </div>

        {/* Barra de navegación Mes / Año */}
        <div className="cm-cal-nav">
          <button
            type="button"
            className="cm-cal-nav-arrow"
            onClick={() => {
              if (viewMode === 'days') shiftMonth(-1);
              else if (viewMode === 'months') {
                soundEffects.playClick();
                setViewYear((y) => y - 1);
                setGridAnimKey((k) => k + 1);
              } else {
                soundEffects.playClick();
                setViewYear((y) => y - 12);
                setGridAnimKey((k) => k + 1);
              }
            }}
            aria-label="Anterior"
          >
            ◀
          </button>

          <div className="cm-cal-nav-title-group">
            <button
              type="button"
              className={`cm-cal-pill-switch ${viewMode === 'months' ? 'active' : ''}`}
              onClick={() => {
                soundEffects.playClick();
                setViewMode(viewMode === 'months' ? 'days' : 'months');
                setGridAnimKey((k) => k + 1);
              }}
            >
              {MONTHS_ES[viewMonth]} ▾
            </button>
            <button
              type="button"
              className={`cm-cal-pill-switch ${viewMode === 'years' ? 'active' : ''}`}
              onClick={() => {
                soundEffects.playClick();
                setViewMode(viewMode === 'years' ? 'days' : 'years');
                setGridAnimKey((k) => k + 1);
              }}
            >
              {viewMode === 'years' ? `${yearBlockStart} – ${yearBlockStart + 11}` : viewYear} ▾
            </button>
          </div>

          <button
            type="button"
            className="cm-cal-nav-arrow"
            onClick={() => {
              if (viewMode === 'days') shiftMonth(1);
              else if (viewMode === 'months') {
                soundEffects.playClick();
                setViewYear((y) => y + 1);
                setGridAnimKey((k) => k + 1);
              } else {
                soundEffects.playClick();
                setViewYear((y) => y + 12);
                setGridAnimKey((k) => k + 1);
              }
            }}
            aria-label="Siguiente"
          >
            ▶
          </button>
        </div>

        {/* Vista dinámica: Días / Meses / Años */}
        <div key={`${viewMode}-${gridAnimKey}`} className="cm-cal-stage-anim">
          {viewMode === 'days' && (
            <>
              <div className="cm-cal-weekdays">
                {WEEKDAYS_ES.map((wd) => (
                  <span key={wd}>{wd}</span>
                ))}
              </div>
              <div className="cm-cal-days-grid">
                {calendarCells.map((cell) => {
                  const isSelected = cell.iso === draftIso;
                  const isToday = cell.iso === todayIso;
                  return (
                    <button
                      key={cell.iso}
                      type="button"
                      className={`cm-cal-day-cell ${cell.inCurrentMonth ? '' : 'outside'} ${
                        isSelected ? 'selected' : ''
                      } ${isToday ? 'today' : ''}`}
                      onClick={() => {
                        soundEffects.playClick();
                        setDraftIso(cell.iso);
                        if (!cell.inCurrentMonth) {
                          const p = parseIsoParts(cell.iso);
                          setViewYear(p.year);
                          setViewMonth(p.month);
                          setYearInput(String(p.year));
                        }
                      }}
                      onDoubleClick={() => applyAndClose(cell.iso)}
                    >
                      <span className="cm-cal-day-num">{cell.day}</span>
                      <span className="cm-cal-day-maya" aria-hidden="true">
                        {cell.cholqijLabel} {cell.emoji}
                      </span>
                    </button>
                  );
                })}
              </div>
            </>
          )}

          {viewMode === 'months' && (
            <div className="cm-cal-months-grid">
              {MONTHS_ES.map((mName, idx) => {
                const isActive = idx === viewMonth;
                return (
                  <button
                    key={mName}
                    type="button"
                    className={`cm-cal-select-tile ${isActive ? 'selected' : ''}`}
                    onClick={() => {
                      soundEffects.playClick();
                      setViewMonth(idx);
                      setViewMode('days');
                      setGridAnimKey((k) => k + 1);
                    }}
                  >
                    {mName}
                  </button>
                );
              })}
            </div>
          )}

          {viewMode === 'years' && (
            <div>
              <form onSubmit={handleYearJumpSubmit} className="cm-cal-year-jump">
                <label htmlFor="cm-year-input" style={{ fontSize: '0.84rem', fontWeight: 600 }}>
                  Ir directo al año:
                </label>
                <input
                  id="cm-year-input"
                  type="number"
                  min={1000}
                  max={2500}
                  value={yearInput}
                  onChange={(e) => setYearInput(e.target.value)}
                  className="cm-cal-year-input"
                  placeholder="Ej. 1995"
                />
                <button type="submit" className="cm-btn cm-btn-secondary">
                  Ir
                </button>
              </form>
              <div className="cm-cal-years-grid">
                {yearList.map((yr) => {
                  const isActive = yr === viewYear;
                  return (
                    <button
                      key={yr}
                      type="button"
                      className={`cm-cal-select-tile ${isActive ? 'selected' : ''}`}
                      onClick={() => {
                        soundEffects.playClick();
                        setViewYear(yr);
                        setYearInput(String(yr));
                        setViewMode('months');
                        setGridAnimKey((k) => k + 1);
                      }}
                    >
                      {yr}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Previsualización en vivo + Confirmación */}
        <div className="cm-date-modal-footer">
          <div className="cm-date-preview-pill">
            <span style={{ fontSize: '1.65rem', lineHeight: 1 }}>{draftCholqij.nawal.emoji}</span>
            <div>
              <div style={{ fontWeight: 800, fontSize: '0.96rem', color: 'var(--cm-text-primary)' }}>
                {draftCholqij.energy} {draftCholqij.nawal.name}
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--cm-text-secondary)', textTransform: 'capitalize' }}>
                {formatGregorianLongEs(draftIso)}
              </div>
            </div>
          </div>

          <button
            type="button"
            className="cm-btn cm-btn-primary"
            onClick={() => applyAndClose(draftIso)}
          >
            ✨ Aplicar fecha
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};
