import express from 'express'
import {registroInspeccionPreoperacional, obtenerInspecciones , obtenerConductoresDeUnVehiculo} from '../controller/inspeccionController.js'

const router = express.Router();

router.get('/obtenerRegistros', obtenerInspecciones)
router.get('/obtenerConductoresVehiculo/:placa', obtenerConductoresDeUnVehiculo)
router.post('/registro' , registroInspeccionPreoperacional)

export default router;