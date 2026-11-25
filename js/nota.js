// Cálculo de la nota
Acme.nota = (examen, elegidas) => {
  const aciertos = examen.preguntas.reduce((total, pregunta, posicion) => {
    const correcta = pregunta.respuestas.findIndex((una) => una.correcta);
    return total + (elegidas[posicion] === correcta ? 1 : 0);
  }, 0);

  const porcentaje = Math.round(aciertos / examen.preguntas.length * 100);

  return {
    aciertos,
    total: examen.preguntas.length,
    porcentaje,
    aprobado: porcentaje >= examen.aprobacion
  };
};
