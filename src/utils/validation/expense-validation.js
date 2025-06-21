const { z } = require("zod");

class ExpenseValidation {
  static vegetableDetailSchema = z.object({
    farmerName: z
      .string()
      .min(1, "Nama petani wajib diisi")
      .refine((val) => !/\d/.test(val), {
        message: "Nama petani tidak boleh mengandung angka",
      }),
    phone: z
      .string()
      .min(10, "Nomor HP minimal 10 digit")
      .max(15, "Nomor HP maksimal 15 digit")
      .optional(),
    address: z.string().min(5, "Alamat minimal 5 karakter").optional(),
    quantityKg: z.number().positive("Jumlah kg harus lebih dari 0"),
    pricePerKg: z.number().int().positive("Harga per kg harus lebih dari 0"),
    note: z.string().min(5, "Catatan minimal 5 karakter").optional(),
  });

  static createExpenseSchema = z
    .object({
      itemId: z.number().int().positive("Item ID wajib diisi"),
      type: z.enum(["VEGETABLE", "OTHER"]),
      total: z.number().int().positive("Total wajib diisi").optional(),
      note: z.string().min(5, "Catatan minimal 5 karakter").optional(),
      vegetableDetails: z.array(this.vegetableDetailSchema).optional(),
    })
    .superRefine((data, ctx) => {
      if (data.type === "VEGETABLE") {
        if (!data.vegetableDetails || data.vegetableDetails.length === 0) {
          ctx.addIssue({
            path: ["vegetableDetails"],
            code: z.ZodIssueCode.custom,
            message: "vegetableDetails wajib diisi untuk tipe VEGETABLE",
          });
        }
      }

      if (data.type === "OTHER") {
        if (typeof data.total !== "number") {
          ctx.addIssue({
            path: ["total"],
            code: z.ZodIssueCode.custom,
            message: "Total wajib diisi untuk tipe OTHER",
          });
        }
        if (!data.note || data.note.trim() === "") {
          ctx.addIssue({
            path: ["note"],
            code: z.ZodIssueCode.custom,
            message: "Catatan wajib diisi untuk tipe OTHER",
          });
        }
      }
    });

  static updateExpenseSchema = z
    .object({
      itemId: z.number().int().positive("Item ID wajib diisi").optional(),
      type: z.enum(["VEGETABLE", "OTHER"]).optional(),
      total: z.number().int().positive("Total wajib diisi").optional(),
      note: z.string().min(5, "Catatan minimal 5 karakter").optional(),
      vegetableDetails: z.array(this.vegetableDetailSchema).optional(),
    })
    .superRefine((data, ctx) => {
      if (data.type === "VEGETABLE") {
        if (!data.vegetableDetails || data.vegetableDetails.length === 0) {
          ctx.addIssue({
            path: ["vegetableDetails"],
            code: z.ZodIssueCode.custom,
            message: "vegetableDetails wajib diisi untuk tipe VEGETABLE",
          });
        }
      }

      if (data.type === "OTHER") {
        if (data.total === undefined || typeof data.total !== "number") {
          ctx.addIssue({
            path: ["total"],
            code: z.ZodIssueCode.custom,
            message: "Total wajib diisi untuk tipe OTHER",
          });
        }

        if (!data.note || data.note.trim() === "") {
          ctx.addIssue({
            path: ["note"],
            code: z.ZodIssueCode.custom,
            message: "Catatan wajib diisi untuk tipe OTHER",
          });
        }
      }
    });

  static partialUpdateExpenseSchema = z
    .object({
      itemId: z.number().int().positive("Item ID wajib diisi").optional(),
      type: z.enum(["VEGETABLE", "OTHER"]).optional(),
      total: z.number().int().positive("Total wajib diisi").optional(),
      note: z.string().min(5, "Catatan minimal 5 karakter").optional(),
      vegetableDetails: z.array(this.vegetableDetailSchema).optional(),
    })
    .refine(
      (data) => {
        // Minimal satu field harus diupdate
        return Object.keys(data).length > 0;
      },
      {
        message: "Minimal satu field harus diupdate",
      }
    );

  static updateVegetableDetailSchema = z.object({
    farmerName: z
      .string()
      .min(1, "Nama petani wajib diisi")
      .refine((val) => !/\d/.test(val), {
        message: "Nama petani tidak boleh mengandung angka",
      })
      .optional(),
    quantityKg: z.number().positive("Quantity harus lebih dari 0").optional(),
    pricePerKg: z
      .number()
      .int()
      .positive("Harga per kg harus lebih dari 0")
      .optional(),
    phone: z
      .string()
      .min(10, "Nomor telepon minimal 10 karakter")
      .max(15, "Nomor telepon maksimal 15 karakter")
      .optional(),
    address: z.string().min(5, "Alamat minimal 5 karakter").optional(),
    note: z.string().min(5, "Catatan minimal 5 karakter").optional(),
  });
}

module.exports = ExpenseValidation;
