const express = require("express");
const { body, validationResult } = require("express-validator");
const db = require("../utils/db");

const router = express.Router();

const acctRegex = /^[0-9]{10,16}$/;
const currencyRegex = /^[A-Z]{3}$/;
const swiftRegex = /^[A-Z0-9]{8}(?:[A-Z0-9]{3})?$/;
const amountRegex = /^(?:\d+)(?:\.\d{1,2})?$/;

const validators = [
  body("amount").matches(amountRegex),
  body("currency").matches(currencyRegex),
  body("provider").isIn(["SWIFT"]),
  body("payee_account").matches(acctRegex),
  body("payee_swift").matches(swiftRegex),
];

function handleValidation(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  next();
}

router.post("/", validators, handleValidation, async (req, res) => {
  try {
    const { amount, currency, provider, payee_account, payee_swift } = req.body;
    await db.query(
      `INSERT INTO transactions (amount, currency, provider, payee_account, payee_swift, status)
       VALUES ($1,$2,$3,$4,$5,'PENDING')`,
      [amount, currency, provider, payee_account, payee_swift]
    );
    res.status(201).json({ message: "Payment captured" });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
