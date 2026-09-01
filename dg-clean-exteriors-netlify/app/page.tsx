"use client";

import { FormEvent, KeyboardEvent, useEffect, useMemo, useRef, useState } from "react";

type Service = {
  number: string;
  title: string;
  short: string;
  detail: string;
  tag: string;
  previewPosition: string;
};

type AddressSuggestion = {
  id: string;
  label: string;
  primary: string;
  secondary: string;
};

type PhotonFeature = {
  properties?: {
    city?: string;
    country?: string;
    countrycode?: string;
    district?: string;
    housenumber?: string;
    locality?: string;
    name?: string;
    osm_id?: number;
    postcode?: string;
    state?: string;
    street?: string;
  };
};

const residentialServices: Service[] = [
  {
    number: "01",
    title: "Driveway reset",
    short: "Concrete, curbs & walkways",
    detail:
      "Lift the tire tracks, dark traffic lanes, and settled grime that make the front of your property feel older than it is.",
    tag: "High-pressure clean",
    previewPosition: "center 76%",
  },
  {
    number: "02",
    title: "House wash",
    short: "Siding, brick & trim",
    detail:
      "A surface-aware wash for the green film, dust lines, webs, and everyday buildup living across your exterior.",
    tag: "Lower-pressure care",
    previewPosition: "center 48%",
  },
  {
    number: "03",
    title: "Patio revive",
    short: "Outdoor rooms & pool decks",
    detail:
      "Bring back the space where people actually gather—from the back-door landing to the full entertaining area.",
    tag: "Gather-ready finish",
    previewPosition: "center 82%",
  },
  {
    number: "04",
    title: "Fence & deck wash",
    short: "Wood, composite & masonry",
    detail:
      "Clear away the gray cast and organic buildup while matching the wash method to what the surface can handle.",
    tag: "Material-matched wash",
    previewPosition: "left 70%",
  },
  {
    number: "05",
    title: "Window washing",
    short: "Exterior glass, frames & screens",
    detail:
      "Clear away pollen, dust, water spots, and the film that keeps clean windows from actually looking clean.",
    tag: "Glass-clear finish",
    previewPosition: "center 47%",
  },
];

const commercialServices: Service[] = [
  {
    number: "01",
    title: "Storefront refresh",
    short: "Entries, facades & awnings",
    detail:
      "Make the walk from parking spot to front door feel cared for before your customer ever steps inside.",
    tag: "First-impression clean",
    previewPosition: "center 54%",
  },
  {
    number: "02",
    title: "Walkway reset",
    short: "Sidewalks, curbs & approaches",
    detail:
      "Remove the traffic pattern, gum marks, and grime bands that quietly drag down an otherwise sharp property.",
    tag: "Traffic-area clean",
    previewPosition: "right 82%",
  },
  {
    number: "03",
    title: "Property wash",
    short: "Small offices & common areas",
    detail:
      "A focused exterior clean for the visible areas tenants, teams, and customers notice every single day.",
    tag: "Exterior maintenance",
    previewPosition: "center 58%",
  },
  {
    number: "04",
    title: "Custom exterior plan",
    short: "Mixed surfaces & repeat care",
    detail:
      "Tell us where the property is losing its edge. We’ll shape the wash around the surfaces and the way the space is used.",
    tag: "Scope-built quote",
    previewPosition: "center 68%",
  },
  {
    number: "05",
    title: "Commercial window washing",
    short: "Storefront glass, doors & exterior panes",
    detail:
      "Keep the glass customers see first free from fingerprints, traffic film, water spots, and everyday buildup.",
    tag: "Customer-facing shine",
    previewPosition: "center 45%",
  },
];

const residentialQuoteOptions = [
  "Driveway / concrete",
  "House exterior",
  "Patio / pool deck",
  "Fence / deck",
  "Exterior windows / glass",
  "Not sure yet",
];

const commercialQuoteOptions = [
  "Storefront / facade",
  "Sidewalks / curbs",
  "Parking area / concrete",
  "Office exterior / common area",
  "Recurring exterior care",
  "Exterior windows / storefront glass",
  "Not sure yet",
];

