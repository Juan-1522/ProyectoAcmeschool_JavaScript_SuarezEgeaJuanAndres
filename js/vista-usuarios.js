Acme.vistas = Acme.vistas || {};

// El buscador y el sello elegido se guardan aquí porque al filtrar solo se
// vuelve a pintar la tabla, no la página completa.
const filtro = { texto: '', cargo: '' };

// El aviso del formulario sobrevive al re-renderizado que limpia los campos,
// porque la página entera se vuelve a montar después de guardar.
let aviso = null;

const sellos = [
  { etiqueta: 'Todos', cargo: '' },
  { etiqueta: 'Docentes', cargo: 'Docente' },
  { etiqueta: 'Administrativos', cargo: 'Administrativo' }
];

// Se quitan los acentos para que escribir "avila" encuentre a "Héctor Manuel
// Ávila" sin tener que respetar las mayúsculas ni las tildes.
function normalizar(valor) {
  return valor.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

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
        <td class="vacio" colspan="5">
          Ningún usuario coincide con ${filtro.texto.trim() ? '"' + filtro.texto.trim() + '"' : 'ese filtro'}.
        </td>
      </tr>`;
  }

  return lista.map((uno) => `
    <tr>
      <td class="code">${uno.id}</td>
      <td>
        <div class="person">
          <span class="av">${iniciales(uno.nombre)}</span>
          <div>${uno.nombre}</div>
        </div>
      </td>
      <td class="sm">${uno.correo}</td>
      <td class="sm">${uno.telefono}</td>
      <td><span class="pill ${uno.cargo === 'Docente' ? 'doc' : 'adm'}">${uno.cargo}</span></td>
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

function formulario() {
  return `
    <div class="card">
      <div class="ch">
        <div>
          <h3>Crear usuario</h3>
          <p class="sub">Queda guardado en este navegador</p>
        </div>
      </div>

      <p class="aviso ${aviso ? aviso.tipo : 'no'}" id="aviso-crear"
        ${aviso ? '' : 'hidden'}>${aviso ? aviso.texto : ''}</p>

      <form id="form-crear" novalidate>
        <div class="grid2">
          ${campo('nuevo-id', 'Identificación', 'type="text" inputmode="numeric" autocomplete="off" placeholder="1020345876"')}
          ${campo('nuevo-telefono', 'Teléfono', 'type="tel" inputmode="tel" autocomplete="off" placeholder="300 555 1122"')}
        </div>
        ${campo('nuevo-nombre', 'Nombre completo', 'type="text" autocomplete="name" placeholder="Ana María Torres"')}
        ${campo('nuevo-correo', 'Correo electrónico', 'type="email" autocomplete="off" placeholder="ana.torres@acme.edu"', '<i class="ic mail"></i>')}
        <div class="field">
          <label for="nuevo-cargo">Cargo</label>
          <select id="nuevo-cargo" name="nuevo-cargo">
            <option>Administrativo</option>
            <option>Docente</option>
          </select>
        </div>
        ${campo('nuevo-clave', 'Contraseña', 'type="password" autocomplete="new-password"')}
        <p class="hint">Con esa contraseña entra al panel, así que debe tener al menos 6 caracteres.</p>
        <div class="btnrow">
          <button class="btn pri" type="submit">Guardar usuario</button>
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
          <div id="info">${encabezado(seleccionados(), totales())}</div>
          <div class="r chips" id="chips">${chips()}</div>
        </div>
        <div class="tw">
          <table>
            <thead>
              <tr>
                <th>Identificación</th>
                <th>Nombre completo</th>
                <th>Correo</th>
                <th>Teléfono</th>
                <th>Cargo</th>
              </tr>
            </thead>
            <tbody id="cuerpo">${filas(seleccionados())}</tbody>
          </table>
        </div>
      </div>`,
    lateral: formulario()
  });

  const buscar = monticulo.querySelector('#buscar');
  buscar.value = filtro.texto;

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
      'nuevo-id': Acme.validar.cedula(valor('nuevo-id')),
      'nuevo-nombre': Acme.validar.nombre(valor('nuevo-nombre')),
      'nuevo-correo': Acme.validar.correo(valor('nuevo-correo'), 'Escribe el correo del usuario.'),
      'nuevo-telefono': Acme.validar.telefono(valor('nuevo-telefono')),
      'nuevo-clave': Acme.validar.claveNueva(valor('nuevo-clave'))
    };

    Object.entries(mensajes).forEach(([campoId, texto]) => {
      Acme.validar.mostrar(monticulo, campoId, texto);
    });

    if (Object.values(mensajes).some((texto) => texto)) {
      aviso = { tipo: 'no', texto: 'Revisa los campos marcados en rojo.' };
      pintarAviso();
      return;
    }

    const identificacion = valor('nuevo-id').trim();
    const correo = valor('nuevo-correo').trim().toLowerCase();

    const dueño = Acme.estado.usuarios.find((uno) => uno.id === identificacion);
    if (dueño) {
      aviso = { tipo: 'no', texto: 'La identificación ' + identificacion + ' ya es de ' + dueño.nombre + '.' };
      pintarAviso();
      return;
    }
    if (Acme.estado.usuarios.some((uno) => uno.correo === correo)) {
      aviso = { tipo: 'no', texto: 'Ese correo ya lo tiene ' + Acme.estado.usuarios.find((uno) => uno.correo === correo).nombre + '.' };
      pintarAviso();
      return;
    }

    const nuevo = {
      id: identificacion,
      nombre: valor('nuevo-nombre').trim(),
      correo: correo,
      telefono: valor('nuevo-telefono').trim(),
      cargo: valor('nuevo-cargo'),
      clave: valor('nuevo-clave')
    };

    Acme.estado.usuarios.push(nuevo);
    Acme.estado.guardar('usuarios');

    aviso = { tipo: 'ok', texto: nuevo.nombre + ' ya está registrado.' };
    Acme.vistas.usuarios(monticulo);
  });
};
