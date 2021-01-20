const express = require("express");
const _ = require("lodash");
const { Card, validateCard, generateBiznumber } = require("../models/card");
const auth = require("../middleware/auth");
const router = express.Router();

router.delete("/:id", auth, async (req, res) => {
  const card = await Card.findOneAndRemove({
    _id: req.params.id,
    user_id: req.user._id,
  });
  if (!card)
    return res.status(404).send("The card with the given ID was not found.");
  res.send(card);
});

router.put("/:id", auth, async (req, res) => {
  const { error } = validateCard(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  let card = await Card.findOneAndUpdate(
    { _id: req.params.id, user_id: req.user._id },
    req.body
  );
  if (!card)
    return res.status(404).send("The card with the given ID was not found..");

  card = await Card.findOne({ _id: req.params.id, user_id: req.user._id });
  res.send(card);
});

router.get("/my-cards", auth, async (req, res) => {
  if (!req.user.biz) {
    return res.status(401).send("Access denied");
  }
  const cards = await Card.find({
    user_id: req.user._id,
  });
  if (!cards) return res.status(404).send("You don't have cards in your list");
  res.send(cards);
});
router.get("/cards-list", auth, async (req, res) => {
  const cards = await Card.find();
  if (!cards) return res.status(404).send("You don't have cards in your list");
  res.send(cards);
});
router.get("/:id", auth, async (req, res) => {
  const card = await Card.findOne({
    _id: req.params.id,
    user_id: req.user._id,
  });
  if (!card)
    return res.status(404).send("The card with the given ID was not found.");
  res.send(card);
});
router.post("/", auth, async (req, res) => {
  if (!req.user.biz) return res.status(401).send("Only biz cand open card"); //check if the user has biz previlige.

  const { error } = validateCard(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  let card = new Card({
    bizName: req.body.bizName,
    bizOffer: req.body.bizOffer,
    bizDescription: req.body.bizDescription,
    bizType: req.body.bizType,
    bizArea: req.body.bizArea,
    bizRooms: req.body.bizRooms,
    bizPrice: req.body.bizPrice,
    bizAddress: req.body.bizAddress,
    bizPhone: req.body.bizPhone,
    bizPublisher: req.body.bizPublisher,
    bizImage: req.body.bizImage
      ? req.body.bizImage
      : "https://cdn.pixabay.com/photo/2013/07/13/12/48/cottage-160367__340.png",
    bizNumber: await generateBiznumber(Card),
    user_id: req.user._id,
  });

  card = await card.save();
  res.send(card);
});

module.exports = router;
