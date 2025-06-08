const express = require("express");
const UserController = require("../../controller/user-controller");
const { jwtMiddleware } = require("../../utils/middleware/jwt");
const { isAdmin } = require("../../utils/middleware/admin-middleware");
const upload = require("../../utils/helper/multer");

const userController = new UserController();

const router = express.Router();

router.post("/register", userController.register.bind(userController));
router.post("/login", userController.login.bind(userController));
router.put(
  "/profile",
  jwtMiddleware,
  upload.single("photo"),
  userController.updateProfile.bind(userController)
);
router.get(
  "/profile",
  jwtMiddleware,
  userController.getProfile.bind(userController)
);
router.patch(
  "/profile",
  jwtMiddleware,
  userController.updatePassword.bind(userController)
);

router.get(
  "/users",
  jwtMiddleware,
  isAdmin,
  userController.getAllUsers.bind(userController)
);
router.get(
  "/users/:id",
  jwtMiddleware,
  isAdmin,
  userController.getUserById.bind(userController)
);

module.exports = router;
