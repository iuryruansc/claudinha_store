module.exports = (req, res, next) => {
  res.sendSuccess = (message, data = {}) => {
    return res.json({ success: true, message, ...data });
  };
  next();
};
