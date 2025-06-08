const RekaptulasiService = require("../service/rekaptulasi-service");
const { successResponse } = require("../utils/response/response");

class RekaptulasiController {
  async getMonthlySummary(req, res, next) {
    try {
      const rekapitulasi = await RekaptulasiService.getMonthlySummary(req);
      return res
        .status(200)
        .json(
          successResponse("Berhasil mendapatkan rekapitulasi", rekapitulasi)
        );
    } catch (error) {
      next(error);
    }
  }

  async getYearlyProfitSummary(req, res, next) {
    try {
      const rekapitulasi = await RekaptulasiService.getYearlyProfitSummary(req);
      return res
        .status(200)
        .json(
          successResponse("Berhasil mendapatkan rekapitulasi tahunan", rekapitulasi)
        );
    } catch (error) {
      next(error);
    }
  }

  async getAllUserInputs(req, res, next) {
    try {
      const inputs = await RekaptulasiService.getAllUserInputs(req);
      return res
        .status(200)
        .json(successResponse("Berhasil mendapatkan semua input pengguna", inputs));
    } catch (error) {
      next(error);
    }
  }
}

module.exports = RekaptulasiController;