export const SPOTS = [
  // Hawaii
  { id: 'pipeline',         name: 'Pipeline',           region: 'Hawaii',        lat: 21.6637,  lng: -158.0515, noaaStation: '1612340' }, // Honolulu
  { id: 'sunset-beach',     name: 'Sunset Beach',       region: 'Hawaii',        lat: 21.6783,  lng: -158.0403, noaaStation: '1612340' }, // Honolulu
  { id: 'waimea-bay',       name: 'Waimea Bay',         region: 'Hawaii',        lat: 21.6430,  lng: -158.0660, noaaStation: '1612340' }, // Honolulu
  // West Coast
  { id: 'rincon', name: 'Rincon', region: 'West Coast', lat: 34.3781, lng: -119.4819, noaaStation: '9410170' }, // San Diego
  { id: 'trestles',         name: 'Trestles',           region: 'West Coast',    lat: 33.385,   lng: -117.595,  noaaStation: '9410170' }, // San Diego
  { id: 'mavericks', name: 'Mavericks', region: 'West Coast', lat: 37.4915, lng: -122.5083, noaaStation: '9413450' }, // Monterey
  { id: 'blacks-beach',     name: 'Blacks Beach',       region: 'West Coast',    lat: 32.8897,  lng: -117.2530, noaaStation: '9410170' }, // San Diego
  { id: 'steamer-lane',     name: 'Steamer Lane',       region: 'West Coast',    lat: 36.9516,  lng: -122.0269, noaaStation: '9413450' }, // Monterey
  // Gulf Coast
  { id: 'south-padre',      name: 'South Padre Island', region: 'Gulf Coast',    lat: 26.103,   lng: -97.164,   noaaStation: '8779770' }, // Port Isabel
  { id: 'galveston',        name: 'Galveston',          region: 'Gulf Coast',    lat: 29.2990,  lng: -94.7977,  noaaStation: '8771341' }, // Galveston Pier 21
  { id: 'pensacola',        name: 'Pensacola Beach',    region: 'Gulf Coast',    lat: 30.3322,  lng: -87.1503,  noaaStation: '8729840' }, // Pensacola
  // East Coast
  { id: 'outer-banks',      name: 'Outer Banks',        region: 'East Coast',    lat: 35.5585,  lng: -75.4665,  noaaStation: '8654467' }, // USCG Station Hatteras
  { id: 'cocoa-beach',      name: 'Cocoa Beach',        region: 'East Coast',    lat: 28.3200,  lng: -80.6076,  noaaStation: '8721604' }, // Trident Pier
  { id: 'virginia-beach', name: 'Virginia Beach', region: 'East Coast', lat: 36.8529, lng: -75.9780, noaaStation: '8638610' },
  // Puerto Rico
  { id: 'rincon-pr',        name: 'Rincon, PR',         region: 'Puerto Rico',   lat: 18.3401,  lng: -67.2501,  noaaStation: '9759394' }, // Mayaguez
  { id: 'tres-palmas-pr',   name: 'Tres Palmas',        region: 'Puerto Rico',   lat: 18.3524,  lng: -67.2618,  noaaStation: '9759394' }, // Mayaguez
  { id: 'wilderness-pr',    name: 'Wilderness',         region: 'Puerto Rico',   lat: 18.3489,  lng: -67.2587,  noaaStation: '9759394' }, // Mayaguez
  { id: 'domes-pr',         name: 'Domes',              region: 'Puerto Rico',   lat: 18.3612,  lng: -67.2634,  noaaStation: '9759394' }, // Mayaguez
  { id: 'crashboat-pr',     name: 'Crash Boat',         region: 'Puerto Rico',   lat: 18.4751,  lng: -67.1629,  noaaStation: '9759394' }, // Mayaguez
  { id: 'rio-grande-pr',    name: 'Rio Grande',         region: 'Puerto Rico',   lat: 18.3701,  lng: -67.2489,  noaaStation: '9759394' }, // Mayaguez
  { id: 'avalanche-pr',     name: 'Avalanche',          region: 'Puerto Rico',   lat: 18.3556,  lng: -67.2601,  noaaStation: '9759394' }, // Mayaguez
  { id: 'wobbles-pr',       name: 'Wobbles',            region: 'Puerto Rico',   lat: 18.3478,  lng: -67.2578,  noaaStation: '9759394' }, // Mayaguez
  { id: 'bcs-pr',           name: 'BCs',                region: 'Puerto Rico',   lat: 18.3502,  lng: -67.2595,  noaaStation: '9759394' }, // Mayaguez
  { id: 'the-mix-pr',       name: 'The Mix',            region: 'Puerto Rico',   lat: 18.3521,  lng: -67.2612,  noaaStation: '9759394' }, // Mayaguez
  // International
  { id: 'teahupoo',         name: "Teahupo'o",          region: 'International', lat: -17.8417, lng: -149.267,  noaaStation: null },
  { id: 'jeffreys-bay',     name: 'Jeffreys Bay',       region: 'International', lat: -34.0333, lng: 24.9167,   noaaStation: null },
  { id: 'nazare',           name: 'Nazare',             region: 'International', lat: 39.6119,  lng: -9.0856,   noaaStation: null },
  { id: 'barra-de-la-cruz', name: 'Barra de la Cruz',  region: 'International', lat: 15.844,   lng: -96.322,   noaaStation: null },
  { id: 'puerto-escondido', name: 'Puerto Escondido',   region: 'International', lat: 15.87,    lng: -97.071,   noaaStation: null },
]

export const REGIONS = [...new Set(SPOTS.map(s => s.region))]