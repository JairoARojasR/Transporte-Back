import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import rolRoutes from './routes/rolRoutes.js'
import usuarioRoutes from './routes/usuarioRoutes.js'
import vehiculoRoutes from './routes/vehiculoRoutes.js'
import conductor_vehiculoRoutes from './routes/conductor_vehiculoRoutes.js'
import inspeccionRoutes from './routes/inspeccionRoutes.js'
import solicitudesRoutes from './routes/solicitudRoutes.js'
import inicioSesionRoutes from './routes/inicioSesionRoutes.js'
import nodeCron from "node-cron";  
import { sincronizarUsuarios } from './controller/usuarioController.js';


dotenv.config();

const app = express();

const allowedOrigin = process.env.FRONTEND_ORIGIN || "http://localhost:3000";
app.use(cors({
  origin: allowedOrigin,
  credentials: true,
  methods: ["GET","POST","PUT","PATCH","DELETE","OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

// app.use( 
//   cors({
//     origin: "http://localhost:3000 ", 
//     credentials: true, 
//   })
// );
app.use(express.json()); 
app.use(cookieParser());


//rutas api
app.use("/api/rol", rolRoutes);
app.use("/api/usuario", usuarioRoutes);
app.use("/api/vehiculo", vehiculoRoutes);
app.use("/api/conductor", conductor_vehiculoRoutes);
app.use("/api/inspeccion", inspeccionRoutes);
app.use("/api/solicitud", solicitudesRoutes);
app.use("/api/inicio", inicioSesionRoutes);

// nodeCron.schedule('*/2 * * * *', async () => {
//   console.log("Ejecutando sincronización de usuarios...");
//   try {
//     await sincronizarUsuarios(); 
//     console.log("Sincronización de usuarios completada.");
//   } catch (error) {
//     console.error("Error al sincronizar usuarios automáticamente:", error);
//   }
// });

// nodeCron.schedule('0 0 */15 * *', async () => {
//   console.log("Ejecutando sincronización de usuarios...");
//   try {
//     await sincronizarUsuarios();  
//     console.log("Sincronización de usuarios completada.");
//   } catch (error) {
//     console.error("Error al sincronizar usuarios automáticamente:", error);
//   }
// });

async function iniciarServidor() {
  try {
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`Servidor corriendo en puerto ${PORT}`);
    });
  } catch (error) {
    console.error(error.message);
    process.exit(1); 
  }  
}

iniciarServidor();