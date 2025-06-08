const Validation = require("../utils/validation/validation");
const prisma = require("../app/config/config");
const { ResponseError } = require("../utils/response/response");
const IncomeValidation = require("../utils/validation/income-validation");
const { startOfDay, endOfDay } = require("date-fns");


class IncomeService {
  static async createIncome(request) {
    const userId = request.user.id;
    const { itemId, incomesDetails } = request.body;

    if (!Array.isArray(incomesDetails) || incomesDetails.length === 0) {
      throw new ResponseError(
        "incomesDetails wajib berupa array dan tidak boleh kosong",
        400
      );
    }

    const item = await prisma.item.findFirst({
      where: { id: itemId, userId },
    });

    if (!item) {
      throw new ResponseError("Item tidak ditemukan", 404);
    }

    let totalQuantityKg = 0;
    let totalPrice = 0;

    const createdIncomeWithDetails = await prisma.$transaction(async (tx) => {
      const income = await tx.income.create({
        data: {
          userId,
          itemId,
          totalQuantityKg: 0,
          totalPrice: 0,
          note: null,
        },
      });

      for (const detail of incomesDetails) {
        const data = Validation.validate(
          IncomeValidation.createIncomeDetailSchema,
          detail
        );

        const detailTotalPrice = Math.round(data.quantityKg * data.pricePerKg);

        await tx.incomeDetail.create({
          data: {
            incomeId: income.id,
            buyerName: data.buyerName,
            quantityKg: data.quantityKg,
            pricePerKg: data.pricePerKg,
            note: data.note || null,
            totalPrice: detailTotalPrice,
          },
        });

        totalQuantityKg += data.quantityKg;
        totalPrice += detailTotalPrice;
      }

      const updatedIncome = await tx.income.update({
        where: { id: income.id },
        data: {
          totalQuantityKg,
          totalPrice,
        },
        include: {
          incomeDetails: true,
        },
      });

      return updatedIncome;
    });

    return {
      createdIncomeWithDetails,
    };
  }

  static async getIncomesByDate(request) {
    const userId = request.user.id;
    const { date } = request.query;

    if (!date) {
      throw new ResponseError("Parameter date wajib diisi", 400);
    }

    const parsedDate = new Date(date);
    if (isNaN(parsedDate)) {
      throw new ResponseError("Format date tidak valid (YYYY-MM-DD)", 400);
    }

    const incomes = await prisma.income.findMany({
      where: {
        userId,
        createdAt: {
          gte: startOfDay(parsedDate),
          lte: endOfDay(parsedDate),
        },
      },
      select: {
        itemId: true,
        totalQuantityKg: true,
        totalPrice: true,
        item: {
          select: {
            name: true,
            type: true,
          },
        },
      },
    });

    const grouped = incomes.reduce((acc, income) => {
      const key = income.itemId;

      if (!acc[key]) {
        acc[key] = {
          itemId: income.itemId,
          itemName: income.item.name,
          itemType: income.item.type,
          totalQuantityKg: 0,
          totalPrice: 0,
        };
      }

      acc[key].totalQuantityKg += income.totalQuantityKg ?? 0;
      acc[key].totalPrice += income.totalPrice ?? 0;

      return acc;
    }, {});

    const groupedArray = Object.values(grouped);

    return {
      groupedArray,
    };
  }

  static async getIncomeDetailsByDateAndItemId(request) {
    const userId = request.user.id;
    const { itemId } = request.params;
    const { date } = request.query;

    if (!date) {
      throw new ResponseError("Parameter date wajib diisi", 400);
    }
    if (!itemId) {
      throw new ResponseError("Parameter itemId wajib diisi", 400);
    }

    const parsedDate = new Date(date);
    if (isNaN(parsedDate)) {
      throw new ResponseError("Format date tidak valid (YYYY-MM-DD)", 400);
    }

    const start = startOfDay(parsedDate);
    const end = endOfDay(parsedDate);

    const incomes = await prisma.income.findMany({
      where: {
        userId,
        itemId: Number(itemId),
        createdAt: {
          gte: start,
          lte: end,
        },
      },
      select: {
        id: true,
        totalPrice: true,
        totalQuantityKg: true,
        note: true,
        createdAt: true,
        item: {
          select: {
            name: true,
            type: true,
          },
        },
        incomeDetails: {
          select: {
            id: true,
            buyerName: true,
            quantityKg: true,
            pricePerKg: true,
            totalPrice: true,
            note: true,
            createdAt: true,
          },
        },
      },
    });

    if (!incomes.length) {
      return {
        status: true,
        message: `Tidak ada income dengan itemId ${itemId} pada tanggal ${date}`,
        data: [],
      };
    }

    let totalQuantityKg = 0;
    let totalPrice = 0;
    incomes.forEach((income) => {
      totalQuantityKg += income.totalQuantityKg ?? 0;
      totalPrice += income.totalPrice ?? 0;
    });

    const { item } = incomes[0];

    return {
      status: true,
      message: `Detail income untuk itemId ${itemId} pada tanggal ${date}`,
      data: {
        itemId: Number(itemId),
        itemName: item.name,
        itemType: item.type,
        totalQuantityKg,
        totalPrice,
        incomes: incomes.map((income) => ({
          id: income.id,
          note: income.note,
          createdAt: income.createdAt,
          totalQuantityKg: income.totalQuantityKg,
          totalPrice: income.totalPrice,
          incomeDetails: income.incomeDetails,
        })),
      },
    };
  }

