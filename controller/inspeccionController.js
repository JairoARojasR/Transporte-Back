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
    } = req.body;

    //verificar que la placa exista
    const validarPlaca = await prisma.vehiculo.findUnique({
      where: {
        placa: placa_vehiculo,
      },
    });

    if (!validarPlaca) {
      return res.status(404).json({ error: "Vehículo no encontrado" });
    }

    const registro = await prisma.inspeccion_preoperacional.create({
      data: {
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
      },
    });
    res.status(201).json(registro);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al crear la inspección" });
  }
};

export const obtenerInspecciones = async (req, res) => {
  try {
    const inspecciones = await prisma.inspeccion_preoperacional.findMany({
      include:{
        usuario:{
          select: {
            cedula: true,
            nombre:true
          }
        }
      }
    });
    res.status(200).json(inspecciones);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener vehiculos" });
  }
};
