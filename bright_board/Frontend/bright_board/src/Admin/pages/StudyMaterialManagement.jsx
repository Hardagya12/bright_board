import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload,
  Search,
  Filter,
  Download,
  FileText,
  Image as ImageIcon,
  Video,
  File,
  BarChart3,
  FolderOpen,
  Lock,
  Eye,
  BookOpen,
  Trash2,
  MoreVertical,
  X,
  CheckCircle,
} from "lucide-react";
import { format } from "date-fns";
import AdminSidebar from "../components/AdminSidebar";
import {
  listMaterials,
  createMaterial,
  updateMaterialMetrics,
  deleteMaterial,
} from "../../utils/services/materials";
import { listBatches } from "../../utils/services/batches";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";

const StudyMaterialManagement = () => {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("all");
  const [selectedBatch, setSelectedBatch] = useState("all");
  const [isDragging, setIsDragging] = useState(false);
  const [batches, setBatches] = useState(["all"]);
  const [subjects, setSubjects] = useState(["all"]);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadFiles, setUploadFiles] = useState([]);
  const [banner, setBanner] = useState({
    open: false,
    message: "",
    type: "success",
  });

  useEffect(() => {
    const loadMaterials = async () => {
      setLoading(true);
      setError("");
      try {
        const { data } = await listMaterials();
        const ms = data.materials || [];
        setMaterials(ms);
        const subj = [
          "all",
          ...Array.from(
            new Set(
              ms.map((m) => (m.subject || "").toLowerCase()).filter(Boolean),
            ),
          ),
        ];
        setSubjects(subj);
        try {
          const { data: b } = await listBatches({ limit: 100 });
          const bb = (b.batches || []).map((x) => x.batchId);
          setBatches(["all", ...bb]);
        } catch (err) {
          console.error(err);
        }
      } catch (err) {
        setError(err.response?.data?.error || err.message);
      } finally {
        setLoading(false);
      }
    };
    loadMaterials();
  }, []);

  const getFileIcon = (type) => {
    switch (type) {
      case "pdf":
        return <FileText className="text-red-400" size={24} />;
      case "image":
        return <ImageIcon className="text-blue-400" size={24} />;
      case "video":
        return <Video className="text-purple-400" size={24} />;
      default:
        return <File className="text-gray-400" size={24} />;
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };
  const handleDragLeave = () => setIsDragging(false);
  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      setUploadFiles(files);
      setShowUploadModal(true);
    }
  };

  const handleFileUpload = async () => {
    setShowUploadModal(false);
    setLoading(true);
    let successCount = 0;

    // Helper to map extensions to backend allowed types
    const getMaterialType = (fileName) => {
      const ext = (fileName.split(".").pop() || "").toLowerCase();
      if (["jpg", "jpeg", "png", "gif", "webp", "svg"].includes(ext))
        return "image";
      if (["mp4", "webm", "mov", "avi", "mkv"].includes(ext)) return "video";
      if (["pdf"].includes(ext)) return "pdf";
      if (
        [
          "doc",
          "docx",
          "txt",
          "rtf",
          "odt",
          "xls",
          "xlsx",
          "ppt",
          "pptx",
        ].includes(ext)
      )
        return "doc";
      return "file";
    };

    for (const file of uploadFiles) {
      try {
        const formData = new FormData();
        formData.append("file", file);
        formData.append(
          "upload_preset",
          import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET,
        );
        const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;

        const res = await fetch(
          `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`,
          {
            method: "POST",
            body: formData,
          },
        );

        if (!res.ok) throw new Error("Upload failed");
        const cloudData = await res.json();

        const payload = {
          name: file.name,
          type: getMaterialType(file.name),
          subject:
            selectedSubject !== "all" ? selectedSubject : "Uncategorized",
          batch: selectedBatch !== "all" ? selectedBatch : "General",
          url: cloudData.secure_url,
          restricted: false,
        };

        const { data } = await createMaterial(payload);
        setMaterials((prev) => [...prev, data.material]);
        successCount++;
      } catch (err) {
        console.error("Create material failed", err);
        setBanner({
          open: true,
          message: `Failed to upload ${file.name}`,
          type: "error",
        });
      }
    }
    setLoading(false);
    setUploadFiles([]);
    if (successCount > 0) {
      setBanner({
        open: true,
        message: `${successCount} files uploaded successfully!`,
        type: "success",
      });
    }
    setTimeout(() => setBanner((prev) => ({ ...prev, open: false })), 3000);
  };

  const handleDownload = async (material) => {
    if (material.restricted) return;
    const nextDownloads = (material.downloads || 0) + 1;
    setMaterials(
      materials.map((m) =>
        m.id === material.id ? { ...m, downloads: nextDownloads } : m,
      ),
    );
    try {
      await updateMaterialMetrics(material.id, { downloads: nextDownloads });
    } catch (err) {
      console.error(err);
    }

    if (material.url) {
      window.open(material.url, "_blank");
    }
  };

  const handleView = async (material) => {
    const nextViews = (material.views || 0) + 1;
    setMaterials(
      materials.map((m) =>
        m.id === material.id ? { ...m, views: nextViews } : m,
      ),
    );
    try {
      await updateMaterialMetrics(material.id, { views: nextViews });
    } catch (err) {
      console.error(err);
    }
    if (material.url) {
      window.open(material.url, "_blank");
    }
  };

  const handleToggleRestriction = (materialId) => {
    setMaterials(
      materials.map((material) =>
        material.id === materialId
          ? { ...material, restricted: !material.restricted }
          : material,
      ),
    );
  };

  const handleDelete = async (materialId) => {
    if (!window.confirm("Are you sure you want to delete this material?"))
      return;
    try {
      await deleteMaterial(materialId);
      setMaterials((prev) => prev.filter((m) => m.id !== materialId));
      setBanner({
        open: true,
        message: "Material deleted successfully",
        type: "success",
      });
      setTimeout(() => setBanner((prev) => ({ ...prev, open: false })), 3000);
    } catch (err) {
      console.error("Delete failed", err);
      setBanner({
        open: true,
        message: "Failed to delete material",
        type: "error",
      });
      setTimeout(() => setBanner((prev) => ({ ...prev, open: false })), 3000);
    }
  };

  const filteredMaterials = materials.filter((material) => {
    const matchesSearch = material.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesSubject =
      selectedSubject === "all" ||
      (material.subject || "").toLowerCase() === selectedSubject.toLowerCase();
    const matchesBatch =
      selectedBatch === "all" || material.batch === selectedBatch;
    return matchesSearch && matchesSubject && matchesBatch;
  });

  const totalViews = filteredMaterials.reduce(
    (sum, material) => sum + (material.views || 0),
    0,
  );
  const totalDownloads = filteredMaterials.reduce(
    (sum, material) => sum + (material.downloads || 0),
    0,
  );

  const StatCard = ({ title, value, icon: Icon, color }) => (
    <Card variant="glass" className="relative overflow-hidden group">
      <div
        className={`absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity ${
          color === "success"
            ? "text-emerald-500"
            : color === "info"
              ? "text-blue-500"
              : "text-purple-500"
        }`}
      >
        <Icon size={64} />
      </div>
      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-2">
          <div
            className={`p-2 rounded-lg bg-white/5 ${
              color === "success"
                ? "text-emerald-400"
                : color === "info"
                  ? "text-blue-400"
                  : "text-purple-400"
            }`}
          >
            <Icon size={20} />
          </div>
          <span className="text-white/60 font-medium text-sm">{title}</span>
        </div>
        <div className="text-3xl font-bold text-white tracking-tight">
          {value.toLocaleString()}
        </div>
      </div>
    </Card>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-transparent">
      <AdminSidebar />
      <div className="flex-1 overflow-y-auto p-4 md:p-8 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-4xl font-bold text-white tracking-tight mb-2">
                Study Materials
              </h1>
              <p className="text-white/50">
                Upload, organize and share learning resources.
              </p>
            </div>
            <Button
              variant="accent"
              onClick={() => {
                const input = document.createElement("input");
                input.type = "file";
                input.multiple = true;
                input.onchange = (e) => {
                  setUploadFiles(Array.from(e.target.files));
                  setShowUploadModal(true);
                };
                input.click();
              }}
            >
              <Upload size={18} className="mr-2" /> Upload Files
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCard
              title="Total Materials"
              value={filteredMaterials.length}
              icon={FolderOpen}
              color="purple"
            />
            <StatCard
              title="Total Downloads"
              value={totalDownloads}
              icon={Download}
              color="success"
            />
            <StatCard
              title="Total Views"
              value={totalViews}
              icon={Eye}
              color="info"
            />
          </div>

          {/* Filters & Search */}
          <div className="flex flex-col md:flex-row gap-4 p-4 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-md">
            <div className="flex-1 relative">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40"
                size={18}
              />
              <input
                type="text"
                placeholder="Search materials..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:ring-2 focus:ring-blue-500/50 outline-none transition-all"
              />
            </div>
            <div className="flex gap-3">
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:ring-2 focus:ring-blue-500/50 outline-none transition-all appearance-none"
              >
                {subjects.map((s) => (
                  <option key={s} value={s}>
                    {s === "all" ? "All Subjects" : s}
                  </option>
                ))}
              </select>
              <select
                value={selectedBatch}
                onChange={(e) => setSelectedBatch(e.target.value)}
                className="bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:ring-2 focus:ring-blue-500/50 outline-none transition-all appearance-none"
              >
                {batches.map((b) => (
                  <option key={b} value={b}>
                    {b === "all" ? "All Batches" : `Batch ${b}`}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Drag & Drop Zone */}
          <div
            className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-300 ${
              isDragging
                ? "border-blue-500 bg-blue-500/10"
                : "border-white/10 hover:border-white/20 bg-white/5"
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
              <Upload size={32} className="text-white/40" />
            </div>
            <h3 className="text-lg font-medium text-white mb-2">
              Drag and drop files here
            </h3>
            <p className="text-white/40 text-sm">
              Supported formats: PDF, Images, Video, Doc
            </p>
          </div>

          {/* Materials List */}
          <Card variant="glass" className="p-0 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-white/5 text-white/60 text-xs uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-4 font-medium border-b border-white/10">
                      Name
                    </th>
                    <th className="px-6 py-4 font-medium border-b border-white/10">
                      Subject
                    </th>
                    <th className="px-6 py-4 font-medium border-b border-white/10">
                      Batch
                    </th>
                    <th className="px-6 py-4 font-medium border-b border-white/10">
                      Date
                    </th>
                    <th className="px-6 py-4 font-medium border-b border-white/10 text-center">
                      Stats
                    </th>
                    <th className="px-6 py-4 font-medium border-b border-white/10 text-right">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  <AnimatePresence>
                    {filteredMaterials.map((material) => (
                      <motion.tr
                        key={material.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="hover:bg-white/5 transition-colors group"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-white/5">
                              {getFileIcon(material.type)}
                            </div>
                            <span className="font-medium text-white">
                              {material.name}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-white/70">
                          {material.subject}
                        </td>
                        <td className="px-6 py-4 text-sm text-white/70">
                          {material.batch}
                        </td>
                        <td className="px-6 py-4 text-sm text-white/70">
                          {material.uploadDate
                            ? format(
                                new Date(material.uploadDate),
                                "MMM dd, yyyy",
                              )
                            : "-"}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-center gap-4 text-xs text-white/50">
                            <span className="flex items-center gap-1">
                              <Download size={14} /> {material.downloads || 0}
                            </span>
                            <span className="flex items-center gap-1">
                              <Eye size={14} /> {material.views || 0}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => handleDownload(material)}
                              disabled={material.restricted}
                              className={`p-2 rounded-lg text-white/60 transition-colors ${material.restricted ? "opacity-50 cursor-not-allowed" : "hover:bg-white/10 hover:text-blue-400"}`}
                            >
                              <Download size={16} />
                            </button>
                            <button
                              onClick={() => handleView(material)}
                              className="p-2 hover:bg-white/10 rounded-lg text-white/60 hover:text-emerald-400 transition-colors"
                            >
                              <Eye size={16} />
                            </button>
                            <button
                              onClick={() =>
                                handleToggleRestriction(material.id)
                              }
                              className={`p-2 hover:bg-white/10 rounded-lg transition-colors ${material.restricted ? "text-red-400" : "text-white/60 hover:text-amber-400"}`}
                            >
                              <Lock size={16} />
                            </button>
                            <button
                              onClick={() => handleDelete(material.id)}
                              className="p-2 hover:bg-white/10 rounded-lg text-white/60 hover:text-red-400 transition-colors"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
              {filteredMaterials.length === 0 && (
                <div className="text-center text-white/40 py-12">
                  No materials found.
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* Upload Modal */}
      <AnimatePresence>
        {showUploadModal && (
          <motion.div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-[#121212] border border-white/10 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl"
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
            >
              <div className="px-6 py-4 border-b border-white/10 flex justify-between items-center bg-white/5">
                <h2 className="text-xl font-bold text-white">Confirm Upload</h2>
                <button
                  onClick={() => setShowUploadModal(false)}
                  className="text-white/50 hover:text-white transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="p-6">
                <p className="text-white/70 mb-4">
                  You are about to upload{" "}
                  <span className="font-bold text-white">
                    {uploadFiles.length}
                  </span>{" "}
                  files to:
                </p>
                <div className="bg-white/5 rounded-xl p-4 mb-6 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-white/50">Subject:</span>
                    <span className="text-white font-medium">
                      {selectedSubject === "all"
                        ? "Uncategorized"
                        : selectedSubject}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-white/50">Batch:</span>
                    <span className="text-white font-medium">
                      {selectedBatch === "all" ? "General" : selectedBatch}
                    </span>
                  </div>
                </div>
                <div className="flex justify-end gap-3">
                  <Button
                    variant="ghost"
                    onClick={() => setShowUploadModal(false)}
                  >
                    Cancel
                  </Button>
                  <Button variant="accent" onClick={handleFileUpload}>
                    Upload Files
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Notification Banner */}
      <AnimatePresence>
        {banner.open && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-8 right-8 z-50"
          >
            <div className="bg-[#121212] border border-emerald-500/20 rounded-xl shadow-2xl p-4 flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                <CheckCircle size={18} />
              </div>
              <div className="text-white font-medium">{banner.message}</div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Loading Overlay */}
      <AnimatePresence>
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center"
          >
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default StudyMaterialManagement;
