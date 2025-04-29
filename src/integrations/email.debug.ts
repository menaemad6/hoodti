import { EMAIL_CONFIG } from './email.config';

/**
 * This utility function helps debug EmailJS configuration issues
 * It can be called from the browser console to check the current EmailJS configuration
 */
export const debugEmailConfig = () => {
  try {
    // Check if all required EmailJS credentials are provided
    const missingCredentials = [];
    
    if (!EMAIL_CONFIG.SERVICE_ID || EMAIL_CONFIG.SERVICE_ID === "YOUR_EMAILJS_SERVICE_ID") {
      missingCredentials.push('SERVICE_ID');
    }
    
    if (!EMAIL_CONFIG.TEMPLATE_ID || EMAIL_CONFIG.TEMPLATE_ID === "YOUR_EMAILJS_TEMPLATE_ID") {
      missingCredentials.push('TEMPLATE_ID');
    }
    
    if (!EMAIL_CONFIG.PUBLIC_KEY || EMAIL_CONFIG.PUBLIC_KEY === "YOUR_EMAILJS_PUBLIC_KEY") {
      missingCredentials.push('PUBLIC_KEY');
    }
    
    // Return the status of the configuration
    return {
      configStatus: missingCredentials.length === 0 ? 'Valid' : 'Invalid',
      missingCredentials: missingCredentials.length > 0 ? missingCredentials : 'None',
      serviceId: EMAIL_CONFIG.SERVICE_ID,
      templateId: EMAIL_CONFIG.TEMPLATE_ID,
      publicKey: EMAIL_CONFIG.PUBLIC_KEY ? '****' + EMAIL_CONFIG.PUBLIC_KEY.slice(-4) : undefined,
    };
  } catch (error) {
    console.error('Error checking EmailJS configuration:', error);
    return { configStatus: 'Error', error };
  }
};

// Make the debug function available in the browser console
if (typeof window !== 'undefined') {
  (window as any).debugEmailConfig = debugEmailConfig;
} 