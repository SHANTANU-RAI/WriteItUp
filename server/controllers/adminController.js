const Post = require('../models/Post');
const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const adminLayout = '../views/layouts/admin';
const jwtSecret = process.env.JWT_SECRET;

exports.authMiddleware = async (req, res, next) => {
  try {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ message: 'Unauthorized' });

    const decoded = jwt.verify(token, jwtSecret);
    req.userId = decoded.userId;
    next();
  } catch (error) {
    console.log(error);
    return res.status(401).json({ message: 'Unauthorized' });
  }
};

exports.getLogin = async (req, res) => {
  const locals = {
    title: 'Admin',
    description: 'This is a blog app that allows you to create, read, update and delete blog posts.'
  };
  res.render('admin/index', { locals, layout: adminLayout });
};

exports.postLogin = async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) return res.status(400).json({ message: 'Invalid Password' });

    const token = jwt.sign({ userId: user._id }, jwtSecret);
    res.cookie('token', token, { httpOnly: true });
    res.redirect('/admin/dashboard');
  } catch (error) {
    console.log(error);
  }
};

exports.getDashboard = async (req, res) => {
  const data = await Post.find();
  const locals = {
    title: 'Dashboard',
    description: 'Simple Blog created using Node.js and Express'
  };
  res.render('admin/dashboard', { locals, data, layout: adminLayout });
};

exports.viewPost = async (req, res) => {
  const data = await Post.findById(req.params.id);
  const locals = {
    title: data.title,
    description: 'View single post.'
  };
  res.render('admin/view-post', { locals, data, layout: adminLayout });
};

exports.getAddPost = async (req, res) => {
  const locals = {
    title: 'Add post',
    description: 'Create a new post'
  };
  res.render('admin/add-post', { locals, layout: adminLayout });
};

exports.postAddPost = async (req, res) => {
  await Post.create({
    title: req.body.title,
    body: req.body.body
  });
  res.redirect('/admin/dashboard');
};

exports.getEditPost = async (req, res) => {
  const data = await Post.findById(req.params.id);
  const locals = {
    title: 'Edit post',
    description: 'Edit your post'
  };
  res.render('admin/edit-post', { locals, data, layout: adminLayout });
};

exports.putEditPost = async (req, res) => {
  await Post.findByIdAndUpdate(req.params.id, {
    title: req.body.title,
    body: req.body.body,
    updatedAt: Date.now()
  });
  res.redirect(`/admin/edit-post/${req.params.id}`);
};

exports.deletePost = async (req, res) => {
  await Post.deleteOne({ _id: req.params.id });
  res.redirect('/admin/dashboard');
};

exports.postRegister = async (req, res) => {
  const { username, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  try {
    const user = await User.create({ username, password: hashedPassword });
    res.status(201).json({ message: 'User created', user });
  } catch (error) {
    if (error.code === 11000) return res.status(409).json({ message: 'Username already in use' });
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

exports.logout = (req, res) => {
  res.clearCookie('token');
  res.redirect('/');
};
