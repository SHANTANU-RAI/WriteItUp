const Post = require('../models/Post');
const nodemailer = require('nodemailer');
require('dotenv').config();

exports.home = async (req, res) => {
  try {
    const locals = {
      title: "BLOG APP",
      description: "This is a blog app that allows you to create, read, update and delete blog posts.",
    };

    let perPage = 5;
    let page = req.query.page || 1;

    const data = await Post.aggregate([{ $sort: { createdAt: -1 } }])
      .skip((perPage * page) - perPage)
      .limit(perPage)
      .exec();

    const count = await Post.countDocuments();
    const nextPage = parseInt(page) + 1;
    const hasNextPage = nextPage <= Math.ceil(count / perPage);

    res.render('index', {
      locals,
      data,
      current: page,
      nextPage: hasNextPage ? nextPage : null,
      currentRoute: '/user'
    });
  } catch (error) {
    console.log(error);
  }
};

exports.viewPost = async (req, res) => {
  try {
    const data = await Post.findById(req.params.id);
    const locals = {
      title: data.title,
      description: "This is a blog app that allows you to create, read, update and delete blog posts."
    };
    res.render('post', { locals, data, currentRoute: `/user/post/${req.params.id}` });
  } catch (error) {
    console.log(error);
  }
};

exports.searchPost = async (req, res) => {
  try {
    const locals = {
      title: "Search Results",
      description: "This is a blog app that allows you to create, read, update and delete blog posts.",
    };

    let searchTerm = req.body.searchTerm.replace(/[^a-zA-Z0-9 ]/g, "");
    const data = await Post.find({
      $or: [
        { title: { $regex: new RegExp(searchTerm, 'i') } },
        { body: { $regex: new RegExp(searchTerm, 'i') } }
      ]
    });

    res.render("search", {
      data,
      locals,
      currentRoute: '/user'
    });
  } catch (error) {
    console.log(error);
  }
};

exports.about = (req, res) => {
  res.render('about', { currentRoute: '/user/about' });
};

exports.contactGet = (req, res) => {
  res.render('contact', { currentRoute: '/user/contact' });
};

exports.contactPost = async (req, res) => {
  const { name, email, message } = req.body;

  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.MY_EMAIL,
        pass: process.env.EMAIL_PASS
      }
    });

    const mailOptions = {
      from: process.env.MY_EMAIL,
      to: process.env.MY_EMAIL,
      replyTo: email,
      subject: `New message from ${name}`,
      text: `You received a new message from your blog contact form:\n\nName: ${name}\nEmail: ${email}\nMessage:\n${message}`
    };

    await transporter.sendMail(mailOptions);

    res.send(`
      <script>
        alert("Message sent successfully!");
        window.location.href = "/user/contact";
      </script>
    `);
  } catch (error) {
    console.error(error);
    res.status(500).send('Failed to send message.');
  }
};
