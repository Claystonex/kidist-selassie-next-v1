'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from '@/app/_contexts/TranslationContext';

interface DisclaimerModalProps {
  isOpen: boolean;
  onAccept: () => void;
  onCancel: () => void;
}

const DisclaimerModal: React.FC<DisclaimerModalProps> = ({ 
  isOpen, 
  onAccept, 
  onCancel 
}) => {
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);
  const { translate } = useTranslation();

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    // Check if user has scrolled to the bottom (with a small threshold)
    if (scrollHeight - scrollTop - clientHeight < 30) {
      setHasScrolledToBottom(true);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-lg shadow-xl w-full max-w-4xl mx-4 overflow-hidden"
          >
            <div className="p-6 bg-[#086c47] text-white">
              <h2 className="text-2xl font-bold">
                {translate("Disclaimer & Terms of Use")}
              </h2>
            </div>

            <div 
              className="p-6 max-h-[70vh] overflow-y-auto prose prose-sm prose-slate"
              onScroll={handleScroll}
            >
              <p className="mb-4">
                {translate("Welcome to the")} <strong>{translate("Ethiopian Selassie Youth")}</strong> {translate("website. By registering and using this platform, you agree to the following terms and conditions:")}
              </p>

              <h3 className="text-lg font-bold mt-6 mb-2 text-[#086c47]">
                {translate("Free Speech & Responsible Use")}
              </h3>
              <p>
                {translate("This platform supports respectful discussion and free expression. However, content must align with community values, respect minors, and adhere to social media standards. Hate speech, explicit content, harassment, or any illegal activity is strictly prohibited.")}
              </p>

              <h3 className="text-lg font-bold mt-6 mb-2 text-[#086c47]">
                {translate("Priest Recordings & Creative Content")}
              </h3>
              <p>
                {translate("Any recordings, teachings, or creative works shared by priests and contributors on this platform are for educational and spiritual purposes only. These materials remain the intellectual property of the creators and the website.")} <strong>{translate("Unauthorized distribution, reproduction, or modification of these recordings is strictly forbidden.")}</strong>
              </p>

              <h3 className="text-lg font-bold mt-6 mb-2 text-[#086c47]">
                {translate("No External Posting")}
              </h3>
              <p>
                {translate("Content posted on this platform")} <strong>{translate("must not")}</strong> {translate("be shared, copied, or posted elsewhere without explicit permission from the original creator or website administrators. Any violation may result in suspension or removal from the platform.")}
              </p>

              <h3 className="text-lg font-bold mt-6 mb-2 text-[#086c47]">
                {translate("Extreme Privacy Protection")}
              </h3>
              <p>
                {translate("We prioritize the")} <strong>{translate("highest level of privacy protection")}</strong> {translate("for our users. Personal data, conversations, and shared materials")} <strong>{translate("must not")}</strong> {translate("be distributed, screenshotted, or shared outside this platform. Any breach of privacy policies will result in immediate action, including but not limited to account suspension or legal consequences.")}
              </p>

              <p className="mt-6">
                {translate("By registering, you acknowledge that you have read, understood, and agreed to these terms. Violations may lead to account restrictions or permanent removal from the community.")}
              </p>
            </div>

            <div className="p-6 bg-gray-50 flex justify-end space-x-4 border-t">
              <button
                onClick={onCancel}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-100 transition-colors"
              >
                {translate("Decline")}
              </button>
              <button
                onClick={onAccept}
                disabled={!hasScrolledToBottom}
                className={`px-4 py-2 bg-[#086c47] text-white rounded-md transition-colors ${
                  hasScrolledToBottom 
                    ? 'hover:bg-[#075a3c]' 
                    : 'opacity-50 cursor-not-allowed'
                }`}
              >
                {translate("I Accept")}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default DisclaimerModal;
