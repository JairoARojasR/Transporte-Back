import prisma from "../config/prisma.js";

export const asignarConductorAVehiculo = async (req, res) => {
  try {
    const { placa_vehiculo, cedula_conductor, tipo_conductor } = req.body;

    const vehiculo = await prisma.vehiculo.findUnique({
      where: {
        placa: placa_vehiculo,
      },
    });

    const conductor = await prisma.usuario.findUnique({
      where: {
        cedula: cedula_conductor,
      },
    });

    if (!vehiculo) {
      return res.status(404).json({ error: "Vehículo no encontrado" });
    }

    if (!conductor) {
      return res.status(404).json({ error: "Conductor no encontrado" });
    }

    const asignacion = await prisma.conductor_vehiculo.create({
        data:{
            placa_vehiculo,
            cedula_conductor,
            tipo_conductor
        }
    });

    res.status(201).json(asignacion);

  } catch (error) {
    console.error("Error al asignar conductor a vehículo:", error);
    res.status(500).json({ error: "Error al asignar conductor a vehículo" });
  }
};

export const detalleAsignacion = async (req, res) => {
  try {
    const asignacion = await prisma.conductor_vehiculo.findMany()
    res.status(400).json(asignacion)
  } catch (error) {
    res.status(500).json({ error: "Error al obtener las asignaciones" });
  }
}
