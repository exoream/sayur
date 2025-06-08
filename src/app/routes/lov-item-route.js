const express = require("express");
const LovItemController = require("../../controller/lov-item-controller");
const { jwtMiddleware } = require("../../utils/middleware/jwt");
const { isAdmin } = require("../../utils/middleware/admin-middleware");
const upload = require("../../utils/helper/multer");

const lovItemController = new LovItemController();

const router = express.Router();

router.post(
  "/lov-items",
  jwtMiddleware,
  isAdmin,
  upload.single("photo"),
  lovItemController.createLovItem.bind(lovItemController)
);

router.get(
  "/lov-items",
  jwtMiddleware,
  lovItemController.getAllLovItems.bind(lovItemController)
);

router.get(
  "/lov-items/:id",
  jwtMiddleware,
  lovItemController.getLovItemById.bind(lovItemController)
);

router.put(
  "/lov-items/:id",
  jwtMiddleware,
  isAdmin,
  upload.single("photo"),
  lovItemController.updateLovItem.bind(lovItemController)
);

router.delete(
  "/lov-items/:id",
  jwtMiddleware,
  isAdmin,
  lovItemController.deleteLovItem.bind(lovItemController)
);

module.exports = router;
