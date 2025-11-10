import express from 'express'
import {crearVehiculo, obtenerVehiculos, obtenerVehiculoPorPlaca, obtenerVehiculosConInspeccionDeFecha, editarVehiculoPorPlaca, obtenerVehiculoPorRegistroInspeccion} from '../controller/vehiculoController.js'
import { requireAuth } from '../middlewares/requireAuth.js';

const router = express.Router();
router.post('/crearVehiculo', crearVehiculo);
router.put('/editarVehiculo/:placa' , editarVehiculoPorPlaca);
router.get('/obtenerVehiculos', obtenerVehiculos);
router.get('/obtenerVehiculosInspeccion', obtenerVehiculoPorRegistroInspeccion);
router.get('/obtenerInspeccion', obtenerVehiculosConInspeccionDeFecha);
router.get('/obtenerVehiculo/:placa' , obtenerVehiculoPorPlaca);

export default router;