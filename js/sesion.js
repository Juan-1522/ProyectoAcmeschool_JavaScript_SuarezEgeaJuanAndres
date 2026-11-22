// "Recordar este equipo" guarda la sesión en localStorage, que sigue estando
// al otro día. Sin esa casilla se queda en sessionStorage y se borra al cerrar
// la pestaña.
Acme.sesion = {
  clave: 'acme:sesion',

  abrir(usuario, recordar) {
    const datos = {
      id: usuario.id,
      nombre: usuario.nombre,
      cargo: usuario.cargo,
      hora: new Date().toISOString()
    };
    const guardado = JSON.stringify(datos);
    if (recordar) {
      localStorage.setItem(this.clave, guardado);
    } else {
      sessionStorage.setItem(this.clave, guardado);
    }
  },

  actual() {
    const texto = localStorage.getItem(this.clave) || sessionStorage.getItem(this.clave);
    return texto ? JSON.parse(texto) : null;
  },

  cerrar() {
    localStorage.removeItem(this.clave);
    sessionStorage.removeItem(this.clave);
  }
};
