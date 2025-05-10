import { NextResponse, NextRequest } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import nodemailer from 'nodemailer';

// Define types for donation data
type RecurringPeriod = 'monthly' | 'quarterly' | 'yearly';

interface DonationData {
  id: string;
  amount: number;
  currency: string;
  status: string;
  paymentId?: string;
  subscriptionId: string | null;
  paymentType: string;
  isRecurring: boolean;
  recurringPeriod: RecurringPeriod | string | null;
  donorName: string | null;
  donorEmail: string | null;
  message?: string | null;
  userId?: string | null;
  receiptSent: boolean;
  createdAt: Date;
  updatedAt?: Date;
}

// Function to send receipt email for subscription
async function sendSubscriptionEmail(donation: DonationData) {
  try {
    // Configure nodemailer with your email service
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || 'smtp.example.com',
      port: parseInt(process.env.EMAIL_PORT || '587'),
      secure: process.env.EMAIL_SECURE === 'true',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    // Format amount with 2 decimal places
    const formattedAmount = donation.amount.toFixed(2);
    
    // Format recurring period for display
    const recurringText = {
      'monthly': 'Monthly',
      'quarterly': 'Quarterly (every 3 months)',
      'yearly': 'Yearly'
    }[donation.recurringPeriod as RecurringPeriod] || 'Regular';
    
    // Prepare email content
    const mailOptions = {
      from: process.env.EMAIL_FROM || 'donations@yourorganization.com',
      to: donation.donorEmail || 'recipient@example.com',
      subject: 'Thank You for Your Recurring Donation',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #333; border-bottom: 1px solid #ddd; padding-bottom: 10px;">Recurring Donation Confirmation</h1>
          
          <p>Dear ${donation.donorName || 'Generous Donor'},</p>
          
          <p>Thank you for setting up a recurring donation of <strong>$${formattedAmount} ${donation.currency}</strong>. 
          Your ongoing support will help us make a sustainable impact.</p>
          
          <div style="background-color: #f5f5f5; padding: 15px; margin: 20px 0; border-radius: 5px;">
            <h3 style="margin-top: 0;">Subscription Details:</h3>
            <table style="width: 100%;">
              <tr>
                <td style="padding: 5px 0;"><strong>Subscription ID:</strong></td>
                <td>${donation.subscriptionId || donation.id}</td>
              </tr>
              <tr>
                <td style="padding: 5px 0;"><strong>Amount:</strong></td>
                <td>$${formattedAmount} ${donation.currency}</td>
              </tr>
              <tr>
                <td style="padding: 5px 0;"><strong>Frequency:</strong></td>
                <td>${recurringText}</td>
              </tr>
              <tr>
                <td style="padding: 5px 0;"><strong>Start Date:</strong></td>
                <td>${new Date(donation.createdAt).toLocaleDateString()}</td>
              </tr>
              <tr>
                <td style="padding: 5px 0;"><strong>Payment Method:</strong></td>
                <td>PayPal</td>
              </tr>
            </table>
          </div>
          
          <p>You can cancel or modify your recurring donation at any time by logging into your PayPal account.</p>
          
          <p>If you have any questions about your donation, please reply to this email or contact us.</p>
          
          <p>With gratitude,<br/>The Team</p>
          
          <div style="margin-top: 30px; font-size: 12px; color: #777; border-top: 1px solid #ddd; padding-top: 10px;">
            <p>This receipt should be kept for tax purposes. No goods or services were provided in exchange for this contribution.</p>
          </div>
        </div>
      `,
    };

    // Send the email
    await transporter.sendMail(mailOptions);
    
    // Update the donation record to mark receipt as sent
    // Since we don't have a receiptSent field in the Donation model,
    // we can use a custom field in the email metadata or log instead
    console.log(`Receipt sent for PayPal subscription donation ${donation.id}`);
    
    return true;
  } catch (error) {
    console.error('Error sending subscription email:', error);
    return false;
  }
}

export async function POST(request: NextRequest) {
  try {
    const authData = await auth();
    const userId = authData?.userId;
    const { 
      subscriptionID, 
      amount, 
      currency, 
      donorName, 
      donorEmail, 
      message, 
      paymentType, 
      isRecurring, 
      recurringPeriod 
    } = await request.json();

    // Validate input
    if (!subscriptionID) {
      return NextResponse.json(
        { error: 'Invalid subscription details' },
        { status: 400 }
      );
    }

    // Store donation in database
    const donation = await prisma.donation.create({
      data: {
        amount: amount || 0, // Amount might be determined later for subscriptions
        currency: currency || 'USD',
        status: 'active',
        provider: 'paypal', // This matches the provider field in the schema
        transactionId: `sub_${new Date().getTime()}`, // Generate a unique ID for tracking
        isRecurring: true,
        recurringId: subscriptionID, // Store subscription ID in the recurringId field
        userId: userId || 'anonymous', // Provide a fallback value when userId is null
      },
    });
    
    // Create a properly typed object for the email function
    const donationData: DonationData = {
      id: donation.id,
      amount: donation.amount,
      currency: donation.currency,
      status: donation.status,
      paymentId: donation.transactionId || undefined,
      subscriptionId: donation.recurringId,
      paymentType: 'paypal',
      isRecurring: donation.isRecurring,
      recurringPeriod: 'monthly',
      donorName: donorName,
      donorEmail: donorEmail,
      message: message || null,
      userId: donation.userId,
      receiptSent: false,
      createdAt: donation.createdAt
    };

    // Send confirmation email
    const emailSent = await sendSubscriptionEmail(donationData);

    return NextResponse.json({
      success: true,
      donation: {
        id: donation.id,
        subscriptionId: donation.recurringId,
        status: donation.status,
        receiptSent: emailSent
      },
    });
  } catch (error) {
    console.error('PayPal subscription processing error:', error);
    return NextResponse.json(
      { error: 'Failed to process PayPal subscription' },
      { status: 500 }
    );
  }
}
