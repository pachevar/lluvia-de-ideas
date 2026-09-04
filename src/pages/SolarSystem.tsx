import { useState, useEffect, useRef } from 'react';
import { soundEffects } from '../utils/soundEffects';
import './SolarSystem.css';

// Interfaces de Datos Astronómicos Avanzados
interface Moon {
  name: string;
  desc: string;
}

interface AtmosphereGas {
  gas: string;
  percent: number;
  color: string;
}

interface CelestialBody {
  id: string;
  name: string;
  type: 'sol' | 'planeta_rocoso' | 'planeta_gaseoso' | 'cinturon' | 'sonda';
  diameter: string;
  diameterKm: number;
  distanceFromSun: string;
  distanceAU: number;
  eccentricity: number; // Excentricidad real de Kepler
  perihelionAU: number;
  aphelionAU: number;
  axialTilt: string;
  orbitalPeriod: string;
  funFact: string;
  description: string;
  moons: Moon[];
  ringDetails?: string;
  voyagerMission?: string;
  atmosphere?: AtmosphereGas[];
  magnetosphere?: {
    hasField: boolean;
    description: string;
  };
  jwstInsights?: string;
}

// Interfaces y Constantes de Espectroscopía Científica
interface SpectroInstrument {
  id: string;
  name: string;
  agency: string;
  mission: string;
  range: string;
  rangeNm: string;
  type: string;
  keyTarget: string;
  discovery: string;
  description: string;
  icon: string;
}

const SPECTRO_INSTRUMENTS: SpectroInstrument[] = [
  {
    id: 'jwst_nirspec',
    name: 'NIRSpec (Near-Infrared Spectrograph)',
    agency: 'NASA / ESA / CSA',
    mission: 'Telescopio Espacial James Webb (JWST)',
    range: '0.6 a 5.3 µm (600 a 5,300 nm)',
    rangeNm: 'Infrarrojo Cercano (NIR)',
    type: 'Espectrógrafo multiobjeto con matriz de 250,000 micro-obturadores criogénicos',
    keyTarget: 'Exoplanetas habitables, atmósferas de lunas heladas y galaxias primordiales',
    discovery: 'Detección inequívoca de dióxido de carbono (CO₂), vapor de agua y dióxido de azufre fotoquímico en exoplanetas, así como perfiles de metano en Titán.',
    description: 'Capaz de captar simultáneamente hasta 100 espectros astronómicos con una sensibilidad cuántica sin precedentes, atravesando densos velos de polvo estelar.',
    icon: '🔭'
  },
  {
    id: 'hst_stis',
    name: 'STIS (Space Telescope Imaging Spectrograph)',
    agency: 'NASA / ESA',
    mission: 'Telescopio Espacial Hubble (HST)',
    range: '115 a 1,000 nm',
    rangeNm: 'Ultravioleta, Luz Visible e Infrarrojo Cercano',
    type: 'Espectrógrafo de campo amplio y rendija de alta resolución espacial',
    keyTarget: 'Atmósferas del Sistema Solar, vientos estelares y discos protoplanetarios',
    discovery: 'Primera detección histórica de la atmósfera de un exoplaneta (sodio en HD 209458b) y cartografía de las impresionantes auroras UV de Júpiter y Saturno.',
    description: 'Instrumento versátil que descompone fotones desde el ultravioleta del vacío hasta el borde infrarrojo mediante redes de difracción holográficas.',
    icon: '🛰️'
  },
  {
    id: 'mro_crism',
    name: 'CRISM (Compact Reconnaissance Imaging Spectrometer)',
    agency: 'NASA / JPL / JHUAPL',
    mission: 'Mars Reconnaissance Orbiter (MRO)',
    range: '362 a 3,920 nm (544 canales)',
    rangeNm: 'Visible e Infrarrojo Corto (VNIR)',
    type: 'Espectrómetro hiperespectral de barrido orbital en Marte',
    keyTarget: 'Mineralogía superficial y delgada atmósfera marciana',
    discovery: 'Descubrió depósitos masivos de arcillas (filosilicatos) y carbonatos que probaron que Marte albergó lagos y ríos de agua líquida no ácida en su pasado.',
    description: 'Analiza píxel a píxel las firmas de absorción del ion hidroxilo (OH) y del CO₂ para guiar el descenso de los rovers Curiosity y Perseverance.',
    icon: '🔴'
  },
  {
    id: 'cassini_vims',
    name: 'VIMS (Visual and Infrared Mapping Spectrometer)',
    agency: 'NASA / ESA / ASI',
    mission: 'Misión Cassini-Huygens (Saturno)',
    range: '350 a 5,100 nm (352 canales)',
    rangeNm: 'Espectro Visible e Infrarrojo Térmico',
    type: 'Mapeador espectral de reflectancia para mundos helados',
    keyTarget: 'Saturno, sus anillos de hielo y las lunas Titán y Encélado',
    discovery: 'Penetró la densa y anaranjada niebla de Titán descubriendo mares de metano y etano líquido, y confirmó compuestos orgánicos en los géiseres de Encélado.',
    description: 'Aprovechó las ventanas de transparencia espectral del metano para ver a través de la atmósfera más densa de luna alguna del Sistema Solar.',
    icon: '🪐'
  },
  {
    id: 'vlt_espresso',
    name: 'ESPRESSO (Echelle SPectrograph for Rocky Exoplanets)',
    agency: 'ESO (Observatorio Europeo Austral)',
    mission: 'VLT (Very Large Telescope, Cerro Paranal - Chile)',
    range: '380 a 788 nm',
    rangeNm: 'Óptico Visible de Ultra-Alta Resolución',
    type: 'Espectrógrafo Échelle criogénico ultra-estabilizado en vacío',
    keyTarget: 'Espectroscopía de transmisión de atmósferas y búsqueda de biofirmas',
    discovery: 'Precisión de velocidad radial de 10 cm/s; descubrió lluvia de hierro líquido en el exoplaneta WASP-76b y mide composiciones atómicas con fidelidad récord.',
    description: 'Alimentado por los cuatro telescopios gigantes de 8.2 metros del VLT chileno, analiza la sutil disminución de luz durante tránsitos planetarios.',
    icon: '🏔️'
  },
  {
    id: 'venus_spicav',
    name: 'SPICAV / SOIR',
    agency: 'ESA (Agencia Espacial Europea)',
    mission: 'Venus Express',
    range: '118 a 320 nm (UV) y 700 a 4,300 nm (IR)',
    rangeNm: 'Ultravioleta e Infrarrojo de Ocultación Solar',
    type: 'Espectrómetro AOTF acusto-óptico de ocultación estelar',
    keyTarget: 'Atmósfera supercrítica y nubes corrosivas de Venus',
    discovery: 'Registró fluctuaciones drásticas de dióxido de azufre (SO₂) que sugieren vulcanismo activo reciente y caracterizó la capa fría de ozono en Venus.',
    description: 'Mide la atenuación de los rayos solares conforme atraviesan distintas altitudes de las nubes de ácido sulfúrico venusianas al ocultarse tras el planeta.',
    icon: '🌋'
  }
];

interface AbsorptionBand {
  wavelengthNm: number;
  gas: string;
  formula: string;
  transition: string;
  significance: string;
  bodies: string[];
  tolerance: number;
  isBioSignature?: boolean;
}

const ABSORPTION_BANDS: AbsorptionBand[] = [
  {
    wavelengthNm: 434,
    gas: 'Hidrógeno Atómico (H-γ)',
    formula: 'H',
    transition: 'Transición cuántica de Balmer n=5 → n=2',
    significance: 'Línea característica en coronas estelares y capas altas de planetas gigantes gaseosos.',
    bodies: ['jupiter', 'urano', 'saturno', 'neptuno', 'sol'],
    tolerance: 15
  },
  {
    wavelengthNm: 486,
    gas: 'Hidrógeno Atómico (H-β)',
    formula: 'H',
    transition: 'Transición de Balmer n=4 → n=2',
    significance: 'Referencia espectral estándar para determinar temperatura y gravedad atmosférica superficial.',
    bodies: ['jupiter', 'urano', 'saturno', 'neptuno', 'sol'],
    tolerance: 15
  },
  {
    wavelengthNm: 589,
    gas: 'Sodio Neutro (Doblete D Fraunhofer)',
    formula: 'Na',
    transition: 'Transición electrónica de valencia 3p → 3s',
    significance: 'Líneas brillantes observadas en la tenue exósfera de Mercurio, colas cometarias y la luna volcánica Ío.',
    bodies: ['mercurio', 'sol'],
    tolerance: 15
  },
  {
    wavelengthNm: 600,
    gas: 'Ozono (Banda de Chappuis)',
    formula: 'O₃',
    transition: 'Fotodisociación molecular de baja energía en luz visible',
    significance: 'Capa protectora contra radiación UV. En astrobiología es un indicador secundario de fotosíntesis y vida.',
    bodies: ['tierra', 'venus'],
    tolerance: 25,
    isBioSignature: true
  },
  {
    wavelengthNm: 656,
    gas: 'Hidrógeno Alfa (H-α)',
    formula: 'H',
    transition: 'Transición de Balmer n=3 → n=2',
    significance: 'La huella atómica más abundante del cosmos. Da el característico color rojo a las prominencias solares y auroras.',
    bodies: ['jupiter', 'urano', 'saturno', 'neptuno', 'sol'],
    tolerance: 15
  },
  {
    wavelengthNm: 687,
    gas: 'Oxígeno Molecular (Banda B de Fraunhofer)',
    formula: 'O₂',
    transition: 'Transición electrónica spin-prohibida',
    significance: 'Absorción creada por el abundante oxígeno gaseoso liberado por plantas y fitoplancton marino en la Tierra.',
    bodies: ['tierra'],
    tolerance: 16,
    isBioSignature: true
  },
  {
    wavelengthNm: 720,
    gas: 'Vapor de Agua (H₂O)',
    formula: 'H₂O',
    transition: 'Sobretono vibracional de estiramiento simétrico',
    significance: 'Indicador directo de ciclo hídrico activo y formación nubosa en planetas rocosos.',
    bodies: ['tierra', 'marte'],
    tolerance: 18,
    isBioSignature: true
  },
  {
    wavelengthNm: 760,
    gas: 'Oxígeno Molecular (Banda A de Fraunhofer)',
    formula: 'O₂',
    transition: 'Transición rotacional-vibracional b¹Σg⁺ ← X³Σg⁻',
    significance: '¡La biofirma espectral más nítida de la Tierra! Una absorción intensa que delata fotosíntesis global.',
    bodies: ['tierra'],
    tolerance: 20,
    isBioSignature: true
  },
  {
    wavelengthNm: 889,
    gas: 'Metano (CH₄)',
    formula: 'CH₄',
    transition: 'Banda vibracional de combinación fundamental ν₁ + ν₄',
    significance: 'Absorbe intensamente el espectro rojo/NIR; le otorga a Urano y Neptuno su tono azul y marca el ciclo de Titán.',
    bodies: ['urano', 'neptuno', 'jupiter', 'saturno'],
    tolerance: 25,
    isBioSignature: true
  },
  {
    wavelengthNm: 940,
    gas: 'Vapor de Agua (Banda mayor de vapor)',
    formula: 'H₂O',
    transition: 'Flexión y estiramiento asimétrico (ν₁ + ν₃)',
    significance: 'Una de las huellas más profundas del infrarrojo cercano; su búsqueda es el objetivo número uno de JWST.',
    bodies: ['tierra', 'marte'],
    tolerance: 24,
    isBioSignature: true
  },
  {
    wavelengthNm: 1050,
    gas: 'Dióxido de Carbono (CO₂)',
    formula: 'CO₂',
    transition: 'Combinación armónica infrarroja (ν₁ + 3ν₂)',
    significance: 'Gas de efecto invernadero primordial; explica el calor sofocante de Venus y la delgada atmósfera de Marte.',
    bodies: ['venus', 'marte', 'tierra'],
    tolerance: 30
  }
];

const SPECTRO_PRESETS = [
  { nm: 434, label: '434 nm', tag: 'H-γ', color: '#6366f1' },
  { nm: 589, label: '589 nm', tag: 'Na (Sodio)', color: '#eab308' },
  { nm: 600, label: '600 nm', tag: 'O₃ (Ozono)', color: '#f97316' },
  { nm: 656, label: '656 nm', tag: 'H-α (Balmer)', color: '#ef4444' },
  { nm: 760, label: '760 nm', tag: 'O₂ (Biofirma)', color: '#a855f7' },
  { nm: 889, label: '889 nm', tag: 'CH₄ (Metano)', color: '#06b6d4' },
  { nm: 940, label: '940 nm', tag: 'H₂O (Vapor)', color: '#38bdf8' },
  { nm: 1050, label: '1050 nm', tag: 'CO₂ (Venus/Marte)', color: '#ec4899' },
];

function wavelengthToColor(wavelength: number): { hex: string; name: string; isVisible: boolean } {
  if (wavelength < 380) return { hex: '#7c3aed', name: 'Ultravioleta Cercano (UV)', isVisible: false };
  if (wavelength > 750) return { hex: '#be123c', name: 'Infrarrojo Cercano (NIR)', isVisible: false };

  let r = 0, g = 0, b = 0;
  if (wavelength >= 380 && wavelength < 440) {
    r = -(wavelength - 440) / (440 - 380);
    g = 0;
    b = 1;
  } else if (wavelength >= 440 && wavelength < 490) {
    r = 0;
    g = (wavelength - 440) / (490 - 440);
    b = 1;
  } else if (wavelength >= 490 && wavelength < 510) {
    r = 0;
    g = 1;
    b = -(wavelength - 510) / (510 - 490);
  } else if (wavelength >= 510 && wavelength < 580) {
    r = (wavelength - 510) / (580 - 510);
    g = 1;
    b = 0;
  } else if (wavelength >= 580 && wavelength < 645) {
    r = 1;
    g = -(wavelength - 645) / (645 - 580);
    b = 0;
  } else if (wavelength >= 645 && wavelength <= 750) {
    r = 1;
    g = 0;
    b = 0;
  }

  let factor = 1.0;
  if (wavelength >= 380 && wavelength < 420) {
    factor = 0.3 + 0.7 * (wavelength - 380) / (420 - 380);
  } else if (wavelength >= 700 && wavelength <= 750) {
    factor = 0.3 + 0.7 * (750 - wavelength) / (750 - 700);
  }

  const red = Math.round(r * factor * 255);
  const green = Math.round(g * factor * 255);
  const blue = Math.round(b * factor * 255);
  const hex = `#${((1 << 24) + (red << 16) + (green << 8) + blue).toString(16).slice(1)}`;

  let name = 'Luz Visible';
  if (wavelength < 440) name = 'Violeta';
  else if (wavelength < 490) name = 'Azul';
  else if (wavelength < 510) name = 'Cian';
  else if (wavelength < 570) name = 'Verde';
  else if (wavelength < 590) name = 'Amarillo';
  else if (wavelength < 625) name = 'Naranja';
  else name = 'Rojo';

  return { hex, name, isVisible: true };
}

function calculatePhotonPhysics(wavelengthNm: number) {
  const freqTHz = (299792.458 / wavelengthNm).toFixed(1);
  const energyEV = (1239.84193 / wavelengthNm).toFixed(2);
  return { freqTHz, energyEV };
}

