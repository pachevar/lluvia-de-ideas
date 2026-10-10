# 🌐 Guía de Integración: SUTZ ⇄ AcademiaQR

Esta documentación define la arquitectura de interconexión desacoplada entre **SUTZ (Red Pedagógica STEM & Editorial)** y **AcademiaQR (ERP Educativo & Control Escolar)**.

---

## 1. Filosofía de Desacoplamiento

1. **SUTZ opera 100% independiente:** Cualquier usuario, lector, estudiante o visitante puede navegar por el mapa virtual, jugar en Bingotenango, explorar el Sistema Solar o comprar libros sin necesidad de AcademiaQR.
2. **AcademiaQR opera 100% independiente:** Cualquier colegio puede utilizar AcademiaQR para tesorería, notas, asistencias, admisiones y tareas (Modalidad Libre con guías PDF y rúbricas) sin necesidad de SUTZ.
3. **Interconexión Óptima:** Cuando un colegio contrata SUTZ, el Super Administrador lo habilita con un solo clic. A partir de ese momento, los docentes pueden asignar retos interactivos y los estudiantes sincronizan sus punteos y experiencia (XP, gemas y pergaminos) de manera bidireccional.

---

## 2. Parámetros del Handshake (URL Deep-Link)

Cuando un estudiante abre un reto desde AcademiaQR, es redirigido a SUTZ con los siguientes parámetros:

```
https://lluviadeideas-educativo.web.app/100tek/sistema-solar?ref=academiaqr&schoolId=QUE002&studentId=L02&studentName=Carlos+Ruiz&grade=3ro+B%C3%A1sico&assignmentId=HW-2026-002&challengeId=100tek_solar&maxScore=20&returnUrl=https%3A%2F%2Facademiaqrtst.web.app%2Ftareas.html
```

El servicio `src/services/academiaqrSyncService.ts` captura estos datos al cargar y los persiste en `sessionStorage` bajo la clave `sutz_academiaqr_handshake`.

---

## 3. Componentes Implementados en SUTZ

| Archivo | Propósito |
| :--- | :--- |
| `src/config/academiaqrBridgeConfig.ts` | Configuración oficial, dominios permitidos, esquema de datos y factores de recompensa. |
| `src/services/academiaqrSyncService.ts` | Funciones `detectAndStoreAcademiaQrHandshake()`, `reportChallengeCompletion()`, `returnToAcademiaQr()`. |
| `src/components/AcademiaQrTaskBanner.tsx` | Banner flotante reactivo que muestra el estado de la tarea activa, datos del estudiante y botón de retorno. |

---

## 4. Cómo Reportar la Culminación de un Reto

Cualquier juego o laboratorio en SUTZ puede reportar la culminación de un reto simplemente importando y llamando a `reportChallengeCompletion`:

```typescript
import { reportChallengeCompletion } from '../services/academiaqrSyncService';

// Al resolver el puzzle, simulador o cuestionario:
const handleFinishedLevel = async () => {
  await reportChallengeCompletion({
    challengeId: '100tek_solar',
    percentage: 100, // o porcentaje obtenido
    feedback: 'Completó exitosamente el cálculo de velocidades orbitales.'
  });
};
```

Esto ejecuta automáticamente:
1. Escritura en la colección `sutz_completions/{assignmentId}_{studentId}` de Firestore.
2. Emisión de `postMessage` hacia la ventana principal si SUTZ fue abierto mediante popup o iframe.
3. Actualización del banner flotante confirmando el envío de la calificación.
