const mongoose = require("mongoose");
/**

Connect to MongoDB database using the provided username and password
@param {string} username - The username for the MongoDB database
@param {string} password - The password for the MongoDB database
@returns {Promise<void>} - A Promise that resolves once the database is connected, or rejects if there is an error
@throws {Error} - If there is an error while connecting to the database
*/ 

const Connection = async (username, password) => {

    const URL = `mongodb+srv://jaylunagariya:Jay1501@cluster0.wp4chqh.mongodb.net/coinwiz`;
    try {

        mongoose.set('strictQuery', false);
        mongoose.connect(URL, {useUnifiedTopology: true});
        console.log("=========================================================================");
        console.log("Database Connected");
    } catch (err) {
        console.log("Error while connecting to mongoose :" + err);
    } 
} 

module.exports = {
    Connection
};
