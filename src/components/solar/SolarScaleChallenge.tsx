import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import L from 'leaflet';
import { useAuth } from '../../context/AuthContext';
import { useSutzResources } from '../../context/SutzResourcesContext';
import { isAcademiaQrSessionActive, reportChallengeCompletion } from '../../services/academiaqrSyncService';
import {
  MAX_CORRECTION_ATTEMPTS,
  createSolarScaleRoom, getSolarScaleRoom, listenToSolarScalePins, listenToSolarScaleRoom,
  lockSolarScalePin, saveSolarScalePin, setSolarScaleRevealed,
  type SolarScalePin, type SolarScaleRoom
} from '../../services/solarScaleService';
import {
  CHALLENGE_ASTROS, PARTICIPATION_REWARD, SUN_CARD_CM, TIER_REWARDS, formatMeters,
  generateRoomCode, getChallengeAstro, getScaleDiameterMm, getScaleDistances,
  normalizeRoomCode, scorePin, teamColor, type PinScore, type SolarScaleQrScanResult
} from '../../data/solarScaleChallenge';
import { calculateHaversineDistance, createSutzTileLayer, type SutzMapLayerMode } from '../../utils/sutzGeoUtils';
import './SolarScaleChallenge.css';

interface Props {
  initialRoom?: string;
  initialAstro?: string;
  externalScan?: (SolarScaleQrScanResult & { nonce: number }) | null;
  onRequestScan?: () => void;
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

// ───────────────────────── Mapa (Leaflet) ─────────────────────────

function ChallengeMap({ room, pins, showRings, focusTeam }: {
  room: SolarScaleRoom;
  pins: SolarScalePin[];
  showRings: boolean;
  focusTeam?: string;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const tileRef = useRef<L.TileLayer | null>(null);
  const overlayGroupRef = useRef<L.LayerGroup | null>(null);
  const [layerMode, setLayerMode] = useState<SutzMapLayerMode>('dark');

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    const map = L.map(containerRef.current, {
      center: [room.sunLat, room.sunLng],
      zoom: 18,
      zoomControl: true,
      attributionControl: true
    });
    const tile = createSutzTileLayer('dark').addTo(map);
    const group = L.layerGroup().addTo(map);
    mapRef.current = map;
    tileRef.current = tile;
    overlayGroupRef.current = group;

    return () => {
      map.remove();
      mapRef.current = null;
      tileRef.current = null;
      overlayGroupRef.current = null;
    };
    // Solo se crea una instancia; los cambios de coordenadas se actualizan abajo
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    if (tileRef.current) map.removeLayer(tileRef.current);
    tileRef.current = createSutzTileLayer(layerMode).addTo(map);
  }, [layerMode]);

