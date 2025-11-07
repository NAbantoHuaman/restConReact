# Sistema de diseño — Panel Administrativo

Este documento recoge las decisiones de diseño y pautas de implementación para el rediseño moderno y minimalista del apartado de administración.

## Paleta y tipografía

- Colores neutros y profesionales: `neutral` y `white` como base.
- Color acento: `accent` (definido en `tailwind.config.js`) para estados activos y detalles.
- Modo claro/oscuro: activado por clase (`dark`) y gestionado por `ThemeContext`.
- Tipografía sans-serif limpia (por defecto del sistema) con jerarquía clara: títulos (`font-semibold`, tamaños `text-xl`/`text-2xl`), contenido `text-sm`/`text-base`.

## Espaciado y layout

- Espacios generosos (`p-4`, `p-6`, `gap-3`/`gap-6`).
- Contenedores estandarizados con `Card` para coherencia visual.
- Sidebar colapsable y `Breadcrumbs` para orientación del usuario.

## Componentes UI

- `Card`: contenedor con sombra sutil y borde neutro.
- `Button`: variantes `primary`, `outline`, `danger`, `ghost`; tamaños `sm`, `md`; estados de foco accesibles.
- `Input` y `Select`: labels flotantes; soporte claro/oscuro; foco con `ring-2`.
- Tablas: divisores sutiles (`border-neutral-200/800`) y zebra (`odd:bg-neutral-50` / `dark:odd:bg-neutral-900`); scroll horizontal cuando sea necesario.

## Accesibilidad (WCAG 2.1 AA)

- Uso de etiquetas visibles (`label` flotantes) y `aria-label`/`aria-current` para navegación.
- Contraste suficiente en estados de foco y selección.
- Feedback visual tras acciones (notificaciones con iconos y roles `alert`/`status`).
- Navegación por teclado: enfoque visible en botones y controles.

## Experiencia de usuario

- Transiciones suaves (`ease-smooth`, `duration-300`) en sidebar y hover.
- Feedback discreto y no intrusivo (notices, cambios de borde/ fondo).
- Diseño responsive mediante `grid` y `flex`, con puntos de corte en `md`.

## Modo claro/oscuro

- `ThemeContext` persiste el tema en `localStorage` y alterna la clase `dark` en `document.documentElement`.
- El toggle está disponible en el sidebar del `AdminLayout`.

## Integración técnica

- Tailwind configurado con `darkMode: 'class'` y color `accent`.
- Componentes en `src/components/admin/ui` para reuso y coherencia.
- Páginas del admin refactorizadas para usar los nuevos componentes manteniendo la funcionalidad.

## Buenas prácticas

- Evitar estilos inline complejos; preferir utilidades tailwind y componentes.
- Mantener la semántica HTML (`nav`, `table`, `thead`, `tbody`, `button`, `form`).
- Revisar contrastes y roles ARIA en nuevas incorporaciones.