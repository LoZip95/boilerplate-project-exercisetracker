const express = require('express')
const app = express()
const mongoose = require("mongoose")
const { Schema } = require("mongoose")
var bodyParser = require('body-parser')
const cors = require('cors')
require('dotenv').config()

app.use(bodyParser.urlencoded({ extended: false }));

//User
const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true
    },
    log: [],
    count: {
        type: Number,
        default: 0,
    }
});
const User = mongoose.model("User", userSchema);



mongoose.connect(process.env.MONGO_URI);

app.use(cors())
app.use(express.static('public'))
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/views/index.html')
});

app.get("/api/users", (req, res) => {
    let users = User.find().then((data) => {
        res.json(data);
    }).catch((error) => {
        res.json(error);
    });
});

app.post("/api/users", (req, res) => {
    const user = new User({ username: req.body.username });
    user.save();
    res.json(user);
});

app.post("/api/users/:_id/exercises", (req, res) => {
    let date = req.body.date ? new Date(req.body.date).toDateString() : new Date().toDateString();
    User.findById(req.params._id).then((user) => {
        user.log.push({
            "description": req.body.description,
            "duration": parseInt(req.body.duration),
            "date": date
        });
        user.count += 1;
        user.save();
        res.json({
            "username": user.username,
            "description": req.body.description,
            "duration": parseInt(req.body.duration),
            "date": date,
            "_id": user._id
        });
    }).catch((error) => {
        res.json(error);
    });
});

app.get("/api/users/:_id/logs", (req, res) => {
    User.findById(req.params._id).then((user) => {
        if (req.query.to && req.query.from) {
            let filtered = user.log.filter(item => (new Date(item.date) >= new Date(req.query.from)) && (new Date(item.date) <= new Date(req.query.to)));
            user.log = filtered;
        }
        if (req.query.limit) {
            let sliced = user.log.slice(0, req.query.limit);
            user.log = sliced;
        }
        res.json(user);
    }).catch((error) => {
        res.json(error);
    });
});





const listener = app.listen(process.env.PORT || 3000, () => {
    console.log('Your app is listening on port ' + listener.address().port)
})