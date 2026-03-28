import { useSignIn } from '@clerk/clerk-expo'
import { useState } from 'react'
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native'
import { Link } from 'expo-router'
import { C, R } from '../../lib/theme'

export default function SignIn() {
  const { signIn, setActive, isLoaded } = useSignIn()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [code, setCode] = useState('')
  const [step, setStep] = useState('email') // email | code
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleContinue = async () => {
    if (!isLoaded) return
    setLoading(true); setError('')
    try {
      await signIn.create({ identifier: email })
      const emailFactor = signIn.supportedFirstFactors.find(f => f.strategy === 'email_code')
      if (emailFactor) {
        await signIn.prepareFirstFactor({ strategy: 'email_code', emailAddressId: emailFactor.emailAddressId })
        setStep('code')
      }
    } catch (e) {
      setError(e.errors?.[0]?.message || 'Something went wrong')
    }
    setLoading(false)
  }

  const handleVerify = async () => {
    if (!isLoaded) return
    setLoading(true); setError('')
    try {
      const result = await signIn.attemptFirstFactor({ strategy: 'email_code', code })
      if (result.status === 'complete') await setActive({ session: result.createdSessionId })
    } catch (e) {
      setError(e.errors?.[0]?.message || 'Invalid code')
    }
    setLoading(false)
  }

  return (
    <KeyboardAvoidingView style={s.screen} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={s.inner}>
        <Text style={s.logo}>SWELL</Text>
        <Text style={s.sub}>Surf session tracker</Text>

        <View style={s.card}>
          <Text style={s.title}>{step === 'email' ? 'Sign in' : 'Check your email'}</Text>
          <Text style={s.desc}>
            {step === 'email' ? 'Enter your email to continue' : `We sent a code to ${email}`}
          </Text>

          {step === 'email' ? (
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
          ) : (
            <TextInput
              style={s.input}
              placeholder="Verification code"
              placeholderTextColor={C.textMuted}
              value={code}
              onChangeText={setCode}
              keyboardType="number-pad"
              autoComplete="one-time-code"
            />
          )}

          {error ? <Text style={s.error}>{error}</Text> : null}

          <TouchableOpacity
            style={[s.btn, loading && s.btnDisabled]}
            onPress={step === 'email' ? handleContinue : handleVerify}
            disabled={loading}
          >
            <Text style={s.btnText}>{loading ? 'Loading...' : step === 'email' ? 'Continue' : 'Verify'}</Text>
          </TouchableOpacity>

          {step === 'email' && (
            <View style={s.footer}>
              <Text style={s.footerText}>Don't have an account? </Text>
              <Link href="/sign-up" style={s.link}>Sign up</Link>
            </View>
          )}

          {step === 'code' && (
            <TouchableOpacity onPress={() => setStep('email')}>
              <Text style={[s.footerText, { textAlign: 'center', marginTop: 12 }]}>← Back</Text>
            </TouchableOpacity>
          )}
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
