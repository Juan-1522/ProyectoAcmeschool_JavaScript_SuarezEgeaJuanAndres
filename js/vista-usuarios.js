Acme.vistas.usuarios = (monticulo) => {
  const usuarios = Acme.estado.usuarios
    .slice()
    .sort((uno, otro) => uno.id.localeCompare(otro.id));

  const docentes = usuarios.filter((uno) => uno.cargo === 'Docente').length;

  const filas = usuarios.map((uno) => `
    <tr>
      <td class="code">${uno.id}</td>
      <td>
        <div class="person">
          <span class="av">${iniciales(uno.nombre)}</span>
          <div>${uno.nombre}</div>
        </div>
      </td>
      <td class="sm">${uno.correo}</td>
      <td class="sm">${uno.telefono}</td>
      <td><span class="pill ${uno.cargo === 'Docente' ? 'doc' : 'adm'}">${uno.cargo}</span></td>
    </tr>`).join('');

  Acme.montar(monticulo, {
    activa: '#/usuarios',
    eyebrow: 'Módulo privado',
    titulo: 'Gestión de usuarios',
    contenido: `
      <div class="card">
        <div class="ch">
          <div>
            <h3>${usuarios.length} usuarios registrados</h3>
            <p class="sub">${docentes} docentes y ${usuarios.length - docentes} administrativos, ordenados por identificación</p>
          </div>
        </div>
        <div class="tw">
          <table>
            <thead>
              <tr>
                <th>Identificación</th>
                <th>Nombre completo</th>
                <th>Correo</th>
                <th>Teléfono</th>
                <th>Cargo</th>
              </tr>
            </thead>
            <tbody>${filas}</tbody>
          </table>
        </div>
      </div>`
  });
};
