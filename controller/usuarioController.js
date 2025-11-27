import prisma from "../config/prisma.js";
import bcrypt from "bcrypt";

export const crearUsuario = async (req, res) => {
  try {
    const { cedula, nombre, correo, contrasenia, telefono, id_rol } = req.body;
    const hash = await bcrypt.hash(contrasenia, 10);
    const nuevoUsuario = await prisma.usuario.create({
      data: {
        cedula,
        nombre,
        correo,
        contrasenia: hash,
        telefono,
        id_rol,
      },
    });
    res.status(201).json({
      cedula: nuevoUsuario.cedula,
      nombre: nuevoUsuario.nombre,
      correo: nuevoUsuario.correo,
      telefono: nuevoUsuario.telefono,
      id_rol: nuevoUsuario.id_rol,
    });
  } catch (error) {
    console.error("Error al crear usuario:", error);
    res.status(500).json({ error: "Error al crear usuario" });
  }
};

export const obtenerUsuarios = async (req, res) => {
  try {
    const usuarios = await prisma.usuario.findMany({
      select: {
        cedula: true,
        nombre: true,
        telefono: true,
        id_rol: true,
      },
    });
    res.status(200).json(usuarios);
  } catch (error) {
    console.error("Error al obtener usuarios:", error);
    res.status(500).json({ error: "Error al obtener usuarios" });
  }
};

export const obtenerUsuariosPorRol = async (req, res) => {
  try {
    const { id_rol } = req.params;
    const id = Number(id_rol);
    const usuarios = await prisma.usuario.findMany({
      where: {
        id_rol: id,
      },
      select: {
        cedula: true,
        nombre: true,
        id_rol: true,
      },
    });
    res.status(200).json(usuarios);
  } catch (error) {
    console.error("Error al obtener usuarios", error);
    res.status(500).json({ error: "Error al obtener usuarios" });
  }
};

export const obtenerConductores = async (req, res) => {
  try {
    const conductores = await prisma.usuario.findMany({
      where: {
        id_rol: 8,
      },
      select: {
        cedula: true,
        nombre: true,
        id_rol: true,
      },
    });
    res.status(200).json(conductores);
  } catch (error) {
    console.error("Error al obtener conductores", error);
    res.status(500).json({ error: "Error al obtener conductores" });
  }
};

export const sincronizarUsuarios = async (req, res) => {
  try {
    const empleados = await prisma.$queryRaw`
      SELECT cedula, nombre, correo, telefono
      FROM vehiculo.usuario
    `;

    const creados = [];
    const omitidos = [];

    for (const emp of empleados) {
      const existente = await prisma.usuario.findUnique({
        where: { cedula: emp.cedula },
      });

      if (existente) {
        omitidos.push(emp);
        console.log(` Usuario ya existe, omitido: ${emp.cedula}`);
        continue;
      }
      // const nombreSinEspacios = emp.nombre.replace(/\s+/g, "");
      // const contraseniaPlana = `${emp.cedula}_${nombreSinEspacios}`;
      // const primerNombre = emp.nombre.split(" ")[0];
      const primerNombre = emp.nombre.split(" ")[0];
      const primeraLetra = primerNombre.charAt(0).toLowerCase();
      const ultimos4DigitosCedula = String(emp.cedula).slice(-4);
      const contraseniaPlana = `${primeraLetra}${ultimos4DigitosCedula}`;
      const contraseniaHash = await bcrypt.hash(contraseniaPlana, 10);

      await prisma.usuario.create({
        data: {
          cedula: emp.cedula,
          nombre: emp.nombre,
          correo: emp.correo,
          telefono: emp.telefono,
          contrasenia: contraseniaHash,
          id_rol: 2,
        },
      });

      creados.push(emp);
      console.log(`Usuario creado: ${emp.cedula}`);
    }

    res.json({
      mensaje: "Sincronización completada",
      usuarios_creados: creados,
      usuarios_omitidos: omitidos,
    });
  } catch (error) {
    console.error("Error sincronizando empleados:", error);
    res.status(500).json({ error: "Error sincronizando empleados" });
  }
};


