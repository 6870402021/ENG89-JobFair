const mongoose = require('mongoose');

const CompanySchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a company name'],
        unique: true,
        trim: true,
        maxlength: [100, 'Name can not be more than 100 characters']
    },
    address: {
        type: String,
        required: [true, 'Please add an address'],
        maxlength: [200, 'Address can not be more than 200 characters']
    },
    website: {
        type: String,
        required: [true, 'Please add a website'],
        match: [
            /^https?:\/\/[^\s/$.?#].[^\s]*$/i,
            'Please add a valid URL starting with http:// or https://'
        ]
    },
    description: {
        type: String,
        required: [true, 'Please add a description'],
        maxlength: [1000, 'Description can not be more than 1000 characters']
    },
    tel: {
        type: String,
        required: [true, 'Please add a telephone number']
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Reverse populate with virtuals
CompanySchema.virtual('interviews', {
    ref: 'Interview',
    localField: '_id',
    foreignField: 'company',
    justOne: false
});

module.exports = mongoose.model('Company', CompanySchema);
