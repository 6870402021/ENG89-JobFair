const mongoose = require('mongoose');

// The job fair runs May 10th - 13th, 2022 (inclusive)
const FAIR_START = new Date('2022-05-10T00:00:00.000Z');
const FAIR_END = new Date('2022-05-14T00:00:00.000Z'); // exclusive

const InterviewSchema = new mongoose.Schema({
    interviewDate: {
        type: Date,
        required: [true, 'Please add an interview date'],
        validate: {
            validator: (value) => value >= FAIR_START && value < FAIR_END,
            message: 'Interview date must be during May 10th - 13th, 2022'
        }
    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    company: {
        type: mongoose.Schema.ObjectId,
        ref: 'Company',
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Interview', InterviewSchema);
module.exports.FAIR_START = FAIR_START;
module.exports.FAIR_END = FAIR_END;
