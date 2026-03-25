export const SPOTS = [
  // Hawaii
  { id: 'pipeline',        name: 'Pipeline',          region: 'Hawaii',        lat: 21.6637,  lng: -158.0515 },
  { id: 'sunset-beach',    name: 'Sunset Beach',      region: 'Hawaii',        lat: 21.6783,  lng: -158.0403 },
  { id: 'waimea-bay',      name: 'Waimea Bay',         region: 'Hawaii',        lat: 21.6430,  lng: -158.0660 },
  // West Coast
  { id: 'rincon',          name: 'Rincon',             region: 'West Coast',    lat: 34.3781,  lng: -119.4819 },
  { id: 'trestles',        name: 'Trestles',           region: 'West Coast',    lat: 33.385,   lng: -117.595  },
  { id: 'mavericks',       name: 'Mavericks',          region: 'West Coast',    lat: 37.4915,  lng: -122.5083 },
  { id: 'blacks-beach',    name: 'Blacks Beach',       region: 'West Coast',    lat: 32.8897,  lng: -117.2530 },
  { id: 'steamer-lane',    name: 'Steamer Lane',       region: 'West Coast',    lat: 36.9516,  lng: -122.0269 },
  // Gulf Coast
  { id: 'south-padre',     name: 'South Padre Island', region: 'Gulf Coast',    lat: 26.103,   lng: -97.164   },
  { id: 'galveston',       name: 'Galveston',          region: 'Gulf Coast',    lat: 29.2990,  lng: -94.7977  },
  { id: 'pensacola',       name: 'Pensacola Beach',    region: 'Gulf Coast',    lat: 30.3322,  lng: -87.1503  },
  // East Coast
  { id: 'outer-banks',     name: 'Outer Banks',        region: 'East Coast',    lat: 35.5585,  lng: -75.4665  },
  { id: 'cocoa-beach',     name: 'Cocoa Beach',        region: 'East Coast',    lat: 28.3200,  lng: -80.6076  },
  { id: 'virginia-beach',  name: 'Virginia Beach',     region: 'East Coast',    lat: 36.8529,  lng: -75.9780  },
  // Puerto Rico
  { id: 'rincon-pr',       name: 'Rincon, PR',         region: 'Puerto Rico',   lat: 18.3401,  lng: -67.2501  },
  { id: 'tres-palmas-pr',  name: 'Tres Palmas',        region: 'Puerto Rico',   lat: 18.3524,  lng: -67.2618  },
  { id: 'wilderness-pr',   name: 'Wilderness',         region: 'Puerto Rico',   lat: 18.3489,  lng: -67.2587  },
  { id: 'domes-pr',        name: 'Domes',              region: 'Puerto Rico',   lat: 18.3612,  lng: -67.2634  },
  { id: 'crashboat-pr',    name: 'Crash Boat',         region: 'Puerto Rico',   lat: 18.4751,  lng: -67.1629  },
  { id: 'rio-grande-pr',   name: 'Rio Grande',         region: 'Puerto Rico',   lat: 18.3701,  lng: -67.2489  },
  { id: 'avalanche-pr',    name: 'Avalanche',          region: 'Puerto Rico',   lat: 18.3556,  lng: -67.2601  },
  { id: 'wobbles-pr',      name: 'Wobbles',            region: 'Puerto Rico',   lat: 18.3478,  lng: -67.2578  },
  { id: 'bcs-pr',          name: 'BCs',                region: 'Puerto Rico',   lat: 18.3502,  lng: -67.2595  },
  { id: 'the-mix-pr',      name: 'The Mix',            region: 'Puerto Rico',   lat: 18.3521,  lng: -67.2612  },
  // International
  { id: 'teahupoo',        name: "Teahupo'o",          region: 'International', lat: -17.8417, lng: -149.267  },
  { id: 'jeffreys-bay',    name: 'Jeffreys Bay',       region: 'International', lat: -34.0333, lng: 24.9167   },
  { id: 'nazare',          name: 'Nazare',             region: 'International', lat: 39.6119,  lng: -9.0856   },
  { id: 'barra-de-la-cruz',name: 'Barra de la Cruz',  region: 'International', lat: 15.844,   lng: -96.322   },
  { id: 'puerto-escondido',name: 'Puerto Escondido',   region: 'International', lat: 15.87,    lng: -97.071   },
]

export const REGIONS = [...new Set(SPOTS.map(s => s.region))]
