const express = require('express');
const { getInterviews, getInterview, addInterview, updateInterview, deleteInterview } = require('../controllers/interviews');

const router = express.Router({ mergeParams: true });

const { protect, authorize } = require('../middleware/auth');

router.route('/')
    .get(protect, getInterviews)
    .post(protect, authorize('admin', 'user'), addInterview);

router.route('/:id')
    .get(protect, getInterview)
    .put(protect, authorize('admin', 'user'), updateInterview)
    .delete(protect, authorize('admin', 'user'), deleteInterview);

module.exports = router;

/**
* @swagger
* /interviews:
*   get:
*     summary: List interview sessions (own bookings for users, all for admin)
*     tags: [Interviews]
*     security:
*       - bearerAuth: []
*     responses:
*       200:
*         description: List of interview sessions
*/

/**
* @swagger
* /interviews/{id}:
*   parameters:
*     - in: path
*       name: id
*       schema:
*         type: string
*       required: true
*   get:
*     summary: Get one interview session (owner or admin)
*     tags: [Interviews]
*     security:
*       - bearerAuth: []
*     responses:
*       200:
*         description: The interview session
*       403:
*         description: Not the owner
*       404:
*         description: Not found
*   put:
*     summary: Edit an interview session's date or company (owner or admin)
*     tags: [Interviews]
*     security:
*       - bearerAuth: []
*     requestBody:
*       content:
*         application/json:
*           schema:
*             type: object
*             properties:
*               interviewDate:
*                 type: string
*                 format: date-time
*               company:
*                 type: string
*     responses:
*       200:
*         description: Updated
*       400:
*         description: Date outside May 10-13, 2022
*   delete:
*     summary: Delete an interview session (owner or admin)
*     tags: [Interviews]
*     security:
*       - bearerAuth: []
*     responses:
*       200:
*         description: Deleted
*/
