import { useAuth } from '@clerk/clerk-expo'
import { useFocusEffect } from 'expo-router'
import { useCallback, useState } from 'react'
import { ScrollView, StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { getSessions } from '../../lib/api'
import { C, R } from '../../lib/theme'

function StatCard({ label, value, sub, accent = C.gold }) {
  return (
    <View style={s.statCard}>
      <Text style={s.statLabel}>{label.toUpperCase()}</Text>
      <Text style={s.statVal}>{value}</Text>
      {sub ? <Text style={[s.statSub, { color: accent }]}>{sub}</Text> : null}
    </View>
  )
}

export default function ProgressScreen() {
  const { getToken } = useAuth()
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)

  useFocusEffect(useCallback(() => {
    getToken().then(token => {
      getSessions(token)
        .then(d => { setSessions(Array.isArray(d) ? d : []); setLoading(false) })
        .catch(() => setLoading(false))
    })
  }, []))

  const now = new Date()

  const thisMonthSessions = sessions.filter(s => {
    const d = new Date(s.date)
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
  })

  const avgRating = sessions.length
    ? (sessions.reduce((acc, s) => acc + (parseInt(s.rating) || 0), 0) / sessions.length).toFixed(1)
    : '--'
  const avgWave = sessions.length
    ? (sessions.reduce((acc, s) => acc + parseFloat(s.waveHeight || 0), 0) / sessions.length).toFixed(1)
    : '--'
  const maxWave = sessions.length
    ? Math.max(...sessions.map(s => parseFloat(s.waveHeight || 0)))
    : '--'
  const totalMinutes = sessions.reduce((acc, s) => acc + parseInt(s.duration || 0), 0)
  const totalHours = totalMinutes > 0 ? (totalMinutes / 60).toFixed(1) : '--'

  const calcStreak = () => {
    if (!sessions.length) return 0
    const dates = [...new Set(sessions.map(s => s.date))].sort().reverse()
    let streak = 0
    let current = new Date(); current.setHours(0, 0, 0, 0)
    for (const dateStr of dates) {
      const d = new Date(dateStr + 'T00:00:00'); d.setHours(0, 0, 0, 0)
      const diff = (current - d) / (1000 * 60 * 60 * 24)
      if (diff <= 1) { streak++; current = d } else break
    }
    return streak
  }
  const streak = calcStreak()

  const spotCounts = sessions.reduce((acc, s) => {
    if (s.spot) acc[s.spot] = (acc[s.spot] || 0) + 1
    return acc
  }, {})
  const topSpots = Object.entries(spotCounts).sort((a, b) => b[1] - a[1]).slice(0, 5)
  const maxCount = topSpots.length ? topSpots[0][1] : 1

  const monthlyData = (() => {
    const months = []
    for (let i = 3; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const label = d.toLocaleDateString('en-US', { month: 'short' })
      const count = sessions.filter(s => {
        const sd = new Date(s.date)
        return sd.getMonth() === d.getMonth() && sd.getFullYear() === d.getFullYear()
      }).length
      months.push({ label, count })
    }
    return months
  })()
  const maxMonthly = Math.max(...monthlyData.map(m => m.count), 1)

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }}>
      <ScrollView style={s.screen} contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        <Text style={s.pageTitle}>PROGRESS</Text>
        <Text style={s.pageSub}>{now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</Text>

        {loading ? (
          <Text style={s.empty}>Loading...</Text>
        ) : sessions.length === 0 ? (
          <View style={s.emptyCard}>
            <Text style={s.empty}>Log some sessions to see your progress</Text>
          </View>
        ) : (
          <>
            <View style={[s.card, { flexDirection: 'row', alignItems: 'center', gap: 16, padding: 20 }]}>
              <Text style={[s.streakNum, { color: streak > 0 ? C.primary : C.textMuted }]}>{streak}</Text>
              <View>
                <Text style={s.streakLabel}>Day streak</Text>
                <Text style={s.streakSub}>{streak > 0 ? 'Keep it going' : 'Log a session to start'}</Text>
              </View>
            </View>

            <View style={s.statGrid}>
              <StatCard label="Sessions total" value={String(sessions.length)} sub={`${thisMonthSessions.length} this month`} />
              <StatCard label="Avg rating" value={avgRating} sub="out of 5" accent={C.amber} />
              <StatCard label="Avg wave" value={avgWave !== '--' ? `${avgWave} ft` : '--'} sub={maxWave !== '--' ? `Best: ${maxWave} ft` : ''} accent={C.primary} />
              <StatCard label="Time in water" value={totalHours !== '--' ? `${totalHours}h` : '--'} sub={`${totalMinutes} min total`} />
            </View>

            <View style={s.card}>
              <Text style={s.chartTitle}>SESSIONS BY MONTH</Text>
              <View style={s.barChart}>
                {monthlyData.map((m, i) => (
                  <View key={i} style={s.barCol}>
                    <Text style={s.barCount}>{m.count > 0 ? m.count : ''}</Text>
                    <View style={s.barTrack}>
                      <View style={[s.bar, {
                        height: m.count > 0 ? Math.max((m.count / maxMonthly) * 60, 6) : 4,
                        backgroundColor: i === 3 ? C.primary : C.primaryDim,
                      }]} />
                    </View>
                    <Text style={s.barLabel}>{m.label}</Text>
                  </View>
                ))}
              </View>
            </View>

            {topSpots.length > 0 && (
              <View style={s.card}>
                <Text style={s.chartTitle}>TOP SPOTS</Text>
                {topSpots.map(([spot, count]) => (
                  <View key={spot} style={s.spotRow}>
                    <View style={s.spotInfo}>
                      <Text style={s.spotName}>{spot}</Text>
                      <Text style={s.spotCount}>{count} session{count !== 1 ? 's' : ''}</Text>
                    </View>
                    <View style={s.barTrackH}>
                      <View style={[s.barH, { width: `${(count / maxCount) * 100}%` }]} />
                    </View>
                  </View>
                ))}
              </View>
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  )
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.bg },
  content: { padding: 20, paddingBottom: 40 },
  pageTitle: { fontFamily: 'Syne_800ExtraBold', fontSize: 22, color: C.gold },
  pageSub: { fontFamily: 'DMSans_400Regular', fontSize: 13, color: C.textMuted, marginBottom: 20 },
  card: { backgroundColor: C.card, borderRadius: R.lg, borderWidth: 0.5, borderColor: C.border, marginBottom: 12, overflow: 'hidden', padding: 16 },
  streakNum: { fontFamily: 'Syne_800ExtraBold', fontSize: 56, lineHeight: 60 },
  streakLabel: { fontFamily: 'DMSans_500Medium', fontSize: 15, color: C.text },
  streakSub: { fontFamily: 'DMSans_400Regular', fontSize: 12, color: C.textMuted, marginTop: 2 },
  statGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 2 },
  statCard: { width: '47.5%', backgroundColor: C.card, borderRadius: R.lg, borderWidth: 0.5, borderColor: C.border, padding: 14, marginBottom: 0 },
  statLabel: { fontFamily: 'DMSans_400Regular', fontSize: 9, color: C.textMuted, letterSpacing: 0.5, marginBottom: 6 },
  statVal: { fontFamily: 'Syne_800ExtraBold', fontSize: 28, color: C.text, lineHeight: 30 },
  statSub: { fontFamily: 'DMSans_400Regular', fontSize: 11, marginTop: 4 },
  chartTitle: { fontFamily: 'DMSans_500Medium', fontSize: 10, color: C.textMuted, letterSpacing: 1, marginBottom: 16 },
  barChart: { flexDirection: 'row', gap: 12, height: 100, alignItems: 'flex-end' },
  barCol: { flex: 1, alignItems: 'center', gap: 4 },
  barCount: { fontFamily: 'DMSans_400Regular', fontSize: 10, color: C.textMuted },
  barTrack: { flex: 1, width: '100%', justifyContent: 'flex-end' },
  bar: { width: '100%', borderRadius: 4 },
  barLabel: { fontFamily: 'DMSans_400Regular', fontSize: 10, color: C.textMuted },
  spotRow: { marginBottom: 12 },
  spotInfo: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 },
  spotName: { fontFamily: 'DMSans_500Medium', fontSize: 13, color: C.text },
  spotCount: { fontFamily: 'DMSans_400Regular', fontSize: 12, color: C.textMuted },
  barTrackH: { height: 5, backgroundColor: C.bg, borderRadius: 3, overflow: 'hidden' },
  barH: { height: '100%', backgroundColor: C.primary, borderRadius: 3 },
  empty: { fontFamily: 'DMSans_400Regular', fontSize: 13, color: C.textMuted, textAlign: 'center', padding: 20 },
  emptyCard: { backgroundColor: C.card, borderRadius: R.lg, borderWidth: 0.5, borderColor: C.borderMid, padding: 32, alignItems: 'center' },
})