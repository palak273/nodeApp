const express = require("express");
const { check, validationResult} = require("express-validator/check");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const router = express.Router();
const User = require('../models/User')
const Note = require('../models/NewNote')
const Todo = require('../models/ToDo')
const auth = require("./../middleware/auth");

router.post(
    "/signin",
    async (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          errors: errors.array()
        });
      }
  
      const { username, password } = req.body;
      try {
        let user = await User.findOne({
          username
        });
        if (!user)
          return res.status(400).json({
            message: "User Not Exist"
          });
  
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch)
          return res.status(400).json({
            message: "Incorrect Password !"
          });
  
        const payload = {
          user: {
            id: user.id
          }
        };
  
        jwt.sign(
          payload,
          "secret",
          {
            expiresIn: 3600
          },
          (err, token) => {
            if (err) throw err;
            res.status(200).json({
              token
            });
          }
        );
      } catch (e) {
        console.error(e);
        res.status(500).json({
          message: "Server Error"
        });
      }
      
    }
  );

  router.post(
    "/signup",
    [
        check("username", "Please Enter a Valid Username")
        .not()
        .isEmpty(),
        check("email", "Please enter a valid email").isEmail(),
        check("password", "Please enter a valid password").isLength({
            min: 6
        })
    ],
    async (req, res) => {
        const errors = validationResult(req);
        
        if (!errors.isEmpty()) {
            return res.status(400).json({
                errors: errors.array()
            });
        }

        const {
            username,
            email,
            password
        } = req.body;
        try {
            let user = await User.findOne({
                email
            });
            if (user) {
                return res.status(400).json({
                    msg: "User Already Exists"
                });
            }

            user = new User({
                username,
                email,
                password
            });

            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(password, salt);

            await user.save();

            const payload = {
                user: {
                    id: user.id
                }
            };

            jwt.sign(
                payload,
                "secret", {
                    expiresIn: 10000
                },
                (err, token) => {
                    if (err) throw err;
                    res.status(200).json({
                        token
                    });
                }
            );
        } catch (err) {
            console.log(err.message);
            res.status(500).send("Error in Saving");
        }
    }
);

router.post(
  "/addnote",
  async (req, res) => {
    note = new Note({
      note: req.body.val
    })
    await note.save()
    res.send("Hi")
  }
);

router.get("/allnotes", async (req, res) => {
  const notes = await Note.find({});
  res.send(notes);
});

router.post(
  "/removenote",
  async (req, res) => {
    var id = req.body.id
    var query = {_id : id}
    Note.findOneAndRemove(
        query,
        (err, oldNote) => {
            if(err) {
                res.send('Could not delete')
            } else {
                console.log(oldNote)
                res.send("Note Removed")
            }
        }
    )
  }
);

router.post(
  "/addtodo",
  async (req, res) => {
    todo = new Todo({
      todo: req.body.val
    })
    await todo.save()
    res.send("Hi")
  }
);

router.get("/alltodos", async (req, res) => {
  const todos = await Todo.find({});
  res.send(todos);
})

router.post(
  "/removetodo",
  async (req, res) => {
    var id = req.body.id
    var query = {_id : id}
    Todo.findOneAndRemove(
        query,
        (err, oldTodo) => {
            if(err) {
                res.send('Could not delete')
            } else {
                console.log(oldTodo)
                res.send("Todo Removed")
            }
        }
    )
  }
);

/*router.get("/me", auth, async (req, res) => {
    try {
      // request.user is getting fetched from Middleware after token authentication
      const user = await User.findById(req.user.id);
      res.send()
      res.json(user);
    } catch (e) {
      res.send({ message: "Error in Fetching user" });
    }
  });*/

module.exports = router