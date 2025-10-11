# Poll Carousel Component - Standardized Architecture

## Overview
A **reusable, modular** `PollCarousel` component that provides consistent carousel behavior across all pages in the app.

## Component: PollCarousel

### Location
`src/components/PollCarousel.tsx`

### Features
✅ **Snap-to-center scrolling** - Cards always snap to viewport center  
✅ **Dynamic focus detection** - Tracks which poll is at screen center  
✅ **Black theme for focused card** - Centered card gets dark styling  
✅ **Blur effect on adjacent cards** - Cards above/below are blurred  
✅ **Scale animation** - Focused card is 100%, others 95%  
✅ **Vote slide-out animation** - Smooth transition when voting  
✅ **Auto-scroll to next poll** - After voting, scrolls to next  
✅ **Pointer events control** - Only focused card is interactive  

### Props Interface
```typescript
interface PollCarouselProps {
  polls: Poll[]                    // Array of polls to display
  user: User | null                // Current authenticated user
  onVote: (pollId, option) => void // Vote handler
  onLike: (pollId) => void         // Like handler
  contentRef?: RefObject           // Optional IonContent ref
  onVoteComplete?: (pollId) => void // Optional vote completion callback
  className?: string               // Optional CSS class
}
```

## Visual Hierarchy (Carousel Wheel)

```
     [Card -2] ← blur(2px), 20% opacity, scale(0.95)
     [Card -1] ← blur(4px), 40% opacity, scale(0.95)
  → [FOCUSED]  ← BLACK THEME, 100% opacity, scale(1) ←
     [Card +1] ← blur(4px), 40% opacity, scale(0.95)  
     [Card +2] ← blur(2px), 20% opacity, scale(0.95)
```

## Standardized Usage Across Pages

### ✅ HomePage.tsx
```tsx
<PollCarousel
  polls={filteredPolls}
  user={user}
  onVote={onVote}
  onLike={onLike}
  contentRef={contentRef}
/>
```
**Sections:** Last, Trending, My Votes, Expired

### ✅ ProfilePage.tsx
```tsx
<PollCarousel
  polls={userPolls}
  user={user}
  onVote={onVote}
  onLike={onLike}
  contentRef={contentRef}
/>
```
**Tab:** User's polls

### ✅ TrendingPage.tsx
```tsx
<PollCarousel
  polls={trendingPolls}
  user={user}
  onVote={onVote}
  onLike={onLike}
/>
```

### ✅ SwipeHomePage.tsx
```tsx
<PollCarousel
  polls={availablePolls}
  user={user}
  onVote={handleVoteWithFeedback}
  onLike={onLike}
  onVoteComplete={handleVoteComplete}
/>
```

## Focused Card Styling

### Black Theme Applied When:
- Card is at viewport center (detected dynamically)
- Card is not yet voted

### Styling Changes:
- Background: `#000000` (black)
- Border: `#ffffff` (white)
- Title text: `#ffffff` (white)
- Description: `#cccccc` (light gray)
- Option backgrounds: `#333333` (dark gray)
- Option borders: `#ffffff` (white)
- Category chip: White background, black icon
- Time badge: White background, black text
- Box shadow: `0 8px 16px rgba(0, 0, 0, 0.3)`

## Scroll Behavior

### Snap Points:
- `scroll-snap-type: y mandatory`
- `scroll-snap-align: center`
- `scroll-snap-stop: always`
- Padding: `calc(50vh - 200px)` top and bottom for centering

### Transitions:
- Filter: `0.4s ease`
- Opacity: `0.4s ease`
- Transform: `0.4s ease`
- Smooth scroll behavior

## Vote Flow Animation

1. **User votes** → Swipe gesture or tap
2. **Gauge fills** → 300ms animation
3. **Card slides out** → 800ms slide-to-right animation
4. **Auto-scroll** → Scrolls to next poll at center
5. **Focus updates** → Next card becomes black (focused)
6. **Blur shifts** → Blur effect moves to new adjacent cards

## Benefits of Modular Architecture

✅ **Single source of truth** - One component for all carousel behavior  
✅ **Consistent UX** - Same feel across all pages  
✅ **Easy maintenance** - Update once, applies everywhere  
✅ **Reusable** - Drop into any page with polls  
✅ **Performance** - Optimized scroll detection  
✅ **Type-safe** - Full TypeScript support  

## Category Counts

All sections now show real-time poll counts:
- **Last (X)** - Active polls not yet voted
- **Trending (X)** - Popular polls not yet voted  
- **My Votes (X)** - Polls user has voted on
- **Expired (X)** - Ended polls
- **Total** - All polls (shown in header)

## Code Quality

- ✅ Modular and reusable
- ✅ Fully typed with TypeScript
- ✅ Consistent across all pages
- ✅ Performance optimized
- ✅ Accessible and interactive
- ✅ Smooth animations
- ✅ No code duplication

