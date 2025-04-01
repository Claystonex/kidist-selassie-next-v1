# PayPal Integration Guide

This guide explains how to set up and use the PayPal donation system in the Ethiopian Selassie Youth Community website.

## Prerequisites

Before you begin, make sure you have:

1. A PayPal Developer account
2. PayPal client credentials (Client ID and Secret)
3. Proper environment variables set up

## Environment Variables

Add the following environment variables to your `.env.local` file:

```
PAYPAL_CLIENT_ID=your_paypal_client_id
PAYPAL_CLIENT_SECRET=your_paypal_client_secret
PAYPAL_ENVIRONMENT=sandbox  # Change to 'production' when ready for live payments
NEXT_PUBLIC_PAYPAL_CLIENT_ID=your_paypal_client_id
MAILERSEND_API_KEY=your_mailersend_api_key
MAILERSEND_FROM_EMAIL=noreply@ethkidist.org
```

## How It Works

The PayPal donation system consists of several components:

1. **Donation Page** (`/src/app/(pages)/donate/page.tsx`): Provides the user interface for making donations
2. **PayPal Client** (`/src/app/_utils/paypalClient.ts`): Configures and initializes the PayPal SDK
3. **Orders API** (`/src/app/api/orders/route.ts`): Creates PayPal orders and handles the initial donation process
4. **Capture API** (`/src/app/api/orders/[orderID]/capture/route.ts`): Captures payments after approval and updates the database

## Donation Flow

1. User selects a donation amount and clicks "Donate"
2. The frontend creates an order via the Orders API
3. PayPal processes the payment and returns control to the callback
4. The capture API is called to finalize the transaction
5. Payment details are stored in the database
6. A receipt email is sent to the user

## Database Schema

The donation system uses the following schema (in Prisma):

```prisma
model Donation {
  id              String   @id @default(cuid())
  amount          Float
  currency        String   @default("USD")
  status          String   // pending, completed, failed
  paymentId       String   @unique  // PayPal payment ID
  paymentType     String   // paypal
  isRecurring     Boolean  @default(false)
  recurringPeriod String?  // monthly, quarterly, yearly
  subscriptionId  String?  // For recurring donations
  donorName       String?
  donorEmail      String?
  message         String?
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  userId          String?  // Optional link to user if they're logged in
  user            User?    @relation(fields: [userId], references: [id])
  receiptSent     Boolean  @default(false)
}
```

## Recurring Donations

The system currently includes UI for recurring donations, but the full implementation would require using PayPal's subscription API. The current code has a placeholder that can be expanded in the future.

## Email Receipts

After a successful donation, a receipt email is sent to the donor's email address. This uses the nodemailer library with configurable email templates.

## Testing

To test the donation system:

1. Set `PAYPAL_ENVIRONMENT=sandbox` in your environment variables
2. Use PayPal's sandbox accounts for testing payments
3. Make test donations with different amounts and verify they appear in the database

## Going to Production

When you're ready to accept real donations:

1. Change `PAYPAL_ENVIRONMENT=production` in your environment variables
2. Replace sandbox API credentials with production credentials
3. Thoroughly test the entire payment flow in the production environment

## Troubleshooting

If you encounter issues with the PayPal integration:

1. Check the server logs for detailed error messages
2. Verify that all environment variables are correctly set
3. Ensure your PayPal Developer account is properly configured
4. Test with the PayPal sandbox before going to production
