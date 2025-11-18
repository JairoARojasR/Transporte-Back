import prisma from "../config/prisma.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export const iniciarSesion = async (req, res) => {
  try {
    const { cedula, contrasenia } = req.body;
    console.log("Datos recibidos", cedula, contrasenia);
    if (!cedula || !contrasenia) {
      return res
        .status(400)
        .json({ error: "la cédula y la contraseña son obligatorias." });
    }

    const usuario = await prisma.usuario.findUnique({
      where: {
        cedula,
      },
    });

    if (!usuario) {
      return res.status(401).json({
        error:
          "Credenciales inválidas.",
      });
    }

    const ok = await bcrypt.compare(contrasenia, usuario.contrasenia);
    if (!ok) {
      return res.status(401).json({ error: "Credenciales inválidas." });
    }

    const token = jwt.sign(
      {
        sub: usuario.cedula,
        rol: usuario.id_rol,
      },

      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES || "1d" }
    );

    res.cookie('access_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'none',
      maxAge: 8 * 60 * 60 * 1000, // 8 horas
      path: '/',
    })

    //enviar respuesta
    return res.status(200).json({
      mensaje: "Inicio de sesión exitoso.",
      token,
      usuario: {
        cedula: usuario.cedula,
        id_rol: usuario.id_rol,
      },
    });
  } catch (error) {
    console.error("Error en iniciarSesion:", error);
    return res.status(500).json({ error: "Error al iniciar sesión." });
  }
};

export const cerrarSesion = (req, res) => {
  res.clearCookie('access_token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'none',
    path: '/',
    maxAge: 0,
  });
  return res.status(200).json({ mensaje: "Sesión cerrada exitosamente." });
};
