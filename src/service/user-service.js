const prisma = require("../app/config/config");
const { createToken } = require("../utils/middleware/jwt");
const { ResponseError } = require("../utils/response/response");
const UserValidation = require("../utils/validation/user-validation");
const Validation = require("../utils/validation/validation");
const cloudinary = require("../app/config/cloudinary");
const bcrypt = require("bcrypt");

class UserService {
  static async register(request) {
    const user = Validation.validate(UserValidation.registerSchema, request);

    const existingUser = await prisma.user.findUnique({
      where: {
        email: user.email,
      },
    });
    if (existingUser) {
      throw new ResponseError("Email sudah terdaftar", 400);
    }

    user.password = await bcrypt.hash(user.password, 10);

    const result = await prisma.user.create({
      data: user,
      select: {
        id: true,
        name: true,
        email: true,
      },
    });

    return result;
  }

  static async login(request) {
    const user = Validation.validate(UserValidation.loginSchema, request);

    const existingUser = await prisma.user.findUnique({
      where: {
        email: user.email,
      },
      select: {
        id: true,
        email: true,
        password: true,
        role: true,
      },
    });

    if (!existingUser) {
      throw new ResponseError("Email tidak terdaftar", 400);
    }

    const isPasswordValid = await bcrypt.compare(
      user.password,
      existingUser.password
    );

    if (!isPasswordValid) {
      throw new ResponseError("Username atau password salah", 400);
    }

    const token = createToken(existingUser.id, existingUser.role);

    return {
      id: existingUser.id,
      email: existingUser.email,
      token: token,
    };
  }

  static updateProfile = async (request) => {
    const userId = request.user.id;

    const user = Validation.validate(
      UserValidation.updateProfileSchema,
      request.body
    );

    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!existingUser) {
      throw new ResponseError("User tidak ditemukan", 404);
    }

    if (user.email) {
      const existingEmail = await prisma.user.findFirst({
        where: {
          email: user.email,
          id: {
            not: userId,
          },
        },
      });

      if (existingEmail) {
        throw new ResponseError("Email sudah terdaftar", 400);
      }
    }

    if (
      request.file &&
      !["image/jpeg", "image/jpg", "image/png"].includes(request.file.mimetype)
    ) {
      throw new ResponseError("Format foto harus JPG, JPEG, atau PNG", 400);
    }

    if (request.file && request.file.size > 5 * 1024 * 1024) {
      throw new ResponseError("Ukuran foto maksimal 5MB", 400);
    }

    let photoUrl = existingUser.photo;
    if (request.file) {
      const uploadResult = await new Promise((resolve, reject) => {
        cloudinary.uploader
          .upload_stream({ folder: "users" }, (error, result) => {
            if (error) reject(new ResponseError("Gagal mengunggah foto", 500));
            else resolve(result.secure_url);
          })
          .end(request.file.buffer);
      });

      photoUrl = uploadResult;
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        name: user.name,
        email: user.email,
        photo: photoUrl,
      },
      select: {
        id: true,
        name: true,
        email: true,
        photo: true,
      },
    });

    return updatedUser;
  };

  static async getProfile(request) {
    const userId = request.user.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        photo: true,
      },
    });

    if (!user) {
      throw new ResponseError("User tidak ditemukan", 404);
    }

    return user;
  }

  static async updatePassword(request) {
    const userId = request.user.id;

    const { old_password: oldPassword, new_password: newPassword } =
      request.body;

    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!existingUser) {
      throw new ResponseError("User tidak ditemukan", 404);
    }

    const isPasswordValid = await bcrypt.compare(
      oldPassword,
      existingUser.password
    );

    if (!isPasswordValid) {
      throw new ResponseError("Password lama salah", 400);
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { password: hashedNewPassword },
      select: {
        id: true,
        name: true,
        email: true,
        photo: true,
      },
    });

    return updatedUser;
  }

  static async getAllUsers(request) {
    const { page, limit, search } = request.query;
    const pageNumber = parseInt(page) || 1;
    const limitNumber = parseInt(limit) || 10;

    const filter = search
      ? {
          OR: [
            {
              name: {
                contains: search,
              },
            },
            {
              email: {
                contains: search,
              },
            },
          ],
        }
      : {};

    const totalData = await prisma.user.count({
      where: filter,
    });

    const result = await prisma.user.findMany({
      where: filter,
      skip: (pageNumber - 1) * limitNumber,
      take: limitNumber,
      select: {
        id: true,
        name: true,
        email: true,
        photo: true,
      },
    });

    const lastPage = Math.ceil(totalData / limitNumber);

    return {
      users: result,
      pagination: {
        limit: limitNumber,
        currentPage: pageNumber,
        lastPage: lastPage,
        totalData: totalData,
      },
    };
  }

  static async getUserById(request) {
    const { id } = request.params;

    const user = await prisma.user.findUnique({
      where: { id: Number(id) },
      select: {
        id: true,
        name: true,
        email: true,
        photo: true,
      },
    });

    if (!user) {
      throw new ResponseError("User tidak ditemukan", 404);
    }

    return user;
  }
}

module.exports = UserService;
