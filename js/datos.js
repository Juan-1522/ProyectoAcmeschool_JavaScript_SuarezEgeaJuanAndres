window.Acme = window.Acme || {};

const usuarios = [
  {
    id: '1020345876',
    nombre: 'Ana María Torres',
    correo: 'ana.torres@acme.edu',
    telefono: '300 555 1122',
    cargo: 'Administrativo',
    clave: 'acme1234'
  },
  {
    id: '1015998223',
    nombre: 'Carlos Andrés Ruiz',
    correo: 'c.ruiz@acme.edu',
    telefono: '311 442 9087',
    cargo: 'Docente',
    clave: 'acme1234'
  },
  {
    id: '1007745310',
    nombre: 'Luisa Fernanda Gómez',
    correo: 'l.gomez@acme.edu',
    telefono: '320 118 4455',
    cargo: 'Docente',
    clave: 'acme1234'
  },
  {
    id: '1033820144',
    nombre: 'Jorge Iván Mendoza',
    correo: 'j.mendoza@acme.edu',
    telefono: '315 776 2019',
    cargo: 'Administrativo',
    clave: 'acme1234'
  },
  {
    id: '1041290077',
    nombre: 'Diana Marcela Pérez',
    correo: 'd.perez@acme.edu',
    telefono: '318 220 6631',
    cargo: 'Docente',
    clave: 'acme1234'
  },
  {
    id: '1052017788',
    nombre: 'Andrés Felipe Sánchez',
    correo: 'a.sanchez@acme.edu',
    telefono: '314 903 5522',
    cargo: 'Docente',
    clave: 'acme1234'
  },
  {
    id: '1063341290',
    nombre: 'Claudia Villaquirán',
    correo: 'c.villa@acme.edu',
    telefono: '301 664 8870',
    cargo: 'Administrativo',
    clave: 'acme1234'
  },
  {
    id: '1074458012',
    nombre: 'Héctor Manuel Ávila',
    correo: 'h.avila@acme.edu',
    telefono: '320 771 3348',
    cargo: 'Docente',
    clave: 'acme1234'
  }
];

