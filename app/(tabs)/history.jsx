import { useAuth } from '@clerk/clerk-expo'
import { useFocusEffect } from 'expo-router'
import { useCallback, useState } from 'react'
import { Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { deleteSession, getSessions, updateSession } from '../../lib/api'
import { REGIONS, SPOTS } from '../../lib/spots'
import { C, R } from '../../lib/theme'

const BOARDS = ["5'10 shortboard", "6'0 thruster", "6'2 shortboard", "6'4 step-up", "7'6 funboard", "8'0 mini-mal", "9'0 longboard", "9'0 gun", "Bodyboard", "Other"]

const FILTERS = ['All', 'This month', 'Best rated', 'Biggest waves']

function StarRating({ rating = 0 }) {
  return (
    <View style={{ flexDirection: 'row', gap: 2 }}>
      {[1, 2, 3, 4, 5].map(n => (
        <Text key={n} style={{ color: n <= rating ? C.amber : C.textMuted, fontSize: 10 }}>★</Text>
      ))}
    </View>
  )
}

function Pill({ children, color = 'primary' }) {
  const colors = {
    primary: { bg: C.primaryDim, color: C.primary },
    green: { bg: C.greenDim, color: C.green },
    amber: { bg: C.amberDim, color: C.amber },
  }
  const c = colors[color] || colors.primary
  return (
    <View style={[s.pill, { backgroundColor: c.bg }]}>
      <Text style={[s.pillText, { color: c.color }]}>{children}</Text>
    </View>
  )
}

export default function HistoryScreen() {
  const { getToken } = useAuth()
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('All')
  const [deleteId, setDeleteId] = useState(null)
  const [editSession, setEditSession] = useState(null)
  const [editForm, setEditForm] = useState({})
  const [editRegion, setEditRegion] = useState('West Coast')
  const [showEditBoardPicker, setShowEditBoardPicker] = useState(false)
  const [saving, setSaving] = useState(false)

  const loadSessions = useCallback(() => {
    getToken().then(token => {
      getSessions(token)
        .then(d => { setSessions(Array.isArray(d) ? d : []); setLoading(false) })
        .catch(() => setLoading(false))
    })
  }, [])

  useFocusEffect(loadSessions)

  const openEdit = (session) => {
    const spot = SPOTS.find(s => s.name === session.spot)
    setEditRegion(spot ? spot.region : 'West Coast')
    setEditForm({
      spot: session.spot,
      date: session.date,
      waveHeight: String(session.waveHeight),
      duration: String(session.duration),
      board: session.board || '',
      rating: parseInt(session.rating) || 0,
      notes: session.notes || '',
    })
    setEditSession(session)
    setShowEditBoardPicker(false)
  }

  const setEdit = (field, val) => setEditForm(prev => ({ ...prev, [field]: val }))

  const handleEditRegionChange = (region) => {
    setEditRegion(region)
    setEdit('spot', '')
  }

  const handleSaveEdit = async () => {
    if (!editForm.spot || !editForm.date || !editForm.waveHeight || !editForm.duration) return
    setSaving(true)
    try {
      const token = await getToken()
      const updated = await updateSession(token, editSession.id, editForm)
      setSessions(prev => prev.map(s => s.id === editSession.id ? { ...s, ...updated } : s))
      setEditSession(null)
    } catch (e) {
      console.error(e)
    }
    setSaving(false)
  }

  const handleDelete = async () => {
    if (!deleteId) return
    const token = await getToken()
    await deleteSession(token, deleteId)
    setSessions(prev => prev.filter(s => s.id !== deleteId))
    setDeleteId(null)
  }

  const formatDate = (d) => {
    if (!d) return ''
    return new Date(d + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  const filtered = (() => {
    const now = new Date()
    let list = [...sessions]
    if (filter === 'This month') {
      list = list.filter(s => {
        const d = new Date(s.date)
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
      })
    } else if (filter === 'Best rated') {
      list = list.sort((a, b) => (parseInt(b.rating) || 0) - (parseInt(a.rating) || 0))
    } else if (filter === 'Biggest waves') {
      list = list.sort((a, b) => parseFloat(b.waveHeight) - parseFloat(a.waveHeight))
    }
    return list
  })()

  const ratingColor = (r) => { const n = parseInt(r) || 0; return n >= 4 ? 'green' : n >= 3 ? 'amber' : 'primary' }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }}>
      <View style={s.screen}>
        <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>

          <View style={s.header}>
            <View>
              <Text style={s.pageTitle}>HISTORY</Text>
              <Text style={s.pageSub}>{sessions.length} session{sessions.length !== 1 ? 's' : ''} logged</Text>
            </View>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.filterScroll}>
            <View style={s.filterRow}>
              {FILTERS.map(f => (
                <Pressable key={f} onPress={() => setFilter(f)} style={[s.filterChip, filter === f && s.filterChipActive]}>
                  <Text style={[s.filterText, filter === f && s.filterTextActive]}>{f}</Text>
                </Pressable>
              ))}
            </View>
          </ScrollView>

          {loading ? (
            <Text style={s.empty}>Loading...</Text>
          ) : filtered.length === 0 ? (
            <View style={s.emptyCard}>
              <Text style={s.empty}>{sessions.length === 0 ? 'No sessions yet' : 'No sessions match this filter'}</Text>
            </View>
          ) : (
            filtered.map(session => (
              <View key={session.id} style={s.card}>
                <View style={s.cardTop}>
                  <View style={{ flex: 1 }}>
                    <Text style={s.spot}>{session.spot}</Text>
                    <Text style={s.meta}>{formatDate(session.date)}</Text>
                  </View>
                  <View style={{ alignItems: 'flex-end', gap: 6 }}>
                    <StarRating rating={parseInt(session.rating) || 0} />
                    <View style={{ flexDirection: 'row', gap: 12 }}>
                      <TouchableOpacity onPress={() => openEdit(session)}>
                        <Text style={{ color: C.primary, fontSize: 12, fontFamily: 'DMSans_400Regular' }}>Edit</Text>
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => setDeleteId(session.id)}>
                        <Text style={{ color: C.red, fontSize: 12, fontFamily: 'DMSans_400Regular' }}>Delete</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
                <View style={s.pillRow}>
                  <Pill>{session.waveHeight} ft</Pill>
                  <Pill>{session.duration} min</Pill>
                  {session.rating > 0 && <Pill color={ratingColor(session.rating)}>{session.rating}/5</Pill>}
                  {session.board && <Pill>{session.board}</Pill>}
                </View>
                {session.notes ? (
                  <View style={s.notes}>
                    <Text style={s.notesText}>{session.notes}</Text>
                  </View>
                ) : null}
              </View>
            ))
          )}
        </ScrollView>

        <Modal visible={!!editSession} transparent animationType="slide">
          <View style={s.editOverlay}>
            <SafeAreaView style={{ flex: 1 }}>
              <View style={s.editSheet}>
                <View style={s.editHeader}>
                  <Text style={s.editTitle}>EDIT SESSION</Text>
                  <TouchableOpacity onPress={() => setEditSession(null)}>
                    <Text style={{ color: C.textMuted, fontSize: 22, lineHeight: 24 }}>×</Text>
                  </TouchableOpacity>
                </View>

                <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
                  <Text style={s.editLabel}>REGION</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 10 }}>
                    <View style={{ flexDirection: 'row', gap: 8 }}>
                      {REGIONS.map(r => (
                        <Pressable key={r} onPress={() => handleEditRegionChange(r)} style={[s.chip, editRegion === r && s.chipActive]}>
                          <Text style={[s.chipText, editRegion === r && s.chipTextActive]}>{r}</Text>
                        </Pressable>
                      ))}
                    </View>
                  </ScrollView>

                  <Text style={s.editLabel}>SPOT</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
                    <View style={{ flexDirection: 'row', gap: 8 }}>
                      {SPOTS.filter(sp => sp.region === editRegion).map(sp => (
                        <Pressable key={sp.id} onPress={() => setEdit('spot', sp.name)} style={[s.chip, editForm.spot === sp.name && s.chipSpotActive]}>
                          <Text style={[s.chipText, editForm.spot === sp.name && s.chipSpotTextActive]}>{sp.name}</Text>
                        </Pressable>
                      ))}
                    </View>
                  </ScrollView>

                  <Text style={s.editLabel}>DATE</Text>
                  <TextInput style={s.editInput} value={editForm.date} onChangeText={v => setEdit('date', v)} placeholder="YYYY-MM-DD" placeholderTextColor={C.textMuted} />

                  <View style={{ flexDirection: 'row', gap: 12 }}>
                    <View style={{ flex: 1 }}>
                      <Text style={s.editLabel}>WAVE HEIGHT (FT)</Text>
                      <TextInput style={s.editInput} value={editForm.waveHeight} onChangeText={v => setEdit('waveHeight', v)} keyboardType="decimal-pad" placeholderTextColor={C.textMuted} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={s.editLabel}>DURATION (MIN)</Text>
                      <TextInput style={s.editInput} value={editForm.duration} onChangeText={v => setEdit('duration', v)} keyboardType="number-pad" placeholderTextColor={C.textMuted} />
                    </View>
                  </View>

                  <Text style={s.editLabel}>BOARD</Text>
                  <TouchableOpacity style={s.editInput} onPress={() => setShowEditBoardPicker(!showEditBoardPicker)}>
                    <Text style={{ color: editForm.board ? C.text : C.textMuted, fontFamily: 'DMSans_400Regular', fontSize: 15 }}>
                      {editForm.board || 'Select a board (optional)'}
                    </Text>
                  </TouchableOpacity>
                  {showEditBoardPicker && (
                    <View style={s.pickerList}>
                      {BOARDS.map(b => (
                        <TouchableOpacity key={b} style={s.pickerItem} onPress={() => { setEdit('board', b); setShowEditBoardPicker(false) }}>
                          <Text style={[s.pickerText, editForm.board === b && { color: C.gold }]}>{b}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}

                  <Text style={s.editLabel}>SESSION RATING</Text>
                  <View style={{ flexDirection: 'row', gap: 8, marginBottom: 16 }}>
                    {[1, 2, 3, 4, 5].map(n => (
                      <TouchableOpacity key={n} onPress={() => setEdit('rating', n)} style={[s.starBtn, editForm.rating >= n && s.starBtnActive]}>
                        <Text style={[s.starText, editForm.rating >= n && s.starTextActive]}>{editForm.rating >= n ? '★' : '☆'}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  <Text style={s.editLabel}>NOTES</Text>
                  <TextInput style={[s.editInput, { height: 80, textAlignVertical: 'top' }]} value={editForm.notes} onChangeText={v => setEdit('notes', v)} placeholder="How were the conditions?" placeholderTextColor={C.textMuted} multiline />

                  <TouchableOpacity
                    style={[s.saveBtn, (!editForm.spot || !editForm.date || !editForm.waveHeight || !editForm.duration) && s.saveBtnDisabled]}
                    onPress={handleSaveEdit}
                    disabled={saving || !editForm.spot || !editForm.date || !editForm.waveHeight || !editForm.duration}
                  >
                    <Text style={[s.saveBtnText, (!editForm.spot || !editForm.date || !editForm.waveHeight || !editForm.duration) && { color: C.textMuted }]}>
                      {saving ? 'Saving...' : 'Save changes'}
                    </Text>
                  </TouchableOpacity>
                </ScrollView>
              </View>
            </SafeAreaView>
          </View>
        </Modal>

        <Modal visible={!!deleteId} transparent animationType="fade">
          <View style={s.modalOverlay}>
            <View style={s.modalCard}>
              <Text style={s.modalTitle}>Delete session?</Text>
              <Text style={s.modalSub}>This can't be undone.</Text>
              <View style={s.modalButtons}>
                <TouchableOpacity style={s.modalCancel} onPress={() => setDeleteId(null)}>
                  <Text style={s.modalCancelText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={s.modalDelete} onPress={handleDelete}>
                  <Text style={s.modalDeleteText}>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  )
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.bg },
  content: { padding: 20, paddingBottom: 40 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 16 },
  pageTitle: { fontFamily: 'Syne_800ExtraBold', fontSize: 22, color: C.gold },
  pageSub: { fontFamily: 'DMSans_400Regular', fontSize: 12, color: C.textMuted, marginTop: 2 },
  filterScroll: { marginBottom: 16 },
  filterRow: { flexDirection: 'row', gap: 8 },
  filterChip: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, borderWidth: 0.5, borderColor: C.border, backgroundColor: C.card },
  filterChipActive: { backgroundColor: C.goldDim, borderColor: C.gold },
  filterText: { fontFamily: 'DMSans_500Medium', fontSize: 12, color: C.textMuted },
  filterTextActive: { color: C.gold },
  card: { backgroundColor: C.card, borderRadius: R.lg, borderWidth: 0.5, borderColor: C.border, padding: 14, marginBottom: 10 },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  spot: { fontFamily: 'DMSans_500Medium', fontSize: 15, color: C.text },
  meta: { fontFamily: 'DMSans_400Regular', fontSize: 12, color: C.textMuted, marginTop: 2 },
  pillRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  pill: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  pillText: { fontFamily: 'DMSans_500Medium', fontSize: 11 },
  notes: { marginTop: 10, padding: 10, backgroundColor: C.bg, borderRadius: R.sm, borderLeftWidth: 2, borderLeftColor: C.gold },
  notesText: { fontFamily: 'DMSans_400Regular', fontSize: 12, color: C.textSecondary, lineHeight: 18 },
  empty: { fontFamily: 'DMSans_400Regular', fontSize: 13, color: C.textMuted, textAlign: 'center', padding: 20 },
  emptyCard: { backgroundColor: C.card, borderRadius: R.lg, borderWidth: 0.5, borderColor: C.borderMid, borderStyle: 'dashed', padding: 32, alignItems: 'center' },
  editOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  editSheet: { backgroundColor: C.bg, borderTopLeftRadius: 20, borderTopRightRadius: 20, borderTopWidth: 0.5, borderColor: C.borderMid, padding: 20, paddingBottom: 32, maxHeight: '92%' },
  editHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  editTitle: { fontFamily: 'Syne_800ExtraBold', fontSize: 18, color: C.gold },
  editLabel: { fontFamily: 'DMSans_500Medium', fontSize: 10, color: C.textMuted, letterSpacing: 1, marginBottom: 8 },
  editInput: { backgroundColor: C.card, borderRadius: R.md, borderWidth: 0.5, borderColor: C.borderMid, color: C.text, fontFamily: 'DMSans_400Regular', fontSize: 15, padding: 14, marginBottom: 16 },
  chip: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, borderWidth: 0.5, borderColor: C.border, backgroundColor: C.card },
  chipActive: { backgroundColor: C.goldDim, borderColor: C.gold },
  chipText: { fontFamily: 'DMSans_500Medium', fontSize: 12, color: C.textMuted },
  chipTextActive: { color: C.gold },
  chipSpotActive: { backgroundColor: C.primaryDim, borderColor: C.primary },
  chipSpotTextActive: { color: C.primary },
  pickerList: { backgroundColor: C.cardAlt, borderRadius: R.md, borderWidth: 0.5, borderColor: C.borderMid, marginBottom: 16, overflow: 'hidden' },
  pickerItem: { padding: 14, borderBottomWidth: 0.5, borderBottomColor: C.border },
  pickerText: { fontFamily: 'DMSans_400Regular', fontSize: 14, color: C.textSecondary },
  starBtn: { flex: 1, padding: 12, backgroundColor: C.card, borderRadius: R.md, borderWidth: 0.5, borderColor: C.border, alignItems: 'center' },
  starBtnActive: { backgroundColor: C.goldDim, borderColor: C.gold },
  starText: { fontSize: 20, color: C.textMuted },
  starTextActive: { color: C.gold },
  saveBtn: { backgroundColor: C.gold, borderRadius: R.lg, padding: 16, alignItems: 'center', marginTop: 8 },
  saveBtnDisabled: { backgroundColor: C.card },
  saveBtnText: { fontFamily: 'DMSans_500Medium', fontSize: 15, color: C.bg },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalCard: { backgroundColor: C.surface, borderRadius: R.xl, borderWidth: 0.5, borderColor: C.borderMid, padding: 24, width: '100%', maxWidth: 320 },
  modalTitle: { fontFamily: 'DMSans_500Medium', fontSize: 15, color: C.text, marginBottom: 6, textAlign: 'center' },
  modalSub: { fontFamily: 'DMSans_400Regular', fontSize: 13, color: C.textMuted, marginBottom: 20, textAlign: 'center' },
  modalButtons: { flexDirection: 'row', gap: 10 },
  modalCancel: { flex: 1, padding: 12, backgroundColor: C.card, borderRadius: R.md, borderWidth: 0.5, borderColor: C.border, alignItems: 'center' },
  modalCancelText: { fontFamily: 'DMSans_500Medium', fontSize: 14, color: C.textSecondary },
  modalDelete: { flex: 1, padding: 12, backgroundColor: C.redDim, borderRadius: R.md, borderWidth: 0.5, borderColor: C.red, alignItems: 'center' },
  modalDeleteText: { fontFamily: 'DMSans_500Medium', fontSize: 14, color: C.red },
})