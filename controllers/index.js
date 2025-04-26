const awesomeFunction = (req, res, next) => {
    res.send('Chandler Turner');
};

const returnAnotherPerson = (req, res, next) => {
    res.send('Lucjan Lipka');
};

module.exports = { awesomeFunction, returnAnotherPerson };