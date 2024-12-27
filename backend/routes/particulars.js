const router = require('express').Router()

const { Particular } = require("../models");

router.get("/", async (req, res) => {
    const particulars = await Particular.findAll();
    res.json(particulars);
});

router.post("/", async (req, res) => {
    const { name, type } = req.body;

    if (!name || !type) {
      return res.status(400).json({ error: "Name and type are required." });
    }

    const newParticular = await Particular.create({ name, type });

    res.status(201).json({
      message: "Particular created successfully.",
      particular: newParticular,
    });
});

router.delete('/:id', async (req, res) => {
  await Particular.destroy({ where: { id: req.params.id } });
  res.json({ message: 'Particular deleted' });
});

module.exports = router;
