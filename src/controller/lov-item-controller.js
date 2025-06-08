const LovItemService = require("../service/lov-item-service");
const { successResponse } = require("../utils/response/response");

class LovItemController {
  async createLovItem(req, res, next) {
    try {
      const lovItem = await LovItemService.createLovItem(req);
      return res
        .status(201)
        .json(successResponse("Berhasil membuat item LOV", lovItem));
    } catch (error) {
      next(error);
    }
  }

  async getAllLovItems(req, res, next) {
    try {
      const lovItems = await LovItemService.getAllLovItems(req);
      return res
        .status(200)
        .json(successResponse("Berhasil mendapatkan semua item LOV", lovItems));
    } catch (error) {
      next(error);
    }
  }

  async getLovItemById(req, res, next) {
    try {
      const lovItem = await LovItemService.getLovItemById(req.params.id);
      return res
        .status(200)
        .json(successResponse("Berhasil mendapatkan item LOV", lovItem));
    } catch (error) {
      next(error);
    }
  }

  async updateLovItem(req, res, next) {
    try {
      const lovItem = await LovItemService.updateLovItem(req);
      return res
        .status(200)
        .json(successResponse("Berhasil memperbarui item LOV", lovItem));
    } catch (error) {
      next(error);
    }
  }

  async deleteLovItem(req, res, next) {
    try {
      const lovItem = await LovItemService.deleteLovItem(req);
      return res
        .status(200)
        .json(successResponse("Berhasil menghapus item LOV", lovItem));
    } catch (error) {
      next(error);
    }
  }
}

module.exports = LovItemController;