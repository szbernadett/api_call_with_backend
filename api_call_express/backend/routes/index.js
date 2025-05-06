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

// Add a CORS test endpoint
router.get('/cors-test', (req, res) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  res.json({ 
    message: 'CORS test successful',
    origin: req.headers.origin || 'No origin header'
  });
});

module.exports = router;
