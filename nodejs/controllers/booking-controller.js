const mongoose=require("mongoose");
const Bookings=require("../models/booking-model");
const Event=require("../models/event-model");
const User=require("../models/user-model");

const newBooking = async (req, res, next) => {
  const { event, date, user } = req.body;

  let existingEvent;
  let existingUser;
  try {
    existingEvent = await Event.findById(event);
    existingUser = await User.findById(user);
    console.log(existingEvent)
    console.log(existingUser)
  } catch (err) {
    return console.log(err);
  }
  if (!existingEvent) {
    return res.status(404).json({ message: "event Not Found With Given ID" });
  }
  if (!existingUser) {
    return res.status(404).json({ message: "User not found with given ID " });
  }
  let booking;

  try {
    booking = new Bookings({
      event,
      date: new Date(`${date}`),
      user,
    });
    const session = await mongoose.startSession();
    session.startTransaction();
    existingUser.bookings.push(booking);
    existingEvent.bookings.push(booking);
    await existingUser.save({ session });
    await existingEvent.save({ session });
    await booking.save({ session });
    session.commitTransaction();
  } catch (err) {
    return console.log(err);
  }

  if (!booking) {
    return res.status(500).json({ message: "Unable to create a booking" });
  }

  return res.status(201).json({ booking });
};

const getBookingById = async (req, res, next) => {
  const id = req.params.id;
  let booking;
  try {
    booking = await Bookings.findById(id);
  } catch (err) {
    return console.log(err);
  }
  if (!booking) {
    return res.status(500).json({ message: "Unexpected Error" });
  }
  return res.status(200).json({ booking });
};

const deleteBooking = async (req, res, next) => {
  const id = req.params.id;
  let booking;
  try {
    booking = await Bookings.findByIdAndDelete(id).populate("user event");
    console.log(booking);
    const session = await mongoose.startSession();
    session.startTransaction();
    await booking.user.bookings.pull(booking);
    await booking.event.bookings.pull(booking);
    await booking.event.save({ session });
    await booking.user.save({ session });
    session.commitTransaction();
  } catch (err) {
    return console.log(err);
  }
  if (!booking) {
    return res.status(500).json({ message: "Unable to Delete" });
  }
  return res.status(200).json({ message: "Successfully Deleted" });
};

exports.newBooking=newBooking
exports.getBookingById=getBookingById
exports.deleteBooking=deleteBooking