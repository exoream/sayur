const { z, number } = require("zod");

class UserValidation {
  static registerSchema = z.object({
    name: z
      .string()
      .min(2, "Nama minimum 2 characters")
      .max(50, "Nama maximum 50 characters")
      .regex(/^[a-zA-Z\s]+$/, "Nama hanya boleh mengandung huruf dan spasi")
      .nonempty("Nama wajib diisi"),
    password: z
      .string()
      .min(8, "Password minimum 8 characters")
      .nonempty("Password wajib diisi"),
    email: z.string().email("Email tidak valid").nonempty("Email wajib diisi"),
  });

  static loginSchema = z.object({
    email: z.string().email("Email tidak valid").nonempty("Email wajib diisi"),
    password: z.string().nonempty("Password wajib diisi"),
  });

  static updateProfileSchema = z.object({
    name: z
      .string()
      .min(2, "Nama minimum 2 characters")
      .max(50, "Nama maximum 50 characters")
      .regex(/^[a-zA-Z\s]+$/, "Nama hanya boleh mengandung huruf dan spasi")
      .optional(),
    email: z.string().email("Email tidak valid").optional(),
  });
}

module.exports = UserValidation;
