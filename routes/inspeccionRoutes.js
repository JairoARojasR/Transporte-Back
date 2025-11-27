import express from 'express'
import {registroInspeccionPreoperacional, obtenerInspecciones , obtenerConductoresDeUnVehiculo, ActualizarEstadoInspeccion, obtenerInspeccionPorId} from '../controller/inspeccionController.js'

const router = express.Router();
router.get('/obtenerRegistros', obtenerInspecciones)
router.get('/obtenerConductoresVehiculo/:placa', obtenerConductoresDeUnVehiculo)
router.get('/obtenerRegistroInspeccion/:id', obtenerInspeccionPorId)
router.post('/registro' , registroInspeccionPreoperacional)
router.put('/actualizar-estado/:id_inspeccion',ActualizarEstadoInspeccion)


export default router;