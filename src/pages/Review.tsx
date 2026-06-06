import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Download,
  Edit3,
  Trash2,
  FileText,
  User,
  Calendar,
  MapPin,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  RefreshCw,
  X,
  Send,
  Plane,
  ThumbsUp,
  ThumbsDown,
  FileCheck,
  AlertTriangle,
  Eye,
} from 'lucide-react';
import { useAppStore } from '@/store';
import {
  statusLabels,
  statusColors,
  taskTypeLabels,
  riskLevelLabels,
  riskLevelColors,
} from '@/data/mockData';
import { formatDate, formatDateTime, formatFileSize } from '@/utils';

type ModalType = 'approve' | 'reject' | 'correction' | 'acceptChange' | 'supplementChange' | 'approveChange' | 'rejectChange' | null;

export default function Review() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const {
    declarations,
    aircraft,
    setCurrentDeclaration,
    deleteDeclaration,
    requestChange,
    requestRevocation,
    resubmitAfterCorrection,
    downloadLicence,
    getMissingRequiredMaterials,
    isBlacklisted,
    getBlacklistRecord,
    approveDeclaration,
    rejectDeclaration,
    requestCorrection,
    acceptChange,
    requestChangeSupplement,
    approveChange,
    rejectChange,
  } = useAppStore();
  const blacklisted = isBlacklisted();
  const blacklistRecord = getBlacklistRecord();

  const [selectedId, setSelectedId] = useState<string | null>(
    searchParams.get('id') || declarations[0]?.id || null
  );
  const [showOpinion, setShowOpinion] = useState<Record<string, boolean>>({});
  const [showChangeModal, setShowChangeModal] = useState(false);
  const [showRevokeModal, setShowRevokeModal] = useState(false);
  const [changeReason, setChangeReason] = useState('');
  const [revokeReason, setRevokeReason] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [modalType, setModalType] = useState<ModalType>(null);
  const [reviewOpinion, setReviewOpinion] = useState('');

  useEffect(() => {
    if (selectedId) {
      setSearchParams({ id: selectedId });
    }
  }, [selectedId, setSearchParams]);

  const selectedDeclaration = declarations.find((d) => d.id === selectedId);

  const filteredDeclarations = statusFilter === 'all'
    ? declarations
    : declarations.filter((d) => d.status === statusFilter);

  const toggleOpinion = (stepId: string) => {
    setShowOpinion((prev) => ({ ...prev, [stepId]: !prev[stepId] }));
  };

  const getStepIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-6 h-6 text-green-500" />;
      case 'processing':
        return <Clock className="w-6 h-6 text-blue-500 animate-pulse" />;
      case 'rejected':
        return <XCircle className="w-6 h-6 text-red-500" />;
      default:
        return <div className="w-6 h-6 rounded-full bg-gray-300" />;
    }
  };

  const handleEdit = () => {
    if (selectedId) {
      setCurrentDeclaration(selectedId);
      navigate(`/flight-plan/${selectedId}`);
    }
  };

  const handleDelete = () => {
    if (selectedId && confirm('确定要删除此草稿吗？此操作不可撤销。')) {
      deleteDeclaration(selectedId);
      setSelectedId(declarations.find((d) => d.id !== selectedId)?.id || null);
    }
  };

  const handleCorrectMaterial = () => {
    if (selectedId) {
      setCurrentDeclaration(selectedId);
      navigate('/materials');
    }
  };

  const handleSubmitChange = () => {
    if (selectedId && changeReason.trim()) {
      requestChange(selectedId, changeReason);
      setShowChangeModal(false);
      setChangeReason('');
      alert('变更申请已提交！');
    }
  };

  const handleSubmitRevoke = () => {
    if (selectedId && revokeReason.trim()) {
      requestRevocation(selectedId, revokeReason);
      setShowRevokeModal(false);
      setRevokeReason('');
      alert('撤销申请已提交！');
    }
  };

  const handleResubmit = () => {
    if (selectedId) {
      const missing = getMissingRequiredMaterials(selectedId);
      if (missing.length > 0) {
        alert(`还有以下必填材料未上传：\n${missing.join('、')}\n请先补正材料。`);
        return;
      }
      resubmitAfterCorrection(selectedId);
      alert('补正材料已重新提交审核！');
    }
  };

  const handleDownloadLicence = () => {
    if (selectedId) {
      downloadLicence(selectedId);
    }
  };

  const getAircraftModels = (aircraftIds: string[]) => {
    return aircraftIds
      .map((id) => aircraft.find((a) => a.id === id)?.model)
      .filter(Boolean)
      .join('、');
  };

  const openModal = (type: ModalType) => {
    setModalType(type);
    setReviewOpinion('');
  };

  const closeModal = () => {
    setModalType(null);
    setReviewOpinion('');
  };

  const handleReviewAction = () => {
    if (!selectedId) return;

    switch (modalType) {
      case 'approve':
        approveDeclaration(selectedId);
        alert('申报已通过！许可文件已生成。');
        break;
      case 'reject':
        if (!reviewOpinion.trim()) {
          alert('请填写驳回意见');
          return;
        }
        rejectDeclaration(selectedId, reviewOpinion);
        alert('申报已驳回');
        break;
      case 'correction':
        if (!reviewOpinion.trim()) {
          alert('请填写补正意见');
          return;
        }
        requestCorrection(selectedId, reviewOpinion);
        alert('补正通知已发送');
        break;
      case 'acceptChange':
        acceptChange(selectedId);
        alert('变更申请已受理');
        break;
      case 'supplementChange':
        if (!reviewOpinion.trim()) {
          alert('请填写补充说明要求');
          return;
        }
        requestChangeSupplement(selectedId, reviewOpinion);
        alert('补充说明要求已发送');
        break;
      case 'approveChange':
        if (!reviewOpinion.trim()) {
          alert('请填写审核意见');
          return;
        }
        approveChange(selectedId, reviewOpinion);
        alert('变更申请已通过');
        break;
      case 'rejectChange':
        if (!reviewOpinion.trim()) {
          alert('请填写驳回原因');
          return;
        }
        rejectChange(selectedId, reviewOpinion);
        alert('变更申请已驳回');
        break;
    }
    closeModal();
  };

  const changeStatusLabels: Record<string, string> = {
    requested: '已申请',
    reviewing: '审核中',
    supplement: '待补充',
    approved: '已通过',
    rejected: '已驳回',
  };

  const changeStatusColors: Record<string, string> = {
    requested: 'bg-blue-100 text-blue-600',
    reviewing: 'bg-yellow-100 text-yellow-600',
    supplement: 'bg-orange-100 text-orange-600',
    approved: 'bg-green-100 text-green-600',
    rejected: 'bg-red-100 text-red-600',
  };

  const getModalConfig = () => {
    switch (modalType) {
      case 'approve':
        return { title: '通过申报', desc: '确认通过此申报？通过后将生成飞行许可文件。', showOpinion: false, confirmText: '确认通过' };
      case 'reject':
        return { title: '驳回申报', desc: '请填写驳回原因，申请人将收到通知。', showOpinion: true, confirmText: '确认驳回', opinionLabel: '驳回原因' };
      case 'correction':
        return { title: '发补正通知', desc: '请说明需要补正的内容，申请人将收到通知。', showOpinion: true, confirmText: '发送通知', opinionLabel: '补正要求' };
      case 'acceptChange':
        return { title: '受理变更申请', desc: '确认受理此变更申请？', showOpinion: false, confirmText: '确认受理' };
      case 'supplementChange':
        return { title: '要求补充说明', desc: '请说明需要补充哪些信息。', showOpinion: true, confirmText: '发送要求', opinionLabel: '补充说明要求' };
      case 'approveChange':
        return { title: '通过变更申请', desc: '请填写审核意见。', showOpinion: true, confirmText: '确认通过', opinionLabel: '审核意见' };
      case 'rejectChange':
        return { title: '驳回变更申请', desc: '请填写驳回原因。', showOpinion: true, confirmText: '确认驳回', opinionLabel: '驳回原因' };
      default:
        return { title: '', desc: '', showOpinion: false, confirmText: '确认' };
    }
  };

  const modalConfig = getModalConfig();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">审核流转</h2>
          <p className="text-gray-500 mt-1">跟踪申报审核进度，查看审核意见</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          >
            <option value="all">全部状态</option>
            <option value="draft">草稿</option>
            <option value="reviewing">审核中</option>
            <option value="changing">变更申请中</option>
            <option value="change_reviewing">变更审核中</option>
            <option value="change_approved">变更已通过</option>
            <option value="change_rejected">变更已驳回</option>
            <option value="correction">待补正</option>
            <option value="approved">已通过</option>
            <option value="rejected">已驳回</option>
            <option value="revoked">已撤销</option>
          </select>
          <button
            onClick={() => {
              if (blacklisted) {
                alert(
                  `您已被列入黑名单（原因：${blacklistRecord?.reason || '未知'}），` +
                    `处罚期至 ${blacklistRecord ? formatDate(blacklistRecord.expiryDate) : '未知'}，` +
                    `无法进行新的申报。如有异议，请联系监管部门申诉。`
                );
                return;
              }
              setCurrentDeclaration(null);
              navigate('/flight-plan');
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              blacklisted
                ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                : 'bg-blue-500 text-white hover:bg-blue-600'
            }`}
            disabled={blacklisted}
          >
            <Edit3 className="w-4 h-4" />
            新建申报
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="p-4 border-b border-gray-200 flex items-center justify-between">
            <h3 className="font-semibold text-gray-800">申报列表</h3>
            <span className="text-sm text-gray-500">{filteredDeclarations.length} 条</span>
          </div>
          <div className="divide-y divide-gray-100 max-h-[600px] overflow-y-auto">
            {filteredDeclarations.length === 0 ? (
              <div className="p-8 text-center text-gray-400">
                <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>暂无申报记录</p>
              </div>
            ) : (
              filteredDeclarations.map((dec) => (
                <div
                  key={dec.id}
                  onClick={() => setSelectedId(dec.id)}
                  className={`p-4 cursor-pointer transition-colors ${
                    selectedId === dec.id ? 'bg-blue-50' : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-800 truncate">{dec.title}</p>
                      <p className="text-sm text-gray-500 mt-1">
                        {taskTypeLabels[dec.taskType]} · {formatDate(dec.createdAt)}
                      </p>
                    </div>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium flex-shrink-0 ml-2 ${statusColors[dec.status]}`}
                    >
                      {statusLabels[dec.status]}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          {selectedDeclaration ? (
            <>
              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">
                      {selectedDeclaration.title}
                    </h3>
                    <div className="flex items-center gap-4 mt-2 flex-wrap">
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[selectedDeclaration.status]}`}
                      >
                        {statusLabels[selectedDeclaration.status]}
                      </span>
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${riskLevelColors[selectedDeclaration.riskLevel]}`}
                      >
                        {riskLevelLabels[selectedDeclaration.riskLevel]}
                      </span>
                      <span className="text-sm text-gray-500">
                        申报编号：{selectedDeclaration.id.toUpperCase()}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    {selectedDeclaration.status === 'draft' && (
                      <>
                        <button
                          onClick={handleEdit}
                          className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          <Edit3 className="w-4 h-4" />
                          继续编辑
                        </button>
                        <button
                          onClick={handleDelete}
                          className="flex items-center gap-2 px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                          删除
                        </button>
                      </>
                    )}
                    {selectedDeclaration.status === 'reviewing' && (
                      <>
                        <button
                          onClick={() => setShowChangeModal(true)}
                          className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          <RefreshCw className="w-4 h-4" />
                          变更申请
                        </button>
                        <button
                          onClick={() => setShowRevokeModal(true)}
                          className="flex items-center gap-2 px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                        >
                          <XCircle className="w-4 h-4" />
                          撤销申请
                        </button>
                        <div className="border-l border-gray-200 mx-1" />
                        <button
                          onClick={() => openModal('approve')}
                          className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                        >
                          <ThumbsUp className="w-4 h-4" />
                          通过
                        </button>
                        <button
                          onClick={() => openModal('correction')}
                          className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                        >
                          <AlertTriangle className="w-4 h-4" />
                          发补正
                        </button>
                        <button
                          onClick={() => openModal('reject')}
                          className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                        >
                          <ThumbsDown className="w-4 h-4" />
                          驳回
                        </button>
                      </>
                    )}
                    {(selectedDeclaration.status === 'changing') && (
                      <>
                        <button
                          onClick={() => openModal('acceptChange')}
                          className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                        >
                          <FileCheck className="w-4 h-4" />
                          受理变更
                        </button>
                        <button
                          onClick={() => openModal('rejectChange')}
                          className="flex items-center gap-2 px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                        >
                          <ThumbsDown className="w-4 h-4" />
                          直接驳回
                        </button>
                      </>
                    )}
                    {selectedDeclaration.status === 'change_reviewing' && (
                      <>
                        <button
                          onClick={() => openModal('supplementChange')}
                          className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                        >
                          <MessageSquare className="w-4 h-4" />
                          要求补充
                        </button>
                        <button
                          onClick={() => openModal('approveChange')}
                          className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                        >
                          <ThumbsUp className="w-4 h-4" />
                          通过变更
                        </button>
                        <button
                          onClick={() => openModal('rejectChange')}
                          className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                        >
                          <ThumbsDown className="w-4 h-4" />
                          驳回变更
                        </button>
                      </>
                    )}
                    {selectedDeclaration.status === 'approved' && (
                      <button
                        onClick={handleDownloadLicence}
                        className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                      >
                        <Download className="w-4 h-4" />
                        下载许可文件
                      </button>
                    )}
                    {selectedDeclaration.status === 'correction' && (
                      <div className="flex gap-2">
                        <button
                          onClick={handleCorrectMaterial}
                          className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                        >
                          <Edit3 className="w-4 h-4" />
                          补正材料
                        </button>
                        <button
                          onClick={handleResubmit}
                          className="flex items-center gap-2 px-4 py-2 border border-blue-500 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
                        >
                          <Send className="w-4 h-4" />
                          重新提交
                        </button>
                      </div>
                    )}
                    {selectedDeclaration.status === 'changing' && (
                      <span className="text-sm text-purple-600 bg-purple-50 px-3 py-2 rounded-lg">
                        变更处理中，请等待审核
                      </span>
                    )}
                  </div>
                </div>

                {selectedDeclaration.changeReason && (
                  <div className="mb-6 p-4 bg-purple-50 border border-purple-200 rounded-lg">
                    <div className="flex items-start gap-3">
                      <RefreshCw className="w-5 h-5 text-purple-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-purple-800">最新变更申请</h4>
                        <p className="text-sm text-purple-600 mt-1">
                          <span className="text-purple-500">变更原因：</span>
                          {selectedDeclaration.changeReason}
                        </p>
                        {selectedDeclaration.changeRequestedAt && (
                          <p className="text-xs text-purple-500 mt-1">
                            申请时间：{formatDateTime(selectedDeclaration.changeRequestedAt)}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
                      <MapPin className="w-4 h-4" />
                      飞行空域
                    </div>
                    <p className="font-medium text-gray-800">
                      {selectedDeclaration.flightPlan?.airspaceName || '未设置'}
                    </p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
                      <Calendar className="w-4 h-4" />
                      飞行时间
                    </div>
                    <p className="font-medium text-gray-800 text-sm">
                      {selectedDeclaration.flightPlan
                        ? `${formatDate(selectedDeclaration.flightPlan.startTime)} 至 ${formatDate(selectedDeclaration.flightPlan.endTime)}`
                        : '未设置'}
                    </p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
                      <FileText className="w-4 h-4" />
                      任务类型
                    </div>
                    <p className="font-medium text-gray-800">
                      {taskTypeLabels[selectedDeclaration.taskType]}
                    </p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
                      <User className="w-4 h-4" />
                      提交时间
                    </div>
                    <p className="font-medium text-gray-800 text-sm">
                      {formatDateTime(selectedDeclaration.createdAt)}
                    </p>
                  </div>
                </div>

                {selectedDeclaration.flightPlan?.aircraftIds && selectedDeclaration.flightPlan.aircraftIds.length > 0 && (
                  <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2 text-gray-500 text-sm mb-2">
                      <Plane className="w-4 h-4" />
                      使用飞行器
                    </div>
                    <p className="font-medium text-gray-800">
                      {getAircraftModels(selectedDeclaration.flightPlan.aircraftIds) || '未选择'}
                    </p>
                  </div>
                )}

                {selectedDeclaration.description && (
                  <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-500 mb-1">任务描述</p>
                    <p className="text-gray-800">{selectedDeclaration.description}</p>
                  </div>
                )}

                {selectedDeclaration.materials && selectedDeclaration.materials.length > 0 && (
                  <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-500 mb-2">已上传材料</p>
                    <div className="space-y-2">
                      {selectedDeclaration.materials.map((mat) => (
                        <div key={mat.id} className="flex items-center justify-between p-2 bg-white rounded">
                          <div className="flex items-center gap-2">
                            <FileText className="w-4 h-4 text-blue-500" />
                            <span className="text-sm text-gray-700">{mat.name}</span>
                            <span className="text-xs text-gray-400">{formatFileSize(mat.size)}</span>
                          </div>
                          <span className={`text-xs px-2 py-0.5 rounded ${
                            mat.status === 'verified' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'
                          }`}>
                            {mat.status === 'verified' ? '已核验' : '已上传'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {selectedDeclaration.changeRecords && selectedDeclaration.changeRecords.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">变更记录</h3>
                  <div className="space-y-4">
                    {selectedDeclaration.changeRecords.map((record) => (
                      <div key={record.id} className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <RefreshCw className="w-4 h-4 text-purple-500" />
                            <span className="font-medium text-gray-800">变更申请</span>
                          </div>
                          <span className={`text-xs px-2 py-1 rounded-full ${changeStatusColors[record.status]}`}>
                            {changeStatusLabels[record.status]}
                          </span>
                        </div>
                        <div className="space-y-1 text-sm">
                          <p className="text-gray-600">
                            <span className="text-gray-400">申请原因：</span>{record.reason}
                          </p>
                          <p className="text-gray-500">申请时间：{formatDateTime(record.requestedAt)}</p>
                          {record.acceptedAt && (
                            <p className="text-gray-500">受理时间：{formatDateTime(record.acceptedAt)}</p>
                          )}
                          {record.processedAt && (
                            <p className="text-gray-500">处理时间：{formatDateTime(record.processedAt)}</p>
                          )}
                          {record.processor && (
                            <p className="text-gray-500">处理人：{record.processor}</p>
                          )}
                          {record.opinion && (
                            <p className="text-gray-600 mt-2 p-2 bg-white rounded">
                              <span className="text-gray-400">处理意见：</span>{record.opinion}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-6">审核进度</h3>
                {selectedDeclaration.reviewSteps && selectedDeclaration.reviewSteps.length > 0 ? (
                  <div className="relative">
                    {selectedDeclaration.reviewSteps.map((step, index) => (
                      <div key={step.id} className="relative pb-8 last:pb-0">
                        {index < (selectedDeclaration.reviewSteps?.length || 0) - 1 && (
                          <div
                            className={`absolute left-3 top-8 w-0.5 h-full ${
                              step.status === 'completed'
                                ? 'bg-green-500'
                                : 'bg-gray-200'
                            }`}
                          />
                        )}
                        <div className="flex items-start gap-4">
                          {getStepIcon(step.status)}
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <div>
                                <h4 className="font-medium text-gray-800">{step.stepName}</h4>
                                {step.reviewer && (
                                  <p className="text-sm text-gray-500 mt-1">
                                    审核人：{step.reviewer}
                                    {step.reviewedAt &&
                                      ` · ${formatDateTime(step.reviewedAt)}`}
                                  </p>
                                )}
                              </div>
                              {step.opinion && (
                                <button
                                  onClick={() => toggleOpinion(step.id)}
                                  className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"
                                >
                                  <MessageSquare className="w-4 h-4" />
                                  查看意见
                                  {showOpinion[step.id] ? (
                                    <ChevronUp className="w-4 h-4" />
                                  ) : (
                                    <ChevronDown className="w-4 h-4" />
                                  )}
                                </button>
                              )}
                            </div>
                            {showOpinion[step.id] && step.opinion && (
                              <div className="mt-3 p-4 bg-blue-50 rounded-lg">
                                <p className="text-sm text-gray-700">{step.opinion}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-400">
                    <Clock className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>暂无审核进度</p>
                  </div>
                )}
              </div>

              {selectedDeclaration.status === 'correction' && (
                <div className="bg-orange-50 border border-orange-200 rounded-xl p-6">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-6 h-6 text-orange-500 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <h4 className="font-semibold text-orange-800">补正通知</h4>
                      <p className="text-sm text-orange-700 mt-2">
                        您的申报存在以下问题，请补正后重新提交：
                      </p>
                      {selectedDeclaration.reviewSteps?.find((s) => s.status === 'rejected')?.opinion && (
                        <div className="mt-2 p-3 bg-white bg-opacity-50 rounded-lg">
                          <p className="text-sm text-orange-800">
                            {selectedDeclaration.reviewSteps.find((s) => s.status === 'rejected')?.opinion}
                          </p>
                        </div>
                      )}
                      <div className="mt-4 flex items-center gap-3">
                        <button
                          onClick={handleCorrectMaterial}
                          className="px-4 py-2 bg-orange-500 text-white rounded-lg text-sm hover:bg-orange-600 transition-colors"
                        >
                          立即补正
                        </button>
                        <button
                          onClick={handleResubmit}
                          className="px-4 py-2 border border-orange-500 text-orange-700 rounded-lg text-sm hover:bg-orange-100 transition-colors"
                        >
                          补正完成，重新提交
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {selectedDeclaration.status === 'approved' && (
                <div className="bg-green-50 border border-green-200 rounded-xl p-6">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <h4 className="font-semibold text-green-800">审核通过</h4>
                      <p className="text-sm text-green-700 mt-2">
                        恭喜您的申报已通过审核，飞行许可已生成。请在飞行前下载并携带许可文件。
                      </p>
                      <div className="mt-4 flex items-center gap-3">
                        <button
                          onClick={handleDownloadLicence}
                          className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg text-sm hover:bg-green-600 transition-colors"
                        >
                          <Download className="w-4 h-4" />
                          下载飞行许可证
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {selectedDeclaration.status === 'revoked' && (
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
                  <div className="flex items-start gap-3">
                    <XCircle className="w-6 h-6 text-gray-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-gray-800">申报已撤销</h4>
                      <p className="text-sm text-gray-600 mt-2">
                        此申报已被撤销，如需重新申请请创建新的申报。
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {selectedDeclaration.status === 'rejected' && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-6">
                  <div className="flex items-start gap-3">
                    <XCircle className="w-6 h-6 text-red-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-red-800">申报已驳回</h4>
                      <p className="text-sm text-red-700 mt-2">
                        很抱歉，您的申报未能通过审核。如有疑问请联系监管部门。
                      </p>
                      {selectedDeclaration.reviewSteps?.find((s) => s.status === 'rejected')?.opinion && (
                        <div className="mt-2 p-3 bg-white bg-opacity-50 rounded-lg">
                          <p className="text-sm text-red-800">
                            驳回原因：{selectedDeclaration.reviewSteps.find((s) => s.status === 'rejected')?.opinion}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="bg-white rounded-xl shadow-sm p-12 text-center text-gray-400">
              <FileText className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p>请选择一个申报查看详情</p>
            </div>
          )}
        </div>
      </div>

      {showChangeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800">提交变更申请</h3>
              <button
                onClick={() => setShowChangeModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                变更原因 <span className="text-red-500">*</span>
              </label>
              <textarea
                value={changeReason}
                onChange={(e) => setChangeReason(e.target.value)}
                placeholder="请详细说明变更原因..."
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
              />
            </div>
            <div className="flex justify-end gap-3 p-4 border-t border-gray-200">
              <button
                onClick={() => setShowChangeModal(false)}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleSubmitChange}
                disabled={!changeReason.trim()}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  changeReason.trim()
                    ? 'bg-blue-500 text-white hover:bg-blue-600'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                提交申请
              </button>
            </div>
          </div>
        </div>
      )}

      {showRevokeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800">撤销申报</h3>
              <button
                onClick={() => setShowRevokeModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4">
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4">
                <p className="text-sm text-amber-800">
                  ⚠️ 撤销后将无法恢复，确定要撤销此申报吗？
                </p>
              </div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                撤销原因 <span className="text-red-500">*</span>
              </label>
              <textarea
                value={revokeReason}
                onChange={(e) => setRevokeReason(e.target.value)}
                placeholder="请说明撤销原因..."
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
              />
            </div>
            <div className="flex justify-end gap-3 p-4 border-t border-gray-200">
              <button
                onClick={() => setShowRevokeModal(false)}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleSubmitRevoke}
                disabled={!revokeReason.trim()}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  revokeReason.trim()
                    ? 'bg-red-500 text-white hover:bg-red-600'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                确认撤销
              </button>
            </div>
          </div>
        </div>
      )}

      {modalType && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800">{modalConfig.title}</h3>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4">
              <p className="text-sm text-gray-600 mb-4">{modalConfig.desc}</p>
              {modalConfig.showOpinion && (
                <>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {modalConfig.opinionLabel} <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={reviewOpinion}
                    onChange={(e) => setReviewOpinion(e.target.value)}
                    placeholder={`请填写${modalConfig.opinionLabel}...`}
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
                  />
                </>
              )}
            </div>
            <div className="flex justify-end gap-3 p-4 border-t border-gray-200">
              <button
                onClick={closeModal}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleReviewAction}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  modalType === 'approve' || modalType === 'acceptChange' || modalType === 'approveChange'
                    ? 'bg-green-500 text-white hover:bg-green-600'
                    : modalType === 'reject' || modalType === 'rejectChange'
                    ? 'bg-red-500 text-white hover:bg-red-600'
                    : 'bg-blue-500 text-white hover:bg-blue-600'
                }`}
              >
                {modalConfig.confirmText}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
