import { useEffect, useId, useRef, useState } from "react";
import type { FormEvent } from "react";
import { inquiryEmail, inquiryEndpoint, replyWindow } from "./config";
import {
  addons,
  budgets,
  customOffer,
  isWebsite,
  money,
  priceHeadline,
  priceSpoken,
  quoteSelection,
  timelines,
  websites,
  type Offer,
  type PackageId,
} from "./data";

type Status = "editing" | "sending" | "success";
type Delivery = "mailto" | "endpoint";

type FormValues = {
  selected: PackageId[];
  name: string;
  email: string;
  phone: string;
  business: string;
  website: string;
  sells: string;
  outcome: string;
  budget: string;
  timeline: string;
  notes: string;
  fax: string;
};

type InquiryPayload = Omit<FormValues, "fax">;

const empty = (packageId: PackageId, note: string): FormValues => ({
  selected: [packageId],
  name: "",
  email: "",
  phone: "",
  business: "",
  website: "",
  sells: "",
  outcome: "",
  budget: "",
  timeline: "",
  notes: note,
  fax: "",
});

function validate(values: FormValues) {
  const errors: Record<string, string> = {};
  if (!values.name.trim()) errors.name = "Add your name.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) {
    errors.email = "Add an email we can reply to.";
  }
  if (values.phone.replace(/\D/g, "").length < 7) {
    errors.phone = "Add a phone number we can call.";
  }
  if (!values.business.trim()) errors.business = "Add the business name.";
  if (values.website.trim() && !values.website.trim().includes(".")) {
    errors.website = "Add a full website, or leave this blank.";
  }
  if (!values.sells.trim()) errors.sells = "Tell us what you sell or offer.";
  if (values.selected.length === 0) errors.selected = "Choose at least one option.";
  if (values.selected.includes("custom")) {
    if (!values.outcome.trim()) errors.outcome = "Tell us the outcome you want.";
    if (!values.budget) errors.budget = "Choose a budget range.";
    if (!values.timeline) errors.timeline = "Choose a timeline.";
  }
  return errors;
}

function payloadOf(values: FormValues): InquiryPayload {
  const quote = quoteSelection(values.selected);
  return {
    selected: quote.items.map((item) => item.id),
    name: values.name.trim(),
    email: values.email.trim(),
    phone: values.phone.trim(),
    business: values.business.trim(),
    website: values.website.trim(),
    sells: values.sells.trim(),
    outcome: values.outcome.trim(),
    budget: values.budget,
    timeline: values.timeline,
    notes: values.notes.trim(),
  };
}

function inquiryText(payload: InquiryPayload) {
  const quote = quoteSelection(payload.selected);
  const itemLines = quote.items.map((item) => `- ${item.name} (${priceSpoken(item)})`);
  const totalLines = [
    quote.once > 0 ? `To start: ${money(quote.once)}` : "",
    quote.monthly > 0 ? `Each month: ${money(quote.monthly)}` : "",
    quote.custom ? `${customOffer.name}: quoted after this inquiry` : "",
    "Payment: invoice. Nothing was charged on the site.",
  ];
  const lines = [
    "Selected:",
    ...itemLines,
    ...totalLines,
    `Name: ${payload.name}`,
    `Email: ${payload.email}`,
    `Phone: ${payload.phone}`,
    `Business: ${payload.business}`,
    payload.website ? `Website: ${payload.website}` : "",
    `What they offer: ${payload.sells}`,
    payload.outcome ? `Outcome: ${payload.outcome}` : "",
    payload.budget ? `Budget: ${payload.budget}` : "",
    payload.timeline ? `Timeline: ${payload.timeline}` : "",
    payload.notes ? `Notes: ${payload.notes}` : "",
  ];
  return lines.filter(Boolean).join("\n");
}

function inquirySubject(payload: InquiryPayload) {
  const quote = quoteSelection(payload.selected);
  const names = quote.items.map((item) => item.short).join(", ") || "Inquiry";
  return `KONVRT inquiry: ${names} — ${payload.business}`;
}

function mailtoUrl(payload: InquiryPayload) {
  const subject = inquirySubject(payload);
  return `mailto:${inquiryEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(inquiryText(payload))}`;
}

