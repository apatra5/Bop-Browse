import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useAuth } from '@/contexts/AuthContext';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function UserScreen() {
	const { userId, username, signOut } = useAuth();
	const insets = useSafeAreaInsets();
	const [likesCount, setLikesCount] = useState<number | null>(null);
	const [dislikesCount, setDislikesCount] = useState<number | null>(null);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const colorScheme = useColorScheme();
	const router = useRouter();

	const fetchCounts = useCallback(async () => {
		if (!userId) return;
		setLoading(true);
		setError(null);
		try {
			const api = (await import('@/api/axios')).default;
			const [likesRes, dislikesRes] = await Promise.all([
				api.get(`/likes/${encodeURIComponent(userId)}`),
				api.get(`/dislikes/${encodeURIComponent(userId)}`),
			]);
			const likesArr = Array.isArray(likesRes?.data) ? likesRes.data : [];
			const dislikesArr = Array.isArray(dislikesRes?.data) ? dislikesRes.data : [];
			setLikesCount(likesArr.length);
			setDislikesCount(dislikesArr.length);
		} catch (e) {
			console.error('Failed to fetch user counts', e);
			setError('Unable to load your stats');
		} finally {
			setLoading(false);
		}
	}, [userId]);

	useEffect(() => {
		fetchCounts();
	}, [fetchCounts]);

	const handleSignOut = () => {
		signOut();
		router.replace('/(auth)/signin');
	};

		if (!userId) {
		return (
				<ThemedView style={[styles.centered, { paddingTop: insets.top + 16 }]}>
				<IconSymbol name="person.fill" size={64} color="#888" />
				<ThemedText type="title" style={styles.title}>You're not signed in</ThemedText>
				<TouchableOpacity style={styles.primaryButton} onPress={() => router.replace('/(auth)/signin')}>
					<ThemedText style={styles.primaryButtonText}>Go to Sign In</ThemedText>
				</TouchableOpacity>
			</ThemedView>
		);
	}

	return (
			<ThemedView style={[styles.container, { paddingTop: insets.top + 32 }]}>
			<View style={styles.headerCard}>
				<View style={[styles.avatar, { backgroundColor: Colors[colorScheme ?? 'light'].tint + '20' }]}>
					<IconSymbol name="person.fill" size={40} color={Colors[colorScheme ?? 'light'].tint} />
				</View>
				<View style={styles.headerText}>
					<ThemedText type="title" style={styles.title}>{username ?? 'User'}</ThemedText>
					<ThemedText style={styles.subtitle}>ID: {userId}</ThemedText>
				</View>
			</View>

			<View style={styles.statsRow}>
				<View style={styles.statCard}>
					<ThemedText style={styles.statLabel}>Likes</ThemedText>
					{loading ? (
						<ActivityIndicator />
					) : (
						<ThemedText type="title" style={styles.statValue}>{likesCount ?? 0}</ThemedText>
					)}
				</View>
				<View style={styles.statCard}>
					<ThemedText style={styles.statLabel}>Dislikes</ThemedText>
					{loading ? (
						<ActivityIndicator />
					) : (
						<ThemedText type="title" style={styles.statValue}>{dislikesCount ?? 0}</ThemedText>
					)}
				</View>
			</View>

			{error ? (
				<ThemedText style={styles.errorText}>{error}</ThemedText>
			) : null}

			<View style={styles.actions}>
				<TouchableOpacity style={styles.actionButton} onPress={() => router.push('/(tabs)/closet')}>
					<IconSymbol name="hanger" size={18} color="#333" />
					<ThemedText style={styles.actionText}>Open Closet</ThemedText>
				</TouchableOpacity>

				<TouchableOpacity style={styles.actionButton} onPress={fetchCounts}>
					<IconSymbol name="arrow.clockwise" size={18} color="#333" />
					<ThemedText style={styles.actionText}>Refresh</ThemedText>
				</TouchableOpacity>

				<TouchableOpacity style={[styles.actionButton, styles.danger]} onPress={handleSignOut}>
					<IconSymbol name="power" size={18} color="#B00020" />
					<ThemedText style={[styles.actionText, styles.dangerText]}>Sign out</ThemedText>
				</TouchableOpacity>
			</View>
		</ThemedView>
	);
}

const styles = StyleSheet.create({
	container: { flex: 1, padding: 16, gap: 16 },
	centered: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, padding: 16 },
	headerCard: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 12,
		padding: 12,
		borderRadius: 12,
		borderWidth: 1,
		borderColor: '#e6e6e6',
	},
	avatar: {
		width: 64,
		height: 64,
		borderRadius: 32,
		alignItems: 'center',
		justifyContent: 'center',
	},
	headerText: { flex: 1 },
	title: { fontWeight: '700' },
	subtitle: { color: '#666' },

	statsRow: { flexDirection: 'row', gap: 12 },
	statCard: {
		flex: 1,
		padding: 12,
		borderRadius: 12,
		borderWidth: 1,
		borderColor: '#e6e6e6',
		alignItems: 'center',
		justifyContent: 'center',
	},
	statLabel: { color: '#666', marginBottom: 4 },
	statValue: { fontWeight: '800' },

	actions: { flexDirection: 'row', gap: 10 },
	actionButton: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 8,
		paddingVertical: 10,
		paddingHorizontal: 14,
		borderRadius: 20,
		backgroundColor: '#f2f2f2',
	},
	actionText: { color: '#333', fontWeight: '600' },
	danger: { backgroundColor: '#fde8ea' },
	dangerText: { color: '#B00020' },
	errorText: { color: '#B00020' },
	primaryButton: {
		marginTop: 12,
		paddingVertical: 12,
		paddingHorizontal: 16,
		backgroundColor: '#f2f2f2',
		borderRadius: 20,
	},
	primaryButtonText: { color: '#333', fontWeight: '600' },
});
