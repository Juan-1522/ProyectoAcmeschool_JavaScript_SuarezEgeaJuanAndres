Acme.vistas = Acme.vistas || {};

Acme.vistas.panel = (monticulo) => {
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

  // Un intento de un examen que ya no está no tiene nota que calcular, así que
  // no entra en la tabla.
  const intentos = Acme.estado.intentos
    .filter((intento) => examenes.some((examen) => examen.codigo === intento.codigo))
    .sort((uno, otro) => otro.fecha.localeCompare(uno.fecha))
    .slice(0, 3);

  const filas = intentos.map((intento) => {
    const examen = examenes.find((uno) => uno.codigo === intento.codigo);
    const nota = Acme.nota(examen, intento.elegidas);
    // Se comparan los segundos y no el texto: el reloj escribe '05:00' y la
    // semilla trae '5:00' para el mismo examen de cinco minutos.
    const [min, seg] = intento.tiempoUsado.split(':').map(Number);
    const total = String(examen.tiempo).padStart(2, '0') + ':00';
    const tiempo = min * 60 + seg === examen.tiempo * 60
      ? `${intento.tiempoUsado} · tiempo agotado`
      : `${intento.tiempoUsado} de ${total}`;

    return `
      <tr>
        <td>
          <div class="person">
            <acme-inicial nombre="${atributo(intento.nombre)}"></acme-inicial>
            <div>${intento.nombre}<small>${intento.identificacion}</small></div>
          </div>
        </td>
        <td>${examen.titulo}</td>
        <td><b>${nota.porcentaje} %</b></td>
        <td class="sm">${tiempo}</td>
        <td><span class="pill ${nota.aprobado ? 'pub' : 'dra'}">${nota.aprobado ? 'Aprobado' : 'No aprobado'}</span></td>
      </tr>`;
  }).join('');

  Acme.montar(monticulo, {
    activa: '#/panel',
    eyebrow: 'Acme School',
    titulo: 'Panel general',
    contenido: `
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
    `
  });
};
