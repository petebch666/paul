import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Card, Title, Paragraph, Button, TextInput, Chip } from 'react-native-paper';

const CreateScreen: React.FC = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [optionA, setOptionA] = useState('');
  const [optionB, setOptionB] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('General');
  const [loading, setLoading] = useState(false);

  const categories = ['General', 'Technology', 'Lifestyle', 'Work', 'Sports', 'Entertainment'];

  const handleCreatePoll = async () => {
    if (!title.trim() || !optionA.trim() || !optionB.trim()) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    if (optionA.trim() === optionB.trim()) {
      Alert.alert('Error', 'Options must be different');
      return;
    }

    setLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      Alert.alert('Success', 'Poll created successfully!');
      
      // Reset form
      setTitle('');
      setDescription('');
      setOptionA('');
      setOptionB('');
      setSelectedCategory('General');
    } catch (error) {
      Alert.alert('Error', 'Failed to create poll. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.title}>Create New Poll</Title>
          <Paragraph style={styles.subtitle}>
            Share your question with the community
          </Paragraph>
          
          <TextInput
            label="Poll Title *"
            value={title}
            onChangeText={setTitle}
            mode="outlined"
            style={styles.input}
            placeholder="What's your question?"
            disabled={loading}
          />
          
          <TextInput
            label="Description (Optional)"
            value={description}
            onChangeText={setDescription}
            mode="outlined"
            multiline
            numberOfLines={3}
            style={styles.input}
            placeholder="Add more context to your poll..."
            disabled={loading}
          />
          
          <View style={styles.categorySection}>
            <Paragraph style={styles.categoryLabel}>Category</Paragraph>
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
          
          <TextInput
            label="Option A *"
            value={optionA}
            onChangeText={setOptionA}
            mode="outlined"
            style={styles.input}
            placeholder="First option"
            disabled={loading}
          />
          
          <TextInput
            label="Option B *"
            value={optionB}
            onChangeText={setOptionB}
            mode="outlined"
            style={styles.input}
            placeholder="Second option"
            disabled={loading}
          />
          
          <Button
            mode="contained"
            onPress={handleCreatePoll}
            loading={loading}
            disabled={loading}
            style={styles.createButton}
          >
            Create Poll
          </Button>
          
          <Paragraph style={styles.helpText}>
            * Required fields. Your poll will be visible to all users.
          </Paragraph>
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
  card: {
    margin: 16,
    elevation: 4,
    borderRadius: 12,
  },
  title: {
    textAlign: 'center',
    marginBottom: 8,
    color: '#667eea',
    fontSize: 24,
    fontWeight: 'bold',
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: 24,
    color: '#666',
    fontSize: 16,
  },
  input: {
    marginBottom: 16,
    backgroundColor: '#ffffff',
  },
  categorySection: {
    marginBottom: 16,
  },
  categoryLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
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
  createButton: {
    marginTop: 8,
    marginBottom: 16,
    paddingVertical: 8,
  },
  helpText: {
    textAlign: 'center',
    color: '#999',
    fontSize: 12,
    fontStyle: 'italic',
  },
});

export default CreateScreen;