const UserService = require("../service/user-service");
const { successResponse } = require("../utils/response/response");

class UserController {
    async register(req, res, next) {
        try {
            const user = await UserService.register(req.body);
            return res.status(201).json(successResponse("Berhasil membuat akun", user));
        } catch (error) {
            next(error);
        }
    }

    async login(req, res, next) {
        try {
            const user = await UserService.login(req.body);
            return res.status(200).json(successResponse("Berhasil login", user));
        } catch (error) {
            next(error);
        }
    }

    async updateProfile(req, res, next) {
        try {
            const user = await UserService.updateProfile(req);
            return res.status(200).json(successResponse("Berhasil memperbarui profil", user));
        } catch (error) {
            next(error);
        }
    }

    async getProfile(req, res, next) {
        try {
            const user = await UserService.getProfile(req);
            return res.status(200).json(successResponse("Berhasil mendapatkan profil", user));
        } catch (error) {
            next(error);
        }
    }

    async updatePassword(req, res, next) {
        try {
            const user = await UserService.updatePassword(req);
            return res.status(200).json(successResponse("Berhasil memperbarui password", user));
        } catch (error) {
            next(error);
        }
    }

    async getAllUsers(req, res, next) {
        try {
            const users = await UserService.getAllUsers(req);
            return res.status(200).json(successResponse("Berhasil mendapatkan semua pengguna", users));
        } catch (error) {
            next(error);
        }
    }

    async getUserById(req, res, next) {
        try {
            const user = await UserService.getUserById(req);
            return res.status(200).json(successResponse("Berhasil mendapatkan pengguna", user));
        } catch (error) {
            next(error);
        }
    }
}

module.exports = UserController;