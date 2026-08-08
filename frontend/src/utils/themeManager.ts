export function applyThemeAndAccent(themeOverride?: 'dark' | 'light', accentOverride?: string) {
  const theme = themeOverride || (localStorage.getItem('buildstack_theme') as 'dark' | 'light') || 'dark';
  const accent = accentOverride || localStorage.getItem('buildstack_accent') || '#6366f1';

  const root = document.documentElement;
  const body = document.body;

  // Toggle theme classes
  if (theme === 'light') {
    root.classList.remove('dark');
    root.classList.add('light');
    body.classList.remove('dark');
    body.classList.add('light');
    root.style.colorScheme = 'light';
  } else {
    root.classList.remove('light');
    root.classList.add('dark');
    body.classList.remove('light');
    body.classList.add('dark');
    root.style.colorScheme = 'dark';
  }

  // Set CSS variables dynamically for accent colors
  root.style.setProperty('--primary', accent);
  root.style.setProperty('--ring', accent);
  root.style.setProperty('--sidebar-primary', accent);
  root.style.setProperty('--sidebar-ring', accent);
  root.style.setProperty('--studio-icon-active', accent);
  root.style.setProperty('--studio-border-active', accent);
  root.style.setProperty('--studio-gradient-start', accent);
}
