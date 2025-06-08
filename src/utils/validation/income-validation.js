const { z } = require("zod");

class IncomeValidation {
  static createIncomeDetailSchema = z.object({
    buyerName: z.string().min(1, "Nama pembeli wajib diisi"),
    quantityKg: z.number().positive("Quantity harus lebih dari 0"),
    pricePerKg: z.number().int().positive("Harga per kg harus lebih dari 0"),
    note: z.string().optional(),
  });

  static updateIncomeDetailSchema = z.object({
    buyerName: z.string().min(1, "Nama pembeli wajib diisi").optional(),
    quantityKg: z.number().positive("Quantity harus lebih dari 0").optional(),
    pricePerKg: z
      .number()
      .int()
      .positive("Harga per kg harus lebih dari 0")
      .optional(),
    note: z.string().optional(),
  });
}

module.exports = IncomeValidation;
