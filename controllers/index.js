const awesomeFunction = (req, res, next) => {
    res.json({ message: 'Welcome to the Contacts API' });
};

module.exports = { awesomeFunction };