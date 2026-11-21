const express = require('express');
const { getCompanies, getCompany, createCompany, updateCompany, deleteCompany } = require('../controllers/companies');

// Include other resource routers
const interviewRouter = require('./interviews');

const router = express.Router();
const { protect, authorize } = require('../middleware/auth');

// Re-route into other resource routers
router.use('/:companyId/interviews', interviewRouter);

router.route('/').get(getCompanies).post(protect, authorize('admin'), createCompany);
router.route('/:id').get(getCompany).put(protect, authorize('admin'), updateCompany).delete(protect, authorize('admin'), deleteCompany);

module.exports = router;

/**
* @swagger
* components:
*   securitySchemes:
*     bearerAuth:
*       type: http
*       scheme: bearer
*       bearerFormat: JWT
*   schemas:
*     Company:
*       type: object
*       required:
*         - name
*         - address
*         - website
*         - description
*         - tel
*       properties:
*         id:
*           type: string
*           description: The auto-generated id of the company
*         name:
*           type: string
*           description: Company name
*         address:
*           type: string
*           description: Company address
*         website:
*           type: string
*           description: Company website (http/https URL)
*         description:
*           type: string
*           description: Short description of the company
*         tel:
*           type: string
*           description: Telephone number
*       example:
*         name: Acme Software Co., Ltd.
*         address: 99 Rama IV Rd, Pathum Wan, Bangkok 10330
*         website: https://acme.example.com
*         description: Software house hiring backend and frontend developers
*         tel: 02-123-4567
*     Interview:
*       type: object
*       required:
*         - interviewDate
*       properties:
*         id:
*           type: string
*         interviewDate:
*           type: string
*           format: date-time
*           description: Must be during May 10th - 13th, 2022
*         user:
*           type: string
*           description: Id of the user who booked
*         company:
*           type: string
*           description: Id of the company
*       example:
*         interviewDate: 2022-05-11T10:00:00.000Z
*/

/**
* @swagger
* tags:
*   - name: Companies
*     description: Companies participating in the job fair
*   - name: Interviews
*     description: Interview session bookings (max 3 per user)
*/

/**
* @swagger
* /companies:
*   get:
*     summary: Returns the list of all companies
*     tags: [Companies]
*     responses:
*       200:
*         description: The list of companies
*         content:
*           application/json:
*             schema:
*               type: array
*               items:
*                 $ref: '#/components/schemas/Company'
*   post:
*     summary: Create a new company (admin)
*     tags: [Companies]
*     security:
*       - bearerAuth: []
*     requestBody:
*       required: true
*       content:
*         application/json:
*           schema:
*             $ref: '#/components/schemas/Company'
*     responses:
*       201:
*         description: The company was created
*       400:
*         description: Validation error
*/

/**
* @swagger
* /companies/{id}:
*   parameters:
*     - in: path
*       name: id
*       schema:
*         type: string
*       required: true
*       description: The company id
*   get:
*     summary: Get a company by id
*     tags: [Companies]
*     responses:
*       200:
*         description: The company
*         content:
*           application/json:
*             schema:
*               $ref: '#/components/schemas/Company'
*       404:
*         description: The company was not found
*   put:
*     summary: Update a company (admin)
*     tags: [Companies]
*     security:
*       - bearerAuth: []
*     requestBody:
*       required: true
*       content:
*         application/json:
*           schema:
*             $ref: '#/components/schemas/Company'
*     responses:
*       200:
*         description: The company was updated
*       404:
*         description: The company was not found
*   delete:
*     summary: Delete a company and its interview sessions (admin)
*     tags: [Companies]
*     security:
*       - bearerAuth: []
*     responses:
*       200:
*         description: The company was deleted
*       404:
*         description: The company was not found
*/

/**
* @swagger
* /companies/{companyId}/interviews:
*   post:
*     summary: Book an interview session with a company
*     tags: [Interviews]
*     security:
*       - bearerAuth: []
*     parameters:
*       - in: path
*         name: companyId
*         schema:
*           type: string
*         required: true
*     requestBody:
*       required: true
*       content:
*         application/json:
*           schema:
*             $ref: '#/components/schemas/Interview'
*     responses:
*       201:
*         description: Booked
*       400:
*         description: Date outside May 10-13, 2022, or user already has 3 bookings
*/
