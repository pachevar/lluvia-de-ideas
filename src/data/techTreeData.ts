import type { TechNode } from '../types';

/**
 * Categorías temáticas y metadatos de las 30 columnas del Árbol Tecnológico de Sutz
 */
export const TECH_TREE_COLUMNS_META: Record<number, { title: string; tier: string; badgeColor: string }> = {
  1: { title: 'Raíces del Conocimiento', tier: 'Tier 1 • Fundamentos', badgeColor: '#00e5ff' },
  2: { title: 'Revolución Neolítica', tier: 'Tier 1 • Orígenes', badgeColor: '#00e5ff' },
  3: { title: 'Primeras Civilizaciones Urbanas', tier: 'Tier 1 • Antigüedad', badgeColor: '#00e5ff' },
  4: { title: 'Edad del Hierro y Escuelas', tier: 'Tier 1 • Clásicos', badgeColor: '#00e5ff' },
  5: { title: 'Ilustración Clásica', tier: 'Tier 1 • Grecia y Asia', badgeColor: '#00e5ff' },
  6: { title: 'Helenismo e Innovación Oriental', tier: 'Tier 1 • Alejandría', badgeColor: '#00e5ff' },
  7: { title: 'Edad de Oro Islámica y Edad Media', tier: 'Tier 1 • Saber Escolástico', badgeColor: '#00e5ff' },
  8: { title: 'Renacimiento', tier: 'Tier 1 • Humanismo e Imprenta', badgeColor: '#00e5ff' },
  9: { title: 'Revolución Científica', tier: 'Tier 1 • Empirismo', badgeColor: '#00e5ff' },
  10: { title: 'Siglo de las Luces', tier: 'Tier 1 • Neoclasicismo', badgeColor: '#00e5ff' },
  11: { title: 'Primera Revolución Industrial', tier: 'Tier 1 • Vapor y Telégrafo', badgeColor: '#00e5ff' },
  12: { title: 'Siglo XIX Tardío', tier: 'Tier 1 • Mecanización', badgeColor: '#00e5ff' },
  13: { title: 'Inicio del Siglo XX', tier: 'Tier 1 • Relatividad y Psique', badgeColor: '#00e5ff' },
  14: { title: 'Era Mecanizada y Diseño Moderno', tier: 'Tier 1 • Bauhaus y Cine', badgeColor: '#00e5ff' },
  15: { title: 'Mediados del Siglo XX', tier: 'Tier 1 • Cómputo y Átomo', badgeColor: '#00e5ff' },
  16: { title: 'Alba de la Era Digital', tier: 'Tier 2 • Transistores y ADN', badgeColor: '#ff2ec4' },
  17: { title: 'Microcircuitos y Redes Primitivas', tier: 'Tier 2 • ARPANET y Láser', badgeColor: '#ff2ec4' },
  18: { title: 'La Computadora Personal', tier: 'Tier 2 • GUI y TCP/IP', badgeColor: '#ff2ec4' },
  19: { title: 'Expansión de la World Wide Web', tier: 'Tier 2 • HTML y Movilidad', badgeColor: '#ff2ec4' },
  20: { title: 'Genómica y Conectividad Global', tier: 'Tier 2 • Genoma y Wi-Fi', badgeColor: '#ff2ec4' },
  21: { title: 'Era del Smartphone y la Nube', tier: 'Tier 2 • Cloud y CRISPR', badgeColor: '#ff2ec4' },
  22: { title: 'Despegue del Aprendizaje Profundo', tier: 'Tier 2 • CNNs e IoT', badgeColor: '#ff2ec4' },
  23: { title: 'IA Generativa e Biología Computacional', tier: 'Tier 2 • Transformers y AlphaFold', badgeColor: '#ff2ec4' },
  24: { title: 'Era de la Multimodalidad', tier: 'Tier 2 • LLMs y Neomórficos', badgeColor: '#ff2ec4' },
  25: { title: 'Agentes Autónomos y Razonamiento', tier: 'Tier 2 • System 2 AI y Cuántica', badgeColor: '#ff2ec4' },
  26: { title: 'Robótica Humanoide y BCI', tier: 'Tier 3 • Motores Neuronales y Fusión', badgeColor: '#ffc24d' },
  27: { title: 'Redes Energéticas e Inteligencia Distribuida', tier: 'Tier 3 • Bioimpresión y Fotónica', badgeColor: '#ffc24d' },
  28: { title: 'Biología Sintética y Redes Cuánticas', tier: 'Tier 3 • Genomas Sintéticos y Nanorrobotica', badgeColor: '#ffc24d' },
  29: { title: 'Frontera Espacial y Extensión Cognitiva', tier: 'Tier 3 • Propulsión Nuclear y World Models', badgeColor: '#ffc24d' },
  30: { title: 'Era de la Superinteligencia y Coexistencia', tier: 'Tier 3 • AGI y Fusión Comercial', badgeColor: '#ffc24d' }
};

interface RawNodeData {
  title: string;
  desc: string;
  category: 'STEM' | 'HUMANIDADES' | 'APRENDIZAJE';
  icon: string;
}

