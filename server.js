const express = require('express');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const mongoSanitize = require('@exortek/express-mongo-sanitize');
const connectDB = require('./config/db');
const helmet = require('helmet');
const { xss } = require('express-xss-sanitizer');
const rateLimit = require('express-rate-limit');
const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUI = require('swagger-ui-express');

//Load env vars
dotenv.config({path: './config/config.env'});

//Connect to database
connectDB();

//Route files
const hospitals = require('./routes/hospitals');
const auth = require('./routes/auth');
const app = express();
const appointments = require('./routes/appointments');
app.set('query parser', 'extended');

//Enable CORS so the React frontend can call the API
app.use(cors());

//Body parser
app.use(express.json());

//Cookie parser
app.use(cookieParser());

//Sanitize data (prevent NoSQL injection)
app.use(mongoSanitize());

//Helmet for security headers
app.use(helmet());

app.use(xss());

//Rate limiting
const limiter = rateLimit({
    windowMs: 10 * 60 * 1000, //10 mins
    max: 100
});
app.use(limiter);

//Swagger API docs
const swaggerOptions = {
    swaggerDefinition: {
        openapi: '3.0.0',
        info: {
            title: 'Library API',
            version: '1.0.0',
            description: 'A simple Express VacQ API'
        },
        servers: [
            {
                url: `http://localhost:${process.env.PORT || 5003}/api/v1`
            }
        ],
    },
    apis: ['./routes/*.js'],
};
const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(swaggerDocs));

app.use('/api/v1/auth', auth);
app.use('/api/v1/hospitals', hospitals);
app.use('/api/v1/appointments', appointments);

const PORT = process.env.PORT || 5003;

const server = app.listen(PORT,console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`));

//Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
    console.log(`Error: ${err.message}`);
    //Close server & exit process
    server.close(() => process.exit(1));
});

// dotenv.config({path: './config/config.env'});

// app.use('/api/v1/hospitals', hospitals);

// app.listen(PORT,console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`));