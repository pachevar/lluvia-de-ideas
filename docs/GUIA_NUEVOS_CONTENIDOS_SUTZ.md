# 📐 Guía de Creación y Codificación de Nuevos Contenidos en SUTZ

Esta guía técnica y curricular define el procedimiento oficial para registrar, codificar, gamificar y desplegar **nuevos contenidos, hexágonos, retos y proyectos** en el portal de **Editorial Lluvia de Ideas** y **Sutz Mundo Virtual**, garantizando interoperabilidad con **AcademiaQR**.

---

## 1. Filosofía de Estructura: Hexágono = Contenido + Retos + Proyectos

En Sutz:
1. **Hexágono (Contenido Base `-C`)**: Es la coordenada espacial interactiva que el estudiante descubre en el mapa (ej. un simulador 3D, códice, taller o juego).
2. **Retos (`-R`)**: Desafíos guiados, cuestionarios o misiones con retroalimentación automática y punteo cuantitativo.
3. **Proyectos (`-P`)**: Actividades de producción creativa (ej. redacción de un cuento, diseño de lámina anatómica) cuyos entregables pueden publicarse en la Gran Galería o remitirse a la plataforma escolar.

---

## 2. Nomenclatura Estándar: Código `SUTZ-CODE`

Todos los contenidos y evaluaciones deben llevar un código alfanumérico único estructurado en 3 segmentos:

$$\mathbf{[PILAR]-[MÓDULO]-[TIPO][CORRELATIVO]}$$

### 🏛️ Segmento 1: Reino o Pilar (`[PILAR]`)
- `TEK`: **100tek** (Ciencia, Lógica, Salud, Anatomía, Tecnología)
- `CRK`: **Creatika** (Artes visuales, Literatura, Creación narrativa)
- `STZ`: **Sutz** (Mundo Virtual, Popol Vuh, Astronomía ancestral, Neurociencia)
- `LAB`: **LAB** (Prácticas pedagógicas, Robótica, Animación)
- `MKT`: **Mercado** (Dinámicas lúdicas, Bingotenango, Economía escolar)
- `TND`: **Tienda** (Publicaciones editoriales, Catálogo de libros y cuentos)

### 🏷️ Segmento 2: Clave del Módulo (`[MÓDULO]`)
Palabra mnemotécnica de 3 a 8 caracteres en mayúsculas:
- `ATLAS`: Cuerpo Humano Virtual 3D
- `SOLAR`: Sistema Solar 3D
- `STORY`: Máquina de Cuentos
- `COLOR`: Teoría del Color
- `ROBOT`: Robótica Educativa
- `BINGO`: Bingotenango

### 🎯 Segmento 3: Tipo de Elemento y Correlativo (`[TIPO][01..99]`)
- `-C01`, `-C02`...: **Contenido** (Módulo o simulador principal).
- `-R01`, `-R02`...: **Reto** (Desafío evaluable y medible).
- `-P01`, `-P02`...: **Proyecto** (Práctica creativa o entregable).

---

## 3. Matriz de Puntos y Conversión Dual (Sutz ⇄ AcademiaQR)

| Dificultad | XP en Sutz | Gemas | Pergaminos | Monedas | Punteo Escolar Base |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **Iniciado** | 150 – 200 XP | 4 – 5 💎 | 1 📜 | 40 – 50 🪙 | 10 – 20 pts |
| **Navegante** | 220 – 280 XP | 6 – 8 💎 | 1 – 2 📜 | 60 – 80 🪙 | 20 – 25 pts |
| **Guardián** | 300 – 380 XP | 9 – 12 💎 | 2 📜 | 90 – 120 🪙 | 25 – 35 pts |
| **Gran Maestro** | 400 – 500 XP | 15 – 20 💎 | 3 – 5 📜 | 150 – 200 🪙 | 40 – 50 pts |

### Fórmulas de Conversión:
- **Calificación hacia AcademiaQR**:
  $$\text{Nota Escolar} = \text{round}\left(\frac{\text{Porcentaje de Aciertos}}{100} \times \text{maxScore}\right)$$
