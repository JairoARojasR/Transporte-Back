import express from 'express'
import {registroInspeccionPreoperacional, obtenerInspecciones} from '../controller/inspeccionController.js'

const router = express.Router();

router.get('/obtenerRegistros', obtenerInspecciones)
router.post('/registro' , registroInspeccionPreoperacional)

export default router;