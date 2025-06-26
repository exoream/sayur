const cloudinary = require("../app/config/cloudinary");
const prisma = require("../app/config/config");
const { ResponseError } = require("../utils/response/response");
const LovValidation = require("../utils/validation/lov-validation");
const Validation = require("../utils/validation/validation");


class LovItemService {
  static async createLovItem(request) {
    const file = request.file;

    const validated = Validation.validate(
      LovValidation.createLovSchema,
      request.body
    );

    // Validasi file foto
    if (!file) {
      throw new ResponseError("Foto wajib diunggah", 400);
    }

    if (!["image/jpeg", "image/jpg", "image/png"].includes(file.mimetype)) {
      throw new ResponseError("Format foto harus JPG, JPEG, atau PNG", 400);
    }

    if (file.size > 5 * 1024 * 1024) {
      throw new ResponseError("Ukuran foto maksimal 5MB", 400);
    }

    const photoUrl = await new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream({ folder: "lov-item" }, (error, result) => {
          if (error) reject(new ResponseError("Gagal mengunggah foto", 500));
          else resolve(result.secure_url);
        })
        .end(file.buffer);
    });

    const newLov = await prisma.lovItem.create({
      data: {
        name: validated.name,
        type: validated.type,
        photo: photoUrl,
      },
      select: { id: true, name: true, type: true, photo: true },
    });

    return newLov;
  }

  static async getAllLovItems() {
    const lovs = await prisma.lovItem.findMany({
      orderBy: { createdAt: "desc" },
    });

    return lovs;
  }

  static async getLovItemById(id) {
    const lov = await prisma.lovItem.findUnique({
      where: { id: Number(id) },
    });

    if (!lov) {
      throw new ResponseError("LovItem tidak ditemukan", 404);
    }

    return lov;
  }

  static async updateLovItem(request) {
    const { id } = request.params;
    const file = request.file;

    const validated = Validation.validate(
      LovValidation.updateLovSchema,
      request.body
    );

    const existingLovItem = await prisma.lovItem.findUnique({
      where: { id: Number(id) },
      select: { photo: true },
    });

    if (!existingLovItem)
      throw new ResponseError("LovItem tidak ditemukan", 404);

    // Validasi file jika ada
    if (
      file &&
      !["image/jpeg", "image/jpg", "image/png"].includes(file.mimetype)
    ) {
      throw new ResponseError("Format foto harus JPG, JPEG, atau PNG", 400);
    }

    if (file && file.size > 5 * 1024 * 1024) {
      throw new ResponseError("Ukuran foto maksimal 5MB", 400);
    }

    let photoUrl = existingLovItem.photo;
    if (file) {
      const uploadResult = await new Promise((resolve, reject) => {
        cloudinary.uploader
          .upload_stream({ folder: "lov-item" }, (error, result) => {
            if (error) reject(new ResponseError("Gagal mengunggah foto", 500));
            else resolve(result.secure_url);
          })
          .end(file.buffer);
      });

      photoUrl = uploadResult;
    }

    const result = await prisma.lovItem.update({
      where: { id: Number(id) },
      data: {
        name: validated.name,
        type: validated.type,
        photo: photoUrl,
      },
      select: { id: true, name: true, type: true, photo: true },
    });

    return result;
  }

  static async deleteLovItem(req) {
    const { id } = req.params;
    const existing = await prisma.lovItem.findUnique({
      where: { id: Number(id) },
    });

    if (!existing) {
      throw new ResponseError("LovItem tidak ditemukan", 404);
    }

    await prisma.lovItem.delete({
      where: { id: Number(id) },
    });
  }
}

module.exports = LovItemService;
