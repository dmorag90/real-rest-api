const Joi = require("@hapi/joi");
const _ = require("lodash");
const mongoose = require("mongoose");

const cardSchema = new mongoose.Schema({
  bizName: {
    type: String,
    required: true,
    minlength: 2,
    maxlength: 255,
  },
  bizOffer: {
    type: String,
    required: true,
    minlength: 4,
    maxlength: 255,
  },
  bizDescription: {
    type: String,
    required: true,
    minlength: 2,
    maxlength: 1024,
  },
  bizType: {
    type: String,
    required: true,
    minlength: 4,
    maxlength: 400,
  },
  bizArea: {
    type: Number,
    required: true,
    min: 1,
    max: 100000,
  },
  bizRooms: {
    type: Number,
    required: true,
    min: 1,
    max: 10000,
  },
  bizPrice: {
    type: Number,
    required: false,
    min: 0,
    max: 100000000,
  },
  bizAddress: {
    type: String,
    required: true,
    minlength: 2,
    maxlength: 400,
  },
  bizPhone: {
    type: String,
    required: true,
    minlength: 9,
    maxlength: 10,
  },
  bizPublisher: {
    type: String,
    required: true,
    minlength: 2,
    maxlength: 255,
  },
  bizImage: {
    type: String,
    required: true,
    minlength: 11,
    maxlength: 1024,
  },
  bizNumber: {
    type: String,
    required: true,
    minlength: 3,
    maxlength: 11, //originally it was 99999999999. It suits a number but not a string.
    unique: true,
  },
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
});

const Card = mongoose.model("Card", cardSchema);

function validateCard(card) {
  const schema = Joi.object({
    bizName: Joi.string().min(2).max(255).required(),
    bizOffer: Joi.string().min(4).max(255).required(),
    bizDescription: Joi.string().min(2).max(1024).required(),
    bizType: Joi.string().min(4).max(400).required(),
    bizArea: Joi.number().min(1).max(100000).required(),
    bizRooms: Joi.number().min(1).max(10000).required(),
    bizPrice: Joi.number().min(0).max(100000000),
    bizAddress: Joi.string().min(2).max(400).required(),
    bizPublisher: Joi.string().min(2).max(255).required(),
    bizPhone: Joi.string()
      .min(9)
      .max(10)
      .required()
      .regex(/^[0][2-9][0-9]{7,8}$/),
    bizImage: Joi.string().min(11).max(1024),
  });
  return schema.validate(card);
}

async function generateBizNumber(Card) {
  while (true) {
    let randomNumber = _.random(100, 999999);
    let card = await Card.findOne({ bizNumber: randomNumber });
    if (!card) return String(randomNumber);
  }
}

exports.Card = Card;
exports.validateCard = validateCard;
exports.generateBiznumber = generateBizNumber;
