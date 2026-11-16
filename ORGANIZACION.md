# Organización del frontend de Comerzia

Se tomó como referencia la separación de responsabilidades trabajada en la clínica: tipos, servicios de API, hooks, autenticación, páginas, componentes y rutas. La aplicación conserva React, TypeScript, Vite, Tailwind y las dependencias que ya tenía.

## Carpetas

| Ruta | Responsabilidad |
| --- | --- |
| `src/main.tsx` | Montar React y cargar la hoja de estilos. |
| `src/App.tsx` | Componer router y proveedores. |
| `src/routes/` | Declarar rutas, controlar acceso por rol y reiniciar el scroll. |
| `src/layouts/` | Estructura compartida de la tienda y del panel. |
| `src/pages/` | Pantallas organizadas por área: tienda, cuenta, checkout, pedidos, caja, POS, ventas y usuarios. |
| `src/components/` | Formularios, modales, paneles laterales y componentes reutilizables. |
| `src/types/` | Tipos de cada recurso y contratos de entrada/salida. |
| `src/services/` | Llamadas de API por recurso. |
| `src/lib/api.ts` | URL base, Bearer token, timeout, JSON y errores HTTP. |
| `src/lib/session.ts` | Persistencia de sesión en sessionStorage. |
| `src/context/` | Estado global de autenticación y composición de la tienda. |
| `src/hooks/` | useAuth, useApi, useCart, useTheme, useToast y useApp. |
| `src/utils/` | Formato de importes/fechas, lectura de formularios e imágenes de producto. |
| `src/assets/` | Asociación de recursos visuales. |
| `src/styles/index.css` | CSS original, con el mismo contenido. |
| `src/tests/` | Pruebas de interfaz y configuración JSDOM. |

## Dónde encontrar autenticación y usuarios

| Función | Archivo |
| --- | --- |
| Iniciar sesión | `components/auth/LoginForm.tsx` |
| Registrar cliente | `components/auth/RegisterForm.tsx` |
| Contenedor del modal de acceso | `components/auth/AuthModal.tsx` |
| Campo de contraseña reutilizable | `components/auth/PasswordField.tsx` |
| Estado de sesión | `context/AuthProvider.tsx` y `hooks/useAuth.ts` |
| Login HTTP | `services/auth.service.ts` |
| Registro y creación de personal HTTP | `services/users.service.ts` |
| Tipos de usuario y formularios | `types/users.ts` |
| Contrato de login y roles | `types/auth.ts` |
| Crear ADMIN o CAJERO | `pages/users/CreateUserPage.tsx` |
| Pantalla de acceso a una ruta privada | `pages/auth/AccessPage.tsx` |
| Protección de rutas | `routes/ProtectedRoute.tsx` |

Login y registro conservan su presentación emergente. Los formularios están separados y comparten el contenedor y el campo de contraseña. El backend existente solo ofrece registro de clientes y creación de personal; no se inventaron pantallas de listado o edición de usuarios.

## Recorrido de una llamada

Una página o un formulario llama al servicio del recurso. Ese servicio utiliza `lib/api.ts`, que añade el token y consulta el backend. Los tipos de entrada y respuesta están en `types/`.

Ejemplo: `RegisterForm.tsx` → `usersService.register()` → `lib/api.ts` → `/users/register`.

Los componentes ya no declaran URLs de endpoints ni utilizan fetch directamente. Se mantienen imports relativos y los contratos de la API de Comerzia. La referencia de la clínica se aplicó a la organización; no se copiaron sus endpoints, su prefijo `/api` ni su almacenamiento de tokens.

## Reutilización

Se conserva un administrador compartido de productos/categorías porque ambos utilizan la misma estructura visual. Se comparten también modal, botones, mensajes de error, cantidades, detalle de productos y layouts. No se añadieron bibliotecas ni capas genéricas de repositorios.

## Verificación

- Compilación TypeScript y Vite correcta.
- 10 pruebas de interfaz aprobadas: las 6 existentes y regresiones de login con producto pendiente, confirmación de contraseña, registro sin login automático y error al guardar producto.
- Hoja de estilos y recursos públicos idénticos a los de la versión tomada de GitHub.
- Sin cambios en endpoints, base de datos, dependencias o variables de entorno.
- Las pruebas usan JSDOM y respuestas de API simuladas. No se realizó una prueba visual en navegador ni se modificó el despliegue.
