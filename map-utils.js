const token = process.env.MAPBOX_TOKEN;
export async function geocodeCity(city){const res=await fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(city)}.json?access_token=${token}`);const data=await res.json();return data.features[0];}
export async function directions(from,to){const url=`https://api.mapbox.com/directions/v5/mapbox/driving/${from[0]},${from[1]};${to[0]},${to[1]}?geometries=polyline&access_token=${token}`;const res=await fetch(url);const data=await res.json();const r=data.routes[0];return {distance_km:r.distance/1000,eta_minutes:r.duration/60,polyline:r.geometry};}
export function sanityDistance(km){if(km<=0||km>300) throw new Error('distance out of range');return true;}
