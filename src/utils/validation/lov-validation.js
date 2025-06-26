const { z } = require("zod");

class LovValidation {
  static createLovSchema = z.object({
    name: z
      .string()
      .min(3, "Nama lov minimal 3 karakter")
      .max(20, "Nama lov maksimal 20 karakter")
      .refine((val) => !/\d/.test(val), {
        message: "Nama lov tidak boleh mengandung angka",
      }),
    type: z.enum(["VEGETABLE", "OTHER"], {
      errorMap: () => ({ message: "Tipe lov harus VEGETABLE atau OTHER" }),
    }),
  });

  static updateLovSchema = z.object({
    name: z
      .string()
      .min(3, "Nama lov minimal 3 karakter")
      .max(20, "Nama lov maksimal 20 karakter")
      .refine((val) => !/\d/.test(val), {
        message: "Nama lov tidak boleh mengandung angka",
      })
      .optional(),
    type: z
      .enum(["VEGETABLE", "OTHER"], {
        errorMap: () => ({ message: "Tipe lov harus VEGETABLE atau OTHER" }),
      })
      .optional(),
  });
}

module.exports = LovValidation;
