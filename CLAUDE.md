# Prompt para Claude: Frontend de Gestión (Next.js)

**Actúa como un Desarrollador Frontend Senior y Arquitecto de Software experto en React y Next.js (App Router).**

Tu objetivo es crear desde cero la estructura, los componentes y las vistas de un frontend en Next.js para un sistema de gestión y administración de una aplicación con temática de **fútbol**. 

**REGLAS ESTRICTAS DEL DESARROLLO:**
1. **Cero Backend y Cero Lógica de Autenticación Real:** El sistema no debe conectarse a ninguna base de datos ni API real. Todo debe funcionar con **Mock Data (datos falsos estáticos)** utilizando el estado de React (useState, useContext). No bloquees ninguna ruta con guards de autenticación reales; todas las pantallas deben ser accesibles para propósitos de demostración de la interfaz.
2. **Arquitectura de Componentes:** Aplica las mejores prácticas de React. Separa componentes lógicos de componentes visuales (Smart/Dumb components). Usa una estructura de carpetas limpia (ej. `components/ui`, `components/features`, `app/`, `hooks/`, `utils/`).
3. **Diseño UI/UX (Regla 60-30-10):**
   * **60% (Color Dominante):** Blanco (para modo claro) o Negro (para modo oscuro). La app debe soportar el toggle entre Light/Dark mode.
   * **30% (Color Secundario):** Tonos neutros (grises sutiles para fondos de tarjetas, bordes, modales o divisiones) que no compitan con el fondo ni con los acentos.
   * **10% (Color de Acento):** Los colores de la **bandera de Colombia (Amarillo, Azul y Rojo)**. Usa estos colores para botones primarios, estados activos, toggles, badges, iconos y logos.
4. **Temática de Fútbol:** Adapta la iconografía (puedes usar Lucide React) y los textos de relleno (placeholders) para que respiren un aire futbolero (canchas, balones, silbatos, tarjetas), manteniendo un tono profesional de software de gestión.
5. **Estilos:** Utiliza **Tailwind CSS** para todo el maquetado.

**REQUERIMIENTOS FUNCIONALES (INTERFACES A CONSTRUIR):**
Debes crear un Layout principal con un Sidebar o Topbar de navegación que dé acceso mediante pestañas o enlaces a los siguientes paneles y vistas:

* **1. Panel de Gestión de Usuarios (HU-SE-01 y HU-SE-02):**
  * Tabla/Listado de usuarios con opciones para ver detalle, editar, y desactivar/eliminar.
  * Formulario de registro/edición de usuario (con campos para roles).
  * Vista de Perfil de Usuario (edición de teléfono y fotografía).

* **2. Panel de Gestión de Roles y Asignación (HU-SE-03 y HU-SE-04):**
  * Tabla de roles (Nombre y Descripción).
  * Modal/Pantalla para crear/editar rol.
  * Vista detallada del rol que incluya un sub-panel para ver qué usuarios tienen este rol, un botón para agregar usuarios disponibles a este rol, y opciones con confirmación para remover un usuario del rol.

* **3. Panel de Permisos (HU-SE-05):**
  * Listado de permisos (Recurso/Módulo, Operación, URL, Método HTTP).
  * Formulario para registrar y editar permisos.

* **4. Matriz de Asignación de Permisos a Roles (HU-SE-06):**
  * Esta es la vista más importante. Un panel donde selecciono un Rol en un dropdown/pestaña, y me renderiza una **Matriz (Tabla interactiva)**.
  * **Filas:** Módulos o Recursos del sistema.
  * **Columnas (Operaciones):** Ver, Listar, Crear, Actualizar, Eliminar.
  * **Intersección:** Checkboxes interactivos estilizados para asignar o retirar el permiso.
  * Botón inferior para "Guardar Cambios de la Matriz".

* **5. Vistas de Autenticación (Solo UI visual) (HU-SE-07 a HU-SE-10):**
  * **Pantalla de Login:** Inputs de email y password. Botones de inicio de sesión con proveedores OAuth (Google, GitHub, etc.).
  * **Pantalla de Registro:** Formulario con nombre, email y validación visual de seguridad de contraseña.
  * **Pantalla de Recuperación de Contraseña:** Input para enviar email y simulación de pantalla de "Ingresa tu nueva contraseña".
  * **Modal/Pantalla de 2FA:** Pantalla para ingresar un código de 6 dígitos (simulando el segundo factor de autenticación).

**ENTREGABLES ESPERADOS EN TU RESPUESTA:**
1. La estructura de carpetas propuesta para Next.js (App Router).
2. El código completo del Layout principal (Navbar/Sidebar con temática oscura/clara y logos).
3. El código de la vista de la **Matriz de Permisos (HU-SE-06)** (ya que es la más compleja) con datos mockeados.
4. El código de una pantalla de Autenticación (Login) aplicando estrictamente la regla 60-30-10 con la bandera de Colombia.
5. El código del Panel de Gestión de Usuarios y Roles utilizando componentes reutilizables (Tablas y Modales).

Por favor, genera el código asegurando que sea responsivo, limpio, tipado (si usas TypeScript) y listo para ser copiado en un proyecto de Next.js recién inicializado con Tailwind.