  useEffect(() => {
    const map = mapRef.current;
    const group = overlayGroupRef.current;
    if (!map || !group) return;

    group.clearLayers();
    const sunLatLng: L.LatLngExpression = [room.sunLat, room.sunLng];
    const bounds = L.latLngBounds([sunLatLng]);

    L.marker(sunLatLng, {
      title: 'El Sol',
      icon: L.divIcon({
        className: 'ssc-leaflet-sun-icon',
        html: '<span aria-hidden="true">☀️</span>',
        iconSize: [34, 34],
        iconAnchor: [17, 17]
      })
    }).bindTooltip('☀️ El Sol (punto cero)').addTo(group);

    if (showRings) {
      const pinnedAstroIds = new Set(pins.map(p => p.astro));
      const astrosToDraw = CHALLENGE_ASTROS.filter(a => pinnedAstroIds.has(a.id));
      astrosToDraw.forEach(a => {
        const d = getScaleDistances(a);
        L.circle(sunLatLng, {
          radius: d.perihelion, color: a.color, weight: 1, opacity: 0.45, dashArray: '5 5', fillOpacity: 0, interactive: false
        }).addTo(group);
        L.circle(sunLatLng, {
          radius: d.mean, color: a.color, weight: 2, opacity: 0.95, fillOpacity: 0, interactive: false
        }).addTo(group);
        const aph = L.circle(sunLatLng, {
          radius: d.aphelion, color: a.color, weight: 1, opacity: 0.45, dashArray: '5 5', fillOpacity: 0, interactive: false
        }).addTo(group);

        L.marker([room.sunLat + d.mean / 111320, room.sunLng], {
          interactive: false,
          icon: L.divIcon({
            className: 'ssc-leaflet-orbit-label',
            html: `<span style="color:${a.color}">Órbita ${a.name} (${formatMeters(d.mean)})</span>`,
            iconSize: [150, 20],
            iconAnchor: [75, 10]
          })
        }).addTo(group);

        bounds.extend(aph.getBounds());
      });
    }

    pins.forEach(p => {
      if (focusTeam && p.team !== focusTeam) return;
      const astro = getChallengeAstro(p.astro);
      const pos: L.LatLngExpression = [p.lat, p.lng];
      const bg = teamColor(p.team);
      const used = p.correctionsUsed ?? 0;
      const isPinLocked = Boolean(p.locked) || used >= MAX_CORRECTION_ATTEMPTS;
      L.marker(pos, {
        title: `${p.team} · ${astro?.name ?? p.astro}`,
        icon: L.divIcon({
          className: 'ssc-leaflet-pin-icon',
          html: `<span style="background:${bg}">${astro?.icon ?? '●'}</span>`,
          iconSize: [28, 28],
          iconAnchor: [14, 14]
        })
      })
        .bindTooltip(`${p.team} · ${astro?.name ?? p.astro} (±${p.accuracy} m · ${isPinLocked ? '🔒 Fijado' : `${MAX_CORRECTION_ATTEMPTS - used} int. disp.`})`)
        .addTo(group);
      bounds.extend(pos);
    });

    if (pins.length > 0) {
      map.fitBounds(bounds, { padding: [36, 36], maxZoom: 19 });
    } else {
      map.setView(sunLatLng, 18);
    }
  }, [room.sunLat, room.sunLng, pins, showRings, focusTeam]);

  return (
    <div className="ssc-map-wrap">
      <div className="ssc-map-layer-toggle" role="group" aria-label="Tipo de mapa">
        <button
          type="button"
          className={`ssc-layer-btn ${layerMode === 'dark' ? 'active' : ''}`}
          onClick={() => setLayerMode('dark')}
        >
          🗺️ Calles
        </button>
        <button
          type="button"
          className={`ssc-layer-btn ${layerMode === 'satellite' ? 'active' : ''}`}
          onClick={() => setLayerMode('satellite')}
        >
          🛰️ Satélite
        </button>
      </div>
      <div
        ref={containerRef}
        className={`ssc-map ${layerMode === 'dark' ? 'sutz-tiles-dark' : ''}`}
        aria-label="Mapa del reto"
      />
    </div>
  );
}

// ───────────────────────── Componente principal ─────────────────────────

