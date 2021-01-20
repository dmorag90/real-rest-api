const Joi = require("@hapi/joi");
const bcrypt = require("bcrypt");
const { User } = require("../models/user");
const express = require("express");
const router = express.Router();

router.post("/", async (req, res) => {
  //console.log("auth is running on server side");
  //console.log(req.body);
  const { error } = validate(req.body); // אם הולידציה עברה אין שגיאה. אם יש לא ממשיכים הלאה
  if (error) return res.status(400).send(error.details[0].message); // אם נולידציה לא עברה - נשלחת הודעת שגיאה עם סטטוס 400

  let user = await User.findOne({ email: req.body.email }); // אם הולידציה עברה בודקים שכתובת האימייל נמצאת בדטבייס
  if (!user) return res.status(400).send("Invalid email or password"); // אם לא נמצאת נשלחת הודעת שגיאה

  const validPassword = await bcrypt.compare(req.body.password, user.password); // בדיקת סיסמא
  if (!validPassword) return res.status(400).send("Invalid email or password"); // אם הסיסמא שגויה - נשלחת הודעה
  //res.send("OK");
  res.json({ token: user.generateAuthToken() }); // אם הסיסמא נכונה, נוצר טוקן ונשלח ברספונס כג'יסון
});

function validate(req) {
  const schema = Joi.object({
    email: Joi.string().min(6).max(255).required().email(),
    password: Joi.string().min(6).max(1024).required(),
  });
  return schema.validate(req);
}

module.exports = router;
