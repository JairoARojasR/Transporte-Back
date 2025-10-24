import prisma from "../config/prisma.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export const iniciarSesion = async (req, res) => {
  try {
    const { correo, contrasenia } = req.body;
    console.log("Datos recibidos", correo, contrasenia);

    //validar campos
    if (!correo || !contrasenia) {
      return res
        .status(400)
        .json({ error: "El correo y la contraseña son obligatorias." });
    }

    //validar que el usuario exista
    const usuario = await prisma.usuario.findUnique({
      where: {
        correo,
      },
    });

    if (!usuario) {
      return res.status(401).json({
        error:
          "Credenciales inválidas.",
      });
    }

    //comparar contraseñas
    const ok = await bcrypt.compare(contrasenia, usuario.contrasenia);
    if (!ok) {
      return res.status(401).json({ error: "Credenciales inválidas." });
    }

    //generar token
    const token = jwt.sign(
      {
        sub: usuario.cedula,
        rol: usuario.id_rol,
      },

      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES || "15m" }
    );

    res.cookie('access_token', token, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 1000, // 1 hora
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
    httpOnly: false,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 0,
  });
  return res.status(200).json({ mensaje: "Sesión cerrada exitosamente." });
};
