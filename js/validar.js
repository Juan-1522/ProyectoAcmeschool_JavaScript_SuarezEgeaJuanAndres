// Las reglas de los formularios devuelven el texto del aviso; si todo está
// bien devuelven una cadena vacía y el campo no muestra nada.
Acme.validar = {
  correo(valor, textoVacio) {
    if (!valor.trim()) {
      return textoVacio || 'Escribe tu correo.';
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
  },

  // Al registrar a alguien se pide una contraseña nueva, así que aquí sí se
  // exige longitud; en el acceso se deja pasar cualquiera porque ya está guardada.
  claveNueva(valor) {
    if (!valor) {
      return 'Escribe la contraseña.';
    }
    if (valor.length < 6) {
      return 'La contraseña necesita 6 caracteres o más.';
    }
    return '';
  },

  cedula(valor) {
    if (!valor.trim()) {
      return 'Escribe el número de identificación.';
    }
    if (!/^\d{7,12}$/.test(valor.trim())) {
      return 'La identificación son entre 7 y 12 dígitos, sin puntos.';
    }
    return '';
  },

  nombre(valor) {
    if (!valor.trim()) {
      return 'Escribe el nombre completo.';
    }
    if (!/^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ\s]+$/.test(valor.trim())) {
      return 'El nombre lleva solo letras y espacios.';
    }
    if (valor.trim().split(/\s+/).length < 2) {
      return 'Falta el segundo nombre o el apellido.';
    }
    return '';
  },

  telefono(valor) {
    if (!valor.trim()) {
      return 'Escribe el teléfono.';
    }
    if (!/^\d{7,15}$/.test(valor.trim().replace(/\s/g, ''))) {
      return 'El teléfono son entre 7 y 15 dígitos, con espacios si quieres.';
    }
    return '';
  },

  // Debajo del campo va un párrafo con el id del campo más "-error"; aquí se
  // escribe el texto, se marca el borde y se avisa a quien usa lector de pantalla.
  mostrar(monticulo, campo, mensaje) {
    const error = monticulo.querySelector('#' + campo + '-error');
    error.textContent = mensaje;
    error.hidden = !mensaje;

    const entrada = monticulo.querySelector('#' + campo);
    entrada.classList.toggle('malo', Boolean(mensaje));
    entrada.setAttribute('aria-invalid', Boolean(mensaje));
  }
};
