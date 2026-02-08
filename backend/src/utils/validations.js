// Validaciones útiles
const validarEmail = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

const validarNumerico = (valor) => {
  return !isNaN(valor) && valor !== '';
};

const validarLongitud = (texto, minimo, maximo) => {
  return texto.length >= minimo && texto.length <= maximo;
};

const validarRol = (rol) => {
  const rolesValidos = ['administrador', 'tecnico', 'coordinador'];
  return rolesValidos.includes(rol);
};

const validarEstadoSolicitud = (estado) => {
  const estadosValidos = ['pendiente', 'en_curso', 'finalizado', 'cancelado'];
  return estadosValidos.includes(estado);
};

const validarEstadoOrden = (estado) => {
  const estadosValidos = ['pendiente', 'en_curso', 'finalizado', 'cancelado'];
  return estadosValidos.includes(estado);
};

module.exports = {
  validarEmail,
  validarNumerico,
  validarLongitud,
  validarRol,
  validarEstadoSolicitud,
  validarEstadoOrden
};
