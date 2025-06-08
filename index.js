const express = require("express");
const userRoute = require("./src/app/routes/user-route");
const expenseRoute = require("./src/app/routes/expense-route");
const incomeRoute = require("./src/app/routes/income-route");
const rekaptulasiRoute = require("./src/app/routes/rekaptulasi-route");
const lovItemRoute = require("./src/app/routes/lov-item-route");


const cors = require("cors");
const errorMiddleware = require("./src/utils/middleware/error-middleware");

const itemRoute = require("./src/app/routes/item-route");

const app = express();

app.use(express.json());
app.use(cors());
app.get("/", (req, res) => {
  res.json({
    status: true,
    message: "Gapakerem",
  });
});

app.use("", userRoute);
app.use("", itemRoute);
app.use("", expenseRoute);
app.use("", incomeRoute);
app.use("", rekaptulasiRoute);
app.use("", lovItemRoute);

app.use(errorMiddleware);

const PORT = 8080;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
