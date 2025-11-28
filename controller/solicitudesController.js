import prisma from "../config/prisma.js";
import * as XLSX from "xlsx";
import { formatearFecha, formatearHora, formatearDuracion } from "../utils/formatearFecha.js";

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
    console.log("Hora inicio transporte recibido:", horaFormateada);

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

    console.log("Hora inicio transporte recibido:", horaFormateada);

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
      placa_vehiculo,
      cedula_conductor,
      estado,
      hora_inicio_transporte,
      hora_fin_transporte,
      hora_total,
      tipo_incidente,
      gravedad,
      descripcion_incidente,
      puede_continuar,
    } = req.body;

    const id = Number(id_solicitud);

    
    const solicitudActualizada = await prisma.solicitud.update({
      where: { id_solicitud: id },
      data: {
        placa_vehiculo,
        cedula_conductor,
        estado,
        hora_inicio_transporte,
        hora_fin_transporte,
        hora_total,
        tipo_incidente,
        gravedad,
        descripcion_incidente,
        puede_continuar,
      },
    });

    
    if (solicitudActualizada.placa_vehiculo) {
      let nuevoEstadoVehiculo = null;

      if (estado === "asignada" || estado === "aceptada") {
        nuevoEstadoVehiculo = "asignado";
      }

      if (estado === "pendiente" || estado === "finalizada") {
        nuevoEstadoVehiculo = "disponible";
      }

      if (nuevoEstadoVehiculo) {
        await prisma.vehiculo.update({
          where: { placa: solicitudActualizada.placa_vehiculo },
          data: { estado: nuevoEstadoVehiculo },
        });
      }
    }

    res.status(200).json(solicitudActualizada);
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
            estado: true,
          },
        },
      },
      orderBy: { id_solicitud: "desc" },
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
    console.log("info", error);
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

    return res.status(200).json(solicitudes);
  } catch (error) {
    console.error("obtenerSolicitudesPorConductor:", error);
    return res.status(500).json({ error: "Error al obtener solicitudes" });
  }
};

export const obtenerSolicitudesSolicitante = async (req, res) => {
  try {
    const cedulaRaw = req.user.sub;
    const cedula = Number(cedulaRaw);
    if (!cedula || Number.isNaN(cedula)) {
      return res.status(401).json({ error: "Token sin cédula válida" });
    }

    const solicitudes = await prisma.solicitud.findMany({
      where: {
        cedula_solicitante: cedula,
      },
      orderBy: { id_solicitud: "desc" },
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

    res.status(200).json(solicitudes);
  } catch (error) {
    console.error("obtenerSolicitudesPorSolicitante:", error);
    return res.status(500).json({ error: "Error al obtener solicitudes" });
  }
};

export const obtenerSolicitudesPorConductorJson = async (req, res) => {
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

export const obtenerSolicitudesPorSolicitanteJson = async (req, res) => {
  try {
    const { cedula } = req.params;
    const cedulaNumber = Number(cedula);
    const solicitudes = await prisma.solicitud.findMany({
      where: {
        cedula_solicitante: cedulaNumber,
      },
    });
    res.status(200).json(solicitudes);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
};

export const actualizarEstadoVehiculo = async (req, res) => {
  try {
    const { placa, estado } = req.body; 

    if (!placa || !estado) {
      return res.status(400).json({ error: "Placa y estado son obligatorios" });
    }

    
    const vehiculoActualizado = await prisma.vehiculo.update({
      where: { placa },
      data: { estado }, 
    });

    res.status(200).json(vehiculoActualizado); 
  } catch (error) {
    console.error("Error al actualizar el estado del vehículo:", error);
    res
      .status(500)
      .json({ error: "Error al actualizar el estado del vehículo" });
  }
};

export const exportarSolicitudesExcel = async (req, res) => {
  try {
    const { fechaInicio, fechaFin } = req.query;

    if (!fechaInicio) {
      return res
        .status(400)
        .json({ error: "fechaInicio es requerida en el query param" });
    }

    const fechaInicioDate = new Date(fechaInicio);
    const fechaFinDate = fechaFin ? new Date(fechaFin) : new Date(fechaInicio);


    const solicitudes = await prisma.solicitud.findMany({
      where: {
        fecha: {
          gte: fechaInicioDate,
          lte: fechaFinDate,
        },
      },
      include: {
        usuario_solicitud_cedula_solicitanteTousuario: {
          select: {
            nombre: true,
          },
        },
        usuario_solicitud_cedula_conductorTousuario: {
          select: {
            nombre: true,
          },
        },
        vehiculo: {
          select: {
            placa: true,
          },
        },
      },
      orderBy: {
        fecha: "asc",
      },
    });

    const filas = solicitudes.map((s) => ({
      Fecha: s.fecha ? formatearFecha(s.fecha) : "N/A",
      Origen: s.origen || "",
      Destino: s.destino || "",
      Solicitante:
        s.usuario_solicitud_cedula_solicitanteTousuario?.nombre || "",
      Equipo_o_carga: s.equipo_o_carga || "",
      Tipo_labor: s.tipo_labor || "",
      Vehiculo_asignado: s.vehiculo && s.vehiculo.placa ? s.vehiculo.placa : "N/A",
      Conductor_asignado:
        s.usuario_solicitud_cedula_conductorTousuario.nombre || "",
      Observaciones: s.observaciones || "",
      Hora_inicio_transporte: s.hora_inicio_transporte
        ? formatearHora(s.hora_inicio_transporte)
        : "N/A",
      Hora_fin_transporte: s.hora_fin_transporte
        ? formatearHora(s.hora_fin_transporte)
        : "N/A",
      Hora_total: s.hora_total 
        ? formatearDuracion(s.hora_total)
        : "N/A"
    }));

    
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(filas);

    XLSX.utils.book_append_sheet(workbook, worksheet, "Solicitudes");

    const buffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "buffer",
    });

    const nombreArchivo = fechaFin
      ? `solicitudes_${fechaInicio}_a_${fechaFin}.xlsx`
      : `solicitudes_${fechaInicio}.xlsx`;

    
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${nombreArchivo}"`
    );
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );

    return res.send(buffer);
  } catch (error) {
    console.error("Error exportando solicitudes a Excel:", error);
    return res.status(500).json({ error: "Error exportando solicitudes" });
  }
};
