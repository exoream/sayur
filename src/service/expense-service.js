const Validation = require("../utils/validation/validation");
const prisma = require("../app/config/config");
const { ResponseError } = require("../utils/response/response");
const ExpenseValidation = require("../utils/validation/expense-validation");
// const { startOfDay, endOfDay } = require("date-fns");
const dayjs = require("dayjs");
const utc = require("dayjs/plugin/utc");
const timezone = require("dayjs/plugin/timezone");

dayjs.extend(utc);
dayjs.extend(timezone);

class ExpenseService {
  static async createExpense(request) {
    const data = Validation.validate(
      ExpenseValidation.createExpenseSchema,
      request.body
    );

    const userId = request.user.id;

    const item = await prisma.item.findFirst({
      where: {
        id: data.itemId,
        userId: userId,
      },
    });

    if (!item) {
      throw new ResponseError(
        "Item tidak ditemukan atau bukan milik Anda",
        404
      );
    }

    if (item.type !== data.type) {
      throw new ResponseError(
        `Tipe item '${item.type}' tidak sesuai dengan tipe pengeluaran '${data.type}'`,
        400
      );
    }

    let total = data.total || null;
    let totalQuantityKg = null;

    // Hitung otomatis untuk VEGETABLE
    if (data.type === "VEGETABLE") {
      total = 0;
      totalQuantityKg = 0;

      for (const detail of data.vegetableDetails) {
        const detailTotal = detail.quantityKg * detail.pricePerKg;
        total += detailTotal;
        totalQuantityKg += detail.quantityKg;

        detail.totalPrice = detailTotal;
      }
    }

    // Transaksi penyimpanan
    const result = await prisma.$transaction(
      async (tx) => {
        const expense = await tx.expense.create({
          data: {
            userId,
            itemId: data.itemId,
            type: data.type,
            total,
            totalQuantityKg,
            note: data.note || null,
          },
        });

        if (data.type === "VEGETABLE" && Array.isArray(data.vegetableDetails)) {
          const detailData = data.vegetableDetails.map((detail) => ({
            ...detail,
            expenseId: expense.id,
          }));

          await tx.vegetableExpenseDetail.createMany({
            data: detailData,
          });
        }

        return expense;
      },
      {
        timeout: 60000,
      }
    );

    return {
      status: true,
      message: "Pengeluaran berhasil dibuat",
      data: result,
    };
  }

  static async getExpensesByDate(request) {
    const userId = request.user.id;
    const { date } = request.query;

    if (!date) {
      throw new ResponseError("Parameter date wajib diisi", 400);
    }

    // Validasi dan parsing dengan dayjs
    const parsed = dayjs.tz(date, "Asia/Makassar");
    if (!parsed.isValid()) {
      throw new ResponseError("Format date tidak valid (YYYY-MM-DD)", 400);
    }

    const start = parsed.startOf("day").toDate();
    const end = parsed.endOf("day").toDate();

    const expenses = await prisma.expense.findMany({
      where: {
        userId,
        createdAt: {
          gte: start,
          lte: end,
        },
      },
      select: {
        itemId: true,
        totalQuantityKg: true,
        total: true,
        type: true,
        note: true,
        item: {
          select: {
            name: true,
            type: true,
          },
        },
      },
    });

    const grouped = expenses.reduce((acc, expense) => {
      const key = expense.itemId + "|" + expense.type;

      if (!acc[key]) {
        acc[key] = {
          itemId: expense.itemId,
          itemName: expense.item.name,
          itemType: expense.item.type,
          type: expense.type,
          totalQuantityKg: 0,
          totalPrice: 0,
          note: expense.note,
        };
      }

      acc[key].totalQuantityKg +=
        expense.type === "VEGETABLE" ? expense.totalQuantityKg ?? 0 : 0;
      acc[key].totalPrice += expense.total ?? 0;

      return acc;
    }, {});

    return Object.values(grouped);
  }

