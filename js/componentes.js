// Componentes propios

// Las dos iniciales
function iniciales(nombre) {
  return nombre
    .split(' ')
    .filter((palabra) => palabra.length > 2)
    .slice(0, 2)
    .map((palabra) => palabra[0])
    .join('');
}

// Escapa el valor de un atributo
function atributo(valor) {
  return String(valor)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/"/g, '&quot;');
}

// El círculo de iniciales
class AcmeInicial extends HTMLElement {
  connectedCallback() {
    this.classList.add('av');
    this.textContent = iniciales(this.getAttribute('nombre') || '');
  }
}

// Módulos de la barra
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

class AcmeBarra extends HTMLElement {
  connectedCallback() {
    const activa = this.getAttribute('activa') || '';
    const sesion = Acme.sesion.actual();

    const filas = modulos.map((modulo) => {
      const numero = modulo.cantidad
        ? `<span class="n">${modulo.cantidad()}</span>`
        : '';
      return `
        <a class="nav${modulo.ruta === activa ? ' on' : ''}" href="${modulo.ruta}"${modulo.ruta === activa ? ' aria-current="page"' : ''}>
          <i class="ic ${modulo.icono}"></i>${modulo.texto}${numero}
        </a>`;
    }).join('');

    // La barra lateral
    this.innerHTML = `
      <aside class="side">
        <div class="brand">
          <span class="bk">A</span>
          <div><b>Acme School</b><small>Plataforma de exámenes</small></div>
        </div>

        <p class="navlab">Módulos privados</p>
        <nav aria-label="Módulos del panel">
        ${filas}
        </nav>

        <div class="sidefoot">
          <div class="me">
            <acme-inicial nombre="${atributo(sesion.nombre)}"></acme-inicial>
            <div><b>${sesion.nombre}</b><small>${sesion.cargo}</small></div>
            <button class="ib" id="salir" type="button" aria-label="Cerrar sesión">
              <i class="ic out"></i>
            </button>
          </div>
        </div>
      </aside>`;

    this.querySelector('#salir').addEventListener('click', () => {
      Acme.sesion.cerrar();
      location.hash = '';
      Acme.mostrar();
    });
  }
}

window.customElements.define('acme-inicial', AcmeInicial);
window.customElements.define('acme-barra', AcmeBarra);
