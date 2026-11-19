# Mesa de Rol

Mesa de Rol acompaña partidas presenciales en teléfonos. El anfitrión abre una sesión, comparte una invitación y coordina un orden de turnos visible para las personas de la mesa. El anfitrión paga por funciones de sesión y continuidad. Los jugadores invitados entran gratis. La unidad de precio propuesta es el anfitrión con sesiones activas y capacidad acotada de invitados.

## Recorrido

1. El anfitrión inicia sesión y crea una mesa con un nombre y un orden de participantes.
2. Comparte una invitación limitada a esa sesión. Cada participante obtiene una identidad de invitado y un ticket breve de conexión.
3. El anfitrión confirma el siguiente turno. El servidor registra la versión y comunica el estado a los participantes.
4. Si un teléfono pierde conexión, la persona recupera el estado actual y continúa con su identidad y permisos vigentes.
5. El anfitrión cierra o conserva la mesa según el plazo de retención informado.

La primera oferta organiza sesiones y turnos. El contenido descriptivo de los participantes es propio del usuario. Las pruebas usan identidades inventadas. Las reglas, personajes, manuales e ilustraciones de terceros requieren su licencia y no forman parte del paquete inicial.

## Aceptación del primer flujo de negocio

| ID | Resultado comprobable |
| --- | --- |
| AC-01 | Un anfitrión autorizado controla su sesión y los invitados consultan únicamente la sesión a la que fueron admitidos. |
| AC-02 | Un ticket caducado o usado se rechaza al conectar. Dos conexiones simultáneas con el mismo ticket producen una sola admisión. |
| AC-03 | Avanzar al final del orden vuelve a su primer participante e incrementa la ronda. |
| AC-04 | Dos comandos sobre la misma versión producen un único avance persistido. El perdedor recibe el conflicto y solicita el estado actual. |
| AC-05 | Repetir un comando confirmado devuelve el recibo original. Reutilizar su clave con otro cuerpo produce un conflicto. |
| AC-06 | Tras una desconexión o un mensaje duplicado, el cliente representa la versión autoritativa y conserva el orden de la mesa. |
| AC-07 | El anfitrión puede cerrar una sesión y revocar nuevas conexiones. Los plazos de conservación aparecen en la interfaz antes de guardar una mesa. |

## Base implementada

La función pura `advanceTurn` calcula el siguiente estado y un recibo sin modificar la entrada. Las pruebas comprueban vueltas de ronda, versión, conflicto de un segundo comando y repetición. La infraestructura reserva la tabla con TTL y expone la salud del proceso. El almacenamiento transaccional, las invitaciones, Cognito, WebSocket, los cobros y la recuperación de conexión son fases posteriores.

## Uso de material previo

La propuesta toma la idea de anfitrión, jugador y sesión de los repositorios Game Master. Esta base usa código nuevo y reglas de coordinación independientes de cualquier sistema de juego.
