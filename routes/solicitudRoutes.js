import express from 'express';
import {crearSolicitud} from '../controller/solicitudesController.js';

const router = express.Router();
router.post('/crearSolicitud' , crearSolicitud);
export default router;
