import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function App() {
  const [origin, setOrigin] = useState('');
  const [dest, setDest] = useState('');
  const [date, setDate] = useState('');
  const [offers, setOffers] = useState([]);

  async function search() {
    if (!origin || !dest || !date) return;
    const q = new URLSearchParams({ origin, dest, date }).toString();
    const res = await fetch(`/v1/offers/search?${q}`);
    const data = await res.json();
    setOffers(data);
  }

  return (
    <>
      <header className="header">Mover</header>
      <div className="container">
        <div className="form">
          <input placeholder="Origin" value={origin} onChange={e => setOrigin(e.target.value)} />
          <input placeholder="Destination" value={dest} onChange={e => setDest(e.target.value)} />
          <input type="date" value={date} onChange={e => setDate(e.target.value)} />
          <button onClick={search}>Search</button>
        </div>
        <AnimatePresence>
          {offers.map(o => (
            <motion.div
              key={o.id}
              className="offer-card"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              <strong>{o.origin_city} → {o.destination_city}</strong>
              <div>Departure: {new Date(o.departure_time).toLocaleString()}</div>
              <div>Seats: {o.seats_available}/{o.seats_total}</div>
              {o.distance_km && (
                <div>{o.distance_km.toFixed(1)} km, {o.eta_minutes.toFixed(0)} min</div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
        {offers.length === 0 && (
          <div className="no-results">No offers yet. Try another search.</div>
        )}
      </div>
    </>
  );
}
