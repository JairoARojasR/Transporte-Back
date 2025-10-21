import prisma from "../config/prisma.js";

export const crearUsuario = async (req, res) => {
  try {
    const { cedula, nombre, correo, contrasenia, telefono, id_rol } = req.body;
    const nuevoUsuario = await prisma.usuario.create({
      data: {
        cedula,
        nombre,
        correo,
        contrasenia,
        telefono,
        id_rol,
      },
    });
    res.status(201).json(nuevoUsuario);
  } catch (error) {
    console.error("Error al crear usuario:", error);
    res.status(500).json({ error: "Error al crear usuario" });
  }
};

export const obtenerUsuarios = async (req, res) => {
  try {
    const usuarios = await prisma.usuario.findMany();
    res.status(200).json(usuarios);
  } catch (error) {
    console.error("Error al obtener usuarios:", error);
    res.status(500).json({ error: "Error al obtener usuarios" });
  }
};
