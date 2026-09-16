import type { GranGaleriaConfig } from '../types';

export const DEFAULT_GRAN_GALERIA: GranGaleriaConfig = {
  intro: "La Gran Galería es el espacio de honor y celebración del talento estudiantil. Aquí se exhiben los relatos de nuestra plataforma de lectura y escritura juvenil, las pinturas de nuestro museo virtual y los cortometrajes y reportajes de la mediateca escolar.",
  bannerSubtitle: "El escenario donde la creatividad, la narrativa y el arte de los estudiantes cobran vida.",
  contests: [
    {
      id: "concurso-popol-vuh-2026",
      title: "I Concurso Nacional de Cuento Fantástico 'Mitos y Futuro'",
      discipline: "literatura",
      genreOrCategory: "Fantasía & Popol Vuh",
      description: "Convocatoria dirigida a estudiantes de primaria alta, básicos y diversificado para reinterpretar las leyendas ancestrales y la ciencia ficción desde su propia voz.",
      guidelines: [
        "Extensión entre 600 y 2,500 palabras.",
        "Temática libre inspirada en elementos de la naturaleza, leyendas mesoamericanas o aventuras de ciencia ficción.",
        "Se evalúa originalidad, riqueza descriptiva y ortografía."
      ],
      deadline: "30 de Octubre de 2026",
      rewardDetails: "Publicación en el Códice Editorial oficial, diploma de honor y lote de libros ilustrados.",
      status: "galardonados",
      featured: true
    },
    {
      id: "bienal-arte-sutz-2026",
      title: "Bienal Estudiantil de Pintura, Dibujo e Ilustración Digital",
      discipline: "arte",
      genreOrCategory: "Artes Visuales",
      description: "Muestra abierta para que los jóvenes artistas presenten obras en técnicas tradicionales o digitales explorando el tema 'El Ecosistema y las Nubes de Sutz'.",
      guidelines: [
        "Formatos aceptados: Ilustración digital (PNG/WebP alta resolución), acuarela, óleo, témpera o técnica mixta.",
        "Acompañar la obra con una breve declaración del artista (máximo 150 palabras).",
        "Abierto a todas las edades escolares."
      ],
      deadline: "15 de Noviembre de 2026",
      rewardDetails: "Exhibición permanente en el Salón Principal del Museo Virtual y kit profesional de arte.",
      status: "convocatoria",
      featured: true
    },
    {
      id: "festival-cine-escolar-2026",
      title: "Festival Escolar de Cortometrajes, Documentales & Reportajes",
      discipline: "video",
      genreOrCategory: "Cine & Periodismo Escolar",
      description: "Certamen audiovisual para premiar la narrativa en movimiento: cortometrajes de ficción, documentales ecológicos y reportajes de investigación escolar.",
      guidelines: [
        "Duración máxima de 10 minutos.",
        "Participación individual o en equipos escolares de hasta 5 integrantes.",
        "Resolución mínima 720p (HD). Alojado en YouTube o Vimeo."
      ],
      deadline: "20 de Diciembre de 2026",
      rewardDetails: "Proyección estelar en la Mediateca de Sutz y estatuilla digital de realizador.",
      status: "evaluacion",
      featured: true
    }
  ],
  texts: [
    {
      id: "texto-1",
      title: "El Secreto del Xibalbá Digital",
      author: "Mateo Ixchel",
      authorGrade: "2do Básico",
      authorSchool: "Colegio Bilingüe Maya de Occidente",
      genre: "sci-fi",
      synopsis: "Cuando la red de computadoras del laboratorio escolar comienza a emitir susurros en K'iche', Carlos y Ximena descubren que un portal al inframundo digital se ha abierto entre los servidores antiguos.",
      content: `Capítulo 1: El pulso en la terminal

El ventilador de la computadora número 7 del laboratorio escolar no zumbaba como los demás. Emitía un compás rítmico, casi respiratorio, que a las cuatro de la tarde —cuando el aula quedaba desierta y las sombras de los volcanes se alargaban sobre el patio— parecía un susurro antiguo.

—Carlos, ya van a cerrar el portón —dijo Ximena desde la puerta, ajustándose la mochila con libros de física.

—Espérate un minuto, Xime. Mira esta línea de comandos. Yo no escribí esto.

En la pantalla fosforescente, líneas de código verde se reorganizaban solas. Pero no eran ceros ni unos comunes: eran glifos cartesianos, coordenadas que apuntaban a la raíz subterránea de la escuela. Justo debajo del piso de cemento, los cables de fibra óptica parecían conectarse con algo mucho más antiguo que el internet.

—Dice 'Xibalbá-Node-01' —leyó Carlos, con los dedos temblando sobre el teclado—. Y pide una ofrenda de palabras.

Capítulo 2: El dilema del guardián

Ximena se acercó. Al posar su mano cerca del monitor, el calor no provenía de los circuitos, sino de una brisa cálida y seca, con aroma a copal y lluvia fresca. En la pantalla apareció una figura: una silueta de lechuza con ojos de fósforo blanco.

—"Para cruzar la primera sala", rezaba el texto, "debes resolver la ecuación del tiempo que los Señores de la Noche ocultaron en el calendario".

Carlos sonrió. Aquello no era un virus ni una trampa. Era una prueba. Y en el teclado, sus dedos comenzaron a teclear el cálculo astronómico que habían aprendido apenas esa mañana en la lección del Sistema Solar. La aventura en el inframundo de datos apenas comenzaba.`,
      concursoId: "concurso-popol-vuh-2026",
      awardBadge: "🏆 1er Lugar - Concurso Nacional de Cuento",
      likes: 142,
      reads: 890,
      featured: true,
      publishedAt: "2026-08-12"
    },
    {
      id: "texto-2",
      title: "Las Alas del Quetzal de Jade",
      author: "Sofía Chojolán",
      authorGrade: "5to Primaria",
      authorSchool: "Escuela Oficial Urbana El Saber",
      genre: "fantasia",
      synopsis: "En las cumbres nubosas de la Sierra de los Cuchumatanes, una niña pastora encuentra una pluma que nunca pierde su brillo, guiándola a salvar el nacimiento del río sagrado.",
      content: `Había una vez, en lo alto de la montaña donde las nubes caminan como rebaños blancos, una niña llamada Alitza. Alitza sabía escuchar el viento; sabía cuándo llovería con solo oler las hojas de pino y distinguía el canto de cada pájaro que surcaba el bosque de niebla.

Una mañana de rocío espeso, cerca del nacimiento del arroyo, Alitza vio un destello esmeralda entre las piedras. No era vidrio ni metal pulido: era una pluma tan suave como la brisa, pero con el brillo eterno del jade más puro.

Al tomarla entre sus manos, la pluma se calentó suavemente, y una voz melodiosa resonó en su mente:
—El agua de la cumbre se está durmiendo porque los hombres olvidaron cantar los relatos de gratitud. Tú, pequeña guardiana, tienes la voz que puede despertar las piedras.

Alitza no tuvo miedo. Respiró el aire fresco del cerro, cerró los ojos y comenzó a entonar la melodía que su abuela Ixmukané le cantaba junto al fogón. Con cada nota, el arroyo cantaba de nuevo, y del follaje más alto, un ave de pecho escarlata alzó el vuelo, dejando una estela de polvo dorado sobre todo el valle.`,
      concursoId: "concurso-popol-vuh-2026",
      awardBadge: "🌟 Mención Honorífica de Narrativa",
      likes: 98,
      reads: 640,
      featured: true,
      publishedAt: "2026-08-18"
    },
    {
      id: "texto-3",
      title: "Crónica de un Huerto en el Techo Escolar",
      author: "Carlos Alvarado",
      authorGrade: "4to Bachillerato en Ciencias",
      authorSchool: "Instituto Tecnológico de Quetzaltenango",
      genre: "cronica",
      synopsis: "Cómo transformamos cincuenta metros cuadrados de concreto abandonado en un laboratorio vivo de hortalizas, compostaje y convivencia estudiantil.",
      content: `Todo empezó con tres llantas viejas y un puñado de semillas de rábano que el profesor de biología trajo en una bolsa de papel estraza.

Muchos decían que en el techo del colegio no crecía nada porque el sol del mediodía partía el cemento y las heladas de diciembre quemaban cualquier brote. Pero nosotros, los del club de ciencias, teníamos un plan.

Durante dos meses recolectamos los restos de cáscaras de banano y café de la cafetería escolar. Construimos nuestra primera compostera con tablas de tarimas desechadas. Aprendimos a medir la humedad del suelo usando sensores caseros que conectamos con microcontroladores en el taller de tecnología.

El primer rábano que brotó parecía un milagro rojo. Hoy, el techo es una alfombra verde de acelgas, espinacas, hierbabuena y flores comestibles que atraen abejas y mariposas en medio de la ciudad. No solo cultivamos hortalizas: cultivamos la certeza de que el futuro se siembra con nuestras propias manos.`,
      likes: 76,
      reads: 420,
      featured: false,
      publishedAt: "2026-09-02"
    },
    {
      id: "texto-4",
      title: "Poemas a la Nube Errante (Sutz)",
      author: "Valeria Morales",
      authorGrade: "1ro Básico",
      authorSchool: "Liceo Experimental de las Artes",
      genre: "poesia",
      synopsis: "Versos sobre la niebla matutina, el despertar del volcán y los pensamientos que viajan con el rocío de la alborada.",
      content: `I. El lienzo de la niebla

Vienes despacio, manto de agua callada,
a vestir de plata el ciprés y la teja,
no tienes prisa, no tienes morada,
tu aliento blanco el paisaje despeja.

II. Sutz en la cumbre

En tu vientre duermen historias y truenos,
la voz de Juracán que susurra en silencio;
eres el nido de los pensamientos buenos,
la pausa dulce que en la montaña presencio.

III. Rocío

Al mediodía te marchas ligera
hacia el lago azul que abajo suspira,
dejando en las hojas la gota primera
que al mirar al sol, en cristal se transforma.`,
      likes: 115,
      reads: 530,
      featured: true,
      publishedAt: "2026-09-05"
    }
  ],
  artworks: [
    {
      id: "arte-1",
      title: "El Vuelo de Juracán en Acuarela",
      artist: "Lucía Estrada",
      artistGrade: "3ro Básico",
      artistSchool: "Colegio de Artes San Lucas",
      technique: "acuarela",
      dimensions: "40 x 50 cm",
      description: "Interpretación expresionista del dios del viento y la tormenta, empleando aguadas transparentes de azul ultramar y toques de tinta china dorada.",
      imageUrl: "/assets/Juracan%20titulo-CJ--KpLx.png",
      concursoId: "bienal-arte-sutz-2026",
      awardBadge: "🥇 1er Lugar - Bienal de Artes Visuales",
      likes: 210,
      views: 1250,
      featured: true,
      publishedAt: "2026-08-22"
    },
    {
      id: "arte-2",
      title: "Camazotz: Guardián de la Noche Estrellada",
      artist: "Diego Xiquín",
      artistGrade: "5to Bachillerato en Diseño Gráfico",
      artistSchool: "Instituto Vocacional de Diseño",
      technique: "digital",
      dimensions: "3840 x 2160 px (4K)",
      description: "Ilustración digital con texturas inspiradas en códices prehispánicos y paleta de iluminación neón que fusiona arte ancestral y estética cyberpunk.",
      imageUrl: "/assets/Camazotz%20titulo-C5JiC7dN.png",
      concursoId: "bienal-arte-sutz-2026",
      awardBadge: "✨ Premio Especial de Innovación Digital",
      likes: 185,
      views: 980,
      featured: true,
      publishedAt: "2026-08-25"
    },
    {
      id: "arte-3",
      title: "Ixmukané y el Grano Sagrado",
      artist: "Brenda Tepaz",
      artistGrade: "6to Primaria",
      artistSchool: "Escuela Rural Mixta Las Victorias",
      technique: "mixta",
      dimensions: "35 x 45 cm",
      description: "Composición con témpera, collage de granos de maíz de cuatro colores y corteza natural de pino, rindiendo tributo a la abuela creadora del Popol Vuh.",
      imageUrl: "/assets/Ixmukanne%20titulo-DLpUcWwx.png",
      concursoId: "bienal-arte-sutz-2026",
      awardBadge: "🌽 Premio a la Identidad Cultural",
      likes: 160,
      views: 870,
      featured: true,
      publishedAt: "2026-08-30"
    },
    {
      id: "arte-4",
      title: "La Danza de Q'uq'umatz",
      artist: "Andrés Colop",
      artistGrade: "2do Básico",
      artistSchool: "Centro de Educación Estética Utatlán",
      technique: "oleo",
      dimensions: "50 x 70 cm",
      description: "Óleo sobre lienzo con pinceladas enérgicas en degradé esmeralda y turquesa que representan la ondulación de la serpiente emplumada en las aguas primordiales.",
      imageUrl: "/assets/Ququmatz%20titulo-DSHBqZmr.png",
      likes: 130,
      views: 760,
      featured: false,
      publishedAt: "2026-09-01"
    }
  ],
  videos: [
    {
      id: "video-1",
      title: "Voces de la Montaña: Guardianes del Bosque Nuboso",
      team: "Equipo de Reporteros Juveniles (3ro Básico)",
      school: "Instituto Experimental de Educación Ambiental",
      grade: "3ro Básico",
      category: "documental",
      synopsis: "Documental escolar que investiga la conservación de las fuentes de agua y la fauna del bosque nuboso mediante entrevistas con guardabosques comunitarios.",
      videoUrl: "https://www.youtube.com/watch?v=HMFybOP8gec",
      youtubeId: "HMFybOP8gec",
      duration: "06:45",
      concursoId: "festival-cine-escolar-2026",
      awardBadge: "🎬 Mejor Documental Escolar 2026",
      views: 1450,
      featured: true,
      publishedAt: "2026-08-15"
    },
    {
      id: "video-2",
      title: "El Despertar de la Lechuza (Animación Stop-Motion)",
      team: "Taller Escolar de Animación LAB",
      school: "Escuela Primaria Modelo",
      grade: "5to y 6to Primaria",
      category: "animacion",
      synopsis: "Cortometraje elaborado cuadro por cuadro con figuras modeladas en plastilina y escenografía de cartón reciclado, relatando la fábula de una pequeña lechuza.",
      videoUrl: "https://www.youtube.com/watch?v=HMFybOP8gec",
      youtubeId: "HMFybOP8gec",
      duration: "03:20",
      concursoId: "festival-cine-escolar-2026",
      awardBadge: "🌟 Premio a la Creatividad Audiovisual",
      views: 980,
      featured: true,
      publishedAt: "2026-08-20"
    },
    {
      id: "video-3",
      title: "Reportaje: Cómo Construimos el Sorteador de Semillas con IA",
      team: "Club STEM 100tek (4to Bachillerato)",
      school: "Colegio Técnico de Computación",
      grade: "4to Bachillerato",
      category: "reportaje",
      synopsis: "Reportaje científico escolar que documenta el paso a paso del desarrollo de un prototipo robótico de bajo costo para clasificar granos de frijol y maíz.",
      videoUrl: "https://www.youtube.com/watch?v=HMFybOP8gec",
      youtubeId: "HMFybOP8gec",
      duration: "05:10",
      views: 1120,
      featured: false,
      publishedAt: "2026-09-08"
    }
  ]
};
