// src/components/UserMenu.jsx
import { useState, useRef, useEffect } from 'react';
import AvatarInitials from './AvatarInitials';

export default function UserMenu({ user, onSignOut }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  // Close menu when clicking outside
  useEffect(() => {
    function handleOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  return (
    <div className="user-menu" ref={ref}>
      <button
        className="avatar-btn"
        onClick={() => setOpen(o => !o)}
        aria-label="Open user menu"
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <AvatarInitials user={user} size={32} />
      </button>

      {open && (
        <div className="menu-dropdown" role="menu">
          <button className="menu-item" role="menuitem" onClick={onSignOut}>
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}