import { useState, useMemo } from 'react';
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
  MessageSquare,
  ChevronDown,
  ChevronUp,
  X,
  Eye,
} from 'lucide-react';
import { useAppStore } from '@/store';
import { formatDateTime } from '@/utils';
import type { Message, MessageType, Declaration } from '@/types';

type FilterType = 'all' | 'system' | 'review' | 'change' | 'expiry' | 'warning';

export default function Messages() {
  const navigate = useNavigate();
  const { messages, markMessageAsRead, markAllMessagesAsRead, deleteMessage, declarations, getDeclarationById } = useAppStore();
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [expandedDeclaration, setExpandedDeclaration] = useState<string | null>(null);
  const [selectedDeclarationDetail, setSelectedDeclarationDetail] = useState<Declaration | null>(null);

  const filters: { key: FilterType; label: string; icon: typeof Bell }[] = [
    { key: 'all', label: '全部消息', icon: Bell },
    { key: 'system', label: '系统通知', icon: Bell },
    { key: 'review', label: '审核消息', icon: FileText },
    { key: 'change', label: '变更消息', icon: RefreshCw },
    { key: 'expiry', label: '到期提醒', icon: Clock },
    { key: 'warning', label: '安全警示', icon: AlertTriangle },
  ];

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

  const filteredMessages = useMemo(() => {
    if (activeFilter === 'all') return messages;
    return messages.filter((m) => m.type === activeFilter);
  }, [messages, activeFilter]);

  const groupedMessages = useMemo(() => {
    const groups: Record<string, Message[]> = { standalone: [] };
    filteredMessages.forEach((msg) => {
      if (msg.declarationId) {
        if (!groups[msg.declarationId]) {
          groups[msg.declarationId] = [];
        }
        groups[msg.declarationId].push(msg);
      } else {
        groups.standalone.push(msg);
      }
    });
    return groups;
  }, [filteredMessages]);

  const sortedDeclarationIds = useMemo(() => {
    return Object.keys(groupedMessages)
      .filter((id) => id !== 'standalone')
      .sort((a, b) => {
        const latestA = groupedMessages[a].reduce((latest, msg) =>
          new Date(msg.createdAt) > new Date(latest.createdAt) ? msg : latest
        , groupedMessages[a][0]);
        const latestB = groupedMessages[b].reduce((latest, msg) =>
          new Date(msg.createdAt) > new Date(latest.createdAt) ? msg : latest
        , groupedMessages[b][0]);
        return new Date(latestB.createdAt).getTime() - new Date(latestA.createdAt).getTime();
      });
  }, [groupedMessages]);

  const unreadCount = messages.filter((m) => !m.read).length;

  const handleViewDeclaration = (declarationId: string) => {
    const declaration = getDeclarationById(declarationId);
    if (declaration) {
      setSelectedDeclarationDetail(declaration);
      groupedMessages[declarationId]?.forEach((msg) => {
        if (!msg.read) {
          markMessageAsRead(msg.id);
        }
      });
    }
  };

  const handleMessageClick = (msg: Message) => {
    if (!msg.read) {
      markMessageAsRead(msg.id);
    }
    if (msg.declarationId) {
      navigate(`/review?id=${msg.declarationId}`);
    }
  };

  const unreadCountByDeclaration = (declarationId: string) => {
    return groupedMessages[declarationId]?.filter((m) => !m.read).length || 0;
  };

  const getDeclarationTitle = (declarationId: string) => {
    const dec = getDeclarationById(declarationId);
    return dec?.title || '未知申报';
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">消息中心</h2>
        <p className="text-gray-500 mt-1">查看系统通知、审核进度和变更消息</p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex flex-wrap gap-2">
          {filters.map((filter) => (
            <button
              key={filter.key}
              onClick={() => setActiveFilter(filter.key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeFilter === filter.key
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
            >
              <filter.icon className="w-4 h-4" />
              {filter.label}
            </button>
          ))}
        </div>
        <div className="flex-1" />
        <button
          onClick={markAllMessagesAsRead}
          className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg text-sm transition-colors"
        >
          <CheckCheck className="w-4 h-4" />
          全部已读
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          {sortedDeclarationIds.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-gray-500 flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                申报相关消息
              </h3>
              {sortedDeclarationIds.map((declarationId) => {
                const msgs = groupedMessages[declarationId];
                const latestMsg = msgs[0];
                const unread = unreadCountByDeclaration(declarationId);
                const isExpanded = expandedDeclaration === declarationId;

                return (
                  <div
                    key={declarationId}
                    className={`bg-white rounded-xl border border-gray-200 overflow-hidden transition-all ${unread > 0 ? 'shadow-sm' : ''}`}
                  >
                    <div
                      className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                      onClick={() => setExpandedDeclaration(isExpanded ? null : declarationId)}
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className={`p-2 rounded-lg ${getMessageBgColor(latestMsg.type, false)}`}>
                          {getMessageIcon(latestMsg.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium text-gray-800 truncate">
                              {getDeclarationTitle(declarationId)}
                            </h4>
                            {unread > 0 && (
                              <span className="flex-shrink-0 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                                {unread}
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-500 truncate mt-0.5">
                            {latestMsg.title}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        <span className="text-xs text-gray-400 flex-shrink-0">
                          {formatDateTime(latestMsg.createdAt)}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewDeclaration(declarationId);
                          }}
                          className="flex items-center gap-1 px-3 py-1.5 text-blue-600 hover:bg-blue-50 rounded-lg text-sm transition-colors flex-shrink-0"
                        >
                          <Eye className="w-4 h-4" />
                          查看申报
                        </button>
                        {isExpanded ? (
                          <ChevronUp className="w-5 h-5 text-gray-400 flex-shrink-0" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />
                        )}
                      </div>
                    </div>
                    {isExpanded && (
                      <div className="border-t border-gray-100">
                        {msgs
                          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                          .map((msg) => (
                            <div
                              key={msg.id}
                              className={`p-4 border-b border-gray-50 last:border-b-0 ${getMessageBgColor(msg.type, msg.read)} cursor-pointer hover:bg-gray-50 transition-colors`}
                              onClick={() => handleMessageClick(msg)}
                            >
                              <div className="flex items-start gap-3">
                                <div className="flex-shrink-0 mt-0.5">
                                  {getMessageIcon(msg.type)}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center justify-between gap-2">
                                    <h5 className="font-medium text-gray-800">{msg.title}</h5>
                                    <span className="text-xs text-gray-400 flex-shrink-0">
                                      {formatDateTime(msg.createdAt)}
                                    </span>
                                  </div>
                                  <p className="text-sm text-gray-600 mt-1">{msg.content}</p>
                                </div>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    deleteMessage(msg.id);
                                  }}
                                  className="text-gray-400 hover:text-red-500 transition-colors flex-shrink-0"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {groupedMessages.standalone.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-gray-500 flex items-center gap-2">
                <Bell className="w-4 h-4" />
                系统通知
              </h3>
              {groupedMessages.standalone.map((msg) => (
                <div
                  key={msg.id}
                  className={`${getMessageBgColor(msg.type, msg.read)} border border-gray-200 rounded-xl p-4 cursor-pointer hover:shadow-sm transition-all`}
                  onClick={() => handleMessageClick(msg)}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-0.5">
                      {getMessageIcon(msg.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h4 className="font-medium text-gray-800">{msg.title}</h4>
                        <span className="text-xs text-gray-400 flex-shrink-0">
                          {formatDateTime(msg.createdAt)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{msg.content}</p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteMessage(msg.id);
                      }}
                      className="text-gray-400 hover:text-red-500 transition-colors flex-shrink-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {filteredMessages.length === 0 && (
            <div className="bg-white rounded-xl shadow-sm p-16 text-center text-gray-400">
              <Bell className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p>暂无相关消息</p>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="font-semibold text-gray-800 mb-4">消息概览</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">未读消息</span>
                <span className={`font-semibold ${unreadCount > 0 ? 'text-red-500' : 'text-gray-400'}`}>
                  {unreadCount}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">消息总数</span>
                <span className="font-semibold text-gray-800">{messages.length}</span>
              </div>
              <div className="h-px bg-gray-100 my-3" />
              <div className="space-y-2">
                {filters.map((filter) => {
                  const count = messages.filter((m) =>
                    filter.key === 'all' ? true : m.type === filter.key
                  ).length;
                  return (
                    <div key={filter.key} className="flex items-center justify-between text-sm">
                      <span className="text-gray-500 flex items-center gap-2">
                        <filter.icon className="w-4 h-4" />
                        {filter.label}
                      </span>
                      <span className="text-gray-700 font-medium">{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {selectedDeclarationDetail && (
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-800">申报详情</h3>
                <button
                  onClick={() => setSelectedDeclarationDetail(null)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-3">
                <div>
                  <p className="font-medium text-gray-800">{selectedDeclarationDetail.title}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    编号：{selectedDeclarationDetail.id.toUpperCase()}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">状态：</span>
                  <span className="text-sm font-medium">
                    {selectedDeclarationDetail.status === 'approved' ? (
                      <span className="text-green-600">已通过</span>
                    ) : selectedDeclarationDetail.status === 'rejected' ? (
                      <span className="text-red-600">已驳回</span>
                    ) : selectedDeclarationDetail.status === 'reviewing' ? (
                      <span className="text-yellow-600">审核中</span>
                    ) : selectedDeclarationDetail.status === 'changing' || selectedDeclarationDetail.status === 'change_reviewing' ? (
                      <span className="text-purple-600">变更处理中</span>
                    ) : selectedDeclarationDetail.status === 'change_approved' ? (
                      <span className="text-green-600">变更已通过</span>
                    ) : selectedDeclarationDetail.status === 'change_rejected' ? (
                      <span className="text-red-600">变更已驳回</span>
                    ) : (
                      <span className="text-gray-600">{selectedDeclarationDetail.status}</span>
                    )}
                  </span>
                </div>
                {selectedDeclarationDetail.lastChangeResult && (
                  <div className="p-3 bg-gray-50 rounded-lg text-sm">
                    <p className="text-gray-700">
                      最近变更结果：
                      <span className={selectedDeclarationDetail.lastChangeResult === 'approved' ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
                        {selectedDeclarationDetail.lastChangeResult === 'approved' ? '已通过' : '已驳回'}
                      </span>
                    </p>
                    {selectedDeclarationDetail.lastChangeOpinion && (
                      <p className="text-gray-500 mt-1">
                        处理意见：{selectedDeclarationDetail.lastChangeOpinion}
                      </p>
                    )}
                    {selectedDeclarationDetail.lastChangeProcessedAt && (
                      <p className="text-gray-400 text-xs mt-1">
                        处理时间：{formatDateTime(selectedDeclarationDetail.lastChangeProcessedAt)}
                      </p>
                    )}
                  </div>
                )}
                <button
                  onClick={() => navigate(`/review?id=${selectedDeclarationDetail.id}`)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium"
                >
                  <ChevronRight className="w-4 h-4" />
                  查看完整详情
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
