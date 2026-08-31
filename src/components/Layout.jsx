import Sidebar from './Sidebar'
import TopBar from './TopBar'

export default function Layout({ title, breadcrumb, children }) {
  return (
    <div className="flex h-screen overflow-hidden bg-[#F4F3EF]">
      <Sidebar />
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <TopBar title={title} breadcrumb={breadcrumb} />
        <main className="flex-1 overflow-y-auto scrollbar-page px-8 py-7">
          {children}
        </main>
      </div>
    </div>
  )
}
