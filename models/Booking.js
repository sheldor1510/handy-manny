const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema({
    user_id: {
        type: String,
        required: false
    },
    from_location: {
        type: String,
        required: false
    },
    to_location: {
        type: String,
        required: false
    },
    type: {
        type: String,
        required: false
    },
    status: {
        type: String,
        required: false
    },
    departure_date: {
        type: String,
        required: false
    },
    arrival_date: {
        type: String,
        required: false
    },
    departure_day_time: {
        type: String,
        required: false
    },
    arrival_day_time: {
        type: String,
        required: false
    },
    tickets: {
        type: Number,
        required: false,
    },
    booking_amount: {
        type: Number,
        require: false,
    },
    date: {
        type: Date,
        default: Date.now
    },
})

const Booking = mongoose.model('Booking', BookingSchema);

module.exports = Booking;