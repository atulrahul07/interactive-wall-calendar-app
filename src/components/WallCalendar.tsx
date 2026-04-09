'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import {
  format, startOfMonth, endOfMonth, eachDayOfInterval,
  startOfWeek, endOfWeek, isSameDay, isSameMonth,
  isWithinInterval, addMonths, subMonths, isToday,
  parseISO, isWeekend
} from 'date-fns'
import { ChevronLeft, ChevronRight, Trash2, Palette, X, Bookmark, Sun, Moon, Wind, Flame } from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────────────────────
interface DateNote {
  id: string
  dateKey: string
  text: string
  color: string
}

interface RangeNote {
  id: string
  startKey: string
  endKey: string
  text: string
}

type Theme = 'flame' | 'ocean' | 'forest' | 'dusk'

// ─── Constants ────────────────────────────────────────────────────────────────
const THEMES: { id: Theme; label: string; icon: React.ReactNode; heroQuery: string }[] = [
  { id: 'flame',  label: 'Alpine',  icon: <Flame size={14} />,  heroQuery: 'mountain+adventure+climbing' },
  { id: 'ocean',  label: 'Ocean',   icon: <Wind size={14} />,   heroQuery: 'ocean+waves+blue+sea' },
  { id: 'forest', label: 'Forest',  icon: <Sun size={14} />,    heroQuery: 'forest+green+nature+mist' },
  { id: 'dusk',   label: 'Dusk',    icon: <Moon size={14} />,   heroQuery: 'sunset+purple+sky+dusk' },
]

// Local month images from /public/months/
const MONTH_IMAGE_FILES: Record<number, string> = {
  0:  '/months/january.jpg',
  1:  '/months/february.jpg',
  2:  '/months/march.jpg',
  3:  '/months/april.jpg',
  4:  '/months/may.jpg',
  5:  '/months/june.jpg',
  6:  '/months/july.jpg',
  7:  '/months/august.jpg',
  8:  '/months/september.jpg',
  9:  '/months/october.jpg',
  10: '/months/november.jpg',
  11: '/months/december.jpg',
}

const HOLIDAYS: Record<string, string> = {
  '01-01': '🎊', '01-26': '🇮🇳', '03-08': '💐', '04-14': '🌸',
  '05-01': '⚒️', '08-15': '🇮🇳', '10-02': '🕊️', '10-20': '🪔',
  '12-25': '🎄', '12-31': '🎆',
}

const NOTE_COLORS = ['#c8502a', '#2a7a7c', '#c8a438', '#7a3a6a', '#3a7a4a']
const WEEK_DAYS = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN']

function dateKey(d: Date) { return format(d, 'yyyy-MM-dd') }

