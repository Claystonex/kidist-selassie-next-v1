declare module 'react-square-web-payments-sdk' {
  import React from 'react';

  interface PaymentFormProps {
    applicationId: string;
    locationId: string;
    cardTokenizeResponseReceived: (token: string, buyer: any) => void | Promise<void>;
    children: React.ReactNode;
  }

  export const PaymentForm: React.FC<PaymentFormProps>;
  export const CreditCard: React.FC;
  
  // Add other components or types as needed
}
