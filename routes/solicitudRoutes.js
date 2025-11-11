import express from 'express';
import prisma from "../config/prisma.js";

import {crearSolicitud, editarSolicitud, obtenerSolicitudes , obtenerSolicitudPorId, obtenerSolicitudesPorConductor, obtenerSolicitudesSolicitante, obtenerSolicitudesPorConductorJson} from '../controller/solicitudesController.js';
import { requireAuth } from '../middlewares/requireAuth.js';
const router = express.Router();
router.get('/obtenerSolicitudes', obtenerSolicitudes)
router.get('/obtenerSolicitud/:id', obtenerSolicitudPorId)
router.post('/crearSolicitud' , crearSolicitud);
router.put('/editarSolicitud/:id_solicitud' , editarSolicitud);
router.get('/prueba/:cedula', obtenerSolicitudesPorConductorJson)
router.get('/misSolicitudes', requireAuth, obtenerSolicitudesPorConductor)
router.get('/misSolicitudesSolicitante', requireAuth, obtenerSolicitudesSolicitante)

export default router;
