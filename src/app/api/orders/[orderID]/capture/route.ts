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

export async function POST(
  request: Request,
  { params }: { params: { orderID: string } }
) {
  try {
    const authData = await auth();
    const userId = authData?.userId;
    const orderId = params.orderID;
    const { donorName, donorEmail, message, isRecurring, recurringPeriod } = await request.json();

    if (!orderId) {
      return NextResponse.json(
        { error: 'Order ID is required' },
        { status: 400 }
      );
    }

    // Find the pending donation in the database
    const pendingDonation = await prisma.donation.findFirst({
      where: {
        paymentId: orderId,
        status: 'pending'
      }
    });

    if (!pendingDonation) {
      return NextResponse.json(
        { error: 'Order not found or already processed' },
        { status: 404 }
      );
    }

    // Update donation with additional details and mark as completed
    const donation = await prisma.donation.update({
      where: { id: pendingDonation.id },
      data: {
        status: 'completed',
        donorName: donorName || pendingDonation.donorName,
        donorEmail: donorEmail || pendingDonation.donorEmail,
        message: message || pendingDonation.message,
        isRecurring: isRecurring !== undefined ? isRecurring : pendingDonation.isRecurring,
        recurringPeriod: recurringPeriod || pendingDonation.recurringPeriod,
        receiptSent: false
      }
    });

    // Send receipt email if email is provided
    let emailSent = false;
    if (donation.donorEmail) {
      emailSent = await sendReceiptEmail(donation);
    }

    // In a real implementation, we would verify the payment with PayPal's API
    // For demo purposes, we'll mock the response
    
    // Mock PayPal capture response
    const mockCaptureResponse = {
      id: orderId,
      status: 'COMPLETED',
      purchase_units: [
        {
          reference_id: 'default',
          amount: {
            currency_code: 'USD',
            value: donation.amount.toString()
          },
          payee: {
            email_address: process.env.PAYPAL_MERCHANT_EMAIL || 'merchant@example.com'
          },
          payments: {
            captures: [
              {
                id: `CAPTURE-${Date.now()}`,
                status: 'COMPLETED',
                amount: {
                  currency_code: 'USD',
                  value: donation.amount.toString()
                },
                final_capture: true,
                disbursement_mode: 'INSTANT',
                create_time: new Date().toISOString(),
                update_time: new Date().toISOString()
              }
            ]
          }
        }
      ]
    };

    return NextResponse.json(mockCaptureResponse);
  } catch (error) {
    console.error('Failed to capture order:', error);
    return NextResponse.json(
      { error: 'Failed to capture order' },
      { status: 500 }
    );
  }
}
