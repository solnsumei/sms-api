import mongoose from 'mongoose';
import Sms from './Sms';


const contactSchema = new mongoose.Schema({
  name: {
    type: String,
    allowNull: false,
    unique: true,
    trim: true,
    index: true
  },
  phoneNumber: {
    type: String,
    allowNull: false,
    unique: true,
    trim: true,
    index: true
  },
}, { toJSON: { virtuals: true }, id: false });

// Virtual method to populate contact's sent messages
contactSchema.virtual('sentMessages', {
  ref: 'Sms',
  localField: '_id',
  foreignField: 'sender',
});

// Virtual method to populate contact's received messages
contactSchema.virtual('receivedMessages', {
  ref: 'Sms',
  localField: '_id',
  foreignField: 'recipient',
});

// delete hook
contactSchema.post('findOneAndDelete', async function (doc, next) {
  if (!doc) {
    next();
  }
  // Delete all messages sent by contact
  await Sms.deleteMany({ sender: doc._id });

  // remove reference to contact for recieved messages
  await Sms.updateMany({ recipient: doc._id }, { recipient: null });
  next();
});

const Contact = mongoose.model('Contact', contactSchema, 'contacts');

export default Contact;
