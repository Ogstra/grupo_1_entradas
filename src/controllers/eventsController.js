const fs = require('fs');
const path = require('path');
const eventsFilePath = path.join(__dirname, '../data/eventsDataBase.json');
const events = JSON.parse(fs.readFileSync(eventsFilePath, 'utf-8'));
const eventsModel = require('../models/eventsModels');
const { validationResult } = require('express-validator');
const { log } = require('console');

const toThousand = n => n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");

const controller = {
	// Root - Show all events
	index: (req, res) => {
		res.render(path.resolve(__dirname, "../views/events.ejs"))
	},

	// Detail - Detail from one event
	detail: (req, res) => {
		const eventId = req.params.id;
		const selectedevent = eventsModel.findbyID(eventId);
		res.render('detail', { event: selectedevent });
	},

	// Create - Form to create
	create: (req, res) => {
		const errors = req.query
		res.render('event-creation-form', {errors: errors}); //hacer llegar de alguna manera los datos del error anterior
	},

	// Create -  Method to store
	store: (req, res) => {
		let result = validationResult(req);
		let eventImage;
		
		if(result.errors.length > 0){
			const errorArray = result.errors.map(error => '&' + error.path + '=' + error.msg);
			const errorString = errorArray.join('');
			res.redirect('/events/create' +'?'+ errorString);
			return;
		}


		if (!req.file) {
			eventImage = 'placeholder.jpg';
		} else {
			eventImage = req.file.filename;
		}

		const newEvent = {
			name: req.body.name,
			price: req.body.price,
			stock: req.body.stock,
			date: req.body.date,
			category: req.body.category,
			image: eventImage,
			time: req.body.time,
			description: req.body.description
		};

		const createdEvent = eventsModel.createEvent(newEvent);
		res.redirect("/events/" + createdEvent.id);
	},

	// Muestra el formulario de edicion
	edit: (req, res) => {
		let currentEvent = eventsModel.findbyID(req.params.id);
		currentEvent.date = eventsModel.handleDate(currentEvent.date);
		res.render('event-edit-form', { currentEvent: currentEvent });
	},

	// Metodo de edicion de eventos
	update: (req, res) => {
		let events = eventsModel.findAll();
		let eventImage;
		let eventID = events.findIndex(event => event.id == req.params.id);


		if (!req.file) {
			eventImage = events[eventID].image;
		} else {
			eventImage = req.file.filename;
		}

		let updatedEvent = {
			id: Number(req.params.id), /* Sin el Number() el id se guarda como string */
			name: req.body.name,
			price: req.body.price,
			stock: req.body.stock,
			date: eventsModel.handleDate(req.body.date),
			category: req.body.category,
			image: eventImage,
			time: req.body.time,
			description: req.body.description
		};

		eventsModel.editEvent(updatedEvent);

		res.redirect('/events/' + updatedEvent.id ); //deberia llevar al detail
	},

	// Delete - Delete one event from DB
	destroy: (req, res) => {
		let events = eventsModel.findAll();
		events = events.filter(event => event.id != req.params.id);
		eventsModel.deleteEvent(events);
		res.redirect('/');
	}
};

module.exports = controller;