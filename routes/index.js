const routes = require('express').Router();

const myController = require('../controllers');

const contactsRoutes = require('./contacts');

routes.get('/', myController.awesomeFunction);
routes.get('/awesome', myController.returnAnotherPerson);

routes.use('/contacts', contactsRoutes);

module.exports = routes;