const CELESTIAL_DATA: Record<string, CelestialBody> = {
  sol: {
    id: 'sol',
    name: 'El Sol',
    type: 'sol',
    diameter: '1,392,700 km (109 veces la Tierra)',
    diameterKm: 1392700,
    distanceFromSun: '0 millones de km (Centro)',
    distanceAU: 0,
    eccentricity: 0,
    perihelionAU: 0,
    aphelionAU: 0,
    axialTilt: '7.25°',
    orbitalPeriod: 'No aplica',
    funFact: '¡El Sol representa el 99.86% de toda la masa del Sistema Solar y su núcleo alcanza los 15 millones de °C por fusión de hidrógeno!',
    description: 'Nuestra estrella de tipo espectral G2V. Una esfera gigante de plasma ionizado impulsada por reacciones termonucleares de fusión que genera fotones, magnetosferas solares y el viento solar interestelar.',
    moons: [],
    atmosphere: [
      { gas: 'Hidrógeno (H₂)', percent: 73.4, color: '#f59e0b' },
      { gas: 'Helio (He)', percent: 24.9, color: '#ef4444' },
      { gas: 'Oxígeno/Carbono', percent: 1.7, color: '#3b82f6' }
    ],
    magnetosphere: {
      hasField: true,
      description: 'El campo magnético heliosférico generado por la dinamo solar abarca más allá del Cinturón de Kuiper creando la heliopausa.'
    }
  },
  mercurio: {
    id: 'mercurio',
    name: 'Mercurio',
    type: 'planeta_rocoso',
    diameter: '4,879 km',
    diameterKm: 4879,
    distanceFromSun: '57.9 millones de km',
    distanceAU: 0.39,
    eccentricity: 0.2056, // Alta excentricidad
    perihelionAU: 0.307,
    aphelionAU: 0.467,
    axialTilt: '0.03°',
    orbitalPeriod: '88 días terrestres',
    funFact: '¡La precesión del perihelio de Mercurio (43 segundos de arco por siglo) fue la prueba decisiva que confirmó la Teoría de la Relatividad General de Einstein!',
    description: 'El planeta más cercano al Sol. Posee la órbita más elíptica y excéntrica de los 8 planetas. Sin atmósfera densa, su temperatura oscila drásticamente entre 430°C de día y -180°C de noche.',
    moons: [],
    atmosphere: [
      { gas: 'Trazas Oxígeno (O₂)', percent: 42.0, color: '#60a5fa' },
      { gas: 'Sodio (Na)', percent: 29.0, color: '#f59e0b' },
      { gas: 'Hidrógeno (H₂)', percent: 22.0, color: '#a855f7' }
    ],
    magnetosphere: {
      hasField: true,
      description: 'Posee un campo magnético global modesto (1% del de la Tierra) capaz de atrapar el viento solar.'
    }
  },
  venus: {
    id: 'venus',
    name: 'Venus',
    type: 'planeta_rocoso',
    diameter: '12,104 km',
    diameterKm: 12104,
    distanceFromSun: '108.2 millones de km',
    distanceAU: 0.72,
    eccentricity: 0.0067, // Casi circular
    perihelionAU: 0.718,
    aphelionAU: 0.728,
    axialTilt: '177.3° (Rotación Retrógrada)',
    orbitalPeriod: '225 días terrestres',
    funFact: '¡Gira al revés (rotación retrógrada) y un día en Venus dura más que un año venusiano (243 días terrestres)!',
    description: 'El gemelo infernal de la Tierra. Su atmósfera hiperdensa de dióxido de carbono provoca un efecto invernadero descontrolado con presiones de 92 atmósferas y temperaturas de 465°C.',
    moons: [],
    atmosphere: [
      { gas: 'Dióxido de Carbono (CO₂)', percent: 96.5, color: '#ef4444' },
      { gas: 'Nitrógeno (N₂)', percent: 3.5, color: '#a855f7' },
      { gas: 'Ácido Sulfúrico (H₂SO₄)', percent: 0.1, color: '#eab308' }
    ],
    jwstInsights: 'JWST y la sonda BepiColombo analizan las firmas espectrales de fosfina e isótopos en sus nubes superiores.'
  },
  tierra: {
    id: 'tierra',
    name: 'La Tierra',
    type: 'planeta_rocoso',
    diameter: '12,742 km',
    diameterKm: 12742,
    distanceFromSun: '149.6 millones de km',
    distanceAU: 1.00,
    eccentricity: 0.0167,
    perihelionAU: 0.983,
    aphelionAU: 1.017,
    axialTilt: '23.44°',
    orbitalPeriod: '365.25 días',
    funFact: 'Es el único planeta del Sistema Solar con placas tectónicas activas y agua en estado líquido permanente en su superficie.',
    description: 'Nuestro laboratorio natural de biodiversidad. Su geodinamo interna produce una magnetosfera masiva que desvía el viento solar permitiendo océanos líquidos y atmósfera estable.',
    moons: [
      { name: 'La Luna', desc: 'Nuestro satélite natural a 384,400 km. Su atracción gravitatoria estabiliza la inclinación axial del eje terrestre evitando cambios climáticos caóticos.' }
    ],
    atmosphere: [
      { gas: 'Nitrógeno (N₂)', percent: 78.1, color: '#3b82f6' },
      { gas: 'Oxígeno (O₂)', percent: 20.9, color: '#22c55e' },
      { gas: 'Argón (Ar)', percent: 0.9, color: '#a855f7' },
      { gas: 'Dióxido de Carbono (CO₂)', percent: 0.04, color: '#ef4444' }
    ],
    magnetosphere: {
      hasField: true,
      description: 'Magnetosfera con dipolo magnético dinámico y Cinturones de Radiación de Van Allen que generan las auroras polares.'
    }
  },
  marte: {
    id: 'marte',
    name: 'Marte',
    type: 'planeta_rocoso',
    diameter: '6,779 km',
    diameterKm: 6779,
    distanceFromSun: '227.9 millones de km',
    distanceAU: 1.52,
    eccentricity: 0.0934,
    perihelionAU: 1.382,
    aphelionAU: 1.666,
    axialTilt: '25.19°',
    orbitalPeriod: '687 días terrestres',
    funFact: '¡Posee el cañón más profundo (Valles Marineris de 4,000 km) y el volcán más alto (Monte Olimpo de 22 km) de todo el Sistema Solar!',
    description: 'El planeta rojo. Muestra cauces fluviales fósiles e hielo de agua en los polos y subsuelo. Los rovers Perseverance e Ingenuity buscan biofirmas antiguas en el cráter Jezero.',
    moons: [
      { name: 'Fobos', desc: 'Luna irregular de 22 km. Se acerca a Marte 1.8 metros por siglo y colisionará o formará un anillo en 50 millones de años.' },
      { name: 'Deimos', desc: 'Luna pequeña externa de 12 km con suave polvo de regolito.' }
    ],
    atmosphere: [
      { gas: 'Dióxido de Carbono (CO₂)', percent: 95.3, color: '#ef4444' },
      { gas: 'Nitrógeno (N₂)', percent: 2.6, color: '#3b82f6' },
      { gas: 'Argón (Ar)', percent: 1.9, color: '#a855f7' }
    ],
    jwstInsights: 'JWST midió mapas de metano estacional en la atmósfera marciana desde el espacio profundo.'
  },
  cinturon_asteroides: {
    id: 'cinturon_asteroides',
    name: 'Cinturón de Asteroides',
    type: 'cinturon',
    diameter: 'Anillo entre Marte y Júpiter',
    diameterKm: 950,
    distanceFromSun: '329 a 478 millones de km',
    distanceAU: 2.70,
    eccentricity: 0.07,
    perihelionAU: 2.2,
    aphelionAU: 3.2,
    axialTilt: '0°',
    orbitalPeriod: '3.5 a 6 años',
    funFact: '¡Ceres es el objeto más grande del cinturón (950 km) y es un planeta enano que contiene reservas de agua subterránea!',
    description: 'Región de escombros de la condensación del disco protoplanetario que la inmensa gravedad de Júpiter impidió amalgamarse en un planeta.',
    moons: []
  },
  jupiter: {
    id: 'jupiter',
    name: 'Júpiter',
    type: 'planeta_gaseoso',
    diameter: '139,820 km (11 veces la Tierra)',
    diameterKm: 139820,
    distanceFromSun: '778.5 millones de km',
    distanceAU: 5.20,
    eccentricity: 0.0489,
    perihelionAU: 4.95,
    aphelionAU: 5.46,
    axialTilt: '3.13°',
    orbitalPeriod: '11.86 años terrestres',
    funFact: '¡Su magnetosfera es la estructura sostenida más grande de la naturaleza! Si fuera visible a ojo desnudo, se vería en el cielo 3 veces más grande que la Luna.',
    description: 'El coloso gaseoso del Sistema Solar. Su Gran Mancha Roja es un anticiclón gigante de vientos a 650 km/h. La misión JUICE de la ESA y Juno de la NASA investigan su interior.',
    moons: [
      { name: 'Ío', desc: 'El cuerpo con más actividad volcánica viva del Sistema Solar debido al calentamiento por marea gravitatoria.' },
      { name: 'Europa', desc: 'Océano global de agua líquida bajo una corteza helada de 20 km. Objetivo principal de la sonda Europa Clipper de la NASA.' },
      { name: 'Ganimedes', desc: 'La luna más grande del Sistema Solar y la única con su propio dipolo magnético interno.' },
      { name: 'Calisto', desc: 'El cuerpo con más impacto de cráteres fósiles en la astronomía.' }
    ],
    atmosphere: [
      { gas: 'Hidrógeno (H₂)', percent: 89.8, color: '#f59e0b' },
      { gas: 'Helio (He)', percent: 10.2, color: '#ef4444' }
    ],
    magnetosphere: {
      hasField: true,
      description: 'Magnetosfera hiperintensa alimentada por hidrógeno metálico líquido en su manto profundo y toros de azufre emitidos por Ío.'
    },
    jwstInsights: 'JWST fotografió los tenues anillos de Júpiter, auroras gigantescas en los polos y la luna Europa en infrarrojo cercano (NIRCam).'
  },
  saturno: {
    id: 'saturno',
    name: 'Saturno',
    type: 'planeta_gaseoso',
    diameter: '116,460 km (9.5 veces la Tierra)',
    diameterKm: 116460,
    distanceFromSun: '1,434 millones de km',
    distanceAU: 9.58,
    eccentricity: 0.0565,
    perihelionAU: 9.04,
    aphelionAU: 10.12,
    axialTilt: '26.73°',
    orbitalPeriod: '29.45 años terrestres',
    funFact: '¡Los espectaculares anillos de Saturno están formados por un 99% de hielo de agua pura y tienen solo unos 10 metros de grosor medio!',
    description: 'Famoso por su sistema de anillos divididos por la Brecha de Cassini. Muestra un vórtice hexagonal perfecto en su polo norte.',
    ringDetails: 'Compuesto por billones de partículas de hielo flotante. Se dividen en anillos A, B, C y la grieta gravitacional de Cassini provocada por la luna Mimas.',
    moons: [
      { name: 'Titán', desc: 'Satélite con atmósfera de nitrógeno denso, lluvias de metano líquido y mares de hidrocarburos como Kraken Mare.' },
      { name: 'Encélado', desc: 'Expulsa géiseres de vapor de agua y sales orgánicas hacia el espacio desde su océano subterráneo calentado por fricción de marea.' }
    ],
    atmosphere: [
      { gas: 'Hidrógeno (H₂)', percent: 96.3, color: '#f59e0b' },
      { gas: 'Helio (He)', percent: 3.2, color: '#ef4444' },
      { gas: 'Metano (CH₄)', percent: 0.4, color: '#22c55e' }
    ]
  },
  urano: {
    id: 'urano',
    name: 'Urano',
    type: 'planeta_gaseoso',
    diameter: '50,724 km',
    diameterKm: 50724,
    distanceFromSun: '2,871 millones de km',
    distanceAU: 19.22,
    eccentricity: 0.0463,
    perihelionAU: 18.33,
    aphelionAU: 20.11,
    axialTilt: '97.77° (Rotación Horizontal)',
    orbitalPeriod: '84.01 años terrestres',
    funFact: '¡Urano rota prácticamente inclinado de lado (98°), provocando estaciones extremas que duran 42 años continuos de luz o penumbra!',
    description: 'Gigante helado compuesto de fluidos de agua, metano y amoniaco sobre un núcleo rocoso. Es el planeta con la atmósfera más fría del Sistema Solar (-224°C).',
    moons: [
      { name: 'Titania', desc: 'La luna más grande de Urano con cañones gigantes cosidos por fallas tectónicas.' },
      { name: 'Miranda', desc: 'Satélite con un acantilado de 20 km de profundidad (Verona Rupes), el más alto conocido.' }
    ],
    atmosphere: [
      { gas: 'Hidrógeno (H₂)', percent: 82.5, color: '#60a5fa' },
      { gas: 'Helio (He)', percent: 15.2, color: '#a855f7' },
      { gas: 'Metano (CH₄)', percent: 2.3, color: '#22c55e' }
    ]
  },
  neptuno: {
    id: 'neptuno',
    name: 'Neptuno',
    type: 'planeta_gaseoso',
    diameter: '49,244 km',
    diameterKm: 49244,
    distanceFromSun: '4,495 millones de km',
    distanceAU: 30.07,
    eccentricity: 0.00945,
    perihelionAU: 29.81,
    aphelionAU: 30.33,
    axialTilt: '28.32°',
    orbitalPeriod: '164.8 años terrestres',
    funFact: '¡Alberga los vientos atmosféricos más rabiosos del Sistema Solar, superando los 2,100 km/h!',
    description: 'El gigante helado más lejano. Su intenso color azul verdoso se debe al metano en su atmósfera superior que absorbe la luz roja.',
    moons: [
      { name: 'Tritón', desc: 'Luna helada capturada en órbita retrógrada. Posee criovolcanes de nitrógeno líquido en su superficie helada a -235°C.' }
    ],
    atmosphere: [
      { gas: 'Hidrógeno (H₂)', percent: 80.0, color: '#3b82f6' },
      { gas: 'Helio (He)', percent: 19.0, color: '#a855f7' },
      { gas: 'Metano (CH₄)', percent: 1.0, color: '#22c55e' }
    ]
  },
  cinturon_kuiper: {
    id: 'cinturon_kuiper',
    name: 'Cinturón de Kuiper & Plutón',
    type: 'cinturon',
    diameter: 'Disco helado masivo externo',
    diameterKm: 2377,
    distanceFromSun: '5,900 millones de km',
    distanceAU: 39.48,
    eccentricity: 0.2488,
    perihelionAU: 29.65,
    aphelionAU: 49.30,
    axialTilt: '122.5°',
    orbitalPeriod: '248 años terrestres',
    funFact: '¡Plutón y el Cinturón de Kuiper albergan cometas de periodo corto y los planetas enanos Eris, Haumea y Makemake!',
    description: 'Región de cuerpos congelados de nitrógeno, metano y agua en los confines del Sistema Solar.',
    moons: []
  },
  jwst: {
    id: 'jwst',
    name: 'Telescopio Espacial James Webb (JWST)',
    type: 'sonda',
    diameter: '6.5 m (Espejo primario de berilio)',
    diameterKm: 0.0065,
    distanceFromSun: '151.1 millones de km (Punto L₂)',
    distanceAU: 1.01,
    eccentricity: 0.0167,
    perihelionAU: 0.99,
    aphelionAU: 1.03,
    axialTilt: 'Orbitador L₂',
    orbitalPeriod: '1 año (Órbita halo en L₂)',
    funFact: '¡Opera a -233°C protegido por un parasol de 5 capas de Kapton del tamaño de una cancha de tenis!',
    description: 'El observatorio científico espacial más potente de la humanidad. Ubicado en el Punto de Lagrange L₂ detrás de la Tierra, observa el cosmos en infrarrojo.',
    moons: []
  },
  parker: {
    id: 'parker',
    name: 'Sonda Parker Solar Probe',
    type: 'sonda',
    diameter: '3 metros (Escudo térmico)',
    diameterKm: 0.003,
    distanceFromSun: '6.1 millones de km en perihelio',
    distanceAU: 0.04,
    eccentricity: 0.88,
    perihelionAU: 0.04,
    aphelionAU: 0.73,
    axialTilt: 'Sonda heliocéntrica',
    orbitalPeriod: '88 días',
    funFact: '¡Es el objeto humano más rápido jamás construido, alcanzando los 690,000 km/h al rozar la corona del Sol!',
    description: 'Sonda de la NASA lanzada para "tocar el Sol". Atraviesa la corona solar estudiando el viento solar y la reconexión magnética.',
    moons: []
  },
  voyager1: {
    id: 'voyager1',
    name: 'Sonda Voyager 1',
    type: 'sonda',
    diameter: '3.7 metros (antena)',
    diameterKm: 0.0037,
    distanceFromSun: '24,300 millones de km',
    distanceAU: 163.00,
    eccentricity: 1.0,
    perihelionAU: 1.0,
    aphelionAU: 999.0,
    axialTilt: 'Trayectoria hiperbólica de escape',
    orbitalPeriod: 'Escape Interestelar',
    funFact: '¡Es el objeto fabricado por el ser humano más distante de la Tierra, navegando el espacio interestelar desde 2012!',
    description: 'Lanzada en 1977. Sobrevoló Júpiter y Saturno y porta el Disco de Oro (Golden Record) con sonidos y saludos del planeta Tierra.',
    moons: []
  }
};

// Datos para la Comparación de Escala de Diámetro Directa contra el Sol
const SCALE_BODIES_DATA: Record<string, { name: string; diameterKm: number; color: string; ring?: boolean; desc: string }> = {
  mercurio: { name: 'Mercurio', diameterKm: 4879, color: '#A89EBC', desc: 'El planeta más pequeño del Sistema Solar.' },
  venus: { name: 'Venus', diameterKm: 12104, color: '#E6A05E', desc: 'El gemelo de la Tierra en tamaño.' },
  tierra: { name: 'La Tierra', diameterKm: 12742, color: '#3B82F6', desc: 'Nuestro hogar azul con océanos y vida.' },
  luna: { name: 'La Luna', diameterKm: 3474, color: '#D1D5DB', desc: 'Satélite natural de la Tierra.' },
  marte: { name: 'Marte', diameterKm: 6779, color: '#EF4444', desc: 'El Planeta Rojo desértico.' },
  jupiter: { name: 'Júpiter', diameterKm: 139820, color: '#D97706', desc: 'El coloso gaseoso más grande del Sistema Solar.' },
  saturno: { name: 'Saturno', diameterKm: 116460, color: '#E0B974', ring: true, desc: 'Famoso por su majestuoso sistema de anillos.' },
  urano: { name: 'Urano', diameterKm: 50724, color: '#38BDF8', desc: 'Gigante helado inclinado 98°.' },
  neptuno: { name: 'Neptuno', diameterKm: 49244, color: '#1D4ED8', desc: 'Gigante helado azul con vientos supersónicos.' },
  pluton: { name: 'Plutón', diameterKm: 2377, color: '#8C9EB5', desc: 'Planeta enano del Cinturón de Kuiper.' }
};

// Datos para la Calculadora de Viaje Espacial
const SPEED_PRESETS = [
  { id: 'train', name: '🚆 Tren de Alta Velocidad (300 km/h)', speedKmH: 300 },
  { id: 'plane', name: '✈️ Avión Comercial (900 km/h)', speedKmH: 900 },
  { id: 'starship', name: '🚀 Cohete Starship / Artemis (40,000 km/h)', speedKmH: 40000 },
  { id: 'light', name: '⚡ Velocidad de la Luz (1,080,000,000 km/h)', speedKmH: 1080000000 }
];

