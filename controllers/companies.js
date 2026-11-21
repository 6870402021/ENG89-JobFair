const Company = require('../models/Company');
const Interview = require('../models/Interview');

//@desc Get all companies
//@route GET /api/v1/companies
//@access Public
exports.getCompanies = async (req, res, next) => {
    try {
        // Copy req.query and strip control fields
        const reqQuery = { ...req.query };
        const removeFields = ['select', 'sort', 'page', 'limit'];
        removeFields.forEach(param => delete reqQuery[param]);

        // Turn gt/gte/lt/lte/in into Mongo operators
        let queryStr = JSON.stringify(reqQuery);
        queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);
        const filter = JSON.parse(queryStr);

        let query = Company.find(filter);

        // Select fields
        if (req.query.select) {
            query = query.select(req.query.select.split(',').join(' '));
        }

        // Sort
        if (req.query.sort) {
            query = query.sort(req.query.sort.split(',').join(' '));
        } else {
            query = query.sort('name');
        }

        // Pagination
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 25;
        const startIndex = (page - 1) * limit;
        const endIndex = page * limit;
        const total = await Company.countDocuments(filter);

        query = query.skip(startIndex).limit(limit);
        const companies = await query;

        const pagination = {};
        if (endIndex < total) {
            pagination.next = { page: page + 1, limit };
        }
        if (startIndex > 0) {
            pagination.prev = { page: page - 1, limit };
        }

        res.status(200).json({ success: true, count: companies.length, pagination, data: companies });
    } catch (err) {
        console.log(err.stack);
        res.status(400).json({ success: false, message: 'Cannot get companies' });
    }
};

//@desc Get single company
//@route GET /api/v1/companies/:id
//@access Public
exports.getCompany = async (req, res, next) => {
    try {
        const company = await Company.findById(req.params.id);
        if (!company) {
            return res.status(404).json({ success: false, message: `No company with the id of ${req.params.id}` });
        }
        res.status(200).json({ success: true, data: company });
    } catch (err) {
        res.status(400).json({ success: false, message: 'Invalid company id' });
    }
};

//@desc Create a new company
//@route POST /api/v1/companies
//@access Private (admin)
exports.createCompany = async (req, res, next) => {
    try {
        const company = await Company.create(req.body);
        res.status(201).json({ success: true, data: company });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

//@desc Update a company
//@route PUT /api/v1/companies/:id
//@access Private (admin)
exports.updateCompany = async (req, res, next) => {
    try {
        const company = await Company.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });
        if (!company) {
            return res.status(404).json({ success: false, message: `No company with the id of ${req.params.id}` });
        }
        res.status(200).json({ success: true, data: company });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

//@desc Delete a company (and its interview sessions)
//@route DELETE /api/v1/companies/:id
//@access Private (admin)
exports.deleteCompany = async (req, res, next) => {
    try {
        const company = await Company.findById(req.params.id);
        if (!company) {
            return res.status(404).json({ success: false, message: `No company with the id of ${req.params.id}` });
        }
        await Interview.deleteMany({ company: req.params.id });
        await Company.deleteOne({ _id: req.params.id });

        res.status(200).json({ success: true, data: {} });
    } catch (err) {
        res.status(400).json({ success: false, message: 'Failed to delete company' });
    }
};
