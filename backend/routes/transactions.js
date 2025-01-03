const router = require('express').Router()
const { sequelize } = require('../utils/db');
const { Transaction, Particular, transactionParticular, Client } = require("../models");

router.get('/', async (req, res) => {
    const transactions = await Transaction.findAll({
        include: [
        {
            model: Client,
            attributes: ['id', 'name'], 
        },
        {
            model: Particular,
            through: {
                attributes: ["units", "unitPrice"], 
            },
        },
        ],
    });
    res.status(200).json(transactions);
});

router.get("/:id", async (req, res) => {
    const { id } = req.params;

    const transaction = await Transaction.findByPk(id, {
      include: {
        model: Particular,
        through: {
          attributes: ["units", "unitPrice"],
        },
      },
    });

    if (!transaction) {
      return res.status(404).json({ error: "Transaction not found." });
    }

    let totalAmount = 0;
    let totalPayments = 0;

    const particulars = transaction.particulars.map((particular) => {
      const { units, unitPrice } = particular.transactionParticular;
      const isPayment = particular.type === "Payment";

      if (!isPayment) {
        totalAmount += units * unitPrice;
      } else {
        totalPayments += unitPrice;
      }

      return {
        name: particular.name,
        units,
        unitPrice,
        amount: isPayment ? 0 : units * unitPrice,
      };
    });

    const balance = Math.max(totalAmount - totalPayments,0);

    res.json({
      transaction: {
        ...transaction.toJSON(),
        particulars,
        totalAmount,
        totalPayments,
        balance,
      },
    });
});


router.post("/", async (req, res, next) => {
  const { clientId, particulars, date, remarks } = req.body;

  if (!clientId || !Array.isArray(particulars) || particulars.length === 0) {
    return res.status(400).json({ error: "Client ID and particulars are required." });
  }

  const t = await sequelize.transaction();

  try {
    const client = await Client.findByPk(clientId, {
      transaction: t,
      lock: t.LOCK.UPDATE, 
    });

    if (!client) {
      throw new Error("Client not found.");
    } 

    const currentClientTotalBalance = client.totalBalance;

    const isPaymentOnly = particulars.every((particular) => particular.particularId === 15);

    if (isPaymentOnly) {
      const totalPayment = particulars.reduce((sum, particular) => {
        return sum + parseFloat(particular.unitPrice);
      }, 0);
    
      console.log("Total Payment:", totalPayment);
    

      if (currentClientTotalBalance <= 0) {
        throw new Error(
          "Cannot create a payment-only transaction when there is no outstanding balance."
        );
      }
    
      if (totalPayment > currentClientTotalBalance) {
        throw new Error(
          `Payment amount cannot exceed the current outstanding balance of ${currentClientTotalBalance}.`
        );
      }
    }

    const joNumber = await Transaction.generateJONumber();

    const newTransaction = await Transaction.create(
      {
        clientId,
        joNumber,
        date: date || new Date(),
        remarks: remarks || null,
      },
      { transaction: t } 
    );

    const transactionParticulars = await Promise.all(
      particulars.map(async (particular) => {
        const { particularId, units = 0, unitPrice } = particular;

        const existingParticular = await Particular.findByPk(particularId, { transaction: t });
        if (!existingParticular) {
          throw new Error(`Particular with ID ${particularId} not found.`);
        }

        return transactionParticular.create(
          {
            transactionId: newTransaction.id,
            particularId,
            units,
            unitPrice,
          },
          { transaction: t }
        );
      })
    );

    const allTransactions = await Transaction.findAll({
      where: { clientId },
      include: {
        model: Particular,
        through: { attributes: ["units", "unitPrice"] },
      },
      transaction: t,
    });

    let grossBalance = 0;
    let totalPayments = 0;
    let lastTransactionDate = null;

    allTransactions.forEach((transaction) => {
      let transactionAmount = 0;
      let transactionPayments = 0;

      transaction.particulars.forEach((particular) => {
        const { units, unitPrice } = particular.transactionParticular;
        if (particular.type === "Payment") {
          transactionPayments += parseFloat(unitPrice) || 0;
        } else {
          transactionAmount += units * unitPrice;
        }
      });

      grossBalance += transactionAmount;
      totalPayments += transactionPayments;

      if (!lastTransactionDate || new Date(transaction.date) > new Date(lastTransactionDate)) {
        lastTransactionDate = transaction.date;
      }
    });

    const totalBalance = Math.max(grossBalance - totalPayments, 0);

    const status =
      totalBalance === 0
        ? allTransactions.length > 0
          ? "Paid"
          : "New"
        : "Pending";

    await client.update(
      {
        totalBalance,
        lastTransactionDate: lastTransactionDate || "No Transactions Yet",
        status,
      },
      { transaction: t }
    );

    await t.commit(); 

    res.status(201).json({
      message: "Transaction created successfully.",
      transaction: {
        ...newTransaction.toJSON(),
        particulars: transactionParticulars,
      },
    });
  } catch (error) {
    await t.rollback(); 
    res.status(500).json({ error: error.message });
  }
});


router.delete('/:id', async (req, res) => {
  await Transaction.destroy({ where: { id: req.params.id } });
  res.json({ message: 'Transaction deleted' });
});


module.exports = router;
