const getPortfolio = (req, res) => {
    res.json({ message: `Portfolio for user ${req.user.userId}` });
};

const addHolding = (req, res) => {
    res.json({ message: 'Add holding endpoint reached.' });
};

module.exports = { getPortfolio, addHolding };