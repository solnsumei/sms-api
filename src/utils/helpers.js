export const columns = ['name', 'phoneNumber'];

/**
 * Format location object
 *
 * @param {Object} contact
 * @return {Object} response
 */
export const formattedContact = contact => ({
  _id: contact._id,
  name: contact.name,
  phoneNumber: contact.phoneNumber,
});

export const populateSentMessages = {
  path: 'sentMessages',
  select: '-__v',
  populate: { path: 'recipient', select: '-__v' },
};

export const populateReceivedMessages = {
  path: 'receivedMessages',
  select: '-__v',
  populate: { path: 'sender', select: '-__v' },
};
