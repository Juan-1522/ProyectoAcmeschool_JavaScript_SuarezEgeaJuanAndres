Acme.vistas = Acme.vistas || {};

// Se quitan los acentos para que escribir "avila" encuentre a "Héctor Manuel
// Ávila" sin tener que respetar las mayúsculas ni las tildes. Lo usan el
// buscador de usuarios y el de exámenes.
function normalizar(valor) {
  return valor.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

// Armazón que comparten todas las vistas privadas: barra, encabezado y cuerpo.
// Cada vista solo aporta su título y su contenido.
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
