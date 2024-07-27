const mongoose=require("mongoose")

const bookingSchema = new mongoose.Schema({
  event: {
    type:mongoose.Types.ObjectId,
    ref:"Event",
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  user: {
    type:mongoose.Types.ObjectId,
    ref:"User",
    required: true,
  },
});

module.exports = mongoose.model("Booking", bookingSchema);