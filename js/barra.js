Acme.vistas = Acme.vistas || {};

function iniciales(nombre) {
  return nombre
    .split(' ')
    .filter((palabra) => palabra.length > 2)
    .slice(0, 2)
    .map((palabra) => palabra[0])
    .join('');
}

// Se quitan los acentos para que escribir "avila" encuentre a "Héctor Manuel
// Ávila" sin tener que respetar las mayúsculas ni las tildes. Lo usan el
// buscador de usuarios y el de exámenes.
function normalizar(valor) {
  return valor.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

// Cada fila de la barra es un módulo que ya tiene vista. La cantidad se calcula
// al pintar, para que el número cambie cuando se agrega o se elimina algo.
const modulos = [
  { ruta: '#/panel', icono: 'grid', texto: 'Panel' },
  {
    ruta: '#/usuarios',
    icono: 'users',
    texto: 'Usuarios',
    cantidad: () => Acme.estado.usuarios.length
  },
  {
    ruta: '#/examenes',
    icono: 'doc',
    texto: 'Exámenes',
    cantidad: () => Acme.estado.examenes.length
  }
];

function barra(activa) {
  const sesion = Acme.sesion.actual();

  const filas = modulos.map((modulo) => {
    const numero = modulo.cantidad
      ? `<span class="n">${modulo.cantidad()}</span>`
      : '';
    return `
      <a class="nav${modulo.ruta === activa ? ' on' : ''}" href="${modulo.ruta}">
        <i class="ic ${modulo.icono}"></i>${modulo.texto}${numero}
      </a>`;
  }).join('');

  return `
    <aside class="side">
      <div class="brand">
        <span class="bk">A</span>
        <div><b>Acme School</b><small>Plataforma de exámenes</small></div>
      </div>

      <p class="navlab">Módulos privados</p>
      ${filas}

      <div class="sidefoot">
        <div class="me">
          <span class="av">${iniciales(sesion.nombre)}</span>
          <div><b>${sesion.nombre}</b><small>${sesion.cargo}</small></div>
          <button class="ib" id="salir" type="button" aria-label="Cerrar sesión">
            <i class="ic out"></i>
          </button>
        </div>
      </div>
    </aside>`;
}

// Armazón que comparten todas las vistas privadas: barra, encabezado y cuerpo.
// Cada vista solo aporta su título y su contenido.
Acme.montar = (monticulo, pagina) => {
  monticulo.innerHTML = `
    <div class="page">
      ${barra(pagina.activa)}
      <main class="main">
        <header class="head">
          <div>
            <p class="eyebrow">${pagina.eyebrow}</p>
            <h1>${pagina.titulo}</h1>
          </div>
          ${pagina.acciones ? `<div class="hs">${pagina.acciones}</div>` : ''}
        </header>
        <div class="body">
          <div class="col">${pagina.contenido}</div>
          ${pagina.lateral ? `<div class="side-c">${pagina.lateral}</div>` : ''}
        </div>
      </main>
    </div>`;

  monticulo.querySelector('#salir').addEventListener('click', () => {
    Acme.sesion.cerrar();
    location.hash = '';
    Acme.mostrar();
  });
};
