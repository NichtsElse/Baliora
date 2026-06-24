/**
 * Purpose: Collects booking inquiries and stores them locally for demo use on a laptop.
 * Used by: VillaDetail booking sidebar.
 * Main dependencies: localClient booking inquiry entity and UI inputs.
 * Public functions: BookingInquiryForm default export.
 * Side effects: writes booking inquiry records to localStorage and calls the shared lead email endpoint.
 */
import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { localClient } from '@/api/localClient';
import { sendLeadNotification } from '@/lib/sendLeadNotification';
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { CheckCircle, ArrowRight, CalendarDays, Loader2 } from 'lucide-react';

export default function BookingInquiryForm({ villa, compact = false }) {
  const checkInRef = useRef(null);
  const checkOutRef = useRef(null);
  const [form, setForm] = useState({
    guest_name: '',
    email: '',
    whatsapp: '',
    check_in: '',
    check_out: '',
    guests: '',
    special_requests: '',
  });
  const [honeypot, setHoneypot] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submissionNote, setSubmissionNote] = useState('');

  const nights = form.check_in && form.check_out
    ? Math.max(0, Math.round((new Date(form.check_out) - new Date(form.check_in)) / 86400000))
    : 0;

  const totalPrice = nights && villa?.price_per_night ? nights * villa.price_per_night : null;

  const handle = (field, val) => setForm((previous) => ({ ...previous, [field]: val }));
  const openDatePicker = (ref) => {
    const input = ref.current;
    if (!input) return;
    if (typeof input.showPicker === 'function') {
      input.showPicker();
      return;
    }
    input.focus();
    input.click();
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (honeypot) return;
    setSubmitting(true);
    try {
      setSubmissionNote('');
      await localClient.entities.BookingInquiry.create({
        ...form,
        villa_id: villa?.id || '',
        villa_name: villa?.name || '',
        guests: form.guests ? parseInt(form.guests, 10) : undefined,
      });

      setSubmitted(true);
      sendLeadNotification({
        type: 'booking',
        villa_name: villa?.name || '',
        guest_name: form.guest_name,
        email: form.email,
        whatsapp: form.whatsapp,
        check_in: form.check_in,
        check_out: form.check_out,
        guests: form.guests,
        special_requests: form.special_requests,
      })
        .then((emailResult) => {
          if (!emailResult.ok) {
            setSubmissionNote(
              emailResult.message ||
                'Your booking inquiry was saved, but email delivery still needs to be configured.'
            );
          }
        })
        .catch(() => {
          setSubmissionNote(
            'Your booking inquiry was saved, but email delivery still needs to be configured.'
          );
        });
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        className="py-8 text-center"
      >
        <CheckCircle size={40} className="mx-auto mb-4 text-primary" />
        <h3 className="font-display text-2xl text-foreground">Inquiry Received</h3>
        <p className="mt-3 font-body text-sm leading-relaxed text-muted-foreground">
          Thank you! Our team will reach out within 24 hours to confirm your booking.
        </p>
        {submissionNote && (
          <p className="mt-4 font-body text-sm leading-relaxed text-muted-foreground">
            {submissionNote}
          </p>
        )}
      </motion.div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input
        type="text"
        name="website"
        value={honeypot}
        onChange={(event) => setHoneypot(event.target.value)}
        className="hidden"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
      />

      {villa?.price_per_night && (
        <div className={compact ? '' : 'mb-2 rounded-3xl bg-secondary/60 p-4'}>
          <p className="font-display text-2xl text-foreground">
            From ${villa.price_per_night.toLocaleString()}
            <span className="font-body text-sm font-normal text-muted-foreground"> / night</span>
          </p>
          {totalPrice && (
            <p className="mt-1 font-body text-sm text-primary">
              {nights} nights - Total estimate: ${totalPrice.toLocaleString()}
            </p>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 min-[420px]:grid-cols-2">
        <div>
          <Label className="mb-1.5 block font-body text-xs text-muted-foreground">Check-in</Label>
          <div
            className="relative cursor-pointer"
            onClick={() => openDatePicker(checkInRef)}
            role="button"
            tabIndex={-1}
          >
            <CalendarDays size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              ref={checkInRef}
              type="date"
              value={form.check_in}
              min={new Date().toISOString().split('T')[0]}
              onChange={(event) => handle('check_in', event.target.value)}
              className="h-11 min-w-0 cursor-pointer appearance-none border-border bg-transparent pl-10 pr-4 font-body text-[15px] tabular-nums [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-0"
            />
          </div>
        </div>
        <div>
          <Label className="mb-1.5 block font-body text-xs text-muted-foreground">Check-out</Label>
          <div
            className="relative cursor-pointer"
            onClick={() => openDatePicker(checkOutRef)}
            role="button"
            tabIndex={-1}
          >
            <CalendarDays size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              ref={checkOutRef}
              type="date"
              value={form.check_out}
              min={form.check_in || new Date().toISOString().split('T')[0]}
              onChange={(event) => handle('check_out', event.target.value)}
              className="h-11 min-w-0 cursor-pointer appearance-none border-border bg-transparent pl-10 pr-4 font-body text-[15px] tabular-nums [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-0"
            />
          </div>
        </div>
      </div>

      <div>
        <Label className="mb-1.5 block font-body text-xs text-muted-foreground">Number of Guests *</Label>
        <Input
          type="number"
          min="1"
          max={villa?.max_guests}
          required
          value={form.guests}
          onChange={(event) => handle('guests', event.target.value)}
          placeholder={`Max ${villa?.max_guests || 10} guests`}
          className="border-border bg-transparent font-body text-sm"
        />
      </div>

      <div>
        <Label className="mb-1.5 block font-body text-xs text-muted-foreground">Full Name *</Label>
        <Input
          required
          value={form.guest_name}
          onChange={(event) => handle('guest_name', event.target.value)}
          placeholder="Your name"
          className="border-border bg-transparent font-body text-sm"
        />
      </div>

      <div>
        <Label className="mb-1.5 block font-body text-xs text-muted-foreground">Email *</Label>
        <Input
          required
          type="email"
          value={form.email}
          onChange={(event) => handle('email', event.target.value)}
          placeholder="your@email.com"
          className="border-border bg-transparent font-body text-sm"
        />
      </div>

      <div>
        <Label className="mb-1.5 block font-body text-xs text-muted-foreground">WhatsApp</Label>
        <Input
          value={form.whatsapp}
          onChange={(event) => handle('whatsapp', event.target.value)}
          placeholder="+62 xxx xxxx xxxx"
          className="border-border bg-transparent font-body text-sm"
        />
      </div>

      <div>
        <Label className="mb-1.5 block font-body text-xs text-muted-foreground">Special Requests</Label>
        <Textarea
          value={form.special_requests}
          onChange={(event) => handle('special_requests', event.target.value)}
          placeholder="Early check-in, airport transfer, honeymoon setup..."
          className="min-h-[80px] border-border bg-transparent font-body text-sm"
        />
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="flex w-full items-center justify-center gap-2 rounded-full bg-primary py-3.5 font-body text-sm tracking-wide text-primary-foreground transition-all duration-400 disabled:opacity-50 hover:bg-primary/90"
      >
        {submitting ? <Loader2 size={16} className="animate-spin" /> : <ArrowRight size={16} />}
        {submitting ? 'Sending...' : 'Request Booking'}
      </button>

      <p className="text-center font-body text-xs text-muted-foreground">
        Free cancellation - No payment required at this stage
      </p>
    </form>
  );
}
