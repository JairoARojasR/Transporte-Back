import express from 'express';
import {crearSolicitud, editarSolicitud, obtenerSolicitudes , obtenerSolicitudPorId} from '../controller/solicitudesController.js';

const router = express.Router();
router.get('/obtenerSolicitudes', obtenerSolicitudes)
router.get('/obtenerSolicitud/:id', obtenerSolicitudPorId)
router.post('/crearSolicitud' , crearSolicitud);
router.put('/editarSolicitud/:id_solicitud' , editarSolicitud);
export default router;
