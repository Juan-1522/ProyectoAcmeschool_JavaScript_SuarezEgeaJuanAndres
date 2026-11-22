Acme.vistas = Acme.vistas || {};

Acme.vistas.login = (monticulo) => {
  monticulo.innerHTML = `
    <main class="auth">
      <aside class="brand">
        <div>
          <div class="topline">
            <span class="bk">A</span>
            <div><b>Acme School</b><small>Plataforma de exámenes</small></div>
          </div>
          <h2>Plataforma de exámenes<br>de la escuela Acme</h2>
          <p>Los docentes registran los usuarios y arman los exámenes con sus preguntas.
             Quien los resuelve no necesita cuenta: pone su identificación y su nombre,
             responde mientras corre el reloj y al final ve su porcentaje.</p>
        </div>
        <ul class="feats">
          <li><i class="ic users"></i> Usuarios del panel con cargo: administrativo o docente</li>
          <li><i class="ic doc"></i> Cada examen guarda sus preguntas y sus respuestas de opción múltiple</li>
          <li><i class="ic clock"></i> El examen tiene un tiempo límite que se ve en pantalla</li>
          <li><i class="ic check"></i> Al terminar se saca el porcentaje de aciertos y se compara con el de aprobación</li>
        </ul>
        <p class="nota">Los datos se guardan en este navegador con localStorage.</p>
      </aside>

      <form class="form" id="form-login">
        <p class="eyebrow">Acceso al panel</p>
        <h1>Entra con tu correo</h1>
        <p class="sub">Solo pueden entrar usuarios registrados. Si vas a resolver un examen no necesitas cuenta.</p>

        <div class="field">
          <label for="correo">Correo electrónico</label>
          <div class="inicon">
            <i class="ic mail"></i>
            <input id="correo" name="correo" type="email" placeholder="nombre@acme.edu" autocomplete="username">
          </div>
        </div>

        <div class="field">
          <label for="clave">Contraseña</label>
          <div class="inicon">
            <i class="ic lock"></i>
            <input id="clave" name="clave" type="password" autocomplete="current-password">
          </div>
        </div>

        <div class="btnrow">
          <label class="recordar"><input id="recordar" name="recordar" type="checkbox" checked> Recordar este equipo</label>
        </div>

        <button class="btn pri big" type="submit">Iniciar sesión</button>

        <hr class="hr">

        <button class="btn sec big" type="button" id="ir-publico">Resolver un examen sin iniciar sesión</button>

        <p class="demo">Cuentas que vienen en los datos de ejemplo:<br>
          <b>ana.torres@acme.edu</b> (administrativa) y <b>c.ruiz@acme.edu</b> (docente),
          contraseña <b>acme1234</b>.</p>
      </form>
    </main>`;

  // Todavía no hay nada que validar, pero si se deja suelto el formulario
  // recarga la página y manda el correo por la barra de direcciones.
  monticulo.querySelector('#form-login').addEventListener('submit', (evento) => evento.preventDefault());
};
