// Compara la posición marcada en cada pregunta con la que el examen tiene como
// correcta. En elegidas, -1 significa que se dejó sin responder.
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
