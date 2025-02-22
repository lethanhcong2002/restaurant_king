const express = require('express');
const router = express.Router();
const evaluationController = require('../controllers/evaluationController.cjs');

router.get('/getEvaluation', evaluationController.getEvaluations);

module.exports = router;
