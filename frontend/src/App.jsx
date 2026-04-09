import { Routes, Route } from 'react-router-dom'
import { SignedIn, SignedOut, RedirectToSignIn } from '@clerk/clerk-react'
import Dashboard from './pages/Dashboard'
import Onboarding from './pages/Onboarding'

function App() {
  return (
    <Routes>
      <Route path="/" element={
        <>
          <SignedIn>
            <Dashboard />
          </SignedIn>
          <SignedOut>
            <RedirectToSignIn />
          </SignedOut>
        </>
      } />
      <Route path="/onboarding" element={
        <>
          <SignedIn>
            <Onboarding />
          </SignedIn>
          <SignedOut>
            <RedirectToSignIn />
          </SignedOut>
        </>
      } />
    </Routes>
  )
}

export default App
