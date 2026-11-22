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
          </div>
        </div>
      </main>
    </div>`;

  monticulo.querySelector('#salir').addEventListener('click', () => {
    Acme.sesion.cerrar();
    Acme.mostrar();
  });
};
