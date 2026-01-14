import React, { useState, useRef, useEffect } from 'react'
import { 
  IonPage, 
  IonHeader, 
  IonToolbar, 
  IonTitle, 
  IonContent,
  IonIcon,
  IonSpinner,
  IonRefresher,
  IonRefresherContent
} from '@ionic/react'
import { useIonRouter } from '@ionic/react'
import { 
  chevronDownCircleOutline,
  createOutline,
  flame,
  timeOutline,
  notificationsOutline,
  checkmarkCircleOutline,
  shieldOutline
} from 'ionicons/icons'
import { CreatePollFormData, User } from '../types'
import UnifiedPollzAPI from '../database/unified-api'
import UserSearchInput from '../components/UserSearchInput'
import { useAuth } from '../hooks/useAuth'
import './CreatePage.css'

const PollzAPI = UnifiedPollzAPI

interface CreatePageProps {
  onCreatePoll: (pollData: CreatePollFormData) => Promise<any>
}

const CreatePage: React.FC<CreatePageProps> = ({ onCreatePoll }) => {
  const contentRef = useRef<HTMLIonContentElement>(null)
  const { user } = useAuth()
  const router = useIonRouter()
  
  const [formData, setFormData] = useState<CreatePollFormData>({
    title: '',
    description: '',
    category: '',
    optionA: '',
    optionB: '',
    timeLimit: 24,
    context: '',
    // Enhanced poll creation
    pollType: 'question',
    timerEnabled: true,
    timerDuration: 24, // hours
    notificationEnabled: true,
    // Deathmatch options
    isDeathmatch: false,
    isShadowDeathmatch: false,
    optionAUserId: undefined,
    optionBUserId: undefined
  })
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [opponentA, setOpponentA] = useState<User | null>(null)
  const [opponentB, setOpponentB] = useState<User | null>(null)

  // Load opponent data when user IDs are set
  useEffect(() => {
    const loadOpponents = async () => {
      if (formData.optionAUserId) {
        const user = await PollzAPI.getUserById(formData.optionAUserId)
        setOpponentA(user || null)
      } else {
        setOpponentA(null)
      }

      if (formData.optionBUserId) {
        const user = await PollzAPI.getUserById(formData.optionBUserId)
        setOpponentB(user || null)
      } else {
        setOpponentB(null)
      }
    }
    loadOpponents()
  }, [formData.optionAUserId, formData.optionBUserId])

  // Handle pull-to-refresh
  const handleRefresh = async (event: CustomEvent) => {
    console.log('🔄 Refreshing form...')
    // Reset form
    setFormData({
      title: '',
      description: '',
      category: '',
      optionA: '',
      optionB: '',
      timeLimit: 24,
      context: '',
      pollType: 'question',
      timerEnabled: true,
      timerDuration: 24,
      notificationEnabled: true,
      isDeathmatch: false,
      optionAUserId: undefined,
      optionBUserId: undefined
    })
    setCategorySuggestions([])
    setDuplicateCheck({ hasDuplicates: false, similarPolls: [] })
    event.detail.complete()
  }

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

  const handleInputChange = (field: keyof CreatePollFormData, value: string | number | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    // Auto-categorization when question changes
    if (field === 'title' && typeof value === 'string' && value.length > 10) {
      handleQuestionChange(value)
    }
  }

  const handleQuestionChange = async (question: string) => {
    try {
      const suggestions = await PollzAPI.getCategorySuggestions(question)
      setCategorySuggestions(suggestions)
      console.log('🤖 Auto-categorization triggered:', suggestions)
    } catch (error) {
      console.error('Error getting category suggestions:', error)
    }
  }

  const handlePollCheck = async () => {
    if (formData.title && formData.optionA && formData.optionB) {
      try {
        const duplicateResult = await PollzAPI.checkForDuplicates(
          formData.title, 
          formData.optionA, 
          formData.optionB
        )
        setDuplicateCheck(duplicateResult)
        console.log('🔍 Duplicate check triggered:', duplicateResult)
      } catch (error) {
        console.error('Error checking duplicates:', error)
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validation: For deathmatch, both users must be assigned
    if (formData.isDeathmatch && (!formData.optionAUserId || !formData.optionBUserId)) {
      alert('⚠️ DEATHMATCH POLL REQUIRES BOTH OPTIONS TO HAVE ASSIGNED USERS!\n\nPlease assign a user to both Option A and Option B.')
      return
    }
    
    // Validation: Prevent same user on both options
    if (formData.isDeathmatch && formData.optionAUserId && formData.optionBUserId && formData.optionAUserId === formData.optionBUserId) {
      alert('⚠️ INVALID ASSIGNMENT!\n\nA user cannot be assigned to both options. Please choose different users.')
      return
    }
    
    if (formData.title && formData.optionA && formData.optionB && formData.category && !isSubmitting) {
      setIsSubmitting(true)
      try {
        await onCreatePoll(formData)
        // Reset form only after successful creation
        setFormData({
          title: '',
          description: '',
          category: '',
          optionA: '',
          optionB: '',
          timeLimit: 24,
          context: '',
          pollType: 'question',
          timerEnabled: true,
          timerDuration: 24,
          notificationEnabled: true,
          isDeathmatch: false,
          isShadowDeathmatch: false,
          optionAUserId: undefined,
          optionBUserId: undefined
        })
        setOpponentA(null)
        setOpponentB(null)
        setCategorySuggestions([])
        setDuplicateCheck({ hasDuplicates: false, similarPolls: [] })
        
        // Show validation pending message
        alert('✅ Poll created successfully!\n\n⏳ Your poll is now pending AI validation. It will be reviewed to ensure it meets our content guidelines (humorous polls only, no country battles, no sexist content, no political content).\n\nYou will be notified once validation is complete.')
        
        // Navigate to home page after successful poll creation
        router.push('/home', 'forward', 'replace')
      } catch (error) {
        console.error('Failed to create poll:', error)
        // Error handling is done in useAppState
      } finally {
        setIsSubmitting(false)
      }
    }
  }

  return (
    <IonPage>
      <IonHeader className="ion-no-border">
        <IonToolbar style={{ 
          '--border-width': '0',
          '--border-style': 'none'
        }}>
          <IonTitle style={{
            fontFamily: 'Courier New, monospace',
            fontSize: '32px',
            fontWeight: '900',
            letterSpacing: '4px',
            textAlign: 'center'
          }}>
            CREATE
          </IonTitle>
        </IonToolbar>
      </IonHeader>
      
      <IonContent ref={contentRef} fullscreen className="create-page">
        {/* Pull to Refresh */}
        <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
          <IonRefresherContent
            pullingIcon={chevronDownCircleOutline}
            pullingText="Pull to reset form"
            refreshingSpinner="circles"
            refreshingText="Resetting form..."
          />
        </IonRefresher>

        {/* Modern Form Container */}
        <div className="create-page-container">
          {/* Mode Selector - At the Top */}
          <div className="mode-selector-section">
            <div className="mode-selector">
              <button
                type="button"
                className={`mode-button ${!formData.isDeathmatch ? 'active' : ''}`}
                onClick={() => {
                  setFormData(prev => ({
                    ...prev,
                    isDeathmatch: false,
                    optionAUserId: undefined,
                    optionBUserId: undefined
                  }))
                  setOpponentA(null)
                  setOpponentB(null)
                }}
              >
                <IonIcon icon={createOutline} />
                <span>NORMAL POLL</span>
              </button>
              <button
                type="button"
                className={`mode-button ${formData.isDeathmatch ? 'active' : ''}`}
                onClick={() => {
                  setFormData(prev => ({
                    ...prev,
                    isDeathmatch: true
                  }))
                }}
              >
                <IonIcon icon={shieldOutline} />
                <span>🥊 DEATHMATCH</span>
              </button>
            </div>
            {formData.isDeathmatch && (
              <>
                <div className="deathmatch-info-top">
                  Choose your opponent first, then create the poll question and options
                </div>
                {/* Shadow Deathmatch Toggle */}
                <div className="form-section" style={{ marginTop: '12px' }}>
                  <button
                    type="button"
                    className={`shadow-deathmatch-toggle ${formData.isShadowDeathmatch ? 'active' : ''}`}
                    onClick={() => setFormData(prev => ({ ...prev, isShadowDeathmatch: !prev.isShadowDeathmatch }))}
                  >
                    <IonIcon icon={shieldOutline} className="toggle-icon" />
                    <span>{formData.isShadowDeathmatch ? '🔒 SHADOW MODE ON' : '🔓 REVEAL MODE'}</span>
                  </button>
                  {formData.isShadowDeathmatch && (
                    <div className="shadow-deathmatch-info">
                      Usernames will be hidden until the poll expires. Perfect for anonymous debates!
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          <form onSubmit={handleSubmit} className="modern-form">
            {/* Deathmatch: Opponent Selection FIRST */}
            {formData.isDeathmatch && (
              <>
                <div className="vs-divider-modern">
                  <span>STEP 1: CHOOSE OPPONENTS</span>
                </div>

                <div className="opponent-selection-grid">
                  {/* Opponent A */}
                  <div className="opponent-card">
                    <div className="opponent-label">OPPONENT A</div>
                    <UserSearchInput
                      label="SEARCH USER"
                      value={formData.optionAUserId}
                      onChange={async (userId) => {
                        setFormData(prev => ({ ...prev, optionAUserId: userId }))
                        if (userId) {
                          const user = await PollzAPI.getUserById(userId)
                          setOpponentA(user || null)
                        } else {
                          setOpponentA(null)
                        }
                      }}
                      placeholder="@username or name"
                      excludeUserId={formData.optionBUserId}
                    />
                    {formData.optionAUserId && (
                      <div className="option-preview">
                        Will defend: <strong>Option A</strong>
                      </div>
                    )}
                  </div>

                  {/* VS Divider for Opponents */}
                  <div className="opponent-vs">
                    <span>VS</span>
                  </div>

                  {/* Opponent B */}
                  <div className="opponent-card">
                    <div className="opponent-label">OPPONENT B</div>
                    <UserSearchInput
                      label="SEARCH USER"
                      value={formData.optionBUserId}
                      onChange={async (userId) => {
                        setFormData(prev => ({ ...prev, optionBUserId: userId }))
                        if (userId) {
                          const user = await PollzAPI.getUserById(userId)
                          setOpponentB(user || null)
                        } else {
                          setOpponentB(null)
                        }
                      }}
                      placeholder="@username or name"
                      excludeUserId={formData.optionAUserId}
                    />
                    {formData.optionBUserId && (
                      <div className="option-preview">
                        Will defend: <strong>Option B</strong>
                      </div>
                    )}
                  </div>
        </div>

                {/* Only show question/options if both opponents selected */}
                {formData.optionAUserId && formData.optionBUserId && (
                  <>
                    <div className="vs-divider-modern">
                      <span>STEP 2: CREATE THE POLL</span>
                    </div>
                  </>
                )}
              </>
            )}

            {/* Question Input */}
            <div className="form-section">
              <div className="form-label">
                <IonIcon icon={createOutline} className="label-icon" />
                <span>POLL QUESTION</span>
              </div>
              <input
                type="text"
                className="modern-input"
                  value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder={formData.isDeathmatch ? "What will they debate?" : "What's the burning question?"}
                  required
                disabled={formData.isDeathmatch && (!formData.optionAUserId || !formData.optionBUserId)}
              />
              {formData.isDeathmatch && (!formData.optionAUserId || !formData.optionBUserId) && (
                <div className="field-hint">⏳ Select both opponents first</div>
              )}
            </div>

            {/* Description Input */}
            <div className="form-section">
              <div className="form-label">
                <IonIcon icon={createOutline} className="label-icon" />
                <span>DESCRIPTION (OPTIONAL)</span>
              </div>
              <textarea
                className="modern-textarea"
                  value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Add some context..."
                rows={2}
                disabled={formData.isDeathmatch && (!formData.optionAUserId || !formData.optionBUserId)}
              />
            </div>

            {/* VS Divider */}
            {!formData.isDeathmatch && (
              <div className="vs-divider-modern">
                <span>OPTIONS</span>
              </div>
            )}

            {/* Smart Option Assignment for Deathmatch */}
            {formData.isDeathmatch && formData.optionAUserId && formData.optionBUserId ? (
              <div className="deathmatch-options-container">
                <div className="deathmatch-options-grid">
                  {/* Option A Card with Opponent */}
                  <div className="option-card-with-opponent">
                    {opponentA && (
                      <div className="opponent-badge">
                        <img 
                          src={opponentA.avatar} 
                          alt={opponentA.name} 
                          className="opponent-avatar-small"
                        />
                        <span className="opponent-name-small">{opponentA.name}</span>
                        <span className="defends-label">defends</span>
                      </div>
                    )}
                    <div className="form-section-small">
                      <div className="form-label-small">OPTION A</div>
                      <input
                        type="text"
                        className="modern-input"
                        value={formData.optionA}
                        onChange={(e) => handleInputChange('optionA', e.target.value)}
                        placeholder={opponentA ? `${opponentA.name}'s position` : "First choice"}
                        required
                      />
                    </div>
                  </div>

                  {/* VS Divider */}
                  <div className="vs-divider-compact">
                    <span>VS</span>
                  </div>

                  {/* Option B Card with Opponent */}
                  <div className="option-card-with-opponent">
                    {opponentB && (
                      <div className="opponent-badge">
                        <img 
                          src={opponentB.avatar} 
                          alt={opponentB.name} 
                          className="opponent-avatar-small"
                        />
                        <span className="opponent-name-small">{opponentB.name}</span>
                        <span className="defends-label">defends</span>
                      </div>
                    )}
                    <div className="form-section-small">
                      <div className="form-label-small">OPTION B</div>
                      <input
                        type="text"
                        className="modern-input"
                        value={formData.optionB}
                        onChange={(e) => handleInputChange('optionB', e.target.value)}
                        placeholder={opponentB ? `${opponentB.name}'s position` : "Second choice"}
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <>
                {/* Normal Mode Options */}
                {!formData.isDeathmatch && (
                  <>
                    {/* Option A */}
                    <div className="form-section">
                      <div className="form-label-small">OPTION A</div>
                      <input
                        type="text"
                        className="modern-input"
                    value={formData.optionA}
                        onChange={(e) => handleInputChange('optionA', e.target.value)}
                    placeholder="First choice"
                    required
                  />
                    </div>

                    {/* VS Text */}
                    <div className="vs-text">
                      <span>VS</span>
                </div>

                    {/* Option B */}
                    <div className="form-section">
                      <div className="form-label-small">OPTION B</div>
                      <input
                        type="text"
                        className="modern-input"
                    value={formData.optionB}
                        onChange={(e) => handleInputChange('optionB', e.target.value)}
                    placeholder="Second choice"
                    required
                  />
              </div>
                  </>
                )}
              </>
            )}

            {/* Context Input */}
            <div className="form-section">
              <div className="form-label-small">CONTEXT (OPTIONAL)</div>
              <textarea
                className="modern-textarea"
                  value={formData.context}
                onChange={(e) => handleInputChange('context', e.target.value)}
                  placeholder="Why is this important to you?"
                  rows={2}
                />
                </div>

            {/* Settings Grid */}
            <div className="settings-grid">
              {/* Category */}
              <div className="form-section-small">
                <div className="form-label-small">CATEGORY</div>
                <select
                  className="modern-select"
                  value={formData.category}
                  onChange={(e) => handleInputChange('category', e.target.value)}
                  required
                >
                  <option value="">Select Category</option>
                  {categories.map(category => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              {/* Time Limit */}
              <div className="form-section-small">
                <div className="form-label-small">TIME LIMIT</div>
                <select
                  className="modern-select"
                  value={formData.timeLimit}
                  onChange={(e) => handleInputChange('timeLimit', parseInt(e.target.value))}
                >
                  <option value={1}>1 Hour</option>
                  <option value={6}>6 Hours</option>
                  <option value={24}>24 Hours</option>
                  <option value={72}>3 Days</option>
                  <option value={168}>1 Week</option>
                </select>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="form-actions-modern">
              <button
                type="button"
                className="btn-secondary"
                  onClick={handlePollCheck}
                >
                  CHECK DUPLICATES
              </button>
              <button
                  type="submit"
                className="btn-primary"
                disabled={
                  !formData.title || 
                  !formData.optionA || 
                  !formData.optionB || 
                  !formData.category || 
                  isSubmitting ||
                  (formData.isDeathmatch && (!formData.optionAUserId || !formData.optionBUserId))
                }
              >
                {isSubmitting ? (
                  <>
                    <IonSpinner name="circular" style={{ marginRight: '8px' }} />
                    CREATING...
                  </>
                ) : (
                  <>
                    <IonIcon icon={checkmarkCircleOutline} style={{ marginRight: '8px' }} />
                  CREATE POLL
                  </>
                )}
              </button>
              </div>
            </form>
        </div>

        {/* Category Suggestions */}
        {categorySuggestions.length > 0 && (
          <div className="suggestions-card">
            <h3>Category Suggestions</h3>
            <div className="suggestions-list">
                {categorySuggestions.map((suggestion, index) => (
                <div key={index} className="suggestion-chip">
                      {suggestion.category} ({Math.round(suggestion.confidence)}%)
                </div>
                ))}
              </div>
          </div>
        )}

        {/* Duplicate Warning */}
        {duplicateCheck.hasDuplicates && (
          <div className="warning-card">
            <h3>⚠️ Similar Polls Found</h3>
            <div className="similar-polls-list">
              {duplicateCheck.similarPolls.map((poll, index) => (
                <div key={index} className="similar-poll-item">
                  <div className="similar-title">{poll.title}</div>
                  <div className="similar-author">by {poll.author} • {poll.similarity}% similar</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </IonContent>
    </IonPage>
  )
}

export default CreatePage

