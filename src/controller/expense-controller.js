const ExpenseService = require("../service/expense-service");
const { successResponse } = require("../utils/response/response");

class ExpenseController {
  async createExpense(req, res, next) {
    try {
      const expense = await ExpenseService.createExpense(req);
      return res
        .status(201)
        .json(successResponse("Berhasil membuat pengeluaran", expense));
    } catch (error) {
      next(error);
    }
  }

  async getExpensesByDate(req, res, next) {
    try {
      const expenses = await ExpenseService.getExpensesByDate(req);
      return res
        .status(200)
        .json(
          successResponse("Berhasil mendapatkan semua pengeluaran", expenses)
        );
    } catch (error) {
      next(error);
    }
  }

  async getExpenseDetailsByDateAndItemId(req, res, next) {
    try {
      const expense = await ExpenseService.getExpenseDetailsByDateAndItemId(
        req
      );
      return res
        .status(200)
        .json(successResponse("Berhasil mendapatkan pengeluaran", expense));
    } catch (error) {
      next(error);
    }
  }

  async getAllExpenses(req, res, next) {
    try {
      const expenses = await ExpenseService.getAllExpenses(req);
      return res
        .status(200)
        .json(successResponse("Berhasil mendapatkan semua pengeluaran", expenses));
    } catch (error) {
      next(error);
    }
  }

  async getExpenseDetailById(req, res, next) {
    try {
      const expense = await ExpenseService.getExpenseDetailById(req);
      return res
        .status(200)
        .json(successResponse("Berhasil mendapatkan detail pengeluaran", expense));
    } catch (error) {
      next(error);
    }
  }

    async deleteExpenseById(req, res, next) {
        try {
        await ExpenseService.deleteExpenseById(req);
        return res
            .status(200)
            .json(successResponse("Berhasil menghapus pengeluaran"));
        } catch (error) {
        next(error);
        }
    }

    async updateExpenseById(req, res, next) {
        try {
            const expense = await ExpenseService.updateExpenseDetailById(req);
            return res
                .status(200)
                .json(successResponse("Berhasil memperbarui pengeluaran", expense));
        } catch (error) {
            next(error);
        }
    }

    async deleteExpenseDetailById(req, res, next) {
        try {
            await ExpenseService.deleteExpenseDetailById(req);
            return res
                .status(200)
                .json(successResponse("Berhasil menghapus detail pengeluaran"));
        } catch (error) {
            next(error);
        }
    }
}

module.exports = ExpenseController;
