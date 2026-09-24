# GolAdmin · Frontend de gestión (Next.js)

Panel de administración con temática de fútbol para gestionar **usuarios, roles, permisos** y la **matriz de permisos por rol**, además de las vistas de autenticación. Es **solo UI**: no hay backend ni autenticación real. Todos los datos son mock y viven en el estado de React (`DataContext`), así que se reinician al recargar la página.

## Stack

- Next.js 15 (App Router) · React 19 · TypeScript
- Tailwind CSS v4 · lucide-react · clsx

## Comandos

```bash
npm install
npm run dev     # http://localhost:3000
npm run build   # build de producción + chequeo de tipos
```

## Estructura

```
src/
├─ app/
│  ├─ layout.tsx               # Providers (tema, toasts, datos mock) + script anti-parpadeo
│  ├─ globals.css              # Tailwind v4, tokens de color de Colombia, dark mode por clase
│  ├─ (dashboard)/             # Rutas con Sidebar + Topbar (AppShell)
│  │  ├─ dashboard/            # Resumen (KPIs)
│  │  ├─ usuarios/ · usuarios/[id]/   # HU-SE-01/02
│  │  ├─ perfil/               # HU-SE-02 (teléfono y foto)
│  │  ├─ roles/ · roles/[id]/  # HU-SE-03/04
│  │  ├─ permisos/             # HU-SE-05
│  │  └─ matriz/               # HU-SE-06 (?rol=<id>)
│  └─ (auth)/                  # Layout dividido, sin sidebar
│     ├─ login/                # HU-SE-07
│     ├─ registro/             # HU-SE-08
│     ├─ recuperar/            # HU-SE-09
│     └─ verificar-2fa/        # HU-SE-10
├─ components/
│  ├─ ui/          # Componentes visuales reutilizables: Button/LinkButton, Input/Select/Textarea,
│  │               # Modal, ConfirmDialog, DataTable<T>, Checkbox, Badge, Card, Avatar, OtpInput…
│  ├─ layout/      # AppShell, Sidebar, Topbar, ThemeToggle, Logo
│  └─ features/    # Componentes de dominio: users/, roles/, permissions/, matrix/, auth/
├─ context/        # ThemeContext, ToastContext, DataContext (store mock + acciones CRUD)
├─ hooks/          # useDisclosure, usePermissionMatrix
├─ lib/            # mock-data, constants, navigation
├─ types/          # User, Role, Permission, SystemModule, Operation…
└─ utils/          # cn, format, password
```

**Smart vs. dumb:** las `page.tsx` (y `PermissionMatrixView`) son contenedores: leen `useData()` y hooks. Los componentes de `ui/` y la mayoría de `features/*` reciben todo por props.

## Regla de color 60-30-10

| Proporción | Uso | Clases |
|---|---|---|
| 60 % | Fondo dominante | `bg-white` / `dark:bg-black` |
| 30 % | Tarjetas, bordes, sidebar, modales | `zinc-50…200` / `zinc-800…950` |
| 10 % | Acentos (bandera de Colombia) | `co-yellow #FCD116`, `co-blue #003893`, `co-red #CE1126` |

Azul: acciones primarias y estados activos en modo claro. Amarillo: estados activos en modo oscuro, badges y logo. Rojo: acciones destructivas, errores y cambios pendientes.

## Datos de demostración

- Login: cualquier correo válido y contraseña de 6 o más caracteres. Con la clave `offside` se muestra el error.
- 2FA: el código válido es `123456`.
- Perfil: el usuario actual es `u-1` (`CURRENT_USER_ID` en `lib/mock-data.ts`).
