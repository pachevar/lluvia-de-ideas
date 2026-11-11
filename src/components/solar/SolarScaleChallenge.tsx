import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSutzResources } from '../../context/SutzResourcesContext';
import { isAcademiaQrSessionActive, reportChallengeCompletion } from '../../services/academiaqrSyncService';
import {
  createSolarScaleRoom, getSolarScaleRoom, listenToSolarScalePins, listenToSolarScaleRoom,
  saveSolarScalePin, setSolarScaleRevealed,
  type SolarScalePin, type SolarScaleRoom
} from '../../services/solarScaleService';
import {
  CHALLENGE_ASTROS, PARTICIPATION_REWARD, SUN_CARD_CM, TIER_REWARDS, formatMeters,
  generateRoomCode, getChallengeAstro, getScaleDiameterMm, getScaleDistances,
  normalizeRoomCode, scorePin, teamColor, type PinScore
} from '../../data/solarScaleChallenge';
import { calculateHaversineDistance, loadGoogleMapsScript, SUTZ_GOOGLE_MAPS_STYLE } from '../../utils/sutzGeoUtils';
import './SolarScaleChallenge.css';

interface Props {
  initialRoom?: string;
  initialAstro?: string;
}

interface Session {
  code: string;
  team: string;
}

const SESSION_KEY = 'solar_scale_session_v1';
const hostKey = (code: string) => `solar_scale_host_${code}`;
const MAX_PIN_ACCURACY_M = 40;

interface GpsFix { lat: number; lng: number; accuracy: number }

/** Captura la mejor lectura GPS disponible durante unos segundos. */
function captureBestPosition(maxMs = 8000): Promise<GpsFix> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Tu dispositivo no tiene GPS disponible.'));
      return;
    }
    let best: GpsFix | null = null;
    let watchId = -1;
    let timer = 0;
    const finish = () => {
      navigator.geolocation.clearWatch(watchId);
      window.clearTimeout(timer);
      if (best) resolve(best);
      else reject(new Error('No se pudo obtener tu ubicación. Activa el GPS y los permisos.'));
    };
    watchId = navigator.geolocation.watchPosition(
      pos => {
        const fix = { lat: pos.coords.latitude, lng: pos.coords.longitude, accuracy: pos.coords.accuracy };
        if (!best || fix.accuracy < best.accuracy) best = fix;
        if (fix.accuracy <= 8) finish();
      },
      err => {
        navigator.geolocation.clearWatch(watchId);
        window.clearTimeout(timer);
        reject(new Error(err.code === 1 ? 'Permiso de ubicación denegado. Actívalo en el navegador.' : 'No se pudo obtener tu ubicación.'));
      },
      { enableHighAccuracy: true, maximumAge: 0, timeout: 15000 }
    );
    timer = window.setTimeout(finish, maxMs);
  });
}

function readSession(): Session | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? (JSON.parse(raw) as Session) : null;
  } catch { return null; }
}

// ───────────────────────── Mapa ─────────────────────────

