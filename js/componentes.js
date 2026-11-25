// Componentes propios. No llevan shadow DOM a propósito: la única hoja de
// estilos es la global, y si el contenido queda en el DOM de la página las
// clases de styles.css siguen aplicando dentro de la etiqueta.

// Cada palabra de más de dos letras aporta su inicial, con dos palabras como mucho.
function iniciales(nombre) {
  return nombre
    .split(' ')
    .filter((palabra) => palabra.length > 2)
    .slice(0, 2)
    .map((palabra) => palabra[0])
    .join('');
}

// Los nombres van dentro de un atributo, y una comilla cerraría la etiqueta antes de tiempo.
function atributo(valor) {
  return String(valor)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/"/g, '&quot;');
}

// El círculo con las dos iniciales: barra lateral, tabla de usuarios y últimas notas del panel.
class AcmeInicial extends HTMLElement {
  connectedCallback() {
    this.classList.add('av');
    this.textContent = iniciales(this.getAttribute('nombre') || '');
  }
}

// Barra de los módulos privados. La vista solo dice qué ruta está activa; el
// resto se arma acá, con los contadores leídos al momento de pintar.
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

    // El aside queda dentro de la etiqueta: así la barra sigue siendo un landmark
    // para quien navega con lector de pantalla.
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
