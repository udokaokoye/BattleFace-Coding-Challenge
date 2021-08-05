require('dotenv').config();
const express = require("express")
const jwt = require('jsonwebtoken');
const moment = require('moment');
const app = express();

app.use(express.json())

// ! Setting the response headers
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', '*');
    next();
  });


// ! Function used to get the age range of the user which returns a boolean
const getrange = (value,first_value,last_value) => {
    let lower = Math.min(first_value,last_value) , upper = Math.max(first_value,last_value);
    return value >= lower &&  value <= upper ;
}

// ! Function USed to get the ageLoad depending on the users age and anslo the getange() function
const getAgeLoad = (age) => {
    var ageLoadReturn;
    if (getrange(age, 18, 30)) {
        ageLoadReturn = 0.6
    } else if (getrange(age, 31, 40)) {
        ageLoadReturn = 0.7
    } else if (getrange(age, 41, 50)) {
        ageLoadReturn = 0.8
    } else if (getrange(age, 51, 60)) {
        ageLoadReturn = 0.9
    } else if (getrange(age, 61, 70)) {
        ageLoadReturn = 1
    }

    return ageLoadReturn;
}

// ! API Endpoint to give the quotation
app.post('/quotation', authenticateToken, (req, res) => {

    // ! Getting all the values from the request body
    const age = req.body.ageArray;
    const currency_id = req.body.currency_id;
    const start_date = req.body.start_date;
    const end_date = req.body.end_date;

    // ! Checking the user value from the authenticateToken() Function is correct
    if (req.user == "user_good") {
        const fixedRate = 3;
        var ageLoad = 0;
        var total = 0;

        // ! Getting the Trip Length Using the moment JS Library
        var momemnt_start = moment(`${start_date}`, 'YYYY-MM-DD'); 
        var moment_end = moment(`${end_date}`, 'YYYY-MM-DD');
        const tripLength = moment_end.diff(momemnt_start, 'days'); /* Getting the date diffrence in days */

            // ! Looping through the age array to get the age load for every age in the array
            for (let i = 0; i < age.length; i++) {
                ageLoad = getAgeLoad(parseInt(age[i]))

                // ! Calculation of the toatal
                total += fixedRate * ageLoad * tripLength
            }

        res.status(200).json({total: parseInt(total.toFixed(2)), currency_id, quoatation_id: Date.now()}); /* Sending a response back to the client with the total, currency_id, quotation_id  */
    } else {
        // ! Send an error back to the user if the user is not valid
        res.status(401).json({message: "Error"})
    }

})

// ! Authenticate Token Function - used to authenticate the token sent to the server through the authorization heade.
function authenticateToken(req, res, next) {
    // ! Getting the authorization header
    const authHeader = req.headers['authorization'];
    // ! spliting the authHeader to extract the main token
    const token = authHeader && authHeader.split(' ')[1]

    // ! Sending an error if the token was not found
    if (token == null) return res.sendStatus(401).json({message: "Token Not Found"});

    // ! Verifying the token and getting the data from the token
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRETE, (err, user) => {
        if (err) return res.sendStatus(403);

        // ! returning the data through the req parameter
        req.user = user;
        next();
    })
}
const PORT = process.env.PORT || 4000
app.listen(PORT)