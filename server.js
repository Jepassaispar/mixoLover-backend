// Initial configs
require("dotenv").config();
require("./config/mongo");

//Dependencies
const express = require("express");
const session = require("express-session");
const cors = require("cors");
const MongoStore = require("connect-mongo")(session);
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");

// Server configuration
const app = express();
// app.use(cors([process.env.FRONT_URL]));

// Allow server to parse body from POST Request
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// app.use(cookieParser());
app.use(bodyParser.json({ limit: "400mb", extended: true }));
app.use(bodyParser.urlencoded({ limit: "400mb", extended: true }));

// Session
app.use(
  session({
    cookie: { secure: false, maxAge: 4 * 60 * 60 * 1000 }, // 4 hours
    resave: true,
    saveUninitialized: true,
    secret: process.env.SESSION_SECRET
  })
);

app.use(
  cors({
    origin: [process.env.FRONTEND_URL],
    credentials: true,
    optionsSuccessStatus: 200
  })
);

// // LOGIN
function loggedIn(req, res, next) {
  // // req.session.currentUser = "5dee1baa0c0f7a1fcdef5f9a";
  // console.log("yata ?");
  // console.log(req.session.currentUser);
  // Boolean(req.session.currentUser);
  next();
}
app.use(loggedIn);

//Routing
// res.header("Access-Control-Allow-Origin", "*");
const authRouter = require("./routes/auth-routes");
const cocktails = require("./routes/coktails");
const comments = require("./routes/comment");
const tags = require("./routes/tags");
const userProfile = require("./routes/users");

app.use("/auth-routes", authRouter);
app.use("/cocktail", cocktails);
app.use("/comment", comments);
app.use("/tags", tags);
app.use("/userProfile", userProfile);

//Getting/Usings Router
app.listen(process.env.PORT, () => {
  console.log("Server listening on port http://localhost:" + process.env.PORT);
});
