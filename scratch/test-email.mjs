import handler from '../api/send-lead.js';

const mockRequest = {
  method: 'POST',
  body: {
    type: 'consultation',
    name: 'Test EmailJS',
    email: 'rizki45645@gmail.com',
    whatsapp: '1234567890',
    villa_location: 'Ubud',
    bedroom_count: '2',
    current_status: 'rental',
    message: 'Testing emailjs locally',
  }
};

const mockResponse = {
  setHeader: () => { },
  status: function (code) {
    this.statusCode = code;
    return this;
  },
  json: function (data) {
    console.log('Status:', this.statusCode);
    console.log('Response:', data);
  }
};

handler(mockRequest, mockResponse)
  .then(() => console.log('Handler finished'))
  .catch(err => console.error('Handler error:', err));
