import express from 'express'
import {crearVehiculo, obtenerVehiculos} from '../controller/vehiculoController.js'
import { requireAuth } from '../middlewares/requireAuth.js';

const router = express.Router();
router.post('/crearVehiculo', requireAuth, crearVehiculo)
router.get('/obtenerVehiculos', requireAuth, obtenerVehiculos)

export default router;