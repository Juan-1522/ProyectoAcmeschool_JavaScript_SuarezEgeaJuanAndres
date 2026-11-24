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

  // El formulario no está montado siempre: la tabla necesita todo el ancho para
  // que las cinco columnas quepan sin scroll, así que solo aparece cuando se pide.
  let creando = false;

  // Sobrevive al re-renderizado que vacía el formulario después de guardar.
  let aviso = null;

  // Se llama igual que la de usuarios y no choca porque esta queda dentro de la
  // llamada de arriba; la global solo la ve el archivo de usuarios.
  function campo(id, etiqueta, atributos) {
    return `
      <div class="field">
        <label for="${id}">${etiqueta}</label>
        <input id="${id}" name="${id}" ${atributos} aria-describedby="${id}-error">
        <p class="error" id="${id}-error" hidden></p>
      </div>`;
  }

  function formulario() {
    return `
      <div class="card">
        <div class="ch">
          <div>
            <h3>Nuevo examen</h3>
            <p class="sub">Queda guardado en este navegador</p>
          </div>
        </div>

        <p class="aviso ${aviso ? aviso.tipo : 'no'}" id="aviso-examen"
          ${aviso ? '' : 'hidden'}>${aviso ? aviso.texto : ''}</p>

        <form id="form-examen" novalidate>
          <div class="grid2">
            ${campo('dato-codigo', 'Código', 'type="text" autocomplete="off" placeholder="EXA-005"')}
            ${campo('dato-tiempo', 'Tiempo (min)', 'type="text" inputmode="numeric" autocomplete="off" placeholder="20"')}
          </div>
          ${campo('dato-titulo', 'Título', 'type="text" autocomplete="off" placeholder="Álgebra lineal"')}
          <div class="field">
            <label for="dato-desc">Descripción</label>
            <textarea id="dato-desc" name="dato-desc" rows="3"
              placeholder="Qué evalúa este examen" aria-describedby="dato-desc-error"></textarea>
            <p class="error" id="dato-desc-error" hidden></p>
          </div>
          <div class="grid2">
            ${campo('dato-aprobacion', 'Aprobación (%)', 'type="text" inputmode="numeric" autocomplete="off" placeholder="70"')}
            <div class="field">
              <label for="dato-estado">Estado</label>
              <select id="dato-estado" name="dato-estado">
                <option>Borrador</option>
                <option>Publicado</option>
              </select>
            </div>
          </div>
          <p class="hint">Sin preguntas todavía nadie puede resolverlo, así que para publicarlo hay que agregarle la primera.</p>
          <div class="btnrow">
            <button class="btn pri" type="submit">Guardar examen</button>
            <button class="btn sec" type="button" id="cancelar-examen">Cancelar</button>
          </div>
        </form>
      </div>`;
  }

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
        </div>
        ${creando ? '' : `
        <button class="btn pri" type="button" id="nuevo">
          <i class="ic plus"></i>Nuevo examen
        </button>`}`,
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
        </div>`,
      lateral: creando ? formulario() : ''
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

    const nuevo = monticulo.querySelector('#nuevo');
    if (nuevo) {
      nuevo.addEventListener('click', () => {
        creando = true;
        aviso = null;
        Acme.vistas.examenes(monticulo);
        monticulo.querySelector('#dato-codigo').focus();
      });
      return;
    }

    const caja = monticulo.querySelector('#aviso-examen');
    if (!caja) {
      return;
    }

    const pintarAviso = () => {
      caja.textContent = aviso ? aviso.texto : '';
      caja.className = 'aviso ' + (aviso ? aviso.tipo : 'no');
      caja.hidden = !aviso;
    };

    monticulo.querySelector('#cancelar-examen').addEventListener('click', () => {
      creando = false;
      aviso = null;
      Acme.vistas.examenes(monticulo);
    });

    const forma = monticulo.querySelector('#form-examen');

    forma.addEventListener('input', () => {
      if (aviso) {
        aviso = null;
        pintarAviso();
      }
    });

    forma.addEventListener('submit', (evento) => {
      evento.preventDefault();
      const valor = (campoId) => monticulo.querySelector('#' + campoId).value;

      const mensajes = {
        'dato-codigo': Acme.validar.codigoExamen(valor('dato-codigo')),
        'dato-titulo': Acme.validar.titulo(valor('dato-titulo')),
        'dato-desc': Acme.validar.descripcion(valor('dato-desc')),
        'dato-tiempo': Acme.validar.tiempo(valor('dato-tiempo')),
        'dato-aprobacion': Acme.validar.aprobacion(valor('dato-aprobacion'))
      };

      Object.entries(mensajes).forEach(([campoId, texto]) => {
        Acme.validar.mostrar(monticulo, campoId, texto);
      });

      if (Object.values(mensajes).some((texto) => texto)) {
        aviso = { tipo: 'no', texto: 'Revisa los campos marcados en rojo.' };
        pintarAviso();
        return;
      }

      const codigo = valor('dato-codigo').trim().toUpperCase();
      const dueño = Acme.estado.examenes.find((uno) => uno.codigo === codigo);
      if (dueño) {
        aviso = { tipo: 'no', texto: 'El código ' + codigo + ' ya lo usa "' + dueño.titulo + '".' };
        pintarAviso();
        return;
      }

      // Un examen publicado sin preguntas sería una página sin qué responder.
      if (valor('dato-estado') === 'Publicado') {
        aviso = { tipo: 'no', texto: 'Sin preguntas no se puede publicar. Guárdalo en borrador.' };
        pintarAviso();
        return;
      }

      Acme.estado.examenes.push({
        codigo,
        titulo: valor('dato-titulo').trim(),
        descripcion: valor('dato-desc').trim(),
        tiempo: Number(valor('dato-tiempo')),
        aprobacion: Number(valor('dato-aprobacion')),
        estado: valor('dato-estado'),
        preguntas: []
      });
      Acme.estado.guardar('examenes');

      aviso = { tipo: 'ok', texto: codigo + ' quedó guardado en borrador.' };
      // La página se monta entera para que el formulario quede en blanco y el
      // aviso verde siga visible; así se puede crear el siguiente de una.
      Acme.vistas.examenes(monticulo);
      // Sin esto el foco se queda en el cuerpo del documento y quien usa teclado
      // o lector de pantalla pierde el sitio donde estaba escribiendo.
      monticulo.querySelector('#dato-codigo').focus();
    });
  };
})();
