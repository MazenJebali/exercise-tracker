const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()
const DB = require('mongoose')
/******Import models*******/
const userConstructor = require('./entities/users'),
      exerciseConstructor = require('./entities/exercises');
/*****************************/

app.use(cors())
app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

/******CONNECTION TO DB*******/
DB.connect(process.env.DB_URL);
/*****************************/


app.route("/api/users").post()

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
