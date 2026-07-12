"use client";

import { useState } from "react";

const faqs = [
  {
    question: "Do my clients need a crypto wallet?",
    answer:
      "Yes. Syphus is built for clients who already hold USDC on Stellar. They pay through a simple payment link; no Syphus account required on their side.",
  },
  {
    question: "What banks and wallets are supported?",
    answer:
      "Withdraw to GCash or Philippine bank accounts through our anchor partner. Payouts typically land the same business day.",
  },
  {
    question: "How fast do payments confirm?",
    answer:
      "Stellar settlements confirm in seconds. You see the payment in your dashboard immediately after the client sends USDC.",
  },
  {
    question: "Can I export records for taxes?",
    answer:
      "Yes. Download CSV or PDF summaries of your payment history for BIR-friendly income records.",
  },
];

export function LandingFaq() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="landing-faq">
      {faqs.map((item, index) => {
        const isOpen = openIndex === index;
        return (
          <div key={item.question} className="landing-faq__item">
            <button
              type="button"
              className="landing-faq__trigger focus-ring"
              aria-expanded={isOpen}
              onClick={() => setOpenIndex(isOpen ? null : index)}
            >
              <span>{item.question}</span>
              <span className="landing-faq__icon" aria-hidden="true">
                {isOpen ? "−" : "+"}
              </span>
            </button>
            {isOpen ? (
              <p className="landing-faq__answer">{item.answer}</p>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
