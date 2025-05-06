// Create a new file for API queue management
const Queue = require('better-queue');

// Create a queue with rate limiting
const apiQueue = new Queue(async (task, cb) => {
  try {
    const { url, options, cacheKey } = task;
    console.log(`Processing API request: ${url}`);
    
    const response = await fetch(url, options);
    
    if (!response.ok) {
      throw new Error(`API responded with status: ${response.status}`);
    }
    
    const data = await response.json();
    cb(null, data);
  } catch (error) {
    cb(error);
  }
}, {
  concurrent: 1, // Process one request at a time
  maxRetries: 3,
  retryDelay: 2000,
  afterProcessDelay: 1000 // Wait 1 second between requests
});

// Function to add a request to the queue
const queuedFetch = (url, options = {}, cacheKey = url) => {
  return new Promise((resolve, reject) => {
    apiQueue.push({ url, options, cacheKey }, (err, result) => {
      if (err) return reject(err);
      resolve(result);
    });
  });
};

module.exports = { queuedFetch };