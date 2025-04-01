'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from '@/app/_contexts/TranslationContext';
import { usePathname } from 'next/navigation';

/**
 * AutoTranslate Component
 * 
 * A component that efficiently translates page content when language changes or page loads.
 * Uses batch translation and caching to minimize API calls.
 */

const AutoTranslate: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { language, translateBatch, isTranslating, translationError } = useTranslation();
  const contentRef = useRef<HTMLDivElement>(null);
  const translationInProgressRef = useRef(false);
  const [pageLoaded, setPageLoaded] = useState(false);
  const pathname = usePathname();
  const lastPathRef = useRef(pathname);
  
  // Track nodes that have already been processed to avoid duplicate work
  const processedTextNodesRef = useRef(new WeakSet<Node>());
  
  // A debounced version of the translate function to avoid too many calls
  const translateAllTextNodes = async () => {
    // Don't translate if we're in English or already translating
    if (!contentRef.current || language === 'en' || translationInProgressRef.current) return;
    
    console.log('Starting page translation...');
    translationInProgressRef.current = true;
    
    // Track if we have more nodes to process
    let hasMoreNodes = false;
    
    try {
      // Elements to exclude from translation
      const excludeElements = ['SCRIPT', 'STYLE', 'CODE', 'PRE', 'IFRAME'];
      const excludeClasses = ['translated-content', 'no-translate'];
      
      // Find all text nodes that need translation
      const walker = document.createTreeWalker(
        contentRef.current,
        NodeFilter.SHOW_TEXT,
        {
          acceptNode: (node) => {
            // Skip empty or already processed nodes
            if (!node.textContent || 
                node.textContent.trim() === '' || 
                processedTextNodesRef.current.has(node)) {
              return NodeFilter.FILTER_REJECT;
            }
            
            // Check parent elements for exclusion criteria
            const parent = node.parentElement;
            if (!parent) return NodeFilter.FILTER_REJECT;
            
            // Traverse up to check if inside excluded element
            let currentEl: HTMLElement | null = parent;
            while (currentEl && currentEl !== document.body) {
              // Skip nodes in excluded elements
              if (excludeElements.includes(currentEl.tagName)) {
                return NodeFilter.FILTER_REJECT;
              }
              
              // Skip nodes with excluded classes
              for (const className of excludeClasses) {
                if (currentEl.classList?.contains(className)) {
                  return NodeFilter.FILTER_REJECT;
                }
              }
              
              // Skip already translated nodes
              if (currentEl.hasAttribute?.('data-translated')) {
                return NodeFilter.FILTER_REJECT;
              }
              
              currentEl = currentEl.parentElement;
            }
            
            return NodeFilter.FILTER_ACCEPT;
          }
        }
      );
      
      // Gather nodes and texts to translate
      const nodesToTranslate: Node[] = [];
      const textsToTranslate: string[] = [];
      let currentNode: Node | null = walker.nextNode();
      
      // Limit the number of nodes to translate to avoid excessive API calls
      const MAX_NODES = 100;
      
      while (currentNode && nodesToTranslate.length < MAX_NODES) {
        nodesToTranslate.push(currentNode);
        textsToTranslate.push(currentNode.textContent || '');
        // Mark as processed to avoid repeated translations
        processedTextNodesRef.current.add(currentNode);
        currentNode = walker.nextNode();
      }
      
      const nodeCount = nodesToTranslate.length;
      if (nodeCount === 0) {
        console.log('No new text to translate on page');
        return;
      }
      
      console.log(`Translating ${nodeCount} text nodes`);
      
      // Get translations in a single batch
      const translations = await translateBatch(textsToTranslate);
      
      // Apply translations to DOM
      nodesToTranslate.forEach((node, i) => {
        if (!node.parentNode) return;
        
        const originalText = node.textContent || '';
        const translatedText = translations[i] || originalText;
        
        // Only replace if translation is different from original
        if (translatedText !== originalText) {
          const span = document.createElement('span');
          span.className = 'translated-content';
          span.setAttribute('data-translated', 'true');
          span.setAttribute('data-original-text', originalText);
          span.textContent = translatedText;
          
          // Replace the original node
          node.parentNode.replaceChild(span, node);
        }
      });
      
      // If there are more nodes to translate, schedule another pass
      hasMoreNodes = !!currentNode;
      if (hasMoreNodes) {
        setTimeout(() => {
          translationInProgressRef.current = false;
          translateAllTextNodes();
        }, 300);
      } else {
        console.log('Page translation complete');
      }
      
    } catch (error) {
      console.error('Translation error:', error);
    } finally {
      // If we've processed all nodes or there was an error, reset the flag
      if (!hasMoreNodes) {
        translationInProgressRef.current = false;
      }
    }
  };
  
  // Monitor page load state
  useEffect(() => {
    const handleLoad = () => setPageLoaded(true);
    
    if (document.readyState === 'complete') {
      setPageLoaded(true);
    } else {
      window.addEventListener('load', handleLoad);
      return () => window.removeEventListener('load', handleLoad);
    }
  }, []);
  
  // Reset processed nodes when language changes
  useEffect(() => {
    processedTextNodesRef.current = new WeakSet<Node>();
  }, [language]);
  
  // Translate when language changes or page loads
  useEffect(() => {
    if (language === 'en' || !pageLoaded) return;
    
    // Clear previously processed nodes on language change
    processedTextNodesRef.current = new WeakSet<Node>();
    
    // Small delay to ensure DOM is ready
    const timeoutId = setTimeout(() => {
      translateAllTextNodes();
    }, 200);
    
    return () => clearTimeout(timeoutId);
  }, [language, pageLoaded]);
  
  // Handle route changes
  useEffect(() => {
    if (language === 'en') return;
    
    // Only run on actual path changes
    if (pathname !== lastPathRef.current) {
      lastPathRef.current = pathname;
      
      // Clear processed nodes on page navigation
      processedTextNodesRef.current = new WeakSet<Node>();
      
      // Wait for page to render before translating
      const timeoutId = setTimeout(() => {
        if (document.readyState === 'complete') {
          translateAllTextNodes();
        }
      }, 400);
      
      return () => clearTimeout(timeoutId);
    }
  }, [pathname, language]);
  
  // Show error message if translation fails
  if (translationError) {
    console.error('Translation system error:', translationError);
  }
  
  return (
    <div ref={contentRef}>
      {children}
    </div>
  );
};

export default AutoTranslate;
