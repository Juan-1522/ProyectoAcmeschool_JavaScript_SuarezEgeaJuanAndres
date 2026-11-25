// Reglas de los formularios
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

  // Clave nueva
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

  // Código del examen
  codigoExamen(valor) {
    if (!valor.trim()) {
      return 'Escribe el código del examen.';
    }
    if (!/^EXA-\d{3}$/.test(valor.trim().toUpperCase())) {
      return 'El código es EXA- y tres dígitos, por ejemplo EXA-005.';
    }
    return '';
  },

  titulo(valor) {
    if (!valor.trim()) {
      return 'Escribe el título del examen.';
    }
    if (valor.trim().length < 4) {
      return 'El título necesita 4 caracteres o más.';
    }
    return '';
  },

  descripcion(valor) {
    if (!valor.trim()) {
      return 'Escribe de qué trata el examen.';
    }
    return '';
  },

  // Duración del examen
  tiempo(valor) {
    if (!valor.trim()) {
      return 'Escribe cuánto dura el examen.';
    }
    const minutos = Number(valor);
    if (!Number.isInteger(minutos) || minutos < 1 || minutos > 180) {
      return 'La duración son minutos enteros entre 1 y 180.';
    }
    return '';
  },

  aprobacion(valor) {
    if (!valor.trim()) {
      return 'Escribe el porcentaje para aprobar.';
    }
    const puntos = Number(valor);
    if (!Number.isInteger(puntos) || puntos < 1 || puntos > 100) {
      return 'La aprobación es un porcentaje entre 1 y 100.';
    }
    return '';
  },

  // Aviso de un campo
  mostrar(monticulo, campo, mensaje) {
    const error = monticulo.querySelector('#' + campo + '-error');
    error.textContent = mensaje;
    error.hidden = !mensaje;

    const entrada = monticulo.querySelector('#' + campo);
    entrada.classList.toggle('malo', Boolean(mensaje));
    entrada.setAttribute('aria-invalid', Boolean(mensaje));
  }
};
