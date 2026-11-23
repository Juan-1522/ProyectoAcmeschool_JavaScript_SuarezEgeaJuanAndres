Acme.vistas = Acme.vistas || {};

// El buscador y el sello elegido se guardan aquí porque al filtrar solo se
// vuelve a pintar la tabla, no la página completa.
const filtro = { texto: '', cargo: '' };

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

Acme.vistas.usuarios = (monticulo) => {
  const totales = Acme.estado.usuarios.length;

  const chips = sellos.map((sello) => {
    const cuantos = Acme.estado.usuarios
      .filter((uno) => !sello.cargo || uno.cargo === sello.cargo).length;
    return `
      <button class="chipbtn${sello.cargo === filtro.cargo ? ' on' : ''}" type="button"
        data-cargo="${sello.cargo}" aria-pressed="${sello.cargo === filtro.cargo}">
        ${sello.etiqueta} ${cuantos}
      </button>`;
  }).join('');

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
          <div id="info">${encabezado(seleccionados(), totales)}</div>
          <div class="r chips">${chips}</div>
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
      </div>`
  });

  const buscar = monticulo.querySelector('#buscar');
  buscar.value = filtro.texto;

  const pintar = () => {
    const lista = seleccionados();
    monticulo.querySelector('#info').innerHTML = encabezado(lista, totales);
    monticulo.querySelector('#cuerpo').innerHTML = filas(lista);
    monticulo.querySelectorAll('.chipbtn').forEach((boton) => {
      const activo = boton.dataset.cargo === filtro.cargo;
      boton.classList.toggle('on', activo);
      boton.setAttribute('aria-pressed', activo);
    });
  };

  buscar.addEventListener('input', () => {
    filtro.texto = buscar.value;
    pintar();
  });

  monticulo.querySelector('.chips').addEventListener('click', (evento) => {
    const boton = evento.target.closest('.chipbtn');
    if (!boton) {
      return;
    }
    filtro.cargo = boton.dataset.cargo;
    pintar();
  });
};
