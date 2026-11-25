# Plataforma de exámenes - Acme School

Aplicación para que el equipo de Acme School administre su personal y cree exámenes, y para
que un estudiante los resuelva desde un enlace sin necesidad de tener cuenta en la
plataforma. Está hecha con HTML, CSS y JavaScript puro: sin framework, sin dependencias y
sin pasos de instalación.

No tiene backend. Todo lo que se modifica se guarda en el navegador con `localStorage`, y
al abrir la página por primera vez se cargan los datos de ejemplo que están en
`js/datos.js` (8 usuarios, 4 exámenes y 3 intentos ya respondidos, para que el panel no
llegue vacío).

## Cómo abrir el proyecto

1. Clonar el repositorio o descargarlo como ZIP.
2. Abrir `index.html` en el navegador.

No hay que compilar ni instalar nada: se abrió directo en Chrome, que es como se hicieron
todas las pruebas del proyecto. Si se prefiere servir por HTTP, con la extensión Live Server
de VS Code basta.

## Cuentas para probar el panel

Todos los usuarios de ejemplo tienen la misma contraseña: `acme1234`.

| Correo | Cargo |
| --- | --- |
| ana.torres@acme.edu | Administrativo |
| c.ruiz@acme.edu | Docente |
| l.gomez@acme.edu | Docente |
| j.mendoza@acme.edu | Administrativo |
| d.perez@acme.edu | Docente |
| a.sanchez@acme.edu | Docente |
| c.villa@acme.edu | Administrativo |
| h.avila@acme.edu | Docente |

La casilla **Recordar este equipo** deja la sesión en `localStorage` y sigue al día
siguiente. Sin marcarla se guarda en `sessionStorage` y se pierde al cerrar la pestaña.

Para ver el módulo público no se necesita ninguna de estas cuentas: basta el código de un
examen, por ejemplo `EXA-001`, con una identificación y un nombre.

## Los cuatro módulos

| Ruta | Acceso | Qué muestra |
| --- | --- | --- |
| `#/panel` | Privado | Resumen de exámenes e intentos registrados, con la lista de lo que falta por hacer |
| `#/usuarios` | Privado | Tabla del personal: registrar, editar, buscar y eliminar |
| `#/examenes` | Privado | Tabla de exámenes: crear, editar, eliminar y armar las preguntas |
| `#/publico` | Público | Catálogo de exámenes y la hoja de respuestas |

Una ruta privada sin sesión abierta muestra el formulario de acceso, y un hash que no está
en la tabla lleva al panel. La carpeta `js/vista-*.js` tiene un archivo por pantalla.

## Reglas de los formularios

Están todas en `js/validar.js`. Cada campo muestra su aviso debajo, en un párrafo enlazado
al campo con `aria-describedby`, así que el lector de pantalla lo lee junto con la etiqueta.

| Campo | Regla |
| --- | --- |
| Correo | Con forma de correo y sin espacios |
| Contraseña al registrar | 6 caracteres o más |
| Identificación | Entre 7 y 12 dígitos, sin puntos |
| Nombre | Solo letras y espacios, nombre y apellido |
| Teléfono | Entre 7 y 15 dígitos, se admiten espacios |
| Código de examen | `EXA-` y tres dígitos; no importa si se escribe en minúsculas |
| Título | 4 caracteres o más |
| Duración | Minutos enteros entre 1 y 180 |
| Porcentaje de aprobación | Entero entre 1 y 100 |

El buscador quita tildes y mayúsculas antes de comparar, para que "avila" encuentre a
"Héctor Manuel Ávila".

## Cómo se calcula la nota

En `js/nota.js`. Se compara la posición elegida en cada pregunta con la que el examen tiene
como correcta (un `-1` significa que se dejó sin responder), y la nota es el porcentaje de
aciertos redondeado. Se aprueba si ese porcentaje llega al mínimo que puso el docente al
crear el examen. Al terminar, la hoja se puede revisar pregunta por pregunta.

El cronómetro corre sobre el tiempo del examen. Si se agota, se entregan las respuestas que
estaban marcadas en ese momento.

## Dónde quedan los datos

| Clave | Contenido |
| --- | --- |
| `acme:usuarios` | El personal |
| `acme:examenes` | Los exámenes con sus preguntas |
| `acme:intentos` | Lo que presentaron los estudiantes |
| `acme:sesion` | Quién tiene la sesión abierta, si se marcó Recordar |

Borrar un examen también borra los intentos registrados sobre ese código.

Para empezar de cero: DevTools → Application → Local Storage → eliminar las claves `acme:*`
y recargar. `js/datos.js` vuelve a sembrar el navegador con los datos de ejemplo.

## Estructura

```
index.html          Un solo div: la aplicación se monta ahí
css/styles.css      La hoja de estilos completa
js/datos.js         Los datos de ejemplo
js/almacen.js       Leer y escribir en localStorage
js/estado.js        Une los datos con el almacenamiento
js/sesion.js        La sesión abierta y Recordar este equipo
js/validar.js       Las reglas de los formularios
js/nota.js          El cálculo de la nota
js/componentes.js   El avatar y la barra lateral, como Web Components
js/barra.js         El armado de la página y sus rutas
js/app.js           El enrutado por hash
js/vista-login.js   El acceso
js/vista-panel.js   El panel
js/vista-usuarios.js  La tabla del personal
js/vista-examenes.js  La tabla de exámenes y el editor de preguntas
js/vista-publico.js   El módulo de resolución
```

Los archivos son `<script>` clásicos con `defer`, en el orden que se ven arriba: cada uno
agrega piezas al objeto global `Acme` y ninguna exporta nada.

## Límites conocidos

- Al no haber servidor, los datos viven en el navegador del equipo donde se abre la página.
  Lo que se registra en una máquina no aparece en otra.
- No hay recuperación de contraseña, ni correo, ni roles con permisos distintos: quien
  entra al panel puede administrar todo.
- Es una entrega de entrenamiento, no una plataforma lista para producción.

## Responsive

Las pantallas grandes muestran la barra lateral al lado del contenido. Desde 1120 px hacia
abajo la barra pasa a encabezar la página, y debajo de 860 px cada fila de tabla se vuelve
una ficha con la etiqueta de su columna, para que ninguna tabla tenga que deslizar.

---

Entrega final del skill de JavaScript · Juan Andrés Suárez Egea
