const prisma = require("../app/config/config");
const { ResponseError } = require("../utils/response/response");

class RekaptulasiService {
  static async getMonthlySummary(request) {
    const userId = request.user.id;
    const { month, year } = request.query;

    if (!month || !year) {
      throw new ResponseError("Parameter month dan year wajib diisi", 400);
    }

    const monthNum = parseInt(month);
    const yearNum = parseInt(year);

    if (isNaN(monthNum) || isNaN(yearNum) || monthNum < 1 || monthNum > 12) {
      throw new ResponseError("Parameter month atau year tidak valid", 400);
    }

    const startDate = new Date(yearNum, monthNum - 1, 1);
    const endDate = new Date(yearNum, monthNum, 0, 23, 59, 59, 999);

    const expenses = await prisma.expense.findMany({
      where: {
        userId,
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      select: {
        total: true,
        createdAt: true,
      },
    });

    const incomes = await prisma.income.findMany({
      where: {
        userId,
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      select: {
        totalPrice: true,
        createdAt: true,
      },
    });

    const formatDate = (date) => date.toISOString().split("T")[0];

    const expenseByDate = {};
    expenses.forEach(({ total, createdAt }) => {
      const dateKey = formatDate(createdAt);
      expenseByDate[dateKey] = (expenseByDate[dateKey] || 0) + total;
    });

    const incomeByDate = {};
    incomes.forEach(({ totalPrice, createdAt }) => {
      const dateKey = formatDate(createdAt);
      incomeByDate[dateKey] = (incomeByDate[dateKey] || 0) + totalPrice;
    });

    const allDatesSet = new Set([
      ...Object.keys(expenseByDate),
      ...Object.keys(incomeByDate),
    ]);
    const summaryPerDay = Array.from(allDatesSet)
      .sort()
      .map((dateStr) => {
        const expense = expenseByDate[dateStr] || 0;
        const income = incomeByDate[dateStr] || 0;
        const net = income - expense;

        const dateObj = new Date(dateStr);
        const options = {
          weekday: "long",
          day: "2-digit",
          month: "long",
          year: "numeric",
        };
        const formattedDate = dateObj.toLocaleDateString("id-ID", options);

        return {
          date: formattedDate,
          expense,
          income,
          net,
        };
      });

    const totalExpense = expenses.reduce((sum, e) => sum + e.total, 0);
    const totalIncome = incomes.reduce((sum, i) => sum + i.totalPrice, 0);
    const totalNet = totalIncome - totalExpense;

    return {
      summaryPerDay,
      totalExpense,
      totalIncome,
      totalNet,
    };
  }

  static async getYearlyProfitSummary(request) {
    const userId = request.user.id;
    const { year } = request.query;

    if (!year) {
      throw new ResponseError("Parameter year wajib diisi", 400);
    }

    const yearNum = parseInt(year);
    if (isNaN(yearNum) || yearNum < 1970 || yearNum > 3000) {
      throw new ResponseError("Parameter year tidak valid", 400);
    }

    const startDate = new Date(yearNum, 0, 1);
    const endDate = new Date(yearNum, 11, 31, 23, 59, 59, 999);

    const expenses = await prisma.expense.findMany({
      where: {
        userId,
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      select: {
        total: true,
        createdAt: true,
      },
    });

    const incomes = await prisma.income.findMany({
      where: {
        userId,
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      select: {
        totalPrice: true,
        createdAt: true,
      },
    });

    const monthlyExpense = {};
    const monthlyIncome = {};

    const formatMonth = (date) => {
      const d = new Date(date);
      const m = (d.getMonth() + 1).toString().padStart(2, "0");
      return `${d.getFullYear()}-${m}`;
    };

    expenses.forEach(({ total, createdAt }) => {
      const monthKey = formatMonth(createdAt);
      monthlyExpense[monthKey] = (monthlyExpense[monthKey] || 0) + total;
    });

    incomes.forEach(({ totalPrice, createdAt }) => {
      const monthKey = formatMonth(createdAt);
      monthlyIncome[monthKey] = (monthlyIncome[monthKey] || 0) + totalPrice;
    });

    const result = [];
    for (let m = 1; m <= 12; m++) {
      const monthStr = m.toString().padStart(2, "0");
      const monthKey = `${yearNum}-${monthStr}`;

      const expense = monthlyExpense[monthKey] || 0;
      const income = monthlyIncome[monthKey] || 0;
      const net = income - expense;

      result.push({
        month: monthKey,
        expense,
        income,
        net,
      });
    }

    return result;
  }

  static async getAllUserInputs() {
    const users = await prisma.user.findMany({
      where: {
        role: "USER",
      },
      select: {
        id: true,
        name: true,
        email: true,
        items: {
          select: {
            id: true,
            name: true,
            type: true,
            photo: true,
            createdAt: true,
          },
        },
        expenses: {
          select: {
            id: true,
            itemId: true,
            item: {
              select: {
                name: true,
                type: true,
              },
            },
            type: true,
            totalQuantityKg: true,
            note: true,
            createdAt: true,
          },
        },
        incomes: {
          select: {
            id: true,
            itemId: true,
            item: {
              select: {
                name: true,
                type: true,
              },
            },
            totalQuantityKg: true,
            note: true,
            createdAt: true,
          },
        },
      },
    });

    return users;
  }
}

module.exports = RekaptulasiService;
