const auth = require("../middleware/auth");
const express = require("express");
const bcrypt = require("bcrypt");
const _ = require("lodash");
const {
  User,
  validate,
  validateCards,
  validateUserUpdate,
  validatePasswordUpdate,
} = require("../models/user");
const { Card } = require("../models/card");
const router = express.Router();

const getCards = async (cardsArray) => {
  const cards = await Card.find({ bizNumber: { $in: cardsArray } });
  return cards;
};

router.get("/favs", auth, async (req, res) => {
  const userId = req.user._id;
  //console.log("req.user._id: ", userId);
  let user = await User.findById(userId);
  res.send(user.cards);
});

router.get("/cards", auth, async (req, res) => {
  if (!req.query.numbers) return res.status(400).send("Missing numbers data");

  let data = {};
  data.cards = req.query.numbers.split(",");

  const cards = await getCards(data.cards);
  res.send(cards);
});

router.patch("/cards", auth, async (req, res) => {
  console.log("req.body: ", req.body);

  // const { error } = validateCards(req.body);
  // console.log(error);
  // if (error) return res.status(400).send(error.details[0].message);

  // const cards = await getCards(req.body.cards);
  // if (cards.length != req.body.cards.length)
  //   res.status(400).send("Card number doesn't match");

  let user = await User.findById(req.user._id);
  user.cards = req.body.cards;
  await User.findOneAndUpdate({ _id: user._id }, { cards: user.cards });

  res.send(user.cards);
});

router.get("/me", auth, async (req, res) => {
  //localhost:3000/api/users/me
  //console.log(req);
  const user = await User.findById(req.user._id).select("-password"); //return the details without the password
  if (!user) return res.status(404).send("User not found."); //if the client deleted the account and the token still exists.
  res.send(user); // send the user details without the password.
});

router.patch("/password", auth, async (req, res) => {
  const { error } = validatePasswordUpdate(req.body);
  //console.log("After router.patch/password and validate: ", req.body);
  if (error) {
    //console.log(error.details[0].message);
    return res.status(400).send(error.details[0].message);
  }
  if (req.body.newPassword !== req.body.confirmedPassword)
    return res
      .status(400)
      .send("New and confirmed passwords are not identicl.");

  let user = await User.findOne({ _id: req.user._id });
  const validPassword = await bcrypt.compare(
    req.body.currentPassword,
    user.password
  ); // בדיקת סיסמא
  if (!validPassword) return res.status(400).send("Invalid password"); //if wrong password

  let userPassword = req.body.newPassword; //pick the new password and put in user object
  const salt = await bcrypt.genSalt(10);
  userPassword = await bcrypt.hash(userPassword, salt); // encrypt the new password

  // console.log("user after password encryption: ", userPassword, user._id);

  await User.findOneAndUpdate({ _id: user._id }, { password: userPassword }); //save the new password in the database

  res.send(_.pick(user, ["name", "email"]));
});

router.patch("/", auth, async (req, res) => {
  const { error } = validateUserUpdate(req.body);
  //console.log(req.body);
  if (error) {
    //console.log(error.details[0].message);
    return res.status(400).send(error.details[0].message);
  }
  let user = {};

  if (req.body.email === req.body.newEmail) {
    user = await User.findOneAndUpdate(
      {
        _id: req.user._id,
      },
      { name: req.body.name }
    );
  } else {
    user = await User.findOne({ email: req.body.newEmail });

    if (user) return res.status(400).send("User already registered");

    //user = new User(_.pick(req.body, ["name", "email", "biz", "cards"]));
    user = await User.findOneAndUpdate(
      {
        _id: req.user._id,
      },
      { email: req.body.newEmail, name: req.body.name }
    );
    console.log("user after findOneAndUpdate: ", user);
  }

  if (!user)
    return res.status(404).send("The user with the given ID was not found..");
  await user.save(); //שומר את הפרטים בדטבייס
  // console.log(user);
  res.send(_.pick(user, ["name", "email"])); //  מחזיר את הפרטים שהוכנסו - אימייל סיסמא
});

router.post("/", async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  let user = await User.findOne({ email: req.body.email });
  if (user) return res.status(400).send("User already registered");

  user = new User(
    _.pick(req.body, ["name", "email", "password", "biz", "cards"])
  );
  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(user.password, salt);
  await user.save(); //שומר את הפרטים בדטבייס
  res.send(_.pick(user, ["name", "email"])); //  מחזיר את הפרטים שהוכנסו - אימייל סיסמא
});

module.exports = router;
