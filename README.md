# Mesa de Rol

Coordinación de turnos y sesiones presenciales desde el teléfono. El anfitrión paga y los jugadores invitados participan gratis.

- [Producto y criterios de aceptación](docs/PRODUCTO.md)
- [Arquitectura y datos](docs/architecture/ARCHITECTURE.md)
- [Decisión de arquitectura](docs/architecture/adr/0001-fundacion-serverless.md)
- [Plan por fases](plan/architecture-foundation-1.md)
- [Plantilla SAM](infra/template.yaml)
- [Ambientes](infra/environments.json)

La base contiene una consola Angular 22.3 con NgRx SignalStore, un handler Node.js 24 para `GET /api/health`, reglas de dominio con pruebas y recursos AWS aislados. El plan identifica los flujos de negocio de las siguientes fases.

## Comprobación local

En dos terminales se inicia la API local en el puerto 4201 y la consola en el 4200.

```sh
npm run dev:api
```

```sh
npm run dev:web
```

Desde la raíz se ejecutan las pruebas puras del dominio.

```sh
node --test services/domain/*.test.mjs
```

La consola tiene su propio paquete y lockfile.

```sh
npm --prefix web ci
npm --prefix web run build
npm --prefix web test -- --watch=false
```

La plantilla se comprueba con cfn-lint. SAM CLI usa `infra/samconfig.toml` y cada ambiente declara un parámetro `Stage`. La región e identidad AWS se seleccionan en el entorno de ejecución.

```sh
cfn-lint -r us-east-1 -t infra/template.yaml
```

Los recursos DynamoDB conservan sus datos al borrar el stack. La retención y PITR generan costes mientras permanezcan esos recursos. Las políticas de conservación del producto se detallan en la arquitectura.

## Base compartida y operación local

Ver [base local](docs/BASE-LOCAL.md) y [promoción](docs/promocion.md). Instalar con npm --prefix web ci; validar con npm test, npm run check:config, npm run test:web y npm run build:web. Para el recorrido local abrir dos terminales: npm run dev:api y npm run dev:web. Los resultados de preparación quedarán en [verificación](docs/VERIFICACION.md).
