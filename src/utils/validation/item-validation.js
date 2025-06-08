const { z } = require("zod");

class ItemValidation {
  static createItemSchema = z.object({
    name: z.string().min(1, "Nama item wajib diisi"),
    type: z.enum(["VEGETABLE", "OTHER"], {
      errorMap: () => ({ message: "Tipe item harus VEGETABLE atau OTHER" }),
    }),
  });

  static updateItemSchema = z.object({
    name: z.string().min(1, "Nama item wajib diisi").optional(),
    type: z.enum(["VEGETABLE", "OTHER"], {
      errorMap: () => ({ message: "Tipe item harus VEGETABLE atau OTHER" }),
    }).optional(),
  });
}

module.exports = ItemValidation;
