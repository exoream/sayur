const IncomeService = require("../service/income-service");
const { successResponse } = require("../utils/response/response");

class IncomeController {
  async createIncome(req, res, next) {
    try {
      const income = await IncomeService.createIncome(req);
      return res
        .status(201)
        .json(successResponse("Berhasil membuat pendapatan", income));
    } catch (error) {
      next(error);
    }
  }

  async getIncomesByDate(req, res, next) {
    try {
      const incomes = await IncomeService.getIncomesByDate(req);
      return res
        .status(200)
        .json(
          successResponse("Berhasil mendapatkan semua pendapatan", incomes)
        );
    } catch (error) {
      next(error);
    }
  }

  async getIncomeDetailsByDateAndItemId(req, res, next) {
    try {
      const income = await IncomeService.getIncomeDetailsByDateAndItemId(req);
      return res
        .status(200)
        .json(successResponse("Berhasil mendapatkan pendapatan", income));
    } catch (error) {
      next(error);
    }
  }

  async getAllIncomes(req, res, next) {
    try {
      const incomes = await IncomeService.getAllIncomes(req);
      return res
        .status(200)
        .json(successResponse("Berhasil mendapatkan semua pendapatan", incomes));
    } catch (error) {
      next(error);
    }
  }

  async getIncomeDetailById(req, res, next) {
    try {
      const income = await IncomeService.getIncomeDetailById(req);
      return res
        .status(200)
        .json(successResponse("Berhasil mendapatkan detail pendapatan", income));
    } catch (error) {
      next(error);
    }
  }

  async deleteIncomeById(req, res, next) {
    try {
      await IncomeService.deleteIncomeById(req);
      return res
        .status(200)
        .json(successResponse("Berhasil menghapus pendapatan"));
    } catch (error) {
      next(error);
    }
  }

  async updateIncomeDetailById(req, res, next) {
    try {
      const income = await IncomeService.updateIncomeDetailById(req);
      return res
        .status(200)
        .json(successResponse("Berhasil memperbarui detail pendapatan", income));
    } catch (error) {
      next(error);
    }
  }
}


module.exports = IncomeController;