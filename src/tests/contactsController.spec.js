import request from 'supertest';
import app from '../app';
import Contact from '../models/Contact';
import {
  invalidContact,
  contact1,
} from './data/mockData';


let server;
let baseUrl = '/api/v1';
let contactId;

beforeAll(async () => {
  server = app.callback();
});

afterAll(async () => {
  await Contact.deleteMany({});
});

describe('Contacts Controller', () => {
  describe('POST /api/v1/contacts', () => {
    test('should return invalid data', async () => {
      const response = await request(server)
        .post(`${baseUrl}/contacts`)
        .send(invalidContact);

      expect(response.status).toEqual(400);
      expect(response.body.message)
        .toEqual("name is not allowed to be empty, name length must be at least 2 characters long, Please provide a valid phone number");
    });

    test('should return invalid phone number', async () => {
      const response = await request(server)
        .post(`${baseUrl}/contacts`)
        .send({ ...invalidContact, name: 'Oge' });

      expect(response.status).toEqual(400);
      expect(response.body.message).toEqual("Please provide a valid phone number");
    });

    test('should create a contact', async () => {
      const response = await request(server)
        .post(`${baseUrl}/contacts`)
        .send(contact1);

      contactId = response.body._id;

      expect(response.status).toEqual(201);
      expect(response.body.name)
        .toEqual(contact1.name);
      expect(response.body.phoneNumber)
        .toEqual(contact1.phoneNumber);
    });

    test('should throw duplicate error', async () => {
      const response = await request(server)
        .post(`${baseUrl}/contacts`)
        .send(contact1);

      expect(response.status).toEqual(409);
      expect(response.body.message)
        .toEqual("Contact already exists");
    });
  });

  describe('GET /api/v1/contacts', () => {
    test('should return status of 200', async () => {
      const response = await request(server).get(`${baseUrl}/contacts`);

      expect(response.status).toEqual(200);
      expect(response.body.length).toEqual(1);
    });
  });

  describe('GET /api/v1/contact/:id', () => {
    test('should invalid contact Id', async () => {
      const response = await request(server)
        .get(`${baseUrl}/contact/5cec302eb5dca965e3f5b43`);

      expect(response.status).toEqual(400);
      expect(response.body.message).toEqual("Invalid contact Id");
    });

    test('should return not found', async () => {
      const response = await request(server)
        .get(`${baseUrl}/contact/5cec302eb5dca965e3f5b436`);

      expect(response.status).toEqual(404);
      expect(response.body.message).toEqual("Resource not found");
    });

    test('should return a contact with empty messages', async () => {
      const response = await request(server)
        .get(`${baseUrl}/contact/${contactId}`);

      expect(response.status).toEqual(200);
      expect(response.body.name).toEqual(contact1.name);
      expect(response.body.sentMessages)
        .toEqual([]);
    });
  });

  describe('DELETE /api/v1/contact/:id', () => {
    test('should return invalid contact Id', async () => {
      const response = await request(server)
        .delete(`${baseUrl}/contact/5cec302eb5dca965e3f5b436`);

      expect(response.status).toEqual(404);
      expect(response.body.message).toEqual("Resource not found");
    });

    test('should delete the contact', async () => {
      const response = await request(server)
        .delete(`${baseUrl}/contact/${contactId}`);

      const emptyResponse = await request(server)
        .get(`${baseUrl}/contacts`);

      expect(response.status).toEqual(200);
      expect(response.body.message)
        .toEqual("Contact deleted successfully");
      expect(emptyResponse.body.length)
        .toEqual(0);
    });
  });
});
