import express from 'express'
import {crearUsuario, obtenerUsuarios, obtenerUsuariosPorRol, obtenerConductores} from '../controller/usuarioController.js'

const router = express.Router();

router.post('/crearUsuario', crearUsuario);
router.get('/obtenerUsuarios', obtenerUsuarios);
router.get('/obtenerConductores', obtenerConductores);
router.get('/obtenerUsuariosPorRol/:id_rol', obtenerUsuariosPorRol);
export default router;