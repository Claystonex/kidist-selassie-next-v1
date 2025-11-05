"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from "@/app/_contexts/TranslationContext";

type Verse = {
  id: number;
  number: number;
  text?: string | null;
  textAm?: string | null;
  textEn?: string | null;
};

type Mode = "am" | "en" | "both";

function splitBilingual(text?: string | null): { am: string; en: string } {
  if (!text) return { am: "", en: "" };
  const m = text.match(/^(.*?)(?:\s*\(([^)]*)\)\s*)$/);
  if (m && m[1]) {
    return { am: m[1].trim(), en: (m[2] || "").trim() };
  }
  return { am: text, en: "" };
}

export default function BibleVersesToggle({ verses }: { verses: Verse[] }) {
  const { language } = useTranslation();
  const [mode, setMode] = useState<Mode>("en");

  useEffect(() => {
    try {
      const stored = localStorage.getItem("bible-language");
      if (stored === "am" || stored === "en" || stored === "both") {
        setMode(stored);
        return;
      }
      setMode(language === "am" ? "am" : "en");
    } catch {
      setMode(language === "am" ? "am" : "en");
    }
  }, [language]);

  const handleMode = (m: Mode) => {
    setMode(m);
    try {
      localStorage.setItem("bible-language", m);
    } catch {}
  };

  const computed = useMemo(() => {
    return verses.map((v) => {
      const split = splitBilingual(v.text || undefined);
      const am = (v.textAm ?? split.am ?? v.text ?? "").trim();
      const en = (v.textEn ?? split.en ?? v.text ?? "").trim();
      return { id: v.id, number: v.number, am, en, fallback: v.text };
    });
  }, [verses]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <div className="text-sm text-gray-300">Language</div>
        <div className="inline-flex rounded-md shadow-sm overflow-hidden border border-yellow-500">
          <button
            className={`px-3 py-1.5 text-sm ${
              mode === "am" ? "bg-yellow-500 text-black" : "bg-transparent text-yellow-400"
            }`}
            onClick={() => handleMode("am")}
          >
            Amharic
          </button>
          <button
            className={`px-3 py-1.5 text-sm border-l border-yellow-500 ${
              mode === "en" ? "bg-yellow-500 text-black" : "bg-transparent text-yellow-400"
            }`}
            onClick={() => handleMode("en")}
          >
            English
          </button>
          <button
            className={`px-3 py-1.5 text-sm border-l border-yellow-500 ${
              mode === "both" ? "bg-yellow-500 text-black" : "bg-transparent text-yellow-400"
            }`}
            onClick={() => handleMode("both")}
          >
            Both
          </button>
        </div>
      </div>

      {computed.map((v) => (
        <div key={v.id} className="leading-relaxed text-white">
          <span className="font-bold text-yellow-400 mr-2">{v.number}</span>
          {mode === "am" && (
            <span lang="am" className="inline-block align-baseline">
              {v.am || v.fallback}
            </span>
          )}
          {mode === "en" && (
            <span lang="en" className="inline-block align-baseline">
              {v.en || v.fallback}
            </span>
          )}
          {mode === "both" && (
            <span className="inline-block align-baseline">
              <span lang="am" className="block">
                {v.am || v.fallback}
              </span>
              <span lang="en" className="block text-gray-300">
                {v.en || v.fallback}
              </span>
            </span>
          )}
        </div>
      ))}
    </div>
  );
}
