const awesomeFunction = (req, res, next) => {
    res.json('Chandler Turner');
};

const returnAnotherPerson = (req, res, next) => {
    res.json('Another person');
};

module.exports = { awesomeFunction, returnAnotherPerson };