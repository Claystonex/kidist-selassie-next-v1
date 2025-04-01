"use client";

import { useEffect, useState } from 'react';
import { useTranslation } from '../_contexts/TranslationContext';

/**
 * TranslationAudit component - Helps identify text that hasn't been wrapped in TranslatableText
 * Usage: Wrap this component around your page during development to highlight untranslated text
 * Example: <TranslationAudit><YourPage /></TranslationAudit>
 */
export default function TranslationAudit({ 
  children, 
  enabled = true 
}: { 
  children: React.ReactNode;
  enabled?: boolean;
}) {
  const [auditMode, setAuditMode] = useState(false);
  const { language } = useTranslation();
  
  useEffect(() => {
    if (!enabled) return;
    
    // Only show the audit highlights when not in English
    setAuditMode(language !== 'en');
    
    // Add a special class to the body for styling
    if (language !== 'en') {
      document.body.classList.add('translation-audit-mode');
    } else {
      document.body.classList.remove('translation-audit-mode');
    }
    
    return () => {
      document.body.classList.remove('translation-audit-mode');
    };
  }, [language, enabled]);

  // Add this style to your global CSS or directly here
  useEffect(() => {
    if (!enabled || !auditMode) return;
    
    const style = document.createElement('style');
    style.innerHTML = `
      .translation-audit-mode p:not(:has(.translatable-text)),
      .translation-audit-mode h1:not(:has(.translatable-text)),
      .translation-audit-mode h2:not(:has(.translatable-text)),
      .translation-audit-mode h3:not(:has(.translatable-text)),
      .translation-audit-mode h4:not(:has(.translatable-text)),
      .translation-audit-mode h5:not(:has(.translatable-text)),
      .translation-audit-mode h6:not(:has(.translatable-text)),
      .translation-audit-mode span:not(:has(.translatable-text)),
      .translation-audit-mode a:not(:has(.translatable-text)),
      .translation-audit-mode button:not(:has(.translatable-text)) {
        border: 2px dashed red !important;
        position: relative;
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, [auditMode, enabled]);

  return (
    <>
      {auditMode && enabled && (
        <div className="fixed bottom-4 right-4 z-50 bg-red-600 text-white p-2 rounded shadow-lg">
          Translation Audit Mode: ON - Red borders show untranslated text
        </div>
      )}
      {children}
    </>
  );
}
