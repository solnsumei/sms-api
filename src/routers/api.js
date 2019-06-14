import Router from 'koa-router';
import ContactsController from '../controllers/ContactsController';
import SmsController from '../controllers/SmsController';

import {
  validateContact,
  validateContactId,
  validateParams,
  validateSms,
  validateSenderAndRecipientIds,
} from '../middlewares/validators';


const api = new Router({ prefix: '/api/v1' });

// Contacts routes
api.get('/contacts', ContactsController.fetchAll);

api.post('/contacts',
  validateContact(),
  ContactsController.add,
);

api.get('/contact/:id',
  validateContactId(),
  ContactsController.fetchOne,
);

api.delete('/contact/:id',
  validateContactId(),
  ContactsController.delete,
);

// Sms routes
api.post('/contact/:id/sms',
  validateContactId(),
  validateSms(),
  validateSenderAndRecipientIds(),
  SmsController.create,
);

api.get('/contact/:contactId/sms/:smsId',
  validateParams(),
  SmsController.read,
);

api.delete('/contact/:contactId/sms/:smsId',
  validateParams(),
  SmsController.delete,
);

export default api;
