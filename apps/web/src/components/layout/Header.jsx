const navItems = [
  { label: 'Live Now', href: '#live-now' },
  { label: 'Top Stories', href: '#top-stories' },
  { label: 'Editorial', href: '#editorial-stack' },
  { label: 'Competitions', href: '#competitions' },
  { label: 'Backend Ready', href: '#backend-ready' },
];

export default function Header() {
  return (
    <header className="site-header">
      <div className="brand-lockup">
        <span className="brand-mark">WV</span>
        <div>
          <p className="brand-name">WicketVicky</p>
          <p className="brand-tag">Realtime sports pulse</p>
        </div>
      </div>

      <nav className="site-nav" aria-label="Primary">
        {navItems.map((item) => (
          <a key={item.label} href={item.href}>
            {item.label}
          </a>
        ))}
      </nav>

      <button className="header-cta" type="button">
        Get Alerts
      </button>
    </header>
  );
}
