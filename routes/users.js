const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs')
const User = require('../models/User')
const passport = require('passport')


router.get('/login', (req, res) => res.render('login'));

router.get('/register', (req, res) => res.render('register'));

router.post('/register', (req, res) => {
    const { name, email, password, password2, age, city } = req.body;
    let errors = [];

    if(!name || !email || !password || !password2 || !city || !age ) {
        errors.push({ msg: 'Please fill in all fields' });
    }

    if(password !== password2) {
        errors.push({ msg: 'Passwords do not match' });
    }

    if(password.length < 6) {
        errors.push({ msg: 'Password should be atleast 6 characters' })
    }

    if(age < 14) {
        errors.push({ msg: 'You are not eligible to create an account.' });
    }

    if(errors.length > 0) {
        res.render('register', {
            errors,
            name,
            email,
            password,
            password2,
            city,
            age
        })
    } else {
        User.findOne({ email: email })
            .then(user => {
                if(user) {
                    errors.push({ msg: 'Email is already registered' })
                    res.render('register', {
                        errors,
                        name,
                        email,
                        password,
                        password2,
                        city,
                        age
                    })
                } else {
                    const newUser = new User({
                        name,
                        email,
                        city,
                        age,
                        password
                    })
                    
                    bcrypt.genSalt(10, (err, salt) => bcrypt.hash(newUser.password, salt, (err, hash) => {
                        if(err) throw err;

                        newUser.password = hash;

                        newUser.save()
                            .then(user => {
                                req.flash('success_msg', 'You are now registered and can now log in')
                                res.redirect('/users/login')
                            })
                            .catch(err => console.log(err))
                    })
                    
                    )}
            })
    }

})

router.post('/login', (req, res, next) => {
    passport.authenticate('local', {
        successRedirect: '/dashboard',
        failureRedirect: '/users/login',
        failureFlash: true
    })(req, res , next);
})

router.get('/logout', (req, res, next) => {
    req.logout();
    req.flash('success_msg', 'You are logged out');
    res.redirect('/users/login')
})

module.exports = router;