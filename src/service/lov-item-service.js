const cloudinary = require("../app/config/cloudinary");
const prisma = require("../app/config/config");
const { ResponseError } = require("../utils/response/response");

class LovItemService {
  static async createLovItem(request) {
    const { name, type } = request.body;
    const file = request.file;

    if (!name || !type) {
      throw new ResponseError("Field name dan type wajib diisi", 400);
    }

    if (!file) {
      throw new ResponseError("Foto wajib diunggah", 400);
    }

    if (!["image/jpeg", "image/jpg", "image/png"].includes(file.mimetype)) {
      throw new ResponseError("Format foto harus JPG, JPEG, atau PNG", 400);
    }

    if (file.size > 2 * 1024 * 1024) {
      throw new ResponseError("Ukuran foto maksimal 2MB", 400);
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
        name,
        type,
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
    const { name, type } = request.body;

    const existingLovItem = await prisma.lovItem.findUnique({
      where: { id: Number(id) },
      select: { photo: true },
    });

    if (!existingLovItem)
      throw new ResponseError("LovItem tidak ditemukan", 404);

    if (
      request.file &&
      !["image/jpeg", "image/jpg", "image/png"].includes(request.file.mimetype)
    ) {
      throw new ResponseError("Format foto harus JPG, JPEG, atau PNG", 400);
    }

    if (request.file && request.file.size > 2 * 1024 * 1024) {
      throw new ResponseError("Ukuran foto maksimal 2MB", 400);
    }

    let photoUrl = existingLovItem.photo;
    if (request.file) {
      const uploadResult = await new Promise((resolve, reject) => {
        cloudinary.uploader
          .upload_stream({ folder: "lov-item" }, (error, result) => {
            if (error) reject(new ResponseError("Gagal mengunggah foto", 500));
            else resolve(result.secure_url);
          })
          .end(request.file.buffer);
      });

      photoUrl = uploadResult;
    }

    const result = await prisma.lovItem.update({
      where: { id: Number(id) },
      data: {
        name,
        type,
        photo: photoUrl,
      },
      select: { id: true, name: true, type: true, photo: true },
    });

    return result;
  }

  static async deleteLovItem(id) {
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
