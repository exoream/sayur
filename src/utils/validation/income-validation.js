const { z } = require("zod");

class IncomeValidation {
  static createIncomeDetailSchema = z.object({
    buyerName: z
      .string()
      .min(1, "Nama pembeli wajib diisi")
      .max(30, "Nama pembeli maksimal 30 karakter")
      .refine((val) => !/\d/.test(val), {
        message: "Nama pembeli tidak boleh mengandung angka",
      }),
    quantityKg: z
      .number({ invalid_type_error: "Quantity harus berupa angka" })
      .positive("Quantity harus lebih dari 0")
      .refine((val) => val >= 1, {
        message: "Quantity minimal 1",
      })
      .refine((val) => val.toString().length <= 6, {
        message: "Quantity maksimal 6 digit",
      }),
    pricePerKg: z
      .number({ invalid_type_error: "Harga per kg harus berupa angka" })
      .positive("Harga per kg harus lebih dari 0")
      .refine((val) => val.toString().length >= 4, {
        message: "Harga per kg minimal 4 digit",
      })
      .refine((val) => val.toString().length <= 6, {
        message: "Harga per kg maksimal 6 digit",
      }),
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
