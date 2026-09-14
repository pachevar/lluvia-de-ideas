# Directrices de Neurodiseño y Paleta Visual - Sutz Mundo Virtual

Este documento establece las reglas obligatorias de diseño visual, psicología del color y ergonomía cognitiva para **Sutz Mundo Virtual** y sus componentes interactivos. Todo desarrollo futuro debe adherirse estrictamente a estas pautas.

---

## 1. Principio de Estimulación Visual Contrastante y Reducción de Carga Cognitiva

El cerebro humano responde de forma adaptativa a estímulos visuales contrastantes. Para evitar la sobrecarga sensorial y la fatiga mental en estudiantes y docentes:

- **Fondos Desaturados y Neutros**:
  - Los lienzos espaciales, mapas, paneles y áreas pasivas deben utilizar siempre tonos neutros, azules oceánicos profundos (`hsl(222, 47%, 7%)`) y verdes bosque desaturados (`hsla(160, 45%, 35%, 0.08)`).
  - Queda estrictamente prohibido usar fondos estridentes (púrpuras, rosas intensos, magentas o rojos como fondo continuo de mapa).
- **Colores Cálidos y Saturados Reservados para Interacción**:
  - Los colores cálidos (amarillo, ámbar, naranja) están reservados **únicamente** para:
    1. Elementos interactivos activos (botones de acción, píldoras indicadoras de interactividad).
    2. Metas de aprendizaje o retos vigentes.
    3. Pistas didácticas y puntos focales donde el estudiante debe dirigir su atención.

---

## 2. Psicología del Color en el Aprendizaje

| Gama Cromática | Efecto Neurocognitivo | Aplicación Obligatoria |
| :--- | :--- | :--- |
| **Azules Profundos y Verdes Desaturados** | Promueven estados alfa de calma, respiración pausada y concentración prolongada para la resolución de problemas lógicos y lectura. | Fondo del mapa, superficies de tarjetas, marco de celdas y bruma inexplorada. |
| **Ámbar, Amarillo y Naranja** | Estimulan la dopamina, la energía visual y la agilidad ante retos, desafíos o momentos de competencia lúdica. | Píldoras de acción activa (`.hex-action-pill`), cofres de recompensas, objetivos clave. |
| **Cian y Azul Eléctrico** | Proporcionan claridad y sensación de orientación técnica/espacial. | Herramientas de ayuda, planos cartesianos (Eje X), guías y tutoriales. |
| **Índigo / Lavanda Astral** | Evocan trascendencia, pensamiento reflexivo y exploración literaria. | Códices ancestrales, hitos de sabiduría y relatos. |

---

## 3. Código Semántico Predecible (Cero Fatiga Mental)

La predictibilidad visual reduce la tensión cognitiva porque el cerebro no tiene que reaprender el significado de los estímulos:

1. **Verde (`--sutz-color-success` / `hsl(158, 75%, 45%)`)**:
   - **Siempre significa**: Correcto, respuesta acertada, logro completado, zona segura, progreso válido.
   - **Prohibido**: Usar verde para denotar peligro, límites o errores.
2. **Rojo (`--sutz-color-error` / `hsl(350, 84%, 60%)`)**:
   - **Siempre significa**: Error, peligro, casilla bloqueada, recurso insuficiente o límite.
   - **Prohibido**: Usar rojo en elementos decorativos benignos o fondos estándar.
3. **Ámbar / Naranja (`--sutz-color-challenge` / `hsl(38, 92%, 50%)`)**:
   - **Siempre significa**: Reto disponible, meta, acción interactiva requerida, advertencia formativa.
4. **Cian (`--sutz-color-guide` / `hsl(199, 89%, 48%)`)**:
   - **Siempre significa**: Ayuda, orientación didáctica, coordenadas (Eje X).

---

## 4. Archivo de Tokens y Sistema de Elevación

Todas las implementaciones deben vincularse a las variables definidas en `src/styles/sutz-palette.css`:
- `--sutz-elevation-0` a `--sutz-elevation-3` (Capas de opacidad sólida escalonada)
- `--sutz-bg-space-void`
- `--sutz-cell-bg-idle`
- `--sutz-color-success`
- `--sutz-color-error`
- `--sutz-color-challenge`
- `--sutz-color-guide`
- `--sutz-color-wisdom`
- `--sutz-text-normal` (`#E0E0E0` - Blanco hueso/gris claro)
- `--sutz-text-bright` (`#F8FAFC` - Alto contraste)

---

## 5. Ergonomía Visual de Rendimiento y Legibilidad

1. **Neón Únicamente como Acento de Interacción**:
   - Reserva las luces y resplandores neón exclusivamente para estados activos, recompensas (logros, medallas) o botones de acción principal (CTA).
   - El texto principal de lectura debe mantenerse en tonos blanco hueso o gris claro (`#E0E0E0` / `#F8FAFC`) sobre fondos oscuros neutros (`#121212` / `#151B27`), jamás en colores neón saturados ni fosforescentes que cansen la vista.
2. **Opacidad Sólida en Vez de Transparencias Dinámicas**:
   - Queda desaconsejado el uso de `backdrop-filter: blur()` en tiempo real para evitar sobrecargar la GPU de tabletas y dispositivos móviles estudiantiles.
   - Utilizar capas oscuras sólidas escalonadas con tonalidades de gris y azul oscuro (sistema de elevación Material Design).
3. **Control Estricto de Contraste Figura-Fondo**:
   - Los fondos detrás de modales y tarjetas oscuras deben ser superficies lisas o patrones estáticos de alta opacidad (`#080c16fa` / 98% opacidad).
   - Queda prohibido dejar textos o elementos móviles en movimiento visibles detrás de ventanas abiertas para eliminar ruido visual y permitir una lectura rápida y sin distracciones.

