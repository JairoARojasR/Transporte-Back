import prisma from "../config/prisma.js";

export const registroInspeccionPreoperacional = async (req, res) => {
  try {
    const {
      placa_vehiculo,
      cedula_conductor,
      fecha,

      descanso_adecuando,
      consumo_alcohol,
      medicamentos_que_afecten_conduccion,
      condiciones_fisicas_mentales,
      soat_vigente,
      tecnico_mecanica,

      estado_llantas,
      estado_luces,
      estado_frenos,
      nivel_combustible,
      observaciones,
    } = req.body;

    // 1. validar que la placa exista
    const validarPlaca = await prisma.vehiculo.findUnique({
      where: { placa: placa_vehiculo },
    });

    if (!validarPlaca) {
      return res.status(404).json({ error: "Vehículo no encontrado" });
    }

    // 2. Crear la inspección
    const registro = await prisma.inspeccion_preoperacional.create({
      data: {
        placa_vehiculo,
        cedula_conductor,
        fecha: new Date(fecha),
        descanso_adecuando,
        consumo_alcohol,
        medicamentos_que_afecten_conduccion,
        condiciones_fisicas_mentales,
        soat_vigente,
        tecnico_mecanica,
        estado_llantas,
        estado_luces,
        estado_frenos,
        nivel_combustible,
        observaciones,
      },
    });

    const hayProblemasGraves =
      descanso_adecuando === false ||
      consumo_alcohol === true ||
      medicamentos_que_afecten_conduccion === true ||
      condiciones_fisicas_mentales === false ||
      soat_vigente === false ||
      tecnico_mecanica === false ||
      estado_llantas === "malo" ||
      estado_luces === "malo" ||
      estado_frenos === "malo" ||
      nivel_combustible === "bajo";

    const nuevoEstado = hayProblemasGraves ? "no_disponible" : "disponible";

    await prisma.vehiculo.update({
      where: { placa: placa_vehiculo },
      data: {
        estado: nuevoEstado,
      },
    });

    return res.status(201).json({
      mensaje: "Inspección registrada correctamente",
      inspeccion: registro,
      estado_vehiculo_actualizado: nuevoEstado,
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Error al crear la inspección" });
  }
};


export const obtenerInspecciones = async (req, res) => {
  try {
    const inspecciones = await prisma.inspeccion_preoperacional.findMany({
      include: {
        usuario: {
          select: {
            cedula: true,
            nombre: true,
          },
        },
        vehiculo: {
          select: {
            placa: true,
            tipo_vehiculo: true,
            estado: true,
          },
        },
      },
      orderBy: {id_inspeccion: "desc"}
    });
    res.status(200).json(inspecciones);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener vehiculos" });
  }
};

export const obtenerInspeccionPorId = async (req, res) => {
  try {
    const { id } = req.params;
    const idInsp = Number(id);
    const inspeccion = await prisma.inspeccion_preoperacional.findMany({
      where: {
        id_inspeccion: idInsp,
      },
      include: {
        usuario: {
          select: {
            cedula: true,
            nombre: true,
          },
        },
        vehiculo: {
          select: {
            placa: true,
            tipo_vehiculo: true,
            estado: true,
          },
        },
      },
    });

    res.status(200).json(inspeccion);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Error al obtener inspeccion" });
  }
};

export const obtenerConductoresDeUnVehiculo = async (req, res) => {
  try {
    const { placa } = req.params;
    const vehiculo = await prisma.vehiculo.findMany({
      where: {
        placa: placa,
      },
      include: {
        conductor_vehiculo: true,
      },
    });

    res.status(200).json(vehiculo);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Error al obtener conductores" });
  }
};
