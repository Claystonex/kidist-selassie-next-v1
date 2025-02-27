import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs';
import { Client, Environment } from 'square';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Initialize Square client
const squareClient = new Client({
  accessToken: process.env.SQUARE_ACCESS_TOKEN,
  environment: process.env.NODE_ENV === 'production' 
    ? Environment.Production 
    : Environment.Sandbox,
});

export async function POST(request: Request) {
  try {
    const { userId } = auth();
    const { sourceId, amount, currency, donorName, donorEmail, message } = await request.json();

    // Validate input
    if (!sourceId || !amount || amount <= 0) {
      return NextResponse.json(
        { error: 'Invalid payment details' },
        { status: 400 }
      );
    }

    // Create payment with Square
    const payment = await squareClient.paymentsApi.createPayment({
      sourceId,
      amountMoney: {
        amount: Math.round(amount * 100), // Convert to cents
        currency,
      },
      idempotencyKey: `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`,
    });

    if (!payment.result?.payment) {
      throw new Error('Failed to process payment');
    }

    // Store donation in database
    const donation = await prisma.donation.create({
      data: {
        amount,
        currency,
        status: 'completed',
        paymentId: payment.result.payment.id,
        donorName,
        donorEmail,
        message,
        userId,
      },
    });

    return NextResponse.json({
      success: true,
      donation: {
        id: donation.id,
        amount: donation.amount,
        status: donation.status,
      },
    });
  } catch (error) {
    console.error('Donation processing error:', error);
    return NextResponse.json(
      { error: 'Failed to process donation' },
      { status: 500 }
    );
  }
}