const examenes = [
  {
    codigo: 'EXA-001',
    titulo: 'Fundamentos de JavaScript',
    tiempo: 20,
    aprobacion: 70,
    descripcion: 'Sintaxis, ámbitos, funciones y manipulación del DOM.',
    estado: 'Publicado',
    preguntas: [
      {
        enunciado: '¿Qué palabra clave declara una variable que solo existe dentro del bloque donde se escribió?',
        respuestas: [
          { texto: 'var', correcta: false },
          { texto: 'let', correcta: true },
          { texto: 'function', correcta: false },
          { texto: 'static', correcta: false }
        ]
      },
      {
        enunciado: '¿Qué devuelve typeof null?',
        respuestas: [
          { texto: '"null"', correcta: false },
          { texto: '"undefined"', correcta: false },
          { texto: '"object"', correcta: true },
          { texto: '"number"', correcta: false }
        ]
      },
      {
        enunciado: '¿Qué método agrega un elemento al final de un arreglo?',
        respuestas: [
          { texto: 'pop()', correcta: false },
          { texto: 'push()', correcta: true },
          { texto: 'shift()', correcta: false },
          { texto: 'unshift()', correcta: false }
        ]
      },
      {
        enunciado: '¿Cuál es la forma correcta de registrar un Web Component propio?',
        respuestas: [
          { texto: "customElements.define('mi-tag', MiClase)", correcta: true },
          { texto: "document.registerTag('mi-tag')", correcta: false },
          { texto: "HTML.element('mi-tag')", correcta: false },
          { texto: "window.component('mi-tag')", correcta: false }
        ]
      },
      {
        enunciado: '¿Qué hace e.preventDefault() dentro de un manejador de eventos?',
        respuestas: [
          { texto: 'Cancela la acción que el navegador haría por defecto', correcta: true },
          { texto: 'Detiene la propagación del evento hacia los padres', correcta: false },
          { texto: 'Elimina el elemento del documento', correcta: false },
          { texto: 'Vuelve a ejecutar el evento', correcta: false }
        ]
      }
    ]
  },
  {
    codigo: 'EXA-002',
    titulo: 'Cálculo diferencial',
    tiempo: 35,
    aprobacion: 60,
    descripcion: 'Límites, derivadas y la regla de la cadena.',
    estado: 'Publicado',
    preguntas: [
      {
        enunciado: '¿Cuál es la derivada de f(x) = x³?',
        respuestas: [
          { texto: '3x²', correcta: true },
          { texto: 'x²', correcta: false },
          { texto: '3x', correcta: false },
          { texto: 'x⁴ / 4', correcta: false }
        ]
      },
      {
        enunciado: '¿Cuánto vale el límite de (x² − 4) / (x − 2) cuando x tiende a 2?',
        respuestas: [
          { texto: '4', correcta: true },
          { texto: '0', correcta: false },
          { texto: '2', correcta: false },
          { texto: 'No existe', correcta: false }
        ]
      },
      {
        enunciado: 'La derivada de sen(x) es:',
        respuestas: [
          { texto: '−cos(x)', correcta: false },
          { texto: 'cos(x)', correcta: true },
          { texto: '−sen(x)', correcta: false },
          { texto: 'tan(x)', correcta: false }
        ]
      },
      {
        enunciado: 'Si f(x) = 5, ¿cuánto vale f′(x)?',
        respuestas: [
          { texto: '0', correcta: true },
          { texto: '5', correcta: false },
          { texto: '1', correcta: false },
          { texto: 'No existe', correcta: false }
        ]
      }
    ]
  },
  {
    codigo: 'EXA-003',
    titulo: 'Historia de Colombia',
    tiempo: 15,
    aprobacion: 80,
    descripcion: 'Independencia, República y Constitución.',
    estado: 'Borrador',
    preguntas: [
      {
        enunciado: '¿En qué año se declaró la independencia absoluta de Colombia?',
        respuestas: [
          { texto: '1810', correcta: false },
          { texto: '1819', correcta: true },
          { texto: '1886', correcta: false },
          { texto: '1991', correcta: false }
        ]
      },
      {
        enunciado: '¿Qué campaña militar llevó a la independencia del país en 1819?',
        respuestas: [
          { texto: 'La Campaña Libertadora', correcta: true },
          { texto: 'La Expedición Botánica', correcta: false },
          { texto: 'La Revolución de los Comuneros', correcta: false },
          { texto: 'La Guerra de los Mil Días', correcta: false }
        ]
      },
      {
        enunciado: '¿En qué año se promulgó la Constitución que está vigente?',
        respuestas: [
          { texto: '1886', correcta: false },
          { texto: '1965', correcta: false },
          { texto: '1991', correcta: true },
          { texto: '2000', correcta: false }
        ]
      }
    ]
  },
  {
    codigo: 'EXA-004',
    titulo: 'Inglés B1 · lectura',
    tiempo: 25,
    aprobacion: 65,
    descripcion: 'Comprensión de textos cortos, inferencia y vocabulario en contexto.',
    estado: 'Publicado',
    preguntas: [
      {
        enunciado: "The museum is open from 9 to 5 on weekdays. On Saturdays it opens at 10 and closes at 2. When can you visit on a Sunday?",
        respuestas: [
          { texto: 'The museum is closed on Sundays', correcta: true },
          { texto: 'From 9 to 5', correcta: false },
          { texto: 'From 10 to 2', correcta: false },
          { texto: 'From 2 to 5', correcta: false }
        ]
      },
      {
        enunciado: "Choose the meaning of: 'The train was delayed due to heavy rain.'",
        respuestas: [
          { texto: 'El tren llegó tarde por la lluvia', correcta: true },
          { texto: 'El tren salió antes de la lluvia', correcta: false },
          { texto: 'La lluvia canceló toda la ruta', correcta: false },
          { texto: 'El tren estaba lleno de gente', correcta: false }
        ]
      },
      {
        enunciado: "She has been studying since eight. This means that she...",
        respuestas: [
          { texto: 'empezó a estudiar a las ocho y todavía sigue', correcta: true },
          { texto: 'estudió solo durante ocho minutos', correcta: false },
          { texto: 'terminó de estudiar a las ocho', correcta: false },
          { texto: 'va a estudiar a las ocho', correcta: false }
        ]
      },
      {
        enunciado: "Which word is a synonym of 'cheap'?",
        respuestas: [
          { texto: 'inexpensive', correcta: true },
          { texto: 'expensive', correcta: false },
          { texto: 'comfortable', correcta: false },
          { texto: 'difficult', correcta: false }
        ]
      }
    ]
  }
];

// Intentos de ejemplo
const intentos = [
  {
    codigo: 'EXA-001',
    identificacion: '1098877665',
    nombre: 'Juan Pérez',
    fecha: '2026-11-18T09:15:00',
    tiempoUsado: '15:48',
    elegidas: [1, 2, 1, 0, 0]
  },
  {
    codigo: 'EXA-002',
    identificacion: '1087766554',
    nombre: 'María Salazar',
    fecha: '2026-11-17T14:30:00',
    tiempoUsado: '35:00',
    elegidas: [0, -1, 1, 1]
  },
  {
    codigo: 'EXA-004',
    identificacion: '1076655443',
    nombre: 'Diego Rojas',
    fecha: '2026-11-19T10:05:00',
    tiempoUsado: '11:20',
    elegidas: [0, 0, 0, 1]
  }
];

Acme.datos = { usuarios, examenes, intentos };
