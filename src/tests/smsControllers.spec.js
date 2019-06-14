import request from 'supertest';
import app from '../app';
import Contact from '../models/Contact';
import Sms from '../models/Sms';

import {
  contact1,
  contact3,
} from './data/mockData';


const message = 'Hello World';
let server;
let baseUrl = '/api/v1';
let contactId1;
let contactId3;
let sms1;
let sms2;

beforeAll(async () => {
  server = app.callback();
  const contacts = await Contact.create([contact1, contact3]);

  contactId1 = contacts[0]._id;
  contactId3 = contacts[1]._id;
});

afterAll(async () => {
  await Contact.deleteMany({});
  await Sms.deleteMany({});
});

describe('Sms Controller', () => {
  describe('POST /api/v1/contact/:id/sms', () => {
    test('should return invalid data', async () => {
      const response = await request(server)
        .post(`${baseUrl}/contact/${contactId1}/sms`)
        .send({ recipientId: 'Okongu', message: '' });

      expect(response.status).toEqual(400);
      expect(response.body.message)
      .toEqual("recipientId must only contain hexadecimal characters, recipientId length must be 24 characters long, message is not allowed to be empty, message length must be at least 1 characters long");
    });

    test('should return recipient and sender is invalid', async () => {
      const response = await request(server)
        .post(`${baseUrl}/contact/5cec302eb5dca965e3f5b436/sms`)
        .send({ recipientId: '5cec302eb5dca965e3f5b436', message });

      expect(response.status).toEqual(400);
      expect(response.body.message).toEqual("Sender id and recipient ids are invalid");
    });

    test('should return sender id is invalid', async () => {
      const response = await request(server)
        .post(`${baseUrl}/contact/5cec302eb5dca965e3f5b436/sms`)
        .send({ recipientId: contactId1, message });

      expect(response.status).toEqual(400);
      expect(response.body.message).toEqual("Sender id is invalid");
    });

    test('should return recipient id is invalid', async () => {
      const response = await request(server)
        .post(`${baseUrl}/contact/${contactId1}/sms`)
        .send({ recipientId: '5cec302eb5dca965e3f5b436', message });

      expect(response.status).toEqual(400);
      expect(response.body.message).toEqual("Recipient id is invalid");
    });

    test('should create an sms', async () => {
      const response1 = await request(server)
        .post(`${baseUrl}/contact/${contactId1}/sms`)
        .send({ recipientId: contactId3, message });

      sms1 = response1.body;

      const response2 = await request(server)
        .post(`${baseUrl}/contact/${contactId3}/sms`)
        .send({ recipientId: contactId1, message });

      sms2 = response2.body;

      expect(response1.status).toEqual(201);
      expect(response2.status).toEqual(201);
      expect(response1.body.recipient.name).toEqual(contact3.name);
      expect(response2.body.recipient.name).toEqual(contact1.name);
    });
  });

  describe('GET /api/v1/contact/:contactId/sms/:smsId', () => {
    test('should return invalid contact Id', async () => {
      const response = await request(server)
        .get(`${baseUrl}/contact/5cec302eb5dca965e3f5b43/sms/5cec302eb5dca965e3f5b436`);

      expect(response.status).toEqual(400);
      expect(response.body.message).toEqual("Invalid contact Id");
    });

    test('should return invalid sms Id', async () => {
      const response = await request(server)
        .get(`${baseUrl}/contact/5cec302eb5dca965e3f5b436/sms/5cec302eb5dca965e35b436`);

      expect(response.status).toEqual(400);
      expect(response.body.message).toEqual("Invalid sms Id");
    });

    test('should return not found', async () => {
      const response = await request(server)
        .get(`${baseUrl}/contact/5cec302eb5dca965e3f5b436/sms/5cec302eb5dca965e3f5b436`);

      expect(response.status).toEqual(404);
      expect(response.body.message).toEqual("Resource not found");
    });

    test('should return sms message with status as unread', async () => {
      const response = await request(server)
        .get(`${baseUrl}/contact/${contactId1}/sms/${sms1._id}`);

      expect(response.status).toEqual(200);
      expect(response.body.message).toEqual(sms1.message);
      expect(response.body.recipient.name).toEqual(contact3.name);
      expect(response.body.status).toEqual('unread');
    });

    test('should return sms message with status as read', async () => {
      const response = await request(server)
        .get(`${baseUrl}/contact/${contactId1}/sms/${sms2._id}`);

      expect(response.status).toEqual(200);
      expect(response.body.message).toEqual(sms1.message);
      expect(response.body.sender.name).toEqual(contact3.name);
      expect(response.body.status).toEqual('read');
    });
  });

  describe('DELETE Contact /api/v1/contact/:id', () => {
    test('should delete the contact with sent messages', async () => {
      const response = await request(server)
        .delete(`${baseUrl}/contact/${contactId1}`);

      const contactMessages = await Sms.find({ 
        $or: [{ sender: contactId1 }, { recipient: contactId1 }] }).exec();

      expect(response.status).toEqual(200);
      expect(response.body.message)
        .toEqual("Contact deleted successfully");
      expect(contactMessages.length)
        .toEqual(0);
    });
  });

  describe('DELETE SMS /api/v1/contact/:contactId/sms/:smsId', () => {
    test('should delete sms message', async () => {
      const response = await request(server)
        .delete(`${baseUrl}/contact/${contactId3}/sms/${sms2._id}`);

      expect(response.status).toEqual(200);
      expect(response.body.message)
        .toEqual("Sms deleted successfully");
    });
  });

  describe('DELETE SMS /api/v1/contact/:contactId/sms/:smsId', () => {
    test('should return resource not found', async () => {
      const response = await request(server)
        .delete(`${baseUrl}/contact/${contactId1}/sms/${sms2._id}`);

      expect(response.status).toEqual(404);
      expect(response.body.message)
        .toEqual("Resource not found");
    });
  });
});
