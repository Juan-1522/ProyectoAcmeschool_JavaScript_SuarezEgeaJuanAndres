Acme.vistas = Acme.vistas || {};

Acme.vistas.panel = (monticulo) => {
  const usuarios = Acme.estado.usuarios;
  const examenes = Acme.estado.examenes;

  const docentes = usuarios.filter((uno) => uno.cargo === 'Docente').length;
  const publicados = examenes.filter((uno) => uno.estado === 'Publicado').length;
  const preguntas = examenes.reduce((total, uno) => total + uno.preguntas.length, 0);
  const minutos = examenes.reduce((total, uno) => total + uno.tiempo, 0);
  // Math.max de una lista vacía devuelve -Infinity, y eso se leía en la tarjeta.
  const masLargo = examenes.length ? Math.max(...examenes.map((uno) => uno.tiempo)) : 0;

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
  // no entra en la tabla ni en los pendientes.
  const vigentes = Acme.estado.intentos.filter((intento) =>
    examenes.some((examen) => examen.codigo === intento.codigo));

  const conNota = vigentes.map((intento) => {
    const examen = examenes.find((uno) => uno.codigo === intento.codigo);
    return { intento, examen, nota: Acme.nota(examen, intento.elegidas) };
  });

  const reprobados = conNota.filter((par) => !par.nota.aprobado).length;

  const ultimos = [...conNota]
    .sort((uno, otro) => otro.intento.fecha.localeCompare(uno.intento.fecha))
    .slice(0, 3);

  const filas = ultimos.map(({ intento, examen, nota }) => {
    // Se comparan los segundos y no el texto: el reloj escribe '05:00' y la
    // semilla trae '5:00' para el mismo examen de cinco minutos.
    const [min, seg] = intento.tiempoUsado.split(':').map(Number);
    const total = String(examen.tiempo).padStart(2, '0') + ':00';
    const tiempo = min * 60 + seg === examen.tiempo * 60
      ? `${intento.tiempoUsado} · tiempo agotado`
      : `${intento.tiempoUsado} de ${total}`;

    return `
      <tr>
        <td data-c="Estudiante">
          <div class="person">
            <acme-inicial nombre="${atributo(intento.nombre)}"></acme-inicial>
            <div>${intento.nombre}<small>${intento.identificacion}</small></div>
          </div>
        </td>
        <td data-c="Examen">${examen.titulo}</td>
        <td data-c="Nota"><b>${nota.porcentaje} %</b></td>
        <td class="sm" data-c="Tiempo usado">${tiempo}</td>
        <td data-c="Estado"><span class="pill ${nota.aprobado ? 'pub' : 'dra'}">${nota.aprobado ? 'Aprobado' : 'No aprobado'}</span></td>
      </tr>`;
  }).join('');

  // El cartel de pendientes se arma con lo que ya está en la pantalla: si un
  // número no molesta, su fila no aparece.
  const plural = (cantidad, uno, varios) => cantidad + ' ' + (cantidad === 1 ? uno : varios);
  const sinIntentos = usuarios.filter((uno) =>
    !vigentes.some((intento) => intento.identificacion === uno.id)).length;
  const pendientes = [];

  if (examenes.length !== publicados) {
    pendientes.push({
      clase: 'co', icono: 'doc', ir: '#/examenes', boton: 'Ver exámenes',
      titulo: plural(examenes.length - publicados, 'examen en borrador', 'exámenes en borrador'),
      detalle: 'El módulo público no los muestra todavía.'
    });
  }

  if (reprobados) {
    pendientes.push({
      clase: 'wa', icono: 'search', bajar: 'rendimiento', boton: 'Ver rendimiento',
      titulo: plural(reprobados, 'intento reprobado', 'intentos reprobados'),
      detalle: 'Quedaron por debajo del porcentaje que aprueba.'
    });
  }

  if (sinIntentos) {
    pendientes.push({
      clase: 'pe', icono: 'users', ir: '#/usuarios', boton: 'Ver usuarios',
      titulo: plural(sinIntentos, 'usuario sin intentos', 'usuarios sin intentos'),
      detalle: 'Todavía no aparecen entre los intentos registrados.'
    });
  }

  const tareas = pendientes.length
    ? pendientes.map((una) => `
              <div class="tarea">
                <div class="i ${una.clase}"><i class="ic ${una.icono}"></i></div>
                <p class="t">${una.titulo}<small>${una.detalle}</small></p>
                <button type="button" class="btn sec mini" ${una.ir ? `data-ir="${una.ir}"` : `data-bajar="${una.bajar}"`}>${una.boton}</button>
              </div>`).join('')
    : `
              <div class="tarea fin">
                <div class="i ok"><i class="ic check"></i></div>
                <p class="t">Nada pendiente<small>Los exámenes están publicados y ya tienen intentos.</small></p>
              </div>`;

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
                <div class="d">${masLargo ? 'el más largo dura ' + masLargo + ' min' : 'ningún examen creado'}</div>
              </div>
            </div>

            <div class="card" id="tareas">
              <div class="ch">
                <div>
                  <h3>Qué hacer primero</h3>
                  <p class="sub">Se calcula con los datos guardados en este navegador</p>
                </div>
              </div>
              ${tareas}
            </div>

            <div class="card" id="rendimiento">
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
                      <th scope="col">Estudiante</th>
                      <th scope="col">Examen</th>
                      <th scope="col">Nota</th>
                      <th scope="col">Tiempo usado</th>
                      <th scope="col">Estado</th>
                    </tr>
                  </thead>
                  <tbody>${filas}</tbody>
                </table>
              </div>
            </div>
    `
  });

  // Cada botón trae el destino escrito en la fila: una ruta del panel o un
  // bloque de esta misma página al que hace falta bajar.
  monticulo.querySelector('#tareas').addEventListener('click', (evento) => {
    const boton = evento.target.closest('button');
    if (!boton) return;

    if (boton.dataset.ir) {
      location.hash = boton.dataset.ir;
      return;
    }

    monticulo.querySelector('#' + boton.dataset.bajar).scrollIntoView({ block: 'start' });
  });
};
