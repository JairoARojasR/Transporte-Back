import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import rolRoutes from './routes/rolRoutes.js'
import usuarioRoutes from './routes/usuarioRoutes.js'
import vehiculoRoutes from './routes/vehiculoRoutes.js'
import conductor_vehiculoRoutes from './routes/conductor_vehiculoRoutes.js'
import inspeccionRoutes from './routes/inspeccionRoutes.js'
import solicitudesRoutes from './routes/solicitudRoutes.js'

dotenv.config();

const app = express();
app.use( 
  cors({
    origin: "http://localhost:3000", 
    credentials: true, 
  })
);
app.use(express.json()); 

//rutas api
app.use("/api/rol", rolRoutes);
app.use("/api/usuario", usuarioRoutes);
app.use("/api/vehiculo", vehiculoRoutes);
app.use("/api/conductor", conductor_vehiculoRoutes);
app.use("/api/inspeccion", inspeccionRoutes);
app.use("/api/solicitud", solicitudesRoutes);

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