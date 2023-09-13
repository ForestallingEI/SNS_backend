const router = require("express").Router();
const Post = require("../models/Post");
const User = require("../models/User");

//POSTs create
router.post("/", async (req, res) => {
  const newPost = new Post(req.body);
  try {
    const savedPost = await newPost.save();
    return res.status(200).json(savedPost);
  } catch (err) {
    return res.status(500).json(err);
  }
});

//POSTs update
router.put("/:id", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (post.userId === req.body.userId) {
      await post.updateOne({
        $set: req.body,
      });
      return res.status(200).json("投稿編集に成功しました！");
    } else {
      return res.status(403).json("あなたは他の人の投稿を編集できません");
    }
  } catch (err) {
    return res.status(403).json(err);
  }
});

//POST delete
router.delete("/:id", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (post.userId === req.body.userId) {
      await post.deleteOne();
      return res.status(200).json("投稿を削除しました");
    } else {
      return res.status(403).json("他の人の投稿を削除できません");
    }
  } catch (err) {
    return res.status(403).json(err);
  }
});

//GET post
router.get("/:id", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    return res.status(200).json(post);
  } catch (err) {
    return res.status(403).json(err);
  }
});

//like! currente post
router.put("/:id/like", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    //not exsist in followers list
    if (!post.likes.includes(req.body.userId)) {
      await post.updateOne({
        $push: {
          likes: req.body.userId,
        },
      });
      return res.status(200).json("投稿にいいねを押しました！");
    } else {
      await post.updateOne({
        $pull: {
          likes: req.body.userId,
        },
      });
      return res.status(403).json("いいねを外しました");
    }
  } catch (err) {
    return res.status(500).json(err);
  }
});

//get timeline Only for profile-site
router.get("/profile/:username", async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username });
    const posts = await Post.find({ userId: user._id });
    return res.status(200).json(posts); 
  } catch (err) {
    return res.status(500).json(err);
  }
});

//get time-line demo:all,body(for postman) database::userId,params
router.get("/timeline/:userId", async (req, res) => {
  // if :id mixed, err
  try {
    //myself
    const currenteUser = await User.findById(req.params.userId);
    const userPosts = await Post.find({ userId: currenteUser._id });
    //get all posts of followingUser."promise" cose currentUser,userPosts... await
    const friendPosts = await Promise.all(
      currenteUser.followings.map((friendId) => {
        return Post.find({ userId: friendId });
      })
    );
    return res.status(200).json(userPosts.concat(...friendPosts)); //concat(connect) spread(get one by one)
  } catch (err) {
    return res.status(500).json(err);
  }
});

module.exports = router;
