import { useState, useCallback, useEffect } from 'react'
import { CoverPage } from './pages/CoverPage'
import { StoryPage } from './pages/StoryPage'
import { CalendarPage } from './pages/CalendarPage'
import { FinalePage } from './pages/FinalePage'
import { months } from './data/months'
import { syncFromCloud } from './services/storage'
import { isCloudEnabled } from './services/supabase'
import { MaterialIcon } from './components/MaterialIcon'

type Page = 'cover' | 'story' | 'calendar' | 'finale'

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('cover')
  const [monthIndex, setMonthIndex] = useState(0)
  const [syncing, setSyncing] = useState(false)
  const [syncDone, setSyncDone] = useState(false)

  // Sync from cloud on first load
  useEffect(() => {
    if (isCloudEnabled && !syncDone) {
      setSyncing(true)
      syncFromCloud().finally(() => {
        setSyncing(false)
        setSyncDone(true)
      })
    }
  }, [syncDone])

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
    <div className="w-full h-screen max-w-[430px] mx-auto overflow-y-auto bg-bg-light relative">
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

      {/* Cloud sync indicator */}
      {syncing && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg flex items-center gap-2 border border-primary/20">
          <div className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
          <span className="text-sm font-bold text-primary">どうきちゅう...</span>
        </div>
      )}

      {/* Cloud status badge */}
      {isCloudEnabled && !syncing && (
        <div className="fixed top-3 right-3 z-50">
          <div className="bg-green-500/80 text-white p-1 rounded-full" title="クラウド接続中">
            <MaterialIcon icon="cloud_done" className="text-sm block" />
          </div>
        </div>
      )}
    </div>
  )
}

export default App
