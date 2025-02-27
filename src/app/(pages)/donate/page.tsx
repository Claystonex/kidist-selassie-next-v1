'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { PaymentForm, CreditCard } from '@square/web-payments-sdk-react';

export default function DonatePage() {
  const { user } = useUser();
  const [amount, setAmount] = useState('10.00');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const predefinedAmounts = ['5.00', '10.00', '25.00', '50.00', '100.00'];

  const handlePaymentMethodSubmission = async (token: string, buyer: any) => {
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch('/api/donations/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sourceId: token,
          amount: parseFloat(amount),
          currency: 'USD',
          donorName: user?.firstName ? `${user.firstName} ${user.lastName || ''}` : undefined,
          donorEmail: user?.emailAddresses?.[0]?.emailAddress,
          message,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to process donation');
      }

      setSuccess(true);
      setAmount('10.00');
      setMessage('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process donation');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">Make a Donation</h1>
      
      {success ? (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          Thank you for your donation! Your support means a lot to us.
        </div>
      ) : (
        <>
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

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

          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Payment Details
            </label>
            <PaymentForm
              applicationId="YOUR_SQUARE_APP_ID"
              locationId="YOUR_SQUARE_LOCATION_ID"
              cardTokenizeResponseReceived={handlePaymentMethodSubmission}
            >
              <CreditCard />
            </PaymentForm>
          </div>
        </>
      )}
    </div>
  );
}
