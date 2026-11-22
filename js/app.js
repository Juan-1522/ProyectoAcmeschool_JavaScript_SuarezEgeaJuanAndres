const datos = Acme.datos;

const preguntas = datos.examenes.reduce((total, examen) => total + examen.preguntas.length, 0);

console.log('Plataforma de exámenes - Acme School');
console.log(`${datos.usuarios.length} usuarios, ${datos.examenes.length} exámenes, ${preguntas} preguntas y ${datos.intentos.length} intentos de ejemplo.`);
