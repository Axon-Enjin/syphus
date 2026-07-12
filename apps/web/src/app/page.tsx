import Link from "next/link";
import type { CSSProperties } from "react";
import { BrandMark } from "@/components/brand-mark";
import { BentoExportToggle } from "@/components/landing/bento-export-toggle";
import { HeroCalculator } from "@/components/landing/hero-calculator";
import { LandingFaq } from "@/components/landing/landing-faq";
import { PublicLayout } from "@/components/public-layout";

const howItWorks = [
  {
    step: "01",
    title: "Create account",
    detail: "Get your Stellar payment address in minutes.",
  },
  {
    step: "02",
    title: "Share a link",
    detail: "Send clients a payment link with amount and memo.",
  },
  {
    step: "03",
    title: "Withdraw to bank",
    detail: "Convert USDC to PHP through our anchor partner.",
  },
];

const feeComparison = [
  {
    label: "Settlement time",
    syphus: "30 seconds",
    traditional: "3 to 5 days",
    syphusWidth: 92,
    traditionalWidth: 28,
  },
  {
    label: "Transfer fee",
    syphus: "Low network fee",
    traditional: "₱1,500+ wire fee",
    syphusWidth: 78,
    traditionalWidth: 55,
  },
];

export default function HomePage() {
  return (
    <PublicLayout>
      <div className="landing">
        <section className="landing-hero">
          <div className="landing-hero__atmosphere" aria-hidden="true" />
          <div className="landing-hero__mesh" aria-hidden="true" />
          <div className="container-app landing-hero__inner">
            <div className="landing-hero__copy">
              <div
                className="landing-hero__brand animate-fade-up"
                style={{ "--index": 0 } as CSSProperties}
              >
                <BrandMark className="landing-hero__mark" />
                <span className="landing-hero__wordmark">Syphus</span>
              </div>
              <span
                className="landing-hero__badge animate-fade-up"
                style={{ "--index": 1 } as CSSProperties}
              >
                For freelancers paid in USDC
              </span>
              <h1
                className="landing-hero__headline animate-fade-up"
                style={{ "--index": 2 } as CSSProperties}
              >
                Get paid in USDC.
                <br />
                Withdraw to PHP the same day.
              </h1>
              <p
                className="landing-hero__support animate-fade-up"
                style={{ "--index": 3 } as CSSProperties}
              >
                Share a payment link with clients who already hold USDC. Receive
                on Stellar, withdraw to GCash or your bank.
              </p>
              <div
                className="landing-hero__cta animate-fade-up"
                style={{ "--index": 4 } as CSSProperties}
              >
                <Link href="/register" className="btn-primary focus-ring">
                  Get started
                </Link>
                <Link href="/login" className="landing-hero__signin focus-ring">
                  Sign in
                </Link>
              </div>
            </div>

            <div
              className="landing-hero__visual animate-fade-up"
              style={{ "--index": 3 } as CSSProperties}
            >
              <HeroCalculator />
            </div>
          </div>
        </section>

        <section className="landing-section">
          <div className="container-app">
            <h2 className="landing-section__title">How it works</h2>
            <p className="landing-section__lead">
              Three steps from signup to your first withdrawal.
            </p>
            <ol className="landing-steps-grid">
              {howItWorks.map((item, i) => (
                <li
                  key={item.step}
                  className="landing-step-card animate-fade-up"
                  style={{ "--index": i } as CSSProperties}
                >
                  <span className="landing-step-card__num">{item.step}</span>
                  <h3 className="landing-step-card__title">{item.title}</h3>
                  <p className="landing-step-card__detail">{item.detail}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="landing-section">
          <div className="container-app">
            <h2 className="landing-section__title">What you get</h2>
            <p className="landing-section__lead">
              Everything you need from payment to proof of income.
            </p>

            <div className="landing-bento">
              <article className="landing-bento__card landing-bento__card--wide animate-fade-up" style={{ "--index": 0 } as CSSProperties}>
                <div className="landing-bento__head">
                  <h3 className="landing-bento__title">Instant USDC settlement</h3>
                  <p className="landing-bento__detail">
                    Clients pay through your link. You see confirmation in seconds.
                  </p>
                </div>
                <div className="landing-bento__timeline landing-bento__timeline--animated" aria-hidden="true">
                  <div className="landing-bento__timeline-rail" aria-hidden="true">
                    <div className="landing-bento__timeline-rail-track" />
                    <div className="landing-bento__timeline-rail-fill" />
                  </div>
                  <ol className="landing-bento__timeline-steps">
                    <li className="landing-bento__timeline-step">
                      <span className="landing-bento__timeline-dot" />
                      <p>Client sends USDC</p>
                    </li>
                    <li className="landing-bento__timeline-step">
                      <span className="landing-bento__timeline-dot" />
                      <p>Stellar confirms</p>
                    </li>
                    <li className="landing-bento__timeline-step">
                      <span className="landing-bento__timeline-dot landing-bento__timeline-dot--final" />
                      <p>You receive payment</p>
                    </li>
                  </ol>
                </div>
              </article>

              <article className="landing-bento__card landing-bento__card--narrow animate-fade-up" style={{ "--index": 1 } as CSSProperties}>
                <div className="landing-bento__head">
                  <h3 className="landing-bento__title">Direct PH withdrawals</h3>
                  <p className="landing-bento__detail">
                    Convert to PHP and receive on GCash or your bank account.
                  </p>
                </div>
                <div className="landing-bento__phone landing-bento__phone--animated" aria-hidden="true">
                  <div className="landing-bento__phone-notch" />
                  <div className="landing-bento__phone-screen">
                    <p className="landing-bento__phone-app">GCash</p>
                    <p className="landing-bento__phone-msg">You received</p>
                    <p className="landing-bento__phone-amount">₱26,500.00</p>
                    <p className="landing-bento__phone-from">from Syphus</p>
                  </div>
                </div>
              </article>

              <article className="landing-bento__card landing-bento__card--full animate-fade-up" style={{ "--index": 2 } as CSSProperties}>
                <div className="landing-bento__head">
                  <h3 className="landing-bento__title">Smart tax and export</h3>
                  <p className="landing-bento__detail">
                    Payment history builds automatically. Export CSV or PDF for income records.
                  </p>
                </div>
                <BentoExportToggle />
              </article>
            </div>
          </div>
        </section>

        <section className="landing-section landing-fees">
          <div className="container-app">
            <h2 className="landing-section__title">Keep more of what you earn</h2>
            <p className="landing-section__lead">
              Compare Syphus against traditional international wires.
            </p>

            <div className="landing-fees__grid">
              {feeComparison.map((row, i) => (
                <article
                  key={row.label}
                  className="landing-fees__card animate-fade-up"
                  style={{ "--index": i } as CSSProperties}
                >
                  <h3 className="landing-fees__label">{row.label}</h3>
                  <div className="landing-fees__row">
                    <div className="landing-fees__metric">
                      <span>Syphus</span>
                      <div className="landing-fees__bar-wrap">
                        <div
                          className="landing-fees__bar landing-fees__bar--syphus"
                          style={{ width: `${row.syphusWidth}%` }}
                        />
                      </div>
                      <p>{row.syphus}</p>
                    </div>
                    <div className="landing-fees__metric">
                      <span>Traditional wire</span>
                      <div className="landing-fees__bar-wrap">
                        <div
                          className="landing-fees__bar landing-fees__bar--traditional"
                          style={{ width: `${row.traditionalWidth}%` }}
                        />
                      </div>
                      <p>{row.traditional}</p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="landing-section">
          <div className="container-app">
            <h2 className="landing-section__title">Common questions</h2>
            <p className="landing-section__lead">
              Quick answers before you create your account.
            </p>
            <LandingFaq />
          </div>
        </section>

        <section className="landing-close">
          <div className="container-app">
            <div
              className="landing-close__panel animate-fade-up"
              style={{ "--index": 0 } as CSSProperties}
            >
              <div className="landing-close__copy">
                <span className="landing-close__eyebrow">
                  Payments, withdrawals, proof
                </span>
                <h2 className="landing-close__title">
                  Ready to get paid in USDC?
                </h2>
                <p className="landing-close__lead">
                  Set up takes a few minutes. No crypto experience required on
                  your side. Receive on Stellar and withdraw to PHP.
                </p>
              </div>
              <div
                className="landing-close__action animate-fade-up"
                style={{ "--index": 1 } as CSSProperties}
              >
                <div className="landing-close__action-head">
                  <BrandMark className="landing-close__action-mark" />
                  <div>
                    <p className="landing-close__action-title">
                      Calm payouts. Local action.
                    </p>
                    <p className="landing-close__action-detail">
                      Built for freelancers paid in USDC on Stellar.
                    </p>
                  </div>
                </div>
                <Link
                  href="/register"
                  className="landing-close__button focus-ring"
                >
                  Get started
                </Link>
              </div>
            </div>
          </div>
        </section>

        <footer className="landing-footer">
          <div className="container-app landing-footer__inner">
            <p className="landing-footer__note">
              Built for freelancers paid in USDC on Stellar testnet.
            </p>
            <div className="landing-footer__links">
              <span className="landing-footer__link">Privacy</span>
              <span className="landing-footer__link">Terms</span>
            </div>
          </div>
        </footer>
      </div>
    </PublicLayout>
  );
}
