const { ZodError } = require("zod");

class Validation {
    static validate(schema, data) {
        try {
            return schema.parse(data);
        } catch (error) {
            if (error instanceof ZodError) {
                throw error;
            }
            throw new Error("Validation error");
        }
    }
}

module.exports = Validation;