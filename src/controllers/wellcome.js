const greeting = (req, res) => {
  res.status(200).json({
    msg: "Congratulations the server is active. to try something add an endpoint already created! before trying to delete the wellcome endpoint",
  });
};

module.exports = {
  greeting,
};
