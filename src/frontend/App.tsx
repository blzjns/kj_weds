import { useState } from 'react';
import AccessOverlay from './components/AccessOverlay.jsx';
import BottomNav from './components/BottomNav.jsx';
import WelcomePage from './components/pages/WelcomePage.jsx';
import RsvpPage from './components/pages/RsvpPage.jsx';
import SchedulePage from './components/pages/SchedulePage.jsx';
import GalleryPage from './components/pages/GalleryPage.jsx';
import type { Guest } from '../types/guest.js';
import HeaderActions from './components/HeaderActions.js';

export default function App() {
  const [guest, setGuest] = useState<Guest>();
  const [activePage, setActivePage] = useState('welcome');

  function handleUnlock(guestData: Guest) {
    setGuest(guestData);
  }

  return (
    <>
      {!guest && <AccessOverlay onUnlock={handleUnlock} />}

      {guest && (
        <div id="app">
          <HeaderActions />
          <BottomNav activePage={activePage} onNavigate={setActivePage} />

          {activePage === 'welcome' && <WelcomePage />}
          {activePage === 'rsvp' && <RsvpPage />}
          {activePage === 'schedule' && <SchedulePage />}
          {activePage === 'gallery' && <GalleryPage />}
        </div>
      )}
    </>
  );
}
