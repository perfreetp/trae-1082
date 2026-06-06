import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
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
} from 'lucide-react';
import { useAppStore } from '@/store';
import {
  statusLabels,
  statusColors,
  taskTypeLabels,
  riskLevelLabels,
  riskLevelColors,
} from '@/data/mockData';
import { formatDate, formatDateTime } from '@/utils';

export default function Review() {
  const [searchParams] = useSearchParams();
  const { declarations } = useAppStore();
  const [selectedId, setSelectedId] = useState<string | null>(
    searchParams.get('id') || declarations[0]?.id || null
  );
  const [showOpinion, setShowOpinion] = useState<Record<string, boolean>>({});

  const selectedDeclaration = declarations.find((d) => d.id === selectedId);

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

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">审核流转</h2>
        <p className="text-gray-500 mt-1">跟踪申报审核进度，查看审核意见</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="p-4 border-b border-gray-200">
            <h3 className="font-semibold text-gray-800">申报列表</h3>
          </div>
          <div className="divide-y divide-gray-100 max-h-[600px] overflow-y-auto">
            {declarations.map((dec) => (
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
            ))}
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
                    <div className="flex items-center gap-4 mt-2">
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
                  <div className="flex gap-2">
                    {selectedDeclaration.status === 'draft' && (
                      <>
                        <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                          <Edit3 className="w-4 h-4" />
                          编辑
                        </button>
                        <button className="flex items-center gap-2 px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors">
                          <Trash2 className="w-4 h-4" />
                          删除
                        </button>
                      </>
                    )}
                    {selectedDeclaration.status === 'reviewing' && (
                      <>
                        <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                          <RefreshCw className="w-4 h-4" />
                          变更申请
                        </button>
                        <button className="flex items-center gap-2 px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors">
                          <XCircle className="w-4 h-4" />
                          撤销申请
                        </button>
                      </>
                    )}
                    {selectedDeclaration.status === 'approved' && (
                      <button className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors">
                        <Download className="w-4 h-4" />
                        下载许可文件
                      </button>
                    )}
                    {selectedDeclaration.status === 'correction' && (
                      <button className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
                        <Edit3 className="w-4 h-4" />
                        补正材料
                      </button>
                    )}
                  </div>
                </div>

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
                    <p className="font-medium text-gray-800">
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
                    <p className="font-medium text-gray-800">
                      {formatDateTime(selectedDeclaration.createdAt)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-6">审核进度</h3>
                <div className="relative">
                  {selectedDeclaration.reviewSteps?.map((step, index) => (
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
              </div>

              {selectedDeclaration.status === 'correction' && (
                <div className="bg-orange-50 border border-orange-200 rounded-xl p-6">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-6 h-6 text-orange-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-orange-800">补正通知</h4>
                      <p className="text-sm text-orange-700 mt-2">
                        您的申报存在以下问题，请补正后重新提交：
                      </p>
                      <ul className="mt-2 text-sm text-orange-700 list-disc list-inside space-y-1">
                        <li>缺少安全应急预案文件</li>
                        <li>飞行器适航证扫描件不清晰，请重新上传</li>
                      </ul>
                      <button className="mt-4 px-4 py-2 bg-orange-500 text-white rounded-lg text-sm hover:bg-orange-600 transition-colors">
                        立即补正
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {selectedDeclaration.status === 'approved' && (
                <div className="bg-green-50 border border-green-200 rounded-xl p-6">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-green-800">审核通过</h4>
                      <p className="text-sm text-green-700 mt-2">
                        恭喜您的申报已通过审核，飞行许可已生成。请在飞行前下载并携带许可文件。
                      </p>
                      <div className="mt-4 flex items-center gap-3">
                        <button className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg text-sm hover:bg-green-600 transition-colors">
                          <Download className="w-4 h-4" />
                          下载飞行许可证
                        </button>
                        <button className="flex items-center gap-2 px-4 py-2 border border-green-500 text-green-700 rounded-lg text-sm hover:bg-green-100 transition-colors">
                          <FileText className="w-4 h-4" />
                          查看详情
                        </button>
                      </div>
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
    </div>
  );
}