  static async getExpenseDetailsByDateAndItemId(request) {
    const userId = request.user.id;
    const itemId = Number(request.params.itemId);
    const { date } = request.query;

    if (!itemId) {
      throw new ResponseError("Parameter itemId wajib diisi", 400);
    }

    if (isNaN(itemId)) {
      throw new ResponseError("Parameter itemId harus berupa angka", 400);
    }

    if (!date) {
      throw new ResponseError("Parameter date wajib diisi", 400);
    }

    // Gunakan dayjs + Asia/Makassar timezone
    const parsed = dayjs.tz(date, "Asia/Makassar");
    if (!parsed.isValid()) {
      throw new ResponseError("Format date tidak valid (YYYY-MM-DD)", 400);
    }

    const start = parsed.startOf("day").toDate();
    const end = parsed.endOf("day").toDate();

    const expenses = await prisma.expense.findMany({
      where: {
        userId,
        itemId,
        createdAt: {
          gte: start,
          lte: end,
        },
      },
      include: {
        item: {
          select: {
            name: true,
            type: true,
          },
        },
        vegetableDetails: true,
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    if (expenses.length === 0) {
      throw new ResponseError(
        `Tidak ada data pengeluaran untuk itemId ${itemId} pada tanggal ${date}`,
        404
      );
    }

    const result = {
      itemId: expenses[0].itemId,
      itemName: expenses[0].item.name,
      itemType: expenses[0].item.type,
      totalQuantityKg: 0,
      totalPrice: 0,
      type: expenses[0].type,
      note: null,
      details: [],
    };

    for (const expense of expenses) {
      result.totalQuantityKg +=
        expense.type === "VEGETABLE" ? expense.totalQuantityKg ?? 0 : 0;
      result.totalPrice += expense.total ?? 0;
      if (!result.note) result.note = expense.note;

      if (expense.type === "VEGETABLE" && expense.vegetableDetails.length > 0) {
        result.details.push(
          ...expense.vegetableDetails.map((detail) => ({
            id: detail.id,
            farmerName: detail.farmerName,
            phone: detail.phone,
            address: detail.address,
            quantityKg: detail.quantityKg,
            pricePerKg: detail.pricePerKg,
            totalPrice: detail.totalPrice,
            note: detail.note,
          }))
        );
      } else {
        result.details.push({
          id: expense.id,
          totalQuantityKg: expense.totalQuantityKg,
          totalPrice: expense.total,
          note: expense.note,
          createdAt: expense.createdAt,
        });
      }
    }

    return result;
  }

  static async getAllExpenses(request) {
    const userId = request.user.id;
    const itemId = Number(request.params.itemId);

    if (!itemId || isNaN(itemId)) {
      throw new Error("Parameter itemId tidak valid");
    }

    const expenses = await prisma.expense.findMany({
      where: {
        userId,
        itemId,
      },
      include: {
        item: {
          select: {
            name: true,
            type: true,
          },
        },
        vegetableDetails: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    if (!expenses.length) {
      throw new ResponseError(
        `Tidak ada data pengeluaran untuk itemId ${itemId}`,
        404
      );
    }

    const { name, type } = expenses[0].item;

    const items = expenses.map((expense) => ({
      id: expense.id,
      type: expense.type,
      totalQuantityKg: expense.totalQuantityKg,
      totalPrice: expense.total,
      note: expense.note,
      createdAt: expense.createdAt,
      details:
        expense.type === "VEGETABLE"
          ? expense.vegetableDetails.map((detail) => ({
              id: detail.id,
              farmerName: detail.farmerName,
              phone: detail.phone,
              address: detail.address,
              quantityKg: detail.quantityKg,
              pricePerKg: detail.pricePerKg,
              totalPrice: detail.totalPrice,
              note: detail.note,
            }))
          : [],
    }));

    return {
      itemId,
      itemName: name,
      itemType: type,
      items,
    };
  }

  static async getExpenseDetailById(request) {
    const userId = request.user.id;
    const expenseId = Number(request.params.expenseId);

    if (isNaN(expenseId)) {
      throw new ResponseError("Parameter expenseId tidak valid", 400);
    }

    const expense = await prisma.expense.findFirst({
      where: {
        id: expenseId,
        userId,
      },
      include: {
        item: {
          select: {
            name: true,
            type: true,
          },
        },
        vegetableDetails: true,
      },
    });

    if (!expense) {
      throw new ResponseError("Data pengeluaran tidak ditemukan", 404);
    }

    const result = {
      id: expense.id,
      itemId: expense.itemId,
      itemName: expense.item.name,
      itemType: expense.item.type,
      type: expense.type,
      totalQuantityKg: expense.totalQuantityKg,
      totalPrice: expense.total,
      note: expense.note,
      details: [],
    };

    if (expense.type === "VEGETABLE") {
      result.details = expense.vegetableDetails.map((detail) => ({
        id: detail.id,
        farmerName: detail.farmerName,
        phone: detail.phone,
        address: detail.address,
        quantityKg: detail.quantityKg,
        pricePerKg: detail.pricePerKg,
        totalPrice: detail.totalPrice,
        note: detail.note,
      }));
    }

    return result;
  }

  static async deleteExpenseById(request) {
    const userId = request.user.id;
    const expenseId = Number(request.params.id);

    if (isNaN(expenseId)) {
      throw new ResponseError("ID pengeluaran tidak valid", 400);
    }

    const existingExpense = await prisma.expense.findFirst({
      where: {
        id: expenseId,
        userId,
      },
      include: {
        vegetableDetails: true,
      },
    });

    if (!existingExpense) {
      throw new ResponseError("Pengeluaran tidak ditemukan", 404);
    }

    console.log("existingExpense:", existingExpense);
    console.log("vegetableDetails:", existingExpense.vegetableDetails);

    if (
      existingExpense.vegetableDetails &&
      existingExpense.vegetableDetails.length > 0
    ) {
      await prisma.vegetableExpenseDetail.deleteMany({
        where: {
          expenseId: expenseId,
        },
      });
    }

    await prisma.expense.delete({
      where: {
        id: expenseId,
      },
    });
  }

  static async deleteExpenseDetailById(request) {
    const userId = request.user.id;
    const expenseDetailId = Number(request.params.expenseDetailId);

    if (isNaN(expenseDetailId)) {
      throw new ResponseError("Parameter expenseDetailId tidak valid", 400);
    }

    const detail = await prisma.vegetableExpenseDetail.findFirst({
      where: {
        id: expenseDetailId,
        expense: {
          userId,
        },
      },
      include: {
        expense: true,
      },
    });

    if (!detail) {
      throw new ResponseError(
        `Detail pengeluaran dengan id ${expenseDetailId} tidak ditemukan`,
        404
      );
    }

    await prisma.vegetableExpenseDetail.delete({
      where: {
        id: expenseDetailId,
      },
    });

    const aggregate = await prisma.vegetableExpenseDetail.aggregate({
      where: {
        expenseId: detail.expenseId,
      },
      _sum: {
        quantityKg: true,
        totalPrice: true,
      },
    });

    await prisma.expense.update({
      where: { id: detail.expenseId },
      data: {
        totalQuantityKg: aggregate._sum.quantityKg ?? 0,
        total: aggregate._sum.totalPrice ?? 0,
        updatedAt: new Date(),
      },
    });
  }

  static async updateExpenseDetailById(request) {
    const userId = request.user.id;
    const { expenseDetailId } = request.params;
    const { farmerName, quantityKg, pricePerKg, phone, address, note } =
      request.body;

    if (!expenseDetailId) {
      throw new ResponseError("Parameter expenseDetailId wajib diisi", 400);
    }

    ExpenseValidation.updateVegetableDetailSchema.parse(request.body);

    const detail = await prisma.vegetableExpenseDetail.findFirst({
      where: {
        id: Number(expenseDetailId),
        expense: {
          userId,
        },
      },
      include: {
        expense: true,
      },
    });

    if (!detail) {
      throw new ResponseError(
        `Detail pengeluaran dengan id ${expenseDetailId} tidak ditemukan`,
        404
      );
    }

    // Hitung totalPrice baru
    const newQuantity = quantityKg ?? detail.quantityKg;
    const newPrice = pricePerKg ?? detail.pricePerKg;
    const totalPrice = newQuantity * newPrice;

    // Update detail
    const updatedDetail = await prisma.vegetableExpenseDetail.update({
      where: { id: Number(expenseDetailId) },
      data: {
        farmerName: farmerName ?? detail.farmerName,
        quantityKg: newQuantity,
        pricePerKg: newPrice,
        totalPrice,
        phone: phone ?? detail.phone,
        address: address ?? detail.address,
        note: note ?? detail.note,
      },
    });

    // Update rekap di tabel expense
    const recalc = await prisma.vegetableExpenseDetail.aggregate({
      where: { expenseId: detail.expenseId },
      _sum: {
        quantityKg: true,
        totalPrice: true,
      },
    });

    await prisma.expense.update({
      where: { id: detail.expenseId },
      data: {
        totalQuantityKg: recalc._sum.quantityKg ?? 0,
        total: recalc._sum.totalPrice ?? 0,
      },
    });

    return {
      id: updatedDetail.id,
      farmerName: updatedDetail.farmerName,
      quantityKg: updatedDetail.quantityKg,
      pricePerKg: updatedDetail.pricePerKg,
      totalPrice: updatedDetail.totalPrice,
      phone: updatedDetail.phone,
      address: updatedDetail.address,
      note: updatedDetail.note,
    };
  }
}

module.exports = ExpenseService;
