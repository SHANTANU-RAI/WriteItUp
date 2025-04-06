const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');

// Login
router.get('/', adminController.getLogin);
router.post('/', adminController.postLogin);

// Dashboard
router.get('/dashboard', adminController.authMiddleware, adminController.getDashboard);

// View Post
router.get('/viewpost/:id', adminController.authMiddleware, adminController.viewPost);

// Add Post
router.get('/add-post', adminController.authMiddleware, adminController.getAddPost);
router.post('/add-post', adminController.authMiddleware, adminController.postAddPost);

// Edit Post
router.get('/edit-post/:id', adminController.authMiddleware, adminController.getEditPost);
router.put('/edit-post/:id', adminController.authMiddleware, adminController.putEditPost);

// Delete Post
router.delete('/delete-post/:id', adminController.authMiddleware, adminController.deletePost);

// Register
router.post('/register', adminController.postRegister);

// Logout
router.get('/logout', adminController.authMiddleware, adminController.logout);

module.exports = router;
