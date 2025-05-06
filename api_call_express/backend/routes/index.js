let express = require('express');
let router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

// Add a test endpoint
router.get('/test-cors', (req, res) => {
  res.json({ message: 'CORS is working!' });
});

module.exports = router;
