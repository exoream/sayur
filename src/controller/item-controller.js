const ItemService = require("../service/item-service");
const { successResponse } = require("../utils/response/response");

class ItemController {
    async createItem(req, res, next) {
        try {
            const item = await ItemService.createItem(req);
            return res.status(201).json(successResponse("Berhasil membuat item", item));
        } catch (error) {
            next(error);
        }
    }

    async getItems(req, res, next) {
        try {
            const items = await ItemService.getItems(req);
            return res.status(200).json(successResponse("Berhasil mendapatkan semua item", items));
        } catch (error) {
            next(error);
        }
    }

    async updateItem(req, res, next) {
        try {
            const item = await ItemService.updateItem(req);
            return res.status(200).json(successResponse("Berhasil memperbarui item", item));
        } catch (error) {
            next(error);
        }
    }

    async deleteItem(req, res, next) {
        try {
            const item = await ItemService.deleteItem(req);
            return res.status(200).json(successResponse("Berhasil menghapus item", item));
        } catch (error) {
            next(error);
        }
    }
}

module.exports = ItemController;
