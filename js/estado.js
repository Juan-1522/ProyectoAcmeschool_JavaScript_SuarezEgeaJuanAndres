// Estado de la app
Acme.estado = {
  listas: ['usuarios', 'examenes', 'intentos'],

  cargar() {
    this.listas.forEach((lista) => {
      const clave = 'acme:' + lista;
      if (Acme.almacen.leer(clave, null) === null) {
        Acme.almacen.escribir(clave, Acme.datos[lista]);
      }
      this[lista] = Acme.almacen.leer(clave, Acme.datos[lista]);
    });
  },

  guardar(lista) {
    Acme.almacen.escribir('acme:' + lista, this[lista]);
  }
};

Acme.estado.cargar();
