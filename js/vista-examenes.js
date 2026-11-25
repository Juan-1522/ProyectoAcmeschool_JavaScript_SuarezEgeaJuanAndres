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
  // que las seis columnas quepan sin scroll, así que solo aparece cuando se pide.
  let creando = false;

  // Sobrevive al re-renderizado que vacía el formulario después de guardar.
  let aviso = null;

  // Código del examen que se está editando. Se guarda el código y no el objeto
  // porque al volver a montar la vista hay que ir a buscarlo de nuevo en la lista.
  let editando = null;

  function examenEnEdicion() {
    return editando
      ? Acme.estado.examenes.find((examen) => examen.codigo === editando) || null
      : null;
  }

  function avisoCaja(id) {
    return `
        <p class="aviso ${aviso ? aviso.tipo : 'no'}" id="${id}" ${aviso ? '' : 'hidden'}>${aviso ? aviso.texto : ''}</p>`;
  }

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

  // El enunciado y las respuestas viven en este arreglo mientras se escribe,
  // porque cada vez que se agrega o se quita algo se vuelve a pintar el bloque
  // entero y un re-pintado se lleva lo que había en las cajas.
  let preguntas = [];

  function preguntaVacia() {
    // Dos respuestas como mínimo: con una sola no hay forma de equivocarse.
    return { enunciado: '', respuestas: ['', ''], correcta: -1 };
  }

  // Lo guardado lleva la correcta dentro de cada respuesta y el editor la lleva
  // aparte, así que al abrir un examen hay que separar los dos datos.
  function desdeGuardadas(lista) {
    return lista.map((pregunta) => ({
      enunciado: pregunta.enunciado,
      respuestas: pregunta.respuestas.map((una) => una.texto),
      correcta: pregunta.respuestas.findIndex((una) => una.correcta)
    }));
  }

  function bloquePregunta(pregunta, numero) {
    const opciones = pregunta.respuestas.map((texto, lugar) => `
          <div class="q-op">
            <label class="q-ok">
              <input type="radio" name="ok${numero}"
                aria-label="Marcar la respuesta correcta de la pregunta ${numero + 1}"
                ${lugar === pregunta.correcta ? 'checked' : ''}>
            </label>
            <input class="q-op-t" type="text"
              aria-label="Respuesta ${lugar + 1} de la pregunta ${numero + 1}">
            ${pregunta.respuestas.length > 2 ? `
              <button class="ib del" type="button" data-quitar-op="${numero}:${lugar}"
                aria-label="Quitar la respuesta ${lugar + 1} de la pregunta ${numero + 1}">
                <i class="ic trash"></i>
              </button>` : ''}
          </div>`).join('');

    return `
      <div class="q" data-p="${numero}">
        <div class="q-h">
          <b>Pregunta ${numero + 1}</b>
          <button class="ib del" type="button" data-quitar="${numero}"
            aria-label="Quitar la pregunta ${numero + 1}">
            <i class="ic trash"></i>
          </button>
        </div>
        <input class="q-en" type="text" placeholder="Escribe la pregunta"
          aria-label="Enunciado de la pregunta ${numero + 1}">
        ${opciones}
        ${pregunta.respuestas.length < 6 ? `
          <button class="btn sec mini" type="button" data-nueva="${numero}">
            <i class="ic plus"></i>Agregar respuesta
          </button>` : ''}
      </div>`;
  }

  function formulario(uno) {
    const edicion = Boolean(uno);

    return `
      <div class="card">
        <div class="ch">
          <div>
            <h3>${edicion ? 'Actualizar examen' : 'Nuevo examen'}</h3>
            <p class="sub">${edicion ? 'Editando el código ' + uno.codigo : 'Queda guardado en este navegador'}</p>
          </div>
        </div>
${avisoCaja('aviso-examen')}

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
                <option${!edicion || uno.estado === 'Borrador' ? ' selected' : ''}>Borrador</option>
                <option${edicion && uno.estado === 'Publicado' ? ' selected' : ''}>Publicado</option>
              </select>
            </div>
          </div>
          <p class="hint">Sin preguntas todavía nadie puede resolverlo, así que para publicarlo hay que agregarle la primera.</p>

          <div class="qh">
            <b>Preguntas</b>
            <button class="btn sec mini" type="button" id="agregar-pregunta">
              <i class="ic plus"></i>Agregar pregunta
            </button>
          </div>
          <div id="lista-preguntas"></div>

          <div class="btnrow">
            <button class="btn pri" type="submit">${edicion ? 'Actualizar examen' : 'Guardar examen'}</button>
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
          <td class="vacio" colspan="6">
            Ningún examen coincide con ${filtro.texto.trim() ? '"' + filtro.texto.trim() + '"' : 'ese filtro'}.
          </td>
        </tr>`;
    }

    return lista.map((examen) => `
      <tr${examen.codigo === editando ? ' class="sel"' : ''}>
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
        <td class="acc">
          <div class="iact">
            <button class="ib" type="button" data-edita="${examen.codigo}"
              aria-label="Editar ${examen.titulo}">
              <i class="ic pencil"></i>
            </button>
            <button class="ib" type="button" data-vuelve="${examen.codigo}"
              aria-label="${examen.estado === 'Publicado' ? 'Devolver ' + examen.titulo + ' a borrador' : 'Publicar ' + examen.titulo}">
              <i class="ic ${examen.estado === 'Publicado' ? 'eye-off' : 'eye'}"></i>
            </button>
            <button class="ib del" type="button" data-borra="${examen.codigo}"
              aria-label="Eliminar ${examen.titulo}">
              <i class="ic trash"></i>
            </button>
          </div>
        </td>
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
          ${creando ? '' : avisoCaja('aviso-lista')}
          <div class="ch">
            <div id="info" role="status">${encabezado(seleccionados(), totales())}</div>
            <div class="r chips" id="chips">${chips()}</div>
          </div>
          <div class="tw compact">
            <table>
              <thead>
                <tr>
                  <th scope="col">Código</th>
                  <th scope="col">Título</th>
                  <th scope="col">Tiempo</th>
                  <th scope="col">Aprobación</th>
                  <th scope="col">Preguntas</th>
                  <th class="acc" scope="col">Acciones</th>
                </tr>
              </thead>
              <tbody id="cuerpo">${filas(seleccionados())}</tbody>
            </table>
          </div>
        </div>`,
      lateral: creando ? formulario(examenEnEdicion()) : ''
    });

    const buscar = monticulo.querySelector('#buscar');
    buscar.value = filtro.texto;

    // Los datos del examen que se edita se copian desde JavaScript, igual que las
    // preguntas: un título con comillas dentro del HTML arma un formulario roto.
    const enEdicion = examenEnEdicion();
    if (enEdicion) {
      const poner = (campoId, valor) => {
        monticulo.querySelector('#' + campoId).value = valor;
      };
      poner('dato-codigo', enEdicion.codigo);
      poner('dato-tiempo', enEdicion.tiempo);
      poner('dato-titulo', enEdicion.titulo);
      poner('dato-desc', enEdicion.descripcion);
      poner('dato-aprobacion', enEdicion.aprobacion);
      poner('dato-estado', enEdicion.estado);
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
      filtro.estado = boton.dataset.estado;
      pintar();
    });

    // El lápiz, el ojo y la papelera viven en filas que se repintan con el
    // buscador, así que el aviso se escucha en el cuerpo de la tabla.
    monticulo.querySelector('#cuerpo').addEventListener('click', (evento) => {
      const editar = evento.target.closest('[data-edita]');
      if (editar) {
        const uno = Acme.estado.examenes.find((examen) => examen.codigo === editar.dataset.edita);
        editando = uno.codigo;
        creando = true;
        aviso = null;
        preguntas = desdeGuardadas(uno.preguntas);
        Acme.vistas.examenes(monticulo);
        monticulo.querySelector('#dato-titulo').focus();
        return;
      }

      const volver = evento.target.closest('[data-vuelve]');
      if (volver) {
        const uno = Acme.estado.examenes.find((examen) => examen.codigo === volver.dataset.vuelve);
        if (uno.estado === 'Borrador' && !uno.preguntas.length) {
          aviso = { tipo: 'no', texto: uno.codigo + ' no tiene preguntas todavía. Ábrelo con el lápiz y agrega la primera.' };
          Acme.vistas.examenes(monticulo);
          return;
        }
        uno.estado = uno.estado === 'Publicado' ? 'Borrador' : 'Publicado';
        Acme.estado.guardar('examenes');
        aviso = { tipo: 'ok', texto: uno.codigo + ' ' + (uno.estado === 'Publicado' ? 'quedó publicado.' : 'volvió a borrador.') };
        Acme.vistas.examenes(monticulo);
        return;
      }

      const borrar = evento.target.closest('[data-borra]');
      if (!borrar) {
        return;
      }
      const lugar = Acme.estado.examenes.findIndex((examen) => examen.codigo === borrar.dataset.borra);
      const uno = Acme.estado.examenes[lugar];
      const usados = Acme.estado.intentos.filter((intento) => intento.codigo === uno.codigo).length;
      const detalle = usados === 0
        ? 'Deja de aparecer en la lista.'
        : 'Se ' + (usados === 1 ? 'quita' : 'quitan') + ' también su' + (usados === 1 ? ' intento.' : 's intentos.');
      if (!window.confirm('¿Eliminar ' + uno.codigo + ' "' + uno.titulo + '"? ' + detalle)) {
        return;
      }
      Acme.estado.examenes.splice(lugar, 1);
      // Los intentos se van con el examen: la nota se calcula con sus preguntas,
      // así que sin examen no hay forma de mostrarlos.
      Acme.estado.intentos = Acme.estado.intentos.filter((intento) => intento.codigo !== uno.codigo);
      if (editando === uno.codigo) {
        // El formulario tenía justo ese examen delante, así que se cierra: dejarlo
        // abierto con sus preguntas serviría para crear un examen con lo ajeno.
        editando = null;
        creando = false;
        preguntas = [];
      }
      Acme.estado.guardar('examenes');
      Acme.estado.guardar('intentos');
      aviso = {
        tipo: 'ok',
        texto: 'Se eliminó ' + uno.codigo + ' "' + uno.titulo + '"' +
          (usados ? ', con su' + (usados === 1 ? ' intento.' : 's ' + usados + ' intentos.') : '.')
      };
      Acme.vistas.examenes(monticulo);
    });

    const nuevo = monticulo.querySelector('#nuevo');
    if (nuevo) {
      nuevo.addEventListener('click', () => {
        creando = true;
        aviso = null;
        preguntas = [];
        editando = null;
        Acme.vistas.examenes(monticulo);
        monticulo.querySelector('#dato-codigo').focus();
      });
      return;
    }

    const caja = monticulo.querySelector('#aviso-examen');
    if (!caja) {
      return;
    }

    const listaP = monticulo.querySelector('#lista-preguntas');

    const pintarAviso = () => {
      caja.textContent = aviso ? aviso.texto : '';
      caja.className = 'aviso ' + (aviso ? aviso.tipo : 'no');
      caja.hidden = !aviso;
    };

    // El texto de cada caja se copia desde el arreglo en JavaScript, igual que en
    // el formulario de usuarios: puesto en el HTML, una comilla lo desarmaría.
    const pintarPreguntas = () => {
      listaP.innerHTML = preguntas.length
        ? preguntas.map(bloquePregunta).join('')
        : '<p class="sin-p">Todavía no hay preguntas. Se pueden guardar en borrador y completarlas después.</p>';

      [...listaP.querySelectorAll('.q')].forEach((bloque, numero) => {
        bloque.querySelector('.q-en').value = preguntas[numero].enunciado;
        [...bloque.querySelectorAll('.q-op-t')].forEach((entrada, lugar) => {
          entrada.value = preguntas[numero].respuestas[lugar];
        });
      });
    };

    // El formulario llega con la lista vacía y aquí se llena, para que volver a
    // este módulo después de ir al panel no muestre las preguntas en blanco.
    pintarPreguntas();

    // Lo escrito en pantalla es la verdad, así que antes de mover el arreglo se
    // recoge todo de vuelta; findIndex devuelve -1 si nadie marcó la correcta.
    const leerPreguntas = () => [...listaP.querySelectorAll('.q')].map((bloque) => ({
      enunciado: bloque.querySelector('.q-en').value,
      respuestas: [...bloque.querySelectorAll('.q-op-t')].map((entrada) => entrada.value),
      correcta: [...bloque.querySelectorAll('input[type="radio"]')].findIndex((marca) => marca.checked)
    }));

    monticulo.querySelector('#agregar-pregunta').addEventListener('click', () => {
      preguntas = leerPreguntas();
      preguntas.push(preguntaVacia());
      pintarPreguntas();
      listaP.lastElementChild.querySelector('.q-en').focus();
    });

    listaP.addEventListener('click', (evento) => {
      const nueva = evento.target.closest('[data-nueva]');
      const quitarOp = evento.target.closest('[data-quitar-op]');
      const quitar = evento.target.closest('[data-quitar]');

      if (!nueva && !quitarOp && !quitar) {
        return;
      }

      preguntas = leerPreguntas();

      if (nueva) {
        preguntas[Number(nueva.dataset.nueva)].respuestas.push('');
      }

      if (quitarOp) {
        const [numero, lugar] = quitarOp.dataset.quitarOp.split(':').map(Number);
        const pregunta = preguntas[numero];
        pregunta.respuestas.splice(lugar, 1);
        // Al borrar una, las que siguen bajan un puesto; si la marcada era esa,
        // se queda sin correcta hasta que se vuelva a elegir.
        if (pregunta.correcta === lugar) {
          pregunta.correcta = -1;
        } else if (pregunta.correcta > lugar) {
          pregunta.correcta -= 1;
        }
      }

      if (quitar) {
        preguntas.splice(Number(quitar.dataset.quitar), 1);
      }

      pintarPreguntas();

      if (nueva) {
        const bloque = listaP.querySelector('[data-p="' + nueva.dataset.nueva + '"]');
        const entradas = bloque.querySelectorAll('.q-op-t');
        entradas[entradas.length - 1].focus();
      } else {
        const siguiente = listaP.querySelector('.q-en') || monticulo.querySelector('#agregar-pregunta');
        siguiente.focus();
      }
    });

    monticulo.querySelector('#cancelar-examen').addEventListener('click', () => {
      creando = false;
      aviso = null;
      preguntas = [];
      editando = null;
      Acme.vistas.examenes(monticulo);
    });

    const forma = monticulo.querySelector('#form-examen');

    forma.addEventListener('input', () => {
      // Cada tecla devuelve lo escrito al arreglo, para que irse a otro módulo y
      // volver no deje el examen a medias.
      preguntas = leerPreguntas();
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
      const dueño = Acme.estado.examenes.find((uno) => uno !== enEdicion && uno.codigo === codigo);
      if (dueño) {
        aviso = { tipo: 'no', texto: 'El código ' + codigo + ' ya lo usa "' + dueño.titulo + '".' };
        pintarAviso();
        return;
      }

      // Una respuesta en blanco no se guarda: se descarta y se revisa lo que queda.
      const limpias = leerPreguntas().map((pregunta) => ({
        enunciado: pregunta.enunciado.trim(),
        respuestas: pregunta.respuestas
          .map((texto, lugar) => ({ texto: texto.trim(), correcta: lugar === pregunta.correcta }))
          .filter((una) => una.texto)
      }));

      const faltas = limpias.map((pregunta, numero) => {
        if (!pregunta.enunciado) {
          return 'La pregunta ' + (numero + 1) + ' no tiene enunciado.';
        }
        if (pregunta.respuestas.length < 2) {
          return 'La pregunta ' + (numero + 1) + ' necesita dos respuestas con texto.';
        }
        return pregunta.respuestas.some((una) => una.correcta)
          ? ''
          : 'A la pregunta ' + (numero + 1) + ' le falta marcar la respuesta correcta.';
      });

      const primera = faltas.find((texto) => texto);
      if (primera) {
        [...listaP.querySelectorAll('.q')].forEach((bloque, numero) => {
          bloque.classList.toggle('mala', Boolean(faltas[numero]));
        });
        aviso = { tipo: 'no', texto: primera };
        pintarAviso();
        return;
      }

      // Un examen publicado sin preguntas sería una página sin qué responder.
      if (valor('dato-estado') === 'Publicado' && !limpias.length) {
        aviso = { tipo: 'no', texto: 'Sin preguntas no se puede publicar. Guárdalo en borrador.' };
        pintarAviso();
        return;
      }

      const estado = valor('dato-estado');
      const datos = {
        codigo,
        titulo: valor('dato-titulo').trim(),
        descripcion: valor('dato-desc').trim(),
        tiempo: Number(valor('dato-tiempo')),
        aprobacion: Number(valor('dato-aprobacion')),
        estado,
        preguntas: limpias
      };

      // En edición se rellena el objeto que ya está en la lista, y así el examen
      // no se va al final cuando el código nuevo lo ordena en otro puesto.
      if (enEdicion) {
        Object.assign(enEdicion, datos);
        editando = null;
      } else {
        Acme.estado.examenes.push(datos);
      }
      Acme.estado.guardar('examenes');

      preguntas = [];
      aviso = {
        tipo: 'ok',
        texto: codigo + (enEdicion ? ' se actualizó y queda ' : ' quedó ') +
          (estado === 'Publicado' ? 'publicado' : 'en borrador') +
          (limpias.length
            ? ' con ' + limpias.length + (limpias.length === 1 ? ' pregunta.' : ' preguntas.')
            : '.')
      };
      // La página se monta entera para que el formulario quede en blanco y el
      // aviso verde siga visible; así se puede crear el siguiente de una.
      Acme.vistas.examenes(monticulo);
      // Sin esto el foco se queda en el cuerpo del documento y quien usa teclado
      // o lector de pantalla pierde el sitio donde estaba escribiendo.
      monticulo.querySelector('#dato-codigo').focus();
    });
  };
})();