const faqs = [
  {
    question: "Will every surface get the same pressure?",
    answer:
      "No. Dense concrete can take a very different approach than siding, painted trim, or wood. The wash should be matched to the surface—not forced through one setting.",
  },
  {
    question: "What should I move before the wash?",
    answer:
      "Small decor, loose cushions, and anything fragile near the work area should come inside. If something heavy is in the way, mention it when you request your quote so the plan can account for it.",
  },
  {
    question: "Can I request more than one area?",
    answer:
      "Absolutely. Choose every area you want refreshed in the quote builder. Seeing the full scope at once makes it easier to shape a cleaner, more efficient wash plan.",
  },
  {
    question: "How do I book with DG Clean Exteriors?",
    answer:
      "Build your project brief below, copy it, and send it through the official @dg_clean_exteriors Instagram account. That keeps the details together from the first message.",
  },
];

export default function Home() {
  const heroRef = useRef<HTMLElement>(null);
  const heroVideoRef = useRef<HTMLVideoElement>(null);
  const [serviceMode, setServiceMode] = useState<"home" | "business">("home");
  const [propertyType, setPropertyType] = useState<"Residential" | "Commercial" | "">("");
  const [wizardStep, setWizardStep] = useState(1);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [name, setName] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [address, setAddress] = useState("");
  const [addressSuggestions, setAddressSuggestions] = useState<AddressSuggestion[]>([]);
  const [addressStatus, setAddressStatus] = useState<"idle" | "loading" | "ready" | "error">("idle");
  const [addressOpen, setAddressOpen] = useState(false);
  const [addressSelected, setAddressSelected] = useState(false);
  const [activeAddressIndex, setActiveAddressIndex] = useState(-1);
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [quoteReady, setQuoteReady] = useState(false);
  const [copied, setCopied] = useState(false);

  const services = serviceMode === "home" ? residentialServices : commercialServices;
  const activeQuoteOptions =
    propertyType === "Commercial" ? commercialQuoteOptions : residentialQuoteOptions;
  const totalWizardSteps = 4;
  const wizardLabels =
    propertyType === "Commercial"
      ? ["Choose path", "Business", "Work scope", "Contact"]
      : ["Choose path", "Home", "Curb appeal", "Contact"];
  const canContinue =
    wizardStep === 1
      ? Boolean(propertyType)
      : wizardStep === 2
        ? Boolean(address.trim()) &&
          (propertyType !== "Commercial" || Boolean(businessName.trim()))
        : wizardStep === 3
          ? selectedServices.length > 0
          : Boolean(name.trim() && email.trim() && phone.trim());

  useEffect(() => {
    const hero = heroRef.current;
    const heroVideo = heroVideoRef.current;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    if (!hero || reducedMotion.matches) return;

    let frame = 0;

    const smoothstep = (value: number, start: number, end: number) => {
      const amount = Math.max(0, Math.min(1, (value - start) / (end - start)));
      return amount * amount * (3 - 2 * amount);
    };

    const windowedPhase = (value: number, start: number, end: number) => {
      const fade = 0.055;
      return Math.min(
        smoothstep(value, start, start + fade),
        1 - smoothstep(value, end - fade, end),
      );
    };

    const updateHeroStory = () => {
      frame = 0;
      const rect = hero.getBoundingClientRect();
      const scrollable = Math.max(1, rect.height - window.innerHeight);
      const progress = Math.max(0, Math.min(1, -rect.top / scrollable));
      const introOpacity = 1 - smoothstep(progress, 0.035, 0.19);
      const cleanProgress = smoothstep(progress, 0.2, 0.9);
      const houseCallout = windowedPhase(progress, 0.3, 0.54);
      const glassCallout = windowedPhase(progress, 0.47, 0.71);
      const drivewayCallout = windowedPhase(progress, 0.64, 0.88);
      const finishCallout = smoothstep(progress, 0.84, 0.95);

      if (heroVideo && Number.isFinite(heroVideo.duration) && heroVideo.duration > 0) {
        const targetTime = Math.min(
          Math.max(0, heroVideo.duration - 0.04),
          heroVideo.duration * cleanProgress,
        );

        if (Math.abs(heroVideo.currentTime - targetTime) > 0.025) {
          heroVideo.currentTime = targetTime;
        }
      }

      hero.style.setProperty("--story-progress", `${progress}`);
      hero.style.setProperty("--intro-opacity", `${introOpacity}`);
      hero.style.setProperty("--intro-y", `${(1 - introOpacity) * -22}px`);
      hero.style.setProperty("--logo-opacity", `${introOpacity * 0.13}`);
      hero.style.setProperty("--scene-overlay-opacity", `${0.12 + introOpacity * 0.66}`);
      hero.style.setProperty("--callout-house", `${houseCallout}`);
      hero.style.setProperty("--callout-house-y", `${(1 - houseCallout) * 18}px`);
      hero.style.setProperty("--callout-glass", `${glassCallout}`);
      hero.style.setProperty("--callout-glass-y", `${(1 - glassCallout) * 18}px`);
      hero.style.setProperty("--callout-driveway", `${drivewayCallout}`);
      hero.style.setProperty("--callout-driveway-y", `${(1 - drivewayCallout) * 18}px`);
      hero.style.setProperty("--callout-finish", `${finishCallout}`);
      hero.style.setProperty("--callout-finish-y", `${(1 - finishCallout) * 18}px`);
    };

    const requestHeroStory = () => {
      if (!frame) frame = window.requestAnimationFrame(updateHeroStory);
    };

    updateHeroStory();
    window.addEventListener("scroll", requestHeroStory, { passive: true });
    window.addEventListener("resize", requestHeroStory);
    heroVideo?.addEventListener("loadedmetadata", requestHeroStory);

    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", requestHeroStory);
      window.removeEventListener("resize", requestHeroStory);
      heroVideo?.removeEventListener("loadedmetadata", requestHeroStory);
    };
  }, []);

  useEffect(() => {
    const query = address.trim();

    if (wizardStep !== 2 || addressSelected || query.length < 3) {
      return;
    }

    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setAddressStatus("loading");

      try {
        const params = new URLSearchParams({
          q: query,
          limit: "6",
          lang: "en",
          countrycode: "US",
        });
        params.append("layer", "house");
        params.append("layer", "street");

        const response = await fetch(`https://photon.komoot.io/api/?${params.toString()}`, {
          signal: controller.signal,
        });

        if (!response.ok) throw new Error("Address search unavailable");

        const data = (await response.json()) as { features?: PhotonFeature[] };
        const seen = new Set<string>();
        const nextSuggestions = (data.features ?? [])
          .map((feature, index) => {
            const properties = feature.properties ?? {};
            const streetLine = [properties.housenumber, properties.street]
              .filter(Boolean)
              .join(" ");
            const primary = streetLine || properties.name || "Address";
            const locality = properties.city || properties.locality || properties.district;
            const secondary = [locality, properties.state, properties.postcode]
              .filter(Boolean)
              .join(", ");
            const country = properties.countrycode === "US" ? "" : properties.country;
            const label = [primary, secondary, country].filter(Boolean).join(", ");

            return {
              id: `${properties.osm_id ?? index}-${label}`,
              label,
              primary,
              secondary,
            };
          })
          .filter((suggestion) => {
            if (!suggestion.label || seen.has(suggestion.label)) return false;
            seen.add(suggestion.label);
            return true;
          });

        setAddressSuggestions(nextSuggestions);
        setAddressStatus("ready");
        setAddressOpen(true);
        setActiveAddressIndex(-1);
      } catch (error) {
        if ((error as Error).name === "AbortError") return;
        setAddressSuggestions([]);
        setAddressStatus("error");
        setAddressOpen(false);
      }
    }, 400);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [address, addressSelected, wizardStep]);

  const quoteText = useMemo(() => {
    const selected = selectedServices.length
      ? selectedServices.join(", ")
      : "I’m not sure which service fits yet";

    return [
      "Hey DG Clean Exteriors — I’d like a curb-appeal quote.",
      `Property type: ${propertyType || "Not added"}`,
      ...(propertyType === "Commercial"
        ? [`Business / property: ${businessName || "Not added"}`]
        : []),
      `Service address: ${address || "Not added"}`,
      `Name: ${name || "Not added"}`,
      `Email: ${email || "Not added"}`,
      `Phone: ${phone || "Not added"}`,
      `What needs cleaning: ${selected}`,
      `Project notes: ${notes || "No extra notes"}`,
    ].join("\n");
  }, [address, businessName, email, name, notes, phone, propertyType, selectedServices]);

  const toggleQuoteService = (option: string) => {
    setSelectedServices((current) =>
      current.includes(option)
        ? current.filter((item) => item !== option)
        : [...current, option],
    );
  };

  const handleQuote = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (wizardStep < totalWizardSteps) {
      if (canContinue) setWizardStep((current) => Math.min(totalWizardSteps, current + 1));
      return;
    }

    setQuoteReady(true);
    setCopied(false);
  };

  const choosePropertyType = (type: "Residential" | "Commercial") => {
    if (propertyType !== type) {
      setSelectedServices([]);
      if (type === "Residential") setBusinessName("");
    }
    setPropertyType(type);
    setWizardStep(2);
  };

  const selectAddress = (suggestion: AddressSuggestion) => {
    setAddress(suggestion.label);
    setAddressSelected(true);
    setAddressSuggestions([]);
    setAddressStatus("idle");
    setAddressOpen(false);
    setActiveAddressIndex(-1);
  };

  const handleAddressKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (!addressOpen || addressSuggestions.length === 0) {
      if (event.key === "Escape") setAddressOpen(false);
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveAddressIndex((current) => Math.min(addressSuggestions.length - 1, current + 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveAddressIndex((current) => Math.max(0, current - 1));
    } else if (event.key === "Enter" && activeAddressIndex >= 0) {
      event.preventDefault();
      selectAddress(addressSuggestions[activeAddressIndex]);
    } else if (event.key === "Escape") {
      setAddressOpen(false);
    }
  };

  const copyQuote = async () => {
    await navigator.clipboard.writeText(quoteText);
    setCopied(true);
  };

  return (
    <main>
      <header className="site-header">
        <a className="brand-lockup" href="#top" aria-label="DG Clean Exteriors home">
          <img src="/dg-clean-logo.png" alt="DG Clean Exteriors" />
          <span>
            <strong>DG Clean</strong>
            <small>Exteriors</small>
          </span>
        </a>

        <nav aria-label="Primary navigation">
          <a href="#clean">What we clean</a>
          <a href="#difference">The DG method</a>
          <a href="#faq">Questions</a>
        </nav>

        <a className="button button-small" href="#quote">
          Build my quote <span aria-hidden="true">↗</span>
        </a>
      </header>

      <section className="hero" id="top" ref={heroRef}>
        <div className="hero-sticky">
          <div className="hero-scene">
            <video
              aria-hidden="true"
              className="hero-video"
              muted
              playsInline
              poster="/hero-video-poster.jpg"
              preload="auto"
              ref={heroVideoRef}
            >
              <source src="/dg-cleaning-hero.mp4" type="video/mp4" />
            </video>
            <img
              alt=""
              aria-hidden="true"
              className="hero-watermark"
              src="/dg-clean-logo.png"
            />
            <div className="hero-scene-overlay" aria-hidden="true" />
            <div className="hero-photo-grain" aria-hidden="true" />
          </div>

          <div className="hero-copy">
            <p className="eyebrow">
              <span>Built on pressure</span>
              <i />
              <span>Guided by God</span>
            </p>
            <h1>
              Bringing
              <span className="outline-word"> curb appeal </span>
              back.
            </h1>
            <p className="hero-intro">
              Scroll the property. See how DG matches the wash to the brick,
              glass, and concrete—then finishes the full frame.
            </p>
            <div className="hero-actions">
              <a className="button" href="#quote">
                Build my wash plan <span aria-hidden="true">↗</span>
              </a>
              <a className="text-link" href="#clean">
                See what we clean <span aria-hidden="true">↓</span>
              </a>
            </div>
          </div>

          <div className="hero-scroll-cue" aria-hidden="true">
            <span>Scroll to clean</span>
            <i />
          </div>

          <div className="hero-callouts" aria-label="Services revealed during the exterior cleaning">
            <article className="hero-callout hero-callout-house">
              <span>01 · Brick &amp; trim</span>
              <strong>Surface-aware house wash</strong>
              <p>Lower pressure where the exterior needs more care.</p>
            </article>
            <article className="hero-callout hero-callout-glass">
              <span>02 · Exterior glass</span>
              <strong>Window washing</strong>
              <p>Pollen, dust, water spots, frames, and exterior panes.</p>
            </article>
            <article className="hero-callout hero-callout-driveway">
              <span>03 · Concrete</span>
              <strong>Driveway reset</strong>
              <p>Traffic lanes, tire arcs, curbs, steps, and the front walk.</p>
            </article>
            <article className="hero-callout hero-callout-finish">
              <span>04 · The DG finish</span>
              <strong>The full frame lands clean.</strong>
              <p>Edges checked. Method matched. Curb appeal back.</p>
            </article>
          </div>

          <div className="hero-story-rail" aria-hidden="true">
            <span>Before</span>
            <i><b /></i>
            <span>After</span>
          </div>
        </div>
      </section>

      <section className="brand-strip" aria-label="DG Clean Exteriors promises">
        <span>Exterior-focused</span>
        <b aria-hidden="true">✦</b>
        <span>Surface-aware</span>
        <b aria-hidden="true">✦</b>
        <span>Detail-minded</span>
        <b aria-hidden="true">✦</b>
        <span>Built for the before &amp; after</span>
      </section>

      <section className="section what-we-clean" id="clean">
        <div className="section-heading split-heading">
          <div>
            <p className="eyebrow green">Not a one-setting-fits-all wash</p>
            <h2>What we clean.</h2>
          </div>
          <div className="section-heading-side">
            <p>
              Choose the side of the curb you’re responsible for. Each service
              is shaped around the material, the buildup, and the finish you want back.
            </p>
            <div className="mode-switch" aria-label="Choose property type">
              <button
                className={serviceMode === "home" ? "active" : ""}
                onClick={() => setServiceMode("home")}
                type="button"
              >
                At home
              </button>
              <button
                className={serviceMode === "business" ? "active" : ""}
                onClick={() => setServiceMode("business")}
                type="button"
              >
                At work
              </button>
            </div>
          </div>
        </div>

        <div className="service-list">
          {services.map((service) => (
            <article className="service-row" key={`${serviceMode}-${service.number}`}>
              <span className="service-number">{service.number}</span>
              <div className="service-title">
                <h3>{service.title}</h3>
                <span>{service.short}</span>
              </div>
              <p>{service.detail}</p>
              <span className="service-tag">{service.tag}</span>
              <figure className="service-preview" aria-hidden="true">
                <img
                  src="/hero-video-poster.jpg"
                  alt=""
                  style={{ objectPosition: service.previewPosition }}
                />
                <figcaption>
                  <span>Past-work photo slot</span>
                  <strong>{service.title}</strong>
                  <em>Drop a before + after here</em>
                </figcaption>
              </figure>
              <a href="#quote" aria-label={`Get a quote for ${service.title}`}>
                ↗
              </a>
            </article>
          ))}
        </div>
      </section>

      <section className="method-section" id="difference">
        <div className="method-photo">
          <img
            src="/dg-clean-gear.png"
            alt="DG Clean Exteriors branded shirts and hats"
          />
          <span className="photo-stamp">Show up sharp</span>
        </div>

        <div className="method-copy">
          <p className="eyebrow blue">The DG method</p>
          <h2>
            Strong enough to restore it.
            <em> Thoughtful enough to protect it.</em>
          </h2>
          <p className="method-lead">
            The goal isn’t to throw maximum pressure at everything in sight. It’s
            to read the surface, attack the buildup, and leave the whole view
            noticeably better—from the center of the driveway to the last curb edge.
          </p>

          <ol className="method-steps">
            <li>
              <span>01</span>
              <div>
                <strong>Read the surface</strong>
                <p>Material, condition, runoff, and the grime that needs to move.</p>
              </div>
            </li>
            <li>
              <span>02</span>
              <div>
                <strong>Match the wash</strong>
                <p>More force for durable flatwork; more care for sensitive exteriors.</p>
              </div>
            </li>
            <li>
              <span>03</span>
              <div>
                <strong>Finish the full frame</strong>
                <p>Edges, transitions, and the details that make the after-shot land.</p>
              </div>
            </li>
          </ol>
        </div>
      </section>

      <section className="curb-callout">
        <p>Your place should feel good before you even step inside.</p>
        <h2>Give the outside its comeback.</h2>
        <a className="button button-dark" href="#quote">
          Start my curb comeback <span aria-hidden="true">↗</span>
        </a>
      </section>

      <section className="section quote-section" id="quote">
        <div className="quote-intro">
          <p className="eyebrow green">A faster way to get started</p>
          <h2>Build your quote.</h2>
          <p>
            Choose the property, pick what needs cleaning, and tell us how to reach you.
          </p>
          <div className="quote-aside">
            <span>01</span>
            <p>Choose home or business.</p>
            <span>02</span>
            <p>Add the service address.</p>
            <span>03</span>
            <p>Pick what needs cleaning.</p>
            <span>04</span>
            <p>Add your contact info.</p>
          </div>
        </div>

        <div className="quote-card">
          {!quoteReady ? (
            <form onSubmit={handleQuote}>
              <div className="form-heading">
                <span>DG / QUICK QUOTE</span>
                <small>
                  {propertyType ? `${propertyType} workflow` : "Choose your property path"}
                </small>
              </div>

              <div className="quote-progress" aria-label={`Quote step ${wizardStep} of ${totalWizardSteps}`}>
                <div className="progress-meta">
                  <span>{wizardStep} / {totalWizardSteps}</span>
                  <strong>{wizardLabels[wizardStep - 1]}</strong>
                </div>
                <div className="progress-track" aria-hidden="true">
                  <span style={{ width: `${(wizardStep / totalWizardSteps) * 100}%` }} />
                </div>
                <div className="progress-steps">
                  {wizardLabels.map((label, index) => {
                    const step = index + 1;
                    const state = step < wizardStep ? "complete" : step === wizardStep ? "active" : "";

                    return (
                      <span className={state} key={label} aria-current={step === wizardStep ? "step" : undefined}>
                        <i>{step < wizardStep ? "✓" : step}</i>
                        {label}
                      </span>
                    );
                  })}
                </div>
              </div>

              <div className="wizard-panel" key={wizardStep}>
                {wizardStep === 1 && (
                  <>
                    <p className="wizard-kicker">Choose a path</p>
                    <h3>Home or business?</h3>
                    <div className="path-grid">
                      <button
                        className={propertyType === "Residential" ? "path-card selected" : "path-card"}
                        onClick={() => choosePropertyType("Residential")}
                        type="button"
                      >
                        <span>Residential</span>
                        <strong>Home</strong>
                        <small>Driveway · exterior · windows</small>
                        <b aria-hidden="true">{propertyType === "Residential" ? "✓" : "01"}</b>
                      </button>
                      <button
                        className={propertyType === "Commercial" ? "path-card selected" : "path-card"}
                        onClick={() => choosePropertyType("Commercial")}
                        type="button"
                      >
                        <span>Commercial</span>
                        <strong>Business</strong>
                        <small>Storefront · concrete · glass</small>
                        <b aria-hidden="true">{propertyType === "Commercial" ? "✓" : "02"}</b>
                      </button>
                    </div>
                  </>
                )}

                {wizardStep === 2 && (
                  <>
                    <p className="wizard-kicker">Property details</p>
                    <h3>Where is it?</h3>
                    {propertyType === "Commercial" && (
                      <label className="form-field">
                        Property name
                        <input
                          value={businessName}
                          onChange={(event) => setBusinessName(event.target.value)}
                          placeholder="Business or property name"
                          autoComplete="organization"
                          autoFocus
                          required
                        />
                      </label>
                    )}
                    <div className="form-field address-field">
                      <label htmlFor="service-address">Service address</label>
                      <div className="address-autocomplete">
                        <input
                          id="service-address"
                          value={address}
                          onChange={(event) => {
                            const nextAddress = event.target.value;
                            setAddress(nextAddress);
                            setAddressSelected(false);
                            if (nextAddress.trim().length < 3) {
                              setAddressSuggestions([]);
                              setAddressStatus("idle");
                              setAddressOpen(false);
                              setActiveAddressIndex(-1);
                            }
                          }}
                          onFocus={() => {
                            if (!addressSelected && addressSuggestions.length > 0) setAddressOpen(true);
                          }}
                          onBlur={() => window.setTimeout(() => setAddressOpen(false), 120)}
                          onKeyDown={handleAddressKeyDown}
                          placeholder="Start typing your address"
                          autoComplete="street-address"
                          autoFocus={propertyType !== "Commercial"}
                          role="combobox"
                          aria-autocomplete="list"
                          aria-expanded={addressOpen}
                          aria-controls="address-suggestions"
                          aria-activedescendant={
                            activeAddressIndex >= 0
                              ? `address-suggestion-${activeAddressIndex}`
                              : undefined
                          }
                          required
                        />
                        <span
                          className={`address-status ${addressSelected ? "selected" : ""}`}
                          aria-live="polite"
                        >
                          {addressStatus === "loading" ? "…" : addressSelected ? "✓" : ""}
                        </span>
                        {addressOpen && addressSuggestions.length > 0 && (
                          <ul
                            className="address-suggestions"
                            id="address-suggestions"
                            role="listbox"
                            aria-label="Address suggestions"
                          >
                            {addressSuggestions.map((suggestion, index) => (
                              <li
                                className={activeAddressIndex === index ? "active" : ""}
                                id={`address-suggestion-${index}`}
                                key={suggestion.id}
                                role="option"
                                aria-selected={activeAddressIndex === index}
                                onPointerDown={(event) => event.preventDefault()}
                                onClick={() => selectAddress(suggestion)}
                              >
                                <strong>{suggestion.primary}</strong>
                                <span>{suggestion.secondary}</span>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                      {addressStatus === "ready" && addressSuggestions.length === 0 && (
                        <small className="address-feedback">No close match yet. Keep typing or enter it manually.</small>
                      )}
                      {addressStatus === "error" && (
                        <small className="address-feedback">Suggestions are unavailable. You can still enter the address manually.</small>
                      )}
                      <small className="address-source">
                        Address suggestions by{" "}
                        <a href="https://photon.komoot.io/" target="_blank" rel="noreferrer">Photon</a>
                        {" "}+{" "}
                        <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a>
                      </small>
                    </div>
                  </>
                )}

                {wizardStep === 3 && (
                  <>
                    <p className="wizard-kicker">Choose services</p>
                    <h3>What needs cleaning?</h3>
                    <fieldset>
                      <legend className="sr-only">Select areas to clean</legend>
                      <div className="choice-grid">
                        {activeQuoteOptions.map((option) => (
                          <label key={option} className={selectedServices.includes(option) ? "selected" : ""}>
                            <input
                              type="checkbox"
                              checked={selectedServices.includes(option)}
                              onChange={() => toggleQuoteService(option)}
                            />
                            <span>{option}</span>
                            <b aria-hidden="true">+</b>
                          </label>
                        ))}
                      </div>
                    </fieldset>
                  </>
                )}

                {wizardStep === 4 && (
                  <>
                    <p className="wizard-kicker">Contact details</p>
                    <h3>How should we reach you?</h3>
                    <div className="field-row">
                      <label className="form-field">
                        Your name
                        <input
                          value={name}
                          onChange={(event) => setName(event.target.value)}
                          placeholder="Who are we talking with?"
                          autoComplete="name"
                          autoFocus
                          required
                        />
                      </label>
                      <label className="form-field">
                        Email address
                        <input
                          type="email"
                          value={email}
                          onChange={(event) => setEmail(event.target.value)}
                          placeholder="you@example.com"
                          autoComplete="email"
                          required
                        />
                      </label>
                    </div>
                    <label className="form-field">
                      Phone number
                      <input
                        type="tel"
                        value={phone}
                        onChange={(event) => setPhone(event.target.value)}
                        placeholder="Best number for your quote"
                        autoComplete="tel"
                        required
                      />
                    </label>
                    <label className="form-field">
                      What are you seeing?
                      <textarea
                        value={notes}
                        onChange={(event) => setNotes(event.target.value)}
                        placeholder={
                          propertyType === "Commercial"
                            ? "Gum at the front walk, dark traffic lanes, north wall has green buildup…"
                            : "Dark driveway, green siding on the north wall, patio hasn’t been cleaned in a few seasons…"
                        }
                        rows={3}
                      />
                    </label>
                  </>
                )}
              </div>

              <div className="wizard-controls">
                {wizardStep > 1 ? (
                  <button
                    className="wizard-back"
                    onClick={() => setWizardStep((current) => Math.max(1, current - 1))}
                    type="button"
                  >
                    ← Back
                  </button>
                ) : (
                  <span />
                )}
                {wizardStep < totalWizardSteps ? (
                  <button className="button wizard-next" disabled={!canContinue} type="submit">
                    Continue <span aria-hidden="true">→</span>
                  </button>
                ) : (
                  <button className="button wizard-next" type="submit">
                    Make my project brief <span aria-hidden="true">↗</span>
                  </button>
                )}
              </div>
            </form>
          ) : (
            <div className="quote-result" aria-live="polite">
              <span className="result-kicker">Your DG project brief is ready</span>
              <h3>Clear details. Faster conversation.</h3>
              <pre>{quoteText}</pre>
              <div className="result-actions">
                <button className="button" onClick={copyQuote} type="button">
                  {copied ? "Copied to clipboard ✓" : "Copy project brief"}
                </button>
                <a
                  className="button button-outline"
                  href="https://www.instagram.com/dg_clean_exteriors/"
                  target="_blank"
                  rel="noreferrer"
                >
                  Open Instagram ↗
                </a>
              </div>
              <button
                className="start-over"
                onClick={() => {
                  setQuoteReady(false);
                  setWizardStep(4);
                }}
                type="button"
              >
                ← Change my details
              </button>
            </div>
          )}
        </div>
      </section>

      <section className="section faq-section" id="faq">
        <div className="section-heading split-heading">
          <div>
            <p className="eyebrow blue">Before the water starts</p>
            <h2>Good questions.</h2>
          </div>
          <p>
            Pressure washing looks simple from the curb. The difference is in
            knowing where force helps, where it hurts, and what a complete finish takes.
          </p>
        </div>

        <div className="faq-list">
          {faqs.map((faq, index) => (
            <details key={faq.question} open={index === 0}>
              <summary>
                <span>{String(index + 1).padStart(2, "0")}</span>
                {faq.question}
                <b aria-hidden="true">+</b>
              </summary>
              <p>{faq.answer}</p>
            </details>
          ))}
        </div>
      </section>

      <footer>
        <div className="footer-brand">
          <img src="/dg-clean-logo.png" alt="DG Clean Exteriors" />
          <div>
            <strong>Bringing curb appeal back.</strong>
            <span>Built on pressure. Guided by God.</span>
          </div>
        </div>
        <div className="footer-links">
          <a href="#clean">What we clean</a>
          <a href="#difference">The DG method</a>
          <a href="#quote">Build a quote</a>
          <a
            href="https://www.instagram.com/dg_clean_exteriors/"
            target="_blank"
            rel="noreferrer"
          >
            Instagram ↗
          </a>
        </div>
        <p>© {new Date().getFullYear()} DG Clean Exteriors</p>
      </footer>

      <a className="mobile-quote" href="#quote">
        Build my quote <span aria-hidden="true">↗</span>
      </a>
    </main>
  );
}
