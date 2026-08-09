# Reglas del Agente (Workspace Rules)

Este archivo contiene reglas y directrices específicas para el espacio de trabajo **Portal Web (Lluvia de Ideas Editorial)**. Cada vez que abras esta carpeta, sigue estas directrices con absoluta prioridad.

## Aislamiento de Contexto

1. **Límite de Espacio de Trabajo**: Todo el desarrollo, búsqueda de archivos, comandos y referencias deben limitarse estrictamente a este espacio de trabajo: `/home/lluviadeideas/Imágenes/Editorial/Portal web`.
2. **Sin Contexto Externo**: No asumas, busques o hagas referencia a configuraciones, directorios, bases de datos o repositorios de otros proyectos en esta máquina (como Club de Leones, Pasaporte al Deporte, etc.).

## Configuración del Entorno de Producción

1. **Firebase**:
   - **Cuenta**: `lluviadeideaseditorial@gmail.com`
   - **Proyecto**: `lluviadeideas-educativo` (Proyecto de producción activo en `.firebaserc`)
   - **Despliegue**: El comando de compilación es `npm run build` y el despliegue es `firebase deploy`.
   - **Políticas de Despliegue**: Por solicitud explícita del usuario, cada vez que se realicen y verifiquen cambios en el código, se debe compilar y desplegar inmediatamente a producción.
2. **GitHub**:
   - **Repositorio**: `https://github.com/pachevar/lluvia-de-ideas.git`
   - **Usuario local**: `lluviadeideaseditorial`
   - **Correo local**: `lluviadeideaseditorial@gmail.com`
   - **Autenticación y Credenciales**: El usuario de GitHub `pasaporteqr1` está configurado como colaborador con permisos de escritura en el repositorio `pachevar/lluvia-de-ideas.git`. La URL remota de origin almacena las credenciales autorizadas del PAT token para permitir operaciones directas de `git push origin main` sin bloqueos de tty.

## Directrices de Desarrollo

1. **Tecnologías**: React, TypeScript, Vite, Vanilla CSS.
2. **Calidad de Diseño**: Mantén siempre una estética premium, dinámica e interactiva con paletas de colores HSL bien definidas y micro-animaciones refinadas. No uses marcadores de posición (*placeholders*).
