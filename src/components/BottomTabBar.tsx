import { NavLink, useLocation } from 'react-router-dom'

const tabs = [
  { to: '/dashboard', label: '首页', icon: '⚡' },
  { to: '/training', label: '训练', icon: '🏋️' },
  { to: '/diet', label: '饮食', icon: '🍽️' },
  { to: '/body', label: '身体', icon: '📊' },
  { to: '/plan', label: '计划', icon: '📋' },
]

const neonColors: Record<string, string> = {
  '/dashboard': '#ffffff',
  '/training': '#00ff88',
  '/diet': '#ff6b35',
  '/body': '#00d4ff',
  '/plan': '#a855f7',
}

export default function BottomTabBar() {
  const location = useLocation()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex glass border-t border-white/5 pb-safe">
      {tabs.map(({ to, label, icon }) => {
        const isActive = location.pathname === to
        const neon = neonColors[to]
        return (
          <NavLink
            key={to}
            to={to}
            className="flex-1 flex flex-col items-center py-2 text-xs gap-0.5 transition-all duration-200"
            style={
              isActive
                ? {
                    color: neon,
                    textShadow: `0 0 10px ${neon}`,
                  }
                : { color: '#6b7280' }
            }
          >
            <span
              className="text-lg transition-all duration-200"
              style={
                isActive
                  ? { filter: `drop-shadow(0 0 6px ${neon})` }
                  : { opacity: 0.5 }
              }
            >
              {icon}
            </span>
            <span>{label}</span>
            {isActive && (
              <div
                className="absolute top-0 w-8 h-0.5 rounded-b-full"
                style={{ background: neon, boxShadow: `0 0 8px ${neon}` }}
              />
            )}
          </NavLink>
        )
      })}
    </nav>
  )
}
