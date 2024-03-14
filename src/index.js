/**
 * Main server file for My NFT Marketplace.
 * @module server
 */

const express = require("express");

const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const app = express();
const cors = require("cors");
const AccountRoutes = require("./routes/Accountroutes");
const AssetRoutes = require("./routes/Assetroutes");
const EventRoutes = require("./routes/Eventroutes");
const {Connection} = require("./config/db");
require("dotenv").config();

const Port = 80 || process.env.PORT;

// Set up middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());
app.use(cors({
    origin: 'http://16.16.181.107/'
}));


// Set up routes
app.use('/', AccountRoutes);
app.use('/', AssetRoutes);
app.use('/', EventRoutes);

/**
 * Home page of the server.
 * @route {GET} /
 */
app.get("/", (req, res) => {
    res.status(200).json("working HomePage");
})

// Set up database connection
const username = process.env.DB_USERNAME;
const password = process.env.DB_PASSWORD;
Connection(username, password);


// Start server

app.listen(Port, () => {
    console.log("Server running on port " + Port + " Successfully.....");
});
