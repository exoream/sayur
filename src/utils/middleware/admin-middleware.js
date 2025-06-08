function isAdmin(req, res, next) {
  if (!req.user || req.user.role !== "ADMIN") {
    return res.status(403).json({
      status: "false",
      message: "Hanya admin yang dapat mengakses resource ini",
    });
  }
  next();
}

module.exports = { isAdmin };
