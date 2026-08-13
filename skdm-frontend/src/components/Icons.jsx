// Minimal hand-rolled icon set — avoids an external icon-font dependency
// so the project runs fully offline once installed.
const base = {
  width: 24,
  height: 24,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round",
  strokeLinejoin: "round",
};

export const icons = {
  library: (
    <svg {...base}><path d="M4 19.5V5a1 1 0 0 1 1-1h2v16" /><path d="M9 4h6v16" /><path d="M15 4l4 1v15l-4-1" /><path d="M4 19.5h15" /></svg>
  ),
  lab: (
    <svg {...base}><path d="M9 3h6" /><path d="M10 3v6.5L4.8 18a2 2 0 0 0 1.7 3h11a2 2 0 0 0 1.7-3L14 9.5V3" /><path d="M8 15h8" /></svg>
  ),
  computer: (
    <svg {...base}><rect x="3" y="4" width="18" height="12" rx="1.5" /><path d="M8 20h8" /><path d="M12 16v4" /></svg>
  ),
  sports: (
    <svg {...base}><circle cx="12" cy="12" r="9" /><path d="M12 3v18M3 12h18M5.5 5.5l13 13M18.5 5.5l-13 13" /></svg>
  ),
  hostel: (
    <svg {...base}><path d="M4 21V9l8-6 8 6v12" /><path d="M9 21v-7h6v7" /></svg>
  ),
  bus: (
    <svg {...base}><rect x="3" y="5" width="18" height="12" rx="2" /><path d="M3 12h18" /><circle cx="7.5" cy="19.5" r="1.5" /><circle cx="16.5" cy="19.5" r="1.5" /></svg>
  ),
  wifi: (
    <svg {...base}><path d="M2 8.5a16 16 0 0 1 20 0" /><path d="M5.5 12.5a11 11 0 0 1 13 0" /><path d="M9 16.5a6 6 0 0 1 6 0" /><circle cx="12" cy="20" r="1" fill="currentColor" stroke="none" /></svg>
  ),
  health: (
    <svg {...base}><path d="M12 21s-7-4.35-9.5-8.5C.7 8.8 2.5 5 6.2 5c2 0 3.3 1.1 3.8 2 0.5-0.9 1.8-2 3.8-2 3.7 0 5.5 3.8 3.7 7.5C19 16.65 12 21 12 21z" /></svg>
  ),
  mail: (
    <svg {...base}><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" /></svg>
  ),
  phone: (
    <svg {...base}><path d="M4 4h4l2 5-2.5 1.5a12 12 0 0 0 6 6L15 14l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 2 6a2 2 0 0 1 2-2z" /></svg>
  ),
  pin: (
    <svg {...base}><path d="M12 21s7-6.5 7-12a7 7 0 1 0-14 0c0 5.5 7 12 7 12z" /><circle cx="12" cy="9" r="2.5" /></svg>
  ),
  clock: (
    <svg {...base}><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>
  ),
  menu: (
    <svg {...base}><path d="M4 7h16M4 12h16M4 17h16" /></svg>
  ),
  close: (
    <svg {...base}><path d="M6 6l12 12M18 6 6 18" /></svg>
  ),
  quote: (
    <svg viewBox="0 0 32 24" width="32" height="24" fill="currentColor"><path d="M0 24V14.4C0 6.4 4.4 1.2 12.8 0l1.6 4C9.2 5.2 6.8 8 6.8 12h6.8v12H0zm18.4 0V14.4c0-8 4.4-13.2 12.8-14.4l1.6 4c-5.2 1.2-7.6 4-7.6 8h6.8v12H18.4z"/></svg>
  ),
  check: (
    <svg {...base}><polyline points="20 6 9 17 4 12" /></svg>
  ),
  "alert-circle": (
    <svg {...base}><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
  ),
  user: (
    <svg {...base}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
  ),
  lock: (
    <svg {...base}><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
  ),
  eye: (
    <svg {...base}><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
  ),
  "eye-off": (
    <svg {...base}><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" /><line x1="1" y1="1" x2="23" y2="23" /></svg>
  ),
  logout: (
    <svg {...base}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>
  ),
  "chevron-down": (
    <svg {...base}><polyline points="6 9 12 15 18 9" /></svg>
  ),
  file: (
    <svg {...base}><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" /><polyline points="13 2 13 9 20 9" /></svg>
  ),
};

export default function Icon({ name, size = 24 }) {
  const svg = icons[name];
  if (!svg) return null;
  return (
    <span style={{ display: "inline-flex", width: size, height: size }} aria-hidden="true">
      {svg}
    </span>
  );
}
