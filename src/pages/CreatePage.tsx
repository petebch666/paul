import React, { useState } from 'react'
import { CreatePollFormData } from '../types'
import '../pages/CreatePage.css'

interface CreatePageProps {
  onCreatePoll: (pollData: CreatePollFormData) => void
}

const CreatePage: React.FC<CreatePageProps> = ({ onCreatePoll }) => {
  const [formData, setFormData] = useState<CreatePollFormData>({
    title: '',
    description: '',
    category: '',
    optionA: '',
    optionB: '',
    timeLimit: 24,
    context: ''
  })

  const [categorySuggestions, setCategorySuggestions] = useState<Array<{
    category: string
    confidence: number
    keywords: string[]
  }>>([])

  const [duplicateCheck, setDuplicateCheck] = useState<{
    hasDuplicates: boolean
    similarPolls: Array<{
      id: string
      title: string
      similarity: number
      author: string
    }>
  }>({ hasDuplicates: false, similarPolls: [] })

  const categories = ['Food', 'Animals', 'Lifestyle', 'Technology', 'Social', 'Work', 'Entertainment', 'Sports']

  const handleInputChange = (field: keyof CreatePollFormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    // Auto-categorization when question changes
    if (field === 'title' && typeof value === 'string' && value.length > 10) {
      handleQuestionChange(value)
    }
  }

  const handleQuestionChange = (question: string) => {
    // Mock auto-categorization
    const suggestions = categories
      .map(category => ({
        category,
        confidence: Math.random() * 100,
        keywords: [category.toLowerCase()]
      }))
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 3)
    
    setCategorySuggestions(suggestions)
    console.log('🤖 Auto-categorization triggered:', suggestions)
  }

  const handlePollCheck = () => {
    if (formData.title && formData.optionA && formData.optionB) {
      // Mock duplicate check
      const duplicateResult = {
        hasDuplicates: Math.random() > 0.7,
        similarPolls: Math.random() > 0.7 ? [
          {
            id: '1',
            title: 'Similar poll example',
            similarity: 85,
            author: 'SomeUser'
          }
        ] : []
      }
      setDuplicateCheck(duplicateResult)
      console.log('🔍 Duplicate check triggered:', duplicateResult)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (formData.title && formData.optionA && formData.optionB && formData.category) {
      onCreatePoll(formData)
      // Reset form
      setFormData({
        title: '',
        description: '',
        category: '',
        optionA: '',
        optionB: '',
        timeLimit: 24,
        context: ''
      })
      setCategorySuggestions([])
      setDuplicateCheck({ hasDuplicates: false, similarPolls: [] })
    }
  }

  return (
    <div className="create-page">
      <div className="page-header">
        <h1 className="pixelated">CREATE POLL</h1>
        <p>SETTLE THE ARGUMENT ONCE AND FOR ALL</p>
      </div>

      <div className="create-content">
        <div className="create-form-section">
          <form onSubmit={handleSubmit} className="create-form">
            <div className="form-group">
              <label htmlFor="title">POLL QUESTION</label>
              <input
                type="text"
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="What's the burning question?"
                required
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label htmlFor="description">DESCRIPTION (OPTIONAL)</label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Add some context..."
                className="form-textarea"
                rows={3}
              />
            </div>

            <div className="options-group">
              <div className="form-group">
                <label htmlFor="optionA">OPTION A</label>
                <input
                  type="text"
                  id="optionA"
                  value={formData.optionA}
                  onChange={(e) => handleInputChange('optionA', e.target.value)}
                  placeholder="First choice"
                  required
                  className="form-input"
                />
              </div>

              <div className="vs-divider">VS</div>

              <div className="form-group">
                <label htmlFor="optionB">OPTION B</label>
                <input
                  type="text"
                  id="optionB"
                  value={formData.optionB}
                  onChange={(e) => handleInputChange('optionB', e.target.value)}
                  placeholder="Second choice"
                  required
                  className="form-input"
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="context">CONTEXT (OPTIONAL)</label>
              <textarea
                id="context"
                value={formData.context}
                onChange={(e) => handleInputChange('context', e.target.value)}
                placeholder="Why is this important to you?"
                className="form-textarea"
                rows={2}
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="category">CATEGORY</label>
                <select
                  id="category"
                  value={formData.category}
                  onChange={(e) => handleInputChange('category', e.target.value)}
                  required
                  className="form-select"
                >
                  <option value="">Select Category</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="timeLimit">TIME LIMIT (HOURS)</label>
                <select
                  id="timeLimit"
                  value={formData.timeLimit}
                  onChange={(e) => handleInputChange('timeLimit', parseInt(e.target.value))}
                  className="form-select"
                >
                  <option value={1}>1 Hour</option>
                  <option value={6}>6 Hours</option>
                  <option value={24}>24 Hours</option>
                  <option value={72}>3 Days</option>
                  <option value={168}>1 Week</option>
                </select>
              </div>
            </div>

            <div className="form-actions">
              <button type="button" onClick={handlePollCheck} className="check-duplicate-btn">
                Check for Duplicates
              </button>
              <button type="submit" className="submit-btn">
                CREATE POLL
              </button>
            </div>
          </form>
        </div>

        <div className="smart-features-section">
          {categorySuggestions.length > 0 && (
            <div className="category-suggestions">
              <h3>Category Suggestions</h3>
              <div className="suggestions-list">
                {categorySuggestions.map((suggestion, index) => (
                  <div key={index} className="suggestion-item">
                    <span className="suggestion-category">{suggestion.category}</span>
                    <span className="confidence">{Math.round(suggestion.confidence)}%</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {duplicateCheck.hasDuplicates && (
            <div className="duplicate-warning">
              <h3>⚠️ Similar Polls Found</h3>
              <div className="similar-polls">
                {duplicateCheck.similarPolls.map((poll, index) => (
                  <div key={index} className="similar-poll-item">
                    <span className="similar-title">{poll.title}</span>
                    <span className="similar-author">by {poll.author}</span>
                    <span className="similarity">{poll.similarity}% similar</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default CreatePage

