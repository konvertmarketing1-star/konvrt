import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from "react";
import { InquiryDialog } from "./InquiryDialog";
import { Cursor } from "./icons";
import { inquiryEmail } from "./config";
import {
  addons,
  clientResults,
  comparison,
  customOffer,
  customSeeds,
  deskCapabilities,
  deskThreads,
  faqs,
  fit,
  guarantee,
  mediaNote,
  priceHeadline,
  steps,
  websites,
  type PackageId,
} from "./data";

const care = addons.find((offer) => offer.id === "care")!;
const creativeOffers = addons.filter((offer) => offer.id !== "care");

const scrollBands = [
  "results",
  "examples",
  "offers",
  "desk",
  "creative",
  "compare",
  "process",
  "fit",
  "questions",
  "inquire",
  "founders",
];

function prefersStill() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function useCountUp(target: number, active: boolean) {
  const [value, setValue] = useState(() => (prefersStill() ? target : 0));

  useEffect(() => {
    if (!active) return;
    if (prefersStill()) {
      setValue(target);
      return;
    }
    const start = performance.now();
    let frame = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / 900);
      const eased = 1 - (1 - t) ** 3;
      setValue(Math.round(target * eased));
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [active, target]);

  return value;
}

const rail = [
  ["results", "Results"],
  ["offers", "Websites"],
  ["desk", "Help desk"],
  ["creative", "Creative"],
  ["questions", "Questions"],
] as const;

function stickyFor(band: string) {
  if (band === "desk") {
    return { href: "#offers", ghost: "See websites", primary: "Add help desk", packageId: "front-desk" as const };
  }
  if (band === "creative") {
    return { href: "#offers", ghost: "See websites", primary: "Add creative", packageId: "creative" as const };
  }
  if (band === "questions" || band === "inquire" || band === "founders") {
    return { href: "#offers", ghost: "See websites", primary: "Start inquiry", packageId: "custom" as const };
  }
  if (band === "offers" || band === "compare") {
    return { href: "#compare", ghost: "Compare", primary: "Request Rebuild", packageId: "rebuild" as const };
  }
  return { href: "#offers", ghost: "See websites", primary: "Request Rebuild", packageId: "rebuild" as const };
}

function DeskChat({ thread }: { thread: (typeof deskThreads)[number] }) {
  return (
    <div className="textshot desk-chat">
      <header>
        <strong>{thread.who}</strong>
        <span>Example · {thread.kind}</span>
      </header>
      <div className="desk-chat-body">
        {thread.messages.map((message) => (
          <div key={message.text} className={`bubble ${message.from}`}>
            <span className="who">{message.from === "in" ? "Visitor" : "AI help desk"}</span>
            {message.text}
          </div>
        ))}
      </div>
      <p className="desk-handoff">
        <strong>Handed to you</strong>
        {thread.handoff}
      </p>
      <p className="desk-note">Example only. Not a client.</p>
    </div>
  );
}

