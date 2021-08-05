import React, {useState, useEffect} from 'react'
import moment from 'moment';
require('./style.css')
const jwt = require("jsonwebtoken");
require('dotenv').config();
const App = () => {
    // !Setting States for the form values
    const [age, setage] = useState("");
    const [currency_id, setcurrency_id] = useState("");
    const [start_date, setstart_date] = useState("");
    const [end_date, setend_date] = useState("");
    const [all_curencies, setall_curencies] = useState([])
    const [total, settotal] = useState([false, 0, "USD"])

    useEffect(() => {
        // ! Fetching all currencies from an api and storing it in a state
        fetch("https://openexchangerates.org/api/currencies.json", {
            method: "GET",
        }).then((res) => res.json()).then((data) => {
            setall_curencies(Object.entries(data))
        })
    }, [])

    // ! Form Submit Handler
    const handelSubmit = () => {
        // ! Checking all fields to make sure they are not empty
        if (age == '' || currency_id == '' || start_date == '' || end_date == '' || currency_id == "") { 
            alert("Please Fill In All Fields"); /*! Alert An Error Message and stopping the remaing code from running*/
            return false;
        }

        // ! Splitting the age vairible to extract the age and store as an array
            const ageArray = age.split(',');
            for(var k = 0; k < ageArray.length; k++){
                if (ageArray[0] <= 17 || ageArray[k] == 0 || !parseInt(ageArray[k])) {
                    alert("First age must be greater than 18, and age must not be 0") /*! Alert An Error Message and stopping the remaing code from running*/
                    return false;
                }
              }

            //   ! Check the date the user entered to make sure the dates are not behind the current date - (Moment JS)
              var momemnt_start = moment(`${start_date}`, 'YYYY-MM-DD'); 
              var moment_end = moment(`${end_date}`, 'YYYY-MM-DD');
              if (moment_end.diff(momemnt_start, 'days') <= 0) {
                  alert("Start Date Can not be greater then End Date, Please Check Date Order And Try Again") /*! Alert An Error Message and stopping the remaing code from running*/
                  return;
              }
        
            // ! Signing a jwt token to send to the server to verify the current user
            const token =  "Bearer " + jwt.sign("user_good", process.env.REACT_APP_SECRETE_KEY);

            // ! Sending an API request to the server with all the neccesary data.
        fetch('http://localhost:4000/quotation', {
            method: "POST",
            headers: {
                'Content-type': 'application/json',
                'authorization': token, /* JWT Token */
            },
            body: JSON.stringify({
                ageArray,
                currency_id,
                start_date,
                end_date
            })
        }).then((res) => res.json()).then((data) => {
            // ! Console logging the data (Check console for JSON output)
            console.log(data);
            // ! Setting the total value and currency_id recieved from the server to a state  to be able to display it to the user
            settotal([true, data.total, data.currency_id])
        })
        }
    return (
        <div className="container">
            <div className="quotationForm">
                <h1>Get Quotation</h1>
                <span>Please fill in the fileds in the correct order</span>

                {/* ! Using ternary operator to display the total only when the total value is available */}
                {total[0] ? (
                    <div className="messageBox">
                    Total: {total[1] + " " + total[2]}
                </div>
                ) : <></>}
                <p className='label'>Enter Ages</p>
                <small>Please fill in ages seperated by a comma (",").</small>
                <input onChange={(val) => setage(val.target.value)} type="text" placeholder=' Example: 18,24,33' />
                <p className='label'>Enter Currency</p>
                <select onChange={(val) => setcurrency_id(val.target.value)} name="" id="">
                    <option value="">Select Currency</option>
                    {/* Mapping Through all the currencies received from the API */}
                    {all_curencies.map((currency) => (
                        <option value={currency[0]}>{currency[0] + ` (${currency[1]})`}</option>
                    ))}
                </select>
                <p className='label'>Enter Start Date</p>
                <input onChange={(val) => setstart_date(val.target.value)} type="date" placeholder='Enter Start Date' />
                <p className='label'>Enter End Date</p>
                <input onChange={(val) => setend_date(val.target.value)} type="date" placeholder='Enter End Date' />
                <button onClick={() => handelSubmit()}>Submit</button>
            </div>
        </div>
    )
}

export default App
