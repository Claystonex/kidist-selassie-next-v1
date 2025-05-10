import { NextResponse, NextRequest } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
// Using named imports to fix build error
import * as paypal from '@paypal/paypal-server-sdk';
import { getPayPalClient } from '@/app/_utils/paypalClient';

export async function POST(req: NextRequest) {
  try {
    const authData = await auth();
    const userId = authData?.userId;
    const { cart } = await req.json();
    
    if (!cart || !Array.isArray(cart) || cart.length === 0) {
      return NextResponse.json(
        { error: 'Invalid cart data' },
        { status: 400 }
      );
    }

    const firstItem = cart[0];
    const amount = firstItem.amount || '10.00';
    const description = firstItem.description || 'Donation';

    try {
      // Create a PayPal order to establish intent using the real SDK
      // Use as any to work around TypeScript errors with the PayPal SDK
      const paypalSdk = paypal as any;
      const orderRequest = new paypalSdk.orders.OrdersCreateRequest();
      orderRequest.prefer('return=representation');
      
      // Set up the order request
      orderRequest.requestBody({
        intent: 'CAPTURE',
        purchase_units: [
          {
            amount: {
              currency_code: 'USD',
              value: amount.toString(),
            },
            description: description,
          },
        ],
        application_context: {
          brand_name: 'Ethiopian Selassie Youth',
          landing_page: 'BILLING',
          user_action: 'PAY_NOW',
          return_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/donate?success=true`,
          cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/donate?success=false`
        }
      });
      
      // Call PayPal API to create the order
      const paypalClient = getPayPalClient();
      const order = await paypalClient.execute(orderRequest);
      const orderId = order.result.id;
      
      // Store donation details in database
      await prisma.donation.create({
        data: {
          amount: parseFloat(amount),
          currency: 'USD',
          status: 'pending', // Initial status before capture
          transactionId: orderId, // Using transactionId instead of paymentId
          provider: 'paypal', // Using provider instead of paymentType
          isRecurring: firstItem.isRecurring || false,
          recurringId: firstItem.recurringPeriod ? firstItem.recurringPeriod : null,
          // Store description in donorName for now until we run another migration
          donorName: description,
          userId: userId || 'anonymous', // Use 'anonymous' as fallback when userId is null
          receiptSent: false
        },
      });
      
      return NextResponse.json(order.result);
    } catch (err) {
      console.error('PayPal API error:', err);
      return NextResponse.json(
        { error: 'Failed to create PayPal order', details: err instanceof Error ? err.message : String(err) },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Failed to create order:', error);
    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 }
    );
  }
}
