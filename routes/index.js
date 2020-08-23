const express = require('express');
const router = express.Router();
const User = require('../models/User')
const Booking = require('../models/Booking')
const bcrypt = require('bcryptjs')
const passport = require('passport')
const { ensureAuthenticated } = require('../config/auth');

router.get('/', (req, res) => res.render('home'))

router.get('/dashboard', ensureAuthenticated, (req, res) => 
res.render('dashboard', {
    name: req.user.name
}))

router.get('/book-tickets', ensureAuthenticated, (req, res) => 
res.render('book-tickets', {
    name: req.user.name
}))

router.post('/account', ensureAuthenticated, (req, res) => {
    const { name, email, age, gender, city, state } = req.body;
    let errors = [];

    User.findById(req.user.id, function (err, user) {

        if (!user) {
            req.flash('error', 'No account found');
            return res.redirect('/account');
        }


        if(!name || !email || !age || !city || !gender || !state ) {
            errors.push({ msg: 'Please fill in all fields' });
        }
    

        if(errors.length > 0) {
            res.render('account', {
                errors,
                name,
                email,
                age,
                city,
                state,
                gender,
                show_cp: ''
            })
        }

        user.email =  email;
        user.name = name;
        user.city = city;
        user.age = age;
        user.gender = gender;
        user.state = state;

        user.save(function (err) {
            if(err) {
                console.log(err)
            }
            req.flash('success_msg', 'Your profile was updated')
            res.redirect('/account')
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

router.get('/select-dates', ensureAuthenticated, (req, res) => res.render('select-dates', {
    name: req.user.name
}))

router.get('/pay', ensureAuthenticated, (req, res) => res.render('pay', {
    name: req.user.name
}))

router.get('/track', ensureAuthenticated, (req, res) => res.render('track', {
    name: req.user.name
}))

router.get('/account', ensureAuthenticated, (req, res) => res.render('account', {
    name: req.user.name,
    email: req.user.email,
    age: req.user.age,
    gender: req.user.gender,
    city: req.user.city,
    state: req.user.state,
    show_cp: ''
}))

router.get('/change-password', ensureAuthenticated, (req, res) => res.render('account', {
    name: req.user.name,
    show_cp: 'show'
}))

router.post('/change-password', ensureAuthenticated, (req, res) => {
    const { new_password, new_password2 } = req.body;
    let errors = [];

    if(!new_password || !new_password2 ) {
        errors.push({ msg: 'Please fill in all fields' });
    }

    if(new_password != new_password2) {
        errors.push({ msg: 'New passwords do not match' })
    }

    if(new_password.length < 6) {
        errors.push({ msg: 'Password should be atleast 6 characters' })
    }

    if(errors.length > 0) {
        res.render('account', {
            errors,
            name: req.user.name,
            new_password,
            new_password2,
            show_cp: 'show'
        })
    }
    User.findById(req.user.id, function (err, user) {
        bcrypt.genSalt(10, (err, salt) => bcrypt.hash(new_password, salt, (err, hash) => {
            if(err) throw err;

            user.password = hash;

            user.save(function (err) {
            if(err) {
                console.log(err)
            }
            req.flash('success_msg', 'Your password was succesfully updated')
            res.redirect('/change-password')
            })
        }))
    })
    

})

router.post('/choose-from', ensureAuthenticated, (req, res) => {
    const { From_Locations, To_Locations } = req.body;
    res.render('book-tickets', {
        name: req.user.name,
        from_location: From_Locations,
        to_location: To_Locations
    })
})

router.post('/choose-dates', ensureAuthenticated, (req, res) => {
    const { Departure_Dates, Departure_Day, Departure_Time, Arrival_Dates, Arrival_Day, Arrival_Time } = req.body;
    res.render('select-dates', {
        name: req.user.name,
        departure_date: Departure_Dates,
        arrival_date: Arrival_Dates,
        departure_day_time: Departure_Day + ', ' + Departure_Time,
        arrival_day_time: Arrival_Day + ', ' + Arrival_Time
    })
})

router.post('/book-tickets', ensureAuthenticated, (req, res) => {
    const { from_location, to_location, optradio } = req.body;
    const newBooking = new Booking({
        user_id: req.user.id,
        from_location,
        to_location,
        type: optradio,
        status: 'incomplete',
    })
    newBooking.save()
        .then(booking => {
            User.findById(req.user.id, function (err, user) {
                user.current_booking_id = newBooking.id
                user.save(function (err) {
                    if(err) {
                        console.log(err)
                        res.sendStatus(500);
                        return;
                    }
                })
                if(err) {
                    console.log(err)
                    res.sendStatus(500);
                    return;
                }
            })
            
        })
        .catch(err => console.log(err))
    res.redirect('/select-dates')
})

router.post('/select-dates', ensureAuthenticated, (req, res) => {
    const { tickets, departure_date, arrival_date, departure_day_time, arrival_day_time } = req.body;
    Booking.findById(req.user.current_booking_id, function (err, booking) {
        booking.departure_date = departure_date
        booking.arrival_date = arrival_date
        booking.departure_day_time = departure_day_time
        booking.arrival_day_time = arrival_day_time
        booking.tickets = tickets

        booking.save(function (err) {
            if(err) {
                console.log(err)
            }
            res.redirect('/pay')
        })
    })
    
})

router.get('/booking-success', ensureAuthenticated, (req, res) => {
    res.render('success')
})

router.get('/logout', (req, res, next) => {
    req.logout();
    req.flash('success_msg', 'You are logged out');
    res.redirect('/login')
})

module.exports = router;