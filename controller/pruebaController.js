import prisma from "../config/prisma.js";

export const crearVehiculo = async (req, res) => {
  try {
    const {
      placa,
      tipo_vehiculo,
      capacidad,
      odometro,
      estado,
      fecha_ultimo_mantenimiento,
      conductores,
    } = req.body;

    //verificar que no exista un vehiculo con la misma placa
    const verificarPlaca = await prisma.vehiculo.findUnique({
      where: {
        placa: placa,
      },
    });

    if (verificarPlaca) {
      return res.status(404).json({ error: "Placa repetida" });
    }

    //un conductor no puede estar como habitual en dos vehiculos diferentes
    const habitual = conductores.find((c) => c.tipo_conductor === "habitual");

    if (habitual) {
      const existeHabitual = await prisma.conductor_vehiculo.findFirst({
        where: {
          cedula_conductor: Number(habitual.cedula_conductor),
          tipo_conductor: "habitual",
        },
      });
      if (existeHabitual) {
        return res.status(400).json({
          error: `El conductor con número de documento ${habitual.cedula_conductor} ya es habitual del vehículo ${existeHabitual.placa_vehiculo}`,
        });
      }
    }

    const nuevoVehiculo = await prisma.vehiculo.create({
      data: {
        placa,
        tipo_vehiculo,
        capacidad,
        odometro,
        estado,
        fecha_ultimo_mantenimiento: new Date(fecha_ultimo_mantenimiento),
        conductor_vehiculo: {
          create: conductores.map((c) => ({
            cedula_conductor: Number(c.cedula_conductor),
            tipo_conductor: c.tipo_conductor,
          })),
        },
      },
      include: {
        conductor_vehiculo: true,
      },
    });
    res.status(201).json(nuevoVehiculo);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Error al crear el vehículo" });
  }
};

export const editarVehiculoPorPlaca = async (req, res) => {
  try {
    const { placa } = req.params;
    const {
      tipo_vehiculo,
      capacidad,
      odometro,
      estado,
      fecha_ultimo_mantenimiento,
      conductores,
    } = req.body;

    // 1) Verificar que el vehículo exista
    const existente = await prisma.vehiculo.findUnique({ where: { placa } });
    if (!existente) {
      return res.status(404).json({ error: "Vehículo no encontrado" });
    }

    // 2) Normalizar fecha (acepta null, "", "YYYY-MM-DD" o ISO)
    let fechaUM = undefined; // undefined => no tocar el campo
    if (fecha_ultimo_mantenimiento !== undefined) {
      if (
        fecha_ultimo_mantenimiento === null ||
        fecha_ultimo_mantenimiento === ""
      ) {
        fechaUM = null;
      } else {
        const iso = /^\d{4}-\d{2}-\d{2}$/.test(fecha_ultimo_mantenimiento)
          ? `${fecha_ultimo_mantenimiento}T00:00:00.000Z`
          : fecha_ultimo_mantenimiento;
        const d = new Date(iso);
        if (isNaN(d.getTime())) {
          return res
            .status(400)
            .json({ error: "fecha_ultimo_mantenimiento inválida" });
        }
        fechaUM = d;
      }
    }

    // 3) Armar objeto de actualización solo con campos enviados
    const dataUpdate = {};
    if (tipo_vehiculo !== undefined) dataUpdate.tipo_vehiculo = tipo_vehiculo;
    if (capacidad !== undefined) dataUpdate.capacidad = capacidad;
    if (odometro !== undefined) dataUpdate.odometro = odometro;
    if (estado !== undefined) dataUpdate.estado = estado;
    if (fechaUM !== undefined) dataUpdate.fecha_ultimo_mantenimiento = fechaUM;

    // 4) Si vienen conductores, validar y reemplazar
    if (Array.isArray(conductores)) {
      // a) Validar que no haya más de un habitual en el payload
      const habituales = conductores.filter(
        (c) => c.tipo_conductor === "habitual"
      );
      if (habituales.length > 1) {
        return res
          .status(400)
          .json({
            error: "Solo puede existir un conductor habitual por vehículo",
          });
      }

      // b) Validar que el habitual (si viene) no sea habitual en OTRO vehículo
      if (habituales.length === 1) {
        const cedHab = Number(habituales[0].cedula_conductor);
        const conflicto = await prisma.conductor_vehiculo.findFirst({
          where: {
            cedula_conductor: cedHab,
            tipo_conductor: "habitual",
            placa_vehiculo: { not: placa }, // excluir el propio vehículo que estamos editando
          },
          select: { placa_vehiculo: true },
        });
        if (conflicto) {
          return res.status(400).json({
            error: `El conductor ${cedHab} ya es habitual del vehículo ${conflicto.placa_vehiculo}`,
          });
        }
      }

      // c) Transacción: actualizar vehículo + reemplazar conductores
      const actualizado = await prisma.$transaction(async (tx) => {
        // actualizar datos del vehículo
        const v = await tx.vehiculo.update({
          where: { placa },
          data: dataUpdate,
        });

        // eliminar asignaciones actuales
        await tx.conductor_vehiculo.deleteMany({
          where: { placa_vehiculo: placa },
        });

        // crear nuevas asignaciones (si el array viene vacío, queda sin conductores)
        if (conductores.length > 0) {
          await tx.conductor_vehiculo.createMany({
            data: conductores.map((c) => ({
              placa_vehiculo: placa,
              cedula_conductor: Number(c.cedula_conductor),
              tipo_conductor: c.tipo_conductor,
            })),
          });
        }

        // devolver con relaciones
        const completo = await tx.vehiculo.findUnique({
          where: { placa },
          include: {
            conductor_vehiculo: {
              select: {
                placa_vehiculo: true,
                cedula_conductor: true,
                tipo_conductor: true,
                usuario: { select: { cedula: true, nombre: true } },
              },
            },
          },
        });

        return completo;
      });

      return res.status(200).json(actualizado);
    }

    // 5) Si NO vienen conductores, solo actualizar datos del vehículo
    const actualizado = await prisma.vehiculo.update({
      where: { placa },
      data: dataUpdate,
      include: {
        conductor_vehiculo: {
          select: {
            placa_vehiculo: true,
            cedula_conductor: true,
            tipo_conductor: true,
            usuario: { select: { cedula: true, nombre: true } },
          },
        },
      },
    });

    return res.status(200).json(actualizado);
  } catch (error) {
    console.error("Error al editar vehículo:", error);
    return res.status(500).json({ error: "Error al editar el vehículo" });
  }
};

