const awesomeFunction = (req, res, next) => {
    res.send(`
        <h1>Welcome!</h1>
        <a href="/contacts"><button>View All Contacts</button></a>
    `);
};

const returnAnotherPerson = (req, res, next) => {
    res.send('Lucjan Lipka');
};

module.exports = { awesomeFunction, returnAnotherPerson };