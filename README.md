# NexaBot | Campus IA

Frontend de una plataforma educativa para estudiar apuntes y documentos con
inteligencia artificial. La app usa Next.js App Router, React 19 y Tailwind CSS
v4.

## Scripts

```bash
npm run dev
npm run lint
npm run build
```

## Rutas

- `/`: landing visual de NexaBot.
- `/auth/login`: inicio de sesion conectado al backend de autenticacion.
- `/auth/register`: registro de alumnos y profesores.
- `/auth/verify-email`: confirmacion de correo por token.
- `/auth/resend-verification`: reenvio de correo de verificacion.
- `/auth/forgot-password`: solicitud de enlace para recuperar contrasena.
- `/auth/reset-password`: restablecimiento de contrasena por token.
- `/dashboard/biblioteca`: biblioteca de documentos, actualmente con datos demo.
- `/dashboard/chats`: salas de estudio, actualmente con datos demo.

## Estado

La autenticacion esta parcialmente integrada con el backend configurado en
`NEXT_PUBLIC_API_URL`. Login, registro, verificacion, reenvio de verificacion y
recuperacion de contrasena llaman endpoints reales.

El dashboard mantiene datos demo para documentos, sesiones y mensajes mientras
se conectan los endpoints RAG/documentales. Las rutas bajo `/dashboard` se
validan antes del render con `proxy.ts` y mantienen refresco de sesion en el
cliente durante la navegacion.

## Estructura

- `app/`: rutas, layouts y estilos globales.
- `components/`: piezas reutilizables de landing, auth, dashboard, chats y
  documentos.
- `lib/`: helpers de comunicacion con el backend.
- `public/`: assets publicos del proyecto.

Antes de cambiar patrones de Next.js, revisa la documentacion local en
`node_modules/next/dist/docs/`, como indica `AGENTS.md`.
