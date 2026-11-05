export interface ArchetypeRelation {
  targetArchetype: string;
  relationRole: string;
  sparkDescription: string;
}

export interface CharacterArchetype {
  id: string;
  name: string;
  roleSubtitle: string;
  icon: string;
  quote: string;
  motto: string;
  coreDesire: string;
  greatestFear: string;
  neuroTrigger: string;
  neuroExplanation: string;
  functionDesc: string;
  shadowWeakness: string;
  personalityTraits: string[];
  classicExample: string;
  modernExample: string;
  mayanExample: string;
  writingTip: string;
  crucibleTrial: string;
  relations: ArchetypeRelation[];
  color: string;
  neuroBadge: string;
}

export const CLASSIC_ARCHETYPES: CharacterArchetype[] = [
  {
    id: 'heroe',
    name: 'El Héroe / La Heroína',
    roleSubtitle: 'El motor del cambio, la superación y el sacrificio ético',
    icon: '🦸',
    motto: '«Donde hay voluntad, hay un camino.»',
    quote: '«No soy lo que me pasó, soy lo que elijo llegar a ser frente a la tormenta.»',
    coreDesire: 'Demostrar su valía a través de actos valientes que salven o restauren a su comunidad.',
    greatestFear: 'La cobardía, la debilidad moral o fracasar cuando otros dependen de su determinación.',
    neuroTrigger: 'Liberación masiva de Dopamina y Adrenalina',
    neuroExplanation: 'El cerebro simula el triunfo sobre la adversidad. Las neuronas espejo de la corteza premotora se sincronizan con su esfuerzo físico y moral.',
    neuroBadge: 'Dopamina · Sistema Motor',
    functionDesc: 'Es el centro de gravedad moral y emocional del relato. Debe tomar decisiones difíciles bajo presión extrema que revelen quién es realmente.',
    shadowWeakness: 'Arrogancia (hibris), ceguera ante su propia herida o insistencia en perseguir su deseo superficial en lugar de su necesidad interior.',
    personalityTraits: [
      'Determinación inquebrantable frente a la adversidad y negativa a rendirse.',
      'Sentido del honor y necesidad imperativa de proteger a los vulnerables.',
      'Impulsivo al presenciar injusticias; actúa antes de calcular riesgos personales.',
      'Autoexigencia implacable: le cuesta pedir ayuda o admitir cansancio físico y mental.',
      'Sensibilidad moral aguda que le hace cargar con culpas por fracasos ajenos.',
      'Resiliencia contagiosa que infunde coraje y esperanza en sus compañeros.'
    ],
    classicExample: 'Odiseo (La Odisea), Hércules, Gilgamesh',
    modernExample: 'Katniss Everdeen (Los Juegos del Hambre), Miles Morales (Spider-Verse)',
    mayanExample: 'Hunahpú e Ixbalanqué (Los Gemelos Divinos en el Popol Vuh)',
    writingTip: 'Dale una creencia falsa sobre sí mismo o sobre el mundo en el Acto I; su victoria dependerá de desmantelar esa mentira interna.',
    crucibleTrial: 'Debe elegir entre el triunfo de su ego individual y el sacrificio voluntario por el bien común en el punto más oscuro de la historia.',
    relations: [
      { targetArchetype: 'El Mentor', relationRole: 'Pupilo y Heredero', sparkDescription: 'Acepta sus enseñanzas, pero debe romper con su tutela para forjar su propio criterio.' },
      { targetArchetype: 'La Sombra', relationRole: 'Espejo Oscuro', sparkDescription: 'Enfrenta en el antagonista aquello en lo que él mismo se convertiría si cediera al rencor.' },
      { targetArchetype: 'El Pícaro', relationRole: 'Conciencia Irónica', sparkDescription: 'El pícaro pincha su solemnidad cuando el héroe se toma demasiado en serio.' }
    ],
    color: '#38bdf8'
  },
  {
    id: 'mentor',
    name: 'El Mentor / El Sabio',
    roleSubtitle: 'El guardián del fuego del saber, guía y catalizador moral',
    icon: '🧙‍♂️',
    motto: '«La única verdad es la que te atreves a descubrir por ti mismo.»',
    quote: '«El conocimiento sin coraje es un mapa sin caminante; la sabiduría es saber cuándo soltarlo.»',
    coreDesire: 'Transmitir la sabiduría y preparar a la siguiente generación para superar los errores del pasado.',
    greatestFear: 'El engaño, la ignorancia perpetuada o ver a su pupilo repetir su propio fracaso histórico.',
    neuroTrigger: 'Modulación de Acetilcolina y Plasticidad Sináptica',
    neuroExplanation: 'Fomenta la consolidación en la memoria a largo plazo. Activa la corteza prefrontal dorsolateral mediante preguntas socráticas que despiertan la metacognición.',
    neuroBadge: 'Acetilcolina · Hipocampo',
    functionDesc: 'Proporciona entrenamiento, artefactos clave o perspectivas que el héroe aún no puede ver. Suele retirarse antes del clímax para obligar al héroe a volar solo.',
    shadowWeakness: 'Dogmatismo rígido, guardar secretos destructivos o sobreprotección que anula la autonomía del discípulo.',
    personalityTraits: [
      'Paciencia pedagógica y serenidad contemplativa frente a las crisis externas.',
      'Hábito de responder con preguntas socráticas en lugar de imponer órdenes directas.',
      'Observador meticuloso: lee entre líneas y detecta el potencial oculto en otros.',
      'Desapego del protagonismo terrenal y de los reconocimientos superfluos.',
      'Hermetismo cauteloso: retiene verdades difíciles creyendo proteger a los jóvenes.',
      'Nostalgia reflexiva por fracasos del pasado que moldearon su propia prudencia.'
    ],
    classicExample: 'Quirón el centauro (Mitología Griega), Merlín (Ciclo Artúrico)',
    modernExample: 'Gandalf (El Señor de los Anillos), Maestro Yoda (Star Wars)',
    mayanExample: 'Ixmukané (La Abuela Primordial y Maestra de los Códices del Maíz)',
    writingTip: 'Haz que el mentor haya fracasado en el pasado en aquello que el héroe debe lograr; eso le otorga vulnerabilidad y verdad humana.',
    crucibleTrial: 'Aceptar que ya no es el protagonista de la época y confiar el destino a manos inexpertas pero nobles.',
    relations: [
      { targetArchetype: 'El Héroe', relationRole: 'Guía y Catalizador', sparkDescription: 'Le entrega el fuego inicial, pero debe apartarse para que el héroe descubra su propia luz.' },
      { targetArchetype: 'La Sombra', relationRole: 'Antiguo Hermano / Colega', sparkDescription: 'A menudo comparte un pasado común con el villano y carga la culpa de no haber evitado su caída.' }
    ],
    color: '#c084fc'
  },
  {
    id: 'sombra',
    name: 'La Sombra / El Antagonista',
    roleSubtitle: 'El reflejo reprimido, el conflicto existencial y la fuerza opuesta',
    icon: '🌑',
    motto: '«El fin justifica cualquier medio que el mundo débil teme usar.»',
    quote: '«Tú y yo no somos tan distintos; solo que yo dejé de mentirme a mí mismo.»',
    coreDesire: 'Reconfigurar la realidad según su propia voluntad herida, imponiendo su orden o venganza.',
    greatestFear: 'La debilidad, la insignificancia, la pérdida de control o confrontar su propia culpa.',
    neuroTrigger: 'Pico agudo de Cortisol y Activación de la Amígdala',
    neuroExplanation: 'Dispara el sistema de detección de amenazas. Cuando el antagonista tiene motivaciones lógicas, la mente entra en conflicto moral, elevando el foco atencional.',
    neuroBadge: 'Cortisol · Amígdala Cerebral',
    functionDesc: 'No es simplemente alguien malo: es el héroe de su propia historia. Encarna la antítesis de la lección que el protagonista debe aprender.',
    shadowWeakness: 'Incapacidad absoluta de mostrar vulnerabilidad, obsesión destructiva y aislamiento afectivo.',
    personalityTraits: [
      'Voluntad férrea, tenacidad implacable y disciplina estratégica sin concesiones.',
      'Racionalización convincente: posee una lógica interna sólida que justifica sus actos.',
      'Aversión extrema a la debilidad: desprecia la compasión considerándola ingenuidad.',
      'Desconfianza hipervigilante y necesidad patológica de controlarlo todo.',
      'Presencia intimidante y oratoria persuasiva que explota las dudas morales ajenas.',
      'Dolor reprimido que transformó una herida original en rencor gélido y calculador.'
    ],
    classicExample: 'Hades, Medea (Tragedia Griega), Lucifer (El Paraíso Perdido)',
    modernExample: 'Killmonger (Black Panther), Darth Vader (Star Wars), Roy Batty (Blade Runner)',
    mayanExample: 'Los Señores de Xibalbá: Hun-Camé y Vucub-Camé (Popol Vuh)',
    writingTip: 'Nunca lo hagas malo por capricho; dale una herida del pasado idéntica a la del héroe, pero haz que haya tomado la decisión contraria.',
    crucibleTrial: 'Tener la oportunidad de redimirse o perdonar, y rechazarla conscientemente para reafirmar su visión nihilista.',
    relations: [
      { targetArchetype: 'El Héroe', relationRole: 'Némesis y Espejo', sparkDescription: 'Cada golpe entre ellos es un debate ético sobre cómo reaccionar ante el dolor del mundo.' },
      { targetArchetype: 'El Guardián', relationRole: 'Amo y Juez', sparkDescription: 'Utiliza al guardián como muralla para poner a prueba si el héroe es digno de enfrentarlo.' }
    ],
    color: '#f43f5e'
  },
  {
    id: 'picaro',
    name: 'El Pícaro / Trickster',
    roleSubtitle: 'El destructor de solemnidades, el humor subversivo y la paradoja',
    icon: '🃏',
    motto: '«Las reglas están hechas para los que no saben improvisar.»',
    quote: '«¿Por qué tan serios? Si el universo fuera lógico, las orugas no se volverían mariposas.»',
    coreDesire: 'Vivir el momento con ingenio, desarmar la hipocresía social y desatar el cambio mediante el juego.',
    greatestFear: 'El aburrimiento, la rigidez burocrática, el encierro o ser tomado por un tonto ingenuo.',
    neuroTrigger: 'Error de Predicción Rápido y Chispazo Dopaminérgico',
    neuroExplanation: 'Rompe los esquemas predictivos cerebrales mediante el humor y el giro inesperado, liberando endorfinas que relajan la tensión y aumentan la receptividad.',
    neuroBadge: 'Endorfinas · Lóbulo Frontopolar',
    functionDesc: 'Cuestiona el statu quo con picardía. Señala las contradicciones de los héroes y tiranos por igual, recordando que el orgullo precede a la caída.',
    shadowWeakness: 'Cinismo destructivo, falta de lealtad profunda o sabotear situaciones serias por pura diversión frívola.',
    personalityTraits: [
      'Ingenio verbal chispeante, réplica rápida e ironía mordaz frente a la solemnidad.',
      'Alérgico a los protocolos rígidos, la rutina asfixiante y las figuras de autoridad vacías.',
      'Curiosidad insaciable e instinto travieso que lo empuja a tocar lo prohibido.',
      'Capacidad asombrosa de improvisación y pensamiento lateral en situaciones de apuro.',
      'Usa el humor y la farsa como escudo protector para ocultar sus verdaderos apegos.',
      'Lealtad encubierta: finge egoísmo pero rescata a sus amigos cuando nadie lo espera.'
    ],
    classicExample: 'Loki (Mitología Nórdica), Hermes (Mitología Griega), Lazarillo de Tormes',
    modernExample: 'Jack Sparrow (Piratas del Caribe), Deadpool, El Gato de Cheshire (Alicia)',
    mayanExample: 'El Conejo Tʼul y el Zorro Choj (Fábulas de picardía mesoamericana)',
    writingTip: 'El pícaro debe decir las verdades más crudas que nadie se atreve a pronunciar, pero envueltas en una carcajada o en una travesura.',
    crucibleTrial: 'Verse forzado a dejar de bromear y asumir una responsabilidad genuina que involucre sacrificio personal.',
    relations: [
      { targetArchetype: 'El Héroe', relationRole: 'Piedra en el Zapato', sparkDescription: 'Le baja los humos y le enseña que a veces la astucia supera a la espada.' },
      { targetArchetype: 'El Soberano', relationRole: 'Bufón Crítico', sparkDescription: 'Es el único que puede decirle la verdad al rey en su trono sin ser ejecutado.' }
    ],
    color: '#fbbf24'
  },
  {
    id: 'guardian',
    name: 'El Guardián del Umbral',
    roleSubtitle: 'La prueba de fuego, el filtro de compromiso y el cerrojo de paso',
    icon: '🚪',
    motto: '«Solo los decididos pasarán; los tibios vuelven a su hogar.»',
    quote: '«Mi deber no es destruirte, sino asegurarme de que no entres aquí sin estar listo para pagar el precio.»',
    coreDesire: 'Proteger el secreto sagrado, mantener el límite entre el mundo seguro y el mundo caótico.',
    greatestFear: 'Fallar en su deber de custodia o dejar pasar a alguien corrupto que mancille el santuario.',
    neuroTrigger: 'Tensión Atencional y Evaluación de Esfuerzo',
    neuroExplanation: 'Despierta la corteza cingulada anterior y el lóbulo parietal. El cerebro del estudiante mide la relación costo-beneficio del siguiente paso.',
    neuroBadge: 'Corteza Cingulada · Decisión',
    functionDesc: 'No es el villano principal; es la prueba viviente de que cruzar el umbral exige una transformación previa de habilidades o carácter.',
    shadowWeakness: 'Rigidez ciega, incapacidad de discernir excepciones legítimas o actuar por rencor fósil.',
    personalityTraits: [
      'Inquebrantable sentido del deber, lealtad jurada a su puesto y resistencia física.',
      'Presencia sobria, parquedad de palabras y mirada que pesa el carácter del otro.',
      'Escepticismo sistemático ante forasteros: exige hechos probados y no promesas.',
      'Inflexible ante súplicas sentimentales, pero profundamente respetuoso del honor auténtico.',
      'Disciplina espartana y tolerancia extrema a la soledad y a las inclemencias.',
      'Capacidad de reconocer la valía del adversario y ceder el paso cuando este madura.'
    ],
    classicExample: 'La Esfinge de Tebas, Cerbero en las puertas del Hades',
    modernExample: 'El Caballero Negro (Monty Python), Los centinelas de Moria (Tolkien)',
    mayanExample: 'Camazotz y los murciélagos guardianes de la Casa de las Navajas (Popol Vuh)',
    writingTip: 'Haz que el guardián pueda ser vencido no solo por la fuerza, sino reconociendo su función pedagógica o resolviendo su acertijo.',
    crucibleTrial: 'Tener que reconocer la nobleza del héroe y hacerse a un lado voluntariamente, aceptando que su misión con él ha concluido.',
    relations: [
      { targetArchetype: 'El Héroe', relationRole: 'Aduana de la Madurez', sparkDescription: 'Obliga al héroe a demostrar que ya no es un mero aficionado antes de entrar a territorio hostil.' }
    ],
    color: '#f97316'
  },
  {
    id: 'aliado',
    name: 'El Aliado / El Compañero Leal',
    roleSubtitle: 'El ancla emocional, la resonancia humana y la hermandad',
    icon: '🤝',
    motto: '«Caminamos juntos, o no llegamos ninguno.»',
    quote: '«No puedo llevar la carga por ti, pero puedo llevarte a ti cuando tus piernas no respondan.»',
    coreDesire: 'Acompañar, proteger y fortalecer los vínculos de hermandad frente al peligro.',
    greatestFear: 'El abandono, la traición a la amistad o ser incapaz de salvar a quien ama en el momento decisivo.',
    neuroTrigger: 'Descarga Masiva de Oxitocina y Red de Empatía',
    neuroExplanation: 'Activa la corteza prefrontal ventromedial y la ínsula anterior. Genera un profundo apego emocional y sentido de pertenencia en la audiencia.',
    neuroBadge: 'Oxitocina · Conexión Social',
    functionDesc: 'Humaniza al héroe. Aporta habilidades complementarias, consuelo en la derrota y una perspectiva grounded cuando el protagonista pierde el rumbo.',
    shadowWeakness: 'Codependencia, rencor silencioso si se siente ignorado o sacrificarse innecesariamente por culpa.',
    personalityTraits: [
      'Lealtad incondicional a prueba de fuego, tiempo y desastres compartidos.',
      'Sentido común práctico y arraigo terrenal que equilibra los delirios del líder.',
      'Calidez empática y talento natural para infundir consuelo con gestos sencillos.',
      'Humildad genuina: no le interesa figurar en monumentos ni competir por liderazgo.',
      'Coraje feroz en la defensa: multiplica sus fuerzas cuando un amigo está en peligro.',
      'Tendencia a ocultar sus propias heridas y agotamiento para no sobrecargar al grupo.'
    ],
    classicExample: 'Patroclo (Ilíada de Homero), Enkidu (Epopeya de Gilgamesh)',
    modernExample: 'Samwise Gamgee (El Señor de los Anillos), Hermione Granger y Ron Weasley',
    mayanExample: 'Los animales aliados de Xibalbá: la hormiga cortadora, el mosquito explorador y la luciérnaga',
    writingTip: 'El aliado debe tener sus propios sueños y desacuerdos éticos con el héroe; no lo reduzcas a un sirviente complaciente.',
    crucibleTrial: 'Sostener la fe en el héroe cuando el héroe mismo se ha rendido y ha perdido la esperanza.',
    relations: [
      { targetArchetype: 'El Héroe', relationRole: 'Hermano del Alma', sparkDescription: 'Le recuerda quién era antes de que la misión amenazara con endurecer su corazón.' }
    ],
    color: '#10b981'
  },
  {
    id: 'camaleon',
    name: 'El Camaleón / Shapeshifter',
    roleSubtitle: 'La ambigüedad cautivadora, el misterio y la duda fecunda',
    icon: '🎭',
    motto: '«Lo que ves depende de lo que estés dispuesto a creer.»',
    quote: '«¿Quién te dijo que solo se puede estar de un lado de la moneda?»',
    coreDesire: 'Preservar su libertad e identidad múltiple, navegando entre facciones sin quedar atrapado.',
    greatestFear: 'Ser encasillado, la vulnerabilidad total de ser descubierto sin máscaras o el rechazo.',
    neuroTrigger: 'Reconfiguración Constante de Esquemas y Teoría de la Mente',
    neuroExplanation: 'Desafía activamente la red de Teoría de la Mente (ToM). El cerebro del alumno debe actualizar continuamente sus hipótesis sobre sus verdaderas intenciones.',
    neuroBadge: 'Teoría de la Mente · TPJ',
    functionDesc: 'Mantiene viva la tensión y la sospecha. Puede ser un interés romántico, un informante ambiguo o un aliado cuya lealtad oscila con el viento.',
    shadowWeakness: 'Pérdida de su propio ser genuino, deslealtad patológica y soledad existencial.',
    personalityTraits: [
      'Carisma magnético y capacidad camaleónica de ajustar su tono según el interlocutor.',
      'Intuición psicológica prodigiosa para descifrar deseos reprimidos y flaquezas ajenas.',
      'Celoso defensor de su libertad personal: rechaza etiquetas y ataduras definitivas.',
      'Misterio intencional: comparte detalles personales ambiguos para protegerse.',
      'Dilema interno silencioso: a veces duda de quién es realmente tras tantas imposturas.',
      'Instinto táctico agudo para cambiar de estrategia en milésimas de segundo.'
    ],
    classicExample: 'Circe (La Odisea), Helena de Troya',
    modernExample: 'Severus Snape (Harry Potter), Catwoman (Batman), Gollum / Sméagol',
    mayanExample: 'Ixkikʼ (La doncella que baja al árbol de jícaras y engaña a los búhos de Xibalbá)',
    writingTip: 'Cada vez que cambie de bando, asegúrate de que el lector comprenda que sigue siendo coherente con su motivación oculta más íntima.',
    crucibleTrial: 'Tener que quitarse la máscara definitiva y elegir un bando aunque eso signifique perder todas sus ventajas de escape.',
    relations: [
      { targetArchetype: 'El Héroe', relationRole: 'Espejismo y Fascinación', sparkDescription: 'Atrae y confunde al héroe, obligándolo a desarrollar intuición más allá de las apariencias.' }
    ],
    color: '#ec4899'
  },
  {
    id: 'heraldo',
    name: 'El Heraldo / El Mensajero',
    roleSubtitle: 'El detonante de la aventura, la llamada y el mensajero del destino',
    icon: '🦅',
    motto: '«El tiempo de la calma ha expirado; el viaje te reclama.»',
    quote: '«No traigo paz ni guerra: traigo la verdad de lo que está por llegar.»',
    coreDesire: 'Entregar la advertencia o invitación que desate el movimiento necesario.',
    greatestFear: 'El silencio, la indiferencia ante el llamado o que el mensaje sea destruido sin ser escuchado.',
    neuroTrigger: 'Alerta Sensorial y Ruptura del Ritmo Basal',
    neuroExplanation: 'Activa el Sistema Reticular Activador Ascendente (SRAA). Saca al cerebro de su modo en reposo (DMN) y lo coloca en alerta ejecutiva inmediata.',
    neuroBadge: 'SRAA · Atención Fásica',
    functionDesc: 'Aparece al inicio del relato para comunicar la noticia que rompe el mundo ordinario: una carta, un cataclismo, un eclipse o una visita inesperada.',
    shadowWeakness: 'Ser portador de noticias falsas, alarmismo innecesario o desentenderse de las consecuencias del mensaje que entrega.',
    personalityTraits: [
      'Inquietud motora y energía vibrante que sacude el ambiente dondequiera que llega.',
      'Franqueza directa y tajante: entrega la verdad sin edulcorantes diplomáticos.',
      'Sentido de urgencia cósmica: percibe que cada segundo perdido acerca la catástrofe.',
      'Determinación estoica para entregar el mensaje a pesar del rechazo o la hostilidad.',
      'Indiferente al qué dirán; no busca agradar, sino sacudir conciencias dormidas.',
      'Siente el peso moral de ser la chispa que incendia la tranquilidad de otros.'
    ],
    classicExample: 'Hermes / Mercurio, Casandra en Troya',
    modernExample: 'Hagrid («Eres un mago, Harry»), La Princesa Leia vía R2-D2 («Ayúdame, Obi-Wan»)',
    mayanExample: 'Tukur (El Búho Mensajero de Xibalbá en el Popol Vuh)',
    writingTip: 'El heraldo no tiene que ser una persona: puede ser una carta extraviada, un titular de periódico o un temblor de tierra.',
    crucibleTrial: 'Entregar el mensaje más doloroso sabiendo que alterará para siempre la vida de quien lo reciba.',
    relations: [
      { targetArchetype: 'El Héroe', relationRole: 'Perturbador del Descanso', sparkDescription: 'Tira la primera ficha de dominó que derrumba la comodidad del protagonista.' }
    ],
    color: '#06b6d4'
  },
  {
    id: 'inocente',
    name: 'El Inocente / El Huérfano',
    roleSubtitle: 'La pureza original, la vulnerabilidad y la búsqueda del hogar',
    icon: '🕊️',
    motto: '«La vida no debería ser tan cruel; todos merecemos un lugar seguro.»',
    quote: '«Si dejamos de creer en la bondad, ¿qué sentido tiene haber sobrevivido a la tormenta?»',
    coreDesire: 'Estar a salvo, ser aceptado y vivir en armonía en un mundo justo.',
    greatestFear: 'El abandono, ser castigado por errores ajenos o quedar a merced de la frialdad del mundo.',
    neuroTrigger: 'Resonancia Emocional Pura y Compasión Protectora',
    neuroExplanation: 'Estimula fuertemente el circuito de cuidado parental y protección en el prosencéfalo basal. El lector siente urgencia visceral por su bienestar.',
    neuroBadge: 'Oxitocina · Circuito de Protección',
    functionDesc: 'Representa lo que está en juego en la historia: la inocencia que debe ser protegida o la pureza que el mundo corre el riesgo de corromper.',
    shadowWeakness: 'Negación ingenua del peligro, victimismo paralizante o caer en garras de manipuladores.',
    personalityTraits: [
      'Optimismo transparente y fe incorruptible en que las personas pueden mejorar.',
      'Capacidad de asombro genuino ante la naturaleza, el arte y los pequeños detalles.',
      'Vulnerabilidad emocional evidente: sufre profundamente ante la falsedad o el desdén.',
      'Incapacidad para maquinar segundas intenciones; sus emociones se reflejan en su rostro.',
      'Fuerza moral desarmante: su franqueza avergüenza el cinismo de los corruptos.',
      'Tendencia a confiar ciegamente en personas que no han demostrado lealtad.'
    ],
    classicExample: 'Dorothy Gale (El Mago de Oz), Cenicienta, Blancanieves',
    modernExample: 'Frodo Bolsón en La Comarca, Grogu (The Mandalorian), Oliver Twist',
    mayanExample: 'Las semillas de maíz tierno esperando el primer rayo de sol en la milpa',
    writingTip: 'No lo hagas pasivo: haz que su inocencia sea una fuerza moral activa que avergüence la crueldad de los cínicos.',
    crucibleTrial: 'Enfrentar la maldad real sin perder su capacidad de amar y confiar en los demás.',
    relations: [
      { targetArchetype: 'El Héroe', relationRole: 'Motor de Protección', sparkDescription: 'Le recuerda al héroe por qué vale la pena luchar y no rendirse ante el cinismo.' }
    ],
    color: '#22c55e'
  },
  {
    id: 'rebelde',
    name: 'El Rebelde / El Forajido',
    roleSubtitle: 'La justicia radical, la ruptura de cadenas y la disrupción',
    icon: '⚡',
    motto: '«Si la ley es injusta, lo justo es desobedecerla.»',
    quote: '«Prefiero morir de pie en las cenizas de un mundo libre que vivir de rodillas en su palacio de mentiras.»',
    coreDesire: 'Destruir lo que no funciona, liberar a los oprimidos e iniciar una revolución.',
    greatestFear: 'Ser domesticado, la impotencia, la sumisión o convertirse en aquello contra lo que luchó.',
    neuroTrigger: 'Adrenalina y Recompensa por Desobediencia Social',
    neuroExplanation: 'Despierta el núcleo accumbens y la corteza insular mediante la transgresión de normas injustas, generando catarsis de liberación en la mente juvenil.',
    neuroBadge: 'Adrenalina · Liberación Motora',
    functionDesc: 'Encarna la ira justa. Se niega a aceptar las cosas como son y está dispuesto a dinamitar los cimientos para que brote algo nuevo.',
    shadowWeakness: 'Violencia desmedida, fanatismo ciego, destruir sin un plan para reconstruir.',
    personalityTraits: [
      'Intolerancia visceral ante el abuso de poder, el autoritarismo y la sumisión forzada.',
      'Coraje desafiante: no teme romper tradiciones reverenciadas si las considera injustas.',
      'Pasión electrizante y elocuencia ardiente que contagia rebelión a los oprimidos.',
      'Desapego radical de las comodidades materiales y del aplauso institucional.',
      'Terquedad indomable: se resiste a acatar órdenes sin comprender su fundamento ético.',
      'Riesgo de amargura si confunde la sed de justicia con la venganza destructiva.'
    ],
    classicExample: 'Prometeo (Robando el fuego a los dioses), Robin Hood, Antígona',
    modernExample: 'V (V de Vendetta), Han Solo (etapa inicial), Magneto (X-Men)',
    mayanExample: 'Atanasio Tzul (Líder indígena del levantamiento comunal de Totonicapán)',
    writingTip: 'El rebelde debe tener una causa legítima con la que el lector esté secretamente de acuerdo, aunque sus métodos sean extremos.',
    crucibleTrial: 'Aprender que la destrucción es fácil, pero sostener la vida y reconstruir exige aún más coraje.',
    relations: [
      { targetArchetype: 'El Soberano', relationRole: 'Antítesis Innegociable', sparkDescription: 'Colisionan frontalmente entre la necesidad de orden versus el imperativo de libertad.' }
    ],
    color: '#e11d48'
  },
  {
    id: 'amante',
    name: 'El Amante / El Empático',
    roleSubtitle: 'La pasión vital, la devoción incondicional y la belleza afectiva',
    icon: '💖',
    motto: '«Solo se ve bien con el corazón; lo esencial es invisible a los ojos.»',
    quote: '«Amar no es mirarse el uno al otro, sino mirar juntos en la misma dirección a través de la tormenta.»',
    coreDesire: 'Experimentar la intimidad profunda, el éxtasis de la conexión humana y celebrar la belleza del cosmos.',
    greatestFear: 'La soledad, la indiferencia emocional, la frialdad o ser incapaz de conectar con el alma del otro.',
    neuroTrigger: 'Oxitocina, Dopamina y Endorfinas de Apego',
    neuroExplanation: 'Inunda el cerebro con la química del apego seguro y la empatía estética. Activa el área tegmental ventral y la corteza orbitofrontal.',
    neuroBadge: 'Oxitocina · Apego Seguro',
    functionDesc: 'Representa el motivo por el cual la vida merece ser vivida: la belleza, el amor filial, romántico o comunitario que trasciende el ego.',
    shadowWeakness: 'Celos destructivos, perder su propia identidad por complacer al otro, obsesión absorbente.',
    personalityTraits: [
      'Sensibilidad estética exquisita: percibe matices de belleza que otros pasan por alto.',
      'Generosidad afectiva desbordante y entrega incondicional a las personas que ama.',
      'Mediador intuitivo: busca la reconciliación y el diálogo antes que la confrontación.',
      'Conexión visceral con la música, la poesía y los símbolos afectivos.',
      'Vulnerabilidad aguda al rechazo, la frialdad emocional o la indiferencia ajena.',
      'Capacidad conmovedora de perdón y reconstrucción de puentes rotos.'
    ],
    classicExample: 'Romeo y Julieta, Orfeo y Eurídice, Tristán e Isolda',
    modernExample: 'Peeta Mellark (Los Juegos del Hambre), Rose Dawson (Titanic)',
    mayanExample: 'Ixchel y Zamná (Las deidades del amor, la luna y los tejidos sagrados)',
    writingTip: 'El amor no tiene que ser romántico: puede ser amor por el arte, por la verdad científica, por la tierra o por un hermano.',
    crucibleTrial: 'Amar tanto a alguien que esté dispuesto a dejarlo ir si esa es la única forma de que esa persona sea libre y feliz.',
    relations: [
      { targetArchetype: 'El Héroe', relationRole: 'Brújula del Corazón', sparkDescription: 'Le recuerda al héroe que la gloria sin amor es solo un páramo congelado.' }
    ],
    color: '#f472b6'
  },
  {
    id: 'soberano',
    name: 'El Soberano / El Gobernante',
    roleSubtitle: 'El orden, la responsabilidad colectiva y el peso de la corona',
    icon: '👑',
    motto: '«El poder no es un privilegio: es la carga de servir a todos.»',
    quote: '«Un rey que solo piensa en su corona olvida que su cabeza pertenece a su pueblo.»',
    coreDesire: 'Crear una comunidad próspera, estable y justa que perdure a través de las generaciones.',
    greatestFear: 'El caos, la anarquía, la corrupción de su legado o convertirse en un tirano ciego.',
    neuroTrigger: 'Control Ejecutivo y Búsqueda de Homeostasis Social',
    neuroExplanation: 'Despierta la red de control ejecutivo prefrontal. Evalúa la justicia distributiva y la estabilidad a largo plazo del colectivo.',
    neuroBadge: 'Control Ejecutivo · Prefrontal',
    functionDesc: 'Encarna la institución y el bien común. Debe tomar decisiones difíciles donde no hay soluciones perfectas, solo compensaciones éticas.',
    shadowWeakness: 'Tiranía autoritaria, paranoia de perder el control, incapacidad de delegar poder.',
    personalityTraits: [
      'Presencia regia y aplomo sereno: transmite seguridad en medio de la tormenta.',
      'Pensamiento sistémico y visión a largo plazo centrada en el porvenir colectivo.',
      'Sentido mayúsculo del deber cívico: sacrifica deseos privados por el bien común.',
      'Capacidad templada para tomar resoluciones dolorosas sin perder la compostura.',
      'Soledad interior derivada de la investidura y la sospecha constante de adulación falsa.',
      'Rigor ético inflexible que valora la palabra dada por encima de cualquier contrato.'
    ],
    classicExample: 'El Rey Arturo, Salomón, Creonte en Tebas',
    modernExample: 'Mufasa (El Rey León), Aragorn (El Retorno del Rey), TʼChalla (Black Panther)',
    mayanExample: 'Kʼinich Janaabʼ Pakal (El gran gobernante y constructor de Palenque)',
    writingTip: 'Muestra el precio personal del liderazgo: las noches sin dormir, la soledad de la cumbre y las renuncias a sus deseos íntimos.',
    crucibleTrial: 'Dictar una sentencia o ley que le desgarre el corazón personalmente, pero que sea vital para salvar a su pueblo.',
    relations: [
      { targetArchetype: 'El Rebelde', relationRole: 'Némesis y Recordatorio', sparkDescription: 'El rebelde le muestra dónde el orden se ha vuelto injusto o asfixiante.' },
      { targetArchetype: 'El Mentor', relationRole: 'Consejero de Estado', sparkDescription: 'Busca su consejo cuando las pasiones políticas amenazan con nublar su juicio.' }
    ],
    color: '#eab308'
  }
];

