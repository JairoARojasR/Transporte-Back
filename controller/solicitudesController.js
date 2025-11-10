import prisma from "../config/prisma.js";
import { requireAuth } from "../middlewares/requireAuth.js";


export const crearSolicitud = async (req, res) => {
  try {
    const {
      cedula_solicitante,
      telefono,
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

    const horaFormateada = new Date(`1970-01-01T${hora}:00Z`).toISOString();

    const crearSolicitud = await prisma.solicitud.create({
      data: {
        cedula_solicitante,
        telefono,
        //placa_vehiculo,
        //cedula_conductor,
        fecha: new Date(fecha),
        hora: horaFormateada,
        origen,
        destino,
        estado,
        tipo_labor,
        prioridad,
        cantidad_pasajeros,
        equipo_o_carga,
        observaciones,
        //hora_inicio_transporte:horaFormateada,
        //hora_fin_transporte: horaFormateada,
      },
    });

    res.status(201).json(crearSolicitud);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al crear la solicitud" });
  }
};

export const editarSolicitud = async (req, res) => {
  try {
    const { id_solicitud } = req.params;
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

    const ahora = new Date();
    const horaInicio = new Date(
      Date.UTC(
        1970,
        0,
        1,
        ahora.getHours(),
        ahora.getMinutes(),
        ahora.getSeconds()
      )
    );

    const id = Number(id_solicitud);
    const editarSolicitud = await prisma.solicitud.update({
      where: {
        id_solicitud: id,
      },
      data: {
        placa_vehiculo,
        cedula_conductor,
        estado,
        hora_inicio_transporte: horaInicio,
      },
    });

    res.status(201).json(editarSolicitud);
  } catch (error) {
    console.error("Error al editar la solicitud:", error);
    res.status(500).json({ error: "Error al editar la solicitud" });
  }
};

export const obtenerSolicitudes = async (req, res) => {
  try {
    const solicitud = await prisma.solicitud.findMany({
      include: {
        usuario_solicitud_cedula_solicitanteTousuario: {
          select: {
            nombre: true,
            telefono: true,
            correo: true,
          },
        },
        usuario_solicitud_cedula_conductorTousuario: {
          select: {
            nombre: true,
            telefono: true,
            correo: true,
          },
        },
        vehiculo: {
          select: {
            tipo_vehiculo: true,
          },
        },
      },
    });
    res.status(200).json(solicitud);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const obtenerSolicitudPorId = async (req, res) => {
  const { id } = req.params;
  const id_sol = Number(id);
  try {
    const solicitud = await prisma.solicitud.findMany({
      where: {
        id_solicitud: id_sol,
      },
      include: {
        usuario_solicitud_cedula_solicitanteTousuario: {
          select: {
            nombre: true,
            telefono: true,
            correo: true,
          },
        },
        usuario_solicitud_cedula_conductorTousuario: {
          select: {
            nombre: true,
            telefono: true,
            correo: true,
          },
        },
        vehiculo: {
          select: {
            tipo_vehiculo: true,
          },
        },
      },
    });
    res.status(200).json(solicitud);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const obtenerSolicitudesPorConductor = async (req, res) => {
  try {
    const cedulaRaw = req.user.sub;
    const cedula = Number(cedulaRaw);
    if (!cedula || Number.isNaN(cedula)) {
      return res.status(401).json({ error: "Token sin cédula válida" });
    }
    const solicitudes = await prisma.solicitud.findMany({
      where: { cedula_conductor: cedula },
      orderBy: { id_solicitud: "desc" },
    });

    return res.status(200).json(solicitudes);
  } catch (error) {
    console.error("obtenerSolicitudesPorConductor:", error);
    return res.status(500).json({ error: "Error al obtener solicitudes" });
  }
};



export const obtenerSolicitudesPorConductorDos = async (req, res) => {
  try {
    const { cedula } = req.params;
    const cedulaNumber = Number(cedula);
    const solicitudes = await prisma.solicitud.findMany({
      where: {
        cedula_conductor: cedulaNumber,
      },
    });
    res.status(200).json(solicitudes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
