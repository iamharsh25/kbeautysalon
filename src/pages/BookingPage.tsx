import { useState, type ReactNode } from 'react';
import { ArrowRight, CalendarDays, CheckCircle2, ChevronLeft, ChevronRight, Clock, Scissors, Sparkles, UserCheck } from 'lucide-react';
import { bookingServices, bookingTimes } from '../data/initialData';
import type { SiteSettings } from '../types';
import { formatCurrency } from '../utils/format';

export function BookingPage({ onBack, settings }: { onBack: () => void; settings: SiteSettings }) {
  const [selectedServiceIndex, setSelectedServiceIndex] = useState(0);
  const [selectedDate, setSelectedDate] = useState(20);
  const [selectedTime, setSelectedTime] = useState('10:00 AM');
  const selectedService = bookingServices[selectedServiceIndex];
  const gstAmount = Math.round((selectedService.price * settings.gstPercent) / 100);
  const totalAmount = selectedService.price + gstAmount;
  const calendarDays = [
    { day: 26, muted: true },
    { day: 27, muted: true },
    { day: 28, muted: true },
    { day: 29, muted: true },
    { day: 30, muted: true },
    ...Array.from({ length: 31 }, (_, index) => ({ day: index + 1, muted: false })),
  ];

  return (
    <main className="booking-page">
      <nav className="booking-nav" aria-label="Booking page navigation">
        <button className="booking-brand" type="button" onClick={onBack}>
          <img className="brand-logo" src={settings.logoUrl} alt="" />
          <span>K Beauty Salon</span>
        </button>
        <div>
          <button type="button" onClick={onBack}>Home</button>
          <button type="button">Services</button>
          <button type="button">Gallery</button>
          <button type="button">Contact</button>
        </div>
        <a href="tel:+61400000000">04XX XXX XXX</a>
      </nav>

      <section className="booking-title">
        <p><Sparkles size={15} /> Book Appointment</p>
        <h1>Book Your Perfect Time</h1>
        <span>Choose your service, pick a date, and select a time that works best for you.</span>
      </section>

      <section className="booking-workspace">
        <article className="booking-column">
          <BookingColumnTitle icon={<Scissors size={22} />} title="Select Service" text="Choose your desired service" />
          <div className="booking-service-list">
            {bookingServices.map((service, index) => (
              <button
                className={selectedServiceIndex === index ? 'booking-service-card selected' : 'booking-service-card'}
                key={service.title}
                type="button"
                onClick={() => setSelectedServiceIndex(index)}
              >
                <img src={service.image} alt="" />
                <span>
                  <strong>{service.title}</strong>
                  <small>{service.duration}</small>
                </span>
                <b>{formatCurrency(service.price, settings.currencyCode)}</b>
                {selectedServiceIndex === index ? <CheckCircle2 size={22} /> : null}
              </button>
            ))}
          </div>
        </article>

        <article className="booking-column">
          <BookingColumnTitle icon={<CalendarDays size={22} />} title="Select Date" text="Pick a date that works for you" />
          <div className="booking-calendar">
            <div className="booking-calendar-header">
              <button type="button" aria-label="Previous month"><ChevronLeft size={18} /></button>
              <strong>May 2026</strong>
              <button type="button" aria-label="Next month"><ChevronRight size={18} /></button>
            </div>
            <div className="booking-weekdays">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => <span key={day}>{day}</span>)}
            </div>
            <div className="booking-days">
              {calendarDays.map((date, index) => (
                <button
                  className={`${date.muted ? 'muted' : ''} ${selectedDate === date.day && !date.muted ? 'selected' : ''}`}
                  key={`${date.day}-${index}`}
                  type="button"
                  onClick={() => !date.muted && setSelectedDate(date.day)}
                >
                  {date.day}
                </button>
              ))}
            </div>
          </div>
          <div className="selected-date-card">
            <Sparkles size={22} />
            <span>
              <strong>May {selectedDate}, 2026</strong>
              <small>Wednesday</small>
            </span>
          </div>
        </article>

        <article className="booking-column">
          <BookingColumnTitle icon={<Clock size={22} />} title="Select Time" text="Choose an available time slot" />
          <div className="booking-time-heading">
            <span>Available times for</span>
            <strong>May {selectedDate}, 2026</strong>
          </div>
          <div className="booking-time-grid">
            {bookingTimes.map((time) => (
              <button
                className={selectedTime === time ? 'selected' : ''}
                key={time}
                type="button"
                onClick={() => setSelectedTime(time)}
              >
                {time}
              </button>
            ))}
          </div>
          <div className="booking-summary">
            <h2>Booking Summary</h2>
            <div className="booking-summary-service">
              <img src={selectedService.image} alt="" />
              <span>
                <strong>{selectedService.title}</strong>
                <small>{selectedService.duration}</small>
              </span>
              <b>{formatCurrency(selectedService.price, settings.currencyCode)}</b>
            </div>
            <dl>
              <div><dt>Date</dt><dd>May {selectedDate}, 2026</dd></div>
              <div><dt>Time</dt><dd>{selectedTime}</dd></div>
              <div><dt>Subtotal</dt><dd>{formatCurrency(selectedService.price, settings.currencyCode)}</dd></div>
              <div><dt>GST ({settings.gstPercent}%)</dt><dd>{formatCurrency(gstAmount, settings.currencyCode)}</dd></div>
              <div><dt>Total</dt><dd>{formatCurrency(totalAmount, settings.currencyCode)}</dd></div>
            </dl>
            <button className="confirm-booking-button" type="button">
              Confirm Booking
              <ArrowRight size={18} />
            </button>
          </div>
        </article>
      </section>

      <section className="booking-benefits">
        <span><CheckCircle2 size={22} /> Easy Booking <small>Book in just a few clicks</small></span>
        <span><CalendarDays size={22} /> 24/7 Availability <small>Book anytime, anywhere</small></span>
        <span><UserCheck size={22} /> Expert Stylists <small>Get styled by professionals</small></span>
      </section>
    </main>
  );
}

export function BookingColumnTitle({ icon, text, title }: { icon: ReactNode; text: string; title: string }) {
  return (
    <div className="booking-column-title">
      <span>{icon}</span>
      <div>
        <h2>{title}</h2>
        <p>{text}</p>
      </div>
    </div>
  );
}
