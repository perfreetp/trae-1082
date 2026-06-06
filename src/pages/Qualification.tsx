import { useState } from 'react';
import {
  User,
  Building2,
  Plane,
  CheckCircle,
  XCircle,
  Clock,
  Upload,
  Plus,
  Trash2,
  Shield,
  FileText,
  CreditCard,
  X,
  Save,
  AlertCircle,
} from 'lucide-react';
import { useAppStore } from '@/store';
import { maskIdCard, maskPhone, formatDate } from '@/utils';

type TabType = 'personal' | 'enterprise' | 'aircraft';

export default function Qualification() {
  const { user, aircraft, updateUser, addAircraft, removeAircraft, unbindAircraft, addEnterpriseMaterial, removeEnterpriseMaterial } = useAppStore();
  const [activeTab, setActiveTab] = useState<TabType>('personal');
  const [idCardFront, setIdCardFront] = useState<string | null>(user.idCardFront || null);
  const [idCardBack, setIdCardBack] = useState<string | null>(user.idCardBack || null);
  const [showAddAircraft, setShowAddAircraft] = useState(false);
  const [newAircraft, setNewAircraft] = useState({
    model: '',
    registrationNo: '',
    airworthinessCert: '',
    expiryDate: '',
  });

  const tabs = [
    { key: 'personal', label: '实名认证', icon: User },
    { key: 'enterprise', label: '企业授权', icon: Building2 },
    { key: 'aircraft', label: '飞行器管理', icon: Plane },
  ];

  const aircraftStatusColors: Record<string, string> = {
    bound: 'bg-green-100 text-green-600',
    unbound: 'bg-gray-100 text-gray-600',
    expired: 'bg-red-100 text-red-600',
  };

  const aircraftStatusLabels: Record<string, string> = {
    bound: '已绑定',
    unbound: '已解绑',
    expired: '已过期',
  };

  const handleFileUpload = (type: 'front' | 'back') => {
    const fileName = type === 'front' ? '身份证人像面.jpg' : '身份证国徽面.jpg';
    const mockUrl = `/mock/id-card-${type}.jpg`;
    
    if (type === 'front') {
      setIdCardFront(mockUrl);
    } else {
      setIdCardBack(mockUrl);
    }
    alert(`${fileName} 上传成功`);
  };

  const handleSubmitVerification = () => {
    if (!idCardFront || !idCardBack) {
      alert('请先上传身份证正反面照片');
      return;
    }
    updateUser({
      realNameVerified: true,
      idCardFront,
      idCardBack,
      verificationDate: new Date().toISOString(),
    });
    alert('实名认证提交成功，已自动通过审核（演示环境）');
  };

  const handleAddAircraft = () => {
    if (!newAircraft.model || !newAircraft.registrationNo || !newAircraft.airworthinessCert) {
      alert('请填写完整的飞行器信息');
      return;
    }

    const isExpired = newAircraft.expiryDate && new Date(newAircraft.expiryDate) < new Date();
    
    addAircraft({
      model: newAircraft.model,
      registrationNo: newAircraft.registrationNo,
      airworthinessCert: newAircraft.airworthinessCert,
      status: isExpired ? 'expired' : 'bound',
      expiryDate: newAircraft.expiryDate || null,
    });

    setNewAircraft({ model: '', registrationNo: '', airworthinessCert: '', expiryDate: '' });
    setShowAddAircraft(false);
    alert('飞行器添加成功');
  };

  const handleRemoveAircraft = (id: string) => {
    if (confirm('确定要删除该飞行器吗？')) {
      removeAircraft(id);
    }
  };

  const handleUploadEnterpriseMaterial = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.pdf,.doc,.docx,.jpg,.jpeg,.png';
    input.onchange = (e: any) => {
      const file = e.target.files?.[0];
      if (file) {
        addEnterpriseMaterial({
          name: file.name,
          url: `/uploads/${file.name}`,
          size: file.size,
        });
        alert(`${file.name} 上传成功`);
      }
    };
    input.click();
  };

  const handleRemoveEnterpriseMaterial = (materialId: string) => {
    if (confirm('确定要删除该材料吗？')) {
      removeEnterpriseMaterial(materialId);
    }
  };

  const handleUnbindAircraft = (id: string) => {
    if (confirm('确定要解绑该飞行器吗？解绑后该飞行器将无法在新申报中被选中，但记录会保留。')) {
      unbindAircraft(id);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">主体资质</h2>
        <p className="text-gray-500 mt-1">管理您的实名认证、企业授权和飞行器信息</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="border-b border-gray-200">
          <nav className="flex">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as TabType)}
                className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.key
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'personal' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800">个人信息</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">姓名</label>
                      <div className="flex items-center gap-2 px-4 py-3 bg-gray-50 rounded-lg">
                        <User className="w-5 h-5 text-gray-400" />
                        <span className="text-gray-800">{user.name}</span>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">身份证号</label>
                      <div className="flex items-center gap-2 px-4 py-3 bg-gray-50 rounded-lg">
                        <CreditCard className="w-5 h-5 text-gray-400" />
                        <span className="text-gray-800">{maskIdCard(user.idCard)}</span>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">手机号</label>
                      <div className="flex items-center gap-2 px-4 py-3 bg-gray-50 rounded-lg">
                        <FileText className="w-5 h-5 text-gray-400" />
                        <span className="text-gray-800">{maskPhone(user.phone)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">认证状态</h3>
                <div className={`flex items-center gap-4 p-4 rounded-lg ${user.realNameVerified ? 'bg-green-50' : 'bg-blue-50'}`}>
                  {user.realNameVerified ? (
                    <CheckCircle className="w-8 h-8 text-green-500" />
                  ) : (
                    <XCircle className="w-8 h-8 text-red-500" />
                  )}
                  <div>
                    <p className="font-medium text-gray-800">
                      {user.realNameVerified ? '实名认证已通过' : '实名认证待认证'}
                    </p>
                    <p className="text-sm text-gray-500">
                      {user.realNameVerified
                        ? '您的身份信息已通过审核'
                        : '请上传身份证正反面照片完成实名认证'}
                    </p>
                  </div>
                  {!user.realNameVerified && (
                    <button
                      onClick={handleSubmitVerification}
                      className="ml-auto bg-blue-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-600 transition-colors flex items-center gap-2"
                    >
                      <Save className="w-4 h-4" />
                      提交认证
                    </button>
                  )}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">证件照片</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                    {idCardFront ? (
                      <div className="space-y-2">
                        <div className="bg-green-50 p-4 rounded-lg">
                          <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
                          <p className="text-sm text-green-600 font-medium">身份证人像面已上传</p>
                        </div>
                        <p className="text-xs text-gray-400">点击重新上传</p>
                      </div>
                    ) : (
                      <>
                        <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-500">身份证人像面</p>
                        <p className="text-xs text-gray-400 mt-1">点击上传</p>
                      </>
                    )}
                    <input
                      type="file"
                      className="hidden"
                      id="id-card-front"
                      accept="image/*"
                      onChange={() => handleFileUpload('front')}
                    />
                    <label
                      htmlFor="id-card-front"
                      className="cursor-pointer block mt-2 text-sm text-blue-600 hover:text-blue-700"
                    >
                      选择文件
                    </label>
                  </div>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                    {idCardBack ? (
                      <div className="space-y-2">
                        <div className="bg-green-50 p-4 rounded-lg">
                          <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
                          <p className="text-sm text-green-600 font-medium">身份证国徽面已上传</p>
                        </div>
                        <p className="text-xs text-gray-400">点击重新上传</p>
                      </div>
                    ) : (
                      <>
                        <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-500">身份证国徽面</p>
                        <p className="text-xs text-gray-400 mt-1">点击上传</p>
                      </>
                    )}
                    <input
                      type="file"
                      className="hidden"
                      id="id-card-back"
                      accept="image/*"
                      onChange={() => handleFileUpload('back')}
                    />
                    <label
                      htmlFor="id-card-back"
                      className="cursor-pointer block mt-2 text-sm text-blue-600 hover:text-blue-700"
                    >
                      选择文件
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'enterprise' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800">企业信息</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">企业名称</label>
                      <div className="flex items-center gap-2 px-4 py-3 bg-gray-50 rounded-lg">
                        <Building2 className="w-5 h-5 text-gray-400" />
                        <span className="text-gray-800">{user.enterpriseName}</span>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">统一社会信用代码</label>
                      <div className="flex items-center gap-2 px-4 py-3 bg-gray-50 rounded-lg">
                        <Shield className="w-5 h-5 text-gray-400" />
                        <span className="text-gray-800">{user.creditCode}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">企业认证状态</h3>
                <div className="flex items-center gap-4 p-4 bg-green-50 rounded-lg">
                  {user.enterpriseVerified ? (
                    <CheckCircle className="w-8 h-8 text-green-500" />
                  ) : (
                    <Clock className="w-8 h-8 text-yellow-500" />
                  )}
                  <div>
                    <p className="font-medium text-gray-800">
                      {user.enterpriseVerified ? '企业认证已通过' : '企业认证审核中'}
                    </p>
                    <p className="text-sm text-gray-500">
                      {user.enterpriseVerified
                        ? '您的企业信息已通过审核'
                        : '您的企业认证正在审核中，请耐心等待'}
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">企业资质文件</h3>
                <div className="space-y-3">
                  {user.enterpriseMaterials?.map((mat) => (
                    <div key={mat.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <FileText className="w-5 h-5 text-blue-500" />
                        <div>
                          <p className="font-medium text-gray-800">{mat.name}</p>
                          <p className="text-xs text-gray-500">
                            {mat.size ? `${(mat.size / 1024 / 1024).toFixed(1)} MB · ` : ''}
                            上传时间：{formatDate(mat.uploadedAt)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {mat.status === 'verified' && (
                          <CheckCircle className="w-5 h-5 text-green-500" />
                        )}
                        {mat.status === 'uploaded' && (
                          <span className="text-xs px-2 py-0.5 bg-yellow-100 text-yellow-600 rounded">审核中</span>
                        )}
                        {mat.status === 'rejected' && (
                          <span className="text-xs px-2 py-0.5 bg-red-100 text-red-600 rounded">已驳回</span>
                        )}
                        <button
                          onClick={() => handleRemoveEnterpriseMaterial(mat.id)}
                          className="p-1.5 hover:bg-red-100 rounded-lg transition-colors"
                          title="删除"
                        >
                          <Trash2 className="w-4 h-4 text-gray-400 hover:text-red-500" />
                        </button>
                      </div>
                    </div>
                  ))}
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-blue-400 transition-colors">
                    <button
                      onClick={handleUploadEnterpriseMaterial}
                      className="w-full flex items-center justify-center gap-2 text-gray-500 hover:text-blue-600 transition-colors"
                    >
                      <Upload className="w-5 h-5" />
                      <span>上传补充资质材料</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'aircraft' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-800">我的飞行器</h3>
                <button
                  onClick={() => setShowAddAircraft(true)}
                  className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-600 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  添加飞行器
                </button>
              </div>

              {showAddAircraft && (
                <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-semibold text-gray-800">添加新飞行器</h4>
                    <button
                      onClick={() => setShowAddAircraft(false)}
                      className="p-1 hover:bg-gray-200 rounded-lg transition-colors"
                    >
                      <X className="w-5 h-5 text-gray-500" />
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">飞行器型号 *</label>
                      <input
                        type="text"
                        value={newAircraft.model}
                        onChange={(e) => setNewAircraft({ ...newAircraft, model: e.target.value })}
                        placeholder="如：DJI Matrice 300 RTK"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">注册号 *</label>
                      <input
                        type="text"
                        value={newAircraft.registrationNo}
                        onChange={(e) => setNewAircraft({ ...newAircraft, registrationNo: e.target.value })}
                        placeholder="如：B-0001"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">适航证号 *</label>
                      <input
                        type="text"
                        value={newAircraft.airworthinessCert}
                        onChange={(e) => setNewAircraft({ ...newAircraft, airworthinessCert: e.target.value })}
                        placeholder="如：AW-2024-0001"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">适航证到期日</label>
                      <input
                        type="date"
                        value={newAircraft.expiryDate}
                        onChange={(e) => setNewAircraft({ ...newAircraft, expiryDate: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-3 mt-4">
                    <button
                      onClick={() => setShowAddAircraft(false)}
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm hover:bg-gray-100 transition-colors"
                    >
                      取消
                    </button>
                    <button
                      onClick={handleAddAircraft}
                      className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600 transition-colors flex items-center gap-2"
                    >
                      <Save className="w-4 h-4" />
                      保存
                    </button>
                  </div>
                </div>
              )}

              {aircraft.some((ac) => ac.status === 'expired') && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-yellow-800">过期飞行器提示</h4>
                      <p className="text-sm text-yellow-700 mt-1">
                        您有飞行器的适航证已过期，过期的飞行器将无法在新的申报中被选中。请及时更新适航证。
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {aircraft.map((ac) => (
                  <div key={ac.id} className="border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-4">
                      <div className="p-3 bg-blue-100 rounded-lg">
                        <Plane className="w-6 h-6 text-blue-600" />
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${aircraftStatusColors[ac.status]}`}>
                        {aircraftStatusLabels[ac.status]}
                      </span>
                    </div>
                    <h4 className="font-semibold text-gray-800 mb-1">{ac.model}</h4>
                    <div className="space-y-2 text-sm text-gray-500">
                      <p>注册号：{ac.registrationNo}</p>
                      <p>适航证：{ac.airworthinessCert}</p>
                      <p>绑定时间：{formatDate(ac.boundAt)}</p>
                      {ac.expiryDate && (
                        <p className={ac.status === 'expired' ? 'text-red-500' : ''}>
                          到期日：{formatDate(ac.expiryDate)}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100">
                      <button
                        onClick={() => alert('查看飞行器详情（演示环境）')}
                        className="flex-1 text-sm text-blue-600 hover:text-blue-700 py-2"
                      >
                        查看详情
                      </button>
                      {ac.status === 'bound' && (
                        <button
                          onClick={() => handleUnbindAircraft(ac.id)}
                          className="text-sm text-orange-600 hover:text-orange-700 p-2"
                          title="解绑飞行器"
                        >
                          解绑
                        </button>
                      )}
                      {ac.status === 'unbound' && (
                        <button
                          onClick={() => alert('重新绑定功能（演示环境）')}
                          className="text-sm text-green-600 hover:text-green-700 p-2"
                          title="重新绑定"
                        >
                          绑定
                        </button>
                      )}
                      <button
                        onClick={() => handleRemoveAircraft(ac.id)}
                        className="text-sm text-red-600 hover:text-red-700 p-2"
                        title="删除飞行器"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {aircraft.length === 0 && (
                <div className="text-center py-16 text-gray-400">
                  <Plane className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p>暂无飞行器信息</p>
                  <p className="text-sm mt-1">点击"添加飞行器"开始绑定您的无人机</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
