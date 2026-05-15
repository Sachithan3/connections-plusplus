import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import axios from 'axios'

const DIFFICULTY_COLORS = {
  1: 'bg-yellow-300',
  2: 'bg-green-400',
  3: 'bg-cyan-400',
  4: 'bg-purple-400',
}

const DIFFICULTY_TEXT = {
  1: 'text-yellow-900',
  2: 'text-green-900',
  3: 'text-cyan-900',
  4: 'text-purple-900',
}

function LoadingSpinner() {
  return (
    <motion.div
      className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="flex flex-col items-center gap-4"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
      >
        <motion.div
          className="w-16 h-16 border-4 border-gray-200 border-t-gray-800 rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        />
        <motion.p
          className="text-gray-700 font-medium tracking-wide text-sm"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          Generating puzzle...
        </motion.p>
      </motion.div>
    </motion.div>
  )
}

function WordTile({ word, selected, onClick, index }) {
  return (
    <motion.button
      layout
      onClick={onClick}
      className={`
        py-4 px-6 font-black text-lg sm:text-xl tracking-tight
        transition-all rounded-md border-2
        ${selected
          ? 'bg-gray-900 text-white border-gray-900'
          : 'bg-cream-100 text-gray-900 border-gray-300 hover:bg-gray-100 hover:border-gray-400'
        }
      `}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{
        delay: index * 0.04,
        type: 'spring',
        stiffness: 400,
        damping: 35
      }}
      whileHover={!selected ? { scale: 1.03, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' } : {}}
      whileTap={{ scale: 0.97 }}
    >
      {word}
    </motion.button>
  )
}

function SolvedGroup({ group, index, difficulty }) {
  const bgColor = DIFFICULTY_COLORS[difficulty]
  const textColor = DIFFICULTY_TEXT[difficulty]

  return (
    <motion.div
      className={`${bgColor} ${textColor} rounded-lg p-4 sm:p-5 text-center`}
      initial={{ opacity: 0, scale: 0.8, y: -20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{
        delay: index * 0.1,
        type: 'spring',
        stiffness: 200,
        damping: 25
      }}
    >
      <div className="font-black text-sm sm:text-base tracking-widest uppercase mb-2 opacity-90">
        {group.category}
      </div>
      <div className="text-sm sm:text-base opacity-85 leading-relaxed font-medium">
        {group.words.join(' • ')}
      </div>
    </motion.div>
  )
}

function MistakesDisplay({ mistakes }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2">
      <span className="text-sm sm:text-base font-medium text-gray-600 text-center">Mistakes remaining:</span>
      <div className="flex gap-2 justify-center">
        {[0, 1, 2, 3].map((i) => (
          <motion.div
            key={i}
            className={`w-3 h-3 rounded-full ${i < mistakes ? 'bg-gray-400' : 'bg-gray-200'}`}
            animate={i >= mistakes ? { scale: [1, 1.2, 1] } : {}}
            transition={{ duration: 0.3, delay: i * 0.05 }}
          />
        ))}
      </div>
    </div>
  )
}

function EndGameModal({ won, groups, onReplay, stats }) {
  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="bg-white rounded-2xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl text-center"
          initial={{ scale: 0.9, y: 20, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 25 }}
        >
          <h2 className="text-3xl sm:text-4xl font-black text-center mb-1 font-serif text-gray-900">
            {won ? 'Perfect!' : 'Game Over'}
          </h2>

          <p className="text-gray-500 text-center mb-6 text-sm sm:text-base font-medium">
            {won ? 'You solved all groups!' : 'Here are the groups:'}
          </p>

          {!won && (
            <div className="space-y-2 mb-6 text-left">
              {groups.map((group, idx) => (
                <motion.div
                  key={idx}
                  className={`${DIFFICULTY_COLORS[group.difficulty]} ${DIFFICULTY_TEXT[group.difficulty]} rounded-lg p-3 text-sm sm:text-base`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.08 }}
                >
                  <div className="font-black mb-1">{group.category}</div>
                  <div className="opacity-90 font-medium">{group.words.join(' • ')}</div>
                </motion.div>
              ))}
            </div>
          )}

          <motion.button
            onClick={onReplay}
            className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold py-3 px-6 rounded-lg transition-all text-sm sm:text-base"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {won ? 'New Puzzle' : 'Try Again'}
          </motion.button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

function WinScreen({ groups, onReplay }) {
  return (
    <AnimatePresence>
      <motion.div
        className="space-y-6 w-full max-w-5xl mx-auto"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        {/* Win Message */}
        <motion.div
          className="text-center space-y-2"
          initial={{ scale: 0.8, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 200, damping: 25 }}
        >
          <motion.div
            className="text-5xl sm:text-7xl font-black text-gray-900"
            animate={{ rotate: [0, -4, 4, 0], scale: [1, 1.04, 1] }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            WIN
          </motion.div>
          <h2 className="text-3xl sm:text-4xl font-black text-gray-700 font-serif">
            Perfect!
          </h2>
          <p className="text-gray-600 text-base sm:text-lg font-medium">
            You solved all groups!
          </p>
        </motion.div>

        {/* All Solved Groups */}
        <div className="space-y-3 max-w-4xl mx-auto w-full">
          {groups.map((group, idx) => (
            <motion.div
              key={idx}
              className={`${DIFFICULTY_COLORS[group.difficulty]} ${DIFFICULTY_TEXT[group.difficulty]} rounded-lg p-4 sm:p-5 text-center`}
              initial={{ opacity: 0, scale: 0.8, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{
                delay: idx * 0.1,
                type: 'spring',
                stiffness: 200,
                damping: 25
              }}
            >
              <div className="font-black text-sm sm:text-base tracking-widest uppercase mb-2 opacity-90">
                {group.category}
              </div>
              <div className="text-sm sm:text-base opacity-85 leading-relaxed font-medium">
                {group.words.join(' • ')}
              </div>
            </motion.div>
          ))}
        </div>

        {/* New Puzzle Button */}
        <motion.button
          onClick={onReplay}
          className="w-full max-w-xs mx-auto block bg-gray-900 hover:bg-gray-800 text-white font-black py-3 rounded-lg transition-all uppercase tracking-wide text-sm sm:text-base"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          New Puzzle
        </motion.button>
      </motion.div>
    </AnimatePresence>
  )
}

function App() {
  const [gameState, setGameState] = useState('home')
  const [theme, setTheme] = useState('')
  const [allWords, setAllWords] = useState([])
  const [selectedWords, setSelectedWords] = useState([])
  const [solvedGroups, setSolvedGroups] = useState([])
  const [tries, setTries] = useState(4)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [allGroups, setAllGroups] = useState([])
  const [prompt, setPrompt] = useState(null)
  const [missFlash, setMissFlash] = useState(0)
  const [previousSubmissions, setPreviousSubmissions] = useState([])

  const generatePuzzle = async () => {
    const selectedTheme = theme.trim() || 'General'
    setLoading(true)
    setError(null)
    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'https://connections-plusplus-production.up.railway.app'
      const response = await axios.post(`${backendUrl}/generate-puzzle`, {
        theme: selectedTheme
      })
      setAllWords(response.data.shuffled_words)
      setAllGroups(response.data.groups)
      setSelectedWords([])
      setSolvedGroups([])
      setTries(4)
      setGameState('playing')
      setPrompt(null)
      setPreviousSubmissions([])
    } catch (err) {
      setError('Failed to connect to backend. Make sure it\'s running.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const toggleWord = (word) => {
    if (selectedWords.includes(word)) {
      setSelectedWords(selectedWords.filter(w => w !== word))
    } else if (selectedWords.length < 4) {
      setSelectedWords([...selectedWords, word])
    }
  }

  const checkSelection = () => {
    if (selectedWords.length !== 4) return

    // Check if this exact combination was already submitted
    const sortedSelection = [...selectedWords].sort()
    const submissionKey = sortedSelection.join('-')

    if (previousSubmissions.includes(submissionKey)) {
      setPrompt('Already Guessed!')
      setTimeout(() => {
        setPrompt((current) => current === 'Already Guessed!' ? null : current)
      }, 1500)
      return
    }

    const matchedGroup = allGroups.find(group => {
      const groupWords = new Set(group.words)
      return selectedWords.every(w => groupWords.has(w))
    })

    if (matchedGroup) {
      setSolvedGroups([...solvedGroups, matchedGroup])
      setAllWords(allWords.filter(w => !selectedWords.includes(w)))
      setSelectedWords([])
      setPrompt(null)
      setPreviousSubmissions([...previousSubmissions, submissionKey])

      if (solvedGroups.length === 3) {
        setGameState('won')
      }
    } else {
      let oneAwayCount = 0
      let isOneAway = false

      for (const group of allGroups) {
        if (solvedGroups.some(sg => sg.category === group.category)) continue

        const groupWords = new Set(group.words)
        const matchCount = selectedWords.filter(w => groupWords.has(w)).length

        if (matchCount === 3) {
          oneAwayCount++
          isOneAway = true
          setPrompt(`One away! "${group.category}"`)

          // Auto-clear the one away prompt after 2.5 seconds
          setTimeout(() => {
            setPrompt((current) =>
              current?.includes('One away') ? null : current
            )
          }, 2500)
        }
      }

      if (oneAwayCount === 0) {
        setPrompt(null)
      }

      const newTries = tries - 1
      setTries(newTries)

      // Only reset selections if NOT one away
      if (!isOneAway) {
        setSelectedWords([])
      }

      setPreviousSubmissions([...previousSubmissions, submissionKey])
      setMissFlash((value) => value + 1)

      if (newTries === 0) {
        setGameState('lost')
      }
    }
  }

  const deselectAll = () => {
    setSelectedWords([])
  }

  const shuffle = () => {
    const shuffled = [...allWords].sort(() => Math.random() - 0.5)
    setAllWords(shuffled)
  }

  const resetGame = () => {
    setGameState('home')
    setTheme('')
    setAllWords([])
    setSelectedWords([])
    setSolvedGroups([])
    setTries(4)
    setError(null)
    setPrompt(null)
    setPreviousSubmissions([])
  }

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  })

  return (
    <div className="min-h-screen bg-white">
      <AnimatePresence>
        {loading && <LoadingSpinner />}
      </AnimatePresence>

      <AnimatePresence>
        {missFlash > 0 && (
          <motion.div
            key={missFlash}
            className="fixed inset-0 pointer-events-none z-30 bg-red-500/10"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
          />
        )}
      </AnimatePresence>

      {/* Header */}
      {gameState !== 'home' && (
        <motion.header
          className="border-b border-gray-200 sticky top-0 z-40 bg-white/95 backdrop-blur-sm"
          initial={{ y: -100 }}
          animate={{ y: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        >
          <div className="max-w-5xl mx-auto px-4 py-4 sm:py-5 flex items-center justify-between gap-4">
            <h1 className="text-3xl sm:text-5xl font-black font-serif leading-none">
              Connections++
            </h1>
            <div className="text-sm sm:text-base text-gray-600 font-medium text-center">
              {gameState === 'playing' && theme}
            </div>
            {gameState === 'playing' && (
              <button
                onClick={() => setGameState('home')}
                className="px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 text-gray-900 font-semibold rounded-lg transition-colors"
              >
                ← Home
              </button>
            )}
          </div>
        </motion.header>
      )}

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 py-6 sm:py-8 flex justify-center">
        <AnimatePresence mode="wait">
          {/* Home Screen */}
          {gameState === 'home' && (
            <motion.div
              key="home"
              className="flex flex-col items-center justify-center min-h-[80vh] gap-12 text-center max-w-2xl mx-auto"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className="text-center"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
              >
                <h1 className="text-5xl sm:text-7xl font-black font-serif mb-4 leading-none tracking-tight">
                  Connections++
                </h1>
                <p className="text-gray-500 text-lg sm:text-xl tracking-wide leading-relaxed">{today}</p>
              </motion.div>

              <motion.div
                className="text-center mb-2 space-y-4"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <p className="text-2xl sm:text-3xl text-gray-700 font-semibold leading-tight">
                  Create four groups of four!
                </p>
                <p className="text-gray-600 text-base sm:text-lg max-w-xl mx-auto leading-relaxed">
                  Pick four items that share something in common. You have 4 tries.
                </p>
              </motion.div>

              <motion.div
                className="w-full max-w-2xl space-y-5"
                initial={{ y: 40, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <input
                  type="text"
                  value={theme}
                  onChange={(e) => setTheme(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && !loading && generatePuzzle()}
                  placeholder="Blank for general puzzle, or enter theme (eg: food,animals..)"
                  className="w-full px-6 py-5 bg-white border-2 border-gray-300 rounded-lg focus:outline-none focus:border-gray-600 text-gray-900 placeholder-gray-400 font-medium text-base sm:text-lg leading-relaxed"
                  disabled={loading}
                />
                <motion.button
                  onClick={generatePuzzle}
                  disabled={loading || !theme.trim()}
                  className="w-full py-4 bg-gray-900 hover:bg-gray-800 disabled:bg-gray-400 text-white font-black rounded-lg transition-all tracking-wide uppercase text-base sm:text-lg"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {loading ? 'Generating...' : 'Play'}
                </motion.button>
              </motion.div>

              {error && (
                <motion.div
                  className="text-red-600 text-sm text-center font-medium"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  {error}
                </motion.div>
              )}
            </motion.div>
          )}

          {/* Playing Screen */}
          {gameState === 'playing' && (
            <motion.div
              key="playing"
              className="space-y-6 w-full max-w-5xl mx-auto"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {/* Solved Groups */}
              {solvedGroups.length > 0 && (
                <div className="space-y-3 max-w-4xl mx-auto w-full">
                  {solvedGroups.map((group, idx) => (
                    <SolvedGroup
                      key={group.category}
                      group={group}
                      index={idx}
                      difficulty={group.difficulty}
                    />
                  ))}
                </div>
              )}

              {/* One Away Prompt */}
              <AnimatePresence>
                {prompt && (
                  <motion.div
                    className="bg-yellow-100 border border-yellow-300 rounded-xl p-4 sm:p-5 text-yellow-900 text-base sm:text-lg font-bold text-center max-w-2xl mx-auto shadow-sm"
                    initial={{ opacity: 0, y: -10, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10 }}
                  >
                    {prompt}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Word Grid */}
              <motion.div
                className="grid grid-cols-4 gap-2 sm:gap-3 max-w-4xl mx-auto"
                layout
              >
                {allWords.map((word, idx) => (
                  <WordTile
                    key={word}
                    word={word}
                    selected={selectedWords.includes(word)}
                    onClick={() => toggleWord(word)}
                    index={idx}
                  />
                ))}
              </motion.div>

              {/* Mistakes Display */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                <MistakesDisplay mistakes={tries} />
              </motion.div>

              {/* Controls */}
              <motion.div
                className="grid grid-cols-3 gap-3 max-w-4xl mx-auto"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <button
                  onClick={deselectAll}
                  className="px-4 py-3 bg-white border-2 border-gray-400 hover:border-gray-600 text-gray-900 font-bold rounded-lg transition-colors text-sm sm:text-base"
                >
                  Deselect All
                </button>
                <button
                  onClick={shuffle}
                  className="px-4 py-3 bg-white border-2 border-gray-400 hover:border-gray-600 text-gray-900 font-bold rounded-lg transition-colors text-sm sm:text-base"
                >
                  Shuffle
                </button>
                <motion.button
                  onClick={checkSelection}
                  disabled={selectedWords.length !== 4}
                  className="px-4 py-3 bg-gray-900 hover:bg-gray-800 disabled:bg-gray-300 text-white disabled:text-gray-500 font-bold rounded-lg transition-all text-sm sm:text-base uppercase tracking-wide"
                  whileTap={selectedWords.length === 4 ? { scale: 0.95 } : {}}
                >
                  Submit
                </motion.button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* End Game Modals */}
      <AnimatePresence>
        {gameState === 'won' && (
          <WinScreen
            groups={solvedGroups}
            onReplay={resetGame}
          />
        )}
        {gameState === 'lost' && (
          <EndGameModal
            won={false}
            groups={allGroups}
            onReplay={resetGame}
            stats={{}}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

export default App
