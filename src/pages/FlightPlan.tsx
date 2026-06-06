import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MapPin,
  Calendar,
  Plane,
  AlertTriangle,
  Save,
  Send,
  ChevronRight,
  ChevronLeft,
  Camera,
  Map,
  Search,
  PartyPopper,
  GraduationCap,
  Layers,
  Gauge,
} from 'lucide-react';
import { useAppStore } from '@/store';
import type { TaskType, RiskLevel } from '@/types';
import { taskTypeLabels } from '@/data/mockData';

type StepType = 'basic' | 'airspace' | 'risk' | 'confirm';

export default function FlightPlan() {
  const navigate = useNavigate();
  const { aircraft, airspaces } = useAppStore();
  const [currentStep, setCurrentStep] = useState<StepType>('basic');
  const [formData, setFormData] = useState({
    title: '',
    taskType: '' as TaskType | '',
    description: '',
    airspace: '',
    altitudeMin: 50,
    altitudeMax: 120,
    startDate: '',
    endDate: '',
    startTime: '08:00',
    endTime: '18:00',
    frequency: 'once',
    selectedAircraft: [] as string[],
    riskAnswers: {} as Record<string, string>,
  });

  const steps = [
    { key: 'basic', label: '基本信息', icon: Layers },
    { key: 'airspace', label: '空域时间', icon: Calendar },
    { key: 'risk', label: '风险自评', icon: AlertTriangle },
    { key: 'confirm', label: '确认提交', icon: Send },
  ];

  const taskTypes = [
    { key: 'aerial_photography', label: '航拍', icon: Camera },
    { key: 'mapping', label: '测绘', icon: Map },
    { key: 'inspection', label: '巡检', icon: Search },
    { key: 'performance', label: '表演', icon: PartyPopper },
    { key: 'training', label: '训练', icon: GraduationCap },
    { key: 'other', label: '其他', icon: Layers },
  ];

  const riskQuestions = [
    {
      id: 'q1',
      question: '飞行区域是否在机场净空保护区内？',
      options: ['是', '否', '不确定'],
    },
    {
      id: 'q2',
      question: '飞行区域是否有密集人群或重要设施？',
      options: ['是', '否', '部分区域有'],
    },
    {
      id: 'q3',
      question: '预计飞行时长是否超过4小时？',
      options: ['是', '否'],
    },
    {
      id: 'q4',
      question: '是否有应急处置预案？',
      options: ['有详细预案', '有简单预案', '无预案'],
    },
  ];

  const calculateRiskScore = (): { score: number; level: RiskLevel } => {
    let score = 0;
    if (formData.riskAnswers['q1'] === '是') score += 30;
    else if (formData.riskAnswers['q1'] === '不确定') score += 10;

    if (formData.riskAnswers['q2'] === '是') score += 25;
    else if (formData.riskAnswers['q2'] === '部分区域有') score += 15;

    if (formData.riskAnswers['q3'] === '是') score += 15;

    if (formData.riskAnswers['q4'] === '有简单预案') score += 5;
    else if (formData.riskAnswers['q4'] === '无预案') score += 20;

    let level: RiskLevel = 'low';
    if (score >= 60) level = 'high';
    else if (score >= 30) level = 'medium';

    return { score, level };
  };

  const riskResult = calculateRiskScore();

  const handleSaveDraft = () => {
    alert('草稿已保存！');
  };

  const handleSubmit = () => {
    alert('申报已提交！');
    navigate('/review');
  };

  const handleNext = () => {
    const stepIndex = steps.findIndex((s) => s.key === currentStep);
    if (stepIndex < steps.length - 1) {
      setCurrentStep(steps[stepIndex + 1].key as StepType);
    }
  };

  const handlePrev = () => {
    const stepIndex = steps.findIndex((s) => s.key === currentStep);
    if (stepIndex > 0) {
      setCurrentStep(steps[stepIndex - 1].key as StepType);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">飞行计划申报</h2>
          <p className="text-gray-500 mt-1">填写飞行计划信息并完成风险评估</p>
        </div>
        <button
          onClick={handleSaveDraft}
          className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <Save className="w-4 h-4" />
          保存草稿
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-8">
          {steps.map((step, index) => (
            <div key={step.key} className="flex items-center">
              <div className="flex flex-col items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                    steps.findIndex((s) => s.key === currentStep) >= index
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  <step.icon className="w-5 h-5" />
                </div>
                <span className="text-sm mt-2 text-gray-600">{step.label}</span>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`w-20 h-1 mx-4 rounded ${
                    steps.findIndex((s) => s.key === currentStep) > index
                      ? 'bg-blue-500'
                      : 'bg-gray-200'
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {currentStep === 'basic' && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">申报标题</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="请输入申报标题，如：海淀区航拍任务"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">任务类型</label>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                {taskTypes.map((type) => (
                  <button
                    key={type.key}
                    onClick={() =>
                      setFormData({ ...formData, taskType: type.key as TaskType })
                    }
                    className={`p-4 rounded-lg border-2 transition-all flex flex-col items-center gap-2 ${
                      formData.taskType === type.key
                        ? 'border-blue-500 bg-blue-50 text-blue-600'
                        : 'border-gray-200 hover:border-gray-300 text-gray-600'
                    }`}
                  >
                    <type.icon className="w-6 h-6" />
                    <span className="text-sm font-medium">{type.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">任务描述</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="请详细描述飞行任务内容..."
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">选择飞行器</label>
              <div className="space-y-2">
                {aircraft
                  .filter((a) => a.status === 'bound')
                  .map((ac) => (
                    <label
                      key={ac.id}
                      className={`flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                        formData.selectedAircraft.includes(ac.id)
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={formData.selectedAircraft.includes(ac.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFormData({
                              ...formData,
                              selectedAircraft: [...formData.selectedAircraft, ac.id],
                            });
                          } else {
                            setFormData({
                              ...formData,
                              selectedAircraft: formData.selectedAircraft.filter(
                                (id) => id !== ac.id
                              ),
                            });
                          }
                        }}
                        className="w-5 h-5 text-blue-500 rounded"
                      />
                      <Plane className="w-5 h-5 text-gray-500" />
                      <div>
                        <p className="font-medium text-gray-800">{ac.model}</p>
                        <p className="text-sm text-gray-500">注册号：{ac.registrationNo}</p>
                      </div>
                    </label>
                  ))}
              </div>
            </div>
          </div>
        )}

        {currentStep === 'airspace' && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">选择空域</label>
              <div className="space-y-2">
                {airspaces.map((as) => (
                  <label
                    key={as.id}
                    className={`flex items-start gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      formData.airspace === as.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="airspace"
                      checked={formData.airspace === as.id}
                      onChange={() => setFormData({ ...formData, airspace: as.id })}
                      className="w-5 h-5 text-blue-500 mt-0.5"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-gray-500" />
                        <p className="font-medium text-gray-800">{as.name}</p>
                        <span
                          className={`px-2 py-0.5 text-xs rounded-full ${
                            as.type === 'controlled'
                              ? 'bg-yellow-100 text-yellow-700'
                              : as.type === 'restricted'
                              ? 'bg-orange-100 text-orange-700'
                              : as.type === 'prohibited'
                              ? 'bg-red-100 text-red-700'
                              : 'bg-green-100 text-green-700'
                          }`}
                        >
                          {as.type === 'controlled'
                            ? '管制'
                            : as.type === 'restricted'
                            ? '限制'
                            : as.type === 'prohibited'
                            ? '禁止'
                            : '非管制'}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">{as.description}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        高度范围：{as.altitudeMin}m - {as.altitudeMax}m
                      </p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">最低飞行高度（米）</label>
                <input
                  type="number"
                  value={formData.altitudeMin}
                  onChange={(e) =>
                    setFormData({ ...formData, altitudeMin: Number(e.target.value) })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">最高飞行高度（米）</label>
                <input
                  type="number"
                  value={formData.altitudeMax}
                  onChange={(e) =>
                    setFormData({ ...formData, altitudeMax: Number(e.target.value) })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">开始日期</label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">结束日期</label>
                <input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">每日开始时间</label>
                <input
                  type="time"
                  value={formData.startTime}
                  onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">每日结束时间</label>
                <input
                  type="time"
                  value={formData.endTime}
                  onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">飞行频次</label>
              <select
                value={formData.frequency}
                onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              >
                <option value="once">单次飞行</option>
                <option value="daily">每日</option>
                <option value="weekly">每周</option>
                <option value="monthly">每月</option>
              </select>
            </div>
          </div>
        )}

        {currentStep === 'risk' && (
          <div className="space-y-6">
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-6 h-6 text-blue-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-blue-800">风险自评说明</p>
                  <p className="text-sm text-blue-600 mt-1">
                    请如实回答以下问题，系统将自动评估您的飞行风险等级。虚假申报将承担相应法律责任。
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {riskQuestions.map((q, index) => (
                <div key={q.id} className="p-4 bg-gray-50 rounded-lg">
                  <p className="font-medium text-gray-800 mb-3">
                    {index + 1}. {q.question}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {q.options.map((opt) => (
                      <button
                        key={opt}
                        onClick={() =>
                          setFormData({
                            ...formData,
                            riskAnswers: { ...formData.riskAnswers, [q.id]: opt },
                          })
                        }
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                          formData.riskAnswers[q.id] === opt
                            ? 'bg-blue-500 text-white'
                            : 'bg-white border border-gray-300 text-gray-700 hover:border-blue-300'
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h4 className="font-semibold text-gray-800 mb-4">风险评估结果</h4>
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-3">
                  <Gauge className="w-8 h-8 text-blue-500" />
                  <div>
                    <p className="text-2xl font-bold text-gray-800">{riskResult.score}</p>
                    <p className="text-sm text-gray-500">风险分值</p>
                  </div>
                </div>
                <div className="w-px h-12 bg-gray-200" />
                <div>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      riskResult.level === 'high'
                        ? 'bg-red-100 text-red-700'
                        : riskResult.level === 'medium'
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-green-100 text-green-700'
                    }`}
                  >
                    {riskResult.level === 'high'
                      ? '高风险'
                      : riskResult.level === 'medium'
                      ? '中风险'
                      : '低风险'}
                  </span>
                  <p className="text-sm text-gray-500 mt-2">
                    {riskResult.level === 'high'
                      ? '需要额外的安全措施和人工审核'
                      : riskResult.level === 'medium'
                      ? '请关注风险点，做好安全预案'
                      : '风险可控，可正常申报'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {currentStep === 'confirm' && (
          <div className="space-y-6">
            <div className="bg-green-50 rounded-lg p-4 mb-6">
              <p className="text-green-800 font-medium">
                请确认以下信息无误后提交申报
              </p>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-500">申报标题</p>
                  <p className="font-medium text-gray-800 mt-1">
                    {formData.title || '未填写'}
                  </p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-500">任务类型</p>
                  <p className="font-medium text-gray-800 mt-1">
                    {formData.taskType ? taskTypeLabels[formData.taskType] : '未选择'}
                  </p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-500">飞行空域</p>
                  <p className="font-medium text-gray-800 mt-1">
                    {formData.airspace
                      ? airspaces.find((a) => a.id === formData.airspace)?.name
                      : '未选择'}
                  </p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-500">飞行时间</p>
                  <p className="font-medium text-gray-800 mt-1">
                    {formData.startDate && formData.endDate
                      ? `${formData.startDate} 至 ${formData.endDate}`
                      : '未设置'}
                  </p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-500">高度范围</p>
                  <p className="font-medium text-gray-800 mt-1">
                    {formData.altitudeMin}m - {formData.altitudeMax}m
                  </p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-500">风险等级</p>
                  <span
                    className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium mt-1 ${
                      riskResult.level === 'high'
                        ? 'bg-red-100 text-red-700'
                        : riskResult.level === 'medium'
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-green-100 text-green-700'
                    }`}
                  >
                    {riskResult.level === 'high'
                      ? '高风险'
                      : riskResult.level === 'medium'
                      ? '中风险'
                      : '低风险'}
                  </span>
                </div>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500">任务描述</p>
                <p className="text-gray-800 mt-1">
                  {formData.description || '无'}
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
          <button
            onClick={handlePrev}
            disabled={currentStep === 'basic'}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors ${
              currentStep === 'basic'
                ? 'text-gray-400 cursor-not-allowed'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <ChevronLeft className="w-5 h-5" />
            上一步
          </button>

          {currentStep === 'confirm' ? (
            <button
              onClick={handleSubmit}
              className="flex items-center gap-2 bg-blue-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-600 transition-colors"
            >
              <Send className="w-5 h-5" />
              提交申报
            </button>
          ) : (
            <button
              onClick={handleNext}
              className="flex items-center gap-2 bg-blue-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-600 transition-colors"
            >
              下一步
              <ChevronRight className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
