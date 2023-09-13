const router = require("express").Router();
const User = require("../models/User");

//register user
router.post("/register", async (req, res) => {
  try {
    const newUser = new User({
      username: req.body.username,
      email: req.body.email,
      password: req.body.password,
    });

    const user = await newUser.save();
    return res.status(200).json(user);
  } catch {
    return res.status(500).json(err); // 500 server kanren
  }
});

//login
router.post("/login", async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) return res.status(404).send("ユーザーが見つかりません");

    const vaildPassword = req.body.password === user.password;
    if (!vaildPassword) return res.status(400).json("パスワードが違います");

    return res.status(200).json(user);
  } catch (err) {
    return res.status(500).json(err);
  }
});

// router.get("/", (req, res) => {
//     res.send("auth router");
// });

module.exports = router;
