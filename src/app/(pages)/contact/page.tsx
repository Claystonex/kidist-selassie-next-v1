"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import TranslatableText from '@/app/_components/TranslatableText';

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Here you would typically send the data to an API endpoint
    // For now, just simulate a successful submission after a delay
    try {
      // Simulated API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSubmitStatus('success');
      setFormData({ name: '', email: '', message: '' });
    } catch (error) {
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-[#064d32] min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white/10 backdrop-blur-sm rounded-lg shadow-xl overflow-hidden">
        <div className="px-6 py-8 sm:p-10">
          <h1 className="text-3xl font-bold text-center text-white mb-8">
            <TranslatableText>Contact Us</TranslatableText>
          </h1>
          
          <div className="mb-10 text-center">
            <p className="text-white text-lg mb-4">
              <TranslatableText>We value your feedback and would love to hear from you.</TranslatableText>
            </p>
            <p className="text-white/80">
              <TranslatableText>Share your comments, suggestions, or questions about our website and community.</TranslatableText>
            </p>
          </div>

          {submitStatus === 'success' ? (
            <div className="bg-green-500/20 border border-green-500 rounded-lg p-6 text-center">
              <h3 className="text-xl font-semibold text-white mb-2">
                <TranslatableText>Thank you for your message!</TranslatableText>
              </h3>
              <p className="text-white/90">
                <TranslatableText>We've received your feedback and will get back to you if needed.</TranslatableText>
              </p>
              <Button 
                className="mt-4 bg-[#edcf08] hover:bg-[#e6a037] text-[#064d32] font-bold"
                onClick={() => setSubmitStatus('idle')}
              >
                <TranslatableText>Send Another Message</TranslatableText>
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-white/90 mb-1">
                  <TranslatableText>Name</TranslatableText>
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 bg-white/20 border border-white/20 rounded-md focus:outline-none focus:ring-2 focus:ring-[#edcf08] focus:border-transparent text-white"
                  placeholder="Your name"
                />
              </div>
              
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-white/90 mb-1">
                  <TranslatableText>Email</TranslatableText>
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 bg-white/20 border border-white/20 rounded-md focus:outline-none focus:ring-2 focus:ring-[#edcf08] focus:border-transparent text-white"
                  placeholder="your.email@example.com"
                />
              </div>
              
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-white/90 mb-1">
                  <TranslatableText>Message</TranslatableText>
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows={5}
                  className="w-full px-4 py-2 bg-white/20 border border-white/20 rounded-md focus:outline-none focus:ring-2 focus:ring-[#edcf08] focus:border-transparent text-white"
                  placeholder="Your message or feedback"
                />
              </div>
              
              <div className="pt-4">
                <Button 
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-[#edcf08] hover:bg-[#e6a037] text-[#064d32] font-bold py-3 transition-colors duration-300"
                >
                  {isSubmitting ? (
                    <TranslatableText>Sending...</TranslatableText>
                  ) : (
                    <TranslatableText>Send Message</TranslatableText>
                  )}
                </Button>
              </div>
              
              {submitStatus === 'error' && (
                <div className="mt-4 text-red-400 text-center">
                  <TranslatableText>There was an error sending your message. Please try again.</TranslatableText>
                </div>
              )}
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
