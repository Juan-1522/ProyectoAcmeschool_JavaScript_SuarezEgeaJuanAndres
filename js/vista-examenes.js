Acme.vistas = Acme.vistas || {};

// El módulo entero va dentro de esta llamada porque los archivos clásicos
// comparten el mismo espacio global: declarado suelto, el "filtro" de exámenes
// choca con el de usuarios y el navegador tira abajo los dos archivos.
(() => {
  const filtro = { texto: '', estado: '' };

  const sellos = [
    { etiqueta: 'Todos', estado: '' },
    { etiqueta: 'Publicados', estado: 'Publicado' },
    { etiqueta: 'Borradores', estado: 'Borrador' }
  ];

  // El plural no se arma pegando una "s", porque "borrador" saldría "borradors".
  const plurales = { Publicado: 'publicados', Borrador: 'en borrador' };

  function seleccionados() {
    const texto = normalizar(filtro.texto.trim());

    return Acme.estado.examenes
      .filter((examen) => !filtro.estado || examen.estado === filtro.estado)
      .filter((examen) => {
        if (!texto) {
          return true;
        }
        return [examen.codigo, examen.titulo, examen.descripcion]
          .map((campo) => normalizar(campo))
          .some((campo) => campo.includes(texto));
      })
      .sort((uno, otro) => uno.codigo.localeCompare(otro.codigo));
  }

  function filas(lista) {
    if (!lista.length) {
      return `
        <tr>
          <td class="vacio" colspan="5">
            Ningún examen coincide con ${filtro.texto.trim() ? '"' + filtro.texto.trim() + '"' : 'ese filtro'}.
          </td>
        </tr>`;
    }

    return lista.map((examen) => `
      <tr>
        <td class="code">${examen.codigo}</td>
        <td>
          <div class="ex">
            <b>${examen.titulo}</b>${examen.estado === 'Borrador' ? ' <span class="pill dra">Borrador</span>' : ''}
            <small>${examen.descripcion}</small>
          </div>
        </td>
        <td class="sm">${examen.tiempo} min</td>
        <td class="sm">${examen.aprobacion} %</td>
        <td class="sm">${examen.preguntas.length}</td>
      </tr>`).join('');
  }

  function encabezado(lista, totales) {
    if (lista.length === totales) {
      const publicados = lista.filter((examen) => examen.estado === 'Publicado').length;
      return `
        <h3>${totales} exámenes guardados</h3>
        <p class="sub">Ordenados por código, ${publicados} publicados y ${totales - publicados} en borrador</p>`;
    }

    const razones = [];
    if (filtro.texto.trim()) {
      razones.push('buscando "' + filtro.texto.trim() + '"');
    }
    if (filtro.estado) {
      razones.push(plurales[filtro.estado]);
    }

    return `
      <h3>${lista.length} de ${totales} exámenes</h3>
      <p class="sub">${razones.join(' y ')}</p>`;
  }

  function chips() {
    return sellos.map((sello) => {
      const cuantos = Acme.estado.examenes
        .filter((examen) => !sello.estado || examen.estado === sello.estado).length;
      return `
        <button class="chipbtn${sello.estado === filtro.estado ? ' on' : ''}" type="button"
          data-estado="${sello.estado}" aria-pressed="${sello.estado === filtro.estado}">
          ${sello.etiqueta} ${cuantos}
        </button>`;
    }).join('');
  }

  Acme.vistas.examenes = (monticulo) => {
    const totales = () => Acme.estado.examenes.length;

    Acme.montar(monticulo, {
      activa: '#/examenes',
      eyebrow: 'Módulo privado',
      titulo: 'Gestión de exámenes',
      acciones: `
        <div class="inicon srchw">
          <i class="ic search"></i>
          <input id="buscar" class="srch" type="search" placeholder="Buscar por código o título"
            aria-label="Buscar por código, título o descripción">
        </div>`,
      contenido: `
        <div class="card">
          <div class="ch">
            <div id="info">${encabezado(seleccionados(), totales())}</div>
            <div class="r chips" id="chips">${chips()}</div>
          </div>
          <div class="tw compact">
            <table>
              <thead>
                <tr>
                  <th>Código</th>
                  <th>Título</th>
                  <th>Tiempo</th>
                  <th>Aprobación</th>
                  <th>Preguntas</th>
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
      filtro.estado = boton.dataset.estado;
      pintar();
    });
  };
})();
