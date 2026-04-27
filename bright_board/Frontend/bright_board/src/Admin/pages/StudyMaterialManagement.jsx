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
import api from "../../utils/api";
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
        return <FileText className="text-[#d03238] drop-shadow-md" size={24} />;
      case "image":
        return <ImageIcon className="text-[#0e0f0c] drop-shadow-md" size={24} />;
      case "video":
        return <Video className="text-[#0e0f0c] drop-shadow-md" size={24} />;
      default:
        return <File className="text-[#868685]" size={24} />;
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

    const readFileAsBase64 = (file) => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
    };

    for (const file of uploadFiles) {
      try {
        const base64Data = await readFileAsBase64(file);

        const payload = {
          name: file.name,
          type: getMaterialType(file.name),
          subject: selectedSubject !== "all" ? selectedSubject : "Uncategorized",
          batch: selectedBatch !== "all" ? selectedBatch : "General",
          base64Data: base64Data,
          restricted: false,
        };

        const { data } = await createMaterial(payload);
        setMaterials((prev) => [...prev, data.material]);
        successCount++;
      } catch (err) {
        console.error("Create material failed", err);
        setBanner({
          open: true,
          message: `Failed: ${err.response?.data?.error || err.message}`,
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
      let fullUrl = material.url;
      if (fullUrl.startsWith('/')) {
         fullUrl = `${api.defaults.baseURL}${fullUrl}`;
      }
      window.open(fullUrl, "_blank");
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
      let fullUrl = material.url;
      if (fullUrl.startsWith('/')) {
         fullUrl = `${api.defaults.baseURL}${fullUrl}`;
      }
      window.open(fullUrl, "_blank");
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

  const StatCard = ({ title, value, icon: Icon, color, accent }) => (
    <div className={`bb-card p-6 relative group ${accent}`}>
      <div
        className={`absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity duration-500 ${
          color === "success"
            ? "text-[#163300]"
            : color === "info"
              ? "text-[#0e0f0c]"
              : "text-[#0e0f0c]"
        }`}
      >
        <Icon size={80} className="transform rotate-12" />
      </div>
      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-3">
          <div
            className={`p-2 rounded-xl bg-white  border border-[#e8ebe6] ${
              color === "success"
                ? "text-[#163300]"
                : color === "info"
                  ? "text-[#0e0f0c]"
                  : "text-[#0e0f0c]"
            }`}
          >
            <Icon size={20} />
          </div>
          <span className="text-[#868685] font-medium text-sm tracking-wide">{title}</span>
        </div>
        <div className="text-4xl font-bold text-[#0e0f0c] tracking-tight drop-shadow-md">
          {value.toLocaleString()}
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-[var(--bb-offwhite)] font-body relative">
      <div className="absolute inset-0 opacity-40 mix-blend-overlay pointer-events-none" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.8\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E")' }}></div>
      
      <div className="absolute bottom-[-10%] left-[-10%] w-[50vw] h-[50vh] bg-[#e8f4ff] rounded-full blur-[150px] pointer-events-none" />

      <AdminSidebar />
      <div className="flex-1 overflow-y-auto p-4 md:p-8 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent relative z-10">
        <div className="max-w-7xl mx-auto space-y-10">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-[#0e0f0c] tracking-tight mb-2 font-display">
                Study Materials
              </h1>
              <p className="text-[#868685] tracking-wide">
                Upload, organize and share learning resources gracefully.
              </p>
            </div>
            <Button
              className="btn-primary flex items-center shadow-glow-purple px-6 py-3"
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
              <Upload size={18} className="mr-2" /> Upload Assets
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCard
              title="Total Resources"
              value={filteredMaterials.length}
              icon={FolderOpen}
              color="purple"
              accent="bb-card-accent"
            />
            <StatCard
              title="Global Downloads"
              value={totalDownloads}
              icon={Download}
              color="success"
              accent="accent-top-green"
            />
            <StatCard
              title="Content Views"
              value={totalViews}
              icon={Eye}
              color="info"
              accent="bb-card-accent"
            />
          </div>

          {/* Filters & Search */}
          <div className="flex flex-col md:flex-row gap-4 p-5 bb-card bb-card-accent">
            <div className="flex-1 relative">
              <Search
                className="absolute left-4 top-1/2 -translate-y-1/2 text-[#868685]"
                size={18}
              />
              <input
                type="text"
                placeholder="Search resources..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-[#f9faf6] border border-[#e8ebe6] rounded-full pl-11 pr-5 py-3 text-sm text-[#0e0f0c] focus:border-cyan-400 focus:shadow-[0_0_20px_rgba(0,245,255,0.15)] outline-none transition-all"
              />
            </div>
            <div className="flex gap-4">
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="bg-[#f9faf6] border border-[#e8ebe6] rounded-full px-5 py-3 text-[#0e0f0c] focus:border-cyan-400 focus:shadow-[0_0_20px_rgba(0,245,255,0.15)] outline-none transition-all appearance-none pr-10"
              >
                {subjects.map((s) => (
                  <option key={s} value={s} className="bg-white">
                    {s === "all" ? "All Domains" : s}
                  </option>
                ))}
              </select>
              <select
                value={selectedBatch}
                onChange={(e) => setSelectedBatch(e.target.value)}
                className="bg-[#f9faf6] border border-[#e8ebe6] rounded-full px-5 py-3 text-[#0e0f0c] focus:border-cyan-400 focus:shadow-[0_0_20px_rgba(0,245,255,0.15)] outline-none transition-all appearance-none pr-10"
              >
                {batches.map((b) => (
                  <option key={b} value={b} className="bg-white">
                    {b === "all" ? "All Clusters" : `Cluster ${b}`}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Drag & Drop Zone */}
          <div
            className={`border border-dashed rounded-[24px] p-10 text-center transition-all duration-500  ${
              isDragging
                ? "border-cyan-400 bg-cyan-400/10 shadow-[inset_0_0_50px_rgba(0,245,255,0.1)]"
                : "border-[#e8ebe6] hover:border-[#9fe870] bg-white hover:bg-white/10"
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <div className="w-20 h-20 rounded-full bg-white border border-[#e8ebe6] flex items-center justify-center mx-auto mb-6 shadow-xl relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-tr from-cyan-400/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <Upload size={36} className="text-[#868685] relative z-10" />
            </div>
            <h3 className="text-xl font-bold text-[#0e0f0c] mb-2 font-display">
              Drag & Drop Assets
            </h3>
            <p className="text-[#868685] text-sm tracking-wide">
              Supported Formats: PDF, Images, Video, Documents
            </p>
          </div>

          {/* Materials List */}
          <div className="bb-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-[#f9faf6] text-[#868685] text-xs uppercase tracking-widest font-medium border-b border-white/5">
                  <tr>
                    <th className="px-6 py-5">File Identity</th>
                    <th className="px-6 py-5">Domain</th>
                    <th className="px-6 py-5">Cluster</th>
                    <th className="px-6 py-5">Ingested</th>
                    <th className="px-6 py-5 text-center">Telemetry</th>
                    <th className="px-6 py-5 text-right">Directives</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.03]">
                  <AnimatePresence>
                    {filteredMaterials.map((material) => (
                      <motion.tr
                        key={material.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="hover:bg-white/[0.04] transition-colors duration-300 group"
                      >
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-4">
                            <div className="p-3 rounded-xl bg-white border border-white/5 shadow-inner">
                              {getFileIcon(material.type)}
                            </div>
                            <span className="font-medium text-[#0e0f0c] tracking-wide drop-shadow-sm">
                              {material.name}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-5 text-sm text-[#868685] uppercase tracking-wide">
                          {material.subject}
                        </td>
                        <td className="px-6 py-5 text-sm text-[#868685]">
                          {material.batch}
                        </td>
                        <td className="px-6 py-5 text-sm text-[#868685] font-mono tracking-wider">
                          {material.uploadDate
                            ? format(
                                new Date(material.uploadDate),
                                "MMM dd, yyyy",
                              )
                            : "-"}
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex items-center justify-center gap-5 text-xs text-[#868685] font-medium">
                            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--bb-offwhite)]/30 border border-white/5">
                              <Download size={14} className="text-[#163300]" /> {material.downloads || 0}
                            </span>
                            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--bb-offwhite)]/30 border border-white/5">
                              <Eye size={14} className="text-[#0e0f0c]" /> {material.views || 0}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <button
                              onClick={() => handleDownload(material)}
                              disabled={material.restricted}
                              className={`p-2.5 rounded-full border transition-all shadow-lg ${material.restricted ? "opacity-50 cursor-not-allowed bg-white border-white/5 text-[#868685]" : "bg-white border-white/5 hover:border-cyan-500/30 text-[#868685] hover:text-[#9fe870] hover:bg-cyan-500/10"}`}
                            >
                              <Download size={16} />
                            </button>
                            <button
                              onClick={() => handleView(material)}
                              className="p-2.5 bg-white hover:bg-emerald-500/10 rounded-full border border-white/5 hover:border-[#163300]/30 text-[#868685] hover:text-[#9fe870] transition-all shadow-lg"
                            >
                              <Eye size={16} />
                            </button>
                            <button
                              onClick={() =>
                                handleToggleRestriction(material.id)
                              }
                              className={`p-2.5 rounded-full border transition-all shadow-lg ${material.restricted ? "bg-red-500/10 border-red-500/30 text-red-400" : "bg-white border-white/5 hover:border-[#9fe870] text-[#868685] hover:text-[#9fe870] hover:bg-amber-500/10"}`}
                            >
                              <Lock size={16} />
                            </button>
                            <button
                              onClick={() => handleDelete(material.id)}
                              className="p-2.5 bg-white hover:bg-pink-500/10 rounded-full border border-white/5 hover:border-pink-500/30 text-[#868685] hover:text-[#d03238] transition-all shadow-lg"
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
                <div className="text-center text-[#868685] py-16 font-medium tracking-wide">
                  No resources located in this vector.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Upload Modal */}
      <AnimatePresence>
        {showUploadModal && (
          <motion.div
            className="fixed inset-0 bg-[var(--bb-offwhite)]/60  z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white border border-[#e8ebe6] rounded-[24px] w-full max-w-lg overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.1)] relative"
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
            >
              <div className="absolute top-0 left-[10%] right-[10%] h-[3px] rounded-b-full bg-[#9fe870]"></div>
              
              <div className="px-8 py-6 border-b border-white/5 flex justify-between items-center relative z-10">
                <h2 className="text-2xl font-bold text-[#0e0f0c] font-display tracking-tight">Confirm Injection</h2>
                <button
                  onClick={() => setShowUploadModal(false)}
                  className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-[#868685] hover:text-[#0e0f0c] hover:bg-white/10 transition-all"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="p-8 relative z-10">
                <p className="text-[#454745] mb-6 text-lg">
                  Deploying{" "}
                  <span className="font-bold text-[#9fe870] text-xl mx-1">
                    {uploadFiles.length}
                  </span>{" "}
                  assets to:
                </p>
                <div className="bg-[var(--bb-offwhite)]/30 border border-white/5 rounded-2xl p-6 mb-8 space-y-4 shadow-inner">
                  <div className="flex justify-between items-center border-b border-white/5 pb-4">
                    <span className="text-[#868685] font-medium tracking-wide">Domain Structure</span>
                    <span className="text-[#0e0f0c] font-bold tracking-wide">
                      {selectedSubject === "all"
                        ? "Uncategorized"
                        : selectedSubject}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pt-2">
                    <span className="text-[#868685] font-medium tracking-wide">Target Cluster</span>
                    <span className="text-[#0e0f0c] font-bold tracking-wide">
                      {selectedBatch === "all" ? "General Root" : selectedBatch}
                    </span>
                  </div>
                </div>
                <div className="flex justify-end gap-4 border-t border-white/5 pt-6">
                  <Button
                    className="bg-transparent border border-[#e8ebe6] hover:bg-white text-[#0e0f0c] rounded-full px-8 py-3 transition-all duration-300"
                    onClick={() => setShowUploadModal(false)}
                  >
                    Abort
                  </Button>
                  <Button className="btn-primary shadow-glow-cyan px-8 py-3 rounded-full font-bold tracking-wide" onClick={handleFileUpload}>
                    Execute Upload
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
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            className="fixed bottom-8 right-8 z-50"
          >
            <div className={` border rounded-[20px] shadow-[0_10px_40px_rgba(0,0,0,0.5)] p-5 flex items-center gap-4 ${banner.type === 'error' ? 'bg-red-500/10 border-red-500/30' : 'bg-emerald-500/10 border-[#163300]/30'}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center border shadow-inner ${banner.type === 'error' ? 'bg-red-500/20 text-red-400 border-red-500/30' : 'bg-emerald-500/20 text-[#9fe870] border-[#163300]/30'}`}>
                {banner.type === 'error' ? <X size={20} /> : <CheckCircle size={20} />}
              </div>
              <div className="text-[#0e0f0c] font-medium tracking-wide pr-4">{banner.message}</div>
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
            className="fixed inset-0 bg-[var(--bb-offwhite)]/60  z-[100] flex items-center justify-center"
          >
            <div className="flex flex-col items-center gap-6 p-8 bb-card rounded-[24px]">
              <div className="relative">
                <div className="w-16 h-16 border-4 border-[#e8ebe6] rounded-full"></div>
                <div className="w-16 h-16 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin absolute top-0 left-0" style={{ filter: 'drop-shadow(0 0 10px rgba(0,245,255,0.5))' }}></div>
              </div>
              <div className="text-[#0e0f0c] font-medium tracking-widest text-sm animate-pulse">PROCESSING...</div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default StudyMaterialManagement;
