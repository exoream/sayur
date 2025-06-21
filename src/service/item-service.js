const ItemValidation = require("../utils/validation/item-validation");
const Validation = require("../utils/validation/validation");
const cloudinary = require("../app/config/cloudinary");
const prisma = require("../app/config/config");
const { ResponseError } = require("../utils/response/response");

class ItemService {
  static async createItem(request) {
    const item = Validation.validate(
      ItemValidation.createItemSchema,
      request.body
    );

    const userId = request.user.id;

    if (
      request.file &&
      !["image/jpeg", "image/jpg", "image/png"].includes(request.file.mimetype)
    ) {
      throw new ResponseError("Format foto harus JPG, JPEG, atau PNG", 400);
    }

    if (request.file && request.file.size > 5 * 1024 * 1024) {
      throw new ResponseError("Ukuran foto maksimal 5MB", 400);
    }

    // Upload foto ke Cloudinary
    let photoUrl = null;
    if (request.file) {
      const uploadResult = await new Promise((resolve, reject) => {
        cloudinary.uploader
          .upload_stream({ folder: "porters" }, (error, result) => {
            if (error) reject(new ResponseError("Gagal mengunggah foto", 500));
            else resolve(result.secure_url);
          })
          .end(request.file.buffer);
      });

      photoUrl = uploadResult;
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new ResponseError("User tidak ditemukan", 404);
    }

    // Cek Item yang sudah ada
    const existingItem = await prisma.item.findFirst({
      where: {
        name: item.name,
        userId: userId,
      },
    });

    if (existingItem) {
      throw new ResponseError("Item dengan nama ini sudah ada", 400);
    }

    // Siapkan data untuk insert
    const data = {
      name: item.name,
      type: item.type,
      userId: userId,
    };

    if (photoUrl) {
      data.photo = photoUrl;
    }

    const result = await prisma.item.create({
      data,
      select: {
        id: true,
        name: true,
        type: true,
        photo: true,
      },
    });

    return result;
  }

  static async getItems(request) {
    const userId = request.user.id;

    const items = await prisma.item.findMany({
      where: { userId: userId },
      select: {
        id: true,
        name: true,
        type: true,
        photo: true,
      },
    });

    const vegetables = items.filter((item) => item.type === "VEGETABLE");
    const others = items.filter((item) => item.type === "OTHER");

    return {
      vegetables: vegetables,
      others: others,
    };
  }

  static async updateItem(request) {
    const itemId = request.params.id;
    const itemData = Validation.validate(
      ItemValidation.updateItemSchema,
      request.body
    );

    const userId = request.user.id;
    const item = await prisma.item.findUnique({
      where: { id: Number(itemId), userId: userId },
    });

    if (!item) {
      throw new ResponseError("Item tidak ditemukan", 404);
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

    let photoUrl = item.photo;
    if (request.file) {
      const uploadResult = await new Promise((resolve, reject) => {
        cloudinary.uploader
          .upload_stream({ folder: "porters" }, (error, result) => {
            if (error) reject(new ResponseError("Gagal mengunggah foto", 500));
            else resolve(result.secure_url);
          })
          .end(request.file.buffer);
      });

      photoUrl = uploadResult;
    }

    const updatedItem = await prisma.item.update({
      where: { id: Number(itemId), userId: userId },
      data: {
        name: itemData.name,
        type: itemData.type,
        photo: photoUrl,
      },
      select: {
        id: true,
        name: true,
        type: true,
        photo: true,
      },
    });

    return updatedItem;
  }

  static async deleteItem(request) {
    const itemId = request.params.id;
    const userId = request.user.id;

    const item = await prisma.item.findUnique({
      where: { id: Number(itemId), userId: userId },
    });

    if (!item) {
      throw new ResponseError("Item tidak ditemukan", 404);
    }

    await prisma.item.delete({
      where: { id: Number(itemId), userId: userId },
    });
  }
}


module.exports = ItemService;