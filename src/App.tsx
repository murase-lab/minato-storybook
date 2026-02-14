import { useState, useCallback } from 'react'
import { CoverPage } from './pages/CoverPage'
import { StoryPage } from './pages/StoryPage'
import { CalendarPage } from './pages/CalendarPage'
import { FinalePage } from './pages/FinalePage'
import { months } from './data/months'

type Page = 'cover' | 'story' | 'calendar' | 'finale'

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('cover')
  const [monthIndex, setMonthIndex] = useState(0)

  const goToStory = useCallback((index: number) => {
    setMonthIndex(index)
    setCurrentPage('story')
  }, [])

  const handleStart = useCallback(() => {
    setMonthIndex(0)
    setCurrentPage('story')
  }, [])

  const handleNext = useCallback(() => {
    if (monthIndex < months.length - 1) {
      setMonthIndex(prev => prev + 1)
    } else {
      setCurrentPage('finale')
    }
  }, [monthIndex])

  const handlePrev = useCallback(() => {
    if (monthIndex > 0) {
      setMonthIndex(prev => prev - 1)
    } else {
      setCurrentPage('cover')
    }
  }, [monthIndex])

  const handleClose = useCallback(() => {
    setCurrentPage('calendar')
  }, [])

  const handleRestart = useCallback(() => {
    setMonthIndex(0)
    setCurrentPage('story')
  }, [])

  return (
    <div className="w-full h-screen max-w-[430px] mx-auto overflow-hidden bg-bg-light relative">
      {currentPage === 'cover' && (
        <CoverPage onStart={handleStart} />
      )}
      {currentPage === 'story' && (
        <StoryPage
          monthIndex={monthIndex}
          onNext={handleNext}
          onPrev={handlePrev}
          onClose={handleClose}
        />
      )}
      {currentPage === 'calendar' && (
        <CalendarPage
          onSelectMonth={(index) => goToStory(index)}
          onGoHome={() => setCurrentPage('cover')}
          onGoStory={handleStart}
          onGoFinale={() => setCurrentPage('finale')}
        />
      )}
      {currentPage === 'finale' && (
        <FinalePage
          onRestart={handleRestart}
          onGoCalendar={() => setCurrentPage('calendar')}
        />
      )}
    </div>
  )
}

export default App
