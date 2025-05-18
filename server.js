require('dotenv').config();

const express = require('express');
const cors = require('cors');
const app = express();

const swaggerUi = require('swagger-ui-express');
const fs = require('fs');

const port = process.env.PORT || 3000

app.use(cors());
app.use(express.json());

const swaggerDocument = JSON.parse(fs.readFileSync('./swagger.json', 'utf8'));

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use('/', require('./routes'));

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});