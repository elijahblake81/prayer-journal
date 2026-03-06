// src/components/AvatarInitials.jsx
export default function AvatarInitials({ user, size = 32, className = '' }) {
  const initials = getInitials(user);

  return (
    <span
      className={`avatar-circle ${className}`}
      aria-hidden="true"
      style={{
        width: size,
        height: size,
        fontSize: Math.max(11, Math.floor(size * 0.45)),
      }}
      title={user?.displayName || user?.email || 'User'}
    >
      {initials}
    </span>
  );
}

function getInitials(user) {
  const name = (user?.displayName || user?.email || 'User').trim();

  // If it's an email, use the part before '@'
  let base = name.includes('@') ? name.split('@')[0] : name;

  // Replace separators with spaces, compress spaces
  base = base.replace(/[_\.]+/g, ' ').replace(/\s+/g, ' ').trim();

  const parts = base.split(' ');

  if (parts.length === 1) {
    // Single token like "elijahblake81" → first 2 letters
    const clean = parts[0].replace(/[^a-zA-Z]/g, '');
    return (clean[0] || 'U').toUpperCase() + (clean[1] ? clean[1].toUpperCase() : '');
  }

  const first = parts[0]?.[0] || 'U';
  const last = parts[parts.length - 1]?.[0] || '';
  return (first + last).toUpperCase();
}