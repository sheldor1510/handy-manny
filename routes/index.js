const express = require('express');
const router = express.Router();
const User = require('../models/User')
const bcrypt = require('bcryptjs')
const passport = require('passport')
const { ensureAuthenticated } = require('../config/auth');

router.get('/', (req, res) => res.render('home'))

router.get('/dashboard', ensureAuthenticated, (req, res) => 
res.render('dashboard', {
    name: req.user.name
}))

router.get('/profile', ensureAuthenticated, (req, res) => 
res.render('profile', {
    name: req.user.name,
    email: req.user.email,
}))

router.post('/profile', ensureAuthenticated, (req, res) => {
    const { name, email } = req.body;
    let errors = [];

    User.findById(req.user.id, function (err, user) {

        if (!user) {
            req.flash('error', 'No account found');
            return res.redirect('/profile');
        }


        if(!name || !email ) {
            errors.push({ msg: 'Please fill in all fields' });
        }
    

        if(errors.length > 0) {
            res.render('profile', {
                errors,
                name,
                email,
            })
        }

        user.email =  email;
        user.name = name;

        user.save(function (err) {
            if(err) {
                console.log(err)
            }
            req.flash('success_msg', 'Your profile was updated')
            res.redirect('/profile')
        })
    });

})

router.get('/login', (req, res) => res.render('login'));

router.get('/register', (req, res) => res.render('register'));

router.post('/register', (req, res) => {
    const { name, email, password, age, city, gender, state } = req.body;
    let errors = [];

    if(!name || !email || !password|| !age|| !city|| !gender|| !state ) {
        errors.push({ msg: 'Please fill in all fields' });
    }

    if(password.length < 6) {
        errors.push({ msg: 'Password should be atleast 6 characters' })
    }

    if(age < 16) {
        errors.push({ msg: 'You should atleast be 16 years old to create an account.' })
    }

    if(errors.length > 0) {
        res.render('register', {
            errors,
            name,
            email,
            password,
            age,
            city,
            gender,
            state
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
                        age,
                        city,
                        gender,
                        state
                    })
                } else {
                    const newUser = new User({
                        name,
                        email,
                        password,
                        city,
                        age,
                        gender,
                        state,
                    })
                    
                    bcrypt.genSalt(10, (err, salt) => bcrypt.hash(newUser.password, salt, (err, hash) => {
                        if(err) throw err;

                        newUser.password = hash;

                        newUser.save()
                            .then(user => {
                                req.flash('success_msg', 'You are now registered and can now log in')
                                res.redirect('/login')
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
        failureRedirect: '/login',
        failureFlash: true
    })(req, res , next);
})

router.get('/select-dates', ensureAuthenticated, (req, res) => res.render('dashboard2'));

router.get('/pay', ensureAuthenticated, (req, res) => res.render('pay'));

router.get('/logout', (req, res, next) => {
    req.logout();
    req.flash('success_msg', 'You are logged out');
    res.redirect('/login')
})

module.exports = router;