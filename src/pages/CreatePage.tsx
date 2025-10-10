import React, { useState, useRef } from 'react'
import { 
  IonPage, 
  IonHeader, 
  IonToolbar, 
  IonTitle, 
  IonContent,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonItem,
  IonLabel,
  IonInput,
  IonTextarea,
  IonSelect,
  IonSelectOption,
  IonButton,
  IonChip,
  IonBadge,
  IonAlert,
  IonRefresher,
  IonRefresherContent
} from '@ionic/react'
import { chevronDownCircleOutline } from 'ionicons/icons'
import { CreatePollFormData } from '../types'
import { PollzAPI } from '../database/api'

interface CreatePageProps {
  onCreatePoll: (pollData: CreatePollFormData) => Promise<any>
}

const CreatePage: React.FC<CreatePageProps> = ({ onCreatePoll }) => {
  const contentRef = useRef<HTMLIonContentElement>(null)
  
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
    notificationEnabled: true
  })

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
      notificationEnabled: true
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

  const handleInputChange = (field: keyof CreatePollFormData, value: string | number) => {
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
    if (formData.title && formData.optionA && formData.optionB && formData.category) {
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
          notificationEnabled: true
        })
        setCategorySuggestions([])
        setDuplicateCheck({ hasDuplicates: false, similarPolls: [] })
      } catch (error) {
        console.error('Failed to create poll:', error)
        // Error handling is done in useAppState
      }
    }
  }

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Create Poll</IonTitle>
        </IonToolbar>
      </IonHeader>
      
      <IonContent ref={contentRef} fullscreen>
        {/* Pull to Refresh */}
        <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
          <IonRefresherContent
            pullingIcon={chevronDownCircleOutline}
            pullingText="Pull to refresh"
            refreshingSpinner="circles"
            refreshingText="Resetting form..."
          />
        </IonRefresher>

        <div className="page-header-minimal">
          <h1>CREATE POLL</h1>
          <p>SETTLE THE ARGUMENT ONCE AND FOR ALL</p>
        </div>

        <IonCard style={{ margin: '16px' }}>
          <IonCardContent>
            <form onSubmit={handleSubmit}>
              <IonItem>
                <IonLabel position="stacked">POLL QUESTION</IonLabel>
                <IonInput
                  value={formData.title}
                  onIonInput={(e) => handleInputChange('title', e.detail.value!)}
                  placeholder="What's the burning question?"
                  required
                />
              </IonItem>

              <IonItem>
                <IonLabel position="stacked">DESCRIPTION (OPTIONAL)</IonLabel>
                <IonTextarea
                  value={formData.description}
                  onIonInput={(e) => handleInputChange('description', e.detail.value!)}
                  placeholder="Add some context..."
                  rows={3}
                />
              </IonItem>

              <div style={{ margin: '16px 0', padding: '12px 0', borderTop: '1px solid #e0e0e0', borderBottom: '1px solid #e0e0e0' }}>
                <h3 style={{ 
                  fontFamily: 'Courier New, Courier, monospace',
                  fontWeight: '700',
                  textAlign: 'center',
                  marginBottom: '16px',
                  fontSize: '12px',
                  textTransform: 'uppercase',
                  letterSpacing: '2px',
                  color: '#000000'
                }}>
                  OPTIONS
                </h3>
                
                <IonItem>
                  <IonLabel position="stacked">OPTION A</IonLabel>
                  <IonInput
                    value={formData.optionA}
                    onIonInput={(e) => handleInputChange('optionA', e.detail.value!)}
                    placeholder="First choice"
                    required
                  />
                </IonItem>

                <div style={{ 
                  textAlign: 'center',
                  fontFamily: 'Courier New, Courier, monospace',
                  fontWeight: '700',
                  color: '#000000',
                  margin: '16px 0',
                  fontSize: '16px',
                  textTransform: 'uppercase',
                  letterSpacing: '4px'
                }}>
                  VS
                </div>

                <IonItem>
                  <IonLabel position="stacked">OPTION B</IonLabel>
                  <IonInput
                    value={formData.optionB}
                    onIonInput={(e) => handleInputChange('optionB', e.detail.value!)}
                    placeholder="Second choice"
                    required
                  />
                </IonItem>
              </div>

              <IonItem>
                <IonLabel position="stacked">CONTEXT (OPTIONAL)</IonLabel>
                <IonTextarea
                  value={formData.context}
                  onIonInput={(e) => handleInputChange('context', e.detail.value!)}
                  placeholder="Why is this important to you?"
                  rows={2}
                />
              </IonItem>

              {/* Enhanced Poll Creation Features */}
              <IonItem>
                <IonLabel position="stacked">POLL TYPE</IonLabel>
                <IonSelect
                  value={formData.pollType}
                  onIonChange={(e) => handleInputChange('pollType', e.detail.value)}
                  placeholder="Select poll type"
                >
                  <IonSelectOption value="question">Question with Options</IonSelectOption>
                  <IonSelectOption value="options-only">Just Two Options</IonSelectOption>
                </IonSelect>
              </IonItem>

              <IonItem>
                <IonLabel position="stacked">TIMER SETTINGS</IonLabel>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%' }}>
                  <IonButton
                    fill={formData.timerEnabled ? 'solid' : 'outline'}
                    color={formData.timerEnabled ? 'primary' : 'medium'}
                    onClick={() => handleInputChange('timerEnabled', !formData.timerEnabled)}
                    style={{ minWidth: '80px' }}
                  >
                    {formData.timerEnabled ? 'ON' : 'OFF'}
                  </IonButton>
                  {formData.timerEnabled && (
                    <IonSelect
                      value={formData.timerDuration}
                      onIonChange={(e) => handleInputChange('timerDuration', e.detail.value)}
                      placeholder="Duration"
                      style={{ flex: 1 }}
                    >
                      <IonSelectOption value={1}>1 Hour</IonSelectOption>
                      <IonSelectOption value={6}>6 Hours</IonSelectOption>
                      <IonSelectOption value={12}>12 Hours</IonSelectOption>
                      <IonSelectOption value={24}>1 Day</IonSelectOption>
                      <IonSelectOption value={72}>3 Days</IonSelectOption>
                      <IonSelectOption value={168}>1 Week</IonSelectOption>
                    </IonSelect>
                  )}
                </div>
              </IonItem>

              <IonItem>
                <IonLabel position="stacked">NOTIFICATIONS</IonLabel>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%' }}>
                  <IonButton
                    fill={formData.notificationEnabled ? 'solid' : 'outline'}
                    color={formData.notificationEnabled ? 'primary' : 'medium'}
                    onClick={() => handleInputChange('notificationEnabled', !formData.notificationEnabled)}
                    style={{ minWidth: '80px' }}
                  >
                    {formData.notificationEnabled ? 'ON' : 'OFF'}
                  </IonButton>
                  <span style={{ 
                    fontFamily: 'Courier New, Courier, monospace',
                    fontSize: '12px',
                    color: '#666666',
                    flex: 1
                  }}>
                    Get notified when poll expires
                  </span>
                </div>
              </IonItem>

              <IonItem>
                <IonLabel position="stacked">CATEGORY</IonLabel>
                <IonSelect
                  value={formData.category}
                  onIonChange={(e) => handleInputChange('category', e.detail.value)}
                  placeholder="Select Category"
                >
                  {categories.map(category => (
                    <IonSelectOption key={category} value={category}>
                      {category}
                    </IonSelectOption>
                  ))}
                </IonSelect>
              </IonItem>

              <IonItem>
                <IonLabel position="stacked">TIME LIMIT</IonLabel>
                <IonSelect
                  value={formData.timeLimit}
                  onIonChange={(e) => handleInputChange('timeLimit', parseInt(e.detail.value))}
                >
                  <IonSelectOption value={1}>1 Hour</IonSelectOption>
                  <IonSelectOption value={6}>6 Hours</IonSelectOption>
                  <IonSelectOption value={24}>24 Hours</IonSelectOption>
                  <IonSelectOption value={72}>3 Days</IonSelectOption>
                  <IonSelectOption value={168}>1 Week</IonSelectOption>
                </IonSelect>
              </IonItem>

              <div style={{ marginTop: '24px' }}>
                <IonButton 
                  expand="block" 
                  fill="outline" 
                  onClick={handlePollCheck}
                  style={{ marginBottom: '8px' }}
                >
                  CHECK DUPLICATES
                </IonButton>
                <IonButton 
                  expand="block" 
                  type="submit"
                  color="primary"
                  disabled={!formData.title || !formData.optionA || !formData.optionB || !formData.category}
                >
                  CREATE POLL
                </IonButton>
              </div>
            </form>
          </IonCardContent>
        </IonCard>

        {categorySuggestions.length > 0 && (
          <IonCard style={{ margin: '16px' }}>
            <IonCardHeader>
              <IonCardTitle>Category Suggestions</IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {categorySuggestions.map((suggestion, index) => (
                  <IonChip key={index} color="primary">
                    <IonLabel>
                      {suggestion.category} ({Math.round(suggestion.confidence)}%)
                    </IonLabel>
                  </IonChip>
                ))}
              </div>
            </IonCardContent>
          </IonCard>
        )}

        {duplicateCheck.hasDuplicates && (
          <IonCard style={{ margin: '16px' }}>
            <IonCardHeader>
              <IonCardTitle color="warning">⚠️ Similar Polls Found</IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
              {duplicateCheck.similarPolls.map((poll, index) => (
                <div key={index} style={{ 
                  padding: '8px',
                  border: '1px solid #eee',
                  borderRadius: '4px',
                  marginBottom: '8px'
                }}>
                  <div style={{ fontWeight: 'bold' }}>{poll.title}</div>
                  <div style={{ fontSize: '12px', color: '#666' }}>
                    by {poll.author} • {poll.similarity}% similar
                  </div>
                </div>
              ))}
            </IonCardContent>
          </IonCard>
        )}
      </IonContent>
    </IonPage>
  )
}

export default CreatePage

