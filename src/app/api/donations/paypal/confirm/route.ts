import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import nodemailer from 'nodemailer';

// Function to send receipt email
async function sendReceiptEmail(donation: any) {
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
    
    // Prepare email content
    const mailOptions = {
      from: process.env.EMAIL_FROM || 'donations@yourorganization.com',
      to: donation.donorEmail,
      subject: 'Thank You for Your Donation',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #333; border-bottom: 1px solid #ddd; padding-bottom: 10px;">Donation Receipt</h1>
          
          <p>Dear ${donation.donorName || 'Donor'},</p>
          
          <p>Thank you for your generous donation of <strong>$${formattedAmount} ${donation.currency}</strong>. 
          Your support makes a meaningful difference in our community.</p>
          
          <div style="background-color: #f5f5f5; padding: 15px; margin: 20px 0; border-radius: 5px;">
            <h3 style="margin-top: 0;">Donation Details:</h3>
            <table style="width: 100%;">
              <tr>
                <td style="padding: 5px 0;"><strong>Donation ID:</strong></td>
                <td>${donation.id}</td>
              </tr>
              <tr>
                <td style="padding: 5px 0;"><strong>Amount:</strong></td>
                <td>$${formattedAmount} ${donation.currency}</td>
              </tr>
              <tr>
                <td style="padding: 5px 0;"><strong>Date:</strong></td>
                <td>${new Date(donation.createdAt).toLocaleDateString()}</td>
              </tr>
              <tr>
                <td style="padding: 5px 0;"><strong>Payment Method:</strong></td>
                <td>PayPal</td>
              </tr>
              ${donation.isRecurring ? `
              <tr>
                <td style="padding: 5px 0;"><strong>Donation Type:</strong></td>
                <td>Recurring (${donation.recurringPeriod})</td>
              </tr>
              ` : ''}
            </table>
          </div>
          
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
    await prisma.donation.update({
      where: { id: donation.id },
      data: { receiptSent: true }
    });
    
    return true;
  } catch (error) {
    console.error('Error sending receipt email:', error);
    return false;
  }
}

export async function POST(request: Request) {
  try {
    const authData = await auth();
    const userId = authData?.userId;
    const { orderID, amount, currency, donorName, donorEmail, message, paymentType, isRecurring, recurringPeriod } = await request.json();

    // Validate input
    if (!orderID || !amount || amount <= 0) {
      return NextResponse.json(
        { error: 'Invalid payment details' },
        { status: 400 }
      );
    }

    // Store donation in database
    const donation = await prisma.donation.create({
      data: {
        amount,
        currency,
        status: 'completed',
        paymentId: orderID,
        paymentType,
        isRecurring: isRecurring || false,
        recurringPeriod,
        donorName,
        donorEmail,
        message,
        userId,
        receiptSent: false
      },
    });

    // Send receipt email
    const emailSent = await sendReceiptEmail(donation);

    return NextResponse.json({
      success: true,
      donation: {
        id: donation.id,
        amount: donation.amount,
        status: donation.status,
        receiptSent: emailSent
      },
    });
  } catch (error) {
    console.error('PayPal donation processing error:', error);
    return NextResponse.json(
      { error: 'Failed to process PayPal donation' },
      { status: 500 }
    );
  }
}
