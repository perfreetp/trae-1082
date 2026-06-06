import { useState } from 'react';
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
} from 'lucide-react';
import { formatFileSize } from '@/utils';

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  status: 'uploading' | 'success' | 'error';
  progress: number;
}

const requiredMaterials = [
  { id: '1', name: '飞行任务申请书', type: 'application', required: true, format: '.pdf' },
  { id: '2', name: '飞行器适航证', type: 'certificate', required: true, format: '.pdf/.jpg' },
  { id: '3', name: '驾驶员资质证明', type: 'license', required: true, format: '.pdf/.jpg' },
  { id: '4', name: '安全应急预案', type: 'plan', required: true, format: '.pdf/.doc' },
];

const optionalMaterials = [
  { id: '5', name: '作业方案说明', type: 'plan', required: false, format: '.pdf/.doc' },
  { id: '6', name: '保险凭证', type: 'insurance', required: false, format: '.pdf/.jpg' },
];

export default function Materials() {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([
    {
      id: 'f1',
      name: '飞行任务申请书.pdf',
      size: 1024000,
      type: 'application/pdf',
      status: 'success',
      progress: 100,
    },
    {
      id: 'f2',
      name: '适航证扫描件.jpg',
      size: 512000,
      type: 'image/jpeg',
      status: 'success',
      progress: 100,
    },
  ]);
  const [isDragging, setIsDragging] = useState(false);

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
    files.forEach((file, index) => {
      const newFile: UploadedFile = {
        id: `f${Date.now()}-${index}`,
        name: file.name,
        size: file.size,
        type: file.type,
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
  };

  const completedCount = uploadedFiles.filter((f) => f.status === 'success').length;
  const requiredCount = requiredMaterials.length;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">材料上传</h2>
        <p className="text-gray-500 mt-1">上传申报所需的各类证明材料</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">上传材料</h3>
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
                      <p className="font-medium text-gray-800 truncate">{file.name}</p>
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
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">材料清单</h3>

            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-gray-700">必填材料</h4>
                <span className="text-sm text-orange-500">
                  {Math.min(completedCount, requiredCount)} / {requiredCount} 已完成
                </span>
              </div>
              <div className="space-y-2">
                {requiredMaterials.map((mat) => (
                  <div
                    key={mat.id}
                    className="flex items-center gap-3 p-3 rounded-lg bg-gray-50"
                  >
                    <div className="w-2 h-2 rounded-full bg-orange-500 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800">{mat.name}</p>
                      <p className="text-xs text-gray-500">格式：{mat.format}</p>
                    </div>
                    {uploadedFiles.some((f) =>
                      f.name.includes(
                        mat.name.replace(/飞行任务|飞行器|驾驶员|安全应急/g, '')
                      )
                    ) ? (
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
              </div>
              <div className="space-y-2">
                {optionalMaterials.map((mat) => (
                  <div
                    key={mat.id}
                    className="flex items-center gap-3 p-3 rounded-lg bg-gray-50"
                  >
                    <div className="w-2 h-2 rounded-full bg-gray-400 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800">{mat.name}</p>
                      <p className="text-xs text-gray-500">格式：{mat.format}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">模板下载</h3>
            <div className="space-y-3">
              <button className="w-full flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:border-blue-400 hover:bg-blue-50 transition-all">
                <Download className="w-5 h-5 text-blue-500" />
                <div className="flex-1 text-left">
                  <p className="text-sm font-medium text-gray-800">飞行任务申请书模板</p>
                  <p className="text-xs text-gray-500">.doc 格式</p>
                </div>
              </button>
              <button className="w-full flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:border-blue-400 hover:bg-blue-50 transition-all">
                <Download className="w-5 h-5 text-blue-500" />
                <div className="flex-1 text-left">
                  <p className="text-sm font-medium text-gray-800">安全应急预案模板</p>
                  <p className="text-xs text-gray-500">.doc 格式</p>
                </div>
              </button>
            </div>
          </div>

          <div className="space-y-3">
            <button className="w-full bg-blue-500 text-white py-3 rounded-lg font-medium hover:bg-blue-600 transition-colors">
              保存并下一步
            </button>
            <button className="w-full border border-gray-300 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors">
              保存草稿
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
