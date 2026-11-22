Acme.vistas = Acme.vistas || {};

function iniciales(nombre) {
  return nombre
    .split(' ')
    .filter((palabra) => palabra.length > 2)
    .slice(0, 2)
    .map((palabra) => palabra[0])
    .join('');
}

Acme.vistas.panel = (monticulo) => {
  const sesion = Acme.sesion.actual();
  const usuarios = Acme.estado.usuarios;
  const examenes = Acme.estado.examenes;

  const docentes = usuarios.filter((uno) => uno.cargo === 'Docente').length;
  const publicados = examenes.filter((uno) => uno.estado === 'Publicado').length;
  const preguntas = examenes.reduce((total, uno) => total + uno.preguntas.length, 0);
  const minutos = examenes.reduce((total, uno) => total + uno.tiempo, 0);
  const masLargo = Math.max(...examenes.map((uno) => uno.tiempo));

  // El color de cada barra sale del promedio frente al porcentaje de aprobación
  // que el examen tiene configurado, no de un umbral fijo para todos.
  const barras = examenes.map((examen) => {
    const notas = Acme.estado.intentos
      .filter((uno) => uno.codigo === examen.codigo)
      .map((uno) => Acme.nota(examen, uno.elegidas).porcentaje);
    const promedio = notas.length
      ? Math.round(notas.reduce((total, una) => total + una, 0) / notas.length)
      : null;

    const clase = promedio === null ? 'sin' : promedio >= examen.aprobacion ? 'alto' : 'bajo';
    const etiqueta = promedio === null ? 'sin notas' : promedio + ' %';
    const alto = promedio === null ? '' : ` style="height:${promedio}%"`;

    return `
      <div class="barra">
        <div class="pista"><span${alto} class="l ${clase}"></span></div>
        <p class="et">${examen.titulo}<b>${etiqueta}</b></p>
      </div>`;
  }).join('');

  const intentos = Acme.estado.intentos
    .slice()
    .sort((uno, otro) => otro.fecha.localeCompare(uno.fecha))
    .slice(0, 3);

  const filas = intentos.map((intento) => {
    const examen = examenes.find((uno) => uno.codigo === intento.codigo);
    const nota = Acme.nota(examen, intento.elegidas);
    const agotado = `${examen.tiempo}:00`;
    const tiempo = intento.tiempoUsado === agotado
      ? `${intento.tiempoUsado} · tiempo agotado`
      : `${intento.tiempoUsado} de ${agotado}`;

    return `
      <tr>
        <td>
          <div class="person">
            <span class="av">${iniciales(intento.nombre)}</span>
            <div>${intento.nombre}<small>${intento.identificacion}</small></div>
          </div>
        </td>
        <td>${examen.titulo}</td>
        <td><b>${nota.porcentaje} %</b></td>
        <td class="sm">${tiempo}</td>
        <td><span class="pill ${nota.aprobado ? 'pub' : 'dra'}">${nota.aprobado ? 'Aprobado' : 'No aprobado'}</span></td>
      </tr>`;
  }).join('');

  monticulo.innerHTML = `
    <div class="page">
      <aside class="side">
        <div class="brand">
          <span class="bk">A</span>
          <div><b>Acme School</b><small>Plataforma de exámenes</small></div>
        </div>

        <p class="navlab">Módulos privados</p>
        <div class="nav on"><i class="ic grid"></i>Panel</div>

        <div class="sidefoot">
          <div class="me">
            <span class="av">${iniciales(sesion.nombre)}</span>
            <div><b>${sesion.nombre}</b><small>${sesion.cargo}</small></div>
            <button class="ib" id="salir" type="button" aria-label="Cerrar sesión">
              <i class="ic out"></i>
            </button>
          </div>
        </div>
      </aside>

      <main class="main">
        <header class="head">
          <div>
            <p class="eyebrow">Acme School</p>
            <h1>Panel general</h1>
          </div>
        </header>

        <div class="body">
          <div class="col">
            <div class="tiles">
              <div class="tile">
                <div class="i pe"><i class="ic users"></i></div>
                <div class="v">${usuarios.length}</div>
                <div class="k">Usuarios registrados</div>
                <div class="d">${docentes} docentes, ${usuarios.length - docentes} administrativos</div>
              </div>
              <div class="tile">
                <div class="i co"><i class="ic doc"></i></div>
                <div class="v">${examenes.length}</div>
                <div class="k">Exámenes creados</div>
                <div class="d">${publicados} publicados, ${examenes.length - publicados} en borrador</div>
              </div>
              <div class="tile">
                <div class="i ok"><i class="ic check"></i></div>
                <div class="v">${preguntas}</div>
                <div class="k">Preguntas en total</div>
                <div class="d">una sola respuesta correcta por pregunta</div>
              </div>
              <div class="tile">
                <div class="i wa"><i class="ic clock"></i></div>
                <div class="v">${minutos} min</div>
                <div class="k">Tiempo sumado</div>
                <div class="d">el más largo dura ${masLargo} min</div>
              </div>
            </div>

            <div class="card">
              <div class="ch">
                <div>
                  <h3>Rendimiento por examen</h3>
                  <p class="sub">Porcentaje promedio de quienes lo han resuelto</p>
                </div>
              </div>
              <div class="barras">${barras}</div>
            </div>

            <div class="card">
              <div class="ch">
                <div>
                  <h3>Últimos intentos</h3>
                  <p class="sub">Los tres exámenes terminados más recientes</p>
                </div>
              </div>
              <div class="tw">
                <table>
                  <thead>
                    <tr>
                      <th>Estudiante</th>
                      <th>Examen</th>
                      <th>Nota</th>
                      <th>Tiempo usado</th>
                      <th>Estado</th>
                    </tr>
                  </thead>
                  <tbody>${filas}</tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>`;

  monticulo.querySelector('#salir').addEventListener('click', () => {
    Acme.sesion.cerrar();
    Acme.mostrar();
  });
};