function formspreeBody(payload: InquiryPayload) {
  const fields: Record<string, string> = {
    name: payload.name,
    email: payload.email,
    _replyto: payload.email,
    _subject: inquirySubject(payload),
    phone: payload.phone,
    business: payload.business,
    website: payload.website,
    sells: payload.sells,
    message: inquiryText(payload),
  };
  return Object.fromEntries(Object.entries(fields).filter(([, value]) => value.trim()));
}

export function InquiryDialog({
  open,
  packageId,
  note,
  requestKey,
  onClose,
}: {
  open: boolean;
  packageId: PackageId;
  note: string;
  requestKey: number;
  onClose: () => void;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const [values, setValues] = useState(() => empty(packageId, note));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [attempted, setAttempted] = useState(false);
  const [status, setStatus] = useState<Status>("editing");
  const [delivery, setDelivery] = useState<Delivery>("mailto");
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState<InquiryPayload | null>(null);
  const [seenKey, setSeenKey] = useState(requestKey);

  if (seenKey !== requestKey) {
    setSeenKey(requestKey);
    setValues(empty(packageId, note));
    setErrors({});
    setAttempted(false);
    setStatus("editing");
    setCopied(false);
    setSaved(null);
  }

  useEffect(() => {
    const el = dialogRef.current;
    if (!el) return;
    if (open && !el.open) el.showModal();
    if (!open && el.open) el.close();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const focusTimer = window.setTimeout(() => {
      document.getElementById("inq-name")?.focus({ preventScroll: true });
    }, 30);
    return () => window.clearTimeout(focusTimer);
  }, [requestKey, open]);

  useEffect(() => {
    document.body.classList.toggle("inquiry-open", open);
    return () => document.body.classList.remove("inquiry-open");
  }, [open]);

  function set<K extends keyof FormValues>(key: K, value: FormValues[K]) {
    setValues((current) => ({ ...current, [key]: value }));
    setErrors((current) => {
      if (!current[key]) return current;
      const next = { ...current };
      delete next[key];
      return next;
    });
  }

  function toggleOption(id: PackageId) {
    setValues((current) => {
      const on = current.selected.includes(id);
      let selected = on
        ? current.selected.filter((item) => item !== id)
        : [...current.selected, id];
      if (!on && isWebsite(id)) {
        selected = selected.filter((item) => item === id || !isWebsite(item));
      }
      return { ...current, selected };
    });
    setErrors((current) => {
      if (!current.selected) return current;
      const next = { ...current };
      delete next.selected;
      return next;
    });
  }

  function openMail(payload: InquiryPayload) {
    window.location.href = mailtoUrl(payload);
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    const nextErrors = validate(values);
    setErrors(nextErrors);
    setAttempted(true);
    if (Object.keys(nextErrors).length > 0) {
      const first = Object.keys(nextErrors)[0];
      document.getElementById(`inq-${first}`)?.focus();
      return;
    }
    const payload = payloadOf(values);
    if (values.fax.trim()) {
      setSaved(payload);
      setDelivery("endpoint");
      setStatus("success");
      return;
    }
    setStatus("sending");
    if (inquiryEndpoint) {
      try {
        const response = await fetch(inquiryEndpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify(formspreeBody(payload)),
        });
        if (!response.ok) throw new Error(String(response.status));
        setSaved(payload);
        setDelivery("endpoint");
        setStatus("success");
        return;
      } catch {
        setSaved(payload);
        setDelivery("mailto");
        openMail(payload);
        setStatus("success");
        return;
      }
    }
    setSaved(payload);
    setDelivery("mailto");
    openMail(payload);
    setStatus("success");
  }

  async function copyInquiry() {
    if (!saved) return;
    const text = `To: ${inquiryEmail}\n\n${inquiryText(saved)}`;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }

  const quote = quoteSelection(values.selected);
  const custom = values.selected.includes("custom");
  const errorCount = Object.keys(errors).length;
  const careAndCreative = [...addons, customOffer];
  const heading =
    quote.items.length === 0
      ? "Choose what you want"
      : quote.items.length === 1
        ? custom
          ? `Inquire about a ${customOffer.name.toLowerCase()}`
          : `Request ${quote.items[0].name}`
        : `Request ${quote.items.length} options`;

  return (
    <dialog
      ref={dialogRef}
      className="inquiry"
      aria-labelledby={titleId}
      onClose={onClose}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="inquiry-sheet">
        <div className="inquiry-top">
          <p className="kicker">
            <span className="kicker-dot" aria-hidden="true" />
            Inquiry
          </p>
          <button type="button" className="text-btn" onClick={onClose}>
            Close
          </button>
        </div>

        {status === "success" && saved ? (
          <div className="success">
            <h2 id={titleId}>
              {delivery === "endpoint" ? "Inquiry received." : "Send it from your email."}
            </h2>
            <p>
              {delivery === "endpoint"
                ? `We have it. A reply goes to ${saved.email} within ${replyWindow}.`
                : `Your email app should be open with this inquiry addressed to ${inquiryEmail}. Send that message and we reply within ${replyWindow}.`}
            </p>
            <pre className="inquiry-copy">{inquiryText(saved)}</pre>
            <div className="success-actions">
              {delivery === "mailto" && (
                <button type="button" className="btn btn-primary" onClick={() => openMail(saved)}>
                  Open the email again
                </button>
              )}
              <button type="button" className="btn btn-ghost" onClick={copyInquiry}>
                {copied ? "Copied" : "Copy the inquiry"}
              </button>
            </div>
          </div>
        ) : (
          <form className="inquiry-form" onSubmit={onSubmit} noValidate>
            <div className="inquiry-scroll">
            <h2 id={titleId}>{heading}</h2>
            <p className="lede">
              {`Pick one website, then add care, creative, or a shoot. The total adds up as you go. We reply within ${replyWindow} with an invoice. This form does not charge a card.`}
            </p>

            <fieldset className="pills" id="inq-selected" aria-describedby={errors.selected ? "inq-selected-error" : undefined}>
              <legend>One website</legend>
              <div className="pill-row three">
                {websites.map((item) => (
                  <Pill
                    key={item.id}
                    item={item}
                    checked={values.selected.includes(item.id)}
                    onChange={() => toggleOption(item.id)}
                  />
                ))}
              </div>
            </fieldset>

            <fieldset className="pills">
              <legend>Add any of these</legend>
              <div className="pill-row">
                {careAndCreative.map((item) => (
                  <Pill
                    key={item.id}
                    item={item}
                    checked={values.selected.includes(item.id)}
                    onChange={() => toggleOption(item.id)}
                  />
                ))}
              </div>
              {errors.selected && (
                <small id="inq-selected-error" className="field-error">
                  {errors.selected}
                </small>
              )}
            </fieldset>

            {attempted && errorCount > 0 && (
              <p className="form-alert" role="alert">
                Check the highlighted fields.
              </p>
            )}

            <div className="form-grid">
              <Field
                id="inq-name"
                label="Your name"
                value={values.name}
                error={errors.name}
                autoComplete="name"
                onChange={(value) => set("name", value)}
              />
              <Field
                id="inq-email"
                label="Email"
                type="email"
                value={values.email}
                error={errors.email}
                autoComplete="email"
                onChange={(value) => set("email", value)}
              />
              <Field
                id="inq-business"
                label="Business"
                value={values.business}
                error={errors.business}
                autoComplete="organization"
                onChange={(value) => set("business", value)}
              />
              <Field
                id="inq-phone"
                label="Phone"
                type="tel"
                value={values.phone}
                error={errors.phone}
                autoComplete="tel"
                onChange={(value) => set("phone", value)}
              />
              <Field
                id="inq-website"
                className="span-2"
                label="Website (optional)"
                value={values.website}
                error={errors.website}
                autoComplete="url"
                onChange={(value) => set("website", value)}
              />
              <Field
                id="inq-sells"
                className="span-2"
                label="What do you sell or offer?"
                value={values.sells}
                error={errors.sells}
                onChange={(value) => set("sells", value)}
              />
              {custom && (
                <Field
                  id="inq-outcome"
                  className="span-2"
                  label="Outcome you want"
                  value={values.outcome}
                  error={errors.outcome}
                  onChange={(value) => set("outcome", value)}
                />
              )}
              {custom && (
                <SelectField
                  id="inq-budget"
                  label="Budget for the work"
                  value={values.budget}
                  error={errors.budget}
                  placeholder="Choose a range"
                  options={budgets}
                  onChange={(value) => set("budget", value)}
                />
              )}
              <SelectField
                id="inq-timeline"
                className={custom ? undefined : "span-2"}
                label={custom ? "When should it start?" : "When should it start? (optional)"}
                value={values.timeline}
                error={errors.timeline}
                placeholder="Choose a time"
                options={timelines}
                onChange={(value) => set("timeline", value)}
              />
              <label className="field span-2">
                <span>
                  {custom
                    ? "What should the project cover? (optional)"
                    : "Anything we should know? (optional)"}
                </span>
                <textarea
                  id="inq-notes"
                  value={values.notes}
                  onChange={(event) => set("notes", event.target.value)}
                  rows={4}
                />
              </label>
            </div>

            <input
              className="hp"
              tabIndex={-1}
              autoComplete="off"
              aria-hidden="true"
              value={values.fax}
              onChange={(event) => set("fax", event.target.value)}
            />
            </div>

            <div className="form-submit">
              <QuoteBar quote={quote} />
              <button className="btn btn-primary btn-block" type="submit" disabled={status === "sending"}>
                {status === "sending" ? "Sending…" : "Send the inquiry"}
              </button>
              <p className="fine">
                {inquiryEndpoint
                  ? `We reply within ${replyWindow} and invoice the total. Nothing is charged on this form.`
                  : `This opens an email to ${inquiryEmail} with the options and the total. You send it from your own inbox. We invoice you. Nothing is charged now.`}
              </p>
            </div>
          </form>
        )}
      </div>
    </dialog>
  );
}

