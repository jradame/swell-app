const BASE_URL = 'https://swell-v3-bice.vercel.app'

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

function getQuality(waveHeightFt, windKt) {
  if (waveHeightFt < 1.5) return 'Flat'
  if (windKt > 25) return 'Blown'
  if (windKt > 15 || waveHeightFt > 12) return 'Fair'
  return 'Clean'
}
