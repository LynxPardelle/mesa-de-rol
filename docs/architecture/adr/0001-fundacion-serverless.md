# ADR 0001 — Base serverless de Mesa de Rol

- **Fecha** 2026-11-19
- **Estado** aceptado para la base local
- **Decisión** dominio puro y recursos separados por producto y ambiente

Las sesiones móviles requieren ordenar cambios de un anfitrión, difundir estados a varios teléfonos y recuperar una desconexión sin repetir el avance de turno.

Elegimos reglas puras y DynamoDB con versión, recibo idempotente y transacción. La fase de tiempo real añadirá WebSocket de API Gateway y Lambda, tickets de conexión de un solo uso e identidad del anfitrión en Cognito.

Un servidor con sockets y memoria local simplificaría el prototipo de difusión pero necesita recuperar estado y coordinar instancias. La solución administrada requiere diseñar la conexión, persistencia y distribución como pasos separados. Un fallo de difusión se corrige leyendo el estado ya confirmado.

La porción desplegable actual contiene salud pública y recursos de datos reservados. Los servicios de negocio deberán incorporar identidad y permisos al añadir sus rutas. El flujo de promoción enlaza `development → testing → main` con ambientes aislados. Los datos usan retención explícita y PITR, con costes que continúan tras eliminar el stack.

[Arquitectura](../ARCHITECTURE.md) · [Plan](../../../plan/architecture-foundation-1.md)
