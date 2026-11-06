# Parámetros y Directrices de Optimización Móvil (Portal Web Lluvia de Ideas)

Este documento establece las reglas universales, breakpoints y directrices ergonómicas que deben respetarse en todas las vistas, componentes y modales del portal web para garantizar una experiencia móvil premium, fluida y sin fricción táctil.

---

## 1. Breakpoints y Adaptabilidad

| Nivel | Rango de Ancho | Enfoque de Interfaz |
| :--- | :--- | :--- |
| **Desktop / Laptop** | `> 1024px` | Grillas multi-columna (3-4 cols), layouts lado a lado, efectos hover completos. |
| **Tablet** | `769px a 1024px` | Grillas de 2 columnas, menús balanceados, tipografía intermedia. |
| **Smartphone Estándar** | `<= 768px` | 1 columna (100% de ancho útil), botones de pulgar completos, menús horizontales con swipe. |
| **Smartphone Compacto** | `<= 480px` | Ocultar subtítulos secundarios en pestañas, títulos con escala fluida (`clamp()`), márgenes ajustados (12-16px). |
| **Ultra-Compacto** | `<= 360px` | Tipografía segura, micro-paddings, botones apilados verticalmente. |

---

## 2. Ergonomía Táctil y Objetivos de Toque (Touch Targets)

1. **Botones Principales y Acciones Críticas**:
   - Altura mínima obligatoria: **`44px`** (preferente `48px` en acciones flotantes o primarias).
   - Ancho completo (`width: 100%`) en formularios móviles para permitir pulsación cómoda con el pulgar.
2. **Chips, Pestañas y Controles Secundarios**:
   - Altura mínima: **`38px`** a **`42px`**.
   - Padding horizontal mínimo: `14px` a `16px`.
3. **Botones de Cierre (✕) e Iconos Interactivos**:
   - Área táctil efectiva mínima de **`40px x 40px`** o **`42px x 42px`**.
4. **Retroalimentación Táctil (Feedback Háptico Visual)**:
   - Eliminar el parpadeo gris por defecto de WebKit: `-webkit-tap-highlight-color: transparent;`.
   - Incorporar micro-escalado táctil:
     ```css
     button:active, .clickable-card:active {
       transform: scale(0.97);
       transition: transform 0.1s ease;
     }
     ```

---

## 3. Prevención de Auto-Zoom en iOS Safari (Regla Crítica)

Cualquier `<input>`, `<select>` o `<textarea>` que tenga un `font-size` inferior a `16px` provoca que iOS Safari realice un molesto zoom automático al enfocar el elemento, descalibrando el viewport del usuario.

```css
/* OBLIGATORIO en media queries <= 768px para todos los campos de texto */
input, select, textarea, .gg-search-input {
  font-size: 16px !important;
}
```

---

## 4. Contención de Desbordamiento y Desplazamiento Horizontal (Swipe)

1. **Cero Scroll Horizontal Involuntario**:
   - El contenedor raíz de la página debe garantizar:
     ```css
     overflow-x: hidden;
     width: 100%;
     max-width: 100vw;
     ```
2. **Contenedores de Desplazamiento Horizontal (Pestañas y Chips)**:
   - Usar `overflow-x: auto` con desplazamiento por inercia:
     ```css
     -webkit-overflow-scrolling: touch;
     scrollbar-width: none;
     scroll-snap-type: x proximity;
     ```
   - Ocultar la barra de desplazamiento visual:
     ```css
     &::-webkit-scrollbar {
       display: none;
     }
     ```
3. **Auto-Centrado Inteligente al Tocar**:
   - Cuando el usuario toca una pestaña o chip que está parcialmente cortado, centrarlo automáticamente mediante JavaScript:
     ```ts
     element.scrollIntoView({
       behavior: 'smooth',
       inline: 'center',
       block: 'nearest'
     });
     ```

---

## 5. Arquitectura de Modales: Formato Bottom-Sheet Inmersivo

En dispositivos móviles, los modales centrados flotantes con márgenes pequeños suelen generar barras de scroll dobles y botones fuera de pantalla. La arquitectura estándar es el **Bottom-Sheet Inmersivo**:

1. **Alineación Inferior**:
   ```css
   .modal-overlay {
     padding: 0;
     align-items: flex-end;
   }
   ```
2. **Contenedor del Modal**:
   ```css
   .modal-container {
     width: 100%;
     max-width: 100%;
     height: 96dvh; /* o max-height: 96dvh */
     border-radius: 18px 18px 0 0;
     border-bottom: none;
   }
   ```
3. **Botón de Cierre**:
   - Pinned permanentemente arriba a la derecha con `position: absolute; top: 10px; right: 12px; z-index: 35;`.
   - Fondo contrastado con transparencia y borde sutil (`background: rgba(0, 0, 0, 0.85); border: 1px solid rgba(255, 255, 255, 0.3);`).
4. **Zonas Seguras de Dispositivos (Notch & Home Bar)**:
   - Siempre aplicar `env(safe-area-inset-top)` y `env(safe-area-inset-bottom)`:
     ```css
     padding-top: max(0.5rem, env(safe-area-inset-top));
     padding-bottom: calc(2rem + env(safe-area-inset-bottom));
     ```

---

## 6. Tarjetas de Contenido y Portadas

1. **Corrección de Márgenes de Portadas Sangradas (Bleed Covers)**:
   - Si la tarjeta reduce su padding en móvil de `1.25rem` a `1.1rem`, el sangrado de la portada debe recalcularse estrictamente:
     ```css
     /* Si padding de tarjeta es 1.1rem: */
     .story-cover-wrapper {
       width: calc(100% + 2.2rem);
       margin: -1.1rem -1.1rem 0.9rem -1.1rem;
     }
     ```
2. **Botón de Acción en Pie de Tarjeta**:
   - En móvil, colocar el botón de acción a ancho completo debajo de las métricas (`flex-direction: column; align-items: stretch;`).
   - Altura mínima `42px` para toque cómodo.

---

## 7. Tipografía y Lectura Cómoda

1. **Títulos Principales**:
   - Usar escala fluida: `font-size: clamp(1.4rem, 5vw, 1.85rem);`.
2. **Cuerpo de Relatos y Artículos**:
   - Evitar justificación rígida en pantallas de menos de 480px (evita ríos de espacios en blanco antiestéticos en textos en español):
     ```css
     @media (max-width: 768px) {
       .reader-content p {
         text-align: left;
         line-height: 1.7;
         font-size: clamp(15px, 4.2vw, 18px);
       }
     }
     ```