export default function SolarSystem() {
  // Pestañas Principales
  const [activeTab, setActiveTab] = useState<'explorer' | 'scale' | 'spectroscopy' | 'physics'>('explorer');

  // Filtro del Espectro Electromagnético (HUD Bar)
  const [spectrumMode, setSpectrumMode] = useState<'visible' | 'infrared' | 'ultraviolet'>('visible');

  // Toggles Visuales
  const [showOrbits, setShowOrbits] = useState(true);
  const [showMagnetosphere, setShowMagnetosphere] = useState(false);
  const [showProbes, setShowProbes] = useState(true);
  const [showAsteroids, setShowAsteroids] = useState(true);
  const [showKuiper, setShowKuiper] = useState(true);
  const [useEllipticalOrbits, setUseEllipticalOrbits] = useState(true);

  // Estados del Explorador
  const [isPlaying, setIsPlaying] = useState(true);
  const [speedMultiplier, setSpeedMultiplier] = useState(1);
  const [selectedBody, setSelectedBody] = useState<CelestialBody>(CELESTIAL_DATA.sol);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isTracking, setIsTracking] = useState(false);

  // Estados de Navegación Libre y Panning
  const svgWrapperRef = useRef<HTMLDivElement>(null);
  const [panOffset, setPanOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [showMobileLayerSettings, setShowMobileLayerSettings] = useState<boolean>(false);
  const dragStartRef = useRef<{ x: number; y: number; startPanX: number; startPanY: number }>({ x: 0, y: 0, startPanX: 0, startPanY: 0 });
  const touchStartRef = useRef<{ x: number; y: number; dist: number }>({ x: 0, y: 0, dist: 0 });

  // Pestaña 2: Comparador de Escala e Inserción de Tránsito frente al Sol
  const [selectedScalePlanet, setSelectedScalePlanet] = useState<string>('tierra');
  const [scaleZoomLevel, setScaleZoomLevel] = useState<number>(1.0);
  const [isTransitAnimating, setIsTransitAnimating] = useState<boolean>(false);
  const [transitXOffset, setTransitXOffset] = useState<number>(0);
  const [showAllTransits, setShowAllTransits] = useState<boolean>(false);

  // Pestaña 2: Calculadora de Viaje
  const [travelDestination, setTravelDestination] = useState<string>('marte');
  const [travelVehicleSpeed, setTravelVehicleSpeed] = useState<number>(40000);

  // Pestaña 3: Espectroscopía
  const [selectedSpectroBody, setSelectedSpectroBody] = useState<string>('tierra');
  const [activeWavelength, setActiveWavelength] = useState<number>(550); // nm
  const [selectedInstrument, setSelectedInstrument] = useState<string>('jwst_nirspec');
  const [activeSpectroSection, setActiveSpectroSection] = useState<'analyzer' | 'instruments' | 'learning'>('analyzer');

  // Pestaña 4: Física Orbital
  const [starMass, setStarMass] = useState<number>(1.0);
  const [planetVelocity, setPlanetVelocity] = useState<number>(1.0);
  const [orbitalDistance, setOrbitalDistance] = useState<number>(1.0);
  const [showPrecessionEinstein, setShowPrecessionEinstein] = useState<boolean>(false);
  const [physicsRadius, setPhysicsRadius] = useState<number>(180);
  const [physicsAngle, setPhysicsAngle] = useState<number>(0);
  const [physicsCollided, setPhysicsCollided] = useState<boolean>(false);
  const [physicsEscaped, setPhysicsEscaped] = useState<boolean>(false);

  // Ángulos Orbitales (Tiempos de Animación)
  const [angles, setAngles] = useState<Record<string, number>>({
    mercurio: 0,
    venus: 0,
    tierra: 0,
    marte: 0,
    jupiter: 0,
    saturno: 0,
    urano: 0,
    neptuno: 0,
    luna: 0,
    jwst: 0,
    parker: 0,
    voyager1: 0
  });

  const requestRef = useRef<number>(0);
  const previousTimeRef = useRef<number>(0);

  // Periodos orbitales Keplerianos adaptados
  const orbitalSpeeds: Record<string, number> = {
    mercurio: 4.15,
    venus: 1.62,
    tierra: 1.0,
    marte: 0.53,
    jupiter: 0.084,
    saturno: 0.034,
    urano: 0.012,
    neptuno: 0.006,
    parker: 5.2,
    jwst: 1.0,
    voyager1: 0.002
  };

  useEffect(() => {
    const animate = (time: number) => {
      if (previousTimeRef.current !== 0 && isPlaying && activeTab === 'explorer') {
        const deltaTime = (time - previousTimeRef.current) / 1000;
        const step = deltaTime * 20 * speedMultiplier;

        setAngles(prev => {
          // Aceleración kepleriana por excentricidad (2ª Ley de Kepler: mayor velocidad en perihelio)
          const calcStep = (baseSpeed: number, bodyId: string) => {
            const body = CELESTIAL_DATA[bodyId];
            const e = useEllipticalOrbits && body ? body.eccentricity : 0;
            const curRad = ((prev[bodyId] || 0) * Math.PI) / 180;
            const keplerFactor = e > 0.04 ? Math.pow(1 + e * Math.cos(curRad), 1.6) : 1;
            return baseSpeed * step * keplerFactor;
          };

          return {
            mercurio: (prev.mercurio + calcStep(orbitalSpeeds.mercurio, 'mercurio')) % 360,
            venus: (prev.venus + calcStep(orbitalSpeeds.venus, 'venus')) % 360,
            tierra: (prev.tierra + calcStep(orbitalSpeeds.tierra, 'tierra')) % 360,
            marte: (prev.marte + calcStep(orbitalSpeeds.marte, 'marte')) % 360,
            jupiter: (prev.jupiter + calcStep(orbitalSpeeds.jupiter, 'jupiter')) % 360,
            saturno: (prev.saturno + calcStep(orbitalSpeeds.saturno, 'saturno')) % 360,
            urano: (prev.urano + calcStep(orbitalSpeeds.urano, 'urano')) % 360,
            neptuno: (prev.neptuno + calcStep(orbitalSpeeds.neptuno, 'neptuno')) % 360,
            luna: (prev.luna + 12.0 * step) % 360,
            jwst: (prev.jwst + calcStep(orbitalSpeeds.tierra, 'tierra')) % 360,
            parker: (prev.parker + calcStep(orbitalSpeeds.parker, 'parker')) % 360,
            voyager1: (prev.voyager1 + deltaTime * 0.4 * speedMultiplier) % 360
          };
        });
      }
      previousTimeRef.current = time;
      requestRef.current = requestAnimationFrame(animate);
    };

    requestRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(requestRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- orbit speeds mutate during animation; keyed by control state
  }, [isPlaying, speedMultiplier, activeTab, useEllipticalOrbits]);

  // Animación del Tránsito Solar en Pestaña de Escalas
  const transitAnimationRef = useRef<number>(0);
  useEffect(() => {
    if (!isTransitAnimating || activeTab !== 'scale') return;

    let startX = transitXOffset;
    const animateTransit = () => {
      startX += 1.6;
      if (startX > 240) startX = -240;
      setTransitXOffset(startX);
      transitAnimationRef.current = requestAnimationFrame(animateTransit);
    };

    transitAnimationRef.current = requestAnimationFrame(animateTransit);
    return () => cancelAnimationFrame(transitAnimationRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- transitXOffset updates every frame by design
  }, [isTransitAnimating, activeTab]);

  // Animación del Laboratorio de Física
  const physicsAnimationRef = useRef<number>(0);
  const physicsPrevTimeRef = useRef<number>(0);

  useEffect(() => {
    if (activeTab !== 'physics') return;

    setPhysicsCollided(false);
    setPhysicsEscaped(false);
    let currentR = 180 * orbitalDistance;
    setPhysicsRadius(currentR);

    const animatePhysics = (time: number) => {
      if (physicsPrevTimeRef.current !== 0) {
        const dt = (time - physicsPrevTimeRef.current) / 1000;
        const idealV = Math.sqrt(starMass / (orbitalDistance || 0.001));
        const actualV = planetVelocity * idealV;
        const balance = actualV / (idealV || 0.001);

        if (balance < 0.8) {
          currentR = Math.max(25, currentR - dt * 45 * (1.2 - balance));
          setPhysicsRadius(currentR);
          if (currentR <= 35) setPhysicsCollided(true);
        } else if (balance > 1.25) {
          currentR = Math.min(420, currentR + dt * 55 * (balance - 1.0));
          setPhysicsRadius(currentR);
          if (currentR >= 400) setPhysicsEscaped(true);
        } else {
          const targetR = 180 * orbitalDistance;
          currentR = currentR + (targetR - currentR) * 0.05;
          setPhysicsRadius(currentR);
        }

        const angularSpeed = (actualV / (orbitalDistance || 0.1)) * 40;
        setPhysicsAngle(prev => (prev + angularSpeed * dt * 1.5) % 360);
      }

      physicsPrevTimeRef.current = time;
      physicsAnimationRef.current = requestAnimationFrame(animatePhysics);
    };

    physicsAnimationRef.current = requestAnimationFrame(animatePhysics);
    return () => cancelAnimationFrame(physicsAnimationRef.current);
  }, [activeTab, starMass, planetVelocity, orbitalDistance]);

  // Radios de Semi-Eje Mayor en SVG (Plano 900x900)
  const semiMajorAxes: Record<string, number> = {
    mercurio: 70,
    venus: 105,
    tierra: 145,
    marte: 185,
    jupiter: 250,
    saturno: 310,
    urano: 365,
    neptuno: 415
  };

  // Cálculo Trigonométrico con Excentricidad Elíptica Reales (Leyes de Kepler)
  const getCoordinates = (bodyId: string) => {
    const a = semiMajorAxes[bodyId];
    if (!a) return { x: 450, y: 450, a: 0, b: 0, c: 0 };

    const bodyData = CELESTIAL_DATA[bodyId];
    const e = useEllipticalOrbits && bodyData ? bodyData.eccentricity : 0;
    
    // Semi-eje menor b = a * sqrt(1 - e^2)
    const b = a * Math.sqrt(1 - e * e);
    // Desplazamiento del foco del Sol c = a * e
    const c = a * e;

    const angleDeg = angles[bodyId] || 0;
    const angleRad = (angleDeg * Math.PI) / 180;

    // Foco posicionado en (450, 450) -> Centro de elipse desplazado en -c
    const x = 450 - c + a * Math.cos(angleRad);
    const y = 450 + b * Math.sin(angleRad);

    return { x, y, a, b, c };
  };

  const getJWSTCoords = () => {
    const earthCoords = getCoordinates('tierra');
    // JWST está en el punto de Lagrange L2 justo a 1.5M km detrás de la Tierra
    const angleRad = (angles.tierra * Math.PI) / 180;
    return {
      x: earthCoords.x + 18 * Math.cos(angleRad),
      y: earthCoords.y + 18 * Math.sin(angleRad)
    };
  };

  const getParkerCoords = () => {
    const t = (angles.parker * Math.PI) / 180;
    // Órbita elíptica súper excéntrica cerca del Sol (r_min = 28, r_max = 140)
    const r = 28 + 56 * (1 + Math.cos(t));
    return {
      x: 450 + r * Math.cos(t),
      y: 450 + r * Math.sin(t)
    };
  };

  const getVoyager1Coords = () => {
    const t = (angles.voyager1 * Math.PI) / 180;
    const r = 145 + (angles.voyager1 / 360) * 310;
    return {
      x: 450 + r * Math.cos(t),
      y: 450 + r * Math.sin(t)
    };
  };

  const coordsTierra = getCoordinates('tierra');
  const coordsMarte = getCoordinates('marte');
  const coordsJupiter = getCoordinates('jupiter');
  const coordsSaturno = getCoordinates('saturno');
  const coordsNeptuno = getCoordinates('neptuno');
  const coordsJWST = getJWSTCoords();
  const coordsParker = getParkerCoords();
  const coordsVoyager1 = getVoyager1Coords();

  // Control de Cámara, Pan & Drag y Seguimiento Dinámico
  const handleSelectBody = (body: CelestialBody) => {
    soundEffects.playSpacePulse();
    setSelectedBody(body);
    if (body.id !== 'sol' && body.type !== 'cinturon') {
      setIsTracking(true);
      if (body.type === 'sonda') setZoomLevel(2.5);
      else if (body.id === 'jupiter' || body.id === 'saturno') setZoomLevel(2.2);
      else setZoomLevel(3.5);
    } else {
      setIsTracking(false);
      setPanOffset({ x: 0, y: 0 });
      setZoomLevel(1.0);
    }
  };

  const zoomIn = () => setZoomLevel(prev => Math.min(prev + 0.35, 8.0));
  const zoomOut = () => setZoomLevel(prev => Math.max(prev - 0.35, 0.4));
  const resetZoom = () => {
    setZoomLevel(1.0);
    setPanOffset({ x: 0, y: 0 });
    setIsTracking(false);
    setSelectedBody(CELESTIAL_DATA.sol);
  };

  const setCameraPreset = (preset: 'sistema' | 'rocosos' | 'gigantes' | 'sol' | 'kuiper') => {
    setIsTracking(false);
    if (preset === 'sistema') {
      setZoomLevel(0.65);
      setPanOffset({ x: 0, y: 0 });
      setSelectedBody(CELESTIAL_DATA.sol);
    } else if (preset === 'rocosos') {
      setZoomLevel(1.85);
      setPanOffset({ x: 0, y: 0 });
    } else if (preset === 'gigantes') {
      setZoomLevel(0.95);
      setPanOffset({ x: 0, y: 0 });
    } else if (preset === 'sol') {
      setZoomLevel(3.2);
      setPanOffset({ x: 0, y: 0 });
      setSelectedBody(CELESTIAL_DATA.sol);
      setIsTracking(true);
    } else if (preset === 'kuiper') {
      setZoomLevel(0.42);
      setPanOffset({ x: 0, y: 0 });
    }
  };

  // Manejadores de Arrastre Libre de Lienzo (Mouse y Touch)
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    setIsDragging(true);
    setIsTracking(false);
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      startPanX: panOffset.x,
      startPanY: panOffset.y
    };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const dx = e.clientX - dragStartRef.current.x;
    const dy = e.clientY - dragStartRef.current.y;
    setPanOffset({
      x: Math.max(-1400, Math.min(1400, dragStartRef.current.startPanX + dx / zoomLevel)),
      y: Math.max(-1400, Math.min(1400, dragStartRef.current.startPanY + dy / zoomLevel))
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e: React.WheelEvent) => {
    const factor = e.deltaY < 0 ? 1.12 : 0.89;
    setZoomLevel(prev => Math.min(8.0, Math.max(0.4, prev * factor)));
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      setIsDragging(true);
      setIsTracking(false);
      dragStartRef.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
        startPanX: panOffset.x,
        startPanY: panOffset.y
      };
    } else if (e.touches.length === 2) {
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      touchStartRef.current = { dist, x: 0, y: 0 };
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 1 && isDragging) {
      const dx = e.touches[0].clientX - dragStartRef.current.x;
      const dy = e.touches[0].clientY - dragStartRef.current.y;
      setPanOffset({
        x: Math.max(-1400, Math.min(1400, dragStartRef.current.startPanX + dx / zoomLevel)),
        y: Math.max(-1400, Math.min(1400, dragStartRef.current.startPanY + dy / zoomLevel))
      });
    } else if (e.touches.length === 2) {
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      if (touchStartRef.current.dist > 0) {
        const factor = dist / touchStartRef.current.dist;
        setZoomLevel(prev => Math.min(8.0, Math.max(0.4, prev * factor)));
      }
      touchStartRef.current.dist = dist;
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  // Centro de Cámara Dinámico
  let camTargetX = 450;
  let camTargetY = 450;
  if (isTracking && selectedBody.id !== 'sol' && selectedBody.type !== 'cinturon') {
    if (selectedBody.id === 'jwst') {
      camTargetX = coordsJWST.x;
      camTargetY = coordsJWST.y;
    } else if (selectedBody.id === 'parker') {
      camTargetX = coordsParker.x;
      camTargetY = coordsParker.y;
    } else if (selectedBody.id === 'voyager1') {
      camTargetX = coordsVoyager1.x;
      camTargetY = coordsVoyager1.y;
    } else {
      const coords = getCoordinates(selectedBody.id);
      camTargetX = coords.x;
      camTargetY = coords.y;
    }
  }

  const currentCenterX = isTracking ? camTargetX : 450 - panOffset.x;
  const currentCenterY = isTracking ? camTargetY : 450 - panOffset.y;

  const transformStyle = `translate(450px, 450px) scale(${zoomLevel}) translate(${-currentCenterX}px, ${-currentCenterY}px)`;

  // Cálculo de tiempo de viaje espacial
  const destData = CELESTIAL_DATA[travelDestination] || CELESTIAL_DATA.marte;
  const distanceKm = (destData.distanceAU || 1.52) * 149597870.7; // AU a km
  const travelHours = distanceKm / (travelVehicleSpeed || 40000);
  const travelDays = travelHours / 24;
  const travelYears = travelDays / 365.25;

  return (
    <div className={`solarsystem-container spectrum-${spectrumMode}`}>
      <div className="solarsystem-content">
        
        {/* Encabezado Principal */}
        <header className="solarsystem-header animate-zoom-in">
          <div className="solarsystem-badge">📡 Observatorio de Astrofísica Avanzada</div>
          <h1 className="solarsystem-title">El Sistema Solar Interactivo</h1>
          <p className="solarsystem-subtitle">
            Explora las órbitas elípticas de Kepler, analiza atmósferas espectroscópicas y descubre el equilibrio físico del vecindario cósmico.
          </p>

          {/* Navegación por Pestañas */}
          <nav className="solar-nav-tabs">
            <button 
              className={`tab-btn ${activeTab === 'explorer' ? 'active' : ''}`}
              onClick={() => setActiveTab('explorer')}
            >
              🪐 1. Explorador & Órbitas de Kepler
            </button>
            <button 
              className={`tab-btn ${activeTab === 'scale' ? 'active' : ''}`}
              onClick={() => setActiveTab('scale')}
            >
              📏 2. Escalas & Calculadora de Viaje
            </button>
            <button 
              className={`tab-btn ${activeTab === 'spectroscopy' ? 'active' : ''}`}
              onClick={() => setActiveTab('spectroscopy')}
            >
              🔬 3. Espectroscopía Atmosférica
            </button>
            <button 
              className={`tab-btn ${activeTab === 'physics' ? 'active' : ''}`}
              onClick={() => setActiveTab('physics')}
            >
              🧪 4. Física Orbital (3ª Ley & Einstein)
            </button>
          </nav>
        </header>

        {/* =========================================================
            PESTAÑA 1: EXPLORADOR & ÓRBITAS DE KEPLER
           ========================================================= */}
        {activeTab === 'explorer' && (
          <div className="sim-dashboard animate-fade-in">
            
            {/* Barra de Filtro del Espectro Electromagnético (HUD Bar) */}
            <div className="spectrum-hud-bar">
              <span className="hud-title">👁️ Visión del Observatorio:</span>
              <div className="spectrum-btn-group">
                <button 
                  className={`spectrum-btn ${spectrumMode === 'visible' ? 'active' : ''}`}
                  onClick={() => setSpectrumMode('visible')}
                >
                  👁️ Luz Visible (Color Real)
                </button>
                <button 
                  className={`spectrum-btn infrared ${spectrumMode === 'infrared' ? 'active' : ''}`}
                  onClick={() => setSpectrumMode('infrared')}
                >
                  🔴 Infrarrojo (Telescopio James Webb)
                </button>
                <button 
                  className={`spectrum-btn uv ${spectrumMode === 'ultraviolet' ? 'active' : ''}`}
                  onClick={() => setSpectrumMode('ultraviolet')}
                >
                  🟣 Corona Solar (Rayos X / UV)
                </button>
              </div>
            </div>

            {/* Panel de Información Educativa Ampliado */}
            <div className="sim-info-panel animate-zoom-in">
              <div className="panel-inner-scroll">
                <div className="body-header-row">
                  <div className={`body-avatar-frame type-${selectedBody.type}`}>
                    <span className="avatar-emoji">
                      {selectedBody.type === 'sol' ? '☀️' : selectedBody.type === 'sonda' ? '🛰️' : selectedBody.type === 'cinturon' ? '🪐' : '🌍'}
                    </span>
                  </div>
                  <div>
                    <span className="body-type-badge">{selectedBody.type.replace('_', ' ')}</span>
                    <h2 className="body-name-title">{selectedBody.name}</h2>
                  </div>
                </div>

                <div className="body-stats-grid">
                  <div className="stat-card">
                    <span className="stat-label">Diámetro</span>
                    <span className="stat-val">{selectedBody.diameter}</span>
                  </div>
                  <div className="stat-card">
                    <span className="stat-label">Distancia al Sol</span>
                    <span className="stat-val">{selectedBody.distanceFromSun} ({selectedBody.distanceAU} UA)</span>
                  </div>
                  <div className="stat-card">
                    <span className="stat-label">Excentricidad (e)</span>
                    <span className="stat-val" style={{ color: selectedBody.eccentricity > 0.1 ? '#f59e0b' : '#38bdf8' }}>
                      {selectedBody.eccentricity} ({selectedBody.eccentricity > 0.1 ? 'Elíptica' : 'Casi Circular'})
                    </span>
                  </div>
                  <div className="stat-card">
                    <span className="stat-label">Inclinación Axial</span>
                    <span className="stat-val">{selectedBody.axialTilt}</span>
                  </div>
                </div>

                <div className="body-desc-box">
                  <p>{selectedBody.description}</p>
                  
                  {selectedBody.jwstInsights && (
                    <div className="special-details-box jwst-card">
                      <h4>🔭 Observaciones de James Webb (JWST)</h4>
                      <p>{selectedBody.jwstInsights}</p>
                    </div>
                  )}

                  {selectedBody.atmosphere && (
                    <div className="atmosphere-breakdown-card">
                      <h4>🌫️ Composición Atmosférica:</h4>
                      <div className="gas-bars-container">
                        {selectedBody.atmosphere.map((item, idx) => (
                          <div key={idx} className="gas-bar-row">
                            <div className="gas-name-label">
                              <span style={{ color: item.color }}>●</span> {item.gas}
                            </div>
                            <div className="gas-bar-track">
                              <div className="gas-bar-fill" style={{ width: `${item.percent}%`, background: item.color }}></div>
                            </div>
                            <span className="gas-pct-val">{item.percent}%</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedBody.magnetosphere && (
                    <div className="special-details-box mag-card">
                      <h4>🛡️ Magnetosfera Protectora</h4>
                      <p>{selectedBody.magnetosphere.description}</p>
                    </div>
                  )}

                  {selectedBody.ringDetails && (
                    <div className="special-details-box rings-card">
                      <h4>🪐 Anillos y Partículas de Hielo</h4>
                      <p>{selectedBody.ringDetails}</p>
                    </div>
                  )}
                </div>

                {selectedBody.moons.length > 0 && (
                  <div className="moons-section">
                    <h3 className="moons-title">🌙 Lunas Principales ({selectedBody.moons.length})</h3>
                    <div className="moons-list">
                      {selectedBody.moons.map((moon, index) => (
                        <div key={index} className="moon-item-card">
                          <span className="moon-icon">🌑</span>
                          <div>
                            <strong className="moon-name">{moon.name}</strong>
                            <p className="moon-desc">{moon.desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="fun-fact-alert">
                  <span className="fact-bulb">💡 Sabías que...</span>
                  <p className="fact-text">{selectedBody.funFact}</p>
                </div>
              </div>
            </div>

            {/* Lienzo del Simulador SVG Espacial */}
            <div className="sim-map-canvas">
              
              {/* Controles de Simulación y Navegación Cósmica */}
              <div className="canvas-controls-bar">
                <div className="control-btn-group desktop-only-controls">
                  <button 
                    className={`btn-sim-control ${isPlaying ? 'paused' : 'playing'}`}
                    onClick={() => setIsPlaying(!isPlaying)}
                  >
                    {isPlaying ? '⏸ Pausar' : '▶ Iniciar'}
                  </button>
                  <button className="btn-sim-control" onClick={() => handleSelectBody(CELESTIAL_DATA.sol)}>
                    ☀️ Ir al Sol
                  </button>
                </div>

                {/* Cluster de Zoom de Alto Impacto Visual (Destacado para Desktop) */}
                <div className="zoom-controls-cluster">
                  <span className="zoom-label-title">
                    Zoom: {zoomLevel.toFixed(2)}x
                  </span>
                  <div className="zoom-buttons-row">
                    <button className="btn-zoom-desktop-primary btn-zoom-out" onClick={zoomOut} title="Alejar vista del Sistema Solar (o rueda del ratón)">
                      <span className="zoom-symbol">➖</span>
                      <span className="zoom-text-label">Alejar</span>
                    </button>
                    <button className="btn-zoom-desktop-primary btn-zoom-in" onClick={zoomIn} title="Acercar vista del Sistema Solar (o rueda del ratón)">
                      <span className="zoom-symbol">➕</span>
                      <span className="zoom-text-label">Acercar</span>
                    </button>
                    <button className="btn-zoom-reset-highlight" onClick={resetZoom} title="Restablecer posición y escala completa">
                      <span className="zoom-symbol">🔄</span>
                      <span className="zoom-text-label">General</span>
                    </button>
                  </div>
                </div>

                {/* Presets de Enfoque Rápido / Ubicación */}
                <div className="camera-presets-bar">
                  <span className="presets-label">🔭 Enfoque:</span>
                  <button className="camera-preset-btn" onClick={() => setCameraPreset('sistema')} title="Ver todo el sistema solar hasta Kuiper">🌌 Todo</button>
                  <button className="camera-preset-btn" onClick={() => setCameraPreset('rocosos')} title="Mercurio, Venus, Tierra y Marte">🪨 Rocosos</button>
                  <button className="camera-preset-btn" onClick={() => setCameraPreset('gigantes')} title="Júpiter, Saturno, Urano y Neptuno">🪐 Gigantes</button>
                  <button className="camera-preset-btn" onClick={() => setCameraPreset('sol')} title="Corona, fotosfera y manchas solares">☀️ Sol</button>
                  <button className="camera-preset-btn" onClick={() => setCameraPreset('kuiper')} title="Cinturón de Kuiper y sonda Voyager 1">🛰️ Sondas</button>
                </div>

                {/* Botón Táctil Móvil para Alternar Capas Secundarias */}
                <div className="mobile-toggle-layers-bar">
                  <button 
                    className="btn-mobile-layers-toggle"
                    onClick={() => setShowMobileLayerSettings(!showMobileLayerSettings)}
                    title="Alternar opciones avanzadas y velocidad"
                  >
                    <span>⚙️ Filtros & Velocidad</span>
                    <span className="chevron-icon">{showMobileLayerSettings ? '▲' : '▼'}</span>
                  </button>
                </div>

                <div className={`toggles-controls-cluster ${showMobileLayerSettings ? 'mobile-visible' : ''}`}>
                  <label className="toggle-chip">
                    <input type="checkbox" checked={showOrbits} onChange={() => setShowOrbits(!showOrbits)} />
                    💫 Órbitas
                  </label>
                  <label className="toggle-chip">
                    <input type="checkbox" checked={useEllipticalOrbits} onChange={() => setUseEllipticalOrbits(!useEllipticalOrbits)} />
                    📐 Elipses Kepler
                  </label>
                  <label className="toggle-chip">
                    <input type="checkbox" checked={showAsteroids} onChange={() => setShowAsteroids(!showAsteroids)} />
                    🪨 Asteroides
                  </label>
                  <label className="toggle-chip">
                    <input type="checkbox" checked={showKuiper} onChange={() => setShowKuiper(!showKuiper)} />
                    ❄️ Kuiper
                  </label>
                  <label className="toggle-chip">
                    <input type="checkbox" checked={showMagnetosphere} onChange={() => setShowMagnetosphere(!showMagnetosphere)} />
                    🛡️ Magnetosfera
                  </label>
                  <label className="toggle-chip">
                    <input type="checkbox" checked={showProbes} onChange={() => setShowProbes(!showProbes)} />
                    🛰️ Sondas/JWST
                  </label>
                </div>

                <div className={`sim-speed-slider ${showMobileLayerSettings ? 'mobile-visible' : ''}`}>
                  <label>Velocidad</label>
                  <input 
                    type="range" min="0.2" max="3" step="0.1"
                    value={speedMultiplier}
                    onChange={(e) => setSpeedMultiplier(parseFloat(e.target.value))}
                    className="speed-range-input"
                  />
                  <span className="speed-val-indicator">{speedMultiplier}x</span>
                </div>
              </div>

              {selectedBody.id !== 'sol' && selectedBody.type !== 'cinturon' && (
                <div className="tracking-toast-banner animate-bounce-in">
                  <label className="switch-tracking-label">
                    <input 
                      type="checkbox" 
                      checked={isTracking} 
                      onChange={() => setIsTracking(!isTracking)} 
                    />
                    <span className="switch-custom-slider"></span>
                    <span className="tracking-text-label">🎥 Seguir órbita de {selectedBody.name}</span>
                  </label>
                </div>
              )}

              {/* Viewport Interactivo con Pan & Drag */}
              <div 
                ref={svgWrapperRef}
                className="svg-viewport-wrapper"
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onWheel={handleWheel}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
                title="Arrastra para moverte libremente por el espacio. Usa la rueda del ratón o botones para hacer zoom."
              >
                {/* Controles Touch Flotantes de Acceso Rápido sobre el Mapa (Móvil) */}
                <div className="mobile-touch-hud-controls" onClick={(e) => e.stopPropagation()}>
                  <button className="mobile-touch-btn touch-btn-zoom-in" onClick={zoomIn} title="Acercar">+</button>
                  <button className="mobile-touch-btn touch-btn-zoom-out" onClick={zoomOut} title="Alejar">-</button>
                  <button className="mobile-touch-btn touch-btn-recenter" onClick={resetZoom} title="Centrar y reajustar">🎯</button>
                  <button 
                    className={`mobile-touch-btn touch-btn-play ${isPlaying ? 'paused' : ''}`} 
                    onClick={() => setIsPlaying(!isPlaying)} 
                    title={isPlaying ? 'Pausa' : 'Iniciar'}
                  >
                    {isPlaying ? '⏸' : '▶'}
                  </button>
                </div>

                {/* HUD Minimapa Radar Cósmico */}
                <div className="cosmic-radar-hud" onClick={(e) => e.stopPropagation()}>
                  <div className="radar-title-row">
                    <span className="radar-dot-live">●</span>
                    <span className="radar-title">Radar Cósmico</span>
                  </div>
                  <svg 
                    viewBox="0 0 120 120" 
                    className="radar-svg"
                    onClick={(e) => {
                      e.stopPropagation();
                      const rect = e.currentTarget.getBoundingClientRect();
                      const clickX = e.clientX - rect.left;
                      const clickY = e.clientY - rect.top;
                      const w = rect.width || 120;
                      const h = rect.height || 120;
                      const targetSvgX = (clickX / w) * 900;
                      const targetSvgY = (clickY / h) * 900;
                      setIsTracking(false);
                      setPanOffset({
                        x: 450 - targetSvgX,
                        y: 450 - targetSvgY
                      });
                    }}
                  >
                    <circle cx="60" cy="60" r="56" fill="rgba(6, 2, 18, 0.9)" stroke="rgba(56, 189, 248, 0.3)" strokeWidth="1" />
                    <circle cx="60" cy="60" r="42" fill="none" stroke="rgba(56, 189, 248, 0.15)" strokeWidth="0.8" strokeDasharray="2 2" />
                    <circle cx="60" cy="60" r="24" fill="none" stroke="rgba(56, 189, 248, 0.15)" strokeWidth="0.8" strokeDasharray="2 2" />
                    <line x1="60" y1="4" x2="60" y2="116" stroke="rgba(56, 189, 248, 0.12)" strokeWidth="0.6" />
                    <line x1="4" y1="60" x2="116" y2="60" stroke="rgba(56, 189, 248, 0.12)" strokeWidth="0.6" />

                    {/* Sol en Radar */}
                    <circle cx="60" cy="60" r="4" fill="#fbbf24" filter="drop-shadow(0 0 4px #f59e0b)" />

                    {/* Planetas en Radar */}
                    {Object.keys(semiMajorAxes).map(pid => {
                      const coords = getCoordinates(pid);
                      const rx = (coords.x / 900) * 120;
                      const ry = (coords.y / 900) * 120;
                      const isSelected = selectedBody.id === pid;
                      return (
                        <circle 
                          key={pid} 
                          cx={rx} cy={ry} 
                          r={isSelected ? 3.2 : 1.8} 
                          fill={isSelected ? '#38bdf8' : '#e2e8f0'} 
                        />
                      );
                    })}

                    {/* Recuadro de Campo de Visión Actual */}
                    {(() => {
                      const boxW = Math.max(12, Math.min(110, (900 / zoomLevel / 900) * 120));
                      const boxH = Math.max(12, Math.min(110, (900 / zoomLevel / 900) * 120));
                      const boxX = (currentCenterX / 900) * 120 - boxW / 2;
                      const boxY = (currentCenterY / 900) * 120 - boxH / 2;
                      return (
                        <rect 
                          x={boxX} y={boxY} 
                          width={boxW} height={boxH} 
                          fill="rgba(56, 189, 248, 0.15)" 
                          stroke="#38bdf8" 
                          strokeWidth="1.2" 
                          strokeDasharray="2 1"
                          rx="2"
                        />
                      );
                    })()}
                  </svg>
                  <span className="radar-hint">🖱️ Arrastra o pulsa radar</span>
                </div>

                <svg viewBox="0 0 900 900" className="solar-system-svg">
                  <defs>
                    <radialGradient id="grad-sol-visible" cx="50%" cy="50%" r="50%">
                      <stop offset="0%" stopColor="#FFFEE0" />
                      <stop offset="35%" stopColor="#FBE903" />
                      <stop offset="85%" stopColor="#FE2712" />
                      <stop offset="100%" stopColor="#b91c1c" />
                    </radialGradient>

                    <radialGradient id="grad-sol-infra" cx="50%" cy="50%" r="50%">
                      <stop offset="0%" stopColor="#ffffff" />
                      <stop offset="40%" stopColor="#ff4500" />
                      <stop offset="100%" stopColor="#7a0016" />
                    </radialGradient>

                    <radialGradient id="grad-sol-uv" cx="50%" cy="50%" r="50%">
                      <stop offset="0%" stopColor="#f472b6" />
                      <stop offset="40%" stopColor="#c084fc" />
                      <stop offset="100%" stopColor="#312e81" />
                    </radialGradient>
                    
                    <filter id="glow-solar" x="-40%" y="-40%" width="180%" height="180%">
                      <feGaussianBlur stdDeviation="12" result="blur" />
                      <feComposite in="SourceGraphic" in2="blur" operator="over" />
                    </filter>

                    <linearGradient id="grad-jupiter-belts" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#d97706" />
                      <stop offset="20%" stopColor="#fef3c7" />
                      <stop offset="35%" stopColor="#92400e" />
                      <stop offset="50%" stopColor="#fbbf24" />
                      <stop offset="65%" stopColor="#78350f" />
                      <stop offset="80%" stopColor="#fde68a" />
                      <stop offset="100%" stopColor="#b45309" />
                    </linearGradient>

                    <linearGradient id="grad-saturn-rings" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="rgba(217, 119, 6, 0.1)" />
                      <stop offset="25%" stopColor="rgba(245, 158, 11, 0.7)" />
                      <stop offset="52%" stopColor="rgba(10, 5, 20, 0.9)" /> {/* División de Cassini */}
                      <stop offset="60%" stopColor="rgba(253, 230, 138, 0.75)" />
                      <stop offset="90%" stopColor="rgba(217, 119, 6, 0.4)" />
                      <stop offset="100%" stopColor="rgba(217, 119, 6, 0.05)" />
                    </linearGradient>

                    <radialGradient id="grad-earth-atmo" cx="50%" cy="50%" r="50%">
                      <stop offset="0%" stopColor="#3b82f6" />
                      <stop offset="70%" stopColor="#1d4ed8" />
                      <stop offset="90%" stopColor="#0284c7" />
                      <stop offset="100%" stopColor="#38bdf8" />
                    </radialGradient>
                  </defs>

                  <g 
                    style={{ 
                      transform: transformStyle, 
                      transformOrigin: '0 0',
                      transition: isDragging ? 'none' : isTracking ? 'none' : 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)' 
                    }}
                  >
                    {/* Dibujo de Órbitas Elípticas Realistas de Kepler */}
                    {showOrbits && Object.keys(semiMajorAxes).map((key) => {
                      const coords = getCoordinates(key);
                      return (
                        <ellipse 
                          key={key} 
                          cx={450 - coords.c} 
                          cy={450} 
                          rx={coords.a} 
                          ry={coords.b} 
                          className="svg-orbit-line" 
                        />
                      );
                    })}

                    {/* Viento Solar y Capa de Magnetosfera */}
                    {showMagnetosphere && (
                      <g className="magnetosphere-layer">
                        {/* Viento solar impulsado radialmente desde el Sol */}
                        {Array.from({ length: 16 }).map((_, idx) => {
                          const ang = (idx * 22.5 * Math.PI) / 180;
                          return (
                            <line 
                              key={idx} 
                              x1={450 + 44 * Math.cos(ang)} 
                              y1={450 + 44 * Math.sin(ang)} 
                              x2={450 + 440 * Math.cos(ang)} 
                              y2={450 + 440 * Math.sin(ang)} 
                              stroke="rgba(251, 191, 36, 0.25)" 
                              strokeWidth="1.5" 
                              strokeDasharray="4 8"
                            />
                          );
                        })}
                        {/* Dipolo Magnético de la Tierra */}
                        <circle cx={coordsTierra.x} cy={coordsTierra.y} r="22" fill="none" stroke="#38bdf8" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.85" />
                        {/* Dipolo Gigante de Júpiter */}
                        <circle cx={coordsJupiter.x} cy={coordsJupiter.y} r="42" fill="none" stroke="#a855f7" strokeWidth="2.2" strokeDasharray="4 4" opacity="0.85" />
                      </g>
                    )}

                    {/* Cinturón Principal de Asteroides */}
                    {showAsteroids && (
                      <g className="asteroid-belt-group" onClick={() => handleSelectBody(CELESTIAL_DATA.cinturon_asteroides)} style={{ cursor: 'pointer' }}>
                        <circle cx="450" cy="450" r="215" stroke="rgba(255,255,255,0.06)" strokeWidth="36" fill="none" />
                        {Array.from({ length: 90 }).map((_, idx) => {
                          const ang = (idx * 4 * Math.PI) / 180 + (angles.mercurio * 0.015);
                          const ringRadius = 202 + (idx % 3) * 11;
                          return (
                            <circle key={idx} cx={450 + ringRadius * Math.cos(ang)} cy={450 + ringRadius * Math.sin(ang)} r={1 + (idx % 2.5)} fill="#A89EBC" opacity="0.6" />
                          );
                        })}
                      </g>
                    )}

                    {/* Cinturón de Kuiper */}
                    {showKuiper && (
                      <g className="kuiper-belt-group" onClick={() => handleSelectBody(CELESTIAL_DATA.cinturon_kuiper)} style={{ cursor: 'pointer' }}>
                        <circle cx="450" cy="450" r="435" stroke="rgba(255,255,255,0.04)" strokeWidth="30" fill="none" />
                        {Array.from({ length: 120 }).map((_, idx) => {
                          const ang = (idx * 3 * Math.PI) / 180 + (angles.mercurio * 0.005);
                          const ringRadius = 422 + (idx % 4) * 8;
                          return (
                            <circle key={idx} cx={450 + ringRadius * Math.cos(ang)} cy={450 + ringRadius * Math.sin(ang)} r={0.8 + (idx % 2)} fill="#8C9EB5" opacity="0.5" />
                          );
                        })}
                      </g>
                    )}

                    {/* Sondas Espaciales */}
                    {showProbes && (
                      <g className="probes-layer">
                        {/* JWST en L2 */}
                        <g onClick={() => handleSelectBody(CELESTIAL_DATA.jwst)} style={{ cursor: 'pointer' }}>
                          <line x1={coordsTierra.x} y1={coordsTierra.y} x2={coordsJWST.x} y2={coordsJWST.y} stroke="#f59e0b" strokeWidth="1" strokeDasharray="2 2" />
                          <circle cx={coordsJWST.x} cy={coordsJWST.y} r="4" fill="#f59e0b" className={`solar-body ${selectedBody.id === 'jwst' ? 'active' : ''}`} />
                        </g>
                        {/* Parker Solar Probe */}
                        <g onClick={() => handleSelectBody(CELESTIAL_DATA.parker)} style={{ cursor: 'pointer' }}>
                          <circle cx={coordsParker.x} cy={coordsParker.y} r="3.5" fill="#ef4444" className={`solar-body ${selectedBody.id === 'parker' ? 'active' : ''}`} />
                        </g>
                        {/* Voyager 1 */}
                        <g onClick={() => handleSelectBody(CELESTIAL_DATA.voyager1)} style={{ cursor: 'pointer' }}>
                          <circle cx={coordsVoyager1.x} cy={coordsVoyager1.y} r="3" fill="#a855f7" className={`solar-body ${selectedBody.id === 'voyager1' ? 'active' : ''}`} />
                        </g>
                      </g>
                    )}

                    {/* =======================================================
                        EL SOL CON MANCHAS SOLARES Y PROMINENCIAS
                       ======================================================= */}
                    <g onClick={() => handleSelectBody(CELESTIAL_DATA.sol)} style={{ cursor: 'pointer' }}>
                      {/* Corona Solar y Prominencias Fulgurantes */}
                      <circle cx="450" cy="450" r="42" fill="none" stroke="rgba(251, 191, 36, 0.2)" strokeWidth="4" filter="url(#glow-solar)" />
                      <circle 
                        cx="450" cy="450" r="35" 
                        fill={spectrumMode === 'infrared' ? 'url(#grad-sol-infra)' : spectrumMode === 'ultraviolet' ? 'url(#grad-sol-uv)' : 'url(#grad-sol-visible)'} 
                        filter="url(#glow-solar)" 
                        className={`solar-body-sun ${selectedBody.id === 'sol' ? 'active' : ''}`} 
                      />
                      {/* Manchas Solares Reales (Ciclo 25) */}
                      <circle cx="442" cy="445" r="2.2" fill="#78350f" opacity="0.8" />
                      <circle cx="442" cy="445" r="1.1" fill="#180c04" />
                      <circle cx="460" cy="454" r="2.8" fill="#78350f" opacity="0.8" />
                      <circle cx="460" cy="454" r="1.4" fill="#180c04" />
                    </g>

                    {/* =======================================================
                        MERCURIO: Cráteres y excentricidad
                       ======================================================= */}
                    {(() => {
                      const p = getCoordinates('mercurio');
                      return (
                        <g onClick={() => handleSelectBody(CELESTIAL_DATA.mercurio)} style={{ cursor: 'pointer' }}>
                          <circle cx={p.x} cy={p.y} r="16" fill="transparent" />
                          <circle cx={p.x} cy={p.y} r="5.5" fill="#9ca3af" stroke="#4b5563" strokeWidth="0.8" className={`solar-body ${selectedBody.id === 'mercurio' ? 'active' : ''}`} />
                          <circle cx={p.x - 1.2} cy={p.y - 1} r="1.2" fill="#6b7280" />
                        </g>
                      );
                    })()}

                    {/* =======================================================
                        VENUS: Atmósfera densa super-rotatoria
                       ======================================================= */}
                    {(() => {
                      const p = getCoordinates('venus');
                      return (
                        <g onClick={() => handleSelectBody(CELESTIAL_DATA.venus)} style={{ cursor: 'pointer' }}>
                          <circle cx={p.x} cy={p.y} r="18" fill="transparent" />
                          <circle cx={p.x} cy={p.y} r="8" fill="#fde68a" stroke="#d97706" strokeWidth="1" className={`solar-body ${selectedBody.id === 'venus' ? 'active' : ''}`} />
                          <circle cx={p.x} cy={p.y} r="8.8" fill="none" stroke="rgba(245, 158, 11, 0.4)" strokeWidth="1.2" />
                        </g>
                      );
                    })()}

                    {/* =======================================================
                        LA TIERRA Y LA LUNA CON ATMÓSFERA RAYLEIGH
                       ======================================================= */}
                    {(() => {
                      const lunaRad = (angles.luna * Math.PI) / 180;
                      const lunaX = coordsTierra.x + 20 * Math.cos(lunaRad);
                      const lunaY = coordsTierra.y + 20 * Math.sin(lunaRad);

                      return (
                        <g style={{ cursor: 'pointer' }}>
                          {/* Órbita de la Luna */}
                          <circle cx={coordsTierra.x} cy={coordsTierra.y} r="20" fill="none" stroke="rgba(255, 255, 255, 0.15)" strokeWidth="0.6" strokeDasharray="2 2" />
                          
                          {/* Planeta Tierra */}
                          <g onClick={() => handleSelectBody(CELESTIAL_DATA.tierra)}>
                            <circle cx={coordsTierra.x} cy={coordsTierra.y} r="20" fill="transparent" />
                            {/* Halo atmosférico */}
                            <circle cx={coordsTierra.x} cy={coordsTierra.y} r="10.8" fill="none" stroke="rgba(56, 189, 248, 0.45)" strokeWidth="1.2" />
                            <circle cx={coordsTierra.x} cy={coordsTierra.y} r="9.2" fill="url(#grad-earth-atmo)" className={`solar-body ${selectedBody.id === 'tierra' ? 'active' : ''}`} />
                            {/* Manchas de continentes */}
                            <circle cx={coordsTierra.x - 2} cy={coordsTierra.y - 1} r="2.5" fill="#16a34a" opacity="0.75" />
                            <circle cx={coordsTierra.x + 2.5} cy={coordsTierra.y + 2} r="2" fill="#15803d" opacity="0.75" />
                          </g>

                          {/* La Luna */}
                          <g onClick={() => handleSelectBody(CELESTIAL_DATA.luna || CELESTIAL_DATA.tierra)}>
                            <circle cx={lunaX} cy={lunaY} r="2.5" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="0.5" />
                          </g>
                        </g>
                      );
                    })()}

                    {/* =======================================================
                        MARTE: Casquetes polares y óxido de hierro
                       ======================================================= */}
                    <g onClick={() => handleSelectBody(CELESTIAL_DATA.marte)} style={{ cursor: 'pointer' }}>
                      <circle cx={coordsMarte.x} cy={coordsMarte.y} r="17" fill="transparent" />
                      <circle cx={coordsMarte.x} cy={coordsMarte.y} r="7.2" fill="#ea580c" stroke="#9a3412" strokeWidth="0.9" className={`solar-body ${selectedBody.id === 'marte' ? 'active' : ''}`} />
                      {/* Casquete polar ártico blanco */}
                      <ellipse cx={coordsMarte.x} cy={coordsMarte.y - 5.5} rx="3" ry="1.2" fill="#ffffff" opacity="0.9" />
                    </g>

                    {/* =======================================================
                        JÚPITER: Bandas atmosféricas, Gran Mancha Roja y 4 lunas
                       ======================================================= */}
                    {(() => {
                      const ioRad = ((angles.luna * 2.2) * Math.PI) / 180;
                      const eurRad = ((angles.luna * 1.3) * Math.PI) / 180;
                      const ganRad = ((angles.luna * 0.7) * Math.PI) / 180;
                      const calRad = ((angles.luna * 0.35) * Math.PI) / 180;

                      return (
                        <g style={{ cursor: 'pointer' }}>
                          {/* Órbitas galileanas */}
                          <circle cx={coordsJupiter.x} cy={coordsJupiter.y} r="28" fill="none" stroke="rgba(255, 255, 255, 0.1)" strokeWidth="0.5" strokeDasharray="2 2" />
                          <circle cx={coordsJupiter.x} cy={coordsJupiter.y} r="36" fill="none" stroke="rgba(255, 255, 255, 0.1)" strokeWidth="0.5" strokeDasharray="2 2" />

                          {/* Cuerpo de Júpiter */}
                          <g onClick={() => handleSelectBody(CELESTIAL_DATA.jupiter)}>
                            <circle cx={coordsJupiter.x} cy={coordsJupiter.y} r="24" fill="transparent" />
                            <circle cx={coordsJupiter.x} cy={coordsJupiter.y} r="18" fill="url(#grad-jupiter-belts)" stroke="#b45309" strokeWidth="1" className={`solar-body ${selectedBody.id === 'jupiter' ? 'active' : ''}`} />
                            {/* Gran Mancha Roja */}
                            <ellipse cx={coordsJupiter.x + 4} cy={coordsJupiter.y + 4} rx="4" ry="2.2" fill="#dc2626" />
                          </g>

                          {/* 4 Satélites Galileanos */}
                          {/* Ío (volcánico) */}
                          <circle cx={coordsJupiter.x + 28 * Math.cos(ioRad)} cy={coordsJupiter.y + 28 * Math.sin(ioRad)} r="1.8" fill="#facc15">
                            <title>Ío</title>
                          </circle>
                          {/* Europa (hielo y océano) */}
                          <circle cx={coordsJupiter.x + 36 * Math.cos(eurRad)} cy={coordsJupiter.y + 36 * Math.sin(eurRad)} r="1.7" fill="#bae6fd">
                            <title>Europa</title>
                          </circle>
                          {/* Ganímedes (el más grande) */}
                          <circle cx={coordsJupiter.x + 45 * Math.cos(ganRad)} cy={coordsJupiter.y + 45 * Math.sin(ganRad)} r="2.2" fill="#cbd5e1">
                            <title>Ganímedes</title>
                          </circle>
                          {/* Calisto */}
                          <circle cx={coordsJupiter.x + 54 * Math.cos(calRad)} cy={coordsJupiter.y + 54 * Math.sin(calRad)} r="2.0" fill="#94a3b8">
                            <title>Calisto</title>
                          </circle>
                        </g>
                      );
                    })()}

                    {/* =======================================================
                        SATURNO: Anillos con División de Cassini y Titán
                       ======================================================= */}
                    {(() => {
                      const titanRad = ((angles.luna * 0.45) * Math.PI) / 180;
                      const titanX = coordsSaturno.x + 46 * Math.cos(titanRad);
                      const titanY = coordsSaturno.y + 46 * Math.sin(titanRad);

                      return (
                        <g onClick={() => handleSelectBody(CELESTIAL_DATA.saturno)} style={{ cursor: 'pointer' }}>
                          {/* Órbita de Titán */}
                          <circle cx={coordsSaturno.x} cy={coordsSaturno.y} r="46" fill="none" stroke="rgba(255, 255, 255, 0.08)" strokeWidth="0.5" strokeDasharray="2 2" />
                          
                          {/* Anillos de Saturno con inclinación de 26.7° */}
                          <g transform={`rotate(-22, ${coordsSaturno.x}, ${coordsSaturno.y})`}>
                            {/* Anillo A exterior */}
                            <ellipse cx={coordsSaturno.x} cy={coordsSaturno.y} rx="34" ry="9" fill="none" stroke="rgba(224, 185, 116, 0.45)" strokeWidth="3" />
                            {/* División de Cassini (hueco oscuro) */}
                            <ellipse cx={coordsSaturno.x} cy={coordsSaturno.y} rx="30.5" ry="8" fill="none" stroke="rgba(10, 5, 20, 0.85)" strokeWidth="1.2" />
                            {/* Anillo B interior brillante */}
                            <ellipse cx={coordsSaturno.x} cy={coordsSaturno.y} rx="27" ry="7" fill="none" stroke="rgba(253, 230, 138, 0.75)" strokeWidth="4.5" />
                          </g>

                          {/* Globo de Saturno */}
                          <circle cx={coordsSaturno.x} cy={coordsSaturno.y} r="13.5" fill="#fde68a" stroke="#d97706" strokeWidth="0.9" className={`solar-body ${selectedBody.id === 'saturno' ? 'active' : ''}`} />
                          
                          {/* Titán */}
                          <circle cx={titanX} cy={titanY} r="2.4" fill="#f97316">
                            <title>Titán</title>
                          </circle>
                        </g>
                      );
                    })()}

                    {/* =======================================================
                        URANO: Inclinación extrema (97.8°) y anillos tenues
                       ======================================================= */}
                    {(() => {
                      const p = getCoordinates('urano');
                      return (
                        <g onClick={() => handleSelectBody(CELESTIAL_DATA.urano)} style={{ cursor: 'pointer' }}>
                          <circle cx={p.x} cy={p.y} r="20" fill="transparent" />
                          {/* Anillos verticales tenues */}
                          <ellipse cx={p.x} cy={p.y} rx="5" ry="18" fill="none" stroke="rgba(207, 250, 254, 0.35)" strokeWidth="1" transform={`rotate(12, ${p.x}, ${p.y})`} />
                          <circle cx={p.x} cy={p.y} r="11" fill="#67e8f9" stroke="#0891b2" strokeWidth="1" className={`solar-body ${selectedBody.id === 'urano' ? 'active' : ''}`} />
                          {/* Eje inclinado retrógrado */}
                          <line x1={p.x - 14} y1={p.y - 2} x2={p.x + 14} y2={p.y + 2} stroke="rgba(255,255,255,0.7)" strokeWidth="1.2" strokeDasharray="2 2" />
                        </g>
                      );
                    })()}

                    {/* =======================================================
                        NEPTUNO: Gran Mancha Oscura y Tritón retrógrado
                       ======================================================= */}
                    {(() => {
                      const tritonRad = ((-angles.luna * 0.6) * Math.PI) / 180;
                      const tritonX = coordsNeptuno.x + 24 * Math.cos(tritonRad);
                      const tritonY = coordsNeptuno.y + 24 * Math.sin(tritonRad);

                      return (
                        <g onClick={() => handleSelectBody(CELESTIAL_DATA.neptuno)} style={{ cursor: 'pointer' }}>
                          {/* Órbita retrógrada de Tritón */}
                          <circle cx={coordsNeptuno.x} cy={coordsNeptuno.y} r="24" fill="none" stroke="rgba(255, 255, 255, 0.08)" strokeWidth="0.5" strokeDasharray="2 2" />
                          <circle cx={coordsNeptuno.x} cy={coordsNeptuno.y} r="20" fill="transparent" />
                          <circle cx={coordsNeptuno.x} cy={coordsNeptuno.y} r="10.5" fill="#2563eb" stroke="#1e3a8a" strokeWidth="1" className={`solar-body ${selectedBody.id === 'neptuno' ? 'active' : ''}`} />
                          {/* Gran Mancha Oscura */}
                          <ellipse cx={coordsNeptuno.x - 2} cy={coordsNeptuno.y + 2} rx="2.5" ry="1.4" fill="#0f172a" opacity="0.85" />
                          {/* Tritón */}
                          <circle cx={tritonX} cy={tritonY} r="1.9" fill="#e0e7ff">
                            <title>Tritón</title>
                          </circle>
                        </g>
                      );
                    })()}

                    {/* Anillo de Selección de Telemetría (Targeting Reticle) */}
                    {selectedBody.id !== 'sol' && selectedBody.type !== 'cinturon' && (() => {
                      let cx: number;
                      let cy: number;
                      if (selectedBody.id === 'jwst') { cx = coordsJWST.x; cy = coordsJWST.y; }
                      else if (selectedBody.id === 'parker') { cx = coordsParker.x; cy = coordsParker.y; }
                      else if (selectedBody.id === 'voyager1') { cx = coordsVoyager1.x; cy = coordsVoyager1.y; }
                      else { const c = getCoordinates(selectedBody.id); cx = c.x; cy = c.y; }

                      return (
                        <g className="targeting-reticle-group">
                          <circle cx={cx} cy={cy} r="26" fill="none" stroke="#38bdf8" strokeWidth="1.5" strokeDasharray="5 3" className="animated-target-ring" />
                          <line x1={cx - 32} y1={cy} x2={cx - 24} y2={cy} stroke="#38bdf8" strokeWidth="1.5" />
                          <line x1={cx + 24} y1={cy} x2={cx + 32} y2={cy} stroke="#38bdf8" strokeWidth="1.5" />
                          <line x1={cx} y1={cy - 32} x2={cx} y2={cy - 24} stroke="#38bdf8" strokeWidth="1.5" />
                          <line x1={cx} y1={cy + 24} x2={cx} y2={cy + 32} stroke="#38bdf8" strokeWidth="1.5" />
                        </g>
                      );
                    })()}

                  </g>
                </svg>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================
            PESTAÑA 2: ESCALAS & CALCULADORA DE VIAJE ESPACIAL
           ========================================================= */}
        {activeTab === 'scale' && (
          <div className="sim-dashboard animate-fade-in">
            <div className="scale-comparer-container">
              
              {/* MÓDULO INTERACTIVO DE TRÁNSITO SOLAR Y SILUETA A ESCALA REAL */}
              <div className="solar-transit-module-card">
                <div className="transit-header">
                  <span className="transit-badge">☀️ Tránsito y Comparación Proporcional Directa</span>
                  <h2 className="section-title">El Sol vs Silueta Planetaria a Escala Real</h2>
                  <p className="section-subtitle">
                    El disco del Sol (1,392,700 km) es la imagen de entrada base. Selecciona cualquier planeta o luna para superponer su silueta directamente frente al Sol a escala exacta de diámetro.
                  </p>
                </div>

                {/* Selector de Planetas para Tránsito */}
                <div className="transit-planet-selector-bar">
                  {[
                    { id: 'mercurio', name: 'Mercurio', icon: '☿' },
                    { id: 'venus', name: 'Venus', icon: '♀' },
                    { id: 'tierra', name: 'La Tierra', icon: '🌍' },
                    { id: 'luna', name: 'La Luna', icon: '🌙' },
                    { id: 'marte', name: 'Marte', icon: '♂' },
                    { id: 'jupiter', name: 'Júpiter', icon: '♃' },
                    { id: 'saturno', name: 'Saturno', icon: '♄' },
                    { id: 'urano', name: 'Urano', icon: '♅' },
                    { id: 'neptuno', name: 'Neptuno', icon: '♆' }
                  ].map((item) => (
                    <button
                      key={item.id}
                      className={`transit-planet-btn ${selectedScalePlanet === item.id ? 'active' : ''}`}
                      onClick={() => setSelectedScalePlanet(item.id)}
                    >
                      <span>{item.icon}</span> {item.name}
                    </button>
                  ))}
                </div>

                {/* Barra de Herramientas de Control de Tránsito */}
                <div className="transit-toolbar-row">
                  <div className="transit-controls-group">
                    <button 
                      className={`spectrum-btn ${isTransitAnimating ? 'active' : ''}`}
                      onClick={() => {
                        if (!isTransitAnimating) setTransitXOffset(-220);
                        setIsTransitAnimating(!isTransitAnimating);
                      }}
                    >
                      {isTransitAnimating ? '⏸ Detener Tránsito' : '▶ Simular Tránsito Astrofísico'}
                    </button>
                    <label className="toggle-chip">
                      <input type="checkbox" checked={showAllTransits} onChange={() => setShowAllTransits(!showAllTransits)} />
                      🌌 Ver Todos los Planetas en Tránsito
                    </label>
                  </div>

                  {/* Lupa Espacial Zoom Controls */}
                  <div className="transit-zoom-group">
                    <span className="hud-title">🔍 Lupa Espacial:</span>
                    {[1.0, 3.0, 8.0, 15.0].map((z) => (
                      <button 
                        key={z} 
                        className={`spectrum-btn ${scaleZoomLevel === z ? 'active' : ''}`}
                        onClick={() => setScaleZoomLevel(z)}
                      >
                        {z}x
                      </button>
                    ))}
                  </div>
                </div>

                {/* LIENZO SVG DEL DISCO SOLAR Y SILUETA EN TRÁNSITO */}
                <div className="solar-transit-viewport-box">
                  <svg viewBox="0 0 900 620" className="solar-transit-svg">
                    <defs>
                      {/* Sol: Gradiente fotosférico multicapa hiperrealista */}
                      <radialGradient id="grad-solar-photosphere" cx="50%" cy="50%" r="50%">
                        <stop offset="0%" stopColor="#fffef5" />
                        <stop offset="12%" stopColor="#fff9d4" />
                        <stop offset="28%" stopColor="#fde68a" />
                        <stop offset="45%" stopColor="#fbbf24" />
                        <stop offset="62%" stopColor="#f59e0b" />
                        <stop offset="78%" stopColor="#ea580c" />
                        <stop offset="90%" stopColor="#dc2626" />
                        <stop offset="100%" stopColor="#7f1d1d" />
                      </radialGradient>

                      {/* Corona Solar: halo exterior difuminado */}
                      <radialGradient id="grad-solar-corona" cx="50%" cy="50%" r="50%">
                        <stop offset="0%" stopColor="#fbbf24" stopOpacity="0" />
                        <stop offset="60%" stopColor="#fbbf24" stopOpacity="0" />
                        <stop offset="80%" stopColor="#f59e0b" stopOpacity="0.12" />
                        <stop offset="92%" stopColor="#ea580c" stopOpacity="0.06" />
                        <stop offset="100%" stopColor="#dc2626" stopOpacity="0" />
                      </radialGradient>

                      {/* Cromosfera: anillo rojo-rosado en el limbo */}
                      <radialGradient id="grad-chromosphere" cx="50%" cy="50%" r="50%">
                        <stop offset="93%" stopColor="transparent" />
                        <stop offset="96%" stopColor="#ef4444" stopOpacity="0.5" />
                        <stop offset="100%" stopColor="#dc2626" stopOpacity="0" />
                      </radialGradient>

                      {/* Filtro de resplandor suave para la corona */}
                      <filter id="corona-blur" x="-50%" y="-50%" width="200%" height="200%">
                        <feGaussianBlur stdDeviation="24" />
                      </filter>

                      {/* Filtro de resplandor del limbo */}
                      <filter id="limb-glow" x="-20%" y="-20%" width="140%" height="140%">
                        <feGaussianBlur stdDeviation="4" result="blur" />
                        <feComposite in="SourceGraphic" in2="blur" operator="over" />
                      </filter>

                      {/* Filtro de silueta planetaria */}
                      <filter id="planet-transit-shadow">
                        <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor="#38bdf8" floodOpacity="0.9" />
                      </filter>

                      {/* Textura de granulación solar (patrón fractal) */}
                      <filter id="solar-granulation" x="0%" y="0%" width="100%" height="100%">
                        <feTurbulence type="turbulence" baseFrequency="0.035" numOctaves="6" seed="42" result="noise" />
                        <feDisplacementMap in="SourceGraphic" in2="noise" scale="8" xChannelSelector="R" yChannelSelector="G" />
                      </filter>
                    </defs>

                    {/* Capa Escalable por la Lupa Espacial */}
                    <g transform={`translate(${450 - 450 * scaleZoomLevel}, ${310 - 310 * scaleZoomLevel}) scale(${scaleZoomLevel})`}>

                      {/* CAPA 1: Corona Solar Difusa Exterior */}
                      <circle cx="450" cy="310" r="290" fill="#fbbf24" opacity="0.08" filter="url(#corona-blur)" />
                      <circle cx="450" cy="310" r="268" fill="#f97316" opacity="0.06" filter="url(#corona-blur)" />

                      {/* CAPA 2: Disco Fotosférico Principal (r=240px = 1,392,700 km) */}
                      <circle cx="450" cy="310" r="240" fill="url(#grad-solar-photosphere)" filter="url(#solar-granulation)" />

                      {/* CAPA 3: Cromosfera - anillo rosado-rojo fino en el limbo */}
                      <circle cx="450" cy="310" r="240" fill="url(#grad-chromosphere)" />

                      {/* CAPA 4: Limbo Solar brillante (borde nítido) */}
                      <circle cx="450" cy="310" r="240" fill="none" stroke="#fde68a" strokeWidth="2" opacity="0.7" filter="url(#limb-glow)" />

                      {/* CAPA 5: Manchas solares realistas (umbra + penumbra) */}
                      <g opacity="0.75">
                        <ellipse cx="380" cy="250" rx="16" ry="10" fill="#78350f" />
                        <ellipse cx="380" cy="250" rx="9" ry="5" fill="#1c1917" />
                        <ellipse cx="510" cy="370" rx="20" ry="12" fill="#78350f" />
                        <ellipse cx="510" cy="370" rx="11" ry="6" fill="#1c1917" />
                        <ellipse cx="490" cy="220" rx="10" ry="7" fill="#78350f" />
                        <ellipse cx="490" cy="220" rx="5" ry="3" fill="#1c1917" />
                        <ellipse cx="420" cy="410" rx="8" ry="5" fill="#78350f" />
                        <ellipse cx="420" cy="410" rx="4" ry="2.5" fill="#1c1917" />
                      </g>

                      {/* CAPA 6: Prominencias y bucles coronales en los bordes */}
                      <g opacity="0.9">
                        {/* Prominencia superior grande (bucle coronal) */}
                        <path d="M 430 72 Q 415 30 440 18 Q 465 8 470 25 Q 462 45 455 72" fill="none" stroke="#ef4444" strokeWidth="3" opacity="0.8" />
                        <path d="M 435 70 Q 425 40 445 28 Q 460 20 458 42 Q 455 55 450 70" fill="#f97316" opacity="0.6" />
                        {/* Prominencia derecha */}
                        <path d="M 688 290 Q 715 270 725 290 Q 730 310 720 325 Q 710 340 690 330" fill="none" stroke="#ef4444" strokeWidth="2.5" opacity="0.8" />
                        <path d="M 688 295 Q 710 280 718 295 Q 722 310 715 320 Q 708 330 690 325" fill="#f97316" opacity="0.5" />
                        {/* Prominencia izquierda */}
                        <path d="M 212 280 Q 190 260 180 275 Q 175 295 185 310 Q 195 320 212 315" fill="none" stroke="#ef4444" strokeWidth="2.5" opacity="0.8" />
                        <path d="M 212 285 Q 195 270 188 282 Q 183 295 190 306 Q 197 315 212 310" fill="#f97316" opacity="0.5" />
                        {/* Prominencia inferior */}
                        <path d="M 460 548 Q 475 575 455 585 Q 435 580 440 560 Q 445 548 460 548" fill="#f97316" opacity="0.5" />
                      </g>

                      {/* TRÁNSITO: Silueta(s) Planetaria(s) frente al Sol */}
                      {showAllTransits ? (
                        <g>
                          {[
                            { id: 'jupiter', offset: -140 },
                            { id: 'saturno', offset: -70 },
                            { id: 'urano', offset: -20 },
                            { id: 'neptuno', offset: 20 },
                            { id: 'tierra', offset: 60 },
                            { id: 'venus', offset: 90 },
                            { id: 'marte', offset: 115 },
                            { id: 'mercurio', offset: 135 },
                            { id: 'luna', offset: 155 }
                          ].map((pItem) => {
                            const bData = SCALE_BODIES_DATA[pItem.id] || { diameterKm: 12742, color: '#3b82f6', name: pItem.id };
                            const rPx = Math.max(1.0, (240 * (bData.diameterKm / 1392700)));
                            const px = 450 + pItem.offset;
                            const py = 310;
                            return (
                              <g key={pItem.id}>
                                <circle cx={px} cy={py} r={rPx} fill="#020005" stroke={bData.color} strokeWidth="1" filter="url(#planet-transit-shadow)" />
                                <line x1={px} y1={py - rPx - 3} x2={px} y2={py - rPx - 20} stroke={bData.color} strokeWidth="0.8" />
                                <text x={px} y={py - rPx - 24} fill="#ffffff" fontSize="8" fontWeight="bold" textAnchor="middle">{bData.name}</text>
                              </g>
                            );
                          })}
                        </g>
                      ) : (
                        (() => {
                          const bData = SCALE_BODIES_DATA[selectedScalePlanet] || SCALE_BODIES_DATA.tierra;
                          const rPx = Math.max(1.0, (240 * (bData.diameterKm / 1392700)));
                          const px = 450 + transitXOffset;
                          const py = 310;

                          return (
                            <g className="single-planet-transit-group">
                              {/* Línea de Traza de Tránsito */}
                              <line x1="210" y1="310" x2="690" y2="310" stroke="rgba(255,255,255,0.15)" strokeWidth="0.8" strokeDasharray="6 4" />

                              {/* Anillos de Saturno */}
                              {bData.ring && (
                                <ellipse cx={px} cy={py} rx={rPx * 2.4} ry={rPx * 0.7} fill="none" stroke="rgba(224, 185, 116, 0.6)" strokeWidth="2" transform={`rotate(-15, ${px}, ${py})`} />
                              )}

                              {/* Silueta oscura del planeta */}
                              <circle cx={px} cy={py} r={rPx} fill="#020005" stroke={bData.color} strokeWidth="1.5" filter="url(#planet-transit-shadow)" />

                              {/* Puntero e Indicador de Texto */}
                              <g className="transit-pointer-callout">
                                <circle cx={px} cy={py} r={Math.max(rPx + 8, 14)} fill="none" stroke="#38bdf8" strokeWidth="0.8" strokeDasharray="3 2" />
                                <line x1={px} y1={py - Math.max(rPx + 8, 14)} x2={px} y2={py - 65} stroke="#38bdf8" strokeWidth="1" />
                                <line x1={px} y1={py - 65} x2={px + 50} y2={py - 65} stroke="#38bdf8" strokeWidth="1" />
                                <rect x={px + 50} y={py - 86} width="210" height="44" rx="8" fill="rgba(8, 3, 20, 0.92)" stroke="#38bdf8" strokeWidth="0.8" />
                                <text x={px + 62} y={py - 68} fill="#ffffff" fontSize="11" fontWeight="bold">{bData.name}</text>
                                <text x={px + 62} y={py - 52} fill="#38bdf8" fontSize="10">{bData.diameterKm.toLocaleString('es-GT')} km (r = {rPx.toFixed(2)}px)</text>
                              </g>
                            </g>
                          );
                        })()
                      )}

                    </g>
                  </svg>
                </div>

                {/* DASHBOARD DE MÉTRICAS Y DATOS DE COMPARACIÓN PROPORCIONAL */}
                {(() => {
                  const bData = SCALE_BODIES_DATA[selectedScalePlanet] || SCALE_BODIES_DATA.tierra;
                  const ratioWidth = (1392700 / bData.diameterKm).toFixed(1);
                  const ratioVolume = Math.round(Math.pow(1392700 / bData.diameterKm, 3)).toLocaleString('es-GT');
                  const pctSun = ((bData.diameterKm / 1392700) * 100).toFixed(3);

                  return (
                    <div className="transit-metrics-grid">
                      <div className="metric-card highlight-cyan">
                        <span className="m-icon">📏</span>
                        <span className="m-label">Diámetro Comparado</span>
                        <span className="m-value">1 / {ratioWidth}</span>
                        <p className="m-desc">El Sol es <strong>{ratioWidth} veces</strong> más ancho que {bData.name}.</p>
                      </div>

                      <div className="metric-card highlight-purple">
                        <span className="m-icon">🔮</span>
                        <span className="m-label">Volumen Equivalente</span>
                        <span className="m-value">{ratioVolume}</span>
                        <p className="m-desc">Cabrían <strong>{ratioVolume}</strong> cuerpos como {bData.name} dentro del Sol.</p>
                      </div>

                      <div className="metric-card highlight-yellow">
                        <span className="m-icon">📊</span>
                        <span className="m-label">Porcentaje del Disco Solar</span>
                        <span className="m-value">{pctSun}%</span>
                        <p className="m-desc">{bData.name} abarca solo el <strong>{pctSun}%</strong> del diámetro del Sol.</p>
                      </div>
                    </div>
                  );
                })()}

                {/* CURVA DE LUZ FOTOMÉTRICA EN TIEMPO REAL (MÉTODO DE TRÁNSITOS) */}
                {(() => {
                  const bData = SCALE_BODIES_DATA[selectedScalePlanet] || SCALE_BODIES_DATA.tierra;
                  const dipPercent = Math.pow(bData.diameterKm / 1392700, 2) * 100;
                  const dipPpm = Math.round(dipPercent * 10000);
                  const isPlanetInTransit = Math.abs(transitXOffset) < 240;
                  let currentDrop = 0;
                  if (isPlanetInTransit) {
                    const ingressDist = Math.abs(Math.abs(transitXOffset) - 240);
                    const ingressFactor = Math.min(1, ingressDist / 30);
                    currentDrop = dipPercent * ingressFactor;
                  }
                  const currentFlux = (100 - currentDrop).toFixed(4);

                  return (
                    <div className="photometric-light-curve-card" style={{ marginTop: '20px' }}>
                      <div className="light-curve-header">
                        <div>
                          <span className="transit-badge">📉 Astrofísica Observacional</span>
                          <h3 style={{ margin: '6px 0 2px 0', fontSize: '1.1rem', color: '#38bdf8' }}>
                            Curva de Luz Fotométrica (Detección por Tránsitos Kepler / TESS / JWST)
                          </h3>
                          <p style={{ margin: 0, fontSize: '0.84rem', color: '#94a3b8' }}>
                            Cuando {bData.name} cruza el disco solar, bloquea una fracción minúscula de luz: 
                            <strong style={{ color: '#f59e0b' }}> ΔF/F = (R_p / R_★)² = {dipPercent.toFixed(4)}% ({dipPpm.toLocaleString('es-GT')} ppm)</strong>.
                          </p>
                        </div>
                        <div className="flux-badge-box">
                          <span style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase' }}>Flujo Estelar en Vivo:</span>
                          <span className="flux-numeric-val" style={{ fontSize: '1.3rem', fontWeight: 800, color: isPlanetInTransit ? '#ef4444' : '#10b981' }}>
                            {currentFlux}%
                          </span>
                        </div>
                      </div>

                      {/* Gráfica SVG de Curva de Luz */}
                      <div className="light-curve-svg-box">
                        <svg viewBox="0 0 800 130" className="light-curve-svg">
                          <defs>
                            <linearGradient id="curve-fill-grad" x1="0%" y1="0%" x2="0%" y2="100%">
                              <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.25" />
                              <stop offset="100%" stopColor="#38bdf8" stopOpacity="0" />
                            </linearGradient>
                          </defs>

                          {/* Eje Y: 100% y fondo */}
                          <line x1="60" y1="20" x2="780" y2="20" stroke="rgba(255,255,255,0.15)" strokeWidth="1" strokeDasharray="3 3" />
                          <text x="50" y="24" fill="#94a3b8" fontSize="10" textAnchor="end">100.00%</text>

                          {/* Eje Y: Caída mínima */}
                          <line x1="60" y1="90" x2="780" y2="90" stroke="rgba(239, 68, 68, 0.2)" strokeWidth="1" strokeDasharray="3 3" />
                          <text x="50" y="94" fill="#ef4444" fontSize="10" textAnchor="end">{(100 - dipPercent).toFixed(3)}%</text>

                          {/* Curva u-shape fotométrica */}
                          <path 
                            d="M 60 20 L 260 20 C 290 20, 310 90, 340 90 L 500 90 C 530 90, 550 20, 580 20 L 780 20" 
                            fill="none" 
                            stroke="#38bdf8" 
                            strokeWidth="2.5" 
                          />
                          <path 
                            d="M 60 20 L 260 20 C 290 20, 310 90, 340 90 L 500 90 C 530 90, 550 20, 580 20 L 780 20 L 780 120 L 60 120 Z" 
                            fill="url(#curve-fill-grad)" 
                          />

                          {/* Marcador de tiempo del tránsito actual */}
                          {(() => {
                            const markerX = 420 + (transitXOffset / 240) * 220;
                            const markerY = isPlanetInTransit ? 90 : 20;
                            return (
                              <g>
                                <line x1={markerX} y1="10" x2={markerX} y2="110" stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="4 2" />
                                <circle cx={markerX} cy={markerY} r="5" fill="#f59e0b" stroke="#ffffff" strokeWidth="1.5" />
                                <text x={markerX} y="125" fill="#f59e0b" fontSize="9" fontWeight="bold" textAnchor="middle">
                                  {isPlanetInTransit ? '¡Tránsito en Curso!' : 'Fuera del Disco'}
                                </text>
                              </g>
                            );
                          })()}
                        </svg>
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* Comparador Visual Gráfico Secundario de Filas Lado a Lado (km) */}
              <div className="real-size-scale-card" style={{ marginTop: '24px' }}>
                <h3>🪐 Escala Planetaria Relativa Lado a Lado (km)</h3>
                <p>Demostración en escala continua donde los 8 planetas se colocan en fila directa frente al limbo del Sol:</p>
                <div className="scale-svg-wrapper">
                  <svg viewBox="0 0 920 200" className="scale-planets-svg" style={{ height: '200px' }}>
                    <defs>
                      {/* Sol: gradiente realista para sección lateral */}
                      <radialGradient id="grad-sol-side" cx="50%" cy="50%" r="50%">
                        <stop offset="0%" stopColor="#fffef5" />
                        <stop offset="15%" stopColor="#fff9d4" />
                        <stop offset="35%" stopColor="#fde68a" />
                        <stop offset="55%" stopColor="#fbbf24" />
                        <stop offset="72%" stopColor="#ea580c" />
                        <stop offset="88%" stopColor="#dc2626" />
                        <stop offset="100%" stopColor="#7f1d1d" />
                      </radialGradient>

                      {/* Granulación solar textura */}
                      <filter id="granulation-side" x="0%" y="0%" width="100%" height="100%">
                        <feTurbulence type="turbulence" baseFrequency="0.04" numOctaves="5" seed="7" result="noise" />
                        <feDisplacementMap in="SourceGraphic" in2="noise" scale="6" xChannelSelector="R" yChannelSelector="G" />
                      </filter>

                      {/* Filtro de resplandor suave para el limbo */}
                      <filter id="side-limb-glow" x="-10%" y="-10%" width="120%" height="120%">
                        <feGaussianBlur stdDeviation="3" result="blur" />
                        <feComposite in="SourceGraphic" in2="blur" operator="over" />
                      </filter>

                      {/* Júpiter multicapa */}
                      <radialGradient id="gj" cx="38%" cy="38%" r="62%">
                        <stop offset="0%" stopColor="#fef3c7" />
                        <stop offset="20%" stopColor="#fbbf24" />
                        <stop offset="45%" stopColor="#d97706" />
                        <stop offset="70%" stopColor="#b45309" />
                        <stop offset="100%" stopColor="#451a03" />
                      </radialGradient>

                      {/* Saturno */}
                      <radialGradient id="gs" cx="38%" cy="38%" r="62%">
                        <stop offset="0%" stopColor="#fef9c3" />
                        <stop offset="30%" stopColor="#fde68a" />
                        <stop offset="60%" stopColor="#e0b974" />
                        <stop offset="100%" stopColor="#78350f" />
                      </radialGradient>

                      {/* Tierra */}
                      <radialGradient id="ge" cx="35%" cy="35%" r="65%">
                        <stop offset="0%" stopColor="#bfdbfe" />
                        <stop offset="25%" stopColor="#60a5fa" />
                        <stop offset="50%" stopColor="#3b82f6" />
                        <stop offset="80%" stopColor="#1d4ed8" />
                        <stop offset="100%" stopColor="#0c1a3d" />
                      </radialGradient>

                      {/* Venus */}
                      <radialGradient id="gv" cx="38%" cy="38%" r="62%">
                        <stop offset="0%" stopColor="#fef9c3" />
                        <stop offset="40%" stopColor="#f5c574" />
                        <stop offset="75%" stopColor="#c2884d" />
                        <stop offset="100%" stopColor="#5c3317" />
                      </radialGradient>

                      {/* Marte */}
                      <radialGradient id="gm" cx="35%" cy="35%" r="65%">
                        <stop offset="0%" stopColor="#fca5a5" />
                        <stop offset="35%" stopColor="#ef4444" />
                        <stop offset="65%" stopColor="#b91c1c" />
                        <stop offset="100%" stopColor="#450a0a" />
                      </radialGradient>

                      {/* Urano */}
                      <radialGradient id="gu" cx="35%" cy="35%" r="65%">
                        <stop offset="0%" stopColor="#e0f7fa" />
                        <stop offset="40%" stopColor="#67e8f9" />
                        <stop offset="70%" stopColor="#06b6d4" />
                        <stop offset="100%" stopColor="#164e63" />
                      </radialGradient>

                      {/* Neptuno */}
                      <radialGradient id="gn" cx="35%" cy="35%" r="65%">
                        <stop offset="0%" stopColor="#a5b4fc" />
                        <stop offset="35%" stopColor="#6366f1" />
                        <stop offset="65%" stopColor="#3730a3" />
                        <stop offset="100%" stopColor="#1e1b4b" />
                      </radialGradient>

                      {/* Mercurio */}
                      <radialGradient id="gme" cx="38%" cy="38%" r="62%">
                        <stop offset="0%" stopColor="#d1d5db" />
                        <stop offset="40%" stopColor="#9ca3af" />
                        <stop offset="75%" stopColor="#6b7280" />
                        <stop offset="100%" stopColor="#1f2937" />
                      </radialGradient>
                    </defs>

                    {/* ===== SOL: Arco con borde visible, prominencias y granulación ===== */}
                    <g>
                      {/* Halo de corona difusa */}
                      <circle cx="-180" cy="100" r="320" fill="#fbbf24" opacity="0.06" filter="url(#side-limb-glow)" />
                      {/* Disco fotosférico con granulación */}
                      <circle cx="-180" cy="100" r="300" fill="url(#grad-sol-side)" filter="url(#granulation-side)" />
                      {/* Cromosfera roja en el limbo */}
                      <path d="M 120 -10 A 300 300 0 0 1 120 210" fill="none" stroke="#ef4444" strokeWidth="3" opacity="0.5" />
                      {/* Limbo Solar brillante y nítido */}
                      <path d="M 120 -10 A 300 300 0 0 1 120 210" fill="none" stroke="#fde68a" strokeWidth="4" opacity="0.8" filter="url(#side-limb-glow)" />
                      {/* Manchas solares en el limbo visible */}
                      <ellipse cx="60" cy="55" rx="8" ry="5" fill="#78350f" opacity="0.6" />
                      <ellipse cx="60" cy="55" rx="4" ry="2.5" fill="#1c1917" opacity="0.6" />
                      <ellipse cx="80" cy="130" rx="6" ry="4" fill="#78350f" opacity="0.5" />
                      {/* Prominencias en la curva del borde */}
                      <path d="M 121 35 Q 138 18 130 8 Q 118 15 121 35" fill="#f97316" opacity="0.8" />
                      <path d="M 120 155 Q 140 148 135 138 Q 120 142 120 155" fill="#f97316" opacity="0.7" />
                      <path d="M 122 75 Q 133 65 128 58 Q 120 63 122 75" fill="#ea580c" opacity="0.6" />
                      {/* Etiqueta del Sol */}
                      <rect x="8" y="78" width="104" height="40" rx="8" fill="rgba(8, 3, 20, 0.88)" stroke="#fbbf24" strokeWidth="1" />
                      <text x="60" y="103" fill="#fef3c7" fontSize="11" fontWeight="bold" textAnchor="middle">El Sol (1,392,700 km)</text>
                    </g>

                    {/* ===== JÚPITER: Bandas atmosféricas + Gran Mancha Roja ===== */}
                    <g transform="translate(260, 100)">
                      <circle cx="0" cy="0" r="48" fill="url(#gj)" />
                      {/* Bandas de nubes: Zona Ecuatorial + Templadas */}
                      <ellipse cx="0" cy="-20" rx="47" ry="8" fill="#92400e" opacity="0.35" />
                      <ellipse cx="0" cy="-6" rx="47" ry="6" fill="#fbbf24" opacity="0.2" />
                      <ellipse cx="0" cy="8" rx="47" ry="7" fill="#78350f" opacity="0.3" />
                      <ellipse cx="0" cy="22" rx="46" ry="6" fill="#92400e" opacity="0.25" />
                      <ellipse cx="0" cy="35" rx="44" ry="5" fill="#451a03" opacity="0.3" />
                      {/* Gran Mancha Roja */}
                      <ellipse cx="16" cy="14" rx="12" ry="7" fill="#dc2626" opacity="0.8" />
                      <ellipse cx="16" cy="14" rx="8" ry="4" fill="#ef4444" opacity="0.5" />
                      <text x="0" y="68" fill="#fbbf24" fontSize="11" fontWeight="bold" textAnchor="middle">Júpiter (139,820 km)</text>
                    </g>

                    {/* ===== SATURNO: Anillos multicapa + Bandas atmosféricas ===== */}
                    <g transform="translate(420, 100)">
                      {/* Sistema de anillos: A, B, División de Cassini, C */}
                      <ellipse cx="0" cy="0" rx="72" ry="18" fill="none" stroke="rgba(180, 140, 80, 0.25)" strokeWidth="10" transform="rotate(-18)" />
                      <ellipse cx="0" cy="0" rx="65" ry="15" fill="none" stroke="#d4a34a" strokeWidth="5" transform="rotate(-18)" />
                      <ellipse cx="0" cy="0" rx="58" ry="12" fill="none" stroke="rgba(120, 80, 30, 0.15)" strokeWidth="2" transform="rotate(-18)" />
                      <ellipse cx="0" cy="0" rx="52" ry="10" fill="none" stroke="rgba(200, 160, 100, 0.3)" strokeWidth="4" transform="rotate(-18)" />
                      {/* Esfera */}
                      <circle cx="0" cy="0" r="40" fill="url(#gs)" />
                      {/* Bandas tenues */}
                      <ellipse cx="0" cy="-12" rx="39" ry="5" fill="#b45309" opacity="0.2" />
                      <ellipse cx="0" cy="5" rx="39" ry="4" fill="#78350f" opacity="0.15" />
                      <ellipse cx="0" cy="18" rx="38" ry="4" fill="#92400e" opacity="0.18" />
                      <text x="0" y="62" fill="#e0b974" fontSize="11" fontWeight="bold" textAnchor="middle">Saturno (116,460 km)</text>
                    </g>

                    {/* ===== URANO: Esfera helada + anillo vertical ===== */}
                    <g transform="translate(545, 100)">
                      <circle cx="0" cy="0" r="17" fill="url(#gu)" />
                      {/* Bandas atmosféricas tenues */}
                      <ellipse cx="0" cy="-5" rx="16" ry="3" fill="#164e63" opacity="0.25" />
                      <ellipse cx="0" cy="6" rx="16" ry="2" fill="#0e7490" opacity="0.2" />
                      {/* Anillo vertical (inclinación axial 98°) */}
                      <ellipse cx="0" cy="0" rx="2" ry="24" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" />
                      <text x="0" y="36" fill="#22d3ee" fontSize="10" fontWeight="bold" textAnchor="middle">Urano</text>
                    </g>

                    {/* ===== NEPTUNO: Azul profundo + Gran Mancha Oscura ===== */}
                    <g transform="translate(620, 100)">
                      <circle cx="0" cy="0" r="16" fill="url(#gn)" />
                      {/* Bandas de viento */}
                      <ellipse cx="0" cy="-4" rx="15" ry="3" fill="#312e81" opacity="0.4" />
                      <ellipse cx="0" cy="6" rx="15" ry="2" fill="#1e1b4b" opacity="0.35" />
                      {/* Gran Mancha Oscura */}
                      <ellipse cx="-4" cy="-2" rx="5" ry="3" fill="#0f172a" opacity="0.7" />
                      <text x="0" y="35" fill="#818cf8" fontSize="10" fontWeight="bold" textAnchor="middle">Neptuno</text>
                    </g>

                    {/* ===== TIERRA: Océanos, continentes, atmósfera ===== */}
                    <g transform="translate(695, 100)">
                      {/* Halo atmosférico */}
                      <circle cx="0" cy="0" r="7" fill="none" stroke="#38bdf8" strokeWidth="1" opacity="0.5" />
                      <circle cx="0" cy="0" r="5.5" fill="url(#ge)" />
                      {/* Continente simplificado */}
                      <ellipse cx="-1" cy="-1" rx="2" ry="1.5" fill="#166534" opacity="0.6" />
                      <ellipse cx="2" cy="1" rx="1" ry="0.8" fill="#166534" opacity="0.5" />
                      <text x="0" y="24" fill="#93c5fd" fontSize="10" fontWeight="bold" textAnchor="middle">Tierra</text>
                    </g>

                    {/* ===== VENUS: Atmósfera densa amarillenta ===== */}
                    <g transform="translate(745, 100)">
                      {/* Halo atmosférico denso */}
                      <circle cx="0" cy="0" r="6.5" fill="none" stroke="#f5c574" strokeWidth="0.8" opacity="0.45" />
                      <circle cx="0" cy="0" r="5.2" fill="url(#gv)" />
                      {/* Nubes de ácido sulfúrico */}
                      <ellipse cx="0" cy="0" rx="4" ry="1.5" fill="#fef3c7" opacity="0.2" />
                      <text x="0" y="24" fill="#fdba74" fontSize="10" fontWeight="bold" textAnchor="middle">Venus</text>
                    </g>

                    {/* ===== MARTE: Rojo oxidado + casquete polar ===== */}
                    <g transform="translate(795, 100)">
                      <circle cx="0" cy="0" r="3" fill="url(#gm)" />
                      {/* Casquete polar norte */}
                      <path d="M -1.5 -2.5 Q 0 -3.2 1.5 -2.5 Q 0 -2 -1.5 -2.5" fill="#ffffff" opacity="0.85" />
                      {/* Valles Marineris tenue */}
                      <line x1="-1.5" y1="0.5" x2="1.5" y2="-0.3" stroke="#450a0a" strokeWidth="0.4" opacity="0.5" />
                      <text x="0" y="22" fill="#fca5a5" fontSize="9" textAnchor="middle">Marte</text>
                    </g>

                    {/* ===== MERCURIO: Gris craterizado ===== */}
                    <g transform="translate(840, 100)">
                      <circle cx="0" cy="0" r="2.1" fill="url(#gme)" />
                      {/* Cráteres minúsculos */}
                      <circle cx="0.5" cy="-0.5" r="0.4" fill="#374151" opacity="0.6" />
                      <circle cx="-0.5" cy="0.6" r="0.3" fill="#374151" opacity="0.5" />
                      <text x="0" y="22" fill="#d1d5db" fontSize="9" textAnchor="middle">Mercurio</text>
                    </g>
                  </svg>
                </div>
              </div>

              <h2 className="section-title" style={{ marginTop: '30px' }}>📏 Calculadora de Tiempo de Viaje Interplanetario</h2>
              <p className="section-subtitle">
                Selecciona un destino y un vehículo de exploración para calcular exactamente cuánto tiempo tardarías en llegar desde la Tierra.
              </p>

              <div className="travel-calculator-card">
                <div className="calc-inputs-grid">
                  <div className="calc-group">
                    <label>📍 Destino del Viaje Espacial:</label>
                    <select 
                      value={travelDestination}
                      onChange={(e) => setTravelDestination(e.target.value)}
                      className="calc-select"
                    >
                      <option value="sol">☀️ El Sol (149.6 millones de km)</option>
                      <option value="mercurio">☿ Mercurio (91.7 millones de km)</option>
                      <option value="venus">♀ Venus (41.4 millones de km)</option>
                      <option value="marte">♂ Marte (78.3 millones de km)</option>
                      <option value="jupiter">♃ Júpiter (628.7 millones de km)</option>
                      <option value="saturno">♄ Saturno (1,275 millones de km)</option>
                      <option value="neptuno">♆ Neptuno (4,347 millones de km)</option>
                      <option value="voyager1">🛰️ Sonda Voyager 1 (24,300 millones de km)</option>
                    </select>
                  </div>

                  <div className="calc-group">
                    <label>🚀 Vehículo / Velocidad de Transporte:</label>
                    <select 
                      value={travelVehicleSpeed}
                      onChange={(e) => setTravelVehicleSpeed(parseFloat(e.target.value))}
                      className="calc-select"
                    >
                      {SPEED_PRESETS.map((v) => (
                        <option key={v.id} value={v.speedKmH}>{v.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Resultados del Cálculo */}
                <div className="calc-results-banner">
                  <div className="result-stat-box">
                    <span className="res-label">Distancia Estimada</span>
                    <span className="res-val">{distanceKm.toLocaleString('es-GT', { maximumFractionDigits: 0 })} km</span>
                  </div>
                  <div className="result-stat-box highlight">
                    <span className="res-label">Tiempo en Horas</span>
                    <span className="res-val">{travelHours.toLocaleString('es-GT', { maximumFractionDigits: 1 })} h</span>
                  </div>
                  <div className="result-stat-box highlight">
                    <span className="res-label">Tiempo en Días</span>
                    <span className="res-val">{travelDays.toLocaleString('es-GT', { maximumFractionDigits: 1 })} días</span>
                  </div>
                  <div className="result-stat-box highlight">
                    <span className="res-label">Tiempo en Años</span>
                    <span className="res-val">{travelYears.toLocaleString('es-GT', { maximumFractionDigits: 2 })} años</span>
                  </div>
                </div>

                {/* GRÁFICA VISUAL DE TRAYECTORIA Y COMPARACIÓN DE DISTANCIA INTERPLANETARIA */}
                <div className="travel-chart-container">
                  <div className="travel-chart-header">
                    <h4>🚀 Gráfica de Trayectoria Espacial y Comparación Logarítmica</h4>
                    <p className="travel-chart-subtitle">
                      Demostración gráfica de la trayectoria entre la Tierra y <strong>{destData.name}</strong> ({distanceKm.toLocaleString('es-GT', { maximumFractionDigits: 0 })} km)
                    </p>
                  </div>

                  {/* LIENZO SVG DE TRAYECTORIA ESPACIAL DE VUELO */}
                  <div className="travel-svg-wrapper">
                    <svg viewBox="0 0 850 160" className="travel-trajectory-svg">
                      <defs>
                        <linearGradient id="travel-beam-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.9" />
                          <stop offset="50%" stopColor="#38bdf8" stopOpacity="0.8" />
                          <stop offset="100%" stopColor="#fbbf24" stopOpacity="0.9" />
                        </linearGradient>
                        <filter id="rocket-glow">
                          <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor="#38bdf8" floodOpacity="0.9" />
                        </filter>
                      </defs>

                      {/* Origen: PLANETA TIERRA */}
                      <g transform="translate(90, 75)">
                        <circle cx="0" cy="0" r="28" fill="url(#ge)" />
                        <circle cx="0" cy="0" r="32" fill="none" stroke="#38bdf8" strokeWidth="1" strokeDasharray="3 2" />
                        <text x="0" y="48" fill="#93c5fd" fontSize="12" fontWeight="bold" textAnchor="middle">Tierra (Origen)</text>
                        <text x="0" y="62" fill="rgba(255,255,255,0.6)" fontSize="9" textAnchor="middle">0 UA</text>
                      </g>

                      {/* Trayectoria Curva de Transferencia de Hohmann */}
                      <path
                        d="M 122 75 Q 430 15 738 75"
                        fill="none"
                        stroke="rgba(255,255,255,0.15)"
                        strokeWidth="2"
                        strokeDasharray="6 4"
                      />
                      <path
                        d="M 122 75 Q 430 15 738 75"
                        fill="none"
                        stroke="url(#travel-beam-grad)"
                        strokeWidth="3"
                        strokeDasharray="12 6"
                        className="animated-trajectory-beam"
                      />

                      {/* Vehículo en Vuelo (🚀 / 🚆 / ✈️ / ⚡) */}
                      <g transform="translate(430, 42)">
                        <circle cx="0" cy="0" r="18" fill="rgba(13, 6, 28, 0.9)" stroke="#38bdf8" strokeWidth="1.5" filter="url(#rocket-glow)" />
                        <text x="0" y="5" fontSize="14" textAnchor="middle">
                          {travelVehicleSpeed >= 1080000000 ? '⚡' : travelVehicleSpeed >= 40000 ? '🚀' : travelVehicleSpeed >= 900 ? '✈️' : '🚆'}
                        </text>
                        <rect x="-65" y="-36" width="130" height="22" rx="6" fill="rgba(8, 3, 20, 0.9)" stroke="#38bdf8" strokeWidth="0.8" />
                        <text x="0" y="-22" fill="#38bdf8" fontSize="10" fontWeight="bold" textAnchor="middle">
                          {travelVehicleSpeed.toLocaleString('es-GT')} km/h
                        </text>
                      </g>

                      {/* Destino Seleccionado */}
                      <g transform="translate(760, 75)">
                        <circle cx="0" cy="0" r="30" fill="url(#grad-solar-photosphere)" />
                        <circle cx="0" cy="0" r="34" fill="none" stroke="#fbbf24" strokeWidth="1.2" strokeDasharray="4 3" />
                        <text x="0" y="48" fill="#fbbf24" fontSize="12" fontWeight="bold" textAnchor="middle">{destData.name}</text>
                        <text x="0" y="62" fill="rgba(255,255,255,0.7)" fontSize="9" textAnchor="middle">
                          {destData.distanceAU ? `${destData.distanceAU} UA` : 'Interespacial'}
                        </text>
                      </g>
                    </svg>
                  </div>

                  {/* BARRA DE COMPARACIÓN RELATIVA DE DISTANCIAS A TODOS LOS DESTINOS */}
                  <div className="distance-bars-container">
                    <h5 className="distance-bars-title">📊 Escala Relativa de Distancia Interplanetaria desde la Tierra:</h5>
                    {[
                      { id: 'venus', name: 'Venus', distAU: 0.28, label: '41.4M km' },
                      { id: 'marte', name: 'Marte', distAU: 0.52, label: '78.3M km' },
                      { id: 'mercurio', name: 'Mercurio', distAU: 0.61, label: '91.7M km' },
                      { id: 'sol', name: 'El Sol', distAU: 1.00, label: '149.6M km' },
                      { id: 'jupiter', name: 'Júpiter', distAU: 4.20, label: '628.7M km' },
                      { id: 'saturno', name: 'Saturno', distAU: 8.52, label: '1,275M km' },
                      { id: 'neptuno', name: 'Neptuno', distAU: 29.05, label: '4,347M km' },
                      { id: 'voyager1', name: 'Voyager 1', distAU: 162.0, label: '24,300M km' }
                    ].map((item) => {
                      const isSelected = travelDestination === item.id;
                      const barPct = Math.min(100, Math.max(8, Math.log10(item.distAU * 10 + 1) * 32));
                      const hours = (item.distAU * 149597870.7) / travelVehicleSpeed;
                      const days = hours / 24;
                      const years = days / 365.25;
                      const timeStr = years >= 1 ? `${years.toFixed(1)} años` : days >= 1 ? `${days.toFixed(0)} días` : `${hours.toFixed(0)}h`;

                      return (
                        <div key={item.id} className={`dist-bar-row ${isSelected ? 'active' : ''}`}>
                          <span className="dist-name">{item.name}</span>
                          <div className="dist-bar-track">
                            <div className="dist-bar-fill" style={{ width: `${barPct}%` }}>
                              <span className="dist-val-inside">{item.label}</span>
                            </div>
                          </div>
                          <span className="dist-time-badge">{timeStr}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================
            PESTAÑA 3: ESPECTROSCOPÍA ATMOSFÉRICA
           ========================================================= */}
        {activeTab === 'spectroscopy' && (
          <div className="sim-dashboard animate-fade-in">
            <div className="spectroscopy-container">
              <div className="spectro-title-block">
                <h2 className="section-title">🔬 Laboratorio de Espectroscopía & Química Planetaria</h2>
                <p className="section-subtitle">
                  La espectroscopía analiza el "código de barras" de la luz electromagnética que atraviesa las atmósferas de los mundos para descifrar sus gases y buscar biofirmas.
                </p>
              </div>

              {/* Pestañas Secundarias de Espectroscopía */}
              <div className="spectro-subnav-bar">
                <button 
                  className={`spectro-subnav-btn ${activeSpectroSection === 'analyzer' ? 'active' : ''}`}
                  onClick={() => {
                    setActiveSpectroSection('analyzer');
                    soundEffects.playClick();
                  }}
                >
                  🌈 Analizador Espectral en Vivo
                </button>
                <button 
                  className={`spectro-subnav-btn ${activeSpectroSection === 'instruments' ? 'active' : ''}`}
                  onClick={() => {
                    setActiveSpectroSection('instruments');
                    soundEffects.playClick();
                  }}
                >
                  🛰️ Instrumentos Espaciales
                </button>
                <button 
                  className={`spectro-subnav-btn ${activeSpectroSection === 'learning' ? 'active' : ''}`}
                  onClick={() => {
                    setActiveSpectroSection('learning');
                    soundEffects.playClick();
                  }}
                >
                  🎓 Guía Didáctica & Referencias
                </button>
              </div>

              {/* SECCIÓN 1: ANALIZADOR ESPECTRAL INTERACTIVO */}
              {activeSpectroSection === 'analyzer' && (() => {
                const body = CELESTIAL_DATA[selectedSpectroBody] || CELESTIAL_DATA['tierra'];
                const photonInfo = wavelengthToColor(activeWavelength);
                const photonPhysics = calculatePhotonPhysics(activeWavelength);
                const spectrumPercent = Math.max(0, Math.min(100, ((activeWavelength - 380) / (1100 - 380)) * 100));

                // Buscar si la longitud de onda coincide con una banda de absorción del cuerpo celeste actual
                const detectedAbsorption = ABSORPTION_BANDS.find(band => 
                  band.bodies.includes(selectedSpectroBody) && 
                  Math.abs(band.wavelengthNm - activeWavelength) <= band.tolerance
                );

                return (
                  <div className="spectro-main-panel">
                    {/* Selector de Planetas con Atmósfera */}
                    <div className="spectro-planet-bar-wrapper">
                      <div className="spectro-selector-row">
                        {['tierra', 'marte', 'venus', 'jupiter', 'saturno', 'urano', 'neptuno', 'sol'].map((id) => {
                          const item = CELESTIAL_DATA[id];
                          if (!item) return null;
                          return (
                            <button 
                              key={id}
                              className={`spectro-planet-chip ${selectedSpectroBody === id ? 'active' : ''}`}
                              onClick={() => {
                                setSelectedSpectroBody(id);
                                soundEffects.playClick();
                              }}
                            >
                              {item.name}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="spectro-details-card">
                      {/* Cabecera del Astro */}
                      <div className="spectro-header">
                        <div className="spectro-header-info">
                          <h3>🧪 Espectro de Transmisión de {body.name}</h3>
                          <span className="spectro-type-badge">{body.type.replace('_', ' ')}</span>
                        </div>
                        <div className="spectro-gases-pill-list">
                          {body.atmosphere?.map((gas, i) => (
                            <span key={i} className="gas-summary-tag" style={{ borderColor: gas.color }}>
                              <span className="gas-dot" style={{ backgroundColor: gas.color }}></span>
                              {gas.gas}: <strong>{gas.percent}%</strong>
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Control Interactivo de Longitud de Onda */}
                      <div className="spectro-wavelength-slider-card">
                        <div className="wavelength-slider-header">
                          <div className="wl-label-group">
                            <span className="wl-title">Longitud de Onda Analizada:</span>
                            <span className="wl-val-badge" style={{ backgroundColor: photonInfo.hex, color: photonInfo.isVisible && activeWavelength > 520 && activeWavelength < 620 ? '#000' : '#fff' }}>
                              {activeWavelength} nm
                            </span>
                          </div>
                          <div className="wl-steppers">
                            <button 
                              className="wl-step-btn" 
                              onClick={() => setActiveWavelength(prev => Math.max(380, prev - 5))}
                              title="Disminuir 5 nm"
                            >
                              -5 nm
                            </button>
                            <button 
                              className="wl-step-btn" 
                              onClick={() => setActiveWavelength(prev => Math.min(1100, prev + 5))}
                              title="Aumentar 5 nm"
                            >
                              +5 nm
                            </button>
                          </div>
                        </div>

                        {/* Slider de Nanómetros */}
                        <div className="range-slider-touch-box">
                          <input 
                            type="range" 
                            min="380" 
                            max="1100" 
                            step="5"
                            value={activeWavelength}
                            onChange={(e) => setActiveWavelength(parseInt(e.target.value))}
                            className="wavelength-range"
                            style={{
                              accentColor: photonInfo.hex
                            }}
                          />
                        </div>

                        {/* Escala Guía */}
                        <div className="wavelength-ticks">
                          <span>380 nm (UV/Violeta)</span>
                          <span>550 nm (Verde Óptico)</span>
                          <span>750 nm (Límite Rojo)</span>
                          <span>1100 nm (Infrarrojo Cercano)</span>
                        </div>

                        {/* Métricas Cuánticas y Físicas del Fotón */}
                        <div className="photon-physics-grid">
                          <div className="photon-metric-item">
                            <span className="metric-icon" style={{ color: photonInfo.hex }}>●</span>
                            <div>
                              <span className="metric-label">Región Espectral</span>
                              <strong className="metric-val">{photonInfo.name}</strong>
                            </div>
                          </div>
                          <div className="photon-metric-item">
                            <span className="metric-icon">⚡</span>
                            <div>
                              <span className="metric-label">Energía del Fotón</span>
                              <strong className="metric-val">{photonPhysics.energyEV} eV</strong>
                            </div>
                          </div>
                          <div className="photon-metric-item">
                            <span className="metric-icon">📡</span>
                            <div>
                              <span className="metric-label">Frecuencia Óptica</span>
                              <strong className="metric-val">{photonPhysics.freqTHz} THz</strong>
                            </div>
                          </div>
                        </div>

                        {/* Presets de Bandas Famosas */}
                        <div className="spectro-presets-box">
                          <span className="presets-caption">🎯 Bandas Clave de la Astrofísica:</span>
                          <div className="presets-chips-row">
                            {SPECTRO_PRESETS.map((p) => (
                              <button
                                key={p.nm}
                                className={`preset-chip ${activeWavelength === p.nm ? 'active' : ''}`}
                                onClick={() => {
                                  setActiveWavelength(p.nm);
                                  soundEffects.playClick();
                                }}
                              >
                                <span className="preset-color-dot" style={{ backgroundColor: p.color }}></span>
                                <strong>{p.label}</strong> {p.tag}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Display Gráfico del Espectro con Cursor Dinámico */}
                      <div className="spectro-graph-display-container">
                        <div className="spectrum-axis-labels">
                          <span>Ultravioleta</span>
                          <span>Luz Visible Humana (380 - 750 nm)</span>
                          <span>Infrarrojo Cercano (NIR)</span>
                        </div>

                        <div className="spectro-graph-display">
                          {/* Barra continua de gradiente espectral */}
                          <div className="spectrum-gradient-bar"></div>

                          {/* Líneas de Absorción Teóricas de este Planeta */}
                          <div className="absorption-lines-overlay">
                            {ABSORPTION_BANDS.filter(b => b.bodies.includes(selectedSpectroBody)).map((b, i) => {
                              const pos = ((b.wavelengthNm - 380) / (1100 - 380)) * 100;
                              return (
                                <div 
                                  key={i} 
                                  className="spectral-dip-line" 
                                  style={{ left: `${pos}%` }}
                                  title={`${b.gas} a ${b.wavelengthNm} nm`}
                                >
                                  <span className="dip-label">{b.formula} {b.wavelengthNm}nm</span>
                                </div>
                              );
                            })}
                          </div>

                          {/* Cursor Dinámico de la Longitud de Onda Analizada */}
                          <div 
                            className="spectro-active-cursor" 
                            style={{ 
                              left: `${spectrumPercent}%`,
                              borderColor: photonInfo.hex,
                              boxShadow: `0 0 12px ${photonInfo.hex}`
                            }}
                          >
                            <div className="cursor-pin" style={{ backgroundColor: photonInfo.hex }}>
                              <span>{activeWavelength}nm</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* DIAGNÓSTICO EN TIEMPO REAL: ¿HAY ABSORCIÓN O TRANSPARENCIA? */}
                      <div className="spectro-live-diagnosis-box">
                        {detectedAbsorption ? (
                          <div className="diagnosis-card absorbed animate-fade-in">
                            <div className="diag-header">
                              <span className="diag-badge-alert">🚨 Absorción Molecular Detectada</span>
                              {detectedAbsorption.isBioSignature && (
                                <span className="diag-badge-bio">✨ Biofirma Astrobiológica</span>
                              )}
                            </div>
                            <h4>
                              Línea Espectral de <strong>{detectedAbsorption.gas}</strong> ({detectedAbsorption.formula}) a {detectedAbsorption.wavelengthNm} nm
                            </h4>
                            <p className="diag-desc">
                              <strong>Mecanismo Físico:</strong> {detectedAbsorption.transition}. La luz solar en esta frecuencia es capturada por los niveles cuánticos de la molécula, reduciendo los fotones transmitidos hacia nuestros telescopios.
                            </p>
                            <p className="diag-significance">
                              💡 <strong>Importancia Planetaria:</strong> {detectedAbsorption.significance}
                            </p>
                          </div>
                        ) : (
                          <div className="diagnosis-card transparent animate-fade-in">
                            <div className="diag-header">
                              <span className="diag-badge-window">☀️ Ventana Atmosférica Transparente</span>
                            </div>
                            <h4>Transmisión Óptica Despejada a {activeWavelength} nm</h4>
                            <p className="diag-desc">
                              Las moléculas principales de la atmósfera de {body.name} no presentan bandas de absorción resonantes a {activeWavelength} nm. La luz de esta longitud de onda atraviesa casi libremente hasta las capas profundas o la superficie del planeta.
                            </p>
                            <p className="diag-significance">
                              💡 <strong>Uso Astronómico:</strong> Los telescopios espaciales emplean estas "ventanas de transparencia" para observar la superficie rocosa o medir la radiación térmica emitida por el planeta.
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* SECCIÓN 2: CATÁLOGO DE INSTRUMENTOS ESPACIALES */}
              {activeSpectroSection === 'instruments' && (() => {
                const currentInst = SPECTRO_INSTRUMENTS.find(inst => inst.id === selectedInstrument) || SPECTRO_INSTRUMENTS[0];
                return (
                  <div className="spectro-instruments-panel animate-fade-in">
                    <div className="instruments-intro-card">
                      <h3>🛰️ Observatorios y Espectrógrafos de Vanguardia</h3>
                      <p>
                        Para descomponer la luz de planetas a millones o billones de kilómetros se requieren detectores criogénicos de ultra-precisión montados en sondas espaciales y gigantescos telescopios terrestres.
                      </p>
                    </div>

                    {/* Selector de Instrumentos */}
                    <div className="instruments-selector-row">
                      {SPECTRO_INSTRUMENTS.map((inst) => (
                        <button
                          key={inst.id}
                          className={`instrument-tab-btn ${selectedInstrument === inst.id ? 'active' : ''}`}
                          onClick={() => {
                            setSelectedInstrument(inst.id);
                            soundEffects.playClick();
                          }}
                        >
                          <span className="inst-icon">{inst.icon}</span>
                          <span className="inst-tab-name">{inst.name.split(' ')[0]}</span>
                        </button>
                      ))}
                    </div>

                    {/* Ficha Detallada del Instrumento */}
                    <div className="instrument-detail-card">
                      <div className="inst-card-header">
                        <div>
                          <span className="inst-agency-badge">{currentInst.agency}</span>
                          <h4>{currentInst.name}</h4>
                          <span className="inst-mission-sub">Misión: <strong>{currentInst.mission}</strong></span>
                        </div>
                        <span className="inst-big-icon">{currentInst.icon}</span>
                      </div>

                      <div className="inst-specs-grid">
                        <div className="inst-spec-item">
                          <span className="spec-label">Rango Espectral</span>
                          <strong className="spec-val">{currentInst.range}</strong>
                          <span className="spec-sub">{currentInst.rangeNm}</span>
                        </div>
                        <div className="inst-spec-item">
                          <span className="spec-label">Tipo de Detector</span>
                          <strong className="spec-val">{currentInst.type}</strong>
                        </div>
                        <div className="inst-spec-item">
                          <span className="spec-label">Objetivo Principal</span>
                          <strong className="spec-val">{currentInst.keyTarget}</strong>
                        </div>
                      </div>

                      <div className="inst-discovery-highlight">
                        <div className="discovery-tag">🏆 Mayor Logro Científico:</div>
                        <p>{currentInst.discovery}</p>
                      </div>

                      <p className="inst-full-desc">{currentInst.description}</p>
                    </div>
                  </div>
                );
              })()}

              {/* SECCIÓN 3: GUÍA DIDÁCTICA Y REFERENCIAS */}
              {activeSpectroSection === 'learning' && (
                <div className="spectro-learning-panel animate-fade-in">
                  <div className="learning-grid">
                    {/* Tarjeta 1: ¿Qué es la espectroscopía? */}
                    <div className="learning-card">
                      <div className="card-top-icon">🌈</div>
                      <h4>El "Código de Barras" de la Luz</h4>
                      <p>
                        Cada átomo y molécula en el universo posee una estructura única de electrones en niveles cuánticos de energía. Cuando un fotón con la energía exacta choca contra un electrón, este es absorbido y salta a un nivel superior.
                      </p>
                      <div className="card-callout">
                        💡 Por eso, al descomponer la luz de un planeta con un prisma o red de difracción, faltan ciertos colores específicos: esas líneas oscuras son la firma química inconfundible de los gases que habitan su atmósfera.
                      </div>
                    </div>

                    {/* Tarjeta 2: Leyes de Kirchhoff */}
                    <div className="learning-card">
                      <div className="card-top-icon">📐</div>
                      <h4>Las 3 Leyes de Kirchhoff</h4>
                      <ul className="kirchhoff-list">
                        <li>
                          <strong>1. Espectro Continuo:</strong> Un cuerpo denso y caliente (como el filamento de una bombilla o el interior del Sol) emite luz en todas las longitudes de onda continuas.
                        </li>
                        <li>
                          <strong>2. Espectro de Emisión:</strong> Un gas caliente y difuso (como una nebulosa) emite luz solo en longitudes de onda discretas y brillantes.
                        </li>
                        <li>
                          <strong>3. Espectro de Absorción:</strong> Cuando la luz continua atraviesa un gas frío (la atmósfera de un planeta), el gas absorbe colores específicos creando líneas oscuras.
                        </li>
                      </ul>
                    </div>

                    {/* Tarjeta 3: Biofirmas */}
                    <div className="learning-card">
                      <div className="card-top-icon">🌱</div>
                      <h4>¿Cómo Buscamos Vida con Espectroscopía?</h4>
                      <p>
                        En astrobiología buscamos <strong>Biofirmas</strong>: gases que en condiciones puramente geológicas se destruirían rápidamente, pero que se mantienen en equilibrio debido a la actividad biológica continua.
                      </p>
                      <div className="card-callout">
                        ✨ En la Tierra, el <strong>Oxígeno (O₂)</strong> y el <strong>Metano (CH₄)</strong> reaccionan entre sí para formar CO₂ y agua. Que existan ambos simultáneamente en nuestra atmósfera a la vez es una prueba rotunda de vida fotosintética y microbiana activa.
                      </div>
                    </div>

                    {/* Tarjeta 4: Referencias Científicas */}
                    <div className="learning-card references">
                      <div className="card-top-icon">📚</div>
                      <h4>Bases de Datos & Referencias Científicas</h4>
                      <p>
                        Los datos espectrales de este simulador están basados en investigaciones de astrofísica observacional y bases de datos espectrales internacionales:
                      </p>
                      <div className="references-list">
                        <div className="ref-item">
                          <strong>HITRAN Database:</strong> Harvard-Smithsonian Center for Astrophysics (High-resolution Transmission Molecular Absorption).
                        </div>
                        <div className="ref-item">
                          <strong>NASA Planetary Data System (PDS):</strong> Archivos espectrométricos de las misiones Voyager, Cassini, MRO y JWST.
                        </div>
                        <div className="ref-item">
                          <strong>ESA Planetary Science Archive (PSA):</strong> Misiones Mars Express, Venus Express y BepiColombo.
                        </div>
                        <div className="ref-item">
                          <strong>ESO Science Archive:</strong> Datos de espectroscopía de alta resolución del espectrógrafo ESPRESSO en Paranal.
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* =========================================================
            PESTAÑA 4: FÍSICA ORBITAL (3ª LEY & EINSTEIN)
           ========================================================= */}
        {activeTab === 'physics' && (
          <div className="sim-dashboard animate-fade-in">
            <div className="physics-lab-container">
              <h2 className="section-title">🧪 Laboratorio de Física Orbital (Leyes de Kepler & Einstein)</h2>
              
              <div className="physics-controls-panel">
                <div className="control-slider-box">
                  <label>Masa de la Estrella: <strong>{starMass} M☉</strong></label>
                  <input type="range" min="0.2" max="3.0" step="0.1" value={starMass} onChange={(e) => setStarMass(parseFloat(e.target.value))} />
                </div>

                <div className="control-slider-box">
                  <label>Velocidad Tangencial: <strong>{planetVelocity}x</strong></label>
                  <input type="range" min="0.2" max="2.5" step="0.1" value={planetVelocity} onChange={(e) => setPlanetVelocity(parseFloat(e.target.value))} />
                </div>

                <div className="control-slider-box">
                  <label>Distancia Orbital: <strong>{orbitalDistance} UA</strong></label>
                  <input type="range" min="0.5" max="2.0" step="0.1" value={orbitalDistance} onChange={(e) => setOrbitalDistance(parseFloat(e.target.value))} />
                </div>

                <label className="toggle-chip einstein-toggle">
                  <input type="checkbox" checked={showPrecessionEinstein} onChange={() => setShowPrecessionEinstein(!showPrecessionEinstein)} />
                  🌌 Precesión Relativista de Einstein (Mercurio)
                </label>
              </div>

              {/* Demostración de la 3ª Ley de Kepler */}
              <div className="kepler-third-law-card">
                <h3>📊 Demostración de la 3ª Ley de Kepler ($T^2 = a^3$)</h3>
                <p>El cuadrado del periodo orbital ($T^2$) es exactamente igual al cubo del semi-eje mayor ($a^3$):</p>
                <div className="kepler-eq-box">
                  <span>(T / 1 año)² = ({orbitalDistance})³ = <strong>{(Math.pow(orbitalDistance, 3)).toFixed(3)}</strong></span>
                </div>
              </div>

              {/* Avisos de Física Orbital */}
              {physicsCollided && (
                <div style={{ background: 'rgba(239, 68, 68, 0.2)', border: '1px solid #ef4444', borderRadius: '12px', padding: '12px 16px', color: '#fca5a5', marginTop: '12px', fontWeight: 'bold' }}>
                  🚨 Colapso Gravitacional: La velocidad del planeta no fue suficiente para vencer la atracción del Sol.
                </div>
              )}
              {physicsEscaped && (
                <div style={{ background: 'rgba(245, 158, 11, 0.2)', border: '1px solid #f59e0b', borderRadius: '12px', padding: '12px 16px', color: '#fde68a', marginTop: '12px', fontWeight: 'bold' }}>
                  🚀 Escape Orbital: La velocidad superó la velocidad de escape. El planeta abandona la estrella hacia el espacio interestelar.
                </div>
              )}

              {/* Canvas SVG de Física con Vectores */}
              <div className="physics-svg-viewport">
                <svg viewBox="0 0 700 500" className="physics-svg">
                  <defs>
                    <marker id="arrow-red" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                      <path d="M 0 0 L 10 5 L 0 10 z" fill="#ef4444" />
                    </marker>
                    <marker id="arrow-cyan" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                      <path d="M 0 0 L 10 5 L 0 10 z" fill="#38bdf8" />
                    </marker>
                  </defs>

                  <circle cx="350" cy="250" r={30 * Math.sqrt(starMass)} fill="#FBE903" />
                  {showPrecessionEinstein && (
                    <ellipse cx="350" cy="250" rx={physicsRadius} ry={physicsRadius * 0.75} fill="none" stroke="#ef4444" strokeWidth="1.5" strokeDasharray="3 3" transform="rotate(25, 350, 250)" />
                  )}
                  <circle cx="350" cy="250" r={physicsRadius} fill="none" stroke="rgba(56, 189, 248, 0.4)" strokeWidth="2" />

                  {/* Renderizado del Planeta y sus Vectores (Fg y Vt) */}
                  {(() => {
                    const rad = (physicsAngle * Math.PI) / 180;
                    const px = 350 + physicsRadius * Math.cos(rad);
                    const py = 250 + physicsRadius * Math.sin(rad);

                    // Vector Fg (Gravedad hacia la estrella)
                    const fgX = px + (350 - px) * 0.28;
                    const fgY = py + (250 - py) * 0.28;

                    // Vector Vt (Velocidad Tangencial perpendicular a la gravedad)
                    const vtX = px - Math.sin(rad) * 45 * planetVelocity;
                    const vtY = py + Math.cos(rad) * 45 * planetVelocity;

                    return (
                      <g>
                        {/* Vector Gravedad (Fuerza Centrípetas) */}
                        <line x1={px} y1={py} x2={fgX} y2={fgY} stroke="#ef4444" strokeWidth="2.5" markerEnd="url(#arrow-red)" />
                        <text x={fgX + (px > 350 ? 6 : -18)} y={fgY + (py > 250 ? 6 : -6)} fill="#ef4444" fontSize="12" fontWeight="bold">Fg</text>

                        {/* Vector Velocidad Tangencial */}
                        <line x1={px} y1={py} x2={vtX} y2={vtY} stroke="#38bdf8" strokeWidth="2.5" markerEnd="url(#arrow-cyan)" />
                        <text x={vtX + (vtX > px ? 6 : -18)} y={vtY + (vtY > py ? 6 : -6)} fill="#38bdf8" fontSize="12" fontWeight="bold">Vt</text>

                        <circle cx={px} cy={py} r="10" fill="#38BDF8" />
                      </g>
                    );
                  })()}
                </svg>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
