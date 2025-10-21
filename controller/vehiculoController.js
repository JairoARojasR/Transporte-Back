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
        fecha_ultimo_mantenimiento,
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
    res.status(500).json({ error: "Error al crear el vehículo" });
  }
};

export const crearVehiculoDos = async (req, res) => {
  try {
    const {
      placa,
      tipo_vehiculo,
      capacidad,
      odometro,
      estado,
      fecha_ultimo_mantenimiento,
    } = req.body;
    const nuevoVehiculo = await prisma.vehiculo.create({
      data: {
        placa,
        tipo_vehiculo,
        capacidad,
        odometro,
        estado,
        fecha_ultimo_mantenimiento,
      },
    });
    res.status(201).json(nuevoVehiculo);
  } catch (error) {
    res.status(500).json({ error: "Error al crear el vehículo" });
  }
};

export const obtenerVehiculos = async (req, res) => {
  try {
    const vehiculos = await prisma.vehiculo.findMany({
      include: {
        conductor_vehiculo: true,
      },
    });
    res.status(200).json(vehiculos);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener vehiculos" });
  }
};
