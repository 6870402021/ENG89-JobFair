const Interview = require('../models/Interview');
const Company = require('../models/Company');

const MAX_INTERVIEWS_PER_USER = 3;
const COMPANY_FIELDS = 'name address website description tel';

const isOwnerOrAdmin = (interview, user) =>
    user.role === 'admin' || interview.user.toString() === user.id;

//@desc Get interview sessions (own for users, all for admin)
//@route GET /api/v1/interviews
//@route GET /api/v1/companies/:companyId/interviews
//@access Private
exports.getInterviews = async (req, res, next) => {
    const filter = {};
    if (req.user.role !== 'admin') {
        filter.user = req.user.id;
    }
    if (req.params.companyId) {
        filter.company = req.params.companyId;
    }

    try {
        const interviews = await Interview.find(filter)
            .populate({ path: 'company', select: COMPANY_FIELDS })
            .populate({ path: 'user', select: 'name email tel' })
            .sort('interviewDate');

        res.status(200).json({ success: true, count: interviews.length, data: interviews });
    } catch (err) {
        console.log(err.stack);
        return res.status(500).json({ success: false, message: 'Cannot find interview sessions' });
    }
};

//@desc Get a single interview session
//@route GET /api/v1/interviews/:id
//@access Private (owner or admin)
exports.getInterview = async (req, res, next) => {
    try {
        const interview = await Interview.findById(req.params.id)
            .populate({ path: 'company', select: COMPANY_FIELDS })
            .populate({ path: 'user', select: 'name email tel' });

        if (!interview) {
            return res.status(404).json({ success: false, message: `No interview session with the id of ${req.params.id}` });
        }
        // user is populated here, so compare against its _id
        if (req.user.role !== 'admin' && interview.user._id.toString() !== req.user.id) {
            return res.status(403).json({ success: false, message: `User ${req.user.id} is not authorized to view this interview session` });
        }

        res.status(200).json({ success: true, data: interview });
    } catch (err) {
        console.log(err.stack);
        return res.status(500).json({ success: false, message: 'Cannot find interview session' });
    }
};

//@desc Book an interview session with a company
//@route POST /api/v1/companies/:companyId/interviews
//@access Private
exports.addInterview = async (req, res, next) => {
    try {
        const company = await Company.findById(req.params.companyId);
        if (!company) {
            return res.status(404).json({ success: false, message: `No company with the id of ${req.params.companyId}` });
        }

        // Users always book for themselves
        const data = {
            interviewDate: req.body.interviewDate,
            company: req.params.companyId,
            user: req.user.id
        };

        // Non-admin users may book at most 3 interview sessions
        const existing = await Interview.countDocuments({ user: req.user.id });
        if (existing >= MAX_INTERVIEWS_PER_USER && req.user.role !== 'admin') {
            return res.status(400).json({
                success: false,
                message: `The user with ID ${req.user.id} has already booked ${MAX_INTERVIEWS_PER_USER} interview sessions`
            });
        }

        const interview = await Interview.create(data);
        res.status(201).json({ success: true, data: interview });
    } catch (err) {
        if (err.name === 'ValidationError' || err.name === 'CastError') {
            return res.status(400).json({ success: false, message: err.message });
        }
        console.log(err.stack);
        return res.status(500).json({ success: false, message: 'Cannot create interview session' });
    }
};

//@desc Update an interview session (date and/or company)
//@route PUT /api/v1/interviews/:id
//@access Private (owner or admin)
exports.updateInterview = async (req, res, next) => {
    try {
        let interview = await Interview.findById(req.params.id);
        if (!interview) {
            return res.status(404).json({ success: false, message: `No interview session with the id of ${req.params.id}` });
        }
        if (!isOwnerOrAdmin(interview, req.user)) {
            return res.status(403).json({ success: false, message: `User ${req.user.id} is not authorized to update this interview session` });
        }

        // Only these fields may change; the owner cannot be reassigned
        const updates = {};
        if (req.body.interviewDate !== undefined) updates.interviewDate = req.body.interviewDate;
        if (req.body.company !== undefined) {
            const company = await Company.findById(req.body.company);
            if (!company) {
                return res.status(404).json({ success: false, message: `No company with the id of ${req.body.company}` });
            }
            updates.company = req.body.company;
        }

        interview = await Interview.findByIdAndUpdate(req.params.id, updates, {
            new: true,
            runValidators: true
        });

        res.status(200).json({ success: true, data: interview });
    } catch (err) {
        if (err.name === 'ValidationError' || err.name === 'CastError') {
            return res.status(400).json({ success: false, message: err.message });
        }
        console.log(err.stack);
        return res.status(500).json({ success: false, message: 'Cannot update interview session' });
    }
};

//@desc Delete an interview session
//@route DELETE /api/v1/interviews/:id
//@access Private (owner or admin)
exports.deleteInterview = async (req, res, next) => {
    try {
        const interview = await Interview.findById(req.params.id);
        if (!interview) {
            return res.status(404).json({ success: false, message: `No interview session with the id of ${req.params.id}` });
        }
        if (!isOwnerOrAdmin(interview, req.user)) {
            return res.status(403).json({ success: false, message: `User ${req.user.id} is not authorized to delete this interview session` });
        }

        await interview.deleteOne();
        res.status(200).json({ success: true, data: {} });
    } catch (err) {
        console.log(err.stack);
        return res.status(500).json({ success: false, message: 'Cannot delete interview session' });
    }
};
