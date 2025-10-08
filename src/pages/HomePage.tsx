import React from 'react'
import { ChevronRight } from 'lucide-react'
import PollCard from '../components/PollCard'
import { Poll, User } from '../types'
import '../pages/HomePage.css'

interface HomePageProps {
  polls: Poll[]
  user: User
  onVote: (pollId: string, option: 'A' | 'B') => void
  onLike: (pollId: string) => void
}

const HomePage: React.FC<HomePageProps> = ({ polls, user, onVote, onLike }) => {
  return (
    <div className="home-page">
      <div className="page-header">
        <h1 className="pixelated">SWIPE TO VOTE</h1>
        <p>DISCOVER POLLS AND SETTLE ARGUMENTS</p>
      </div>
      
      <div className="polls-section">
        <div className="section-header">
          <h2>LATEST POLLS</h2>
          <button className="see-all-btn">
            See All <ChevronRight />
          </button>
        </div>
        
        <div className="polls-grid">
          {polls.map(poll => (
            <PollCard
              key={poll.id}
              poll={poll}
              onVote={onVote}
              onLike={onLike}
              currentUser={user}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

export default HomePage

