import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Upload,
  FileText,
  X,
  CheckCircle,
  AlertCircle,
  Download,
  Trash2,
  File,
  Image,
  FileSpreadsheet,
  File as FileIcon,
  Save,
  Send,
  ArrowLeft,
  ArrowRight,
} from 'lucide-react';
import { useAppStore } from '@/store';
import { formatFileSize } from '@/utils';
import { materialTemplates } from '@/data/mockData';
import type { Material } from '@/types';

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  materialType: string;
  status: 'uploading' | 'success' | 'error';
  progress: number;
}

export default function Materials() {
  const navigate = useNavigate();
  const {
    getCurrentDeclaration,
    getMissingRequiredMaterials,
    addMaterial,
    removeMaterial,
    submitDeclaration,
    updateDeclaration,
  } = useAppStore();

  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedType, setSelectedType] = useState<string>('application');
  const [showNoDeclarationWarning, setShowNoDeclarationWarning] = useState(false);

  const currentDeclaration = getCurrentDeclaration();

  useEffect(() => {
    if (!currentDeclaration) {
      setShowNoDeclarationWarning(true);
    } else {
      const existingFiles: UploadedFile[] = currentDeclaration.materials.map((m) => ({
        id: m.id,
        name: m.name,
        size: m.size,
        type: 'application/pdf',
        materialType: m.type,
        status: 'success',
        progress: 100,
      }));
      setUploadedFiles(existingFiles);
    }
  }, [currentDeclaration]);

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return <Image className="w-5 h-5 text-purple-500" />;
    if (type.includes('pdf')) return <FileText className="w-5 h-5 text-red-500" />;
    if (type.includes('word') || type.includes('doc'))
      return <FileSpreadsheet className="w-5 h-5 text-blue-500" />;
    return <FileIcon className="w-5 h-5 text-gray-500" />;
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    simulateUpload(files);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    simulateUpload(files);
  };

  const simulateUpload = (files: File[]) => {
    if (!currentDeclaration) {
      alert('请先创建飞行计划再上传材料');
      return;
    }

    files.forEach((file, index) => {
      const newFile: UploadedFile = {
        id: `f${Date.now()}-${index}`,
        name: file.name,
        size: file.size,
        type: file.type,
        materialType: selectedType,
        status: 'uploading',
        progress: 0,
      };
      setUploadedFiles((prev) => [...prev, newFile]);

      let progress = 0;
      const interval = setInterval(() => {
        progress += Math.random() * 30;
        if (progress >= 100) {
          progress = 100;
          clearInterval(interval);
          setUploadedFiles((prev) =>
            prev.map((f) =>
              f.id === newFile.id ? { ...f, status: 'success', progress: 100 } : f
            )
          );

          if (currentDeclaration) {
            addMaterial(currentDeclaration.id, {
              name: file.name,
              type: selectedType,
              url: `/uploads/${file.name}`,
              size: file.size,
              required: materialTemplates.find((t) => t.type === selectedType)?.required || false,
              status: 'uploaded',
            });
          }
        } else {
          setUploadedFiles((prev) =>
            prev.map((f) =>
              f.id === newFile.id ? { ...f, progress: Math.floor(progress) } : f
            )
          );
        }
      }, 300);
    });
  };

  const removeFile = (id: string) => {
    setUploadedFiles((prev) => prev.filter((f) => f.id !== id));
    if (currentDeclaration) {
      removeMaterial(currentDeclaration.id, id);
    }
  };

  const missingMaterials = currentDeclaration
    ? getMissingRequiredMaterials(currentDeclaration.id)
    : materialTemplates.filter((t) => t.required).map((t) => t.name);

  const completedCount = uploadedFiles.filter((f) => f.status === 'success').length;
  const requiredTemplates = materialTemplates.filter((t) => t.required);
  const optionalTemplates = materialTemplates.filter((t) => !t.required);

  const isMaterialUploaded = (type: string) => {
    return uploadedFiles.some((f) => f.materialType === type && f.status === 'success');
  };

  const handleSaveDraft = () => {
    if (!currentDeclaration) {
      alert('请先创建飞行计划');
      return;
    }
    updateDeclaration(currentDeclaration.id, { status: 'draft' });
    alert('草稿已保存！');
    navigate('/review');
  };

  const handleSaveAndNext = () => {
    if (!currentDeclaration) {
      alert('请先创建飞行计划');
      return;
    }
    updateDeclaration(currentDeclaration.id, { status: currentDeclaration.status === 'draft' ? 'draft' : currentDeclaration.status });
    alert('材料已保存！');
    navigate(`/review?id=${currentDeclaration.id}`);
  };

  const handleSubmit = () => {
    if (!currentDeclaration) {
      alert('请先创建飞行计划');
      return;
    }

    if (missingMaterials.length > 0) {
      alert(`还有以下必填材料未上传：\n${missingMaterials.join('、')}`);
      return;
    }

    submitDeclaration(currentDeclaration.id);
    alert('申报已提交！请等待审核。');
    navigate('/review');
  };

  const handleDownloadTemplate = (templateName: string) => {
    const content = `${templateName}模板

请在此处填写相关信息...

---
注意事项：
1. 请如实填写所有信息
2. 确保所有文件清晰可辨
3. 提交后将进入审核流程
    `.trim();

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${templateName}模板.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {showNoDeclarationWarning && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-6 h-6 text-amber-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-amber-800">未找到申报信息</p>
              <p className="text-sm text-amber-600 mt-1">
                请先在飞行计划页面创建申报，再进行材料上传。
              </p>
              <button
                onClick={() => navigate('/flight-plan')}
                className="mt-3 text-sm text-amber-700 hover:text-amber-900 underline"
              >
                去创建飞行计划 →
              </button>
            </div>
            <button
              onClick={() => setShowNoDeclarationWarning(false)}
              className="ml-auto text-amber-500 hover:text-amber-700"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {currentDeclaration && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <FileText className="w-6 h-6 text-blue-500" />
            <div>
              <p className="font-medium text-blue-800">当前申报：{currentDeclaration.title}</p>
              <p className="text-sm text-blue-600">
                任务类型：{currentDeclaration.taskType} | 风险等级：{currentDeclaration.riskLevel === 'low' ? '低风险' : currentDeclaration.riskLevel === 'medium' ? '中风险' : '高风险'}
              </p>
            </div>
            <button
              onClick={() => navigate('/review')}
              className="ml-auto flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800"
            >
              <ArrowLeft className="w-4 h-4" />
              返回申报列表
            </button>
          </div>
        </div>
      )}

      <div>
        <h2 className="text-2xl font-bold text-gray-800">材料上传</h2>
        <p className="text-gray-500 mt-1">上传申报所需的各类证明材料</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">上传材料</h3>
              <div>
                <label className="text-sm text-gray-600 mr-2">材料类型：</label>
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                >
                  {materialTemplates.map((t) => (
                    <option key={t.type} value={t.type}>
                      {t.name} {t.required ? '(必填)' : '(选填)'}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-xl p-10 text-center transition-colors ${
                isDragging
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-300 hover:border-blue-400'
              }`}
            >
              <Upload
                className={`w-12 h-12 mx-auto mb-4 ${
                  isDragging ? 'text-blue-500' : 'text-gray-400'
                }`}
              />
              <p className="text-lg font-medium text-gray-700 mb-2">
                拖拽文件到此处，或点击上传
              </p>
              <p className="text-sm text-gray-500 mb-4">
                支持 PDF、JPG、PNG、DOC 格式，单个文件不超过 50MB
              </p>
              <label className="inline-flex items-center gap-2 bg-blue-500 text-white px-6 py-2 rounded-lg cursor-pointer hover:bg-blue-600 transition-colors">
                <Upload className="w-4 h-4" />
                选择文件
                <input
                  type="file"
                  multiple
                  onChange={handleFileSelect}
                  className="hidden"
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                />
              </label>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">已上传文件</h3>
              <span className="text-sm text-gray-500">
                {completedCount} / {uploadedFiles.length} 个文件上传完成
              </span>
            </div>
            {uploadedFiles.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <File className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>暂无上传文件</p>
              </div>
            ) : (
              <div className="space-y-3">
                {uploadedFiles.map((file) => (
                  <div
                    key={file.id}
                    className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg"
                  >
                    {getFileIcon(file.type)}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-gray-800 truncate">{file.name}</p>
                        <span className="text-xs px-2 py-0.5 bg-gray-200 text-gray-600 rounded">
                          {materialTemplates.find((t) => t.type === file.materialType)?.name || '其他'}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500">{formatFileSize(file.size)}</p>
                      {file.status === 'uploading' && (
                        <div className="w-full h-1.5 bg-gray-200 rounded-full mt-2 overflow-hidden">
                          <div
                            className="h-full bg-blue-500 rounded-full transition-all duration-300"
                            style={{ width: `${file.progress}%` }}
                          />
                        </div>
                      )}
                    </div>
                    {file.status === 'success' && (
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                    )}
                    {file.status === 'error' && (
                      <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                    )}
                    <button
                      onClick={() => removeFile(file.id)}
                      className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4 text-gray-500" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          {missingMaterials.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-red-800 text-sm">缺少必填材料</p>
                  <ul className="text-xs text-red-600 mt-1 list-disc list-inside space-y-0.5">
                    {missingMaterials.map((m, i) => (
                      <li key={i}>{m}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">材料清单</h3>

            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-gray-700">必填材料</h4>
                <span className="text-sm text-orange-500">
                  {requiredTemplates.filter((t) => isMaterialUploaded(t.type)).length} / {requiredTemplates.length} 已完成
                </span>
              </div>
              <div className="space-y-2">
                {requiredTemplates.map((mat) => (
                  <div
                    key={mat.type}
                    className={`flex items-center gap-3 p-3 rounded-lg ${
                      isMaterialUploaded(mat.type) ? 'bg-green-50' : 'bg-gray-50'
                    }`}
                  >
                    <div
                      className={`w-2 h-2 rounded-full flex-shrink-0 ${
                        isMaterialUploaded(mat.type) ? 'bg-green-500' : 'bg-orange-500'
                      }`}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800">{mat.name}</p>
                      <p className="text-xs text-gray-500">{mat.description}</p>
                    </div>
                    {isMaterialUploaded(mat.type) ? (
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-gray-700">选填材料</h4>
                <span className="text-sm text-gray-500">
                  {optionalTemplates.filter((t) => isMaterialUploaded(t.type)).length} / {optionalTemplates.length} 已上传
                </span>
              </div>
              <div className="space-y-2">
                {optionalTemplates.map((mat) => (
                  <div
                    key={mat.type}
                    className={`flex items-center gap-3 p-3 rounded-lg ${
                      isMaterialUploaded(mat.type) ? 'bg-green-50' : 'bg-gray-50'
                    }`}
                  >
                    <div
                      className={`w-2 h-2 rounded-full flex-shrink-0 ${
                        isMaterialUploaded(mat.type) ? 'bg-green-500' : 'bg-gray-400'
                      }`}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800">{mat.name}</p>
                      <p className="text-xs text-gray-500">{mat.description}</p>
                    </div>
                    {isMaterialUploaded(mat.type) && (
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">模板下载</h3>
            <div className="space-y-3">
              <button
                onClick={() => handleDownloadTemplate('飞行任务申请书')}
                className="w-full flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:border-blue-400 hover:bg-blue-50 transition-all"
              >
                <Download className="w-5 h-5 text-blue-500" />
                <div className="flex-1 text-left">
                  <p className="text-sm font-medium text-gray-800">飞行任务申请书模板</p>
                  <p className="text-xs text-gray-500">.doc 格式</p>
                </div>
              </button>
              <button
                onClick={() => handleDownloadTemplate('安全应急预案')}
                className="w-full flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:border-blue-400 hover:bg-blue-50 transition-all"
              >
                <Download className="w-5 h-5 text-blue-500" />
                <div className="flex-1 text-left">
                  <p className="text-sm font-medium text-gray-800">安全应急预案模板</p>
                  <p className="text-xs text-gray-500">.doc 格式</p>
                </div>
              </button>
            </div>
          </div>

          <div className="space-y-3">
            <button
              onClick={handleSubmit}
              disabled={!currentDeclaration || missingMaterials.length > 0}
              className={`w-full py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
                !currentDeclaration || missingMaterials.length > 0
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-500 text-white hover:bg-blue-600'
              }`}
            >
              <Send className="w-4 h-4" />
              提交申报
            </button>
            <button
              onClick={handleSaveAndNext}
              disabled={!currentDeclaration}
              className={`w-full py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
                !currentDeclaration
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-green-500 text-white hover:bg-green-600'
              }`}
            >
              <ArrowRight className="w-4 h-4" />
              保存并下一步
            </button>
            <button
              onClick={handleSaveDraft}
              disabled={!currentDeclaration}
              className={`w-full border py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
                !currentDeclaration
                  ? 'border-gray-200 text-gray-400 cursor-not-allowed'
                  : 'border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Save className="w-4 h-4" />
              保存草稿
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
