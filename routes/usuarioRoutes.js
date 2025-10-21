import express from 'express'
import {crearUsuario, obtenerUsuarios} from '../controller/usuarioController.js'

const router = express.Router();

router.post('/crearUsuario', crearUsuario);
router.get('/obtenerUsuarios', obtenerUsuarios);

export default router;