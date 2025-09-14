#!/bin/sh
# cURL examples for local API
BASE_URL="http://localhost:3000"

echo "Create Offer"
OFFER_ID=$(curl -s -X POST "$BASE_URL/v1/offers/create" -H "Content-Type: application/json" -d '{"driver_id":"d1","origin_city":"Kenitra","origin_lat":34.259,"origin_lng":-6.573,"destination_city":"Rabat","destination_lat":34.02,"destination_lng":-6.841,"departure_time":"2024-01-01T08:00:00Z","price_total":100,"seats_total":4}' | jq -r '.id')
echo "Offer id: $OFFER_ID"

echo "Search Offers"
curl -s "$BASE_URL/v1/offers/search?origin=Kenitra&dest=Rabat&date=2024-01-01"

echo "Create Request"
REQ_ID=$(curl -s -X POST "$BASE_URL/v1/requests/create" -H "Content-Type: application/json" -d '{"user_id":"u1","origin_city":"Kenitra","origin_lat":34.259,"origin_lng":-6.573,"destination_city":"Rabat","destination_lat":34.02,"destination_lng":-6.841,"window_start":"2024-01-01T07:30:00Z","window_end":"2024-01-01T08:30:00Z","seats_needed":1,"price_offer":25}' | jq -r '.id')
echo "Request id: $REQ_ID"

echo "Book Seats"
curl -s -X POST "$BASE_URL/v1/bookings/create" -H "Content-Type: application/json" -d '{"offer_id":"'$OFFER_ID'","user_id":"u1","seats_reserved":1,"price_paid":25}'

echo "Accept Request"
curl -s -X POST "$BASE_URL/v1/requests/$REQ_ID/accept" -H "Content-Type: application/json" -d '{"driver_id":"d1"}'