function ChallengeMap({ room, pins, showRings, focusTeam }: {
  room: SolarScaleRoom;
  pins: SolarScalePin[];
  showRings: boolean;
  focusTeam?: string;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<any>(null);
  const overlaysRef = useRef<any[]>([]);
  const [ready, setReady] = useState<boolean | null>(null);

  useEffect(() => {
    let alive = true;
    loadGoogleMapsScript().then(ok => {
      if (!alive) return;
      setReady(ok);
      if (ok && containerRef.current && !mapRef.current) {
        const g = (window as any).google;
        mapRef.current = new g.maps.Map(containerRef.current, {
          center: { lat: room.sunLat, lng: room.sunLng },
          zoom: 18,
          styles: SUTZ_GOOGLE_MAPS_STYLE,
          disableDefaultUI: true,
          zoomControl: true,
          gestureHandling: 'greedy'
        });
      }
    });
    return () => { alive = false; };
  }, [room.sunLat, room.sunLng]);

  useEffect(() => {
    const g = (window as any).google;
    const map = mapRef.current;
    if (!ready || !g || !map) return;
    overlaysRef.current.forEach(o => o.setMap(null));
    overlaysRef.current = [];
    const sunPos = { lat: room.sunLat, lng: room.sunLng };

    overlaysRef.current.push(new g.maps.Marker({
      position: sunPos, map, title: 'El Sol',
      label: { text: '☀️', fontSize: '22px' },
      icon: { path: g.maps.SymbolPath.CIRCLE, scale: 0 }
    }));

    const bounds = new g.maps.LatLngBounds();
    bounds.extend(sunPos);

    if (showRings) {
      CHALLENGE_ASTROS.forEach(a => {
        const d = getScaleDistances(a);
        const mk = (radius: number, dashed: boolean) => {
          const c = new g.maps.Circle({
            map, center: sunPos, radius,
            strokeColor: a.color, strokeOpacity: dashed ? 0.45 : 0.95, strokeWeight: dashed ? 1 : 2,
            fillOpacity: 0, clickable: false
          });
          overlaysRef.current.push(c);
          return c;
        };
        mk(d.perihelion, true);
        mk(d.mean, false);
        const aph = mk(d.aphelion, true);
        const label = new g.maps.Marker({
          position: { lat: room.sunLat + d.mean / 111320, lng: room.sunLng },
          map, clickable: false,
          label: { text: `${a.icon} ${a.name}`, color: a.color, fontSize: '11px', fontWeight: '700' },
          icon: { path: g.maps.SymbolPath.CIRCLE, scale: 0 }
        });
        overlaysRef.current.push(label);
        if (a.id === 'neptuno') {
          const b = aph.getBounds();
          if (b) bounds.union(b);
        }
      });
    }

    pins.forEach(p => {
      if (focusTeam && p.team !== focusTeam) return;
      const astro = getChallengeAstro(p.astro);
      const pos = { lat: p.lat, lng: p.lng };
      overlaysRef.current.push(new g.maps.Marker({
        position: pos, map, title: `${p.team} · ${astro?.name ?? p.astro}`,
        label: { text: astro?.icon ?? '●', fontSize: '13px', color: '#0b1020', fontWeight: '800' },
        icon: { path: g.maps.SymbolPath.CIRCLE, scale: 12, fillColor: teamColor(p.team), fillOpacity: 1, strokeColor: '#0b1020', strokeWeight: 2 }
      }));
      bounds.extend(pos);
    });

    if (showRings || pins.length > 0) map.fitBounds(bounds, 40);
    else { map.setCenter(sunPos); map.setZoom(18); }
  }, [ready, room.sunLat, room.sunLng, pins, showRings, focusTeam]);

  if (ready === false) {
    return <div className="ssc-map-fallback">No se pudo cargar Google Maps. Revisa tu conexión.</div>;
  }
  return <div ref={containerRef} className="ssc-map" aria-label="Mapa del reto" />;
}

// ───────────────────────── Componente principal ─────────────────────────

export default function SolarScaleChallenge({ initialRoom, initialAstro }: Props) {
  const { user } = useAuth();
  const { addResources } = useSutzResources();

  const [session, setSession] = useState<Session | null>(() => readSession());
  const [mode, setMode] = useState<'home' | 'host' | 'join'>(() => (initialRoom ? 'join' : 'home'));

  // Formulario
  const [roomInput, setRoomInput] = useState(initialRoom ? normalizeRoomCode(initialRoom) : '');
  const [teamInput, setTeamInput] = useState('');
  const [titleInput, setTitleInput] = useState('');
  const [showRealKm, setShowRealKm] = useState(true);
  const [formError, setFormError] = useState('');
  const [busy, setBusy] = useState(false);

  // Sala activa
  const [room, setRoom] = useState<SolarScaleRoom | null>(null);
  const [roomLoaded, setRoomLoaded] = useState(false);
  const [pins, setPins] = useState<SolarScalePin[]>([]);
  const [selectedAstro, setSelectedAstro] = useState<string>(initialAstro && getChallengeAstro(initialAstro) ? initialAstro : 'tierra');
  const [pinMessage, setPinMessage] = useState<{ kind: 'ok' | 'err' | 'info'; text: string } | null>(null);
  const [locating, setLocating] = useState(false);
  const chipRowRef = useRef<HTMLDivElement | null>(null);

  const isHost = Boolean(session && localStorage.getItem(hostKey(session.code)) === '1');

  // Escuchar sala y pines
  useEffect(() => {
    if (!session) { setRoom(null); setPins([]); setRoomLoaded(false); return; }
    setRoomLoaded(false);
    const unsubRoom = listenToSolarScaleRoom(session.code, r => { setRoom(r); setRoomLoaded(true); });
    const unsubPins = listenToSolarScalePins(session.code, setPins);
    return () => { unsubRoom(); unsubPins(); };
  }, [session]);

  const persistSession = (s: Session | null) => {
    if (s) localStorage.setItem(SESSION_KEY, JSON.stringify(s));
    else localStorage.removeItem(SESSION_KEY);
    setSession(s);
  };

  // Mi equipo
  const myPins = useMemo(
    () => pins.filter(p => session && p.team === session.team),
    [pins, session]
  );
  const visiblePins = useMemo(() => {
    if (!room) return [];
    if (room.revealed) return pins;
    return isHost ? [] : myPins;
  }, [room, pins, myPins, isHost]);

  const scoreFor = useCallback((p: SolarScalePin): PinScore | null => {
    const astro = getChallengeAstro(p.astro);
    if (!room || !astro) return null;
    const dist = calculateHaversineDistance(room.sunLat, room.sunLng, p.lat, p.lng);
    return scorePin(astro, dist, room.sunAccuracy, p.accuracy);
  }, [room]);

  // Premios de precisión al revelar (una sola vez por pin)
  useEffect(() => {
    if (!room?.revealed || !session || isHost || !user) return;
    let totalPct = 0;
    let scored = 0;
    myPins.forEach(p => {
      const sc = scoreFor(p);
      if (!sc) return;
      scored++;
      totalPct += sc.tier === 'oro' ? 100 : sc.tier === 'plata' ? 80 : sc.tier === 'bronce' ? 60 : 30;
      const key = `solar_scale_bonus_${session.code}_${session.team}_${p.astro}_${user.uid}`;
      if (sc.bonusXp > 0 && !localStorage.getItem(key)) {
        localStorage.setItem(key, '1');
        addResources({ puntos: sc.bonusXp, gemas: sc.bonusGems });
      }
    });
    if (scored >= CHALLENGE_ASTROS.length && isAcademiaQrSessionActive()) {
      const key = `solar_scale_report_${session.code}_${session.team}`;
      if (!localStorage.getItem(key)) {
        localStorage.setItem(key, '1');
        reportChallengeCompletion({
          challengeId: 'solar_scale_urban',
          percentage: Math.round(totalPct / scored),
          feedback: `Reto urbano Sistema Solar a escala (grupo ${session.team}).`
        });
      }
    }
  }, [room?.revealed, myPins, session, isHost, user, scoreFor, addResources]);

  // Centrar el chip activo
  useEffect(() => {
    const el = chipRowRef.current?.querySelector('.ssc-chip.active');
    if (el instanceof HTMLElement) el.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
  }, [selectedAstro, room?.code]);

  // ───── Acciones ─────

  const handleCreateRoom = async () => {
    setFormError('');
    const code = normalizeRoomCode(roomInput) || generateRoomCode();
    setBusy(true);
    try {
      const fix = await captureBestPosition(9000);
      await createSolarScaleRoom({
        code,
        title: titleInput.trim() || 'Reto Sistema Solar a Escala',
        sunLat: fix.lat, sunLng: fix.lng, sunAccuracy: Math.round(fix.accuracy),
        showRealKm
      });
      localStorage.setItem(hostKey(code), '1');
      persistSession({ code, team: 'Docente' });
      setMode('home');
    } catch (e) {
      setFormError(e instanceof Error ? e.message : 'No se pudo crear la sala.');
    } finally { setBusy(false); }
  };

  const handleJoin = async () => {
    setFormError('');
    const code = normalizeRoomCode(roomInput);
    const team = teamInput.trim().slice(0, 40);
    if (code.length < 3) { setFormError('Escribe el código de sala que te dio tu docente.'); return; }
    if (!team) { setFormError('Escribe el nombre de tu grupo.'); return; }
    setBusy(true);
    try {
      const found = await getSolarScaleRoom(code);
      if (!found) { setFormError('No encontramos esa sala. Revisa el código.'); return; }
      persistSession({ code, team });
      setMode('home');
    } catch {
      setFormError('No se pudo conectar. Revisa tu internet e inténtalo otra vez.');
    } finally { setBusy(false); }
  };

  const handlePin = async () => {
    if (!room || !session) return;
    const astro = getChallengeAstro(selectedAstro);
    if (!astro) return;
    setLocating(true);
    setPinMessage({ kind: 'info', text: 'Leyendo tu GPS… quédate quieto unos segundos.' });
    try {
      const fix = await captureBestPosition(8000);
      if (fix.accuracy > MAX_PIN_ACCURACY_M) {
        setPinMessage({ kind: 'err', text: `Tu GPS tiene ±${Math.round(fix.accuracy)} m de margen. Busca cielo abierto e inténtalo de nuevo (máximo ±${MAX_PIN_ACCURACY_M} m).` });
        return;
      }
      const alreadyPinned = myPins.some(p => p.astro === astro.id);
      await saveSolarScalePin(session.code, {
        team: session.team, astro: astro.id, lat: fix.lat, lng: fix.lng, accuracy: Math.round(fix.accuracy)
      });
      if (user && !alreadyPinned) {
        const key = `solar_scale_part_${session.code}_${session.team}_${astro.id}_${user.uid}`;
        if (!localStorage.getItem(key)) {
          localStorage.setItem(key, '1');
          addResources({ puntos: PARTICIPATION_REWARD.puntos, monedas: PARTICIPATION_REWARD.monedas });
        }
      }
      setPinMessage({
        kind: 'ok',
        text: `📍 ${astro.name} clavado (±${Math.round(fix.accuracy)} m).${user && !alreadyPinned ? ` +${PARTICIPATION_REWARD.puntos} puntos` : ''} Puedes volver a clavarlo si te moviste.`
      });
    } catch (e) {
      setPinMessage({ kind: 'err', text: e instanceof Error ? e.message : 'No se pudo clavar la ubicación.' });
    } finally { setLocating(false); }
  };

  const leaveRoom = () => persistSession(null);

  const toggleReveal = async () => {
    if (!room) return;
    const next = !room.revealed;
    if (next && !window.confirm('¿Revelar las órbitas reales a todos los grupos? Ya no podrán cambiar sus pines.')) return;
    await setSolarScaleRevealed(room.code, next);
  };

  // ───── Ranking ─────
  const ranking = useMemo(() => {
    if (!room?.revealed) return [];
    const byTeam = new Map<string, { team: string; pins: number; points: number; oro: number; plata: number; bronce: number }>();
    pins.forEach(p => {
      const sc = scoreFor(p);
      if (!sc) return;
      const row = byTeam.get(p.team) ?? { team: p.team, pins: 0, points: 0, oro: 0, plata: 0, bronce: 0 };
      row.pins += 1;
      row.points += PARTICIPATION_REWARD.puntos + sc.bonusXp;
      if (sc.tier === 'oro') row.oro++;
      if (sc.tier === 'plata') row.plata++;
      if (sc.tier === 'bronce') row.bronce++;
      byTeam.set(p.team, row);
    });
    return [...byTeam.values()].sort((a, b) => b.points - a.points);
  }, [room?.revealed, pins, scoreFor]);

  const teamsProgress = useMemo(() => {
    const m = new Map<string, number>();
    pins.forEach(p => m.set(p.team, (m.get(p.team) ?? 0) + 1));
    return [...m.entries()].sort((a, b) => b[1] - a[1]);
  }, [pins]);

  // ───────────────────────── Render ─────────────────────────

  // Pantalla de entrada (sin sala activa)
  if (!session) {
    return (
      <section className="ssc-root">
        <header className="ssc-hero">
          <span className="ssc-kicker">🌍 Laboratorio Colectivo</span>
          <h2>Reto Urbano: el Sistema Solar a Escala</h2>
          <p>
            Con un Sol de <strong>{SUN_CARD_CM} cm</strong>, ¿a qué distancia de tu ciudad quedaría cada planeta?
            Camina, escanea el QR de la tarjeta y clava tu planeta con el GPS. ¡Gana el grupo que mejor acierte!
          </p>
        </header>

        {mode === 'home' && (
          <div className="ssc-choice-grid">
            <button className="ssc-choice" onClick={() => setMode('join')}>
              <span className="ssc-choice-icon">🎒</span>
              <strong>Soy estudiante</strong>
              <span>Unirme con código de sala y nombre de grupo</span>
            </button>
            <button className="ssc-choice" onClick={() => setMode('host')}>
              <span className="ssc-choice-icon">🧑‍🏫</span>
              <strong>Soy docente</strong>
              <span>Crear una sala y clavar el Sol en mi ubicación</span>
            </button>
          </div>
        )}

        {mode === 'join' && (
          <form className="ssc-card ssc-form" onSubmit={e => { e.preventDefault(); handleJoin(); }}>
            <h3>🎒 Unirme a una sala</h3>
            <label htmlFor="ssc-room">Código de sala</label>
            <input id="ssc-room" value={roomInput} onChange={e => setRoomInput(normalizeRoomCode(e.target.value))} placeholder="SOL-4K7Q" autoComplete="off" autoCapitalize="characters" />
            <label htmlFor="ssc-team">Nombre de tu grupo</label>
            <input id="ssc-team" value={teamInput} onChange={e => setTeamInput(e.target.value)} placeholder="Los Cometas" maxLength={40} autoComplete="off" />
            {formError && <p className="ssc-msg err">{formError}</p>}
            <div className="ssc-row">
              <button type="button" className="ssc-btn ghost" onClick={() => { setMode('home'); setFormError(''); }}>Volver</button>
              <button type="submit" className="ssc-btn primary" disabled={busy}>{busy ? 'Entrando…' : 'Entrar al reto'}</button>
            </div>
          </form>
        )}

        {mode === 'host' && (
          <form className="ssc-card ssc-form" onSubmit={e => { e.preventDefault(); handleCreateRoom(); }}>
            <h3>🧑‍🏫 Crear sala del reto</h3>
            <p className="ssc-hint">Párate donde estará el <strong>Sol</strong> (tarjeta de {SUN_CARD_CM} cm). Tu GPS será el punto cero de todos los grupos.</p>
            <label htmlFor="ssc-title">Nombre del reto (opcional)</label>
            <input id="ssc-title" value={titleInput} onChange={e => setTitleInput(e.target.value)} placeholder="5.º B · Reto del Sistema Solar" />
            <label htmlFor="ssc-code">Código de sala (opcional)</label>
            <input id="ssc-code" value={roomInput} onChange={e => setRoomInput(normalizeRoomCode(e.target.value))} placeholder="Se genera automáticamente" autoCapitalize="characters" />
            <label className="ssc-check">
              <input type="checkbox" checked={showRealKm} onChange={e => setShowRealKm(e.target.checked)} />
              <span>Mostrar la distancia real (millones de km) como dato del problema</span>
            </label>
            {formError && <p className="ssc-msg err">{formError}</p>}
            <div className="ssc-row">
              <button type="button" className="ssc-btn ghost" onClick={() => { setMode('home'); setFormError(''); }}>Volver</button>
              <button type="submit" className="ssc-btn primary" disabled={busy}>{busy ? 'Leyendo GPS…' : '☀️ Clavar el Sol aquí y crear sala'}</button>
            </div>
          </form>
        )}
      </section>
    );
  }

  // Sala inexistente / cargando
  if (!roomLoaded) {
    return <section className="ssc-root"><div className="ssc-card"><p>Conectando con la sala {session.code}…</p></div></section>;
  }
  if (!room) {
    return (
      <section className="ssc-root">
        <div className="ssc-card">
          <p className="ssc-msg err">La sala {session.code} ya no existe.</p>
          <button className="ssc-btn primary" onClick={leaveRoom}>Volver</button>
        </div>
      </section>
    );
  }

  const astro = getChallengeAstro(selectedAstro) ?? CHALLENGE_ASTROS[2];
  const myPinForAstro = myPins.find(p => p.astro === astro.id);
  const myScore = myPinForAstro && room.revealed ? scoreFor(myPinForAstro) : null;
  const dist = getScaleDistances(astro);
  const shareLink = `${window.location.origin}/sistema-solar?reto=1&sala=${room.code}`;

  return (
    <section className="ssc-root">
      <header className="ssc-room-bar">
        <div>
          <span className="ssc-kicker">{isHost ? '🧑‍🏫 Panel docente' : `👥 ${session.team}`}</span>
          <h2>{room.title}</h2>
        </div>
        <div className="ssc-room-meta">
          <span className="ssc-code" title="Código de sala">{room.code}</span>
          <button className="ssc-btn ghost small" onClick={leaveRoom}>Salir</button>
        </div>
      </header>

      {room.revealed && <p className="ssc-msg ok">🛰️ ¡Órbitas reveladas! Mira qué tan cerca quedó cada grupo.</p>}

      {isHost && (
        <div className="ssc-card">
          <h3>Control del reto</h3>
          <p className="ssc-hint">
            Comparte el código <strong>{room.code}</strong> o este enlace: <a href={shareLink}>{shareLink}</a>
          </p>
          <p className="ssc-hint">Sol anclado con precisión de ±{room.sunAccuracy} m.</p>
          <button className={`ssc-btn ${room.revealed ? 'ghost' : 'primary'}`} onClick={toggleReveal}>
            {room.revealed ? '🙈 Ocultar órbitas' : '🛰️ Revelar órbitas reales'}
          </button>
          <h4>Progreso de los grupos</h4>
          {teamsProgress.length === 0 ? <p className="ssc-hint">Aún no hay grupos con pines.</p> : (
            <ul className="ssc-progress-list">
              {teamsProgress.map(([team, n]) => (
                <li key={team}>
                  <span className="ssc-dot" style={{ background: teamColor(team) }} />
                  <strong>{team}</strong>
                  <span>{n}/{CHALLENGE_ASTROS.length} planetas</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {!isHost && (
        <>
          <div className="ssc-progress-bar" aria-label="Progreso del grupo">
            <div style={{ width: `${(myPins.length / CHALLENGE_ASTROS.length) * 100}%` }} />
            <span>{myPins.length}/{CHALLENGE_ASTROS.length} planetas clavados</span>
          </div>

          <div className="ssc-chip-row" ref={chipRowRef}>
            {CHALLENGE_ASTROS.map(a => (
              <button key={a.id} className={`ssc-chip ${a.id === selectedAstro ? 'active' : ''} ${myPins.some(p => p.astro === a.id) ? 'done' : ''}`}
                onClick={() => { setSelectedAstro(a.id); setPinMessage(null); }}>
                <span>{a.icon}</span> {a.name} {myPins.some(p => p.astro === a.id) ? '✓' : ''}
              </button>
            ))}
          </div>

          <article className="ssc-card ssc-astro-card" style={{ borderColor: astro.color }}>
            <div className="ssc-astro-head">
              <span className="ssc-astro-icon" style={{ background: astro.color }}>{astro.icon}</span>
              <div>
                <h3>{astro.name}</h3>
                <p className="ssc-hint">En tu tarjeta mide <strong>{getScaleDiameterMm(astro).toFixed(1)} mm</strong> (Sol = {SUN_CARD_CM} cm)</p>
              </div>
            </div>
            {room.showRealKm && (
              <p>Distancia real media al Sol: <strong>{astro.meanMkm.toLocaleString('es-GT')} millones de km</strong></p>
            )}
            <details className="ssc-help">
              <summary>💡 Pista: ¿cómo calculo la escala?</summary>
              <p>Regla de tres: si el Sol real mide 1 392 700 km y en la tarjeta mide {SUN_CARD_CM} cm, entonces
                <code> metros = km reales × 0,26 ÷ 1 392 700</code>.</p>
            </details>

            {!room.revealed && (
              <>
                <p className="ssc-hint">Camina desde el Sol hasta donde creas que está {astro.name} y pulsa el botón.</p>
                <button className="ssc-btn primary big" onClick={handlePin} disabled={locating}>
                  {locating ? 'Leyendo GPS…' : `📍 ${myPinForAstro ? 'Volver a clavar' : 'Clavar'} ${astro.name} aquí`}
                </button>
              </>
            )}
            {pinMessage && <p className={`ssc-msg ${pinMessage.kind}`}>{pinMessage.text}</p>}

            {room.revealed && (
              <div className="ssc-result">
                <p>Distancia real a escala: <strong>{formatMeters(dist.mean)}</strong> (rango {formatMeters(dist.perihelion)} – {formatMeters(dist.aphelion)})</p>
                <p className="ssc-hint">{astro.everyday}</p>
                {myScore ? (
                  <p className={`ssc-msg ${myScore.tier === 'explorador' ? 'info' : 'ok'}`}>
                    {myScore.icon} <strong>{myScore.label}</strong> — tu pin quedó a {formatMeters(myScore.distanceM)} del Sol
                    (error {myScore.errorPct.toFixed(1)} %).{myScore.bonusXp > 0 && user ? ` +${myScore.bonusXp} puntos` : ''}
                  </p>
                ) : <p className="ssc-msg info">Tu grupo no clavó este planeta.</p>}
              </div>
            )}
          </article>
        </>
      )}

      <div className="ssc-card ssc-map-card">
        <h3>{room.revealed ? '🛰️ Órbitas reales y pines de todos' : '🗺️ Tu mapa'}</h3>
        <ChallengeMap room={room} pins={visiblePins} showRings={room.revealed} />
        {!room.revealed && <p className="ssc-hint">Las órbitas se muestran cuando el docente revela el resultado.</p>}
      </div>

      {room.revealed && (
        <div className="ssc-card">
          <h3>🏆 Ranking de grupos</h3>
          {ranking.length === 0 ? <p className="ssc-hint">Sin pines registrados.</p> : (
            <div className="ssc-table-wrap">
              <table className="ssc-table">
                <thead><tr><th>#</th><th>Grupo</th><th>Planetas</th><th>🥇</th><th>🥈</th><th>🥉</th><th>Puntos</th></tr></thead>
                <tbody>
                  {ranking.map((r, i) => (
                    <tr key={r.team} className={session.team === r.team ? 'me' : ''}>
                      <td>{i + 1}</td>
                      <td><span className="ssc-dot" style={{ background: teamColor(r.team) }} /> {r.team}</td>
                      <td>{r.pins}</td><td>{r.oro}</td><td>{r.plata}</td><td>{r.bronce}</td><td><strong>{r.points}</strong></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <details className="ssc-help">
            <summary>¿Cómo se puntúa?</summary>
            <ul>
              <li>Clavar un planeta: +{PARTICIPATION_REWARD.puntos} puntos.</li>
              {(['oro', 'plata', 'bronce'] as const).map(t => (
                <li key={t}>{TIER_REWARDS[t].icon} {TIER_REWARDS[t].label}: +{TIER_REWARDS[t].bonusXp} puntos
                  {t === 'oro' ? ' (dentro del rango perihelio–afelio)' : t === 'plata' ? ' (error ≤ 5 %)' : ' (error ≤ 15 %)'}.</li>
              ))}
              <li>Se perdona un pequeño margen por la imprecisión del GPS (3 a 15 m).</li>
            </ul>
          </details>
        </div>
      )}
    </section>
  );
}
