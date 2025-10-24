import express from 'express';
import {crearSolicitud, editarSolicitud, obtenerSolicitudes} from '../controller/solicitudesController.js';

const router = express.Router();
router.get('/obtenerSolicitudes', obtenerSolicitudes)
router.post('/crearSolicitud' , crearSolicitud);
router.put('/editarSolicitud/:id_solicitud' , editarSolicitud);
export default router;
