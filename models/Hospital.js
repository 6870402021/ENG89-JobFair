const mongoose = require('mongoose');

const HospitalSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a name'],
        unique: true, //ห้ามซ้ำ
        trim: true, //ตัดช่องว่างด้านหน้าและด้านหลังออก
        maxlength: [50, 'Name can not be more than 50 characters']
    },
    address: {
        type: String,
        required: [true, 'Please add an address'],
        maxlength: [100, 'Address can not be more than 100 characters']
    },
    district: {
        type: String,
        required: [true, 'Please add a district'],
        maxlength: [50, 'District can not be more than 50 characters']
    },
    province: {
        type: String,
        required: [true, 'Please add a province'],
        maxlength: [50, 'Province can not be more than 50 characters']
    },
    postalcode: {
        type: String,
        required: [true, 'Please add a postal code'],
        maxlength: [5, 'Postal code can not be more than 5 digits'],
    },
    telephone: {
        type: String,
    },
    region: {
        type: String,
        required: [true, 'Please add a region'],
    }
},{
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

//Reverse populate with virtuals
HospitalSchema.virtual('appointments', {
    ref: 'Appointment',
    localField: '_id',
    foreignField: 'hospital',
    justOne: false
});

module.exports = mongoose.model('Hospital', HospitalSchema);