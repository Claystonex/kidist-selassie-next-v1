/**
 * Type definitions for PayPal SDK
 * These are basic type definitions to help TypeScript understand the PayPal SDK structure
 */

declare module '@paypal/paypal-server-sdk' {
  export namespace core {
    class PayPalHttpClient {
      constructor(environment: Environment);
      execute<T>(request: any): Promise<{ result: T }>;
    }
    
    class SandboxEnvironment {
      constructor(clientId: string, clientSecret: string);
    }
    
    class LiveEnvironment {
      constructor(clientId: string, clientSecret: string);
    }
    
    type Environment = SandboxEnvironment | LiveEnvironment;
  }
  
  export namespace orders {
    class OrdersCreateRequest {
      constructor();
      prefer(prefer: string): this;
      requestBody(body: any): this;
    }
    
    class OrdersCaptureRequest {
      constructor(orderId: string);
      requestBody(body: any): this;
    }
    
    class OrdersGetRequest {
      constructor(orderId: string);
    }
  }
}
