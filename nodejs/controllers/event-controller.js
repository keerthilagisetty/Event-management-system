const Event = require("../models/event-model");
const Admin=require('../models/admin-model')
const util = require('util');
const jwt = require('jsonwebtoken');
const verifyAsync = util.promisify(jwt.verify);
const mongoose=require('mongoose')

const getAllEvents = async (req, res) => {
  try {
    const events = await Event.find();
    if (events.length === 0) {
      return res.status(404).json({ message: "No events found" });
    }
    return res.status(200).json({ events });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

const getById = async (req, res) => {
  const id = req.params.id;
  try {
    const event = await Event.findById(id);
    if (!event) {
      return res.status(404).json({ message: "No event found" });
    }
    return res.status(200).json({ event });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

const addEvent = async (req, res, next) => {
  const extractedToken = req.headers.authorization.split(' ')[1];
  if (!extractedToken || extractedToken.trim() === '') {
    return res.status(404).json({ message: 'Token Not Found' });
  }

  let adminId;
  try {
    const decrypted = await verifyAsync(extractedToken, process.env.jwtSecretKey);
    adminId = decrypted.id;
  } catch (err) {
    return res.status(400).json({ message: `${err.message}` });
  }

  const {
    image,
    name,
    type,
    category,
    location,
    date,
    starttime,
    endtime,
    about,
    available,
  } = req.body;

  let event;
  try {
    event = new Event({
      image,
      name,
      type,
      category,
      location,
      date,
      starttime,
      endtime,
      about,
      available,
      admin: adminId,
    });

    const session = await mongoose.startSession();
    const adminUser = await Admin.findById(adminId);
    session.startTransaction();
    await event.save({ session });
    adminUser.addedEvents.push(event);
    await adminUser.save({ session });
    await session.commitTransaction();
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Request Failed' });
  }

  if (!event) {
    return res.status(500).json({ message: 'Request Failed' });
  }

  return res.status(201).json({ event,eventId:event.id });
};

const updateEvent = async (req, res) => {
  const id = req.params.id;
  const {
    image,
    name,
    type,
    category,
    location,
    date,
    starttime,
    endtime,
    about,
    available,
  } = req.body;

  try {
    const event = await Event.findByIdAndUpdate(
      id,
      {
        image,
        name,
        type,
        category,
        location,
        date,
        starttime,
        endtime,
        about,
        available,
      },
      { new: true }
    );

    if (!event) {
      return res.status(404).json({ message: "Unable To Update By this ID" });
    }

    return res.status(200).json({ event });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

const deleteEvent = async (req, res) => {
  const id = req.params.id;

  try {
    const event = await Event.findByIdAndDelete(id);

    if (!event) {
      return res.status(404).json({ message: "Unable To Delete By this ID" });
    }

    return res.status(200).json({ message: "Event Successfully Deleted" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports = {
  getAllEvents,
  getById,
  addEvent,
  updateEvent,
  deleteEvent,
};
