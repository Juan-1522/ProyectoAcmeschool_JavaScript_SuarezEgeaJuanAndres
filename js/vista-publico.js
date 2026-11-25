Acme.vistas = Acme.vistas || {};

(() => {
  // Quién responde, qué examen tiene delante y qué lleva marcado. Se guardan
  // afuera del HTML porque cada pantalla monta la vista de nuevo y en el
  // repintado se perderían las respuestas.
  let pantalla = 'lista';
  let elegido = null;
  let identidad = null;
  let elegidas = [];
  let resultado = null;
  // El reloj no vive en el HTML: se leen los segundos que quedan, así que al
  // repintar una pantalla no se pierde la cuenta.
  let reloj = null;
  let restante = 0;
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

  // Con el mismo formato de las fechas que ya trae la semilla, para que el panel
  // las pueda ordenar comparándolas como texto.
  function fechaActual() {
    const ahora = new Date();
    const dos = (n) => String(n).padStart(2, '0');
    return ahora.getFullYear() + '-' + dos(ahora.getMonth() + 1) + '-' + dos(ahora.getDate()) +
      'T' + dos(ahora.getHours()) + ':' + dos(ahora.getMinutes()) + ':' + dos(ahora.getSeconds());
  }

  // Pinta sobre lo que esté montado en este momento. Si la persona se fue a otra
  // ruta la cuenta sigue corriendo, y el reloj solo se ve al volver al examen.
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

  function arrancar() {
    parar();
    reloj = setInterval(() => {
      restante -= 1;
      if (restante > 0) {
        pintaReloj();
        return;
      }
      restante = 0;
      cerrarPorTiempo();
    }, 1000);
  }

  // El intento se guarda con la forma que ya lee el panel: a quién, qué examen,
  // cuándo, cuánto tardó y qué marcó en cada pregunta.
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
    // Se cierra solo si el examen sigue en pantalla: si la persona se fue a otra
    // ruta, la nota queda esperando a que vuelva a entrar al módulo.
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

  // El módulo público no tiene barra lateral: quien responde no es un usuario
  // del panel, así que la marca va arriba y el único enlace es volver al acceso.
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

  // En la revisión ya no hay radios: el color dice qué era correcto y la etiqueta
  // de al lado lo explica con palabras, para que no dependa solo del verde o rojo.
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

  // Irse a mitad de examen tira lo respondido, así que primero pregunta.
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
    // La revisión es larga: sin esto, al volver al resultado queda uno viendo el medio.
    window.scrollTo(0, 0);

    // El enlace de arriba está en todas las pantallas: en el examen puede
    // significar perder respuestas, y en las demás solo limpia lo elegido.
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
        // Cada pregunta arranca en -1, que es la señal de que quedó vacía.
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

    // #pq-lista solo existe en el examen; la revisión usa #rev-lista para no
    // enganchar estos botones que ahí no están.
    const cuerpo = monticulo.querySelector('#pq-lista');
    if (cuerpo) {
      const examen = examenActual();
      const contador = monticulo.querySelector('#contador');

      // El change llega por delegación porque las opciones se pintan todas
      // juntas y al cambiar de pantalla se montan otras cajas distintas.
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
        cerrar(limite - restante, false);
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

    // Se retoma la cuenta con lo que quedaba, que es lo que queda cuando se salió
    // con el botón atrás en vez de con el enlace de volver.
    if (pantalla === 'examen') {
      pintaReloj();
      arrancar();
    }
  };
})();
