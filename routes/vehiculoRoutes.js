import express from 'express'
import {crearVehiculo, obtenerVehiculos} from '../controller/vehiculoController.js'
import { requireAuth } from '../middlewares/requireAuth.js';

const router = express.Router();
router.post('/crearVehiculo', crearVehiculo)
router.get('/obtenerVehiculos', obtenerVehiculos)

export default router;