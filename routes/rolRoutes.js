import express from 'express'
import {crearRol, obtenerRoles, editarRol, eliminarRol} from '../controller/rolController.js'

const router = express.Router();

router.get('/' , obtenerRoles);
router.post('/crearRol', crearRol);
router.put('/editarRol/:id_rol', editarRol);
router.delete('/eliminarRol/:id_rol', eliminarRol);

export default router;