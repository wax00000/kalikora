import express from 'express';
import { db, init, generateId } from './db.js';
import { directions } from '../map-utils.js';

const app = express();
init();
app.use(express.json());

// Create offer
app.post('/v1/offers/create', (req, res) => {
  const body = req.body;
  if (!body.driver_id || !body.origin_city || !body.destination_city) {
    return res.status(400).json({ error: 'missing fields' });
  }
  const id = generateId();
  const stmt = db.prepare(`insert into driver_offers (id, driver_id, origin_city, origin_lat, origin_lng, destination_city, destination_lat, destination_lng, departure_time, price_total, seats_total, seats_available, status) values (?,?,?,?,?,?,?,?,?,?,?,?, 'open')`);
  stmt.run(id, body.driver_id, body.origin_city, body.origin_lat, body.origin_lng, body.destination_city, body.destination_lat, body.destination_lng, body.departure_time, body.price_total, body.seats_total, body.seats_total);
  db.prepare(`insert into events(event_type, user_id, payload) values ('offer_created', ?, json(?))`).run(body.driver_id, JSON.stringify({ offer_id: id }));
  res.json({ id, status: 'open' });
});

// Search offers
app.get('/v1/offers/search', async (req, res) => {
  const { origin, dest, date } = req.query;
  if (!origin || !dest || !date) return res.status(400).json({ error: 'missing query params' });
  const rows = db.prepare(`select * from driver_offers where origin_city=? and destination_city=? and date(departure_time)=? and status='open'`).all(origin, dest, date);
  const token = process.env.MAPBOX_TOKEN;
  const results = [];
  for (const row of rows) {
    if (token) {
      try {
        const info = await directions([row.origin_lng, row.origin_lat], [row.destination_lng, row.destination_lat]);
        row.distance_km = info.distance_km;
        row.eta_minutes = info.eta_minutes;
      } catch (e) {
        row.distance_km = null;
        row.eta_minutes = null;
      }
    }
    results.push(row);
  }
  db.prepare(`insert into events(event_type, payload) values ('search_performed', json(?))`).run(JSON.stringify({ origin, dest, date }));
  res.json(results);
});

// Create rider request
app.post('/v1/requests/create', (req, res) => {
  const body = req.body;
  if (!body.user_id || !body.origin_city || !body.destination_city) return res.status(400).json({ error: 'missing fields' });
  const id = generateId();
  db.prepare(`insert into rider_requests (id, user_id, origin_city, origin_lat, origin_lng, destination_city, destination_lat, destination_lng, window_start, window_end, seats_needed, price_offer) values (?,?,?,?,?,?,?,?,?,?,?,?)`).run(id, body.user_id, body.origin_city, body.origin_lat, body.origin_lng, body.destination_city, body.destination_lat, body.destination_lng, body.window_start, body.window_end, body.seats_needed, body.price_offer);
  db.prepare(`insert into events(event_type, user_id, payload) values ('request_created', ?, json(?))`).run(body.user_id, JSON.stringify({ request_id: id }));
  res.json({ id, status: 'open' });
});

// Book seats
app.post('/v1/bookings/create', (req, res) => {
  const body = req.body;
  const offer = db.prepare(`select * from driver_offers where id=?`).get(body.offer_id);
  if (!offer) return res.status(400).json({ error: 'offer not found' });
  if (offer.seats_available < body.seats_reserved) return res.status(400).json({ error: 'not enough seats' });
  const bookingId = generateId();
  const tx = db.transaction(() => {
    db.prepare(`update driver_offers set seats_available=seats_available-? where id=?`).run(body.seats_reserved, body.offer_id);
    db.prepare(`insert into bookings (id, offer_id, user_id, seats_reserved, price_paid, status) values (?,?,?,?,?, 'confirmed')`).run(bookingId, body.offer_id, body.user_id, body.seats_reserved, body.price_paid);
    db.prepare(`insert into events(event_type, user_id, payload) values ('booking_confirmed', ?, json(?))`).run(body.user_id, JSON.stringify({ booking_id: bookingId, offer_id: body.offer_id }));
  });
  tx();
  res.json({ id: bookingId, status: 'confirmed' });
});

// Accept request
app.post('/v1/requests/:id/accept', (req, res) => {
  const id = req.params.id;
  const body = req.body; // should contain driver_id and departure_time
  const reqRow = db.prepare(`select * from rider_requests where id=?`).get(id);
  if (!reqRow) return res.status(400).json({ error: 'request not found' });
  const offerId = generateId();
  const tx = db.transaction(() => {
    db.prepare(`insert into driver_offers (id, driver_id, origin_city, origin_lat, origin_lng, destination_city, destination_lat, destination_lng, departure_time, price_total, seats_total, seats_available) values (?,?,?,?,?,?,?,?,?,?,?,?)`).run(offerId, body.driver_id, reqRow.origin_city, reqRow.origin_lat, reqRow.origin_lng, reqRow.destination_city, reqRow.destination_lat, reqRow.destination_lng, body.departure_time || reqRow.window_start, reqRow.price_offer || 0, reqRow.seats_needed, reqRow.seats_needed);
    db.prepare(`update rider_requests set status='matched' where id=?`).run(id);
    db.prepare(`insert into events(event_type, user_id, payload) values ('request_matched', ?, json(?))`).run(body.driver_id, JSON.stringify({ request_id: id, offer_id: offerId }));
  });
  tx();
  res.json({ offer_id: offerId, status: 'open' });
});

// Admin endpoints
app.get('/admin/offers', (req, res) => {
  const status = req.query.status || 'open';
  const rows = db.prepare(`select * from driver_offers where status=? order by created_at desc limit 20`).all(status);
  res.json(rows);
});

app.get('/admin/bookings', (req, res) => {
  const date = req.query.date || new Date().toISOString().slice(0,10);
  const rows = db.prepare(`select * from bookings where date(created_at)=? order by created_at desc limit 20`).all(date);
  res.json(rows);
});

// Serve admin.html
import path from 'path';
import { fileURLToPath } from 'url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
app.get('/', (req, res) => res.send('Mover API running'));
app.use('/admin', express.static(path.join(__dirname, '..')));

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server listening on ${port}`));
