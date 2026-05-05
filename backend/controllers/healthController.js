const healthCheck = (req, res) => {
  res.send("Hello World! Your server is working.");
};

module.exports = { healthCheck };
