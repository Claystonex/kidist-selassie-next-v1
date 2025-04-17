'use client';

import { useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js';

// Renders errors or successful transactions on the screen.
function Message({ content }: { content: string }) {
  if (!content) return null;
  return (
    <div className={content.includes('Error') || content.includes('Sorry') || content.includes('Could not') ? 
      "bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4" :
      "bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4"}>
      {content}
    </div>
  );
}

export default function DonatePage() {
  const { user } = useUser();
  const [amount, setAmount] = useState('10.00');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [success, setSuccess] = useState(false);
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurringPeriod, setRecurringPeriod] = useState('monthly');

  const predefinedAmounts = ['1.00', '3.00', '7.00', '15.00', '25.00', '50.00', '100.00'];

  // Handle PayPal payment submission
  const createOrder = async () => {
    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cart: [
            {
              amount: amount,
              description: `Donation ${message ? '- ' + message : ''}`,
              isRecurring,
              recurringPeriod: isRecurring ? recurringPeriod : undefined,
            },
          ],
        }),
      });

      const orderData = await response.json();

      if (orderData.id) {
        return orderData.id;
      } else {
        const errorDetail = orderData?.details?.[0];
        const errorMessage = errorDetail
          ? `${errorDetail.issue} ${errorDetail.description} (${orderData.debug_id})`
          : JSON.stringify(orderData);

        throw new Error(errorMessage);
      }
    } catch (error) {
      console.error(error);
      setStatusMessage(`Could not initiate PayPal Checkout... ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  };
  
  // Handle PayPal payment approval
  const onApprove = async (data: any, actions: any) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/orders/${data.orderID}/capture`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          donorName: user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : undefined,
          donorEmail: user?.emailAddresses?.[0]?.emailAddress,
          message,
          isRecurring,
          recurringPeriod: isRecurring ? recurringPeriod : undefined
        }),
      });

      const orderData = await response.json();
      const errorDetail = orderData?.details?.[0];

      if (errorDetail?.issue === 'INSTRUMENT_DECLINED') {
        // Recoverable error - let PayPal show the appropriate message
        return actions.restart();
      } else if (errorDetail) {
        // Non-recoverable error
        throw new Error(`${errorDetail.description} (${orderData.debug_id})`);
      } else {
        // Success
        const transaction = orderData.purchase_units[0].payments.captures[0];
        setStatusMessage(`Transaction ${transaction.status}: ${transaction.id}`);
        setSuccess(true);
        setAmount('10.00');
        setMessage('');
      }
    } catch (err) {
      setStatusMessage(`Sorry, your transaction could not be processed... ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setLoading(false);
    }
  };

  // For recurring donations - this is a simplified version
  // Production implementation would need to use PayPal's subscription API
  const handleRecurringDonation = () => {
    setStatusMessage('Recurring donations are currently being set up. Please use one-time donation for now.');
    // In a full implementation, we would use PayPal's subscription API here
  };

  // Render PayPal payment UI
  const renderPaymentMethod = () => {
    return (
      <div className="mb-6">
        <label className="block text-gray-700 text-sm font-bold mb-2">
          PayPal Payment
        </label>
        <PayPalScriptProvider options={{
          clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || 'test',
          enableFunding: "venmo",
          buyerCountry: "US",
          currency: "USD",
          dataPageType: "donation",
          components: "buttons",
          dataSdkIntegrationSource: "react-paypal-js",
        }}>
          {isRecurring ? (
            <div>
              <PayPalButtons
                style={{
                  shape: "rect",
                  layout: "vertical",
                  color: "gold",
                  label: "paypal",
                }}
                onClick={handleRecurringDonation}
              />
            </div>
          ) : (
            <PayPalButtons
              style={{
                shape: "rect",
                layout: "vertical",
                color: "gold",
                label: "paypal",
              }}
              createOrder={createOrder}
              onApprove={onApprove}
              disabled={loading}
            />
          )}
        </PayPalScriptProvider>
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-4">Make a Donation</h1>
      <div className="bg-blue-50 border border-blue-200 text-blue-800 p-4 rounded-lg mb-6">
        <p>We have cause based fundraising for our youth benefit. Reach out to us and you can fundraise here for your specific group's cause. They'll receive 100% of your donations.</p>
      </div>
      
      {success ? (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          <h2 className="font-bold text-xl mb-2">Thank You for Your Donation!</h2>
          <p>Your support means a lot to us. A receipt has been sent to your email address.</p>
          <div className="mt-4">
            <button 
              onClick={() => {
                setSuccess(false);
                setStatusMessage('');
              }}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
              Make Another Donation
            </button>
          </div>
        </div>
      ) : (
        <>
          <Message content={statusMessage} />

          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Select Amount
            </label>
            <div className="flex flex-wrap gap-2 mb-4">
              {predefinedAmounts.map((preset) => (
                <button
                  key={preset}
                  onClick={() => setAmount(preset)}
                  className={`px-4 py-2 rounded ${
                    amount === preset
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  ${preset}
                </button>
              ))}
            </div>
            <input
              type="number"
              step="0.01"
              min="1"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="Enter custom amount"
            />
          </div>

          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Donation Frequency
            </label>
            <div className="flex gap-4">
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  className="form-radio h-5 w-5 text-blue-600"
                  name="frequency"
                  checked={!isRecurring}
                  onChange={() => setIsRecurring(false)}
                />
                <span className="ml-2 text-gray-700">One-time Donation</span>
              </label>
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  className="form-radio h-5 w-5 text-blue-600"
                  name="frequency"
                  checked={isRecurring}
                  onChange={() => setIsRecurring(true)}
                />
                <span className="ml-2 text-gray-700">Recurring Donation</span>
              </label>
            </div>

            {isRecurring && (
              <div className="mt-3">
                <label className="block text-gray-700 text-sm mb-2">
                  Recurring Frequency
                </label>
                <select
                  value={recurringPeriod}
                  onChange={(e) => setRecurringPeriod(e.target.value)}
                  className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                >
                  <option value="monthly">Monthly</option>
                  <option value="quarterly">Quarterly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </div>
            )}
          </div>

          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Message (Optional)
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              rows={4}
              placeholder="Leave a message with your donation"
            />
          </div>



          {renderPaymentMethod()}
        </>
      )}
    </div>
  );
}
