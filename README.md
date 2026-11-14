# Comerzia · Frontend

React + TypeScript + Vite + Tailwind CSS. Consulta `../LEEME-FRONTEND.md` para instalación, configuración y límites de esta entrega.

```sh
npm ci
# Copia .env.example a .env y verifica la URL del backend.
npm run dev
```

El modo oscuro es inicial. Tema persistido localmente, autenticación por JWT en sessionStorage, datos de catálogo y operaciones obtenidos de la API.

Estructura:
- `src/api.ts`: cliente HTTP y errores.
- `src/context.tsx`: sesión, tema, carrito y overlays de tienda.
- `src/components/`: componentes compartidos y layouts.
- `src/pages/`: tienda, checkout, pedidos y operaciones del personal.
- `src/styles.css`: tokens de tema, estilos responsive y accesibilidad.
- `public/images/`: recursos visuales de los diseños de Stitch.

Las pruebas de componentes usan respuestas simuladas; no sustituyen la prueba con tu backend y tu base de datos.
