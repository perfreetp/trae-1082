import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell,
  FileText,
  Clock,
  AlertTriangle,
  Check,
  CheckCheck,
  Trash2,
  ChevronRight,
  RefreshCw,
} from 'lucide-react';
import { useAppStore } from '@/store';
import { formatDateTime } from '@/utils';
import type { MessageType } from '@/types';

type FilterType = 'all' | MessageType;

export default function Messages() {
  const navigate = useNavigate();
  const { messages, markMessageAsRead, markAllMessagesAsRead, deleteMessage } = useAppStore();
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');

  const filters: { key: FilterType; label: string; icon: typeof Bell }[] = [
    { key: 'all', label: '全部消息', icon: Bell },
    { key: 'system', label: '系统通知', icon: Bell },
    { key: 'review', label: '审核消息', icon: FileText },
    { key: 'change', label: '变更消息', icon: RefreshCw },
    { key: 'expiry', label: '到期提醒', icon: Clock },
    { key: 'warning', label: '安全警示', icon: AlertTriangle },
  ];

  const filteredMessages =
    activeFilter === 'all'
      ? messages
      : messages.filter((m) => m.type === activeFilter);

  const getMessageIcon = (type: MessageType) => {
    switch (type) {
      case 'system':
        return <Bell className="w-5 h-5 text-blue-500" />;
      case 'review':
        return <FileText className="w-5 h-5 text-purple-500" />;
      case 'change':
        return <RefreshCw className="w-5 h-5 text-indigo-500" />;
      case 'expiry':
        return <Clock className="w-5 h-5 text-orange-500" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-red-500" />;
    }
  };

  const getMessageBgColor = (type: MessageType, read: boolean) => {
    if (read) return 'bg-white';
    switch (type) {
      case 'system':
        return 'bg-blue-50';
      case 'review':
        return 'bg-purple-50';
      case 'change':
        return 'bg-indigo-50';
      case 'expiry':
        return 'bg-orange-50';
      case 'warning':
        return 'bg-red-50';
    }
  };

  const handleMessageClick = (msg: typeof messages[0]) => {
    markMessageAsRead(msg.id);
    if (msg.declarationId) {
      navigate(`/review?id=${msg.declarationId}`);
    }
  };

  const unreadCount = messages.filter((m) => !m.read).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">消息中心</h2>
          <p className="text-gray-500 mt-1">查看系统通知、审核消息和到期提醒</p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllMessagesAsRead}
            className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          >
            <CheckCheck className="w-4 h-4" />
            全部已读
          </button>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="flex border-b border-gray-200">
          {filters.map((filter) => (
            <button
              key={filter.key}
              onClick={() => setActiveFilter(filter.key)}
              className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                activeFilter === filter.key
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <filter.icon className="w-4 h-4" />
              {filter.label}
              {filter.key === 'all' && unreadCount > 0 && (
                <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                  {unreadCount}
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="divide-y divide-gray-100">
          {filteredMessages.length === 0 ? (
            <div className="py-16 text-center text-gray-400">
              <Bell className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg">暂无消息</p>
            </div>
          ) : (
            filteredMessages.map((msg) => (
              <div
                key={msg.id}
                onClick={() => handleMessageClick(msg)}
                className={`p-5 cursor-pointer transition-colors hover:bg-gray-50 ${getMessageBgColor(msg.type, msg.read)}`}
              >
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-white rounded-lg shadow-sm">
                    {getMessageIcon(msg.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-gray-800">{msg.title}</h4>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-400">
                          {formatDateTime(msg.createdAt)}
                        </span>
                        {!msg.read && (
                          <span className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0" />
                        )}
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">{msg.content}</p>
                    {msg.declarationId && (
                      <div className="flex items-center gap-1 mt-2 text-xs text-blue-600">
                        查看相关申报
                        <ChevronRight className="w-3 h-3" />
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    {!msg.read && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          markMessageAsRead(msg.id);
                        }}
                        className="p-1.5 hover:bg-gray-200 rounded-lg transition-colors"
                        title="标为已读"
                      >
                        <Check className="w-4 h-4 text-gray-400" />
                      </button>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm('确定要删除这条消息吗？')) {
                          deleteMessage(msg.id);
                        }
                      }}
                      className="p-1.5 hover:bg-red-100 hover:text-red-600 rounded-lg transition-colors"
                      title="删除"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-5">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-6 h-6 text-yellow-500 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-semibold text-yellow-800">黑名单风险提示</h4>
            <p className="text-sm text-yellow-700 mt-1">
              请注意：逾期未完成飞行且未申请撤销的申报将被记入不良记录，累计 3 次将被列入黑名单，
              届时将无法进行新的申报。请及时处理您的申报事项。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
