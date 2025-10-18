import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, FlatList } from 'react-native';
import { Card, Title, Paragraph, Button, Text, Appbar, Chip } from 'react-native-paper';
import { useAuth } from '../../components/auth/AuthProvider';
import PollCard from '../../components/poll/PollCard';

interface Poll {
  id: string;
  title: string;
  description: string;
  category: string;
  optionA: string;
  optionB: string;
  votesA: number;
  votesB: number;
  totalVotes: number;
  author: string;
  timeLeft: string;
  isVoted: boolean;
}

const HomeScreen: React.FC = () => {
  const { user, logout } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Sample polls data
  const [polls, setPolls] = useState<Poll[]>([
    {
      id: '1',
      title: 'Best Programming Language?',
      description: 'Which programming language do you prefer for mobile development?',
      category: 'Technology',
      optionA: 'React Native',
      optionB: 'Flutter',
      votesA: 45,
      votesB: 32,
      totalVotes: 77,
      author: 'TechGuru',
      timeLeft: '2 days left',
      isVoted: false,
    },
    {
      id: '2',
      title: 'Coffee vs Tea',
      description: 'What\'s your preferred morning beverage?',
      category: 'Lifestyle',
      optionA: 'Coffee',
      optionB: 'Tea',
      votesA: 28,
      votesB: 19,
      totalVotes: 47,
      author: 'CoffeeLover',
      timeLeft: '5 hours left',
      isVoted: true,
    },
    {
      id: '3',
      title: 'Remote vs Office Work',
      description: 'Where do you prefer to work?',
      category: 'Work',
      optionA: 'Remote',
      optionB: 'Office',
      votesA: 67,
      votesB: 23,
      totalVotes: 90,
      author: 'WorkLife',
      timeLeft: '1 day left',
      isVoted: false,
    },
  ]);

  const categories = ['All', 'Technology', 'Lifestyle', 'Work', 'Sports', 'Entertainment'];

  const handleLogout = async () => {
    await logout();
  };

  const handleVote = async (pollId: string, option: 'A' | 'B') => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    
    setPolls(prevPolls => 
      prevPolls.map(poll => {
        if (poll.id === pollId) {
          return {
            ...poll,
            isVoted: true,
            votesA: option === 'A' ? poll.votesA + 1 : poll.votesA,
            votesB: option === 'B' ? poll.votesB + 1 : poll.votesB,
            totalVotes: poll.totalVotes + 1,
          };
        }
        return poll;
      })
    );
  };

  const filteredPolls = selectedCategory === 'All' 
    ? polls 
    : polls.filter(poll => poll.category === selectedCategory);

  const renderPoll = ({ item }: { item: Poll }) => (
    <PollCard poll={item} onVote={handleVote} />
  );

  return (
    <View style={styles.container}>
      <Appbar.Header style={styles.header}>
        <Appbar.Content title="Pollz" titleStyle={styles.headerTitle} />
        <Appbar.Action icon="logout" onPress={handleLogout} />
      </Appbar.Header>
      
      <ScrollView style={styles.content}>
        <Card style={styles.welcomeCard}>
          <Card.Content>
            <Title style={styles.welcomeTitle}>Welcome back!</Title>
            <Paragraph style={styles.welcomeText}>
              Hello, {user?.name || 'User'}! Discover and vote on interesting polls.
            </Paragraph>
          </Card.Content>
        </Card>

        <View style={styles.categoriesContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {categories.map((category) => (
              <Chip
                key={category}
                selected={selectedCategory === category}
                onPress={() => setSelectedCategory(category)}
                style={[
                  styles.categoryChip,
                  selectedCategory === category && styles.selectedChip
                ]}
                textStyle={[
                  styles.categoryText,
                  selectedCategory === category && styles.selectedCategoryText
                ]}
              >
                {category}
              </Chip>
            ))}
          </ScrollView>
        </View>

        <View style={styles.pollsSection}>
          <Title style={styles.sectionTitle}>
            {selectedCategory === 'All' ? 'All Polls' : `${selectedCategory} Polls`}
          </Title>
          <Text style={styles.pollCount}>
            {filteredPolls.length} poll{filteredPolls.length !== 1 ? 's' : ''}
          </Text>
        </View>

        <FlatList
          data={filteredPolls}
          renderItem={renderPoll}
          keyExtractor={(item) => item.id}
          scrollEnabled={false}
          showsVerticalScrollIndicator={false}
        />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    backgroundColor: '#667eea',
  },
  headerTitle: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  welcomeCard: {
    marginBottom: 16,
    backgroundColor: '#667eea',
  },
  welcomeTitle: {
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 8,
  },
  welcomeText: {
    color: '#ffffff',
    textAlign: 'center',
    opacity: 0.9,
  },
  categoriesContainer: {
    marginBottom: 16,
  },
  categoryChip: {
    marginRight: 8,
    backgroundColor: '#e8edff',
  },
  selectedChip: {
    backgroundColor: '#667eea',
  },
  categoryText: {
    color: '#667eea',
  },
  selectedCategoryText: {
    color: '#ffffff',
  },
  pollsSection: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  pollCount: {
    fontSize: 14,
    color: '#666',
  },
});

export default HomeScreen;