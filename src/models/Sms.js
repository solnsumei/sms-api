import mongoose from 'mongoose';


const smsSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Contact',
    allowNull: false,
  },
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Contact',
    default: null,
  },
  message: {
    type: String,
    allowNull: false,
    trim: true,
  },
  status: {
    type: String,
    enum: ['unread', 'read'],
    default: 'unread',
  },
});

const Sms = mongoose.model('Sms', smsSchema, 'sms');

export default Sms;
