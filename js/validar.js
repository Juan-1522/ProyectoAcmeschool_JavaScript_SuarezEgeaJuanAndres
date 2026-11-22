// Las reglas de los formularios devuelven el texto del aviso; si todo está
// bien devuelven una cadena vacía y el campo no muestra nada.
Acme.validar = {
  correo(valor) {
    if (!valor.trim()) {
      return 'Escribe tu correo.';
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(valor.trim())) {
      return 'Ese correo no tiene formato válido.';
    }
    return '';
  },

  clave(valor) {
    if (!valor) {
      return 'Escribe tu contraseña.';
    }
    return '';
  }
};
