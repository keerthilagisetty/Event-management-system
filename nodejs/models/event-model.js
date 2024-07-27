const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const eventSchema = new Schema({
  image: {
    type: String,
  },
  name: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  location: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  starttime:{
    type: String,
    required: true,
  },
  endtime: {
    type: String,
    required: true,
  },
  about: {
    type: String,
    required: true,
  },
  available: {
    type: Boolean,
  },
  bookings:[{
    type:mongoose.Types.ObjectId,
    ref:"Booking",
  }],
  admin:{
    type:mongoose.Types.ObjectId,
    ref:"Admin",
    required:true,
  }
});

module.exports = mongoose.model("Event", eventSchema);