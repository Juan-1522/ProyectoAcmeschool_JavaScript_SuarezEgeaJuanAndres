const estado = Acme.estado;

const preguntas = estado.examenes.reduce((total, examen) => total + examen.preguntas.length, 0);

console.log('Plataforma de exámenes - Acme School');
console.log(`${estado.usuarios.length} usuarios, ${estado.examenes.length} exámenes, ${preguntas} preguntas y ${estado.intentos.length} intentos guardados.`);
