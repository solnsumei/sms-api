import Joi from '@hapi/joi';
import Contact from '../models/Contact';

const opt = { abortEarly: false };
const itemTypes = {
  body: 'body',
  params: 'params',
};

// validate function based off joi validation
const validate = ({ itemType, schema, opt }) => async (ctx, next) => {
  const toValidateObj = itemType === 'body' ? ctx.request.body : ctx[itemType];
  const options = { ...opt, allowUnknown: true, };

  const result = Joi.validate(toValidateObj, schema, { ...options });

  if (!result.error) {
    return next();
  }

  // map through and extract error messages
  const message = result.error.details
    .map(e => e.message).join(', ').replace(/"/g, '');

  return ctx.throw(400, message);
};

export const validateContactId = () => validate({
  schema: {
    id: Joi.string().hex().length(24).required()
      .error(() => ({ message: 'Invalid contact Id' })),
  },
  itemType: itemTypes.params,
});

export const validateParams = () => validate({
  schema: {
    contactId: Joi.string().hex().length(24).required()
      .error(() => ({ message: 'Invalid contact Id' })),
    smsId: Joi.string().hex().length(24).required()
      .error(() => ({ message: 'Invalid sms Id' })),
  },
  itemType: itemTypes.params,
});

const contactSchema = {
  name: Joi.string().min(2).max(30).required(),
  phoneNumber: Joi.string().length(11).regex(/^\d{11}$/).required()
    .error(() => ({ message: 'Please provide a valid phone number' })),
};

const smsSchema = {
  recipientId: Joi.string().hex().length(24).required(),
  message: Joi.string().min(1).max(150).required(),
};

/**
 * Validate existence of recipient and sender's contact in database
 * @param {Object} ctx 
 */
export const validateSenderAndRecipientIds = () => async (ctx, next) => {
  const { recipientId } = ctx.request.body;
  const { id } = ctx.params;

  try {
    const contact = await Contact.findOne({ _id: id });
    const recipient = await Contact.findOne({ _id: recipientId });

    if (!contact && !recipient) {
      ctx.throw(400, 'Sender id and recipient ids are invalid');
    }

    if (!contact) {
      ctx.throw(400, 'Sender id is invalid');
    }

    if (!recipient) {
      ctx.throw(400, 'Recipient id is invalid');
    }

    return next();

  } catch (error) {
    throw error;
  }
};

export const validateContact = () => validate({
  schema: contactSchema,
  itemType: itemTypes.body,
  opt,
});

export const validateSms = () => validate({
  schema: smsSchema,
  itemType: itemTypes.body,
  opt,
});
