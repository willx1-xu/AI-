import { NavLink } from 'react-router-dom'

const tabs = [
  { to: '/training', label: '训练', icon: '🏋️' },
  { to: '/diet', label: '饮食', icon: '🍽️' },
  { to: '/body', label: '身体', icon: '📊' },
  { to: '/plan', label: '计划', icon: '📋' },
]

export default function BottomTabBar() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex bg-gray-900/95 backdrop-blur border-t border-gray-800 pb-safe">
      {tabs.map(({ to, label, icon }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) =>
            `flex-1 flex flex-col items-center py-2 text-xs gap-0.5 transition-colors ${
              isActive ? 'text-cyan-400' : 'text-gray-500'
            }`
          }
        >
          <span className="text-xl">{icon}</span>
          <span>{label}</span>
        </NavLink>
      ))}
    </nav>
  )
}
