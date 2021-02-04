const fs = require("fs");
const path = require("path");
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const cors = require("cors");
const multer = require("multer");

const placesRoutes  = require("./routes/places-routes");
const usersRoutes = require("./routes/users-routes");
const HttpError = require("./models/http-error");

const app = express();

app.use(bodyParser.json());



//api/places/....
app.use(cors());
app.use("/uploads/images", express.static(path.join('uploads', 'images')));
app.use(express.static(path.join('public')));

// app.use((req, res, next) => {
//   res.setHeader("Access-Control-Allow-Origin", "*");
//   res.setHeader(
//     "Access-Control-Allow-Headers",
//     "Origin, X-Requested-With, Content-Type,Accept, Authortization"
//   );
//   res.setHeader("Acces-Control-Allow-Methods", "GET, POST, PATCH, DELETE");
//   next();
// });

app.use("/api/places", placesRoutes);
app.use("/api/users", usersRoutes);

app.use((req, res, next)=>{
  res.sendFile(path.resolve(__dirname, 'public', 'index.html'));
})

// app.use((req, res, next) => {
//   const error = new HttpError("couldnt find this location or user", 404);
//   throw error;
// });
//we're defining here a middlewere for the errors
//in whole app that if any error occurs in
//any of the other route it will be handled here
app.use((error, req, res, next) => {
  if (req.file) {
    fs.unlink(req.file.path, (err) => {
      console.log(err);
    });
  }
  if (res.headerSent) {
    return next(error);
  }
  res.status(error.code || 500);
  res.json({ message: error.message || 'An unknown error occurred!' });
});

mongoose
  .connect(
    `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.apms9.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`,
   { useUnifiedTopology: true },
  { useNewUrlParser: true }
  )
  .then(() => {
    app.listen(process.env.PORT ||5000);
  })
  .catch((err) => {
    console.error(err);
  });
