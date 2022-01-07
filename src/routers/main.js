// import express js & router dari express js
const express = require('express');
const mainRouter = express.Router();

// deklarasi router sub/import
const wellcomeRouter = require('./wellcome');
const userRouter = require('./users');
const vehicleRouter = require('./vehicles');
const locationRouter = require('./locations');
const historyRouter = require('./history');
const authRouter = require('./auth');

const upload = require('../middlewares/upload');

mainRouter.use("/wellcome", wellcomeRouter); //wellcome
mainRouter.use("/users", userRouter); //user
mainRouter.use("/vehicles", vehicleRouter,); //vehicles
mainRouter.use("/history", historyRouter); //history
mainRouter.use("/auth", authRouter);

mainRouter.post("/upload", upload.single("vehicles"), (req, res) => {
    res.status(200).json({ msg: "Success", url: req.file });
})

// express.method(endpoint, heandler1/2, dsb)
mainRouter.get("/", (require, response) => {
    response.redirect("wellcome");
});

// export main Router
module.exports = mainRouter;