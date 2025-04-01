'use client';

import React, { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { sendBatchEmail } from '@/app/_utils/emailUtils';
import { useTranslation } from '@/app/_contexts/TranslationContext';

type EmailTemplate = {
  id: string;
  name: string;
};

const AdminEmailPage = () => {
  const { translate } = useTranslation();
  const { isLoaded, isSignedIn, user } = useUser();
  const router = useRouter();
  
  const [subject, setSubject] = useState('');
  const [recipients, setRecipients] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [templates, setTemplates] = useState<EmailTemplate[]>([
    { id: process.env.NEXT_PUBLIC_MAILERSEND_NEWSLETTER_TEMPLATE_EN || '', name: 'Newsletter (English)' },
    { id: process.env.NEXT_PUBLIC_MAILERSEND_ANNOUNCEMENT_TEMPLATE_EN || '', name: 'Announcement (English)' },
  ]);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // Check if user is loaded and signed in
    if (isLoaded && !isSignedIn) {
      router.push('/sign-in');
      return;
    }

    // Check if user is an admin
    if (isLoaded && isSignedIn && user) {
      const userRole = user.publicMetadata.role;
      if (userRole !== 'admin') {
        router.push('/');
        return;
      }
      setIsAdmin(true);
    }
  }, [isLoaded, isSignedIn, user, router]);

  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!subject || !recipients || !selectedTemplate) {
      setMessage({
        type: 'error',
        text: translate('Please fill in all fields')
      });
      return;
    }

    setIsSending(true);
    setMessage({ type: '', text: '' });

    try {
      // Parse recipient emails
      const recipientsList = recipients
        .split(',')
        .map(email => email.trim())
        .filter(email => email.includes('@'))
        .map(email => ({ email }));

      if (recipientsList.length === 0) {
        throw new Error('No valid email addresses found');
      }

      // Send the email
      const result = await sendBatchEmail(
        recipientsList,
        selectedTemplate,
        subject
      );

      if (result.success) {
        setMessage({
          type: 'success',
          text: translate('Email sent successfully to') + ` ${recipientsList.length} ` + translate('recipients')
        });
        // Reset form
        setSubject('');
        setRecipients('');
        setSelectedTemplate('');
      } else {
        throw new Error(result.error?.toString() || 'Unknown error');
      }
    } catch (error) {
      console.error('Error sending email:', error);
      setMessage({
        type: 'error',
        text: translate('Failed to send email:') + ` ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    } finally {
      setIsSending(false);
    }
  };

  if (!isLoaded || !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="p-8 rounded-lg shadow-md max-w-md w-full bg-white">
          <h1 className="text-xl font-semibold text-center mb-4">{translate('Loading...')}</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-2xl font-bold text-[#086c47] mb-6">{translate('Email Blast Manager')}</h1>
          
          {message.text && (
            <div className={`p-4 mb-6 rounded ${message.type === 'error' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
              {message.text}
            </div>
          )}

          <form onSubmit={handleSendEmail}>
            <div className="mb-4">
              <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
                {translate('Email Subject')}
              </label>
              <input
                type="text"
                id="subject"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#086c47] focus:border-[#086c47]"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                required
              />
            </div>

            <div className="mb-4">
              <label htmlFor="template" className="block text-sm font-medium text-gray-700 mb-1">
                {translate('Email Template')}
              </label>
              <select
                id="template"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#086c47] focus:border-[#086c47]"
                value={selectedTemplate}
                onChange={(e) => setSelectedTemplate(e.target.value)}
                required
              >
                <option value="">{translate('Select a template')}</option>
                {templates.map((template) => (
                  <option key={template.id} value={template.id}>
                    {template.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-6">
              <label htmlFor="recipients" className="block text-sm font-medium text-gray-700 mb-1">
                {translate('Recipients (comma-separated email addresses)')}
              </label>
              <textarea
                id="recipients"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#086c47] focus:border-[#086c47] h-32"
                value={recipients}
                onChange={(e) => setRecipients(e.target.value)}
                placeholder="email1@example.com, email2@example.com, ..."
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                {translate('Enter email addresses separated by commas')}
              </p>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isSending}
                className="px-4 py-2 bg-[#086c47] text-white rounded-md hover:bg-[#064e33] focus:outline-none focus:ring-2 focus:ring-[#086c47] focus:ring-opacity-50 transition disabled:opacity-50"
              >
                {isSending ? translate('Sending...') : translate('Send Email Blast')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminEmailPage;
