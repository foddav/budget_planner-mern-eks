const express = require("express");
const router = express.Router();
const controller = require("../controllers/userController");

router.post("/register", controller.register);
router.post("/login", controller.login);

router.get("/expenses/:username", controller.getExpenses);
router.post("/expenses/:username", controller.addExpense);
router.delete("/expenses/:username", controller.clearExpenses);
router.delete("/expenses/:username/:expenseId", controller.deleteExpense);

module.exports = router;
