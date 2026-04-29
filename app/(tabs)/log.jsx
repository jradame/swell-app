import { useAuth } from '@clerk/clerk-expo'
import { useRouter } from 'expo-router'
import { useState } from 'react'
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { createSession } from '../../lib/api'
import { REGIONS, SPOTS } from '../../lib/spots'
import { C, R } from '../../lib/theme'

const BOARDS = ["5'10 shortboard", "6'0 thruster", "6'2 shortboard", "6'4 step-up", "7'6 funboard", "8'0 mini-mal", "9'0 longboard", "9'0 gun", "Bodyboard", "Other"]

export default function LogScreen() {
  const { getToken } = useAuth()
  const router = useRouter()
  const today = new Date().toISOString().split('T')[0]

  const [selectedRegion, setSelectedRegion] = useState('West Coast')
  const [form, setForm] = useState({ spot: '', date: today, waveHeight: '', duration: '', board: '', rating: 0, notes: '' })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [showBoardPicker, setShowBoardPicker] = useState(false)

  const regionSpots = SPOTS.filter(s => s.region === selectedRegion)
  const set = (field, val) => setForm(prev => ({ ...prev, [field]: val }))

  const handleRegionChange = (region) => {
    setSelectedRegion(region)
    set('spot', '')
  }

  const handleSave = async () => {
    if (!form.spot || !form.date || !form.waveHeight || !form.duration) return
    setSaving(true)
    try {
      const token = await getToken()
      await createSession(token, form)
      setSaved(true)
      setTimeout(() => { setSaved(false); router.push('/history') }, 1200)
    } catch (e) {
      console.error(e)
    }
    setSaving(false)
  }

  if (saved) {
    return (
      <SafeAreaView style={[s.screen, { justifyContent: 'center', alignItems: 'center' }]}>
        <View style={s.successCircle}>
          <Text style={{ color: C.green, fontSize: 28 }}>✓</Text>
        </View>
        <Text style={s.successTitle}>Session saved</Text>
        <Text style={s.successSub}>Heading to your history...</Text>
      </SafeAreaView>
    )
  }

  const canSave = form.spot && form.date && form.waveHeight && form.duration

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView
          style={s.screen}
          contentContainerStyle={s.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={s.pageTitle}>LOG SESSION</Text>
          <Text style={s.pageSub}>How was it out there?</Text>

          <Text style={s.label}>REGION</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 10 }}>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              {REGIONS.map(r => (
                <Pressable key={r} onPress={() => handleRegionChange(r)} style={[s.chip, selectedRegion === r && s.chipActive]}>
                  <Text style={[s.chipText, selectedRegion === r && s.chipTextActive]}>{r}</Text>
                </Pressable>
              ))}
            </View>
          </ScrollView>

          <Text style={s.label}>SPOT</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              {regionSpots.map(spot => (
                <Pressable key={spot.id} onPress={() => set('spot', spot.name)} style={[s.chip, form.spot === spot.name && s.chipSpotActive]}>
                  <Text style={[s.chipText, form.spot === spot.name && s.chipSpotTextActive]}>{spot.name}</Text>
                </Pressable>
              ))}
            </View>
          </ScrollView>

          <Text style={s.label}>DATE</Text>
          <TextInput style={s.input} value={form.date} onChangeText={v => set('date', v)} placeholder="YYYY-MM-DD" placeholderTextColor={C.textMuted} />

          <View style={{ flexDirection: 'row', gap: 12 }}>
            <View style={{ flex: 1 }}>
              <Text style={s.label}>WAVE HEIGHT (FT)</Text>
              <TextInput style={s.input} value={form.waveHeight} onChangeText={v => set('waveHeight', v)} placeholder="e.g. 4" placeholderTextColor={C.textMuted} keyboardType="decimal-pad" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.label}>DURATION (MIN)</Text>
              <TextInput style={s.input} value={form.duration} onChangeText={v => set('duration', v)} placeholder="e.g. 90" placeholderTextColor={C.textMuted} keyboardType="number-pad" />
            </View>
          </View>

          <Text style={s.label}>BOARD</Text>
          <TouchableOpacity style={s.input} onPress={() => setShowBoardPicker(!showBoardPicker)}>
            <Text style={{ color: form.board ? C.text : C.textMuted, fontFamily: 'DMSans_400Regular', fontSize: 15 }}>
              {form.board || 'Select a board (optional)'}
            </Text>
          </TouchableOpacity>
          {showBoardPicker && (
            <View style={s.pickerList}>
              {BOARDS.map(b => (
                <TouchableOpacity key={b} style={s.pickerItem} onPress={() => { set('board', b); setShowBoardPicker(false) }}>
                  <Text style={[s.pickerText, form.board === b && { color: C.gold }]}>{b}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          <Text style={s.label}>NOTES</Text>
          <TextInput
            style={[s.input, { height: 90, textAlignVertical: 'top' }]}
            value={form.notes}
            onChangeText={v => set('notes', v)}
            placeholder="How were the conditions?"
            placeholderTextColor={C.textMuted}
            multiline
            returnKeyType="done"
            blurOnSubmit
          />

          <Text style={s.label}>SESSION RATING</Text>
          <View style={{ flexDirection: 'row', gap: 8, marginBottom: 24 }}>
            {[1, 2, 3, 4, 5].map(n => (
              <TouchableOpacity key={n} onPress={() => set('rating', n)} style={[s.starBtn, form.rating >= n && s.starBtnActive]}>
                <Text style={[s.starText, form.rating >= n && s.starTextActive]}>{form.rating >= n ? '★' : '☆'}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        <View style={s.bottomBar}>
          <TouchableOpacity style={[s.saveBtn, !canSave && s.saveBtnDisabled]} onPress={handleSave} disabled={!canSave || saving}>
            <Text style={[s.saveBtnText, !canSave && { color: C.textMuted }]}>{saving ? 'Saving...' : 'Save session'}</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.bg },
  content: { padding: 20, paddingBottom: 20 },
  pageTitle: { fontFamily: 'Syne_800ExtraBold', fontSize: 22, color: C.gold, marginBottom: 4 },
  pageSub: { fontFamily: 'DMSans_400Regular', fontSize: 13, color: C.textMuted, marginBottom: 24 },
  label: { fontFamily: 'DMSans_500Medium', fontSize: 10, color: C.textMuted, letterSpacing: 1, marginBottom: 8 },
  input: { backgroundColor: C.card, borderRadius: R.md, borderWidth: 0.5, borderColor: C.borderMid, color: C.text, fontFamily: 'DMSans_400Regular', fontSize: 15, padding: 14, marginBottom: 16 },
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
  bottomBar: { padding: 16, paddingBottom: 8, backgroundColor: C.bg, borderTopWidth: 0.5, borderTopColor: C.borderMid },
  saveBtn: { backgroundColor: C.gold, borderRadius: R.lg, padding: 16, alignItems: 'center' },
  saveBtnDisabled: { backgroundColor: C.card },
  saveBtnText: { fontFamily: 'DMSans_500Medium', fontSize: 15, color: C.bg },
  successCircle: { width: 56, height: 56, borderRadius: 28, backgroundColor: C.greenDim, borderWidth: 1.5, borderColor: C.green, justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  successTitle: { fontFamily: 'Syne_800ExtraBold', fontSize: 28, color: C.gold, textTransform: 'uppercase', letterSpacing: 1 },
  successSub: { fontFamily: 'DMSans_400Regular', fontSize: 13, color: C.textMuted, marginTop: 6 },
})