export default function SolarScaleChallenge({ initialRoom, initialAstro, externalScan, onRequestScan }: Props) {
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
  const [selectedAstro, setSelectedAstro] = useState<string>(initialAstro && getChallengeAstro(initialAstro) ? initialAstro : '');
  const [pendingScanAstro, setPendingScanAstro] = useState<string>(initialAstro && getChallengeAstro(initialAstro) ? initialAstro : '');
  const [pinMessage, setPinMessage] = useState<{ kind: 'ok' | 'err' | 'info'; text: string } | null>(null);
  const [locating, setLocating] = useState(false);
  const [lockingAstro, setLockingAstro] = useState<string | null>(null);
  const [showCorrectionsMenu, setShowCorrectionsMenu] = useState(false);
  const lastHandledNonceRef = useRef<number | null>(null);

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
          feedback: `Reto de Escala · Sistema Solar (grupo ${session.team}).`
        });
      }
    }
  }, [room?.revealed, myPins, session, isHost, user, scoreFor, addResources]);

  const handlePinAstro = useCallback(async (astroId: string, options?: { isCorrection?: boolean }) => {
    if (!room || !session) return;
    if (room.revealed) {
      setPinMessage({ kind: 'info', text: '🛰️ El docente ya reveló las órbitas. Los pines quedaron cerrados.' });
      return;
    }
    const astro = getChallengeAstro(astroId);
    if (!astro) return;

    const existing = myPins.find(p => p.astro === astro.id);
    const used = existing?.correctionsUsed ?? 0;
    const isLocked = Boolean(existing?.locked) || used >= MAX_CORRECTION_ATTEMPTS;

    if (isLocked) {
      setSelectedAstro(astro.id);
      setPinMessage({
        kind: 'info',
        text: `🔒 ${astro.icon} ${astro.name} ya tiene su resultado fijado (${used}/${MAX_CORRECTION_ATTEMPTS} intentos de corrección usados).`
      });
      return;
    }

    if (existing && !options?.isCorrection) {
      setSelectedAstro(astro.id);
      setShowCorrectionsMenu(true);
      const remaining = MAX_CORRECTION_ATTEMPTS - used;
      setPinMessage({
        kind: 'info',
        text: `📍 ${astro.icon} ${astro.name} ya fue clavado. Si quieres ajustar su ubicación, usa el Menú de Correcciones (te quedan ${remaining} ${remaining === 1 ? 'intento' : 'intentos'}).`
      });
      return;
    }

    setSelectedAstro(astro.id);
    setLocating(true);
    setPinMessage({
      kind: 'info',
      text: `📡 Escaneo confirmado de ${astro.icon} ${astro.name}. Leyendo tu GPS actual… quédate quieto unos segundos.`
    });

    try {
      const fix = await captureBestPosition(8000);
      if (fix.accuracy > MAX_PIN_ACCURACY_M) {
        setPinMessage({
          kind: 'err',
          text: `Tu GPS tiene ±${Math.round(fix.accuracy)} m de margen. Busca cielo abierto e inténtalo de nuevo (máximo ±${MAX_PIN_ACCURACY_M} m).`
        });
        return;
      }

      const result = await saveSolarScalePin(session.code, {
        team: session.team,
        astro: astro.id,
        lat: fix.lat,
        lng: fix.lng,
        accuracy: Math.round(fix.accuracy)
      });

      if (user && result.isInitial) {
        const key = `solar_scale_part_${session.code}_${session.team}_${astro.id}_${user.uid}`;
        if (!localStorage.getItem(key)) {
          localStorage.setItem(key, '1');
          addResources({ puntos: PARTICIPATION_REWARD.puntos, monedas: PARTICIPATION_REWARD.monedas });
        }
      }

      if (result.isInitial) {
        setPinMessage({
          kind: 'ok',
          text: `📍 ¡${astro.icon} ${astro.name} clavado en tu posición actual (±${Math.round(fix.accuracy)} m)!${user ? ` +${PARTICIPATION_REWARD.puntos} puntos.` : ''} Tienes ${MAX_CORRECTION_ATTEMPTS} intentos en el Menú de Correcciones si necesitas ajustarlo.`
        });
      } else if (result.locked) {
        setPinMessage({
          kind: 'ok',
          text: `🔒 Corrección #${result.correctionsUsed}/3 aplicada para ${astro.icon} ${astro.name} (±${Math.round(fix.accuracy)} m). Tu resultado quedó fijado definitivamente.`
        });
      } else {
        setPinMessage({
          kind: 'ok',
          text: `🛠️ Corrección #${result.correctionsUsed}/3 aplicada para ${astro.icon} ${astro.name} (±${Math.round(fix.accuracy)} m). Te quedan ${result.remainingAttempts} ${result.remainingAttempts === 1 ? 'intento' : 'intentos'}.`
        });
      }
    } catch (e) {
      setPinMessage({ kind: 'err', text: e instanceof Error ? e.message : 'No se pudo clavar la ubicación.' });
    } finally {
      setLocating(false);
    }
  }, [room, session, myPins, user, addResources]);

  const handleLockAstro = async (astroId: string) => {
    if (!room || !session || room.revealed) return;
    const astro = getChallengeAstro(astroId);
    if (!astro) return;
    setLockingAstro(astroId);
    try {
      await lockSolarScalePin(session.code, session.team, astroId);
      setPinMessage({
        kind: 'ok',
        text: `🔒 ${astro.icon} ${astro.name} quedó fijado definitivamente en el mapa.`
      });
    } catch {
      setPinMessage({ kind: 'err', text: 'No se pudo fijar la posición. Revisa tu conexión.' });
    } finally {
      setLockingAstro(null);
    }
  };

  // Aplicar escaneo externo de tarjeta QR: al entrar en la sala, pincha SOLO el planeta escaneado en la posición GPS actual
  useEffect(() => {
    if (!externalScan) return;
    if (externalScan.sala && !session) {
      setRoomInput(normalizeRoomCode(externalScan.sala));
    }
    if (externalScan.astro) {
      const target = getChallengeAstro(externalScan.astro);
      if (target) {
        setSelectedAstro(target.id);
        setPendingScanAstro(target.id);
        if (!session && mode !== 'host') {
          setMode('join');
          setPinMessage({
            kind: 'info',
            text: `📷 Tarjeta detectada: ${target.icon} ${target.name}. Ingresa a la sala con tu grupo para clavar su ubicación aquí.`
          });
        }
      }
    } else if (externalScan.isSun) {
      setPinMessage({
        kind: 'info',
        text: `☀️ Tarjeta de El Sol escaneada (${SUN_CARD_CM} cm, punto cero). Camina desde aquí y escanea un planeta.`
      });
      if (!session && externalScan.sala && mode !== 'host') setMode('join');
    } else if (externalScan.sala && !session && mode !== 'host') {
      setMode('join');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [externalScan?.nonce]);

  // Ejecutar automáticamente el pinchado GPS de la tarjeta escaneada en cuanto la sala esté lista
  useEffect(() => {
    if (!room || !session || isHost || locating) return;
    const astroToPin = pendingScanAstro;
    if (!astroToPin) return;
    const currentNonce = externalScan?.nonce ?? 0;
    if (currentNonce > 0 && lastHandledNonceRef.current === currentNonce && !pendingScanAstro) return;
    lastHandledNonceRef.current = currentNonce;
    setPendingScanAstro('');
    void handlePinAstro(astroToPin);
  }, [room, session, isHost, locating, pendingScanAstro, externalScan?.nonce, handlePinAstro]);

  // ───── Acciones ─────

  const handleCreateRoom = async () => {
    setFormError('');
    const code = normalizeRoomCode(roomInput) || generateRoomCode();
    setBusy(true);
    try {
      const fix = await captureBestPosition(9000);
      await createSolarScaleRoom({
        code,
        title: titleInput.trim() || 'Reto de Escala',
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
          <h2>Reto de Escala</h2>
          <p>
            Con un Sol de <strong>{SUN_CARD_CM} cm</strong>, ¿a qué distancia real quedaría cada planeta?
            Camina, escanea el QR de la tarjeta y clava tu planeta con el GPS. ¡Gana el grupo que mejor acierte!
          </p>
        </header>
        {pinMessage && <p className={`ssc-msg ${pinMessage.kind}`}>{pinMessage.text}</p>}

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

  const activeAstroId = selectedAstro || myPins[myPins.length - 1]?.astro || '';
  const astro = activeAstroId ? getChallengeAstro(activeAstroId) ?? null : null;
  const myPinForAstro = astro ? myPins.find(p => p.astro === astro.id) : undefined;
  const myScore = myPinForAstro && room.revealed ? scoreFor(myPinForAstro) : null;
  const dist = astro ? getScaleDistances(astro) : null;
  const astroCorrectionsUsed = myPinForAstro?.correctionsUsed ?? 0;
  const astroRemaining = Math.max(0, MAX_CORRECTION_ATTEMPTS - astroCorrectionsUsed);
  const astroLocked = Boolean(myPinForAstro?.locked) || astroRemaining <= 0;
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
      {isHost && pinMessage && <p className={`ssc-msg ${pinMessage.kind}`}>{pinMessage.text}</p>}

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

          {!room.revealed && (
            <div className="ssc-scan-cta-bar">
              {onRequestScan && (
                <button
                  type="button"
                  className="ssc-btn primary big"
                  onClick={onRequestScan}
                  disabled={locating}
                >
                  {locating ? '📡 Leyendo GPS…' : '📷 Escanear tarjeta de planeta aquí'}
                </button>
              )}
              {myPins.length > 0 && (
                <button
                  type="button"
                  className={`ssc-btn ghost ${showCorrectionsMenu ? 'active' : ''}`}
                  onClick={() => setShowCorrectionsMenu(v => !v)}
                >
                  🛠️ Menú de Correcciones ({myPins.length})
                </button>
              )}
            </div>
          )}

          {pinMessage && <p className={`ssc-msg ${pinMessage.kind}`}>{pinMessage.text}</p>}

          {!room.revealed && showCorrectionsMenu && myPins.length > 0 && (
            <section className="ssc-card ssc-corrections-card" aria-label="Menú de Correcciones">
              <div className="ssc-corrections-head">
                <h3>🛠️ Menú de Correcciones</h3>
                <span className="ssc-badge-limit">Máx. {MAX_CORRECTION_ATTEMPTS} intentos</span>
              </div>
              <p className="ssc-hint">
                Cada planeta escaneado tiene hasta <strong>{MAX_CORRECTION_ATTEMPTS} intentos</strong> de corrección GPS. Al llegar a 3 o al pulsar Fijar, el resultado queda definitivo.
              </p>
              <ul className="ssc-correction-list">
                {myPins.map(p => {
                  const pAstro = getChallengeAstro(p.astro);
                  if (!pAstro) return null;
                  const used = p.correctionsUsed ?? 0;
                  const remaining = Math.max(0, MAX_CORRECTION_ATTEMPTS - used);
                  const isPinLocked = Boolean(p.locked) || remaining <= 0;
                  return (
                    <li key={p.id} className={`ssc-correction-item ${isPinLocked ? 'locked' : ''}`}>
                      <div className="ssc-correction-info">
                        <span className="ssc-correction-icon" style={{ background: pAstro.color }}>{pAstro.icon}</span>
                        <div>
                          <strong>{pAstro.name}</strong>
                          <span className="ssc-correction-meta">
                            ±{p.accuracy} m · {isPinLocked ? `🔒 Resultado fijado (${used}/${MAX_CORRECTION_ATTEMPTS})` : `Intentos restantes: ${remaining}/${MAX_CORRECTION_ATTEMPTS}`}
                          </span>
                        </div>
                      </div>
                      {!isPinLocked ? (
                        <div className="ssc-correction-actions">
                          <button
                            type="button"
                            className="ssc-btn primary small"
                            disabled={locating}
                            onClick={() => void handlePinAstro(pAstro.id, { isCorrection: true })}
                          >
                            {locating && selectedAstro === pAstro.id ? 'Leyendo…' : `📍 Corregir aquí (${remaining})`}
                          </button>
                          <button
                            type="button"
                            className="ssc-btn ghost small"
                            disabled={locating || lockingAstro === pAstro.id}
                            onClick={() => void handleLockAstro(pAstro.id)}
                          >
                            {lockingAstro === pAstro.id ? 'Fijando…' : '🔒 Fijar'}
                          </button>
                        </div>
                      ) : (
                        <span className="ssc-locked-pill">🔒 Fijado</span>
                      )}
                    </li>
                  );
                })}
              </ul>
            </section>
          )}

          {astro ? (
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

              {!room.revealed && myPinForAstro && (
                <div className="ssc-pin-status">
                  <span>
                    {astroLocked
                      ? `🔒 Resultado fijado (${astroCorrectionsUsed}/${MAX_CORRECTION_ATTEMPTS} correcciones usadas)`
                      : `📍 Clavado (±${myPinForAstro.accuracy} m) · Quedan ${astroRemaining}/${MAX_CORRECTION_ATTEMPTS} intentos de corrección`}
                  </span>
                </div>
              )}

              {room.revealed && dist && (
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
          ) : (
            <div className="ssc-card ssc-empty-scan">
              <h3>📷 Listo para explorar</h3>
              <p className="ssc-hint">
                Camina desde la tarjeta de <strong>El Sol ({SUN_CARD_CM} cm)</strong> hasta donde calcules que está un planeta.
                Al llegar, pulsa <strong>«Escanear tarjeta»</strong> y se clavará únicamente ese planeta en tu ubicación GPS actual.
              </p>
            </div>
          )}
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