export interface DimensionPillar {
  id: string;
  name: string;
  icon: string;
  color: string;
  headline: string;
  description: string;
  questions: string[];
  scientificMechanism: string;
}

export const CHARACTER_DIMENSIONS: DimensionPillar[] = [
  {
    id: 'fisiologica',
    name: '1. Dimensión Fisiológica (Lo Exterior)',
    icon: '🧬',
    color: '#38bdf8',
    headline: 'El vehículo biológico que percibe y habita el mundo',
    description: 'Abarca todo lo tangible: edad, fisonomía, postura, cicatrices, salud, vestimenta y lenguaje corporal. Es el primer anclaje sensorial que el cerebro del lector procesa a través de la corteza visual y auditiva.',
    questions: [
      '¿Qué edad tiene y cómo influye en su nivel de energía y experiencia corporal?',
      '¿Tiene alguna cicatriz, rasgo físico o defecto visible que cuente una historia sin palabras?',
      '¿Cómo camina cuando está bajo estrés versus cuando se siente en confianza?',
      '¿Qué objeto o prenda lleva siempre consigo que funcione como talismán?'
    ],
    scientificMechanism: 'Las neuronas espejo motoras necesitan detalles físicos concretos para proyectar cinéticamente al personaje en la mente del lector.'
  },
  {
    id: 'sociologica',
    name: '2. Dimensión Sociológica (El Entorno)',
    icon: '🌍',
    color: '#fbbf24',
    headline: 'El ecosistema cultural, familiar y social que moldeó su visión',
    description: 'Nadie nace en el vacío. Esta dimensión explora su clase social, su comunidad de origen, la relación con sus padres, su educación, sus lealtades de grupo y los prejuicios de su época.',
    questions: [
      '¿En qué entorno creció y qué reglas implícitas aprendió para sobrevivir?',
      '¿Cuál es su ocupación diaria y qué herramientas utiliza con maestría?',
      '¿A qué grupo o causa le debe lealtad y qué grupo lo considera un extraño?',
      '¿Cómo habla? (¿Usa jerga técnica, modismos poéticos, silencios cautelosos?)'
    ],
    scientificMechanism: 'La red cerebral de cognición social contextualiza los motivos del personaje. Un acto adquiere peso dramático según las normas de su cultura.'
  },
  {
    id: 'psicologica',
    name: '3. Dimensión Psicológica (La Herida y la Contradicción)',
    icon: '🧠',
    color: '#f43f5e',
    headline: 'El abismo interior: La mentira nuclear, el fantasma y el deseo',
    description: 'El núcleo de la tridimensionalidad. Todo personaje memorable tiene un Deseo Consciente (lo que cree querer) y una Necesidad Inconsciente (lo que realmente necesita para sanar), separados por una Herida del Pasado (*The Ghost*).',
    questions: [
      '¿Cuál es su Mentira Nuclear? (La creencia falsa que tiene sobre sí mismo o el mundo)',
      '¿Cuál es su Herida Oculta / Fantasma del pasado que aún no ha sanado?',
      '¿Cuál es su Deseo Superficial versus su Necesidad Espiritual profunda?',
      '¿Cuál es su Contradicción Neurocreativa? (El rasgo que rompe el cliché y sorprende al cerebro)'
    ],
    scientificMechanism: 'Dispara la Teoría de la Mente (ToM) y la liberación de Oxitocina. La mente del lector solo genera apego empático ante la vulnerabilidad y la contradicción humana.'
  }
];
