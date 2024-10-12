const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const exphbs = require("express-handlebars");
require("dotenv").config();
const app = express();

const Expense = require("./model/expense");

// Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.engine(
  "handlebars",
  exphbs.engine({
    defaultLayout: "main",
    helpers: {
      formatDate: (date) => {
        const d = new Date(date);
        return d.toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        });
      },
      // deleteExpenseScript: () => {
      //   return `<script>
      //     async function deleteExpense(id) {
      //       const response = await fetch('/expense/delete/' + id, {
      //         method: 'DELETE'
      //       });
      //       console.log({response})
      //       if (response.ok) {
      //         window.location.reload();
      //       } else {
      //         console.error('Failed to delete expense');
      //       }
      //     }
      //   </script>`;
      // },
    },
  })
);
app.set("view engine", "handlebars");

app.use(express.static("public"));

app.get("/", async (req, res) => {
  try {
    const expenses = await Expense.find().lean();

    let totalAmount = 0;
    expenses.forEach((expense) => {
      totalAmount += expense.amount;
    });

    res.render("index", { expenses, totalAmount });
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
});

// Add Expense
app.post("/expense/add", async (req, res) => {
  try {
    const newExpense = new Expense({
      description: req.body.description,
      amount: parseFloat(req.body.amount),
      date: req.body.date,
    });
    await newExpense.save();
    res.redirect("/");
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
});

app.get("/delete-expense", async (req, res) => {
  try {
    await Expense.findByIdAndDelete(req.query.id);
    res.redirect("/");
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
});

home();
async function home() {
  try {
    try {
      await mongoose.connect(process.env.MONGO_URL);
      console.log("MongoDB Connected");
    } catch (error) {
      console.log(error);
    }
    app.listen(process.env.PORT, () => {
      console.log(`Server started on ${process.env.PORT}`);
    });
  } catch (error) {
    console.error(error);
  }
}
