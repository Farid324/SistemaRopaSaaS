// backend/src/shared/middlewares/empresaMiddleware.ts
//
// NOTA: Los filtros filterByEmpresa y filterBySucursal se eliminaron porque
// Express 5 tiene req.query de solo lectura (getter) y las mutaciones no persisten.
//
// En su lugar, cada controller lee req.user.empresaId directamente del JWT.
// Este archivo se mantiene como documentación del cambio.
//
// Referencia del bug: Express 5 req.query returns a new parsed object each time,
// so property assignments like req.query.empresaId = ... are silently lost.