function DeskExamples({ onRequest }: { onRequest: () => void }) {
  const stageRef = useRef<HTMLDivElement>(null);
  const still = prefersStill();
  const [view, setView] = useState({ index: 0, amount: still ? 1 : 0 });

  useEffect(() => {
    if (still) return;
    const stage = stageRef.current;
    if (!stage) return;
    const update = () => {
      const pin = stage.querySelector<HTMLElement>(".desk-phone-pin");
      const rect = stage.getBoundingClientRect();
      const stickyTop = 96;
      const travel = Math.max(stage.offsetHeight - (pin?.offsetHeight ?? 0), 1);
      const amount = Math.min(1, Math.max(0, (stickyTop - rect.top) / travel));
      const last = deskThreads.length - 1;
      const index = amount >= 0.999 ? last : Math.min(last, Math.floor(amount * deskThreads.length));
      const rounded = Math.round(amount * 200) / 200;
      setView((prev) => (prev.index === index && prev.amount === rounded ? prev : { index, amount: rounded }));
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [still]);

  const goTo = (index: number) => {
    const stage = stageRef.current;
    if (!stage) return;
    const pin = stage.querySelector<HTMLElement>(".desk-phone-pin");
    const stickyTop = 96;
    const travel = Math.max(stage.offsetHeight - (pin?.offsetHeight ?? 0), 1);
    const amount = index / (deskThreads.length - 1);
    const top = stage.getBoundingClientRect().top + window.scrollY;
    window.scrollTo({ top: top - stickyTop + amount * travel, behavior: "smooth" });
  };

  const thread = deskThreads[view.index] ?? deskThreads[0];

  return (
    <section className="section" id="desk">
      <div className="wrap">
        <div className="section-head">
          <p className="kicker">AI help desk</p>
          <h2>AI employees answer. You take the job.</h2>
          <p className="lede">
            Rebuild + AI Help Desk puts AI employees on the site. Scroll the examples. A shop gets
            sent to checkout, a lawyer gets a consult, an insurance agent gets a callback, and a
            local business gets the visit. Then the thread is handed to you.
          </p>
        </div>
        <ul className="desk-caps">
          {deskCapabilities.map((item) => (
            <li key={item.title}>
              <strong>{item.title}</strong>
              <span>{item.body}</span>
            </li>
          ))}
        </ul>
        <button type="button" className="btn btn-primary" onClick={onRequest}>
          Request the help desk
        </button>
      </div>
      {still ? (
        <div className="wrap desk-stack">
          {deskThreads.map((item) => (
            <DeskChat key={item.id} thread={item} />
          ))}
        </div>
      ) : (
        <div className="desk-scroll" ref={stageRef}>
          <div className="desk-phone-pin">
            <p className="desk-count">
              Example {view.index + 1} of {deskThreads.length}
              <span>{view.index === deskThreads.length - 1 ? "That is the handoff." : "Scroll for the next example."}</span>
            </p>
            <div className="desk-meter" aria-hidden="true">
              <span style={{ transform: `scaleX(${view.amount})` }} />
            </div>
            <DeskChat key={thread.id} thread={thread} />
            <div className="desk-switch" role="group" aria-label="Help desk examples">
              {deskThreads.map((item, index) => (
                <button key={item.id} type="button" aria-pressed={index === view.index} onClick={() => goTo(index)}>
                  {item.kind}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export function App() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [showSticky, setShowSticky] = useState(false);
  const [progress, setProgress] = useState(0);
  const [band, setBand] = useState("hero");
  const [countResults, setCountResults] = useState(false);
  const millions = useCountUp(10, countResults);
  const heroActions = useRef<HTMLDivElement>(null);
  const heroArt = useRef<HTMLDivElement>(null);
  const sticky = stickyFor(band);
  const [inquiry, setInquiry] = useState<{
    open: boolean;
    packageId: PackageId;
    note: string;
    requestKey: number;
  }>({ open: false, packageId: "custom", note: "", requestKey: 0 });

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 8);
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(max > 0 ? Math.min(1, window.scrollY / max) : 0);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  useEffect(() => {
    const nodes = scrollBands
      .map((id) => document.getElementById(id))
      .filter((node): node is HTMLElement => Boolean(node));
    const place = () => {
      const probe = window.innerHeight * 0.38;
      const current = nodes.find((node) => {
        const rect = node.getBoundingClientRect();
        return rect.top <= probe && rect.bottom > probe;
      });
      if (current) setBand(current.id);
      if (prefersStill()) return;
      if (heroArt.current) {
        const y = Math.min(window.scrollY * 0.22, 72);
        heroArt.current.style.transform = `translate3d(0, ${y}px, 0)`;
      }
    };
    place();
    window.addEventListener("scroll", place, { passive: true });
    window.addEventListener("resize", place);
    return () => {
      window.removeEventListener("scroll", place);
      window.removeEventListener("resize", place);
    };
  }, []);

  useEffect(() => {
    const results = document.getElementById("results");
    if (!results) return;
    const resultsObserver = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) setCountResults(true);
      },
      { threshold: 0.35 },
    );
    resultsObserver.observe(results);
    return () => resultsObserver.disconnect();
  }, []);

  useLayoutEffect(() => {
    if (prefersStill()) return;
    const nodes = [...document.querySelectorAll<HTMLElement>(".reveal")];
    const viewHeight = window.innerHeight;
    for (const node of nodes) {
      const rect = node.getBoundingClientRect();
      if (rect.top < viewHeight * 0.92 && rect.bottom > 0) node.classList.add("is-in");
    }
    document.documentElement.classList.add("has-reveal");
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.classList.add("is-in");
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.18, rootMargin: "0px 0px -8% 0px" },
    );
    for (const node of nodes) {
      if (!node.classList.contains("is-in")) observer.observe(node);
    }
    return () => {
      document.documentElement.classList.remove("has-reveal");
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    const node = heroActions.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      ([entry]) => setShowSticky(!entry.isIntersecting),
      { threshold: 0.2 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  function openInquiry(packageId: PackageId, note = "") {
    setMenuOpen(false);
    setInquiry((current) => ({
      open: true,
      packageId,
      note,
      requestKey: current.requestKey + 1,
    }));
  }

  function closeInquiry() {
    setInquiry((current) => ({ ...current, open: false }));
  }

  function goToOffer(id: PackageId) {
    document.getElementById(`offer-${id}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  return (
    <>
      <a className="skip" href="#offers">
        Skip to offers
      </a>
      <header className={scrolled ? "site-header is-stuck" : "site-header"}>
        <div className="scroll-progress" aria-hidden="true" style={{ transform: `scaleX(${progress})` }} />
        <div className="wrap header-bar">
          <a className="brand" href="#top">
            <img src="/wordmark.png" width={1034} height={181} alt="KONVRT" />
          </a>
          <nav className="nav-links" aria-label="Primary">
            <a href="#offers" aria-current={band === "offers" || band === "compare" ? "true" : undefined}>
              Websites
            </a>
            <a href="#desk" aria-current={band === "desk" ? "true" : undefined}>
              Help desk
            </a>
            <a href="#creative" aria-current={band === "creative" ? "true" : undefined}>
              Creative
            </a>
            <a href="#questions" aria-current={band === "questions" ? "true" : undefined}>
              Questions
            </a>
          </nav>
          <div className="header-actions">
            <button type="button" className="btn btn-primary" onClick={() => openInquiry("custom")}>
              Custom creative
            </button>
            <button
              type="button"
              className="menu-btn"
              aria-expanded={menuOpen}
              aria-controls="mobile-nav"
              onClick={() => setMenuOpen((open) => !open)}
            >
              {menuOpen ? "Close" : "Menu"}
            </button>
          </div>
        </div>
        {menuOpen && (
          <div id="mobile-nav" className="mobile-panel">
            <a
              href="#offers"
              aria-current={band === "offers" || band === "compare" ? "true" : undefined}
              onClick={() => setMenuOpen(false)}
            >
              Websites
            </a>
            <a href="#desk" aria-current={band === "desk" ? "true" : undefined} onClick={() => setMenuOpen(false)}>
              Help desk
            </a>
            <a
              href="#creative"
              aria-current={band === "creative" ? "true" : undefined}
              onClick={() => setMenuOpen(false)}
            >
              Creative
            </a>
            <a
              href="#questions"
              aria-current={band === "questions" ? "true" : undefined}
              onClick={() => setMenuOpen(false)}
            >
              Questions
            </a>
            <button type="button" onClick={() => openInquiry("custom")}>
              Inquire about custom creative
            </button>
          </div>
        )}
      </header>

      <main id="top">
        <section className="hero">
          <div className="wrap hero-grid">
            <div>
              <p className="kicker">
                <Cursor className="kicker-cursor" />
                Websites that convert
              </p>
              <h1>
                From the click
                <span> to the customer.</span>
              </h1>
              <p className="lede">
                KONVRT builds the page that gets the next step. Shopify and online brands get a
                site that sells. Lawyers and insurance agents get more leads. Local businesses get
                the quote and the call. Refresh the site you have, or rebuild it. AI employees
                on the help desk answer, book, and follow up.
              </p>
              <div className="hero-actions" ref={heroActions}>
                <a className="btn btn-primary" href="#offers">
                  See the websites
                </a>
                <button type="button" className="btn btn-ghost" onClick={() => openInquiry("custom")}>
                  Inquire about custom creative
                </button>
              </div>
            </div>
            <div className="hero-art" ref={heroArt}>
              <img src="/mark.png" width={599} height={651} alt="" />
            </div>
          </div>
          <div className="wrap">
            <div className="price-strip" aria-label="Website prices">
              {[...websites, customOffer].map((offer) => (
                <button
                  key={offer.id}
                  type="button"
                  className={offer.core ? "is-core" : undefined}
                  onClick={() => goToOffer(offer.id)}
                >
                  <span>{offer.short}</span>
                  <strong>{priceHeadline(offer)}</strong>
                  <small>{offer.priceNote}</small>
                </button>
              ))}
            </div>
            <ul className="facts">
              <li>A path to buy, book, or call</li>
              <li>Care plan, $150 a month, optional</li>
              <li>You keep your social logins</li>
            </ul>
          </div>
        </section>

        <section className="section result-section" id="results">
          <div className="wrap">
            <div className="result-panel">
              <p className="kicker">Results</p>
              <p className="result-figure">
                <span className="sr-only">$10 million</span>
                <span aria-hidden="true">${millions} million</span>
              </p>
              <h2>Generated for our clients.</h2>
              <p className="lede">
                Work we contributed to has generated $10 million for our clients.
              </p>
              <div className="client-grid">
                {clientResults.map((client) => (
                  <article key={client.id} className="client-card">
                    {client.logo ? (
                      <img src={client.logo} alt={client.logoAlt} />
                    ) : (
                      <p className="client-private">Private</p>
                    )}
                    <p className="kicker">{client.label}</p>
                    <h3>{client.name}</h3>
                    <p className="client-amount">{client.amount}</p>
                    <p className="detail">{client.detail}</p>
                    {client.href ? (
                      <a href={client.href} target="_blank" rel="noopener noreferrer">
                        {client.hrefLabel}
                      </a>
                    ) : null}
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="section" id="examples">
          <div className="wrap">
            <div className="section-head">
              <p className="kicker">Examples</p>
              <h2>The page asks for the next step.</h2>
              <p className="lede">
                Sample pages. A product you can buy, a consult you can book, and a policy you can
                ask about. Local businesses still get the quote and the call.
              </p>
            </div>
            <div className="proof-grid">
              <figure className="shot">
                <div className="browser">
                  <div className="browser-bar" aria-hidden="true">
                    <span />
                    <span />
                    <span />
                    <em>marlow.example</em>
                  </div>
                  <div className="mini mini-shop">
                    <img src="/examples/oil.jpg" alt="" />
                    <p className="mini-brand">Marlow</p>
                    <h3>Cedar hand oil.</h3>
                    <p>$28. A short product page, then the cart.</p>
                    <div className="mini-actions">
                      <b>Add to cart</b>
                    </div>
                  </div>
                </div>
                <figcaption>
                  <span>Example</span>
                  The product page
                </figcaption>
              </figure>

              <figure className="shot">
                <div className="browser">
                  <div className="browser-bar" aria-hidden="true">
                    <span />
                    <span />
                    <span />
                    <em>ames.example</em>
                  </div>
                  <div className="mini mini-form">
                    <p className="mini-brand">Ames Law</p>
                    <h3>Request a consult</h3>
                    <label>
                      What happened?
                      <i>Rear-ended yesterday</i>
                    </label>
                    <label>
                      Phone
                      <i>(555) 014-2200</i>
                    </label>
                    <b>Send the request</b>
                  </div>
                </div>
                <figcaption>
                  <span>Example</span>
                  The consult form
                </figcaption>
              </figure>

              <figure className="shot">
                <div className="phone">
                  <div className="phone-notch" aria-hidden="true" />
                  <div className="mini mini-phone">
                    <p className="mini-brand">Pell Insurance</p>
                    <h3>Ask about a policy.</h3>
                    <p>Home, auto, or a business policy. Call or send the details.</p>
                    <b>Tap to call</b>
                    <div className="mini-note">
                      <strong>New lead</strong>
                      <span>Home policy, closing Friday</span>
                    </div>
                  </div>
                </div>
                <figcaption>
                  <span>Example</span>
                  An insurance lead
                </figcaption>
              </figure>
            </div>

            <div className="ugc-block">
              <h3>What comes back.</h3>
              <div className="proof-grid">
                <figure className="shot">
                  <div className="textshot">
                    <header>
                      <strong>Marlow</strong>
                      <span>Today, 7:14 AM</span>
                    </header>
                    <div className="bubble in">
                      Order placed. Cedar hand oil, two bottles.
                      <img src="/examples/oil.jpg" alt="" />
                    </div>
                    <div className="bubble out">Packed today. It ships in the morning.</div>
                  </div>
                  <figcaption>
                    <span>Example</span>
                    An order, with the photo
                  </figcaption>
                </figure>

                <figure className="shot">
                  <div className="textshot">
                    <header>
                      <strong>Ames Law</strong>
                      <span>Today, 9:40 AM</span>
                    </header>
                    <div className="bubble in">
                      Rear-ended yesterday. Can I talk with someone this week?
                    </div>
                    <div className="bubble out">Thursday at 10:00 works. The office will call you then. This is not legal advice.</div>
                  </div>
                  <figcaption>
                    <span>Example</span>
                    A lead for a lawyer
                  </figcaption>
                </figure>

                <figure className="shot">
                  <div className="textshot">
                    <header>
                      <strong>Northline Roofing</strong>
                      <span>Today, 8:02 AM</span>
                    </header>
                    <div className="bubble in">
                      Ceiling is dripping. Can someone come this week?
                      <img src="/examples/leak.jpg" alt="" />
                    </div>
                    <div className="bubble out">Thursday morning is open. Send the address and we will book the visit.</div>
                  </div>
                  <figcaption>
                    <span>Example</span>
                    A local quote
                  </figcaption>
                </figure>
              </div>
            </div>
          </div>
        </section>

        <section className="section" id="offers">
          <div className="wrap">
            <div className="section-head">
              <p className="kicker">Websites</p>
              <h2>Built once. Then you own it.</h2>
              <p className="lede">
                Refresh the site you already have, or start over. Shops get a page that sells.
                Lawyers and insurance agents get a page that collects leads. Local businesses get
                the quote and the call. AI employees on the help desk answer and follow up after that.
              </p>
            </div>
            <div className="offer-grid">
              {websites.map((offer, index) => (
                <article
                  key={offer.id}
                  id={`offer-${offer.id}`}
                  className="offer is-core reveal"
                  style={{ "--d": `${index * 80}ms` } as CSSProperties}
                >
                  {offer.core && <p className="badge">Full site</p>}
                  <h3>{offer.name}</h3>
                  <p className="price">
                    <strong>{priceHeadline(offer)}</strong>
                    <span>{offer.priceNote}</span>
                  </p>
                  <p className="summary">{offer.summary}</p>
                  <p className="best">
                    <span>Best for</span>
                    {offer.bestFor}
                  </p>
                  <ul>
                    {offer.items.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => openInquiry(offer.id)}
                  >
                    {offer.cta}
                  </button>
                </article>
              ))}
            </div>

            <aside className="care-bar" id="offer-care">
              <div>
                <p className="kicker">Optional, after launch</p>
                <h3>{care.name}</h3>
                <p>{care.summary}</p>
              </div>
              <p className="price">
                <strong>{priceHeadline(care)}</strong>
                <span>per month</span>
              </p>
              <button type="button" className="btn btn-ghost" onClick={() => openInquiry("care")}>
                {care.cta}
              </button>
            </aside>

            <div className="promise">
              <p>{guarantee}</p>
            </div>
          </div>
        </section>

        <DeskExamples onRequest={() => openInquiry("front-desk")} />

        <section className="section" id="creative">
          <div className="wrap">
            <div className="section-head">
              <p className="kicker">Creative</p>
              <h2>We plan it. You post it.</h2>
              <p className="lede">
                Hooks, captions, a calendar, and shot notes for a product, a practice, or a local
                business. A half-day shoot if you want the footage. Custom creative if the work
                needs its own scope.
              </p>
            </div>
            <div className="offer-grid two">
              {creativeOffers.map((offer, index) => (
                <article
                  key={offer.id}
                  id={`offer-${offer.id}`}
                  className="offer reveal"
                  style={{ "--d": `${index * 80}ms` } as CSSProperties}
                >
                  <h3>{offer.name}</h3>
                  <p className="price">
                    <strong>{priceHeadline(offer)}</strong>
                    <span>{offer.priceNote}</span>
                  </p>
                  <p className="summary">{offer.summary}</p>
                  <p className="best">
                    <span>Best for</span>
                    {offer.bestFor}
                  </p>
                  <ul>
                    {offer.items.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                  <button type="button" className="btn btn-ghost" onClick={() => openInquiry(offer.id)}>
                    {offer.cta}
                  </button>
                </article>
              ))}
            </div>

            <aside className="custom-band" id="offer-custom">
              <div>
                <p className="kicker">
                  <Cursor className="kicker-cursor" />
                  Custom creative
                </p>
                <h3>If the creative needs its own shape, describe it.</h3>
                <p>
                  {customOffer.summary} You send the outcome, a budget range, and the timing. We
                  reply within one business day with a scope and a price, or we point you to the
                  add-on that already fits.
                </p>
                <p className="best">
                  <span>Best for</span>
                  {customOffer.bestFor}
                </p>
              </div>
              <div className="custom-actions">
                <div className="seed-row">
                  {customSeeds.map((seed) => (
                    <button key={seed.label} type="button" onClick={() => openInquiry("custom", seed.note)}>
                      {seed.label}
                    </button>
                  ))}
                </div>
                <button type="button" className="btn btn-primary" onClick={() => openInquiry("custom")}>
                  Inquire about custom creative
                </button>
              </div>
            </aside>

            <div className="promise">
              <p>{mediaNote}</p>
            </div>
          </div>
        </section>

        <section className="section" id="compare">
          <div className="wrap">
            <div className="section-head">
              <p className="kicker">Side by side</p>
              <h2>Compare the websites.</h2>
            </div>
            <div className="table-wrap">
              <table>
                <caption className="sr-only">Website comparison</caption>
                <thead>
                  <tr>
                    <th scope="col">Included</th>
                    {websites.map((offer) => (
                      <th key={offer.id} scope="col" className={offer.core ? "is-core" : undefined}>
                        {offer.short}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {comparison.map((row) => (
                    <tr key={row.label}>
                      <th scope="row">{row.label}</th>
                      {websites.map((offer) => (
                        <td key={offer.id} className={offer.core ? "is-core" : undefined}>
                          {row.cells[offer.id]}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <section className="section" id="process">
          <div className="wrap">
            <div className="section-head">
              <p className="kicker">How it works</p>
              <h2>From inquiry to a site you can run.</h2>
            </div>
            <ol className="steps">
              {steps.map((step, index) => (
                <li key={step.n} className="reveal" style={{ "--d": `${index * 80}ms` } as CSSProperties}>
                  <span>{step.n}</span>
                  <h3>{step.title}</h3>
                  <p>{step.body}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="section" id="fit">
          <div className="wrap">
            <div className="section-head">
              <p className="kicker">Fit</p>
              <h2>Who this is for.</h2>
              <p className="lede">
                A shop, a law firm, an insurance agency, or a local business. Add AI employees when
                you want the site to answer, book, and hand you the thread.
              </p>
            </div>
            <div className="fit-grid">
              <article className="reveal">
                <h3>A good fit</h3>
                <ul>
                  {fit.forYou.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </article>
              <article className="reveal" style={{ "--d": "80ms" } as CSSProperties}>
                <h3>Outside this work</h3>
                <ul>
                  {fit.outside.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </article>
            </div>
          </div>
        </section>

        <section className="section" id="questions">
          <div className="wrap questions">
            <div className="section-head">
              <p className="kicker">Questions</p>
              <h2>Before you inquire.</h2>
            </div>
            <div className="faq">
              {faqs.map((item) => (
                <details key={item.id} open={item.id === "custom"}>
                  <summary>{item.q}</summary>
                  <p>{item.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section className="section close-section" id="inquire">
          <div className="wrap close-panel">
            <div>
              <p className="kicker">
                <Cursor className="kicker-cursor" />
                Start here
              </p>
              <h2>Pick a website, or describe the creative.</h2>
              <p className="lede">
                The price is the same for a shop, a firm, or a local business. Custom creative is
                scoped after you tell us the outcome.
              </p>
            </div>
            <div className="close-actions">
              <a className="btn btn-primary" href="#offers">
                See the websites
              </a>
              <button type="button" className="btn btn-ghost" onClick={() => openInquiry("custom")}>
                Custom creative
              </button>
            </div>
          </div>
        </section>

        <section className="section" id="founders">
          <div className="wrap">
            <div className="section-head">
              <p className="kicker">Founders</p>
              <h2>Emmerson and Seven.</h2>
            </div>
            <div className="founder-grid">
              <article className="reveal">
                <img src="/founders/emmerson.jpg" width={1570} height={884} alt="Emmerson, co-founder and CMO" />
                <h3>Emmerson</h3>
                <p>Co-founder + CMO</p>
              </article>
              <article className="reveal" style={{ "--d": "80ms" } as CSSProperties}>
                <img src="/founders/seven.jpg" width={1570} height={882} alt="Seven, co-founder and CEO" />
                <h3>Seven</h3>
                <p>Co-founder + CEO</p>
              </article>
            </div>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <div className="wrap footer-bar">
          <a className="brand" href="#top">
            <img src="/wordmark.png" width={1034} height={181} alt="KONVRT" />
          </a>
          <p>Websites for shops, firms, and local businesses. Built once, with the price on the page.</p>
          <a href={`mailto:${inquiryEmail}`}>{inquiryEmail}</a>
        </div>
      </footer>

      <nav className="section-rail" aria-label="On this page">
        {rail.map(([id, label]) => (
          <a key={id} href={`#${id}`} aria-current={band === id || (id === "offers" && (band === "compare" || band === "process")) ? "true" : undefined}>
            <span>{label}</span>
          </a>
        ))}
      </nav>

      <div className={showSticky ? "sticky-cta is-on" : "sticky-cta"}>
        <a href={sticky.href}>{sticky.ghost}</a>
        <button type="button" onClick={() => openInquiry(sticky.packageId)}>
          {sticky.primary}
        </button>
      </div>

      <InquiryDialog
        open={inquiry.open}
        packageId={inquiry.packageId}
        note={inquiry.note}
        requestKey={inquiry.requestKey}
        onClose={closeInquiry}
      />
    </>
  );
}
