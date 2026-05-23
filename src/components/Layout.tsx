import { Outlet } from 'react-router-dom'

export default function Layout() {
  return (
    <div className="h-full flex flex-col">
      <main className="flex-1 overflow-y-auto pt-safe">
        <Outlet />
      </main>
    </div>
  )
}
