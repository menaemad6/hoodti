import emailjs from '@emailjs/browser';
import { EMAIL_CONFIG } from './email.config';

/**
 * Initialize EmailJS with the public key
 * This function should be called before any EmailJS operations
 */
export const initializeEmailService = () => {
  try {
    console.log('Initializing EmailJS service with config:', {
      serviceId: EMAIL_CONFIG.SERVICE_ID ? 'Provided' : 'Missing',
      templateId: EMAIL_CONFIG.TEMPLATE_ID ? 'Provided' : 'Missing',
      publicKey: EMAIL_CONFIG.PUBLIC_KEY ? 'Provided' : 'Missing'
    });
    
    // Initialize the EmailJS SDK with the public key
    emailjs.init({
      publicKey: EMAIL_CONFIG.PUBLIC_KEY,
    });
    
    console.log('EmailJS initialized successfully');
    return true;
  } catch (error) {
    console.error('Failed to initialize EmailJS:', error);
    return false;
  }
}; 