import { NavLink } from 'react-router-dom';
import {
  Home,
  UserCheck,
  PlaneTakeoff,
  FileUp,
  ClipboardCheck,
  MessageSquare,
  Archive,
  Search,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useAppStore } from '@/store';

const menuItems = [
  { path: '/', icon: Home, label: '申报首页' },
  { path: '/qualification', icon: UserCheck, label: '主体资质' },
  { path: '/flight-plan', icon: PlaneTakeoff, label: '飞行计划' },
  { path: '/materials', icon: FileUp, label: '材料上传' },
  { path: '/review', icon: ClipboardCheck, label: '审核流转' },
  { path: '/messages', icon: MessageSquare, label: '消息中心' },
  { path: '/archive', icon: Archive, label: '历史档案' },
  { path: '/supervision', icon: Search, label: '监管查询' },
];

export function Sidebar() {
  const { sidebarCollapsed, toggleSidebar, getUnreadMessageCount } = useAppStore();
  const unreadCount = getUnreadMessageCount();

  return (
    <aside
      className={`fixed left-0 top-0 h-screen bg-slate-900 text-white transition-all duration-300 z-40 ${
        sidebarCollapsed ? 'w-16' : 'w-60'
      }`}
    >
      <div className="flex items-center justify-between h-16 px-4 border-b border-slate-700">
        {!sidebarCollapsed && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
              <PlaneTakeoff className="w-5 h-5" />
            </div>
            <span className="font-bold text-lg">低空申报</span>
          </div>
        )}
        {sidebarCollapsed && (
          <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center mx-auto">
            <PlaneTakeoff className="w-5 h-5" />
          </div>
        )}
        <button
          onClick={toggleSidebar}
          className="p-1 hover:bg-slate-700 rounded transition-colors"
        >
          {sidebarCollapsed ? (
            <ChevronRight className="w-5 h-5" />
          ) : (
            <ChevronLeft className="w-5 h-5" />
          )}
        </button>
      </div>

      <nav className="mt-4 px-2">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-3 rounded-lg mb-1 transition-all duration-200 ${
                isActive
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`
            }
          >
            <item.icon className="w-5 h-5 flex-shrink-0" />
            {!sidebarCollapsed && (
              <span className="flex-1 text-sm font-medium">{item.label}</span>
            )}
            {!sidebarCollapsed && item.path === '/messages' && unreadCount > 0 && (
              <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                {unreadCount}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      {!sidebarCollapsed && (
        <div className="absolute bottom-4 left-4 right-4">
          <div className="bg-slate-800 rounded-lg p-3">
            <p className="text-xs text-slate-400 mb-2">系统公告</p>
            <p className="text-xs text-slate-300">
              2024年低空飞行安全新规已发布，请及时了解最新政策。
            </p>
          </div>
        </div>
      )}
    </aside>
  );
}
