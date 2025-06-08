function sanitizeMultipartBody(body) {
  const sanitized = {};

  for (const key in body) {
    if (typeof body[key] === "string") {
      let value = body[key].trim();

      // Coba parse kalau kayak JSON
      if (value.startsWith("{") || value.startsWith("[")) {
        try {
          value = JSON.parse(value);
        } catch (_) {
          console.error("Failed to parse JSON:", value);
        }
      }

      sanitized[key] = value;
    } else {
      sanitized[key] = body[key];
    }
  }

  return sanitized;
}


module.exports = sanitizeMultipartBody;