Acme.vistas = Acme.vistas || {};

// Quita tildes y mayúsculas
function normalizar(valor) {
  return valor.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

// Armazón de las vistas privadas
Acme.montar = (monticulo, pagina) => {
  monticulo.innerHTML = `
    <div class="page">
      <a class="skip" href="#contenido">Saltar al contenido</a>
      <acme-barra activa="${pagina.activa}"></acme-barra>
      <main class="main" id="contenido" tabindex="-1">
        <header class="head">
          <div>
            <p class="eyebrow">${pagina.eyebrow}</p>
            <h1>${pagina.titulo}</h1>
          </div>
          ${pagina.acciones ? `<div class="hs">${pagina.acciones}</div>` : ''}
        </header>
        <div class="body">
          <div class="col">${pagina.contenido}</div>
          ${pagina.lateral ? `<div class="side-c">${pagina.lateral}</div>` : ''}
        </div>
      </main>
    </div>`;
};
