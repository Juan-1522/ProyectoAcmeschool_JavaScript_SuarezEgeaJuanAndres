Acme.almacen = {
  leer(clave, valorInicial) {
    try {
      const guardado = JSON.parse(localStorage.getItem(clave));
      return guardado === null ? valorInicial : guardado;
    } catch (error) {
      return valorInicial;
    }
  },

  escribir(clave, valor) {
    localStorage.setItem(clave, JSON.stringify(valor));
  }
};
