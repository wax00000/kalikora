import Database from 'better-sqlite3';
import { randomUUID } from 'crypto';

export const db = new Database('mover.db');

export function init() {
  db.exec(`
    create table if not exists users (
      id text primary key,
      phone text unique,
      role text,
      created_at text default current_timestamp
    );
    create table if not exists drivers (
      id text primary key references users(id) on delete cascade,
      full_name text,
      vehicle_make text,
      vehicle_model text,
      vehicle_color text,
      seats_total integer default 4
    );
    create table if not exists driver_offers (
      id text primary key,
      driver_id text references drivers(id) on delete cascade,
      origin_city text,
      origin_lat real,
      origin_lng real,
      destination_city text,
      destination_lat real,
      destination_lng real,
      departure_time text,
      price_total real,
      seats_total integer,
      seats_available integer,
      status text default 'open',
      created_at text default current_timestamp
    );
    create table if not exists bookings (
      id text primary key,
      offer_id text references driver_offers(id) on delete cascade,
      user_id text references users(id) on delete cascade,
      seats_reserved integer,
      price_paid real,
      status text default 'pending',
      created_at text default current_timestamp
    );
    create table if not exists rider_requests (
      id text primary key,
      user_id text references users(id) on delete cascade,
      origin_city text,
      origin_lat real,
      origin_lng real,
      destination_city text,
      destination_lat real,
      destination_lng real,
      window_start text,
      window_end text,
      seats_needed integer,
      price_offer real,
      status text default 'open',
      created_at text default current_timestamp
    );
    create table if not exists events (
      id integer primary key autoincrement,
      event_type text not null,
      user_id text,
      payload text,
      created_at text default current_timestamp
    );
  `);
  // Seed demo users and driver
  db.prepare(`insert or ignore into users(id, phone, role) values ('d1','0000000000','driver')`).run();
  db.prepare(`insert or ignore into drivers(id, full_name) values ('d1','Demo Driver')`).run();
  db.prepare(`insert or ignore into users(id, phone, role) values ('u1','1111111111','rider')`).run();
}

export function generateId() {
  return randomUUID();
}
