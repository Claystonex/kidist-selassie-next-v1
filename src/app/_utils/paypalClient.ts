// Import PayPal SDK with named imports to fix build error
import * as paypal from '@paypal/paypal-server-sdk';

/**
 * Creates and returns PayPal HTTP client
 * 
 * @returns PayPal HTTP client configured with environment settings
 */
export function getPayPalClient(): any {
  // Check if we're in sandbox (development) or live (production) mode
  const isSandbox = process.env.PAYPAL_ENVIRONMENT !== 'production';
  
  // Access SDK objects through dynamic property access to avoid TypeScript errors
  const paypalSdk = paypal as any;
  
  // Set up the environment with your client credentials
  let environment;
  
  if (isSandbox) {
    // Sandbox Environment
    environment = new paypalSdk.core.SandboxEnvironment(
      process.env.PAYPAL_CLIENT_ID || '',
      process.env.PAYPAL_CLIENT_SECRET || ''
    );
  } else {
    // Live Environment
    environment = new paypalSdk.core.LiveEnvironment(
      process.env.PAYPAL_CLIENT_ID || '',
      process.env.PAYPAL_CLIENT_SECRET || ''
    );
  }
  
  // Create client with the environment
  return new paypalSdk.core.PayPalHttpClient(environment);
}