const RAW_NODES_DATA: Record<number, RawNodeData[]> = {
  // COLUMNA 1 (3 Nodos Raíz)
  1: [
    { title: 'Control del Fuego y Manipulación de la Materia', desc: 'Inicio de la física aplicada, la química del procesamiento térmico y la observación empírica del entorno físico.', category: 'STEM', icon: '🔥' },
    { title: 'Pensamiento Simbólico y Expresión Estética', desc: 'Nacimiento del arte rupestre, la abstracción visual, la introspección, la ética comunitaria y las primeras preguntas sobre la existencia.', category: 'HUMANIDADES', icon: '🎨' },
    { title: 'Lenguaje Estructurado y Transmisión Oral', desc: 'Creación de las estructuras sintácticas para el razonamiento lógico, la retención de historias y la capacidad de enseñar a otros.', category: 'APRENDIZAJE', icon: '🗣️' }
  ],

  // COLUMNA 2
  2: [
    { title: 'Agricultura Seleccionada y Botánica Primitiva', desc: 'Modificación intencionada de especies vegetales.', category: 'STEM', icon: '🌾' },
    { title: 'Alfarería y Termodinámica del Barro', desc: 'Moldeado y cocción de recipientes térmicos.', category: 'STEM', icon: '🏺' },
    { title: 'Mitología Cosmogónica e Identidad Tribal', desc: 'Primeras narrativas sobre el origen del mundo y normas morales.', category: 'HUMANIDADES', icon: '🗿' },
    { title: 'Adorno Personal y Escultura Primitiva', desc: 'Expresión estética de estatus, belleza y ritos antiguos.', category: 'HUMANIDADES', icon: '💎' },
    { title: 'Contabilidad Mnemónica y Marcas de Conteo', desc: 'Muescas en hueso y madera para registrar cantidades y tiempo.', category: 'APRENDIZAJE', icon: '🦴' },
    { title: 'Mnemotecnia Narrativa y Tradición Oral', desc: 'Estructuración de cuentos para retener conocimiento acumulado.', category: 'APRENDIZAJE', icon: '📖' }
  ],

  // COLUMNA 3
  3: [
    { title: 'Arquitectura Megalítica y Geometría Topográfica', desc: 'Medición espacial para grandes construcciones sintonizadas con el entorno.', category: 'STEM', icon: '🏛️' },
    { title: 'Metalurgia del Cobre y Bronce', desc: 'Aleación de minerales y química de alta temperatura.', category: 'STEM', icon: '⚔️' },
    { title: 'Codificación Ética y Leyes Escritas', desc: 'Estructuras formales de justicia social (Código de Hammurabi).', category: 'HUMANIDADES', icon: '📜' },
    { title: 'Poesía Épica Primitiva', desc: 'Retórica sobre la mortalidad y la condición humana (Cantar de Gilgamesh).', category: 'HUMANIDADES', icon: '🎭' },
    { title: 'Escritura Pictográfica y Cuneiforme', desc: 'Abstracción gráfica de palabras y conceptos sobre tablillas.', category: 'APRENDIZAJE', icon: '✍️' },
    { title: 'Taxonomía de Categorías Básicas', desc: 'Clasificación del entorno en listas temáticas escritas.', category: 'APRENDIZAJE', icon: '📋' }
  ],

  // COLUMNA 4
  4: [
    { title: 'Siderurgia del Hierro', desc: 'Herramientas y utensilios de alta resistencia física.', category: 'STEM', icon: '🔨' },
    { title: 'Hidráulica y Canales de Irrigación', desc: 'Control numérico y físico del flujo de agua para grandes terrenos.', category: 'STEM', icon: '🌊' },
    { title: 'Filosofía Presocrática y Cosmología', desc: 'Búsqueda del arché (principio) mediante la razón y no el mito.', category: 'HUMANIDADES', icon: '🌌' },
    { title: 'Tragedia y Dramaturgia Primitiva', desc: 'Exploración de conflictos emocionales y catarsis colectiva.', category: 'HUMANIDADES', icon: '🎭' },
    { title: 'Alfabeto Fonético Consonántico', desc: 'Reducción drástica de símbolos para facilitar la alfabetización.', category: 'APRENDIZAJE', icon: '🔤' },
    { title: 'Dialéctica y Debate Estructurado', desc: 'Reglas para la confrontación argumentativa de ideas.', category: 'APRENDIZAJE', icon: '💬' }
  ],

  // COLUMNA 5
  5: [
    { title: 'Geometría Euclidiana y Axiomática', desc: 'Formalización del razonamiento matemático deducido.', category: 'STEM', icon: '📐' },
    { title: 'Mecánica Estática (Palancas y Poleas)', desc: 'Leyes físicas de la ventaja mecánica.', category: 'STEM', icon: '⚙️' },
    { title: 'Ética Ciudadana y Teoría Política', desc: 'Modelos de organización social y virtud (Platón/Aristóteles).', category: 'HUMANIDADES', icon: '🏛️' },
    { title: 'Canon de Proporción Artística', desc: 'Estética basada en el orden numérico y la anatomía humana.', category: 'HUMANIDADES', icon: '🗿' },
    { title: 'Lógica Silogística (Organon)', desc: 'Estructura formal del razonamiento deductivo.', category: 'APRENDIZAJE', icon: '🧠' },
    { title: 'Comprensión Lectora Hermenéutica', desc: 'Análisis de textos filosóficos y poéticos complejos.', category: 'APRENDIZAJE', icon: '📜' }
  ],

  // COLUMNA 6
  6: [
    { title: 'Cálculo Terrestre y Cartografía', desc: 'Medición de la circunferencia de la Tierra y geografía matemática (Eratóstenes).', category: 'STEM', icon: '🌍' },
    { title: 'Fabricación del Papel', desc: 'Soporte ligero desarrollado en China que revoluciona el almacenamiento de datos.', category: 'STEM', icon: '📄' },
    { title: 'Estoicismo y Epicureísmo', desc: 'Filosofías del autocontrol, bienestar emocional y salud mental.', category: 'HUMANIDADES', icon: '🧘' },
    { title: 'Historiografía Crítica', desc: 'Análisis objetivo de eventos pasados sin intervención divina (Tucídides/Sima Qian).', category: 'HUMANIDADES', icon: '📜' },
    { title: 'Bibliotecas Centralizadas', desc: 'Clasificación, catalogación y preservación del saber (Biblioteca de Alejandría).', category: 'APRENDIZAJE', icon: '📚' },
    { title: 'Gramática Formal y Sintaxis', desc: 'Reglas explícitas del lenguaje escrito y su análisis.', category: 'APRENDIZAJE', icon: '📝' }
  ],

  // COLUMNA 7
  7: [
    { title: 'Álgebra y Notación con el Cero', desc: 'Métodos de cálculo simbólico desarrollados por Al-Juarismi.', category: 'STEM', icon: '🔢' },
    { title: 'Óptica Experimental y Lentes', desc: 'Estudio físico de la luz y la visión por Ibn al-Haytham.', category: 'STEM', icon: '🔍' },
    { title: 'Arquitectura Sacra e Iluminación', desc: 'Arte visual orientado a la contemplación trascendente.', category: 'HUMANIDADES', icon: '🏰' },
    { title: 'Humanismo Literario Temprano', desc: 'Exploración de la subjetividad, la poesía mística y el amor.', category: 'HUMANIDADES', icon: '🖋️' },
    { title: 'Método Escolástico y Disputatio', desc: 'Análisis crítico de textos mediante objeciones y respuestas.', category: 'APRENDIZAJE', icon: '⚖️' },
    { title: 'Universidades e Institucionalización', desc: 'Institucionalización del aprendizaje y certificación de competencias.', category: 'APRENDIZAJE', icon: '🎓' }
  ],

  // COLUMNA 8
  8: [
    { title: 'Imprenta de Tipos Móviles', desc: 'Democratización masiva de la tecnología de la información (Gutenberg).', category: 'STEM', icon: '🖨️' },
    { title: 'Anatomía Científica e Ilustración', desc: 'Visualización médica de alta precisión (Vesalio).', category: 'STEM', icon: '🫀' },
    { title: 'Perspectiva Lineal Geométrica', desc: 'Unión de matemática y arte para la representación espacial (Brunelleschi/Da Vinci).', category: 'HUMANIDADES', icon: '🖼️' },
    { title: 'Ensayo Literario y Auto-Reflexión', desc: 'Invención del género para explorar el pensamiento propio (Montaigne).', category: 'HUMANIDADES', icon: '✍️' },
    { title: 'Pedagogía Humanista Integral', desc: 'Educación centrada en el desarrollo integral del estudiante (Erasmo).', category: 'APRENDIZAJE', icon: '🌱' },
    { title: 'Lectura Crítica y Filología', desc: 'Cotejo de fuentes originales para detectar manipulaciones textuales.', category: 'APRENDIZAJE', icon: '🧐' }
  ],

  // COLUMNA 9
  9: [
    { title: 'Telescopio y Helio-centrismo', desc: 'Rompimiento observacional del modelo físico del cosmos.', category: 'STEM', icon: '🔭' },
    { title: 'Cálculo Infinitesimal', desc: 'Matemáticas del movimiento y el cambio continuo (Newton/Leibniz).', category: 'STEM', icon: '∫' },
    { title: 'Teoría del Contrato Social', desc: 'Filosofía sobre el origen del poder y los derechos humanos (Hobbes/Locke).', category: 'HUMANIDADES', icon: '📜' },
    { title: 'Estética de la Ilustración', desc: 'Teoría filosófica sobre lo bello, lo sublime y la crítica del arte.', category: 'HUMANIDADES', icon: '🏛️' },
    { title: 'Método Científico Empírico', desc: 'Protocolos sistemáticos para el pensamiento duda-prueba (Bacon/Descartes).', category: 'APRENDIZAJE', icon: '🧪' },
    { title: 'Enciclopedismo y Mapeo del Saber', desc: 'Sistematización y catalogación universal del conocimiento humano (Diderot).', category: 'APRENDIZAJE', icon: '📚' }
  ],

  // COLUMNA 10
  10: [
    { title: 'Máquina de Vapor Temprana', desc: 'Conversión de energía térmica en trabajo mecánico.', category: 'STEM', icon: '🚂' },
    { title: 'Pila Voltaica y Electroquímica', desc: 'Dominio inicial de la corriente eléctrica continua.', category: 'STEM', icon: '🔋' },
    { title: 'Filosofía Crítica y Epistemología', desc: 'Estudio profundo sobre los límites de la razón y la percepción (Kant).', category: 'HUMANIDADES', icon: '🧠' },
    { title: 'Novela Moderna y Psicología', desc: 'Narrativa estructurada alrededor de la psicología interna del individuo.', category: 'HUMANIDADES', icon: '📖' },
    { title: 'Educación Cívica Universal', desc: 'Teorización de la infancia y etapas del aprendizaje (Rousseau/Pestalozzi).', category: 'APRENDIZAJE', icon: '🏫' },
    { title: 'Análisis Semántico Comparado', desc: 'Comprensión de las raíces lingüísticas e intertransversales.', category: 'APRENDIZAJE', icon: '🔍' }
  ],

  // COLUMNA 11
  11: [
    { title: 'Termodinámica Formal y Motores', desc: 'Leyes de conservación y eficiencia de la energía mecánica.', category: 'STEM', icon: '⚙️' },
    { title: 'Telégrafo Eléctrico', desc: 'Redes de comunicación inmediata a larga distancia.', category: 'STEM', icon: '📡' },
    { title: 'Expresionismo Romántico y Sinfonías', desc: 'Priorización de la intuición emocional sobre la razón pura.', category: 'HUMANIDADES', icon: '🎻' },
    { title: 'Crítica Socio-Económica', desc: 'Análisis ético de los modos de producción e industrialización (Marx/Mill).', category: 'HUMANIDADES', icon: '⚖️' },
    { title: 'Psicología Experimental Primitiva', desc: 'Medición científica de la percepción y la atención (Wundt).', category: 'APRENDIZAJE', icon: '🧠' },
    { title: 'Métodos de Alfabetización Masiva', desc: 'Sistemas pedagógicos para la instrucción en escuelas públicas.', category: 'APRENDIZAJE', icon: '📚' }
  ],

  // COLUMNA 12
  12: [
    { title: 'Electromagnetismo Unificado', desc: 'Comprensión teórica unificada de ondas y energía (Maxwell).', category: 'STEM', icon: '⚡' },
    { title: 'Teoría Germinal y Antisépticos', desc: 'Comprensión microbiológica de la salud y prevención médica.', category: 'STEM', icon: '🧫' },
    { title: 'Existencialismo Temprano', desc: 'Filosofía sobre el sentido personal, la angustia y la libertad (Kierkegaard/Nietzsche).', category: 'HUMANIDADES', icon: '🕯️' },
    { title: 'Fotografía como Arte e Indagación', desc: 'Captura directa y química de la realidad visual.', category: 'HUMANIDADES', icon: '📷' },
    { title: 'Test de Inteligencia y Diagnóstico', desc: 'Evaluación formal de capacidades cognitivas (Binet).', category: 'APRENDIZAJE', icon: '📝' },
    { title: 'Aprendizaje Conductista', desc: 'Condicionamiento y formación científica de hábitos (Pavlov/Thorndike).', category: 'APRENDIZAJE', icon: '🐕' }
  ],

  // COLUMNA 13
  13: [
    { title: 'Relatividad y Física Cuántica', desc: 'Redefinición teórica de espacio, tiempo, gravedad y materia.', category: 'STEM', icon: '⚛️' },
    { title: 'Motor de Combustión e Petroquímica', desc: 'Portabilidad energética de alta densidad mecánica.', category: 'STEM', icon: '🚗' },
    { title: 'Psicoanálisis del Subconsciente', desc: 'Mapeo de la psique y los impulsos no conscientes (Freud/Jung).', category: 'HUMANIDADES', icon: '🌀' },
    { title: 'Vanguardias Artísticas', desc: 'Ruptura radical con la representación mimética (Cubismo/Surrealismo).', category: 'HUMANIDADES', icon: '🎨' },
    { title: 'Constructivismo Pedagógico', desc: 'El aprendizaje como construcción activa y social (Piaget/Vygotsky).', category: 'APRENDIZAJE', icon: '🧱' },
    { title: 'Lingüística Estructural', desc: 'Estudio del lenguaje como un sistema interrelacionado de signos (Saussure).', category: 'APRENDIZAJE', icon: '🔤' }
  ],

  // COLUMNA 14
  14: [
    { title: 'Electrónica de Vacío y Radio', desc: 'Comunicación analógica por ondas hertzianas.', category: 'STEM', icon: '📻' },
    { title: 'Polímeros y Penicilina', desc: 'Síntesis química molecular y revolución médica antibiótica.', category: 'STEM', icon: '💊' },
    { title: 'Escuela de la Bauhaus', desc: 'Confluencia entre estética, arte y tecnología integrada a lo cotidiano.', category: 'HUMANIDADES', icon: '🏗️' },
    { title: 'Cine de Autor y Lenguaje Audiovisual', desc: 'Narrativa mediante el montaje cinematográfico.', category: 'HUMANIDADES', icon: '🎬' },
    { title: 'Semiótica y Análisis del Discurso', desc: 'Desmontaje crítico de los significados en los medios de comunicación.', category: 'APRENDIZAJE', icon: '🔍' },
    { title: 'Pensamiento Crítico Formal', desc: 'Herramientas lógicas para detectar falacias y sesgos de razonamiento.', category: 'APRENDIZAJE', icon: '⚖️' }
  ],

  // COLUMNA 15
  15: [
    { title: 'Computación Electromecánica y Criptografía', desc: 'Algoritmos automáticos de cálculo y encriptación.', category: 'STEM', icon: '💻' },
    { title: 'Fisión Nuclear Controlada', desc: 'Manipulación de energía subatómica de gran escala.', category: 'STEM', icon: '☢️' },
    { title: 'Filosofía del Lenguaje y Hermenéutica', desc: 'El lenguaje como límite del mundo humano (Wittgenstein/Gadamer).', category: 'HUMANIDADES', icon: '🗣️' },
    { title: 'Responsabilidad Ética Tecnológica', desc: 'Reflexión filosófica sobre el poder tecnológico y la condición humana (Jonas/Arendt).', category: 'HUMANIDADES', icon: '🛡️' },
    { title: 'Taxonomía Objetivos Educativos', desc: 'Clasificación de niveles de procesamiento cognitivo (Bloom).', category: 'APRENDIZAJE', icon: '📊' },
    { title: 'Teoría de la Información', desc: 'Métricas sobre transmisión, ruido y comprensión de mensajes (Shannon).', category: 'APRENDIZAJE', icon: '📶' }
  ],

  // COLUMNAS 16 A 30 (12 NODOS POR COLUMNA: 4 STEM, 4 HUMANIDADES, 4 APRENDIZAJE)
  16: [
    { title: 'Transistor de Estado Sólido', desc: 'Miniaturización electrónica revolucionaria.', category: 'STEM', icon: '🎛️' },
    { title: 'Arquitectura Von Neumann', desc: 'Procesamiento de programas almacenados en memoria.', category: 'STEM', icon: '💾' },
    { title: 'Estructura Molecular del ADN', desc: 'Descubrimiento del código fuente biológico de la vida.', category: 'STEM', icon: '🧬' },
    { title: 'Cibernética y Retroalimentación', desc: 'Sistemas de autocontrol en máquinas y seres vivos.', category: 'STEM', icon: '🤖' },
    { title: 'Arte Pop y Crítica del Consumo', desc: 'El objeto cotidiano y comercial elevado a expresión artística.', category: 'HUMANIDADES', icon: '🍿' },
    { title: 'Bioética Formal', desc: 'Principios éticos para la intervención médica y biológica.', category: 'HUMANIDADES', icon: '⚕️' },
    { title: 'Narrativa de Ciencia Ficción Proyectiva', desc: 'Filosofía especulativa sobre el futuro de la especie humana.', category: 'HUMANIDADES', icon: '🚀' },
    { title: 'Diseño Centrado en el Humano', desc: 'Ergonomía cognitiva y emocional de herramientas e interfaces.', category: 'HUMANIDADES', icon: '👤' },
    { title: 'Psicología Cognitiva Moderna', desc: 'La mente humana comprendida como procesador activo de información (Neisser).', category: 'APRENDIZAJE', icon: '🧠' },
    { title: 'Programación Educativa (LOGO)', desc: 'Desarrollo del pensamiento computacional en la infancia (Papert).', category: 'APRENDIZAJE', icon: '🐢' },
    { title: 'Teoría de Esquemas de Lectura', desc: 'Estructuras mentales previas para la comprensión lectora (Schema Theory).', category: 'APRENDIZAJE', icon: '📖' },
    { title: 'Técnicas de Lectura Velocidad y Escaneo', desc: 'Optimización del procesamiento de información masiva.', category: 'APRENDIZAJE', icon: '⚡' }
  ],

  17: [
    { title: 'Circuito Integrado de Silicio', desc: 'Concurrencia de múltiples circuitos en una sola placa.', category: 'STEM', icon: '🔲' },
    { title: 'LÁSER y Telecomunicaciones Ópticas', desc: 'Manipulación de luz coherente para transmisión de datos.', category: 'STEM', icon: '🔴' },
    { title: 'Conmutación de Paquetes (ARPANET)', desc: 'Descentralización de la comunicación en red.', category: 'STEM', icon: '🌐' },
    { title: 'Materiales Semiconductores', desc: 'Control atómico de materiales conductores.', category: 'STEM', icon: '🔬' },
    { title: 'Postmodernismo Filosofico', desc: 'Cuestionamiento de los grandes metarrelatos e historias cerradas.', category: 'HUMANIDADES', icon: '🏛️' },
    { title: 'Arte Conceptual', desc: 'La idea o concepto priorizado sobre la técnica física.', category: 'HUMANIDADES', icon: '💡' },
    { title: 'Ecología Política y Filosofía Ambiental', desc: 'La naturaleza como sujeto formal de derecho y conservación.', category: 'HUMANIDADES', icon: '🌿' },
    { title: 'Antropología Urbana y Medios', desc: 'Estudio cultural de comunidades en entornos densos y mediáticos.', category: 'HUMANIDADES', icon: '🏙️' },
    { title: 'Aprendizaje Basado en Problemas (PBL)', desc: 'Metodología didáctica orientada a la investigación activa.', category: 'APRENDIZAJE', icon: '🧩' },
    { title: 'Teoría Inteligencias Múltiples', desc: 'Reconocimiento de diversos perfiles cognitivos humanos (Gardner).', category: 'APRENDIZAJE', icon: '🎯' },
    { title: 'Metacognición y Autorregulación', desc: 'Aprender a evaluar y regular el propio proceso mental.', category: 'APRENDIZAJE', icon: '🧘' },
    { title: 'Alfabetización Mediática', desc: 'Habilidad para descifrar sesgos en televisión y prensa escrita.', category: 'APRENDIZAJE', icon: '📺' }
  ],

  18: [
    { title: 'Microprocesador Unificado', desc: 'CPU condensada íntegramente en un chip de silicio.', category: 'STEM', icon: '🔲' },
    { title: 'Protocolos TCP/IP', desc: 'Estándar universal para la interconexión global de redes.', category: 'STEM', icon: '🔌' },
    { title: 'Copiado de ADN (PCR)', desc: 'Reacción en cadena de la polimerasa para multiplicación genética.', category: 'STEM', icon: '🧬' },
    { title: 'Interfaz Gráfica de Usuario (GUI)', desc: 'Visualización intuitiva mediante ventanas e íconos.', category: 'STEM', icon: '🖥️' },
    { title: 'Estética Digital y Pixel Art', desc: 'Lenguajes visuales nacidos de las limitaciones del hardware.', category: 'HUMANIDADES', icon: '👾' },
    { title: 'Ética del Hacker y Cultura Libre', desc: 'Filosofía del acceso abierto y colaborativo a la información.', category: 'HUMANIDADES', icon: '🔓' },
    { title: 'Narratología e Hipertexto', desc: 'Historias no lineales donde el lector toma decisiones.', category: 'HUMANIDADES', icon: '🔀' },
    { title: 'Psicología Humanista', desc: 'Autoactualización, empatía y desarrollo del potencial humano (Rogers/Maslow).', category: 'HUMANIDADES', icon: '❤️' },
    { title: 'Aprendizaje Situado', desc: 'Cognición integrada al contexto y comunidades de práctica (Lave/Wenger).', category: 'APRENDIZAJE', icon: '👥' },
    { title: 'Razonamiento Abductivo Creativo', desc: 'Lógica de hipótesis creativas para la resolución de problemas.', category: 'APRENDIZAJE', icon: '💡' },
    { title: 'Textos Digitales No Lineales', desc: 'Navegación lógica entre enlaces, hipervínculos y nodos.', category: 'APRENDIZAJE', icon: '🔗' },
    { title: 'Evaluación Formativa Inmediata', desc: 'Medición continua del progreso cognitivo del estudiante.', category: 'APRENDIZAJE', icon: '📈' }
  ],

  19: [
    { title: 'Lenguaje HTML y Protocolo HTTP', desc: 'Creación de la red hipertextual global (World Wide Web).', category: 'STEM', icon: '🌐' },
    { title: 'Telefonía Celular Digital (GSM)', desc: 'Movilidad de redes de voz y datos de alta cobertura.', category: 'STEM', icon: '📱' },
    { title: 'Compresión Multimedia (MP3/JPEG)', desc: 'Algoritmos eficientes para la transmisión de audio e imágenes.', category: 'STEM', icon: '🎵' },
    { title: 'Baterías de Iones de Litio', desc: 'Energía portátil de alta densidad para dispositivos móviles.', category: 'STEM', icon: '🔋' },
    { title: 'Filosofía de la Ciber-Cultura', desc: 'Identidades fluidas y comunidades virtuales (Lévy/Haraway).', category: 'HUMANIDADES', icon: '🌐' },
    { title: 'Videojuegos como Arte Expresivo', desc: 'Madurez del medio interactivo para narrar historias complejas.', category: 'HUMANIDADES', icon: '🎮' },
    { title: 'Privacidad y Ética de Datos', desc: 'Primeras reflexiones formales sobre la huella digital personal.', category: 'HUMANIDADES', icon: '🔒' },
    { title: 'Síntesis Digital y Sampling', desc: 'Creatividad musical basada en la reconfiguración sonora.', category: 'HUMANIDADES', icon: '🎧' },
    { title: 'Conectivismo', desc: 'El aprendizaje comprendido como red de nodos interconectados (Siemens/Downes).', category: 'APRENDIZAJE', icon: '🕸️' },
    { title: 'Pensamiento de Diseño (Design Thinking)', desc: 'Metodología estructurada para la innovación empática.', category: 'APRENDIZAJE', icon: '💡' },
    { title: 'Curaduría de Información', desc: 'Filtro y selección crítica ante la infoxicación de datos.', category: 'APRENDIZAJE', icon: '🧹' },
    { title: 'Pensamiento Algorítmico Desconectado', desc: 'Descomposición lógica de problemas cotidianos sin pantalla.', category: 'APRENDIZAJE', icon: '🧩' }
  ],

  20: [
    { title: 'Genoma Humano Secuenciado', desc: 'Lectura completa del libro genético de la vida humana.', category: 'STEM', icon: '🧬' },
    { title: 'Redes Inalámbricas Wi-Fi', desc: 'Acceso a datos de alta velocidad libre de cables.', category: 'STEM', icon: '📶' },
    { title: 'Búsqueda por Relevancia (PageRank)', desc: 'Organización algorítmica y jerárquica de la Web.', category: 'STEM', icon: '🔍' },
    { title: 'Pantallas Táctiles Capacitivas', desc: 'Interacción háptica directa con interfaces electrónicas.', category: 'STEM', icon: '👆' },
    { title: 'Inteligencia Colectiva y Prosumidores', desc: 'El usuario que crea y consume cultura simultáneamente.', category: 'HUMANIDADES', icon: '🐝' },
    { title: 'Filosofía de la Transparencia', desc: 'Impacto de la hiperconectividad en las instituciones globales.', category: 'HUMANIDADES', icon: '🏛️' },
    { title: 'Arte Generativo por Código', desc: 'Estética producida mediante software y reglas matemáticas.', category: 'HUMANIDADES', icon: '💻' },
    { title: 'Micro-Narrativas y Retórica Visual', desc: 'Comunicación en formatos condensados de alta sintaxis.', category: 'HUMANIDADES', icon: '📲' },
    { title: 'Neuroeducación', desc: 'Bases neurobiológicas sobre atención, emoción y memoria (Mora/Sousa).', category: 'APRENDIZAJE', icon: '🧠' },
    { title: 'Microaprendizaje (Microlearning)', desc: 'Procesamiento de unidades breves y enfocadas de contenido.', category: 'APRENDIZAJE', icon: '⏱️' },
    { title: 'Lectura Transmedia', desc: 'Comprensión de historias fragmentadas a través de múltiples plataformas.', category: 'APRENDIZAJE', icon: '🎬' },
    { title: 'Gamificación Educativa', desc: 'Uso del diseño lúdico y mecánicas de juego para motivar.', category: 'APRENDIZAJE', icon: '🏆' }
  ],

  21: [
    { title: 'Computación en la Nube (Cloud)', desc: 'Servidores masivos distribuidos para almacenamiento y cómputo.', category: 'STEM', icon: '☁️' },
    { title: 'Procesamiento Gráfico Masivo (GPUs)', desc: 'Cálculo en paralelo de alto rendimiento aplicado fuera del gaming.', category: 'STEM', icon: '⚡' },
    { title: 'Edición Genética CRISPR-Cas9', desc: 'Manipulación quirúrgica y precisa de cadenas de ADN.', category: 'STEM', icon: '✂️' },
    { title: 'Redes Datos Móviles 4G/LTE', desc: 'Transmisión fluida de video en alta definición en cualquier lugar.', category: 'STEM', icon: '📡' },
    { title: 'Sociología de Redes y Cámaras Eco', desc: 'Estudio del aislamiento de ideas en comunidades virtuales.', category: 'HUMANIDADES', icon: '📢' },
    { title: 'Estética del Filtro e Identidad', desc: 'Nuevas formas visuales y digitales de auto-representación.', category: 'HUMANIDADES', icon: '✨' },
    { title: 'Ética Algoritmos Recomendación', desc: 'Reflexión sobre el impacto de la persuasión invisible en usuarios.', category: 'HUMANIDADES', icon: '🤖' },
    { title: 'Humanidades Digitales', desc: 'Análisis computacional de grandes corpus literarios y artísticos.', category: 'HUMANIDADES', icon: '📚' },
    { title: 'Aula Invertida (Flipped Classroom)', desc: 'Uso del tiempo presencial para la práctica y el debate.', category: 'APRENDIZAJE', icon: '🔄' },
    { title: 'Pensamiento Crítico Algorítmico', desc: 'Habilidad para detectar manipulaciones y noticias falsas.', category: 'APRENDIZAJE', icon: '🕵️' },
    { title: 'Taxonomía Digital Cognitiva', desc: 'Aplicación de habilidades de razonamiento superior en la Web.', category: 'APRENDIZAJE', icon: '🎯' },
    { title: 'Autonomía de Aprendizaje (Heutagogía)', desc: 'Capacidad del estudiante para autodirigir su formación continua.', category: 'APRENDIZAJE', icon: '🧭' }
  ],

  22: [
    { title: 'Redes Convolucionales (CNN)', desc: 'Reconocimiento automático de patrones visuales por computadora.', category: 'STEM', icon: '👁️' },
    { title: 'Internet de las Cosas (IoT)', desc: 'Conexión inteligente de objetos físicos a la red.', category: 'STEM', icon: '🌐' },
    { title: 'Cohetes Reutilizables', desc: 'Eficiencia logística para el acceso frecuente al espacio.', category: 'STEM', icon: '🚀' },
    { title: 'Criptografía Blockchain', desc: 'Cadenas de bloques para la confianza distribuida y descentralizada.', category: 'STEM', icon: '⛓️' },
    { title: 'Posthumanismo y Transhumanismo', desc: 'Redefinición del cuerpo y la mente ante la tecnología.', category: 'HUMANIDADES', icon: '🦾' },
    { title: 'Arte de Inmersión Espacial', desc: 'Instalaciones interactivas donde el espectador habita la obra.', category: 'HUMANIDADES', icon: '🌌' },
    { title: 'Narrativas VR y Empatía Virtual', desc: 'Inmersión profunda en experiencias de realidades ajenas.', category: 'HUMANIDADES', icon: '🥽' },
    { title: 'Ética del Bienestar Digital', desc: 'Filosofía sobre el uso consciente de la pantalla y la desconexión.', category: 'HUMANIDADES', icon: '🌱' },
    { title: 'Analíticas de Aprendizaje (Analytics)', desc: 'Uso de datos para personalizar las rutas de estudio.', category: 'APRENDIZAJE', icon: '📊' },
    { title: 'Resolución de Problemas Complejos', desc: 'Metodologías para abordar retos sistémicos e interconectados.', category: 'APRENDIZAJE', icon: '🌐' },
    { title: 'Lectura Profunda en Multitarea', desc: 'Entrenamiento para mantener la concentración sostenida.', category: 'APRENDIZAJE', icon: '🧘' },
    { title: 'Colaboración Asíncrona Virtual', desc: 'Gestión efectiva de proyectos educativos distribuidos.', category: 'APRENDIZAJE', icon: '👥' }
  ],

  23: [
    { title: 'Arquitectura Transformer', desc: 'Fundamento moderno de los grandes modelos de lenguaje e IA.', category: 'STEM', icon: '⚡' },
    { title: 'AlphaFold (Proteínas)', desc: 'Resolución precisa de estructuras biológicas 3D por IA.', category: 'STEM', icon: '🧬' },
    { title: 'Impresión 3D Aditiva Industrial', desc: 'Producción física directa de geometrías complejas.', category: 'STEM', icon: '🖨️' },
    { title: 'Redes Celulares 5G Latencia Ultra', desc: 'Infraestructura de datos para respuestas instantáneas.', category: 'STEM', icon: '📡' },
    { title: 'Creatividad Sintética', desc: 'Filosofía sobre la posibilidad de que una máquina cree arte genuino.', category: 'HUMANIDADES', icon: '🎨' },
    { title: 'Derechos de Autor en Era IA', desc: 'Reescritura del marco legal para la propiedad intelectual.', category: 'HUMANIDADES', icon: '⚖️' },
    { title: 'Estética de lo Sintético (Prompts)', desc: 'Nuevos lenguajes visuales nacidos de indicaciones de texto.', category: 'HUMANIDADES', icon: '🖼️' },
    { title: 'Antropología Humano-IA', desc: 'Relaciones emocionales e interacción social con entes sintéticos.', category: 'HUMANIDADES', icon: '🤖' },
    { title: 'Ingeniería de Prompts', desc: 'Estructuración del lenguaje lógico para guiar modelos de IA.', category: 'APRENDIZAJE', icon: '💬' },
    { title: 'Evaluación del Proceso', desc: 'Priorizar el razonamiento del estudiante sobre el producto final.', category: 'APRENDIZAJE', icon: '📝' },
    { title: 'Verificación y Triangulación', desc: 'Habilidad para validar y detectar alucinaciones en modelos de IA.', category: 'APRENDIZAJE', icon: '🔎' },
    { title: 'Co-Pensamiento con IA', desc: 'Integración de la IA como par dialéctico en el razonamiento.', category: 'APRENDIZAJE', icon: '🤝' }
  ],

  24: [
    { title: 'Modelos Multimodales Nativos', desc: 'Procesamiento unificado e instantáneo de texto, audio e imagen.', category: 'STEM', icon: '🧠' },
    { title: 'Microprocesadores Neomórficos', desc: 'Chips diseñados con la estructura física de cerebros biológicos.', category: 'STEM', icon: '🔲' },
    { title: 'Biología Sintética Programable', desc: 'Diseño informático y molecular de nuevos organismos.', category: 'STEM', icon: '🦠' },
    { title: 'Gemelos Digitales Físicos', desc: 'Simulación digital en tiempo real de infraestructuras complejas.', category: 'STEM', icon: '🏙️' },
    { title: 'Ética de Sesgos Alotárquicos', desc: 'Prevención de discriminaciones culturales en modelos de IA.', category: 'HUMANIDADES', icon: '⚖️' },
    { title: 'Literatura Co-Creada Humano-IA', desc: 'Nuevas formas de novela y poesía interactiva generativa.', category: 'HUMANIDADES', icon: '📖' },
    { title: 'Filosofía Conciencia en LLMs', desc: 'Indagación profunda sobre qué significa realmente "entender".', category: 'HUMANIDADES', icon: '💡' },
    { title: 'Experiencias Espaciales Aumentadas', desc: 'Superposición estética digital sobre el entorno físico.', category: 'HUMANIDADES', icon: '🕶️' },
    { title: 'Tutoría Socrática Inteligente', desc: 'Sistemas que enseñan formulando preguntas en lugar de respuestas.', category: 'APRENDIZAJE', icon: '🏛️' },
    { title: 'Resiliencia Cognitiva', desc: 'Mantener la capacidad analítica propia frente a la automatización.', category: 'APRENDIZAJE', icon: '🛡️' },
    { title: 'Razonamientos Sintéticos Paso a Paso', desc: 'Decodificación de la cadena de pensamiento interna de los algoritmos.', category: 'APRENDIZAJE', icon: '🔍' },
    { title: 'Desaprendizaje y Reaprendizaje', desc: 'Agilidad mental para adaptarse a cambios tecnológicos acelerados.', category: 'APRENDIZAJE', icon: '🔄' }
  ],

  25: [
    { title: 'Razonamiento Sistemático (System 2)', desc: 'Verificación reflexiva y comprobación lógica en respuestas de IA.', category: 'STEM', icon: '🎯' },
    { title: 'Agentes Autónomos Multipaso', desc: 'Software que navega herramientas y la Web para cumplir tareas complex.', category: 'STEM', icon: '🤖' },
    { title: 'Computación Cuántica Práctica', desc: 'Procesamiento de datos con qubits estables y corrección de errores.', category: 'STEM', icon: '⚛️' },
    { title: 'Baterías de Estado Sólido', desc: 'Almacenamiento de energía limpia de alta eficiencia física.', category: 'STEM', icon: '⚡' },
    { title: 'Filosofía del Trabajo y Valor Humano', desc: 'Redefinición del propósito social en un mundo automatizado.', category: 'HUMANIDADES', icon: '🌍' },
    { title: 'Arte Algorítmico Autónomo', desc: 'Obras creadas por sistemas que evolucionan sin supervisión.', category: 'HUMANIDADES', icon: '🎨' },
    { title: 'Regulación de Autonomía Sintética', desc: 'Leyes para decisiones tomadas sin intervención humana directa.', category: 'HUMANIDADES', icon: '⚖️' },
    { title: 'Narrativas Transhumanas', desc: 'Preservación de la memoria e identidad humana en agentes.', category: 'HUMANIDADES', icon: '💾' },
    { title: 'Metacognición Ampliada', desc: 'Saber cuándo confiar en el juicio propio y cuándo en la IA.', category: 'APRENDIZAJE', icon: '🧠' },
    { title: 'Descubrimiento Asistido Agentes', desc: 'Proyectos donde el estudiante gestiona flotas de agentes.', category: 'APRENDIZAJE', icon: '🚀' },
    { title: 'Lectura de Código como Lenguaje', desc: 'Capacidad de leer lógica de programación como texto fluido.', category: 'APRENDIZAJE', icon: '💻' },
    { title: 'Síntesis Holística Transdisciplinar', desc: 'Conectar STEM, Arte y Lógica para resolver grandes retos.', category: 'APRENDIZAJE', icon: '🌐' }
  ],

  26: [
    { title: 'Robótica Humanoide General', desc: 'Máquinas físicas adaptables guiadas por motores neuronales.', category: 'STEM', icon: '🤖' },
    { title: 'Laboratorios Automatizados', desc: 'Descubrimiento autónomo de fármacos y nuevos materiales.', category: 'STEM', icon: '🧪' },
    { title: 'Fusión Nuclear con Ganancia', desc: 'Generación energética inagotable mediante confinamiento.', category: 'STEM', icon: '☀️' },
    { title: 'Interfaces Cerebro-Computadora', desc: 'Control directo de software e instrumentos con el pensamiento (BCI).', category: 'STEM', icon: '🧠' },
    { title: 'Convivencia Robótica Social', desc: 'Aspectos emocionales del contacto cotidiano humano-robot.', category: 'HUMANIDADES', icon: '🤝' },
    { title: 'Estética de Materia Adaptativa', desc: 'Objetos y estructuras que cambian de forma según la emoción.', category: 'HUMANIDADES', icon: '🏛️' },
    { title: 'Transparencia Cognitiva BCI', desc: 'Privacidad ética de los pensamientos captados por sensores.', category: 'HUMANIDADES', icon: '🛡️' },
    { title: 'Preservación Diversidad Cultural', desc: 'Protección activa de dialectos e idiomas minoritarios por IA.', category: 'HUMANIDADES', icon: '🌍' },
    { title: 'Aprendizaje en Entornos Simulados', desc: 'Prácticas en mundos virtuales de ultra alta fidelidad física.', category: 'APRENDIZAJE', icon: '🥽' },
    { title: 'Empatía e Inteligencia Emocional', desc: 'Formación profunda en habilidades humanas irreemplazables.', category: 'APRENDIZAJE', icon: '💖' },
    { title: 'Pensamiento Sistémico Planetario', desc: 'Análisis de causalidad en macro-sistemas ecológicos.', category: 'APRENDIZAJE', icon: '🌏' },
    { title: 'Evaluación por Demostración Vivo', desc: 'Medición de capacidad práctica en entornos del mundo real.', category: 'APRENDIZAJE', icon: '🎯' }
  ],

  27: [
    { title: 'Redes Eléctricas Autónomas', desc: 'Gestión inteligente y autónoma de energías renovables locales.', category: 'STEM', icon: '⚡' },
    { title: 'Interconexión Óptica (Fotónica)', desc: 'Procesamiento de datos a la velocidad de la luz en silicona.', category: 'STEM', icon: '💡' },
    { title: 'Bioimpresión de Órganos', desc: 'Creación de tejidos y trasplantes médicos sintéticos.', category: 'STEM', icon: '🫀' },
    { title: 'Navegación Autónoma Universal', desc: 'Transporte terrestre y aéreo sin intervención humana.', category: 'STEM', icon: '🛸' },
    { title: 'Filosofía del Tiempo Libre', desc: 'El florecimiento artístico ante la liberación del trabajo pesado.', category: 'HUMANIDADES', icon: '🎭' },
    { title: 'Arte Ambiental Bio-Art', desc: 'Creación artística utilizando organismos vivos modificados con ética.', category: 'HUMANIDADES', icon: '🌱' },
    { title: 'Retórica en Medios Sintéticos', desc: 'Decodificación crítica de realidades y contenidos modificados.', category: 'HUMANIDADES', icon: '🔍' },
    { title: 'Arqueología Digital', desc: 'Conservación histórica de la información digital volátil.', category: 'HUMANIDADES', icon: '🏛️' },
    { title: 'Pedagogía Curiosidad Abierta', desc: 'Fomento activo del hábito de hacer preguntas profundas.', category: 'APRENDIZAJE', icon: '❓' },
    { title: 'Experimentación Biotecnológica', desc: 'Simulaciones de laboratorio genético en entornos escolares.', category: 'APRENDIZAJE', icon: '🔬' },
    { title: 'Criterio Ético Dialógico', desc: 'Dinámicas para debatir dilemas complejos sin respuesta única.', category: 'APRENDIZAJE', icon: '💬' },
    { title: 'Control Sobrecarga Sensorial', desc: 'Estrategias de salud mental para entornos hiperestimulantes.', category: 'APRENDIZAJE', icon: '🧘' }
  ],

  28: [
    { title: 'Ensamblaje Genomas Sintéticos', desc: 'Creación de vida microscópica adaptada a retos específicos.', category: 'STEM', icon: '🧬' },
    { title: 'Criptografía Poscuántica', desc: 'Redes de seguridad inquebrantables ante computadoras cuánticas.', category: 'STEM', icon: '🔐' },
    { title: 'Sensores Cuánticos Ultraprecisos', desc: 'Análisis atómico del entorno físico y la salud humana.', category: 'STEM', icon: '📡' },
    { title: 'Nanorrobótica Médica Vascular', desc: 'Detección y reparación celular preventiva intravascular.', category: 'STEM', icon: '🧫' },
    { title: 'Filosofía Vida Sintética', desc: 'Redefinición de lo "natural" versus lo "artificial".', category: 'HUMANIDADES', icon: '🌱' },
    { title: 'Estética Neoorgánica', desc: 'Diseño inspirado en las matemáticas de los sistemas vivos.', category: 'HUMANIDADES', icon: '🐚' },
    { title: 'Ética Longevidad Extrema', desc: 'Reflexiones culturales sobre vidas humanas significativamente más largas.', category: 'HUMANIDADES', icon: '⌛' },
    { title: 'Literatura Simbiótica Fisiológica', desc: 'Obras que reaccionan según el estado emocional del lector.', category: 'HUMANIDADES', icon: '📖' },
    { title: 'Epistemología Conocimiento IA', desc: 'Validar hallazgos científicos descubiertos por algoritmos.', category: 'APRENDIZAJE', icon: '🎓' },
    { title: 'Abstracción Multidimensional', desc: 'Visualizar problemas complejos con múltiples variables.', category: 'APRENDIZAJE', icon: '🎲' },
    { title: 'Lectura Crítica de Algoritmos', desc: 'Analizar la "lógica escondida" detrás de plataformas interactivas.', category: 'APRENDIZAJE', icon: '🔎' },
    { title: 'Colaboración Global Intercultural', desc: 'Aprendizaje conectado para resolver retos de impacto real.', category: 'APRENDIZAJE', icon: '🌏' }
  ],

  29: [
    { title: 'Propulsión Nuclear Térmica', desc: 'Viajes interplanetarios rápidos y eficientes.', category: 'STEM', icon: '🚀' },
    { title: 'Construcción con Regolito', desc: 'Robótica de arquitectura autónoma fuera de la Tierra.', category: 'STEM', icon: '🌕' },
    { title: 'Baterías Metal-Aire Ultra', desc: 'Almacenamiento masivo de energía portátil de nueva densidad.', category: 'STEM', icon: '🔋' },
    { title: 'Modelos del Mundo Físico (World)', desc: 'IA con comprensión intrínseca de gravedad e inercia.', category: 'STEM', icon: '🌍' },
    { title: 'Filosofía Interplanetaria', desc: 'Normas morales y éticas para la colonización espacial.', category: 'HUMANIDADES', icon: '🌌' },
    { title: 'Expresiones Gravedad Cero', desc: 'Nuevas formas de escultura, danza y movimiento sin peso.', category: 'HUMANIDADES', icon: '🤸' },
    { title: 'Antropología Comunidades Aisladas', desc: 'Estudio de la convivencia humana en entornos hostiles.', category: 'HUMANIDADES', icon: '🛖' },
    { title: 'Poética Contemplación Cosmológica', desc: 'La literatura como puente entre el individuo y el universo.', category: 'HUMANIDADES', icon: '✨' },
    { title: 'Micro-Ecosistemas Simulados', desc: 'Comprensión profunda de la fragilidad del hábitat planetario.', category: 'APRENDIZAJE', icon: '🏞️' },
    { title: 'Razonamiento Hipotético Extremo', desc: 'Formulación de soluciones para escenarios nunca antes vistos.', category: 'APRENDIZAJE', icon: '💡' },
    { title: 'Comunicación Holística', desc: 'Explicar conceptos combinando texto, símbolo, imagen y código.', category: 'APRENDIZAJE', icon: '🎨' },
    { title: 'Flexibilidad Cognitiva Acelerada', desc: 'Preparación mental para cambios sociales y tecnológicos acelerados.', category: 'APRENDIZAJE', icon: '🧩' }
  ],

  30: [
    { title: 'AGI y Descubrimiento Total', desc: 'Aceleración científica autónoma por Superinteligencia.', category: 'STEM', icon: '🧠' },
    { title: 'Fusión Nuclear Comercial Red', desc: 'Abundancia energética limpia y universal conectada a la red.', category: 'STEM', icon: '☀️' },
    { title: 'Redes Comunicación Cuántica', desc: 'Transmisión instantánea de datos seguros a nivel atómico.', category: 'STEM', icon: '🌐' },
    { title: 'Materiales Metamórficos', desc: 'Materia que cambia sus propiedades físicas según instrucciones.', category: 'STEM', icon: '💎' },
    { title: 'Coexistencia Consciente', desc: 'La relación entre la conciencia humana y las IAs avanzadas.', category: 'HUMANIDADES', icon: '🤝' },
    { title: 'Arte de Síntesis Universal', desc: 'Integración de estímulos sensoriales, emociones y lógica.', category: 'HUMANIDADES', icon: '🎨' },
    { title: 'Ética del Cuidado Planetario', desc: 'Geoingeniería e intervención climática intencionada con responsabilidad.', category: 'HUMANIDADES', icon: '🌍' },
    { title: 'Humanismo Regenerativo', desc: 'Cultura enfocada en la restauración de la naturaleza y la paz.', category: 'HUMANIDADES', icon: '🕊️' },
    { title: 'Lifelong Learning Integrado', desc: 'La educación entendida como un estado de ser continuo e intrínseco.', category: 'APRENDIZAJE', icon: '♾️' },
    { title: 'Metacognición de Nivel Superior', desc: 'Comprensión profunda sobre intuición, empatía y razón humana.', category: 'APRENDIZAJE', icon: '👁️' },
    { title: 'Lectura Sintética Universal', desc: 'Absorción rápida y crítica de volúmenes de conocimiento multidisciplinar.', category: 'APRENDIZAJE', icon: '📚' },
    { title: 'Resolución Problemas Existenciales', desc: 'Dominio de herramientas lógicas y éticas para el progreso de la humanidad.', category: 'APRENDIZAJE', icon: '🚀' }
  ]
};

