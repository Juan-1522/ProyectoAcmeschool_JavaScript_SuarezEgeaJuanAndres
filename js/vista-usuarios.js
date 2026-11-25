Acme.vistas = Acme.vistas || {};

// El buscador y el sello elegido se guardan aquí porque al filtrar solo se
// vuelve a pintar la tabla, no la página completa.
const filtro = { texto: '', cargo: '' };

// El aviso del formulario sobrevive al re-renderizado que limpia los campos,
// porque la página entera se vuelve a montar después de guardar.
let aviso = null;

// Identificación de la persona que se está editando; mientras valga algo, el
// formulario de la derecha muestra sus datos en vez de estar en blanco.
let editando = null;

function usuarioEnEdicion() {
  return editando
    ? Acme.estado.usuarios.find((uno) => uno.id === editando) || null
    : null;
}

const sellos = [
  { etiqueta: 'Todos', cargo: '' },
  { etiqueta: 'Docentes', cargo: 'Docente' },
  { etiqueta: 'Administrativos', cargo: 'Administrativo' }
];

function seleccionados() {
  const texto = normalizar(filtro.texto.trim());

  return Acme.estado.usuarios
    .filter((uno) => !filtro.cargo || uno.cargo === filtro.cargo)
    .filter((uno) => {
      if (!texto) {
        return true;
      }
      return [uno.id, uno.nombre, uno.correo, uno.telefono]
        .map((campo) => normalizar(campo))
        .some((campo) => campo.includes(texto));
    })
    .sort((uno, otro) => uno.id.localeCompare(otro.id));
}

function filas(lista) {
  if (!lista.length) {
    return `
      <tr>
        <td class="vacio" colspan="6">
          Ningún usuario coincide con ${filtro.texto.trim() ? '"' + filtro.texto.trim() + '"' : 'ese filtro'}.
        </td>
      </tr>`;
  }

  return lista.map((uno) => `
    <tr${uno.id === editando ? ' class="sel"' : ''}>
      <td class="code" data-c="Identificación">${uno.id}</td>
      <td data-c="Nombre completo">
        <div class="person">
          <acme-inicial nombre="${atributo(uno.nombre)}"></acme-inicial>
          <div>${uno.nombre}</div>
        </div>
      </td>
      <td class="sm" data-c="Correo">${uno.correo}</td>
      <td class="sm" data-c="Teléfono">${uno.telefono}</td>
      <td data-c="Cargo"><span class="pill ${uno.cargo === 'Docente' ? 'doc' : 'adm'}">${uno.cargo}</span></td>
      <td class="acc" data-c="Acciones">
        <div class="iact">
          <button class="ib" type="button" data-edita="${uno.id}" aria-label="Editar a ${uno.nombre}">
            <i class="ic pencil"></i>
          </button>
          <button class="ib del" type="button" data-borra="${uno.id}" aria-label="Eliminar a ${uno.nombre}">
            <i class="ic trash"></i>
          </button>
        </div>
      </td>
    </tr>`).join('');
}

function encabezado(lista, totales) {
  if (lista.length === totales) {
    const docentes = lista.filter((uno) => uno.cargo === 'Docente').length;
    return `
      <h3>${totales} usuarios registrados</h3>
      <p class="sub">Ordenados por identificación, ${docentes} docentes y ${totales - docentes} administrativos</p>`;
  }

  const razones = [];
  if (filtro.texto.trim()) {
    razones.push('buscando "' + filtro.texto.trim() + '"');
  }
  if (filtro.cargo) {
    razones.push(filtro.cargo.toLowerCase() + 's');
  }

  return `
    <h3>${lista.length} de ${totales} usuarios</h3>
    <p class="sub">${razones.join(' y ')}</p>`;
}

function chips() {
  return sellos.map((sello) => {
    const cuantos = Acme.estado.usuarios
      .filter((uno) => !sello.cargo || uno.cargo === sello.cargo).length;
    return `
      <button class="chipbtn${sello.cargo === filtro.cargo ? ' on' : ''}" type="button"
        data-cargo="${sello.cargo}" aria-pressed="${sello.cargo === filtro.cargo}">
        ${sello.etiqueta} ${cuantos}
      </button>`;
  }).join('');
}

function campo(id, etiqueta, atributos, extra) {
  return `
      <div class="field">
        <label for="${id}">${etiqueta}</label>
        <div class="inicon">
          ${extra || ''}
          <input id="${id}" name="${id}" ${atributos} aria-describedby="${id}-error">
        </div>
        <p class="error" id="${id}-error" hidden></p>
      </div>`;
}

