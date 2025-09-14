-- Log events example
-- insert into events(event_type,user_id,payload) values('offer_created','00000000-0000-0000-0000-000000000000',jsonb_build_object('offer_id','123'));

-- Supply KPIs
create or replace view kpi_supply as
select date_trunc('day',created_at) as day,
       count(*) filter (where event_type='offer_created') as offers,
       count(*) filter (where event_type='offer_filled') as offers_filled
from events
where created_at > now() - interval '90 days'
group by day;

-- Demand KPIs
create or replace view kpi_demand as
select date_trunc('day',created_at) as day,
       count(distinct user_id) filter (where event_type='search_performed') as mau,
       count(*) filter (where event_type='search_performed') as searches,
       count(*) filter (where event_type='request_created') as requests
from events
where created_at > now() - interval '90 days'
group by day;

-- Liquidity KPIs
create or replace view kpi_liquidity as
select date_trunc('day',created_at) as day,
       count(*) filter (where event_type='booking_confirmed')::float / nullif(count(*) filter (where event_type='request_created'),0) as match_rate
from events
where created_at > now() - interval '90 days'
group by day;

-- Business KPIs
create or replace view kpi_business as
select date_trunc('day',created_at) as day,
       sum((payload->>'amount')::numeric) filter (where event_type='payment_recorded') as gmv,
       avg((payload->>'take_rate')::numeric) filter (where event_type='payment_recorded') as take_rate
from events
where created_at > now() - interval '90 days'
group by day;
