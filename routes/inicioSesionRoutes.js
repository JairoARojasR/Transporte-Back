import express from 'express'
import { requireAuth } from '../middlewares/requireAuth.js';
import {iniciarSesion, cerrarSesion} from '../controller/inicioSesionController.js'

const router = express.Router();

router.post('/login' , iniciarSesion)
router.post('/logout', cerrarSesion)

router.get("/me", requireAuth, (req, res) => {
  return res.json({ usuario: req.user });
});

export default router;