function formulario(uno) {
  const edicion = Boolean(uno);

  return `
    <div class="card">
      <div class="ch">
        <div>
          <h3>${edicion ? 'Actualizar usuario' : 'Crear usuario'}</h3>
          <p class="sub">${edicion ? 'Editando la identificación ' + uno.id : 'Queda guardado en este navegador'}</p>
        </div>
      </div>

      <p class="aviso ${aviso ? aviso.tipo : 'no'}" id="aviso-crear"
        ${aviso ? '' : 'hidden'}>${aviso ? aviso.texto : ''}</p>

      <form id="form-crear" novalidate>
        <div class="grid2">
          ${campo('dato-id', 'Identificación', 'type="text" inputmode="numeric" autocomplete="off" placeholder="1020345876"')}
          ${campo('dato-telefono', 'Teléfono', 'type="tel" inputmode="tel" autocomplete="off" placeholder="300 555 1122"')}
        </div>
        ${campo('dato-nombre', 'Nombre completo', 'type="text" autocomplete="name" placeholder="Ana María Torres"')}
        ${campo('dato-correo', 'Correo electrónico', 'type="email" autocomplete="off" placeholder="ana.torres@acme.edu"', '<i class="ic mail"></i>')}
        <div class="field">
          <label for="dato-cargo">Cargo</label>
          <select id="dato-cargo" name="dato-cargo">
            <option>Administrativo</option>
            <option>Docente</option>
          </select>
        </div>
        ${campo('dato-clave', 'Contraseña', `type="password" autocomplete="${edicion ? 'off' : 'new-password'}"${edicion ? ' placeholder="Sin cambios"' : ''}`)}
        <p class="hint">${edicion
          ? 'Si no escribes nada aquí, la contraseña sigue siendo la misma.'
          : 'Con esa contraseña entra al panel, así que debe tener al menos 6 caracteres.'}</p>
        <div class="btnrow">
          <button class="btn pri" type="submit">${edicion ? 'Actualizar usuario' : 'Guardar usuario'}</button>
          ${edicion ? '<button class="btn sec" type="button" id="cancelar-edicion">Cancelar</button>' : ''}
        </div>
      </form>
    </div>`;
}

