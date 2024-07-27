const mongoose=require('mongoose');
const adminSchema = new mongoose.Schema({
    username: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    addedEvents:[{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Event',
    }],
    });
  
module.exports = mongoose.model('Admin', adminSchema);