- **Abono a Sutz**:
  $$\text{Puntos XP} = \text{Nota Escolar} \times 10$$
  $$+5 \text{ Gemas}, \quad +1 \text{ Pergamino}$$

---

## 4. Paso a Paso: Cómo Agregar un Nuevo Contenido

### Paso 1: Registrar el Módulo en `src/config/sutzCurriculumConfig.ts`
Agrega el objeto en el arreglo `SUTZ_CURRICULUM_MODULES`:

```typescript
{
  code: 'TEK-QUIMICA-C01',
  pillarId: '100tek',
  pillarName: '100tek',
  title: 'Tabla Periódica Interactiva',
  icon: '🧪',
  type: 'simulador',
  route: '/100tek/tabla-periodica',
  summary: 'Visualizador molecular 3D de elementos químicos y enlaces covalentes.',
  pedagogicalCompetency: 'Comprensión de la estructura atómica y configuración electrónica.',
  challenges: [
    {
      code: 'TEK-QUIMICA-R01',
      moduleCode: 'TEK-QUIMICA-C01',
      title: 'Enlace del Agua y Valencia',
      description: 'Construir 3 moléculas estables de agua balanceando sus electrones.',
      difficulty: 'iniciado',
      targetRoute: '/100tek/tabla-periodica',
      defaultMaxScore: 20,
      rewards: { puntosXp: 200, gemas: 5, pergaminos: 1, monedas: 50 }
    }
  ],
  projects: []
}
```

### Paso 2: Registrar la Ruta en `src/App.tsx`
Declara la ruta en el componente `<Routes>`:
```tsx
<Route path="/100tek/tabla-periodica" element={<TablaPeriodica />} />
```

### Paso 3: Registrar la Opción en `src/config/pillarProjectsConfig.ts`
Para que aparezca automáticamente en el selector del panel administrativo de Sutz:
```typescript
{ 
  id: '100tek_quimica', 
  label: '🧪 Tabla Periódica Interactiva', 
  target: '/100tek/tabla-periodica', 
  type: 'navigate', 
  pillarId: '100tek',
  code: 'TEK-QUIMICA-C01' 
}
```

### Paso 4: Posicionar el Hexágono en el Mapa
Puedes vincularlo de dos formas:
1. **Desde el Panel de Administración de Sutz** (`/gerencia/mundo-virtual`): Pulsa en cualquier casilla inexplorada o hexágono existente, selecciona la aplicación de la lista desplegable y guarda los cambios en Firestore.
2. **Por código en `src/context/PortalConfigContext.tsx`**: Añade la celda inicial con sus coordenadas `row` y `col`.

### Paso 5: Reportar la Conclusión de un Reto
Cuando el estudiante complete la actividad interactiva dentro de tu componente React:

```typescript
import { reportChallengeCompletion } from '../services/academiaqrSyncService';

const onLevelSuccess = async () => {
  await reportChallengeCompletion({
    challengeId: 'TEK-QUIMICA-R01',
    percentage: 100, // porcentaje obtenido (0 - 100)
    feedback: '¡Excelente! Enlazaste correctamente los átomos de hidrógeno y oxígeno.'
  });
};
```

Esto automáticamente:
1. Guarda el registro en Firestore (`sutz_completions`).
2. Actualiza la nota en AcademiaQR si el alumno fue remitido por su profesor.
3. Otorga de forma instantánea XP, gemas y pergaminos en el perfil de Sutz.
4. Cambia el banner flotante a verde confirmando la entrega escolar.

---

## 5. Control de Calidad Pre-Despliegue

Cada vez que agregues un nuevo contenido:
1. Verifica compilación estricta de tipos: `npm run build`.
2. Confirma que la interfaz móvil sea ergonómica y responsiva (sin solapamientos).
3. Asegura el botón **«Volver al Mapa»** con destino `/sutz`.
4. Envía a producción: `git push origin main` y `firebase deploy`.
