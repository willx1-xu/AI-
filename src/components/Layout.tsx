import { Outlet } from 'react-router-dom'
import BottomTabBar from './BottomTabBar'

export default function Layout() {
  return (
    <div className="h-full flex flex-col">
      <main className="flex-1 overflow-y-auto pb-16 pt-safe">
        <Outlet />
      </main>
      <BottomTabBar />
    </div>
  )
}
