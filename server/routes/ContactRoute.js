import express from 'express';
import { contactLimiter } from '../middleware/rateLimiter.js';
import { sendContactEmail } from '../job/email.js';

const contactRouter = express.Router();

contactRouter.post('/', contactLimiter, async (req, res) => {
  try {
    const { name, email, message, subject } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({
        status: false,
        message: 'Name, email, and message are required',
      });
    }

    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();
    const cleanMessage = message.trim();
    const cleanSubject = subject?.trim() || 'Contact form message';

    if (cleanName.length < 2) {
      return res.status(400).json({
        status: false,
        message: 'Please provide a valid name',
      });
    }

    if (!cleanEmail.includes('@') || !cleanEmail.includes('.')) {
      return res.status(400).json({
        status: false,
        message: 'Please provide a valid email address',
      });
    }

    if (cleanMessage.length < 10) {
      return res.status(400).json({
        status: false,
        message: 'Message must be at least 10 characters',
      });
    }

    const emailSent = await sendContactEmail({
      name: cleanName,
      email: cleanEmail,
      subject: cleanSubject,
      message: cleanMessage,
    });

    if (!emailSent) {
      return res.status(500).json({
        status: false,
        message: 'Failed to send message. Please try again later.',
      });
    }

    return res.status(200).json({
      status: true,
      message: 'Your message has been sent successfully.',
    });
  } catch (error) {
    console.log('Contact form error:', error);

    return res.status(500).json({
      status: false,
      message: 'Failed to send message',
    });
  }
});

export default contactRouter;
