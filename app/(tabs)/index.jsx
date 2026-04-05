import { useAuth, useClerk } from '@clerk/clerk-expo'
import { useFocusEffect } from 'expo-router'
import { useCallback, useEffect, useState } from 'react'
import { Pressable, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { fetchConditions, fetchTides, fetchWaterTemp, getSessions } from '../../lib/api'
import { REGIONS, SPOTS } from '../../lib/spots'
import { C, R } from '../../lib/theme'

function QualityBadge({ label }) {
  const colors = {
    Clean: { bg: C.greenDim, color: C.green },
    Fair: { bg: C.amberDim, color: C.amber },
    Blown: { bg: C.redDim, color: C.red },
    Flat: { bg: C.primaryDim, color: C.primary },
  }
  const c = colors[label] || colors.Fair
  return (
    <View style={[s.badge, { backgroundColor: c.bg }]}>
      <Text style={[s.badgeText, { color: c.color }]}>{label || '...'}</Text>
    </View>
  )
}

function StarRating({ rating = 0 }) {
  return (
    <View style={{ flexDirection: 'row', gap: 2 }}>
      {[1, 2, 3, 4, 5].map(n => (
        <Text key={n} style={{ color: n <= rating ? C.amber : C.textMuted, fontSize: 10 }}>★</Text>
      ))}
    </View>
  )
}

export default function HomeScreen() {
  const { getToken } = useAuth()
  const { signOut } = useClerk()
  const [selectedRegion, setSelectedRegion] = useState('West Coast')
  const [selectedSpotId, setSelectedSpotId] = useState('trestles')
  const [conditions, setConditions] = useState(null)
  const [condLoading, setCondLoading] = useState(true)
  const [condError, setCondError] = useState(false)
  const [sessions, setSessions] = useState([])
  const [sessionsLoading, setSessionsLoading] = useState(true)
  const [tides, setTides] = useState(null)
  const [waterTemp, setWaterTemp] = useState(null)

  const regionSpots = SPOTS.filter(s => s.region === selectedRegion)
  const selectedSpot = SPOTS.find(s => s.id === selectedSpotId) || regionSpots[0]

  const handleRegionChange = (region) => {
    setSelectedRegion(region)
    const first = SPOTS.find(s => s.region === region)
    if (first) setSelectedSpotId(first.id)
  }

  useEffect(() => {
    if (!selectedSpot) return
    setCondLoading(true); setCondError(false); setConditions(null)
    setTides(null); setWaterTemp(null)

    fetchConditions(selectedSpot.lat, selectedSpot.lng)
      .then(d => { setConditions(d); setCondLoading(false) })
      .catch(() => { setCondError(true); setCondLoading(false) })

    if (selectedSpot.noaaStation) {
      fetchTides(selectedSpot.noaaStation)
        .then(d => setTides(d))
        .catch(() => setTides(null))

      fetchWaterTemp(selectedSpot.noaaStation)
        .then(d => setWaterTemp(d))
        .catch(() => setWaterTemp(null))
    }
  }, [selectedSpotId])

  useFocusEffect(useCallback(() => {
    getToken().then(token => {
      getSessions(token)
        .then(d => { setSessions(Array.isArray(d) ? d : []); setSessionsLoading(false) })
        .catch(() => setSessionsLoading(false))
    })
  }, []))

  const now = new Date()
  const hour = now.getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'
  const dayName = now.toLocaleDateString('en-US', { weekday: 'long' }).toUpperCase()
  const dateStr = now.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })

  const totalSessions = sessions.length
  const thisMonth = sessions.filter(s => {
    const d = new Date(s.date)
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
  }).length
  const avgWave = sessions.length
    ? (sessions.reduce((acc, s) => acc + parseFloat(s.waveHeight || 0), 0) / sessions.length).toFixed(1)
    : '--'
  const recentSessions = sessions.slice(0, 4)

  const formatDate = (d) => {
    if (!d) return ''
    return new Date(d + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  const formatTideTime = (t) => {
    if (!t) return ''
    const [, time] = t.split(' ')
    const [h, m] = time.split(':')
    const hour = parseInt(h)
    const ampm = hour >= 12 ? 'PM' : 'AM'
    const h12 = hour % 12 || 12
    return `${h12}:${m} ${ampm}`
  }

  const nextTides = tides ? tides.filter(t => {
    const tideTime = new Date(t.time.replace(' ', 'T'))
    return tideTime > now
  }).slice(0, 4) : []

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }}>
      <ScrollView style={s.screen} contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>

        <View style={s.header}>
          <View style={{ flex: 1, minWidth: 0 }}>
            <Text style={s.greeting}>{greeting}</Text>
            <Text style={s.dayName} numberOfLines={1} adjustsFontSizeToFit>{dayName}</Text>
          </View>
          <View style={{ alignItems: 'flex-end', gap: 6 }}>
            <Text style={s.dateStr}>{dateStr}</Text>
            <TouchableOpacity onPress={() => signOut()}>
              <Text style={{ fontFamily: 'DMSans_400Regular', fontSize: 11, color: C.textMuted }}>Sign out</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={s.card}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.regionScroll} contentContainerStyle={s.regionRow}>
            {REGIONS.map(r => (
              <Pressable key={r} onPress={() => handleRegionChange(r)} style={[s.regionBtn, selectedRegion === r && s.regionBtnActive]}>
                <Text style={[s.regionText, selectedRegion === r && s.regionTextActive]}>{r}</Text>
              </Pressable>
            ))}
          </ScrollView>

          <View style={s.spotRow}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                {regionSpots.map(spot => (
                  <Pressable key={spot.id} onPress={() => setSelectedSpotId(spot.id)} style={[s.spotBtn, selectedSpotId === spot.id && s.spotBtnActive]}>
                    <Text style={[s.spotText, selectedSpotId === spot.id && s.spotTextActive]}>{spot.name}</Text>
                  </Pressable>
                ))}
              </View>
            </ScrollView>
            <QualityBadge label={condLoading ? '...' : condError ? 'N/A' : conditions?.quality} />
          </View>

          <View style={s.condRow}>
            {[
              { val: condLoading ? '—' : condError ? '—' : `${conditions?.waveHeight}`, unit: 'ft', label: 'Wave height' },
              { val: condLoading ? '—' : condError ? '—' : `${conditions?.period}`,     unit: 's',  label: 'Period'      },
              { val: condLoading ? '—' : condError ? '—' : `${conditions?.wind}`,       unit: 'kt', label: 'Wind'        },
            ].map((c, i) => (
              <View key={i} style={[s.condCell, i < 2 && s.condCellBorder]}>
                <View style={{ flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'center' }}>
                  <Text style={[s.condVal, condLoading && { color: C.textMuted }]}>{c.val}</Text>
                  {!condLoading && !condError && <Text style={s.condUnit}>{c.unit}</Text>}
                </View>
                <Text style={s.condLabel}>{c.label.toUpperCase()}</Text>
              </View>
            ))}
          </View>

          {(nextTides.length > 0 || waterTemp) && (
            <View style={{ flexDirection: 'row', borderTopWidth: 0.5, borderTopColor: C.border }}>
              {nextTides.length > 0 && (
                <View style={[{ flex: 1, padding: 12 }, waterTemp && { borderRightWidth: 0.5, borderRightColor: C.border }]}>
                  <Text style={[s.condLabel, { marginBottom: 8 }]}>TIDES</Text>
                  <View style={{ flexDirection: 'row', gap: 12 }}>
                    {nextTides.slice(0, 2).map((tide, i) => (
                      <View key={i}>
                        <Text style={s.tideType}>{tide.type.toUpperCase()}</Text>
                        <Text style={s.tideHeight}>{tide.height}<Text style={s.tideUnit}>ft</Text></Text>
                        <Text style={s.tideTime}>{formatTideTime(tide.time)}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}
              {waterTemp && (
                <View style={{ flex: 1, padding: 12 }}>
                  <Text style={[s.condLabel, { marginBottom: 8 }]}>WATER TEMP</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'flex-end' }}>
                    <Text style={s.condVal}>{waterTemp}</Text>
                    <Text style={s.condUnit}>°F</Text>
                  </View>
                </View>
              )}
            </View>
          )}

          <View style={s.condFooter}>
            <Text style={s.condFooterText}>Offshore swell · Open-Meteo Marine</Text>
            {conditions?.fetchedAt && (
              <Text style={s.condFooterText}>
                Updated {conditions.fetchedAt.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
              </Text>
            )}
          </View>
        </View>

        {/* {nextTides.length > 0 && (
          <View style={s.card}>
            <View style={{ padding: 12, borderBottomWidth: 0.5, borderBottomColor: C.border }}>
              <Text style={s.sectionTitle}>TIDES</Text>
            </View>
            <View style={{ flexDirection: 'row' }}>
              {nextTides.map((tide, i) => (
                <View key={i} style={[s.tideCell, i < nextTides.length - 1 && s.tideCellBorder]}>
                  <Text style={s.tideType}>{tide.type.toUpperCase()}</Text>
                  <Text style={s.tideHeight}>{tide.height}<Text style={s.tideUnit}>ft</Text></Text>
                  <Text style={s.tideTime}>{formatTideTime(tide.time)}</Text>
                </View>
              ))}
            </View>
          </View>
        )} */}

        <View style={s.statRow}>
          {[
            { label: 'Total sessions', val: sessionsLoading ? '—' : String(totalSessions), sub: totalSessions === 0 ? 'Log your first' : `${thisMonth} this month` },
            { label: 'Avg wave height', val: sessionsLoading ? '—' : avgWave, sub: avgWave === '--' ? 'No data yet' : 'feet' },
          ].map((stat, i) => (
            <View key={i} style={[s.card, s.statCard]}>
              <Text style={s.statLabel}>{stat.label.toUpperCase()}</Text>
              <Text style={s.statVal}>{stat.val}</Text>
              <Text style={s.statSub}>{stat.sub}</Text>
            </View>
          ))}
        </View>

        <View style={s.sectionHeader}>
          <Text style={s.sectionTitle}>RECENT SESSIONS</Text>
        </View>

        {sessionsLoading ? (
          <View style={s.card}><Text style={s.empty}>Loading...</Text></View>
        ) : recentSessions.length === 0 ? (
          <View style={[s.card, s.emptyCard]}>
            <Text style={s.empty}>No sessions logged yet</Text>
          </View>
        ) : (
          recentSessions.map(session => (
            <View key={session.id} style={[s.card, s.sessionCard]}>
              <View style={{ flex: 1, minWidth: 0 }}>
                <Text style={s.sessionSpot} numberOfLines={1}>{session.spot}</Text>
                <Text style={s.sessionMeta}>{formatDate(session.date)} · {session.duration} min</Text>
              </View>
              <View style={{ alignItems: 'flex-end', gap: 6 }}>
                <Text style={s.sessionWave}>{session.waveHeight} ft</Text>
                <StarRating rating={parseInt(session.rating) || 0} />
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  )
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.bg },
  content: { padding: 20, paddingBottom: 40 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 },
  greeting: { fontFamily: 'DMSans_400Regular', fontSize: 12, color: C.textMuted, marginBottom: 2 },
  dayName: { fontFamily: 'Syne_800ExtraBold', fontSize: 22, color: C.gold, lineHeight: 26 },
  dateStr: { fontFamily: 'Syne_700Bold', fontSize: 10, color: C.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5, flexShrink: 1, textAlign: 'right' },
  card: { backgroundColor: C.card, borderRadius: R.lg, borderWidth: 0.5, borderColor: C.borderMid, marginBottom: 12, overflow: 'hidden' },
  badge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 20 },
  badgeText: { fontFamily: 'DMSans_500Medium', fontSize: 11 },
  regionScroll: { borderBottomWidth: 0.5, borderBottomColor: C.border },
  regionRow: { flexDirection: 'row', gap: 6, padding: 10 },
  regionBtn: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20, borderWidth: 0.5, borderColor: C.border },
  regionBtnActive: { backgroundColor: C.goldDim, borderColor: C.gold },
  regionText: { fontFamily: 'DMSans_500Medium', fontSize: 11, color: C.textMuted },
  regionTextActive: { color: C.gold },
  spotRow: { flexDirection: 'row', alignItems: 'center', padding: 10, gap: 8 },
  spotBtn: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: R.md, borderWidth: 0.5, borderColor: C.border, backgroundColor: C.cardAlt },
  spotBtnActive: { backgroundColor: C.primaryDim, borderColor: C.primary },
  spotText: { fontFamily: 'DMSans_500Medium', fontSize: 12, color: C.textMuted },
  spotTextActive: { color: C.primary },
  condRow: { flexDirection: 'row', borderTopWidth: 0.5, borderTopColor: C.border },
  condCell: { flex: 1, padding: 14, alignItems: 'center' },
  condCellBorder: { borderRightWidth: 0.5, borderRightColor: C.border },
  condVal: { fontFamily: 'Syne_800ExtraBold', fontSize: 26, color: C.text },
  condUnit: { fontFamily: 'DMSans_400Regular', fontSize: 11, color: C.primary, marginLeft: 2, marginBottom: 3 },
  condLabel: { fontFamily: 'DMSans_400Regular', fontSize: 9, color: C.textMuted, marginTop: 4, letterSpacing: 0.5 },
  condFooter: { flexDirection: 'row', justifyContent: 'space-between', padding: 8, paddingHorizontal: 12, borderTopWidth: 0.5, borderTopColor: C.border },
  condFooterText: { fontFamily: 'DMSans_400Regular', fontSize: 9, color: C.textMuted },
  tideCell: { flex: 1, padding: 12, alignItems: 'center' },
  tideCellBorder: { borderRightWidth: 0.5, borderRightColor: C.border },
  tideType: { fontFamily: 'DMSans_500Medium', fontSize: 9, color: C.textMuted, letterSpacing: 0.5, marginBottom: 4 },
  tideHeight: { fontFamily: 'Syne_800ExtraBold', fontSize: 18, color: C.text },
  tideUnit: { fontFamily: 'DMSans_400Regular', fontSize: 10, color: C.primary },
  tideTime: { fontFamily: 'DMSans_400Regular', fontSize: 10, color: C.textMuted, marginTop: 2 },
  statRow: { flexDirection: 'row', gap: 10 },
  statCard: { flex: 1, padding: 14, marginBottom: 12 },
  statLabel: { fontFamily: 'DMSans_400Regular', fontSize: 9, color: C.textMuted, letterSpacing: 0.5, marginBottom: 6 },
  statVal: { fontFamily: 'Syne_800ExtraBold', fontSize: 28, color: C.text, lineHeight: 30 },
  statSub: { fontFamily: 'DMSans_400Regular', fontSize: 11, color: C.gold, marginTop: 4 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  sectionTitle: { fontFamily: 'DMSans_500Medium', fontSize: 10, color: C.textMuted, letterSpacing: 1 },
  sessionCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 14, marginBottom: 8 },
  sessionSpot: { fontFamily: 'DMSans_500Medium', fontSize: 14, color: C.text, marginBottom: 3 },
  sessionMeta: { fontFamily: 'DMSans_400Regular', fontSize: 11, color: C.textMuted },
  sessionWave: { fontFamily: 'DMSans_500Medium', fontSize: 13, color: C.primary },
  empty: { fontFamily: 'DMSans_400Regular', fontSize: 13, color: C.textMuted, textAlign: 'center', padding: 20 },
  emptyCard: { padding: 32, alignItems: 'center' },
})