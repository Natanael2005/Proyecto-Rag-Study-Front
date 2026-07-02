# NexaBot | Campus IA

Maquetado visual de una plataforma educativa para estudiar apuntes y documentos
con inteligencia artificial. La app usa Next.js App Router, React 19 y Tailwind
CSS v4.

## Scripts

```bash
npm run dev
npm run lint
npm run build
```

## Rutas

- `/`: landing visual de NexaBot.
- `/auth/login`: maqueta de inicio de sesión.
- `/auth/register`: maqueta de registro.
- `/auth/forgot-password`: maqueta de recuperación de contraseña.

## Estado

El proyecto está en fase de maquetado. Los formularios usan `preventDefault()`
intencionalmente hasta conectar autenticación real.

## Estructura

- `app/`: rutas, layout raíz y estilos globales.
- `components/`: piezas visuales reutilizables de landing y auth.
- `public/`: assets públicos del proyecto.

Antes de cambiar patrones de Next.js, revisa la documentación local en
`node_modules/next/dist/docs/`, como indica `AGENTS.md`.
