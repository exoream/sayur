const express = require("express");
const { jwtMiddleware } = require("../../utils/middleware/jwt");
const ExpenseController = require("../../controller/expense-controller");

const expenseController = new ExpenseController();

const router = express.Router();

router.post(
  "/expenses",
  jwtMiddleware,
  expenseController.createExpense.bind(expenseController)
);

router.get(
  "/expenses",
  jwtMiddleware,
  expenseController.getExpensesByDate.bind(expenseController)
);

router.delete(
  "/expenses/:id",
  jwtMiddleware,
  expenseController.deleteExpenseById.bind(expenseController)
);

router.delete(
  "/expenses/detail/:expenseDetailId",
  jwtMiddleware,
  expenseController.deleteExpenseDetailById.bind(expenseController)
);

router.put(
  "/expenses/:expenseDetailId",
  jwtMiddleware,
  expenseController.updateExpenseById.bind(expenseController)
);

router.get(
  "/expenses/all/:itemId",
  jwtMiddleware,
  expenseController.getAllExpenses.bind(expenseController)
);

router.get(
  "/expenses/detail/:expenseId",
  jwtMiddleware,
  expenseController.getExpenseDetailById.bind(expenseController)
);

router.get(
  "/expenses/:itemId",
  jwtMiddleware,
  expenseController.getExpenseDetailsByDateAndItemId.bind(expenseController)
);

module.exports = router;