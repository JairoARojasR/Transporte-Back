import express from 'express'
import {asignarConductorAVehiculo, detalleAsignacion} from '../controller/conductor_vehiculoController.js'

const router = express.Router();
router.post('/asignarconductor', asignarConductorAVehiculo);
router.get('/detalleAsignacion', detalleAsignacion)

export default router;