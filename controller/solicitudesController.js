import prisma from "../config/prisma.js";

export const crearSolicitud = async (req, res) => {
  try {
    const {
      cedula_solicitante,
      placa_vehiculo,
      cedula_conductor,
      fecha,
      hora,
      origen,
      destino,
      estado,
      tipo_labor,
      prioridad,
      cantidad_pasajeros,
      equipo_o_carga,
      observaciones,
      hora_inicio_transporte,
      hora_fin_transporte,
    } = req.body;

    const crearSolicitud = await prisma.solicitud.create({
      data: {
        cedula_solicitante,
        placa_vehiculo,
        cedula_conductor,
        fecha,
        hora,
        origen,
        destino,
        estado,
        tipo_labor,
        prioridad,
        cantidad_pasajeros,
        equipo_o_carga,
        observaciones,
        hora_inicio_transporte,
        hora_fin_transporte,
      },
    });

    res.status(201).json(crearSolicitud);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al crear la solicitud" });
  }
};
