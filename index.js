const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()
const DB = require('mongoose')
const bodyParser = require('body-parser')
/******Import models*******/
const userConstructor = require('./entities/users'),
  exerciseConstructor = require('./entities/exercises');
const { vary } = require('express/lib/response')
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
        date: (exercice.date) ? new Date(exercice.date) : new Date(),
        idUser: req.params._id
      });

    await userConstructor.findById(req.params._id)
      .then((successUser) => {
        sample.save()
          .then(async (success) => {
            const resUser = await userConstructor.findById(success.idUser).exec();
            console.log("exercise saved");
            res.json({
              username: resUser.username,
              description: success.description,
              duration: success.duration,
              date: success.date.toDateString(),
              _id: success.idUser
            })
          })
          .catch(async (error) => {
            const search = await exerciseConstructor.findOne({ idUser: req.params._id, description: exercice.description }, "description duration date");
            const resUser2 = await userConstructor.findById(req.params._id).exec();
            if (search) {
              const result = { username: resUser2.username, _id: resUser2.id };
              console.log("retrieve exercise data from DB..");
              res.json({ ...search.toObject(), ...result });
            }
            else {
              console.error(error);
            }
          })
      })
      .catch((err) => {
        console.error("user id not found in database!");
      })
  })

app.get("/api/users/:_id/logs", async (req, res) => {
  try {
    const user = await userConstructor.findById(req.params._id, "username _id");

    if (!req.query.from && !req.query.to && !req.query.limit) {
      let exercices = await exerciseConstructor.find({ idUser: req.params._id },
        "description duration date"
      );
      exercices = exercices.map(e => ({
        description: e.description,
        duration: e.duration,
        date: e.date.toDateString()
      }))

      res.json({
        username: user.username,
        count: exercices.length,
        _id: user.id,
        log: exercices
      })
    }
    else {
      let Query = {
        idUser: req.params._id
      };

      if (req.query.from) {
        //exercices = exercices.where('date').gte(new Date(req.query.from));
        Query.date = {
          $gte: new Date(req.query.from)
        }
      }
      else if (req.query.to) {
        //exercices = exercices.where('date').lte(new Date(req.query.to));
        Query.date = {
          $lte: new Date(req.query.to)
        }
      }
      else if (req.query.to && req.query.from) {
        Query.date = {
          $gte: new Date(req.query.from),
          $lte: new Date(req.query.to)
        }
      };

      let exercices = exerciseConstructor.find(Query,
        "description duration date"
      );

      if (req.query.limit) {
        exercices = exercices.limit(Number(req.query.limit));
      };

      exercices = await exercices.exec();

      exercices = exercices.map(e => ({
        description: e.description,
        duration: e.duration,
        date: e.date.toDateString()
      }))

      res.json({
        username: user.username,
        count: exercices.length,
        _id: user.id,
        log: exercices
      })
    }
  }
  catch (error) {
    console.error(error);
  }
})
/*****************************/

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
