import Contact from '../models/Contact';
import {
  columns,
  formattedContact,
  populateSentMessages,
  populateReceivedMessages,
 } from '../utils/helpers';


export default {
  async add(ctx) {
    const { name, phoneNumber } = ctx.request.body;

    try {
      const contact = await Contact.create({
        name,
        phoneNumber,
      });

      ctx.status = 201;
      ctx.body = formattedContact(contact);
    } catch (error) {
      if (error.code === 11000 && error.name === 'MongoError') {
        ctx.throw(409, 'Contact already exists');
      }
      throw error;
    }
  },
  async fetchAll(ctx) {
    try {
      const contacts = await Contact.find({}, columns)
        .exec();

      ctx.status = 200;
      ctx.body = contacts;
    } catch (error) {
      throw error;
    }
  },
  async fetchOne(ctx) {
    const { id } = ctx.params;
    try {
      const contact = await Contact.findOne({ _id: id }, columns)
        .populate(populateSentMessages)
        .populate(populateReceivedMessages)
        .exec();

      if (!contact) {
        ctx.throw(404, 'Resource not found');
      }

      ctx.status = 200;
      ctx.body = contact;
    } catch (error) {
      throw error;
    }
  },
  async delete(ctx) {
    const { id } = ctx.params;

    try {
      const contact = await Contact.findOneAndDelete({ _id: id }).exec();

      if (!contact) {
        ctx.throw(404, 'Resource not found');
      }

      ctx.status = 200;
      ctx.body = { message: 'Contact deleted successfully' };
    } catch (error) {
      throw error;
    }
  }
}
