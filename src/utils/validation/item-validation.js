const { z } = require("zod");

class ItemValidation {
  static createItemSchema = z.object({
    name: z
      .string()
      .min(3, "Nama item wajib diisi")
      .max(20, "Nama item maksimal 20 karakter")
      .refine((val) => !/\d/.test(val), {
        message: "Nama item tidak boleh mengandung angka",
      }),
    type: z.enum(["VEGETABLE", "OTHER"], {
      errorMap: () => ({ message: "Tipe item harus VEGETABLE atau OTHER" }),
    }),
  });

  static updateItemSchema = z.object({
    name: z
      .string()
      .min(3, "Nama item wajib diisi")
      .max(20, "Nama item maksimal 20 karakter")
      .refine((val) => !/\d/.test(val), {
        message: "Nama item tidak boleh mengandung angka",
      })
      .optional(),
    type: z
      .enum(["VEGETABLE", "OTHER"], {
        errorMap: () => ({ message: "Tipe item harus VEGETABLE atau OTHER" }),
      })
      .optional(),
  });
}

module.exports = ItemValidation;
