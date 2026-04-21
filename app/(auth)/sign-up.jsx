import { useSignUp } from '@clerk/clerk-expo'
import { Link } from 'expo-router'
import { useState } from 'react'
import { KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
import { C, R } from '../../lib/theme'

export default function SignUp() {
  const { signUp, setActive, isLoaded } = useSignUp()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSignUp = async () => {
    if (!isLoaded) return
    setLoading(true); setError('')
    try {
      const result = await signUp.create({ emailAddress: email, password })
      if (result.status === 'complete') {
        await setActive({ session: result.createdSessionId })
      } else {
        setError('Something went wrong. Please try again.')
      }
    } catch (e) {
      setError(e.errors?.[0]?.message || 'Something went wrong')
    }
    setLoading(false)
  }

  return (
    <KeyboardAvoidingView style={s.screen} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={s.inner}>
        <Text style={s.logo}>SWELL</Text>
        <Text style={s.sub}>Surf session tracker</Text>

        <View style={s.card}>
          <Text style={s.title}>Create account</Text>
          <Text style={s.desc}>Enter your email to get started</Text>

          <TextInput
            style={s.input}
            placeholder="Email address"
            placeholderTextColor={C.textMuted}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            autoComplete="email"
          />

          <TextInput
            style={s.input}
            placeholder="Password"
            placeholderTextColor={C.textMuted}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoComplete="password-new"
          />

          {error ? <Text style={s.error}>{error}</Text> : null}

          <TouchableOpacity
            style={[s.btn, loading && s.btnDisabled]}
            onPress={handleSignUp}
            disabled={loading}
          >
            <Text style={s.btnText}>{loading ? 'Loading...' : 'Create account'}</Text>
          </TouchableOpacity>

          <View style={s.footer}>
            <Text style={s.footerText}>Already have an account? </Text>
            <Link href="/sign-in" style={s.link}>Sign in</Link>
          </View>
        </View>
      </View>
    </KeyboardAvoidingView>
  )
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.bg },
  inner: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  logo: { fontFamily: 'Syne_800ExtraBold', fontSize: 36, color: C.gold, letterSpacing: 2, marginBottom: 4 },
  sub: { fontFamily: 'DMSans_400Regular', fontSize: 13, color: C.textMuted, marginBottom: 40 },
  card: { width: '100%', backgroundColor: C.surface, borderRadius: R.xl, padding: 24, borderWidth: 0.5, borderColor: C.borderMid },
  title: { fontFamily: 'Syne_700Bold', fontSize: 20, color: C.text, marginBottom: 6 },
  desc: { fontFamily: 'DMSans_400Regular', fontSize: 13, color: C.textMuted, marginBottom: 20 },
  input: { backgroundColor: C.cardAlt, borderRadius: R.md, borderWidth: 0.5, borderColor: C.borderMid, color: C.text, fontFamily: 'DMSans_400Regular', fontSize: 15, padding: 14, marginBottom: 12 },
  error: { color: C.red, fontSize: 12, marginBottom: 10, fontFamily: 'DMSans_400Regular' },
  btn: { backgroundColor: C.gold, borderRadius: R.lg, padding: 16, alignItems: 'center', marginTop: 4 },
  btnDisabled: { opacity: 0.6 },
  btnText: { fontFamily: 'DMSans_500Medium', fontSize: 15, color: C.bg },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 16 },
  footerText: { fontFamily: 'DMSans_400Regular', fontSize: 13, color: C.textMuted },
  link: { fontFamily: 'DMSans_500Medium', fontSize: 13, color: C.gold },
})