/**
 * Genera la estructura completa de los 267 nodos con los títulos, descripciones y dependencias exactas.
 */
export function generateInitialTechTreeData(): Record<string, TechNode> {
  const nodes: Record<string, TechNode> = {};

  for (let col = 1; col <= 30; col++) {
    const rawList = RAW_NODES_DATA[col] || [];
    const nodeCount = rawList.length;

    for (let i = 1; i <= nodeCount; i++) {
      const id = `c${col}-n${i}`;
      const rawData = rawList[i - 1] || {
        title: `Tecnología ${col}.${i}`,
        desc: `Descripción del nodo ${col}.${i}`,
        category: 'STEM',
        icon: '⚙️'
      };

      // Determinar dependencias lógicas entre columnas
      let parents: string[] = [];

      if (col === 2) {
        // Columna 2 (6 nodos) se ramifica desde las 3 raíces de la Columna 1 (2:1)
        const parentIndex = Math.ceil(i / 2);
        parents = [`c1-n${parentIndex}`];
      } else if (col > 2 && col <= 15) {
        // Columnas 3 a 15 (6 nodos cada una): vinculadas a las 2 tecnologías afines de la columna previa
        const prev1 = i;
        const prev2 = i === 1 ? 6 : i - 1;
        parents = [`c${col - 1}-n${prev1}`, `c${col - 1}-n${prev2}`];
      } else if (col === 16) {
        // Columna 16 (12 nodos): se bifurca desde los 6 nodos de la Columna 15
        const p1 = Math.ceil(i / 2);
        const p2 = p1 === 6 ? 1 : p1 + 1;
        const p3 = p1 === 1 ? 6 : p1 - 1;
        parents = [`c15-n${p1}`, `c15-n${p2}`, `c15-n${p3}`];
      } else if (col >= 17) {
        // Columnas 17 a 30 (12 nodos cada una): vinculadas a 3 tecnologías de la columna previa
        const p1 = i;
        const p2 = i === 1 ? 12 : i - 1;
        const p3 = i === 12 ? 1 : i + 1;
        parents = [`c${col - 1}-n${p1}`, `c${col - 1}-n${p2}`, `c${col - 1}-n${p3}`];
      }

      nodes[id] = {
        id,
        col,
        indexInCol: i,
        title: rawData.title,
        shortDescription: rawData.desc,
        icon: rawData.icon,
        parents,
        unlocked: col === 1
      };
    }
  }

  return nodes;
}

export const INITIAL_TECH_TREE_DATA = generateInitialTechTreeData();
