// This file contains the authentication code that was removed from the main app

// Import statements for authentication
import { AuthScreen } from '@/components/AuthScreen';
import { useAuth } from '@/hooks/useAuth';

// Auth-related state and initialization
const { user, loading: authLoading, signOut } = useAuth();

// UI elements for authenticated users
<View style={styles.headerRow}>
  <View style={styles.heroIconContainer}>
    <View style={styles.iconBackground}>
      <Ionicons name="water-outline" size={38} color="#FFFFFF" />
    </View>
  </View>
  <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
    <Ionicons name="log-out-outline" size={20} color="#FFFFFF" />
    <Text style={styles.signOutText}>Sign Out</Text>
  </TouchableOpacity>
</View>

// Welcome user text
{user && (
  <Text style={styles.welcomeText}>
    Welcome, {user.displayName || user.email}
  </Text>
)}

// Auth loading and conditional rendering
if (authLoading) {
  return (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color="#4FA3C1" />
      <Text style={styles.loadingText}>Loading...</Text>
    </View>
  );
}

if (!user) {
  return <AuthScreen />;
}

// Sign out handler
const handleSignOut = async () => {
  try {
    await signOut();
  } catch (error) {
    Alert.alert('Error', 'Failed to sign out');
  }
};

// Auth-related styles
loadingContainer: {
  flex: 1,
  justifyContent: 'center',
  alignItems: 'center',
  backgroundColor: '#F5F8FA',
},
loadingText: {
  marginTop: 16,
  fontSize: 16,
  color: '#666',
},
headerRow: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  width: '100%',
  paddingBottom: 16,
},
signOutButton: {
  flexDirection: 'row',
  alignItems: 'center',
  backgroundColor: 'rgba(255, 255, 255, 0.2)',
  paddingHorizontal: 12,
  paddingVertical: 8,
  borderRadius: 20,
  gap: 6,
},
signOutText: {
  color: '#FFFFFF',
  fontSize: 14,
  fontWeight: '500',
},
welcomeText: {
  color: '#D1D5DB',
  fontSize: 14,
  textAlign: 'center',
  marginTop: 8,
},
