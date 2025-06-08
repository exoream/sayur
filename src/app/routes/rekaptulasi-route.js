const express = require("express");
const { jwtMiddleware } = require("../../utils/middleware/jwt");
const { isAdmin } = require("../../utils/middleware/admin-middleware");
const RekaptulasiController = require("../../controller/rekaptulasi-controller");

const rekaptulasiController = new RekaptulasiController();

const router = express.Router();

router.get(
  "/rekaptulasi",
  jwtMiddleware,
  rekaptulasiController.getMonthlySummary.bind(rekaptulasiController)
);

router.get(
  "/rekaptulasi/profit",
  jwtMiddleware,
  rekaptulasiController.getYearlyProfitSummary.bind(rekaptulasiController)
);

router.get(
  "/rekaptulasi/user-inputs",
  jwtMiddleware,
  isAdmin,
  rekaptulasiController.getAllUserInputs.bind(rekaptulasiController)
);

module.exports = router;