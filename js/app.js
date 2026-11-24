const pantalla = document.getElementById('app');

// La barra lateral cambia el hash de la dirección y aquí se decide qué vista
// tocar. Cualquier ruta privada sin sesión abierta devuelve el formulario de
// acceso, y un hash que no está en la tabla termina en el panel.
const rutas = {
  '#/panel': { vista: 'panel', privado: true },
  '#/usuarios': { vista: 'usuarios', privado: true },
  '#/examenes': { vista: 'examenes', privado: true },
  // La única que no pide sesión: quien viene a resolver un examen no es
  // usuario del panel.
  '#/publico': { vista: 'publico', privado: false }
};

Acme.mostrar = () => {
  const ruta = rutas[location.hash] || rutas['#/panel'];

  if (ruta.privado && !Acme.sesion.actual()) {
    Acme.vistas.login(pantalla);
    return;
  }

  Acme.vistas[ruta.vista](pantalla);
};

window.addEventListener('hashchange', Acme.mostrar);

Acme.mostrar();
