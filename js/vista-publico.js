Acme.vistas = Acme.vistas || {};

(() => {
  // Estado del módulo
  let pantalla = 'lista';
  let elegido = null;
  let identidad = null;
  let elegidas = [];
  let resultado = null;
  // Variables del reloj
  let reloj = null;
  let restante = 0;
  let inicio = 0;
  let limite = 0;
  let usado = 0;
  let agotado = false;
  let contenedor = null;
  const AVISO = 60;

  function disponibles() {
    return Acme.estado.examenes
      .filter((examen) => examen.estado === 'Publicado')
      .sort((uno, otro) => uno.titulo.localeCompare(otro.titulo));
  }

  function examenActual() {
    return Acme.estado.examenes.find((examen) => examen.codigo === elegido);
  }

  function reiniciar() {
    parar();
    pantalla = 'lista';
    elegido = null;
    identidad = null;
    elegidas = [];
    resultado = null;
    restante = 0;
    inicio = 0;
    limite = 0;
    usado = 0;
    agotado = false;
  }

  function respondidas() {
    return elegidas.filter((opcion) => opcion >= 0).length;
  }

  function relojTexto(segundos) {
    const min = Math.floor(segundos / 60);
    const seg = segundos % 60;
    return String(min).padStart(2, '0') + ':' + String(seg).padStart(2, '0');
  }

  // Fecha de hoy
  function fechaActual() {
    const ahora = new Date();
    const dos = (n) => String(n).padStart(2, '0');
    return ahora.getFullYear() + '-' + dos(ahora.getMonth() + 1) + '-' + dos(ahora.getDate()) +
      'T' + dos(ahora.getHours()) + ':' + dos(ahora.getMinutes()) + ':' + dos(ahora.getSeconds());
  }

  // Pinta el reloj
  function pintaReloj() {
    const caja = contenedor && contenedor.querySelector('#reloj-caja');
    if (!caja) {
      return;
    }
    caja.querySelector('#reloj').textContent = relojTexto(restante);
    caja.classList.toggle('low', restante <= AVISO);
  }

  function parar() {
    clearInterval(reloj);
    reloj = null;
  }

  // Segundos que quedan
  function quedan() {
    return Math.max(0, limite - Math.round((Date.now() - inicio) / 1000));
  }

  function arrancar() {
    parar();
    // Arranca el reloj
    inicio = Date.now() - (limite - restante) * 1000;
    reloj = setInterval(() => {
      restante = quedan();
      if (restante > 0) {
        pintaReloj();
        return;
      }
      cerrarPorTiempo();
    }, 1000);
  }

  // Guarda el intento
  function cerrar(segundosUsados, porTiempo) {
    parar();
    const examen = examenActual();
    usado = segundosUsados;
    agotado = porTiempo;
    Acme.estado.intentos.push({
      codigo: examen.codigo,
      identificacion: identidad.id,
      nombre: identidad.nombre,
      fecha: fechaActual(),
      tiempoUsado: relojTexto(usado),
      elegidas: elegidas.slice()
    });
    Acme.estado.guardar('intentos');
    resultado = Acme.nota(examen, elegidas);
    pantalla = 'nota';
    // La nota
    if (contenedor.querySelector('#reloj-caja')) {
      Acme.vistas.publico(contenedor);
    }
  }

  function cerrarPorTiempo() {
    cerrar(limite, true);
  }

  function campoPub(id, etiqueta, atributos) {
    return `
        <div class="field">
          <label for="${id}">${etiqueta}</label>
          <input id="${id}" name="${id}" ${atributos} aria-describedby="${id}-error">
          <p class="error" id="${id}-error" hidden></p>
        </div>`;
  }

  // Marco del módulo público
  function marco(titulo, bajo, interior) {
    return `
      <div class="pubwrap">
        <a class="skip" href="#contenido">Saltar al contenido</a>
        <header class="pubtop">
          <span class="bk">A</span>
          <div class="pubmarca"><b>Acme School</b><small>Exámenes abiertos</small></div>
          <a class="pubsalir" href="#/" id="salir-pub">Volver al acceso</a>
        </header>
        <main class="pubmain" id="contenido" tabindex="-1">
          <p class="eyebrow">Módulo público</p>
          <h1>${titulo}</h1>
          <p class="sub">${bajo}</p>
          ${interior}
        </main>
      </div>`;
  }

  function ficha(examen) {
    return `
      <div class="exmeta">
        <div><small>Tiempo</small><b>${examen.tiempo} min</b></div>
        <div><small>Preguntas</small><b>${examen.preguntas.length}</b></div>
        <div><small>Aprobación</small><b>${examen.aprobacion} %</b></div>
      </div>`;
  }

  function pantallaLista() {
    const lista = disponibles();
    const guardados = Acme.estado.examenes.length;

    const cuerpo = lista.length
      ? `
        <div class="exlist" id="exlist">
          ${lista.map((examen) => `
            <article class="excard">
              <p class="code">${examen.codigo}</p>
              <h3>${examen.titulo}</h3>
              <p class="exdesc">${examen.descripcion}</p>
              ${ficha(examen)}
              <button class="btn pri" type="button" data-resuelve="${examen.codigo}">Resolver examen</button>
            </article>`).join('')}
        </div>`
      : `
        <div class="card">
          <p class="sin-p">Todavía no hay exámenes publicados. En el panel se arman en borrador
             y se publican con el ojo de la columna Acciones.</p>
        </div>`;

    const bajo = lista.length
      ? `${lista.length} para resolver${guardados > lista.length
        ? ' · ' + (guardados - lista.length) + ' en borrador no aparecen acá'
        : ''}`
      : 'Solo se ven los exámenes publicados';

    return marco('Exámenes disponibles', bajo, cuerpo);
  }

  function pantallaIdentidad() {
    const examen = examenActual();

    return marco(
      examen.titulo,
      'Antes de empezar: tus respuestas quedan asociadas a estos datos.',
      `
        <div class="card">
          <p class="aviso no" id="aviso-pub" hidden></p>
          <form id="form-pub" novalidate>
            <div class="grid2">
              ${campoPub('dato-id', 'Identificación', 'type="text" inputmode="numeric" autocomplete="off" placeholder="1020345876"')}
              ${campoPub('dato-nombre', 'Nombre completo', 'type="text" autocomplete="name" placeholder="Ana María Torres"')}
            </div>
            <p class="hint">Sin cuenta ni contraseña: este módulo es abierto.</p>
            <div class="btnrow pubfoot">
              <button class="btn pri" type="submit">Entrar al examen</button>
              <button class="btn sec" type="button" id="volver-lista">Elegir otro</button>
            </div>
          </form>
          ${ficha(examen)}
        </div>`
    );
  }

  function pantallaExamen() {
    const examen = examenActual();

    const bloques = examen.preguntas.map((pregunta, numero) => `
      <div class="pq">
        <div class="pq-h">
          <span class="pq-n">${numero + 1}</span>
          <p>${pregunta.enunciado}</p>
        </div>
        <div class="pq-op">
          ${pregunta.respuestas.map((una, opcion) => `
            <label class="pop">
              <input type="radio" name="p${numero}" data-p="${numero}" value="${opcion}"${elegidas[numero] === opcion ? ' checked' : ''}>
              <span>${una.texto}</span>
            </label>`).join('')}
        </div>
      </div>`).join('');

    return marco(
      examen.titulo,
      identidad.nombre + ' · identificación ' + identidad.id + ' · ' + examen.codigo,
      `
        <div class="card pubhead">
          ${ficha(examen)}
          <p class="sub" id="contador" role="status">${respondidas()} de ${examen.preguntas.length} respondidas</p>
          <p class="timer" id="reloj-caja"><i class="ic clock"></i><b id="reloj">${relojTexto(restante)}</b></p>
        </div>
        <div id="pq-lista">${bloques}</div>
        <div class="btnrow pubfoot">
          <button class="btn sec" type="button" id="dejar-examen">Salir sin terminar</button>
          <button class="btn pri" type="button" id="terminar">Terminar</button>
        </div>`
    );
  }

  function pantallaNota() {
    const examen = examenActual();

    return marco(
      'Tu resultado',
      identidad.nombre + ' · ' + examen.codigo,
      `
        <div class="card">
          <div class="notabox ${resultado.aprobado ? 'ok' : 'no'}">
            <p class="notapin">${resultado.porcentaje}<small>%</small></p>
            <div>
              <h3>${resultado.aprobado ? 'Examen aprobado' : 'Examen no aprobado'}</h3>
              <p class="sub">${resultado.aciertos} aciertos de ${resultado.total}.
                 Este examen pide ${examen.aprobacion} %.</p>
            </div>
          </div>
          <p class="hint">Tiempo usado ${relojTexto(usado)} de ${relojTexto(limite)}.${
            agotado ? ' Se cerró al llegar a 00:00.' : ''} Queda registrado con tus datos.</p>
          <div class="btnrow">
            <button class="btn sec" type="button" id="ver-revision">Revisar respuestas</button>
            <button class="btn pri" type="button" id="otro-examen">Volver a los exámenes</button>
          </div>
        </div>`
    );
  }

  // Pantalla de revisión
  function pantallaRevision() {
    const examen = examenActual();

    const bloques = examen.preguntas.map((pregunta, numero) => {
      const correcta = pregunta.respuestas.findIndex((una) => una.correcta);
      const marcada = elegidas[numero];

      const opciones = pregunta.respuestas.map((una, opcion) => {
        const buena = opcion === correcta;
        const mala = opcion === marcada && !buena;
        const etiqueta = buena
          ? (marcada === correcta ? 'Tu respuesta' : 'Era esta')
            : mala ? 'Marcaste esta' : '';
        return `
            <p class="pop ${buena ? 'buena' : ''} ${mala ? 'mala' : ''}">
              <span>${una.texto}</span>${etiqueta ? `<span class="tag ${buena ? 'ok' : 'no'}">${etiqueta}</span>` : ''}
            </p>`;
      }).join('');

      return `
        <div class="pq rev">
          <div class="pq-h">
            <span class="pq-n ${marcada === correcta ? 'bien' : 'mal'}">${numero + 1}</span>
            <p>${pregunta.enunciado}</p>
          </div>
          <div class="pq-op">${opciones}</div>
          ${marcada === -1 ? '<p class="sin-r">No marcaste ninguna opción en esta pregunta.</p>' : ''}
        </div>`;
    }).join('');

    return marco(
      'Revisión de respuestas',
      identidad.nombre + ' · ' + examen.codigo + ' · ' + resultado.aciertos + ' de ' + resultado.total + ' correctas',
      `
        <div class="card">
          <p class="sub">En verde está la opción correcta. En rojo, lo que marcaste si te equivocaste.</p>
        </div>
        <div id="rev-lista">${bloques}</div>
        <div class="btnrow pubfoot">
          <button class="btn sec" type="button" id="volver-nota">Volver al resultado</button>
          <button class="btn pri" type="button" id="otro-examen">Volver a los exámenes</button>
        </div>`
    );
  }

  // Pregunta antes de salir
  function puedeSalir() {
    return pantalla !== 'examen' || !respondidas() ||
      window.confirm('¿Salir sin terminar? Lo respondido no se guarda.');
  }

  Acme.vistas.publico = (monticulo) => {
    contenedor = monticulo;
    parar();
    monticulo.innerHTML =
      pantalla === 'identidad' ? pantallaIdentidad()
        : pantalla === 'examen' ? pantallaExamen()
          : pantalla === 'nota' ? pantallaNota()
            : pantalla === 'revision' ? pantallaRevision()
              : pantallaLista();
    // Volver arriba
    window.scrollTo(0, 0);

    // Enlace de volver al acceso
    monticulo.querySelector('#salir-pub').addEventListener('click', (evento) => {
      if (!puedeSalir()) {
        evento.preventDefault();
        return;
      }
      reiniciar();
    });

    const lista = monticulo.querySelector('#exlist');
    if (lista) {
      lista.addEventListener('click', (evento) => {
        const boton = evento.target.closest('[data-resuelve]');
        if (!boton) {
          return;
        }
        elegido = boton.dataset.resuelve;
        pantalla = 'identidad';
        Acme.vistas.publico(monticulo);
        monticulo.querySelector('#dato-id').focus();
      });
    }

    const elegirOtro = monticulo.querySelector('#volver-lista');
    if (elegirOtro) {
      elegirOtro.addEventListener('click', () => {
        elegido = null;
        pantalla = 'lista';
        Acme.vistas.publico(monticulo);
      });
    }

    const formulario = monticulo.querySelector('#form-pub');
    if (formulario) {
      const caja = monticulo.querySelector('#aviso-pub');

      formulario.addEventListener('input', () => {
        caja.hidden = true;
      });

      formulario.addEventListener('submit', (evento) => {
        evento.preventDefault();
        const identificacion = monticulo.querySelector('#dato-id').value;
        const nombre = monticulo.querySelector('#dato-nombre').value;

        const mensajes = {
          'dato-id': Acme.validar.cedula(identificacion),
          'dato-nombre': Acme.validar.nombre(nombre)
        };

        Object.entries(mensajes).forEach(([campoId, texto]) => {
          Acme.validar.mostrar(monticulo, campoId, texto);
        });

        if (Object.values(mensajes).some((texto) => texto)) {
          caja.textContent = 'Revisa los campos marcados en rojo.';
          caja.className = 'aviso no';
          caja.hidden = false;
          return;
        }

        identidad = { id: identificacion.trim(), nombre: nombre.trim() };
        // Preguntas sin marcar
        elegidas = examenActual().preguntas.map(() => -1);
        limite = examenActual().tiempo * 60;
        restante = limite;
        usado = 0;
        agotado = false;
        pantalla = 'examen';
        Acme.vistas.publico(monticulo);
        monticulo.querySelector('input[type="radio"]').focus();
      });
    }

    // Lista de preguntas
    const cuerpo = monticulo.querySelector('#pq-lista');
    if (cuerpo) {
      const examen = examenActual();
      const contador = monticulo.querySelector('#contador');

      // Marca la opción elegida
      cuerpo.addEventListener('change', (evento) => {
        const marca = evento.target;
        if (marca.type !== 'radio') {
          return;
        }
        elegidas[Number(marca.dataset.p)] = Number(marca.value);
        contador.textContent = respondidas() + ' de ' + examen.preguntas.length + ' respondidas';
      });

      monticulo.querySelector('#dejar-examen').addEventListener('click', () => {
        if (!puedeSalir()) {
          return;
        }
        reiniciar();
        Acme.vistas.publico(monticulo);
      });

      monticulo.querySelector('#terminar').addEventListener('click', () => {
        const faltantes = examen.preguntas.length - respondidas();
        if (faltantes && !window.confirm(
          'Dejas ' + faltantes + (faltantes === 1 ? ' pregunta' : ' preguntas') +
          ' sin responder. ¿Terminar de todas formas?')) {
          return;
        }
        cerrar(limite - quedan(), false);
      });
    }

    const revisar = monticulo.querySelector('#ver-revision');
    if (revisar) {
      revisar.addEventListener('click', () => {
        pantalla = 'revision';
        Acme.vistas.publico(monticulo);
      });
    }

    const alResultado = monticulo.querySelector('#volver-nota');
    if (alResultado) {
      alResultado.addEventListener('click', () => {
        pantalla = 'nota';
        Acme.vistas.publico(monticulo);
      });
    }

    const otro = monticulo.querySelector('#otro-examen');
    if (otro) {
      otro.addEventListener('click', () => {
        reiniciar();
        Acme.vistas.publico(monticulo);
      });
    }

    // Retoma el reloj al volver
    if (pantalla === 'examen') {
      pintaReloj();
      arrancar();
    }
  };
})();
