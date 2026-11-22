const pantalla = document.getElementById('app');

Acme.mostrar = () => {
  if (Acme.sesion.actual()) {
    Acme.vistas.panel(pantalla);
  } else {
    Acme.vistas.login(pantalla);
  }
};

Acme.mostrar();
