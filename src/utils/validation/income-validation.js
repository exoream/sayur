const { z } = require("zod");

class IncomeValidation {
  static createIncomeDetailSchema = z.object({
    buyerName: z
      .string()
      .min(1, "Nama pembeli wajib diisi")
      .refine((val) => !/\d/.test(val), {
        message: "Nama pembeli tidak boleh mengandung angka",
      }),
    quantityKg: z.number().positive("Quantity harus lebih dari 0"),
    pricePerKg: z.number().int().positive("Harga per kg harus lebih dari 0"),
    note: z.string().min(5, "Catatan minimal 5 karakter").optional(),
  });

  static updateIncomeDetailSchema = z.object({
    buyerName: z
      .string()
      .min(1, "Nama pembeli wajib diisi")
      .refine((val) => !/\d/.test(val), {
        message: "Nama pembeli tidak boleh mengandung angka",
      })
      .optional(),
    quantityKg: z.number().positive("Quantity harus lebih dari 0").optional(),
    pricePerKg: z
      .number()
      .int()
      .positive("Harga per kg harus lebih dari 0")
      .optional(),
    note: z.string().min(5, "Catatan minimal 5 karakter").optional(),
  });
}

module.exports = IncomeValidation;
