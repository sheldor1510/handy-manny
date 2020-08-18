const express = require('express');
const router = express.Router();
const User = require('../models/User')
const passport = require('passport')
const { ensureAuthenticated } = require('../config/auth');

router.get('/', (req, res) => res.render('welcome'))

router.get('/dashboard', ensureAuthenticated, (req, res) => 
res.render('dashboard', {
    name: req.user.name
}))

router.get('/profile', ensureAuthenticated, (req, res) => 
res.render('profile', {
    name: req.user.name,
    email: req.user.email,
    city: req.user.city,
    age: req.user.age,
}))

router.post('/profile', ensureAuthenticated, (req, res) => {
    const { name, email, age, city } = req.body;
    let errors = [];

    User.findById(req.user.id, function (err, user) {

        if (!user) {
            req.flash('error', 'No account found');
            return res.redirect('/profile');
        }


        if(!name || !email || !city || !age ) {
            errors.push({ msg: 'Please fill in all fields' });
        }
    
        if(age < 14) {
            errors.push({ msg: 'You are not eligible to create an account.' });
        }
    
        if(errors.length > 0) {
            res.render('profile', {
                errors,
                name,
                email,
                city,
                age
            })
        }

        user.email =  email;
        user.age = age;
        user.name = name;
        user.city = city;

        user.save(function (err) {
            if(err) {
                console.log(err)
            }
            req.flash('success_msg', 'Your profile was updated')
            res.redirect('/profile')
        })
    });

})

module.exports = router;