const express = require("express");
const ItemController = require("../../controller/item-controller");
const { jwtMiddleware } = require("../../utils/middleware/jwt");
const upload = require("../../utils/helper/multer");

const itemController = new ItemController();

const router = express.Router();

router.post(
  "/items",
  jwtMiddleware,
  upload.single("photo"),
  itemController.createItem.bind(itemController)
);

router.get(
  "/items",
  jwtMiddleware,
  itemController.getItems.bind(itemController)
);

router.put(
  "/items/:id",
  jwtMiddleware,
  upload.single("photo"),
  itemController.updateItem.bind(itemController)
);

router.delete(
  "/items/:id",
  jwtMiddleware,
  itemController.deleteItem.bind(itemController)
);

module.exports = router;