const router = require('express').Router()
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


router.post("/", async (req, res) => {
    const { clientId, particulars, date, remarks } = req.body;

    if (!clientId || !Array.isArray(particulars) || particulars.length === 0) {
        return res.status(400).json({ error: "Client ID and particulars are required." });
    }

    const joNumber = await Transaction.generateJONumber();

    const newTransaction = await Transaction.create({
        clientId,
        joNumber,
        date: date || new Date(),
        remarks: remarks || null,
    });

    const transactionParticulars = await Promise.all(
        particulars.map(async (particular) => {
        const { particularId, units = 0, unitPrice } = particular;

        const existingParticular = await Particular.findByPk(particularId);
        if (!existingParticular) {
            throw new Error(`Particular with ID ${particularId} not found.`);
        }

        return transactionParticular.create({
            transactionId: newTransaction.id,
            particularId,
            units,
            unitPrice,
        });
        })
    );

    res.status(201).json({
        message: "Transaction created successfully.",
        transaction: {
        ...newTransaction.toJSON(),
        particulars: transactionParticulars,
        },
    });
});

router.delete('/:id', async (req, res) => {
  await Transaction.destroy({ where: { id: req.params.id } });
  res.json({ message: 'Transaction deleted' });
});


module.exports = router;
