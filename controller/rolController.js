import prisma from "../config/prisma.js";

export const crearRol = async (req, res) => {
  try {
    const { nombre_rol } = req.body;
    const nuevoRol = await prisma.rol.create({
      data: {
        nombre_rol,
      },
    });
    res.status(201).json(nuevoRol);
  } catch (error) {
    console.error("Error al crear rol:", error);
    res.status(500).json({ error: "Error al crear rol" });
  }
};

export const editarRol = async (req, res) => {
  try {
    const { id_rol } = req.params;
    const { nuevoNombre } = req.body;
    const id = Number(id_rol);
    const editarRol = await prisma.rol.update({
      where: {
        id_rol: id,
      },
      data: {
        nombre_rol: nuevoNombre,
      },
    });
    res.status(201).json(editarRol);
  } catch (error) {
    console.error("Error al editar rol:", error);
    res.status(500).json({ error: "Error al editar rol" });
  }
};

export const eliminarRol = async (req, res) => {
  try {
    const { id_rol } = req.params;
    const id = Number(id_rol);
    const eliminarRol = await prisma.rol.delete({
      where: {
        id_rol: id,
      },
    });
    res.status(201).json(eliminarRol);
  } catch (error) {
    console.error("Error al eliminar rol:", error);
    res.status(500).json({ error: "Error al eliminar rol" });
  }
};

export const obtenerRoles = async (req, res) => {
  try {
    const roles = await prisma.rol.findMany();
    res.status(200).json(roles);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
