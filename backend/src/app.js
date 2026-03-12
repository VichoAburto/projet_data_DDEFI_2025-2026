const express = require('express');
const app = express();
const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
require('dotenv').config();

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

// The body should be a JSON object with the following structure:
// "features": {
//       "x1": 1,
//       "x2": 2,
//       "x3": 3,
//       "x4": 4,
//       "x5": 5,
//       "x6": 6,
//       "x7": 7,
//       "x8": 8,
//       "x9": 9,
//       "x10": 10,
//       "x11": 11,
//       "x12": 12
//     }

/**
 * @swagger
 * /predict:
 *   post:
 *     description: Get a prediction from the ML service
 *     parameters:
 *       - name: body
 *         in: body
 *         required: true
 *         schema:
 *           type: object
 *           required:
 *             - features
 *           properties:
 *             features:
 *               type: object
 *               required:
 *                 - x1
 *                 - x2
 *                 - x3
 *                 - x4
 *                 - x5
 *                 - x6
 *                 - x7
 *                 - x8
 *                 - x9
 *                 - x10
 *                 - x11
 *                 - x12
 *               properties:
 *                 x1:
 *                   type: number
 *                   example: 1
 *                 x2:
 *                   type: number
 *                   example: 2
 *                 x3:
 *                   type: number
 *                   example: 3
 *                 x4:
 *                   type: number
 *                   example: 4
 *                 x5:
 *                   type: number
 *                   example: 5
 *                 x6:
 *                   type: number
 *                   example: 6
 *                 x7:
 *                   type: number
 *                   example: 7
 *                 x8:
 *                   type: number
 *                   example: 8
 *                 x9:
 *                   type: number
 *                   example: 9
 *                 x10:
 *                   type: number
 *                   example: 10
 *                 x11:
 *                   type: number
 *                   example: 11
 *                 x12:
 *                   type: number
 *                   example: 12
 *     responses:
 *       200:
 *         description: Returns the prediction result from the ML service
 *       500:
 *         description: Failed to reach ML service
 */
app.post("/predict", async (req, res) => {
  try {
    const mlUrl = process.env.ML_SERVICE_URL;
    if (!mlUrl) {
      return res.status(500).json({ error: "ML_SERVICE_URL not set" });
    }

    const r = await fetch(`${mlUrl}/predict`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req.body),
    });

    const data = await r.json();
    return res.status(r.status).json(data);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to reach ML service" });
  }
});
