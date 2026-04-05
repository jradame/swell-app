const BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'https://swelltrackerapp.com'

export async function getSessions(token) {
  const res = await fetch(`${BASE_URL}/api/sessions`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) throw new Error('Failed to fetch sessions')
  return res.json()
}

export async function createSession(token, data) {
  const res = await fetch(`${BASE_URL}/api/sessions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error('Failed to create session')
  return res.json()
}

export async function deleteSession(token, id) {
  const res = await fetch(`${BASE_URL}/api/sessions/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) throw new Error('Failed to delete session')
  return res.json()
}

export async function fetchConditions(lat, lng) {
  const marineUrl = `https://marine-api.open-meteo.com/v1/marine?latitude=${lat}&longitude=${lng}&current=wave_height,wave_period,wave_direction&forecast_days=1`
  const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=wind_speed_10m&wind_speed_unit=ms`
  const [marineRes, weatherRes] = await Promise.all([fetch(marineUrl), fetch(weatherUrl)])
  if (!marineRes.ok || !weatherRes.ok) throw new Error('Failed to fetch conditions')
  const [marineData, weatherData] = await Promise.all([marineRes.json(), weatherRes.json()])
  const waveHeightFt = Math.round(marineData.current.wave_height * 3.281)
  const period = Math.round(marineData.current.wave_period)
  const windKt = Math.round(weatherData.current.wind_speed_10m * 1.944)
  const quality = getQuality(waveHeightFt, windKt)
  return { waveHeight: waveHeightFt, period, wind: windKt, quality, fetchedAt: new Date() }
}

export async function fetchTides(noaaStation) {
  if (!noaaStation) return null
  const today = new Date()
  const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '')
  const url = `https://api.tidesandcurrents.noaa.gov/api/prod/datagetter?begin_date=${dateStr}&range=24&station=${noaaStation}&product=predictions&datum=MLLW&time_zone=lst_ldt&interval=hilo&units=english&application=swell_app&format=json`
  const res = await fetch(url)
  if (!res.ok) throw new Error('Failed to fetch tides')
  const data = await res.json()
  if (!data.predictions) return null
  return data.predictions.map(p => ({
    time: p.t,
    height: parseFloat(p.v).toFixed(1),
    type: p.type === 'H' ? 'High' : 'Low',
  }))
}

export async function fetchWaterTemp(noaaStation) {
  if (!noaaStation) return null
  const today = new Date()
  const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '')
  const url = `https://api.tidesandcurrents.noaa.gov/api/prod/datagetter?begin_date=${dateStr}&range=1&station=${noaaStation}&product=water_temperature&datum=MLLW&time_zone=lst_ldt&units=english&application=swell_app&format=json`
  const res = await fetch(url)
  if (!res.ok) throw new Error('Failed to fetch water temp')
  const data = await res.json()
  if (!data.data || !data.data[0]) return null
  return parseFloat(data.data[0].v).toFixed(1)
}

function getQuality(waveHeightFt, windKt) {
  if (waveHeightFt < 1.5) return 'Flat'
  if (windKt > 25) return 'Blown'
  if (windKt > 15 || waveHeightFt > 12) return 'Fair'
  return 'Clean'
}