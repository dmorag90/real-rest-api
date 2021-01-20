const users = require("./routes/users");
const auth = require("./routes/auth");
const cards = require("./routes/cards");
const express = require("express");
const app = express();
const http = require("http").Server(app);
const mongoose = require("mongoose");
const config = require("config");
const cors = require("cors");
mongoose
  .connect("mongodb://localhost/book_rest_api", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    mongoose.set("useFindAndModify", false);
    console.log("Mongo DB is connected");
  })
  .catch((err) => console.error(err));

//remove when uploading to real server!!!
app.use(cors());
app.use(express.json()); //כל בקשה שתגיע או תשלח תתורגם לג'ייסון
app.use("/api/users", users); // כל הניתובים לכתובת הזו יועברו לקובץ יוזרז שבתיקיית ראוט
app.use("/api/auth", auth);
app.use("/api/cards", cards);

const port = config.get("port");
http.listen(port, () =>
  console.log("The server is running! click http://localhost:" + port)
);
