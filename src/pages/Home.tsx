import { useNavigate } from 'react-router-dom';
import {
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  PlusCircle,
  FileEdit,
  UserCheck,
  AlertTriangle,
  ChevronRight,
  TrendingUp,
  BarChart3,
  Bell,
  Ban,
} from 'lucide-react';
import { useAppStore } from '@/store';
import { statusLabels, statusColors, taskTypeLabels } from '@/data/mockData';
import { formatDate } from '@/utils';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const monthlyData = [
  { name: '1月', count: 8 },
  { name: '2月', count: 12 },
  { name: '3月', count: 15 },
  { name: '4月', count: 10 },
  { name: '5月', count: 18 },
  { name: '6月', count: 22 },
];

export default function Home() {
  const navigate = useNavigate();
  const { declarations, messages, isBlacklisted, getBlacklistRecord, setCurrentDeclaration } = useAppStore();
  const blacklisted = isBlacklisted();
  const blacklistRecord = getBlacklistRecord();

  const draftDeclarations = declarations.filter((d) => d.status === 'draft');
  const latestDraft = draftDeclarations.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())[0];

  const stats = {
    total: declarations.length,
    reviewing: declarations.filter((d) =>
      ['reviewing', 'submitted', 'changing'].includes(d.status)
    ).length,
    approved: declarations.filter((d) => d.status === 'approved').length,
    rejected: declarations.filter((d) =>
      ['rejected', 'correction', 'revoked'].includes(d.status)
    ).length,
  };

  const unreadMessages = messages.filter((m) => !m.read).slice(0, 3);
  const recentDeclarations = declarations.slice(0, 3);

  const handleNewDeclaration = () => {
    if (blacklisted) {
      alert('您已被列入黑名单，无法进行新的申报。如有异议，请联系监管部门申诉。');
      return;
    }
    setCurrentDeclaration(null);
    navigate('/flight-plan');
  };

  const handleContinueDraft = () => {
    if (latestDraft) {
      setCurrentDeclaration(latestDraft.id);
      navigate(`/flight-plan/${latestDraft.id}`);
    } else {
      alert('暂无可继续编辑的草稿');
    }
  };

  const statCards = [
    { label: '申报总数', value: stats.total, icon: FileText, color: 'bg-blue-500', bgColor: 'bg-blue-50' },
    { label: '审核中', value: stats.reviewing, icon: Clock, color: 'bg-yellow-500', bgColor: 'bg-yellow-50' },
    { label: '已通过', value: stats.approved, icon: CheckCircle, color: 'bg-green-500', bgColor: 'bg-green-50' },
    { label: '待处理', value: stats.rejected, icon: XCircle, color: 'bg-red-500', bgColor: 'bg-red-50' },
  ];

  return (
    <div className="space-y-6">
      {blacklisted && blacklistRecord && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-5">
          <div className="flex items-start gap-3">
            <Ban className="w-6 h-6 text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-red-800">黑名单限制提示</h4>
              <p className="text-sm text-red-700 mt-1">
                您已被列入黑名单（原因：{blacklistRecord.reason}），处罚期至 {formatDate(blacklistRecord.expiryDate)}。
                在此期间无法进行新的飞行申报。如有异议可提交申诉。
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2">欢迎回来，张三</h2>
            <p className="text-blue-100">
              天空飞翔科技有限公司 | 您有 {stats.reviewing} 个申报正在审核，{stats.rejected} 个需要处理
            </p>
          </div>
          <button
            onClick={() => navigate('/flight-plan')}
            className="bg-white text-blue-600 px-6 py-3 rounded-lg font-medium hover:bg-blue-50 transition-colors flex items-center gap-2"
          >
            <PlusCircle className="w-5 h-5" />
            新建申报
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, index) => (
          <div
            key={index}
            className={`${card.bgColor} rounded-xl p-5 transition-all hover:shadow-md cursor-pointer`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className={`${card.color} p-2 rounded-lg`}>
                <card.icon className="w-6 h-6 text-white" />
              </div>
              <TrendingUp className="w-5 h-5 text-gray-400" />
            </div>
            <p className="text-3xl font-bold text-gray-800">{card.value}</p>
            <p className="text-sm text-gray-500 mt-1">{card.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">月度申报趋势</h3>
            <BarChart3 className="w-5 h-5 text-gray-400" />
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="count" fill="#3B82F6" radius={[4, 4, 0, 0]} name="申报数量" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">快捷操作</h3>
          </div>
          <div className="space-y-3">
            <button
              onClick={handleNewDeclaration}
              className={`w-full ${blacklisted ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600'} text-white p-4 rounded-lg transition-all hover:shadow-md flex items-center gap-3`}
              disabled={blacklisted}
            >
              <PlusCircle className="w-6 h-6" />
              <div className="text-left flex-1">
                <p className="font-medium">新建申报</p>
                <p className="text-xs opacity-90">开始新的飞行计划申报</p>
              </div>
              <ChevronRight className="w-5 h-5" />
            </button>
            <button
              onClick={handleContinueDraft}
              className={`w-full ${draftDeclarations.length === 0 ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-500 hover:bg-green-600'} text-white p-4 rounded-lg transition-all hover:shadow-md flex items-center gap-3`}
              disabled={draftDeclarations.length === 0}
            >
              <FileEdit className="w-6 h-6" />
              <div className="text-left flex-1">
                <p className="font-medium">继续草稿</p>
                <p className="text-xs opacity-90">
                  {draftDeclarations.length > 0 ? `${draftDeclarations.length} 份草稿待编辑` : '暂无可编辑的草稿'}
                </p>
              </div>
              <ChevronRight className="w-5 h-5" />
            </button>
            <button
              onClick={() => navigate('/qualification')}
              className="w-full bg-purple-500 hover:bg-purple-600 text-white p-4 rounded-lg transition-all hover:shadow-md flex items-center gap-3"
            >
              <UserCheck className="w-6 h-6" />
              <div className="text-left flex-1">
                <p className="font-medium">资质管理</p>
                <p className="text-xs opacity-90">完善主体和飞行器资质</p>
              </div>
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">最近申报</h3>
            <button
              onClick={() => navigate('/archive')}
              className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              查看全部 <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <div className="space-y-3">
            {recentDeclarations.map((dec) => (
              <div
                key={dec.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
                onClick={() => navigate(`/review?id=${dec.id}`)}
              >
                <div className="flex-1">
                  <p className="font-medium text-gray-800">{dec.title}</p>
                  <p className="text-sm text-gray-500">
                    {taskTypeLabels[dec.taskType]} · {formatDate(dec.createdAt)}
                  </p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[dec.status]}`}>
                  {statusLabels[dec.status]}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">消息通知</h3>
            <button
              onClick={() => navigate('/messages')}
              className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              查看全部 <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <div className="space-y-3">
            {unreadMessages.length > 0 ? (
              unreadMessages.map((msg) => (
                <div
                  key={msg.id}
                  className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg cursor-pointer hover:bg-blue-100 transition-colors"
                  onClick={() => navigate('/messages')}
                >
                  <div className="p-2 bg-blue-100 rounded-lg flex-shrink-0">
                    {msg.type === 'review' ? (
                      <FileText className="w-4 h-4 text-blue-600" />
                    ) : msg.type === 'expiry' ? (
                      <Clock className="w-4 h-4 text-orange-600" />
                    ) : msg.type === 'warning' ? (
                      <AlertTriangle className="w-4 h-4 text-red-600" />
                    ) : (
                      <Bell className="w-4 h-4 text-gray-600" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-800 text-sm">{msg.title}</p>
                    <p className="text-xs text-gray-500 truncate">{msg.content}</p>
                  </div>
                  <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-2" />
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-400">
                <Bell className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>暂无新消息</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
