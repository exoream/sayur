const express = require("express");
const { jwtMiddleware } = require("../../utils/middleware/jwt");
const IncomeController = require("../../controller/income-controller");

const incomeController = new IncomeController();

const router = express.Router();

router.post(
  "/incomes",
  jwtMiddleware,
  incomeController.createIncome.bind(incomeController)
);

router.delete(
  "/incomes/:incomeId",
  jwtMiddleware,
  incomeController.deleteIncomeById.bind(incomeController)
);

router.get(
  "/incomes/all/:itemId",
  jwtMiddleware,
  incomeController.getAllIncomes.bind(incomeController)
);

router.get(
  "/incomes/detail/:incomeId",
  jwtMiddleware,
  incomeController.getIncomeDetailById.bind(incomeController)
);

router.put(
  "/incomes/detail/:incomeDetailId",
  jwtMiddleware,
  incomeController.updateIncomeDetailById.bind(incomeController)
);

router.get(
  "/incomes",
    jwtMiddleware,
    incomeController.getIncomesByDate.bind(incomeController)
);

router.get(
  "/incomes/:itemId",
  jwtMiddleware,
  incomeController.getIncomeDetailsByDateAndItemId.bind(incomeController)
);


module.exports = router;
