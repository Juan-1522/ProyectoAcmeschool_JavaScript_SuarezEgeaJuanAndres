const pantalla = document.getElementById('app');

// Mapa de rutas
const rutas = {
  '#/panel': { vista: 'panel', privado: true },
  '#/usuarios': { vista: 'usuarios', privado: true },
  '#/examenes': { vista: 'examenes', privado: true },
  // El módulo público
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
