import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Card, Title, Paragraph, Button, Text, Avatar, Divider } from 'react-native-paper';
import { useAuth } from '../../components/auth/AuthProvider';

const ProfileScreen: React.FC = () => {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.profileCard}>
        <Card.Content style={styles.profileContent}>
          <Avatar.Text 
            size={80} 
            label={user?.name?.charAt(0) || 'U'} 
            style={styles.avatar}
          />
          <Title style={styles.name}>{user?.name || 'User'}</Title>
          <Paragraph style={styles.email}>{user?.email}</Paragraph>
          <Text style={styles.username}>@{user?.username}</Text>
        </Card.Content>
      </Card>

      <Card style={styles.statsCard}>
        <Card.Content>
          <Title style={styles.statsTitle}>Your Stats</Title>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>12</Text>
              <Text style={styles.statLabel}>Polls Created</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>89</Text>
              <Text style={styles.statLabel}>Votes Cast</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>67%</Text>
              <Text style={styles.statLabel}>Win Rate</Text>
            </View>
          </View>
        </Card.Content>
      </Card>

      <Card style={styles.achievementsCard}>
        <Card.Content>
          <Title style={styles.achievementsTitle}>Achievements</Title>
          <View style={styles.achievementItem}>
            <Text style={styles.achievementIcon}>🏆</Text>
            <View style={styles.achievementText}>
              <Text style={styles.achievementName}>First Poll</Text>
              <Text style={styles.achievementDesc}>Created your first poll</Text>
            </View>
          </View>
          <View style={styles.achievementItem}>
            <Text style={styles.achievementIcon}>🎯</Text>
            <View style={styles.achievementText}>
              <Text style={styles.achievementName}>Popular Choice</Text>
              <Text style={styles.achievementDesc}>Won 10 polls</Text>
            </View>
          </View>
          <View style={styles.achievementItem}>
            <Text style={styles.achievementIcon}>🔥</Text>
            <View style={styles.achievementText}>
              <Text style={styles.achievementName}>Hot Streak</Text>
              <Text style={styles.achievementDesc}>5 wins in a row</Text>
            </View>
          </View>
        </Card.Content>
      </Card>

      <Card style={styles.settingsCard}>
        <Card.Content>
          <Title style={styles.settingsTitle}>Settings</Title>
          <Button
            mode="outlined"
            onPress={() => {}}
            style={styles.settingButton}
            icon="cog"
          >
            Account Settings
          </Button>
          <Button
            mode="outlined"
            onPress={() => {}}
            style={styles.settingButton}
            icon="bell"
          >
            Notifications
          </Button>
          <Button
            mode="outlined"
            onPress={() => {}}
            style={styles.settingButton}
            icon="help"
          >
            Help & Support
          </Button>
        </Card.Content>
      </Card>

      <Card style={styles.logoutCard}>
        <Card.Content>
          <Button
            mode="contained"
            onPress={handleLogout}
            style={styles.logoutButton}
            buttonColor="#f5576c"
            icon="logout"
          >
            Sign Out
          </Button>
        </Card.Content>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  profileCard: {
    margin: 16,
    marginBottom: 8,
    elevation: 2,
  },
  profileContent: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  avatar: {
    backgroundColor: '#667eea',
    marginBottom: 16,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  email: {
    fontSize: 16,
    color: '#666',
    marginBottom: 4,
  },
  username: {
    fontSize: 14,
    color: '#999',
    fontStyle: 'italic',
  },
  statsCard: {
    margin: 16,
    marginVertical: 8,
    elevation: 2,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#667eea',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  achievementsCard: {
    margin: 16,
    marginVertical: 8,
    elevation: 2,
  },
  achievementsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  achievementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  achievementIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  achievementText: {
    flex: 1,
  },
  achievementName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  achievementDesc: {
    fontSize: 14,
    color: '#666',
  },
  settingsCard: {
    margin: 16,
    marginVertical: 8,
    elevation: 2,
  },
  settingsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  settingButton: {
    marginBottom: 8,
  },
  logoutCard: {
    margin: 16,
    marginTop: 8,
    elevation: 2,
  },
  logoutButton: {
    marginVertical: 8,
  },
});

export default ProfileScreen;