Acme.vistas.usuarios = (monticulo) => {
  const totales = () => Acme.estado.usuarios.length;

  Acme.montar(monticulo, {
    activa: '#/usuarios',
    eyebrow: 'Módulo privado',
    titulo: 'Gestión de usuarios',
    acciones: `
      <div class="inicon srchw">
        <i class="ic search"></i>
        <input id="buscar" class="srch" type="search" placeholder="Buscar usuario"
          aria-label="Buscar por nombre, correo, identificación o teléfono">
      </div>`,
    contenido: `
      <div class="card">
        <div class="ch">
          <div id="info" role="status">${encabezado(seleccionados(), totales())}</div>
          <div class="r chips" id="chips">${chips()}</div>
        </div>
        <div class="tw compact">
          <table>
            <thead>
              <tr>
                <th scope="col">Identificación</th>
                <th scope="col">Nombre completo</th>
                <th scope="col">Correo</th>
                <th scope="col">Teléfono</th>
                <th scope="col">Cargo</th>
                <th class="acc" scope="col">Acciones</th>
              </tr>
            </thead>
            <tbody id="cuerpo">${filas(seleccionados())}</tbody>
          </table>
        </div>
      </div>`,
    lateral: formulario(usuarioEnEdicion())
  });

  const buscar = monticulo.querySelector('#buscar');
  buscar.value = filtro.texto;

  // Los datos de quien se edita se copian desde JavaScript para no escapar
  // nombres con comillas ni tildes dentro del HTML del formulario.
  const enEdicion = usuarioEnEdicion();
  if (enEdicion) {
    const poner = (campo, valor) => {
      monticulo.querySelector('#dato-' + campo).value = valor;
    };
    poner('id', enEdicion.id);
    poner('nombre', enEdicion.nombre);
    poner('correo', enEdicion.correo);
    poner('telefono', enEdicion.telefono);
    poner('cargo', enEdicion.cargo);
  }

  const pintar = () => {
    const lista = seleccionados();
    monticulo.querySelector('#info').innerHTML = encabezado(lista, totales());
    monticulo.querySelector('#cuerpo').innerHTML = filas(lista);
    monticulo.querySelector('#chips').innerHTML = chips();
  };

  buscar.addEventListener('input', () => {
    filtro.texto = buscar.value;
    pintar();
  });

  monticulo.querySelector('#chips').addEventListener('click', (evento) => {
    const boton = evento.target.closest('.chipbtn');
    if (!boton) {
      return;
    }
    filtro.cargo = boton.dataset.cargo;
    pintar();
  });

  // El lápiz y la papelera viven en filas que se vuelven a pintar con el
  // buscador, así que el aviso se pone en el cuerpo de la tabla y no en cada botón.
  monticulo.querySelector('#cuerpo').addEventListener('click', (evento) => {
    const botonEditar = evento.target.closest('[data-edita]');
    if (botonEditar) {
      editando = botonEditar.dataset.edita;
      aviso = null;
      Acme.vistas.usuarios(monticulo);
      monticulo.querySelector('#dato-nombre').focus();
      return;
    }

    const botonBorrar = evento.target.closest('[data-borra]');
    if (!botonBorrar) {
      return;
    }
    const lugar = Acme.estado.usuarios.findIndex((uno) => uno.id === botonBorrar.dataset.borra);
    const uno = Acme.estado.usuarios[lugar];
    const propio = Acme.sesion.actual() && Acme.sesion.actual().id === uno.id;

    if (propio) {
      aviso = { tipo: 'no', texto: 'Tu propia cuenta es la que está adentro, no se puede eliminar.' };
      Acme.vistas.usuarios(monticulo);
      return;
    }
    if (!window.confirm('¿Eliminar a ' + uno.nombre + '? Deja de aparecer en la lista.')) {
      return;
    }

    Acme.estado.usuarios.splice(lugar, 1);
    if (editando === uno.id) {
      editando = null;
    }
    Acme.estado.guardar('usuarios');
    aviso = { tipo: 'ok', texto: 'Se eliminó a ' + uno.nombre + '.' };
    Acme.vistas.usuarios(monticulo);
  });

  const cancelar = monticulo.querySelector('#cancelar-edicion');
  if (cancelar) {
    cancelar.addEventListener('click', () => {
      editando = null;
      aviso = null;
      Acme.vistas.usuarios(monticulo);
    });
  }

  const cajaAviso = monticulo.querySelector('#aviso-crear');
  const formularioNuevo = monticulo.querySelector('#form-crear');

  const pintarAviso = () => {
    cajaAviso.textContent = aviso ? aviso.texto : '';
    cajaAviso.className = 'aviso ' + (aviso ? aviso.tipo : 'no');
    cajaAviso.hidden = !aviso;
  };

  // Cualquier tecla dentro del formulario esconde el aviso anterior.
  formularioNuevo.addEventListener('input', () => {
    if (aviso) {
      aviso = null;
      pintarAviso();
    }
  });

  formularioNuevo.addEventListener('submit', (evento) => {
    evento.preventDefault();
    const valor = (campoId) => monticulo.querySelector('#' + campoId).value;

    const mensajes = {
      'dato-id': Acme.validar.cedula(valor('dato-id')),
      'dato-nombre': Acme.validar.nombre(valor('dato-nombre')),
      'dato-correo': Acme.validar.correo(valor('dato-correo'), 'Escribe el correo del usuario.'),
      'dato-telefono': Acme.validar.telefono(valor('dato-telefono')),
      // En edición la contraseña puede quedar vacía, y eso quiere decir que no
      // se cambia, así que ahí no se le exige longitud.
      'dato-clave': enEdicion && !valor('dato-clave') ? '' : Acme.validar.claveNueva(valor('dato-clave'))
    };

    Object.entries(mensajes).forEach(([campoId, texto]) => {
      Acme.validar.mostrar(monticulo, campoId, texto);
    });

    if (Object.values(mensajes).some((texto) => texto)) {
      aviso = { tipo: 'no', texto: 'Revisa los campos marcados en rojo.' };
      pintarAviso();
      return;
    }

    const identificacion = valor('dato-id').trim();
    const correo = valor('dato-correo').trim().toLowerCase();

    const dueño = Acme.estado.usuarios.find((uno) => uno !== enEdicion && uno.id === identificacion);
    if (dueño) {
      aviso = { tipo: 'no', texto: 'La identificación ' + identificacion + ' ya es de ' + dueño.nombre + '.' };
      pintarAviso();
      return;
    }
    const repetido = Acme.estado.usuarios.find((uno) => uno !== enEdicion && uno.correo === correo);
    if (repetido) {
      aviso = { tipo: 'no', texto: 'Ese correo ya lo tiene ' + repetido.nombre + '.' };
      pintarAviso();
      return;
    }

    const datos = {
      id: identificacion,
      nombre: valor('dato-nombre').trim(),
      correo: correo,
      telefono: valor('dato-telefono').trim(),
      cargo: valor('dato-cargo'),
      clave: valor('dato-clave') || (enEdicion ? enEdicion.clave : '')
    };

    if (enEdicion) {
      Object.assign(enEdicion, datos);
      aviso = { tipo: 'ok', texto: 'Se guardaron los datos de ' + datos.nombre + '.' };
      editando = null;
    } else {
      Acme.estado.usuarios.push(datos);
      aviso = { tipo: 'ok', texto: datos.nombre + ' ya está registrado.' };
    }

    Acme.estado.guardar('usuarios');

    Acme.vistas.usuarios(monticulo);
  });
};