export const obtenerVehiculos = async (req, res) => {
  try {
    const vehiculos = await prisma.vehiculo.findMany({
      include: {
        conductor_vehiculo: {
          select: {
            placa_vehiculo: true,
            cedula_conductor: true,
            tipo_conductor: true,
            usuario: {
              select: {
                cedula: true,
                nombre: true,
              },
            },
          },
        },
      },
    });

    const vehiculosConConductor = vehiculos.map((vehiculo) => ({
      ...vehiculo,
      conductores: vehiculo.conductor_vehiculo.map((conductor) => ({
        cedula_conductor: conductor.cedula_conductor,
        tipo_conductor: conductor.tipo_conductor,
        usuario: conductor.usuario,
      })),
    }));

    res.status(200).json(vehiculosConConductor);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener vehiculos" });
  }
};

export const obtenerVehiculoPorRegistroInspeccion = async (req, res) => {
  try {
    const vehiculos = await prisma.vehiculo.findMany({
      include: {
        inspeccion_preoperacional: {
          select: {
            placa_vehiculo: true,
            cedula_conductor: true, 
            fecha: true,
            usuario: {
              select: {
                cedula: true,
                nombre: true
              }
            }
          }
        },
        
      }
    });
    res.status(200).json(vehiculos);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener vehiculos" });
  }
};

// GET /api/vehiculo/obtenerInspeccion?fecha=YYYY-MM-DD
export const obtenerVehiculosConInspeccionDeFecha = async (req, res) => {
  try {
    const fechaStr = (req.query.fecha ?? new Date().toISOString().slice(0,10)).trim();

    // Como tu columna es @db.Date, comparar por rango UTC del día es robusto
    const inicio = new Date(`${fechaStr}T00:00:00.000Z`);
    const fin    = new Date(`${fechaStr}T23:59:59.999Z`);

    const vehiculos = await prisma.vehiculo.findMany({
      // Filtra SOLO los que tienen inspección en ese día
      where: {
        inspeccion_preoperacional: {
          some: { fecha: { gte: inicio, lte: fin } }
        }
      },
      select: {
        placa: true,
        tipo_vehiculo: true,
        estado: true,
        inspeccion_preoperacional: {
          where: { fecha: { gte: inicio, lte: fin } },
          orderBy: { fecha: 'desc' },
          take: 1,
          select: {
            fecha: true,
            cedula_conductor: true,
            usuario: { select: { cedula: true, nombre: true } }
          }
        }
      }
    });

    const resp = vehiculos.map(v => {
      const ins = v.inspeccion_preoperacional[0]; 
      return {
        placa: v.placa,
        tipo_vehiculo: v.tipo_vehiculo,
        estado: v.estado,
        conductor_sugerido: {
          fuente: 'inspeccion',
          cedula: ins.usuario?.cedula ?? ins.cedula_conductor,
          nombre: ins.usuario?.nombre
        }
      };
    });

    return res.status(200).json(resp);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'Error al obtener vehículos' });
  }
};



export const obtenerVehiculoPorPlaca = async (req, res) => {
  try {
    const { placa } = req.params;
    const vehiculos = await prisma.vehiculo.findMany({
      where: {
        placa: placa,
      },
      include: {
        conductor_vehiculo: {
          select: {
            placa_vehiculo: true,
            cedula_conductor: true,
            tipo_conductor: true,
            usuario: {
              select: {
                cedula: true,
                nombre: true,
              },
            },
          },
        },
      },
    });

    const vehiculosConConductor = vehiculos.map((vehiculo) => ({
      ...vehiculo,
      conductores: vehiculo.conductor_vehiculo.map((conductor) => ({
        cedula_conductor: conductor.cedula_conductor,
        tipo_conductor: conductor.tipo_conductor,
        usuario: conductor.usuario,
      })),
    }));

    res.status(200).json(vehiculosConConductor);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Error al obtener vehiculo" });
  }
};
