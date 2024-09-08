const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()
const DB = require('mongoose')
const bodyParser = require('body-parser')
/******Import models*******/
const userConstructor = require('./entities/users'),
  exerciseConstructor = require('./entities/exercises');
/*****************************/

app.use(cors())
app.use(express.static('public'))


/******CONNECTION TO DB*******/
DB.connect(process.env.DB_URL);
/******ROUTES*******/
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

app.route("/api/users").post(bodyParser.urlencoded({ extended: true }),
  async (req, res) => {
    const sample = new userConstructor({ username: await req.body.username });
    sample.save()
      .then((success) => {
        console.log("user created");
        res.json({ username: success.username, _id: success.id });
      })
      .catch(async (error) => {
        const search = await userConstructor.findOne({ username: req.body.username }, "username");
        if (search) {
          console.log("retrieve user data from DB..");
          res.json(search);
        }
        else {
          console.error(error);
        }
      });
  })
  .get(async (req, res) => {
    req.result = await userConstructor.find();
    res.json(req.result);
  })

app.post("/api/users/:_id/exercises", bodyParser.urlencoded({ extended: true }),
  async (req, res) => {
    const exercice = req.body,
      sample = new exerciseConstructor({
        description: exercice.description,
        duration: Number(exercice.duration),
        date: (exercice.date) ? exercice.date : new Date().toDateString(),
        _id: req.params._id
      });
    const userSearch = await userConstructor.findById(req.params._id);
    if (userSearch) {
      sample.save()
        .then((success) => {
          console.log("exercise saved");
          res.json({
            description: success.description,
            duration: success.duration,
            date: success.date,
            _id: success._id
          })
        })
        .catch(async (error) => {
          const search = await exerciseConstructor.findById(req.params._id, "_id description duration date");

          if (search) {
            console.log("retrieve exercise data from DB..");
            res.json(search);
          }
          else {
            console.error(error);
          }
        })
    }
    else {
      console.error("user id not found in database!");
    }

  })

/*****************************/

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
