import { ClerkProvider, useAuth } from '@clerk/clerk-expo'
import { DMSans_400Regular, DMSans_500Medium } from '@expo-google-fonts/dm-sans'
import { Syne_700Bold, Syne_800ExtraBold, useFonts } from '@expo-google-fonts/syne'
import { Slot, useRouter, useSegments } from 'expo-router'
import * as SecureStore from 'expo-secure-store'
import * as SplashScreen from 'expo-splash-screen'
import { StatusBar } from 'expo-status-bar'
import { useEffect } from 'react'

SplashScreen.preventAutoHideAsync()

const tokenCache = {
	async getToken(key) {
		try { return await SecureStore.getItemAsync(key) } catch { return null }
	},
	async saveToken(key, value) {
		try { await SecureStore.setItemAsync(key, value) } catch { }
	},
}

function AuthGate() {
	const { isLoaded, isSignedIn } = useAuth()
	const segments = useSegments()
	const router = useRouter()

	useEffect(() => {
		if (!isLoaded) return
		const inAuth = segments[0] === '(auth)'
		if (!isSignedIn && !inAuth) router.replace('/(auth)/sign-in')
		if (isSignedIn && inAuth) router.replace('/(tabs)')
	}, [isLoaded, isSignedIn])

	return <Slot />
}

export default function RootLayout() {
	const [fontsLoaded] = useFonts({
		Syne_700Bold,
		Syne_800ExtraBold,
		DMSans_400Regular,
		DMSans_500Medium,
	})

	useEffect(() => {
		if (fontsLoaded) SplashScreen.hideAsync()
	}, [fontsLoaded])

	if (!fontsLoaded) return null

	return (
		<ClerkProvider
			publishableKey="pk_test_b25lLXN0YWxsaW9uLTk0LmNsZXJrLmFjY291bnRzLmRldiQ"
			tokenCache={tokenCache}
		>
			<StatusBar style="light" />
			<AuthGate />
		</ClerkProvider>
	)
}