  static async getAllIncomes(request) {
    const userId = request.user.id;

    const incomes = await prisma.income.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        itemId: true,
        totalPrice: true,
        totalQuantityKg: true,
        note: true,
        createdAt: true,
        item: {
          select: {
            name: true,
            type: true,
          },
        },
        incomeDetails: {
          select: {
            id: true,
            buyerName: true,
            quantityKg: true,
            pricePerKg: true,
            totalPrice: true,
            note: true,
            createdAt: true,
          },
        },
      },
    });

    if (!incomes.length) {
      return {
        status: true,
        message: "Belum ada data income",
        data: [],
      };
    }

    return {
      incomes,
    };
  }

  static async getIncomeDetailById(request) {
    const userId = request.user.id;
    const { incomeId } = request.params;

    if (!incomeId) {
      throw new ResponseError("Parameter incomeId wajib diisi", 400);
    }

    const incomes = await prisma.income.findFirst({
      where: {
        id: Number(incomeId),
        userId,
      },
      select: {
        id: true,
        itemId: true,
        totalPrice: true,
        totalQuantityKg: true,
        note: true,
        createdAt: true,
        updatedAt: true,
        item: {
          select: {
            name: true,
            type: true,
          },
        },
        incomeDetails: {
          select: {
            id: true,
            buyerName: true,
            quantityKg: true,
            pricePerKg: true,
            totalPrice: true,
            note: true,
            createdAt: true,
            updatedAt: true,
          },
        },
      },
    });

    if (!incomes) {
      throw new ResponseError(
        `Income dengan id ${incomeId} tidak ditemukan`,
        404
      );
    }

    return {
      incomes,
    };
  }

  static async deleteIncomeById(request) {
    const userId = request.user.id;
    const { incomeId } = request.params;

    if (!incomeId) {
      throw new ResponseError("Parameter incomeId wajib diisi", 400);
    }

    const income = await prisma.income.findFirst({
      where: {
        id: Number(incomeId),
        userId,
      },
    });

    if (!income) {
      throw new ResponseError(
        `Income dengan id ${incomeId} tidak ditemukan atau bukan milik Anda`,
        404
      );
    }

    await prisma.incomeDetail.deleteMany({
      where: {
        incomeId: Number(incomeId),
      },
    });

    await prisma.income.delete({
      where: {
        id: Number(incomeId),
      },
    });
  }

  static async updateIncomeDetailById(request) {
    const userId = request.user.id;
    const { incomeDetailId } = request.params;
    const { buyerName, quantityKg, pricePerKg, note } = request.body;

    if (!incomeDetailId) {
      throw new ResponseError("Parameter incomeDetailId wajib diisi", 400);
    }

    IncomeValidation.updateIncomeDetailSchema.parse(request.body);

    const incomeDetail = await prisma.incomeDetail.findFirst({
      where: {
        id: Number(incomeDetailId),
        income: {
          userId,
        },
      },
    });

    if (!incomeDetail) {
      throw new ResponseError(
        `IncomeDetail dengan id ${incomeDetailId} tidak ditemukan atau bukan milik Anda`,
        404
      );
    }

    const updatedDetail = await prisma.incomeDetail.update({
      where: { id: Number(incomeDetailId) },
      data: {
        buyerName: buyerName ?? incomeDetail.buyerName,
        quantityKg: quantityKg ?? incomeDetail.quantityKg,
        pricePerKg: pricePerKg ?? incomeDetail.pricePerKg,
        totalPrice:
          (quantityKg ?? incomeDetail.quantityKg) *
          (pricePerKg ?? incomeDetail.pricePerKg),
        note: note ?? incomeDetail.note,
        updatedAt: new Date(),
      },
    });

    const incomeTotals = await prisma.incomeDetail.aggregate({
      where: {
        incomeId: incomeDetail.incomeId,
      },
      _sum: {
        totalPrice: true,
        quantityKg: true,
      },
    });

    await prisma.income.update({
      where: { id: incomeDetail.incomeId },
      data: {
        totalPrice: incomeTotals._sum.totalPrice ?? 0,
        totalQuantityKg: incomeTotals._sum.quantityKg ?? 0,
        updatedAt: new Date(),
      },
    });

    return {
      updatedDetail,
    };
  }
}

module.exports = IncomeService;