function QuoteBar({ quote }: { quote: ReturnType<typeof quoteSelection> }) {
  const picks = quote.items.map((item) => item.short).join(" · ");
  return (
    <div className="quote-bar" aria-live="polite">
      <p className="quote-picks">{picks || "Nothing selected yet"}</p>
      {quote.once > 0 && (
        <p>
          <span>To start</span>
          <strong>{money(quote.once)}</strong>
        </p>
      )}
      {quote.monthly > 0 && (
        <p>
          <span>Each month</span>
          <strong>{money(quote.monthly)}</strong>
        </p>
      )}
      {quote.custom && (
        <p>
          <span>{customOffer.name}</span>
          <strong>Quoted</strong>
        </p>
      )}
    </div>
  );
}

function Pill({
  item,
  checked,
  onChange,
}: {
  item: Offer;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <label className="pill">
      <input type="checkbox" value={item.id} checked={checked} onChange={onChange} />
      <span className="pill-name">{item.short}</span>
      <span className="pill-price">{priceHeadline(item)}</span>
    </label>
  );
}

function Field({
  id,
  label,
  value,
  error,
  onChange,
  type = "text",
  autoComplete,
  className,
}: {
  id: string;
  label: string;
  value: string;
  error?: string;
  onChange: (value: string) => void;
  type?: string;
  autoComplete?: string;
  className?: string;
}) {
  const errorId = `${id}-error`;
  return (
    <label className={className ? `field ${className}` : "field"}>
      <span>{label}</span>
      <input
        id={id}
        type={type}
        value={value}
        autoComplete={autoComplete}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        onChange={(event) => onChange(event.target.value)}
      />
      {error && (
        <small id={errorId} className="field-error">
          {error}
        </small>
      )}
    </label>
  );
}

function SelectField({
  id,
  label,
  value,
  error,
  placeholder,
  options,
  onChange,
  className,
}: {
  id: string;
  label: string;
  value: string;
  error?: string;
  placeholder: string;
  options: string[];
  onChange: (value: string) => void;
  className?: string;
}) {
  const errorId = `${id}-error`;
  return (
    <label className={className ? `field ${className}` : "field"}>
      <span>{label}</span>
      <select
        id={id}
        value={value}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        onChange={(event) => onChange(event.target.value)}
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
      {error && (
        <small id={errorId} className="field-error">
          {error}
        </small>
      )}
    </label>
  );
}
