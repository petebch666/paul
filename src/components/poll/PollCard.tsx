import React, { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { Card, Title, Paragraph, Button, Text, Chip, ProgressBar } from 'react-native-paper';

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

interface PollCardProps {
  poll: Poll;
  onVote: (pollId: string, option: 'A' | 'B') => void;
}

const PollCard: React.FC<PollCardProps> = ({ poll, onVote }) => {
  const [voting, setVoting] = useState(false);

  const handleVote = async (option: 'A' | 'B') => {
    if (poll.isVoted) {
      Alert.alert('Already Voted', 'You have already voted on this poll');
      return;
    }

    setVoting(true);
    try {
      await onVote(poll.id, option);
      Alert.alert('Success', `You voted for option ${option}!`);
    } catch (error) {
      Alert.alert('Error', 'Failed to vote. Please try again.');
    } finally {
      setVoting(false);
    }
  };

  const getPercentageA = () => {
    if (poll.totalVotes === 0) return 0;
    return (poll.votesA / poll.totalVotes) * 100;
  };

  const getPercentageB = () => {
    if (poll.totalVotes === 0) return 0;
    return (poll.votesB / poll.totalVotes) * 100;
  };

  return (
    <Card style={styles.card}>
      <Card.Content>
        <View style={styles.header}>
          <Chip style={styles.categoryChip} textStyle={styles.categoryText}>
            {poll.category}
          </Chip>
          <Text style={styles.timeLeft}>{poll.timeLeft}</Text>
        </View>
        
        <Title style={styles.title}>{poll.title}</Title>
        <Paragraph style={styles.description}>{poll.description}</Paragraph>
        
        <Text style={styles.author}>By {poll.author}</Text>
        
        <View style={styles.votingSection}>
          <View style={styles.optionContainer}>
            <Button
              mode={poll.isVoted ? "outlined" : "contained"}
              onPress={() => handleVote('A')}
              disabled={voting || poll.isVoted}
              style={[styles.voteButton, poll.isVoted && styles.votedButton]}
              loading={voting}
            >
              {poll.optionA}
            </Button>
            {poll.isVoted && (
              <View style={styles.resultsContainer}>
                <Text style={styles.voteCount}>{poll.votesA} votes</Text>
                <ProgressBar 
                  progress={getPercentageA() / 100} 
                  color="#667eea" 
                  style={styles.progressBar}
                />
                <Text style={styles.percentage}>{getPercentageA().toFixed(1)}%</Text>
              </View>
            )}
          </View>
          
          <Text style={styles.vsText}>VS</Text>
          
          <View style={styles.optionContainer}>
            <Button
              mode={poll.isVoted ? "outlined" : "contained"}
              onPress={() => handleVote('B')}
              disabled={voting || poll.isVoted}
              style={[styles.voteButton, poll.isVoted && styles.votedButton]}
              loading={voting}
            >
              {poll.optionB}
            </Button>
            {poll.isVoted && (
              <View style={styles.resultsContainer}>
                <Text style={styles.voteCount}>{poll.votesB} votes</Text>
                <ProgressBar 
                  progress={getPercentageB() / 100} 
                  color="#764ba2" 
                  style={styles.progressBar}
                />
                <Text style={styles.percentage}>{getPercentageB().toFixed(1)}%</Text>
              </View>
            )}
          </View>
        </View>
        
        {poll.isVoted && (
          <Text style={styles.totalVotes}>
            Total votes: {poll.totalVotes}
          </Text>
        )}
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: 16,
    elevation: 2,
    borderRadius: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryChip: {
    backgroundColor: '#e8edff',
  },
  categoryText: {
    color: '#667eea',
    fontSize: 12,
    fontWeight: '600',
  },
  timeLeft: {
    color: '#666',
    fontSize: 12,
    fontStyle: 'italic',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
    lineHeight: 20,
  },
  author: {
    fontSize: 12,
    color: '#999',
    marginBottom: 16,
    fontStyle: 'italic',
  },
  votingSection: {
    marginTop: 8,
  },
  optionContainer: {
    marginBottom: 12,
  },
  voteButton: {
    marginBottom: 8,
  },
  votedButton: {
    opacity: 0.7,
  },
  vsText: {
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
    color: '#667eea',
    marginVertical: 8,
  },
  resultsContainer: {
    marginTop: 8,
  },
  voteCount: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
    marginBottom: 4,
  },
  percentage: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'right',
  },
  totalVotes: {
    textAlign: 'center',
    fontSize: 12,
    color: '#999',
    marginTop: 12,
    fontStyle: 'italic',
  },
});

export default PollCard;
