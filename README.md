# Comerzia · Frontend

Tienda online y panel operativo con React, TypeScript, Vite y Tailwind CSS, conectado a una API NestJS.

## Preparación

Requiere Node.js 24 y el backend en funcionamiento.

```bash
npm ci
```

Copia `.env.example` a `.env` y configura `VITE_API_URL` con la URL del backend, sin `/api` al final. Conserva tu configuración actual si ya existe.

```bash
npm run dev
```

## Compilar y verificar

```bash
npm run build
npm test
```

## Organización

Consulta [ORGANIZACION.md](./ORGANIZACION.md) para ubicar páginas, componentes, tipos, servicios, hooks y rutas.

La autenticación se encuentra en `components/auth/`, `context/AuthProvider.tsx`, `hooks/useAuth.ts`, `services/auth.service.ts` y `services/users.service.ts`.

El cambio de estructura conserva las rutas públicas, el tema claro/oscuro y las funciones de tienda y panel. La sesión sigue en sessionStorage. Los pagos son ficticios: prefijo 4040 aprobado, otros rechazados. No utilices tarjetas reales.

## Publicación

En Vercel: framework Vite, raíz `./`, build `npm run build`, salida `dist`. Define `VITE_API_URL` antes de compilar y autoriza el origen del frontend en CORS_ORIGINS del backend.
