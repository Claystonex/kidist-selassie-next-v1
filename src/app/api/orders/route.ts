import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const { userId } = auth();
    const { cart } = await request.json();
    
    if (!cart || !Array.isArray(cart) || cart.length === 0) {
      return NextResponse.json(
        { error: 'Invalid cart data' },
        { status: 400 }
      );
    }

    const firstItem = cart[0];
    const amount = firstItem.amount || '10.00';
    const description = firstItem.description || 'Donation';

    // Create a PayPal order to establish intent
    // In a real implementation, you'd use the PayPal SDK to create the order
    // For now, we'll return a mock order ID
    
    // This would normally be a call to PayPal's API:
    // const paypalOrder = await paypalClient.createOrder(...)
    
    // Instead, we'll mock the response with a unique ID
    const mockOrderId = `ORDER-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    
    // In a production environment, you'd store this order in your database
    await prisma.donation.create({
      data: {
        amount: parseFloat(amount),
        currency: 'USD',
        status: 'pending', // Initial status before capture
        paymentId: mockOrderId,
        paymentType: 'paypal',
        isRecurring: firstItem.isRecurring || false,
        recurringPeriod: firstItem.recurringPeriod,
        message: description,
        userId,
        receiptSent: false
      },
    });

    return NextResponse.json({
      id: mockOrderId,
      status: 'CREATED',
      links: [
        {
          href: `/api/orders/${mockOrderId}/capture`,
          rel: 'capture',
          method: 'POST'
        }
      ]
    });
  } catch (error) {
    console.error('Failed to create order:', error);
    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 }
    );
  }
}
