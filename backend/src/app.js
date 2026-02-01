const express = require('express');
const app = express();
const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const PORT = process.env.PORT || 8000;

const swaggerOptions = {
  swaggerDefinition: {
    info: {
      title: 'T-shirt API',
      version: '1.0.0',
      description: 'API for ordering T-shirts',
    },
  },
  apis: ['src/app.js'],
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

app.use(express.json());

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
})

/**
 * @swagger
 * /tshirt:
 *   get:
 *     description: Get a T-shirt
 *     responses:
 *       200:
 *         description: Returns a T-shirt object
 */
app.get('/tshirt', (req, res) => {
  console.log('T-shirt requested');
  res.status(200).send({
    tshirt: '👕',
    size: 'large'
  });
});

/**
 * @swagger
 * /tshirt/{id}:
 *   post:
 *     description: Order a T-shirt with a logo
 *     parameters:
 *       - name: id
 *         description: ID of the T-shirt
 *         in: path
 *         required: true
 *         type: string
 *       - name: body
 *         in: body
 *         required: true
 *         schema:
 *           type: object
 *           required:
 *             - logo
 *           properties:
 *             logo:
 *               type: string
 *               example: "Nike"
 *     responses:
 *       200:
 *         description: Returns the ordered T-shirt details
 *       418:
 *         description: Logo is required
 */
app.post('/tshirt/:id', (req, res) => {
  const { id } = req.params;
  const { logo } = req.body;

  console.log(`T-shirt order received for ID: ${id} with logo: ${logo}`);

  if (!logo) {
    return res.status(418).send({ error: 'Logo is required' });
  }

  res.send({
    tshirt: `👕 with your ${logo} and ID of ${id}`
  });
});
