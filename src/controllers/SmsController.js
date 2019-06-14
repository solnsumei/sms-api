import Sms from '../models/Sms';

// Query for sms with sender or recipient as the contact
const senderRecipientQuery = ({ contactId, smsId }) => ({
  $and: [{ _id: smsId },
  { $or: [{ sender: contactId }, { recipient: contactId }], }],
});

export default {
  async create(ctx) {
    const { recipientId: recipient, message } = ctx.request.body;
    const { id } = ctx.params;

    try {
      const sms = await Sms.create({
        sender: id,
        recipient,
        message,
      });

      await sms.populate({
        path: 'recipient',
        select: '-__v',
      }).execPopulate();

      ctx.status = 201;
      ctx.body = {
        _id: sms._id,
        sender: sms.sender,
        recipient: sms.recipient,
        message: sms.message,
      };
      
    } catch (error) {
      throw error;
    }
  },
  async read(ctx) {
    const { contactId, smsId } = ctx.params;
    try {
      // Only sender and recipient of a sms can delete an sms
      const sms = await Sms.findOne(senderRecipientQuery({ contactId, smsId }),
        [ 'message', 'status', 'sender', 'recipient' ]);

      if (!sms) {
        ctx.throw(404, 'Resource not found');
      }

      const isRecipient = sms.recipient.equals(contactId);

      // If contact is the recipient of the message update status field to read.
      if (isRecipient && sms.status === 'unread') {
        sms.status = 'read';
        sms.save();
      }

      // If contact is the sender populate recipient else sender
      await sms.populate({
        path: isRecipient ? 'sender' : 'recipient',
        select: '-__v',
      }).execPopulate();

      ctx.status = 200;
      ctx.body = sms;
    } catch (error) {
      throw error;
    }
  },
  async delete(ctx) {
    const { contactId, smsId } = ctx.params;

    try {
      // Only sender and recipient of a sms can delete an sms
      const sms = await Sms.findOneAndDelete(
        senderRecipientQuery({ contactId, smsId }));

      if (!sms) {
        ctx.throw(404, 'Resource not found');
      }

      ctx.status = 200;
      ctx.body = { message: 'Sms deleted successfully' };
    } catch (error) {
      throw error;
    }
  }
}