// ─── Component ────────────────────────────────────────────────────────────────
export default function WallCalendar() {
  const today = new Date()
  const [currentMonth, setCurrentMonth]       = useState(today)
  const [rangeStart, setRangeStart]           = useState<Date | null>(null)
  const [rangeEnd, setRangeEnd]               = useState<Date | null>(null)
  const [hoverDate, setHoverDate]             = useState<Date | null>(null)
  const [dateNotes, setDateNotes]             = useState<DateNote[]>([])
  const [rangeNotes, setRangeNotes]           = useState<RangeNote[]>([])
  const [activeNote, setActiveNote]           = useState('')
  const [theme, setTheme]                     = useState<Theme>('flame')
  const [isFlipping, setIsFlipping]           = useState(false)
  const [flipDirection, setFlipDirection]     = useState<'next' | 'prev'>('next')
  const [showThemePicker, setShowThemePicker] = useState(false)
  const [mounted, setMounted]                 = useState(false)
  const noteRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    setMounted(true)
    const saved = localStorage.getItem('wall-calendar-state')
    if (saved) {
      try {
        const s = JSON.parse(saved)
        if (s.dateNotes)  setDateNotes(s.dateNotes)
        if (s.rangeNotes) setRangeNotes(s.rangeNotes)
        if (s.theme)      setTheme(s.theme)
      } catch {}
    }
  }, [])

  useEffect(() => {
    if (!mounted) return
    localStorage.setItem('wall-calendar-state', JSON.stringify({ dateNotes, rangeNotes, theme }))
  }, [dateNotes, rangeNotes, theme, mounted])

  // Load active note when selection changes
  useEffect(() => {
    if (rangeStart && rangeEnd) {
      const key = `${dateKey(rangeStart)}_${dateKey(rangeEnd)}`
      const existing = rangeNotes.find(n => n.startKey === dateKey(rangeStart) && n.endKey === dateKey(rangeEnd))
      setActiveNote(existing?.text || '')
    } else if (rangeStart && !rangeEnd) {
      const existing = dateNotes.find(n => n.dateKey === dateKey(rangeStart))
      setActiveNote(existing?.text || '')
    } else {
      setActiveNote('')
    }
  }, [rangeStart, rangeEnd, dateNotes, rangeNotes])

  // ─── Calendar grid ───────────────────────────────────────────────────────
  const monthStart  = startOfMonth(currentMonth)
  const monthEnd    = endOfMonth(currentMonth)
  const gridStart   = startOfWeek(monthStart, { weekStartsOn: 1 })
  const gridEnd     = endOfWeek(monthEnd,   { weekStartsOn: 1 })
  const days        = eachDayOfInterval({ start: gridStart, end: gridEnd })

  // ─── Navigation ──────────────────────────────────────────────────────────
  const navigate = useCallback((dir: 'next' | 'prev') => {
    if (isFlipping) return
    setFlipDirection(dir)
    setIsFlipping(true)
    setTimeout(() => {
      setCurrentMonth(m => dir === 'next' ? addMonths(m, 1) : subMonths(m, 1))
      setIsFlipping(false)
    }, 500)
  }, [isFlipping])

  // ─── Date click ──────────────────────────────────────────────────────────
  const handleDateClick = useCallback((day: Date) => {
    if (!isSameMonth(day, currentMonth)) return
    if (!rangeStart || (rangeStart && rangeEnd)) {
      setRangeStart(day)
      setRangeEnd(null)
    } else {
      if (isSameDay(day, rangeStart)) {
        setRangeStart(null)
        return
      }
      if (day < rangeStart) {
        setRangeEnd(rangeStart)
        setRangeStart(day)
      } else {
        setRangeEnd(day)
      }
    }
  }, [rangeStart, rangeEnd, currentMonth])

  // ─── Day cell state ───────────────────────────────────────────────────────
  const getDayState = (day: Date) => {
    const effectiveEnd = rangeEnd || (rangeStart && hoverDate && hoverDate > rangeStart ? hoverDate : null)
    const isStart  = rangeStart && isSameDay(day, rangeStart)
    const isEnd    = effectiveEnd && isSameDay(day, effectiveEnd)
    const inRange  = rangeStart && effectiveEnd && isWithinInterval(day, {
      start: rangeStart < effectiveEnd ? rangeStart : effectiveEnd,
      end:   rangeStart < effectiveEnd ? effectiveEnd : rangeStart,
    }) && !isStart && !isEnd
    const noteExists = dateNotes.some(n => n.dateKey === dateKey(day))
    const holiday = HOLIDAYS[format(day, 'MM-dd')]
    return { isStart, isEnd, inRange, noteExists, holiday }
  }

  // ─── Save note ────────────────────────────────────────────────────────────
  const saveNote = useCallback(() => {
    if (!activeNote.trim()) return
    if (rangeStart && rangeEnd) {
      const id = `${dateKey(rangeStart)}_${dateKey(rangeEnd)}`
      setRangeNotes(prev => {
        const filtered = prev.filter(n => !(n.startKey === dateKey(rangeStart!) && n.endKey === dateKey(rangeEnd!)))
        return [...filtered, { id, startKey: dateKey(rangeStart!), endKey: dateKey(rangeEnd!), text: activeNote }]
      })
    } else if (rangeStart) {
      const color = NOTE_COLORS[Math.floor(Math.random() * NOTE_COLORS.length)]
      setDateNotes(prev => {
        const filtered = prev.filter(n => n.dateKey !== dateKey(rangeStart!))
        return [...filtered, { id: dateKey(rangeStart!), dateKey: dateKey(rangeStart!), text: activeNote, color }]
      })
    }
  }, [activeNote, rangeStart, rangeEnd])

  const clearSelection = () => {
    setRangeStart(null)
    setRangeEnd(null)
    setActiveNote('')
  }

  const deleteNote = (id: string, type: 'date' | 'range') => {
    if (type === 'date')  setDateNotes(prev => prev.filter(n => n.id !== id))
    if (type === 'range') setRangeNotes(prev => prev.filter(n => n.id !== id))
  }

  // Local hero image for current month
  const heroSrc = MONTH_IMAGE_FILES[currentMonth.getMonth()]

  // ─── Range summary label ──────────────────────────────────────────────────
  const rangeLabel = rangeStart && rangeEnd
    ? `${format(rangeStart, 'MMM d')} – ${format(rangeEnd, 'MMM d, yyyy')}`
    : rangeStart
    ? `${format(rangeStart, 'MMMM d, yyyy')}`
    : null

  // ─── Current notes for this month ────────────────────────────────────────
  const monthNotes = dateNotes.filter(n => n.dateKey.startsWith(format(currentMonth, 'yyyy-MM')))
  const activeRangeNote = rangeStart && rangeEnd
    ? rangeNotes.find(n => n.startKey === dateKey(rangeStart) && n.endKey === dateKey(rangeEnd))
    : null

  if (!mounted) return null

  return (
    <div data-theme={theme} className="w-full max-w-5xl animate-fade-in-scale" style={{ animationDelay: '0.1s', opacity: 0, animationFillMode: 'forwards' }}>

      {/* ── Theme picker ── */}
      <div className="flex justify-end mb-4 gap-2 items-center">
        <span style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Theme</span>
        {THEMES.map(t => (
          <button
            key={t.id}
            onClick={() => setTheme(t.id)}
            title={t.label}
            style={{
              display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px',
              borderRadius: 20, border: `1.5px solid ${theme === t.id ? 'var(--accent)' : 'var(--paper-dark)'}`,
              background: theme === t.id ? 'var(--accent)' : 'white',
              color: theme === t.id ? 'white' : 'var(--muted)',
              fontSize: 12, cursor: 'pointer', fontFamily: 'var(--font-body)',
              transition: 'all 0.2s ease', fontWeight: theme === t.id ? 600 : 400,
            }}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* ── Main calendar card ── */}
      <div className="calendar-card" style={{ perspective: 1200 }}>

        {/* Spiral rings */}
        <div className="spiral-bar">
          {Array.from({ length: 22 }).map((_, i) => (
            <div key={i} className="spiral-ring" style={{ margin: '0 3px' }} />
          ))}
        </div>

        {/* Desktop layout: hero + grid side by side */}
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.1fr) minmax(0, 1fr)', minHeight: 500 }}
             className="max-md:!grid-cols-1">

          {/* ── Left: Hero image ── */}
          <div
            className="hero-image-container"
            style={{
              height: 500,
              transition: 'all 0.3s',
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={heroSrc}
              alt={`${format(currentMonth, 'MMMM yyyy')}`}
              className={isFlipping ? 'animate-page-flip' : ''}
              style={{ height: '100%' }}
            />
            <div className="hero-overlay" />

            {/* Month/year badge */}
            <div className="month-badge" style={{ fontFamily: 'var(--font-display)' }}>
              <div style={{ fontSize: 13, opacity: 0.8, letterSpacing: '0.1em' }}>{format(currentMonth, 'yyyy')}</div>
              <div style={{ fontSize: 22, fontWeight: 900, letterSpacing: '0.06em', lineHeight: 1.1 }}>
                {format(currentMonth, 'MMMM').toUpperCase()}
              </div>
            </div>

            {/* Notes list overlay on image */}
            {monthNotes.length > 0 && (
              <div style={{
                position: 'absolute', top: 16, left: 16, right: 16,
                display: 'flex', flexDirection: 'column', gap: 6, zIndex: 10,
              }}>
                {monthNotes.slice(0, 3).map(note => (
                  <div key={note.id} style={{
                    background: 'rgba(255,255,255,0.92)',
                    borderLeft: `3px solid ${note.color}`,
                    padding: '5px 10px', borderRadius: '0 4px 4px 0',
                    fontSize: 11, fontFamily: 'var(--font-body)', backdropFilter: 'blur(8px)',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    maxWidth: 240,
                  }}>
                    <span style={{ color: 'var(--ink)', fontWeight: 500 }}>
                      {format(parseISO(note.dateKey), 'MMM d')} — {note.text.slice(0, 28)}{note.text.length > 28 ? '…' : ''}
                    </span>
                    <button onClick={() => deleteNote(note.id, 'date')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', marginLeft: 6, padding: '0 2px', fontSize: 10 }}>×</button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ── Right: Calendar grid + notes ── */}
          <div style={{ display: 'flex', flexDirection: 'column', padding: '28px 24px 20px', background: 'white', minHeight: 500 }}>

            {/* Navigation */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <button className="nav-btn" onClick={() => navigate('prev')}>
                <ChevronLeft size={16} />
              </button>
              <div style={{ textAlign: 'center' }}>
                <div style={{
                  fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700,
                  color: 'var(--ink)', letterSpacing: '-0.01em', lineHeight: 1.1,
                  transition: 'all 0.3s',
                  opacity: isFlipping ? 0 : 1,
                  transform: isFlipping ? (flipDirection === 'next' ? 'translateY(-8px)' : 'translateY(8px)') : 'none',
                }}>
                  {format(currentMonth, 'MMMM')}
                </div>
                <div style={{ fontSize: 12, color: 'var(--muted)', fontFamily: 'var(--font-mono)', letterSpacing: '0.1em' }}>
                  {format(currentMonth, 'yyyy')}
                </div>
              </div>
              <button className="nav-btn" onClick={() => navigate('next')}>
                <ChevronRight size={16} />
              </button>
            </div>

            {/* Weekday headers */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', marginBottom: 6 }}>
              {WEEK_DAYS.map(d => (
                <div key={d} style={{
                  textAlign: 'center', fontSize: 10, fontWeight: 600,
                  letterSpacing: '0.08em', color: d === 'SAT' || d === 'SUN' ? 'var(--accent)' : 'var(--muted)',
                  fontFamily: 'var(--font-mono)', paddingBottom: 6,
                  borderBottom: '1px solid var(--paper-dark)', marginBottom: 4,
                }}>
                  {d}
                </div>
              ))}
            </div>

            {/* Date grid */}
            <div
              style={{
                display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2, flex: 1,
                opacity: isFlipping ? 0 : 1,
                transform: isFlipping ? (flipDirection === 'next' ? 'translateY(-6px)' : 'translateY(6px)') : 'none',
                transition: 'opacity 0.3s, transform 0.3s',
              }}
            >
              {days.map((day, idx) => {
                const { isStart, isEnd, inRange, noteExists, holiday } = getDayState(day)
                const otherMonth = !isSameMonth(day, currentMonth)
                const todayDay = isToday(day)
                const weekend = isWeekend(day)

                return (
                  <div
                    key={idx}
                    className={[
                      'date-cell',
                      otherMonth  ? 'other-month' : '',
                      todayDay    ? 'today'        : '',
                      weekend && !isStart && !isEnd ? 'weekend' : '',
                      isStart ? 'range-start' : '',
                      isEnd   ? 'range-end'   : '',
                      inRange ? 'in-range'    : '',
                      noteExists  ? 'has-note'  : '',
                    ].join(' ')}
                    onClick={() => handleDateClick(day)}
                    onMouseEnter={() => rangeStart && !rangeEnd && setHoverDate(day)}
                    onMouseLeave={() => setHoverDate(null)}
                    style={{ animationDelay: `${idx * 8}ms`, minHeight: 36 }}
                  >
                    <span>{format(day, 'd')}</span>
                    {holiday && !otherMonth && (
                      <span className="holiday-marker">{holiday}</span>
                    )}
                  </div>
                )
              })}
            </div>

            {/* Today btn */}
            <div style={{ marginTop: 10, display: 'flex', justifyContent: 'center' }}>
              <button
                onClick={() => setCurrentMonth(today)}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  fontSize: 11, color: 'var(--muted)', fontFamily: 'var(--font-body)',
                  display: 'flex', alignItems: 'center', gap: 4, padding: '4px 8px',
                  borderRadius: 12, transition: 'all 0.2s',
                }}
                onMouseEnter={e => (e.currentTarget.style.color = 'var(--accent)')}
                onMouseLeave={e => (e.currentTarget.style.color = 'var(--muted)')}
              >
                <span className="today-dot" style={{
                  width: 6, height: 6, borderRadius: '50%', background: 'var(--teal)',
                  display: 'inline-block',
                }} />
                Today: {format(today, 'MMM d, yyyy')}
              </button>
            </div>
          </div>
        </div>

        {/* ── Notes section ── */}
        <div className="notes-section" style={{ padding: '20px 28px 24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Bookmark size={14} color="var(--accent)" />
              <span style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 700, color: 'var(--ink)' }}>
                Notes
              </span>
              {rangeLabel && (
                <span style={{
                  fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--accent)',
                  background: 'var(--accent-pale)', padding: '2px 8px', borderRadius: 10,
                  display: 'flex', alignItems: 'center', gap: 6,
                }}>
                  {rangeLabel}
                  <button onClick={clearSelection} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', padding: 0, display: 'flex', alignItems: 'center' }}>
                    <X size={10} />
                  </button>
                </span>
              )}
            </div>
            {rangeLabel && (
              <button
                onClick={saveNote}
                disabled={!activeNote.trim()}
                style={{
                  background: activeNote.trim() ? 'var(--accent)' : 'var(--paper-dark)',
                  color: activeNote.trim() ? 'white' : 'var(--muted)',
                  border: 'none', borderRadius: 6, padding: '6px 14px',
                  fontSize: 12, fontFamily: 'var(--font-body)', fontWeight: 600,
                  cursor: activeNote.trim() ? 'pointer' : 'default',
                  transition: 'all 0.2s',
                }}
              >
                Save Note
              </button>
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }} className="max-md:!grid-cols-1">
            {/* Left: note lines (decorative) + textarea */}
            <div>
              <div style={{ position: 'relative' }}>
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="note-line" />
                ))}
                <textarea
                  ref={noteRef}
                  className="notes-textarea"
                  rows={5}
                  placeholder={
                    rangeStart && rangeEnd
                      ? `Add a note for ${format(rangeStart, 'MMM d')}–${format(rangeEnd, 'MMM d')}…`
                      : rangeStart
                      ? `Add a note for ${format(rangeStart, 'MMMM d')}…`
                      : 'Select a date or range to add a note…'
                  }
                  value={activeNote}
                  onChange={e => setActiveNote(e.target.value)}
                  disabled={!rangeStart}
                  style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', paddingTop: 2 }}
                />
              </div>
            </div>

            {/* Right: saved range notes */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {rangeNotes.length === 0 && monthNotes.length === 0 ? (
                <p style={{ fontSize: 12, color: 'var(--muted)', fontStyle: 'italic', fontFamily: 'var(--font-body)' }}>
                  No saved notes yet. Select a date range and jot something down!
                </p>
              ) : (
                <>
                  {rangeNotes.map(note => (
                    <div key={note.id} style={{
                      background: 'white', borderRadius: 6, padding: '8px 12px',
                      borderLeft: '3px solid var(--accent)', boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                      display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8,
                    }}>
                      <div>
                        <div style={{ fontSize: 10, color: 'var(--muted)', fontFamily: 'var(--font-mono)', marginBottom: 2 }}>
                          {format(parseISO(note.startKey), 'MMM d')} → {format(parseISO(note.endKey), 'MMM d')}
                        </div>
                        <div style={{ fontSize: 12, color: 'var(--ink)', fontFamily: 'var(--font-body)', lineHeight: 1.5 }}>
                          {note.text}
                        </div>
                      </div>
                      <button onClick={() => deleteNote(note.id, 'range')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', padding: '2px', flexShrink: 0 }}>
                        <Trash2 size={12} />
                      </button>
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>

          {/* Legend */}
          <div style={{ marginTop: 16, display: 'flex', gap: 20, flexWrap: 'wrap' }}>
            {[
              { label: 'Today', color: 'var(--teal)', shape: 'dot' },
              { label: 'Selection', color: 'var(--accent)', shape: 'square' },
              { label: 'In Range', color: 'var(--accent-pale)', shape: 'square', textColor: 'var(--accent)' },
              { label: 'Note', color: 'var(--gold)', shape: 'dot' },
              { label: 'Holiday', emoji: '🎊' },
            ].map(item => (
              <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: 'var(--muted)', fontFamily: 'var(--font-body)' }}>
                {item.emoji ? (
                  <span>{item.emoji}</span>
                ) : item.shape === 'dot' ? (
                  <span style={{ width: 7, height: 7, borderRadius: '50%', background: item.color, display: 'inline-block' }} />
                ) : (
                  <span style={{ width: 12, height: 12, borderRadius: 2, background: item.color, display: 'inline-block', border: item.textColor ? `1.5px solid ${item.color}` : 'none' }} />
                )}
                {item.label}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Footer ── */}
      <div style={{ textAlign: 'center', marginTop: 16, color: 'var(--muted)', fontSize: 11, fontFamily: 'var(--font-mono)', letterSpacing: '0.06em' }}>
        CLICK A DATE TO SELECT · CLICK AGAIN TO SET RANGE END · NOTES AUTO-SAVE
      </div>
    </div>
  )
}
