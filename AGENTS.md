# Instrucciones de Mesa de Rol

El producto usa módulos Node.js 24 para salud y dominio y una consola Angular standalone. La infraestructura AWS SAM se mantiene en `infra/`. La documentación del comportamiento está en [docs/PRODUCTO.md](docs/PRODUCTO.md) y el plan en [plan/architecture-foundation-1.md](plan/architecture-foundation-1.md).

- Respetar la separación de `services/domain/`, `services/health/`, `web/` e `infra/`.
- Antes de cambiar una regla, leer sus pruebas y verificar los casos límite que afectan al producto. Ejecutar `node --test services/domain/*.test.mjs`.
- Validar una plantilla modificada con `cfn-lint -r us-east-1 -t infra/template.yaml`. Verificar también el código de salud y su contrato HTTP.
- Usar datos ficticios en fixtures. Los tokens y los documentos privados pertenecen a la configuración y al almacenamiento autorizados de cada entorno.
- Los cambios entran por `development`, pasan a `testing` y se promueven a `main`, que corresponde a producción. Revisar el estado remoto y las reglas efectivas antes de operaciones en GitHub.
- Mantener una única versión autoritativa de la sesión. El adaptador persiste estado y recibo en una transacción. El acceso a la mesa se verifica en cada comando, incluido un reintento.
