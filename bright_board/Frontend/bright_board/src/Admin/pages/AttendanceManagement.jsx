import React, { useState, useEffect, useRef } from "react";
import {
  Calendar,
  Clock,
  Download,
  Search,
  Users,
  X,
  Upload,
  FileSpreadsheet,
  AlertCircle,
  CheckCircle,
  ChevronDown,
  Save,
  Grid,
  List,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import AdminSidebar from "../components/AdminSidebar";
import { listStudents } from "../../utils/services/students";
import {
  getAttendanceStats,
  listAttendance,
  uploadAttendanceBulk,
} from "../../utils/services/attendance";
import { listBatches } from "../../utils/services/batches";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const AttendanceManagement = () => {
  const [selectedBatch, setSelectedBatch] = useState("");
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [view, setView] = useState("list");
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const fileInputRef = useRef(null);

  const [students, setStudents] = useState([]);
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [weeklyData, setWeeklyData] = useState([]);
  const [saveMessage, setSaveMessage] = useState("");
  const [managerOpen, setManagerOpen] = useState(false);
  const [managerLoading, setManagerLoading] = useState(false);
  const [managerError, setManagerError] = useState("");
  const [managerSuccess, setManagerSuccess] = useState("");
  const [managerStudents, setManagerStudents] = useState([]);
  const [attendanceHistory, setAttendanceHistory] = useState([]);
  const batchSelectRef = useRef(null);
  const [draftSaved, setDraftSaved] = useState(false);
  const [dateError, setDateError] = useState("");
  const [overviewLoading, setOverviewLoading] = useState(false);
  const [overviewError, setOverviewError] = useState("");
  const [overviewRows, setOverviewRows] = useState([]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const { data } = await listStudents({ limit: 100 });
        const mapped = (data.students || []).map((s) => ({
          id: s.studentId || s.id || s._id,
          name: s.name,
          status: "present",
          attendance: 90,
        }));
        setStudents(mapped);
        try {
          const { data: b } = await listBatches({ limit: 100 });
          setBatches(
            (b.batches || []).map((x) => ({
              id: x.batchId || x._id,
              name: x.name,
            })),
          );
        } catch (batchErr) {
          console.error("Error loading batches:", batchErr);
        }
        try {
          const statsRes = await getAttendanceStats({ range: "week" });
          setWeeklyData(statsRes.data.weekly || []);
        } catch (statsErr) {
          console.error("Error loading stats:", statsErr);
        }
      } catch (err) {
        setError(err.response?.data?.error || err.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  useEffect(() => {
    if (!managerOpen) return;
    setTimeout(() => {
      batchSelectRef.current?.focus();
    }, 0);
  }, [managerOpen]);

  const todayStr = new Date().toISOString().split("T")[0];

  const handleDateChange = (val) => {
    setSelectedDate(val);
    if (val > todayStr) {
      setDateError("Future dates are not allowed");
    } else {
      setDateError("");
    }
    loadDraftIfAvailable(selectedBatch, val);
    loadAttendanceHistory(selectedBatch);
  };

  const handleBatchChangeManager = async (val) => {
    setSelectedBatch(val);
    setManagerLoading(true);
    setManagerError("");
    try {
      const { data } = await listStudents({ limit: 500, batchId: val });
      const mapped = (data.students || []).map((s) => ({
        id: s.studentId || s._id || s.id,
        name: s.name,
        status: "present",
        reason: "",
      }));
      setManagerStudents(mapped);
      loadDraftIfAvailable(val, selectedDate);
      loadAttendanceHistory(val);
      await loadOverview(val);
    } catch (err) {
      setManagerError(err.response?.data?.error || err.message);
    } finally {
      setManagerLoading(false);
    }
  };

  const loadAttendanceHistory = async (batchIdVal) => {
    if (!batchIdVal) {
      setAttendanceHistory([]);
      return;
    }
    try {
      const { data } = await listAttendance({ batchId: batchIdVal });
      const grouped = (data.attendance || []).reduce((acc, log) => {
        acc[log.date] = acc[log.date] || {
          date: log.date,
          present: 0,
          absent: 0,
          excused: 0,
        };
        if (log.status === "present") acc[log.date].present++;
        if (log.status === "absent") acc[log.date].absent++;
        if (log.status === "excused") acc[log.date].excused++;
        return acc;
      }, {});
      const sorted = Object.values(grouped)
        .sort((a, b) => a.date.localeCompare(b.date))
        .slice(-5);
      setAttendanceHistory(sorted);
    } catch (histErr) {
      console.error("Error loading history:", histErr);
    }
  };

  const draftKey = (batchIdVal, dateVal) =>
    `attendanceDraft:${batchIdVal}:${dateVal}`;

  const saveDraft = () => {
    if (!selectedBatch) return;
    const draft = managerStudents.map((s) => ({
      studentId: s.id,
      status: s.status,
      reason: s.reason || "",
    }));
    localStorage.setItem(
      draftKey(selectedBatch, selectedDate),
      JSON.stringify(draft),
    );
    setDraftSaved(true);
    setTimeout(() => setDraftSaved(false), 2000);
  };

  const loadDraftIfAvailable = (batchIdVal, dateVal) => {
    const raw = localStorage.getItem(draftKey(batchIdVal, dateVal));
    if (!raw) return;
    try {
      const entries = JSON.parse(raw);
      const map = new Map(entries.map((e) => [e.studentId, e]));
      setManagerStudents((prev) =>
        prev.map((s) => {
          const d = map.get(s.id);
          return d ? { ...s, status: d.status, reason: d.reason } : s;
        }),
      );
    } catch (draftErr) {
      console.error("Error loading draft:", draftErr);
    }
  };

  const markAll = (status) => {
    setManagerStudents((prev) => prev.map((s) => ({ ...s, status })));
  };

  const filteredManagerStudents = managerStudents.filter((s) =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const submitAttendance = async () => {
    setManagerSuccess("");
    setManagerError("");
    if (!selectedBatch) {
      setManagerError("Please select a batch");
      return;
    }
    if (dateError) {
      setManagerError("Please fix date errors before submitting");
      return;
    }
    const entries = managerStudents.map((s) => ({
      studentId: s.id,
      status: s.status === "on_leave" ? "excused" : s.status,
      reason: s.reason || "",
    }));
    if (entries.length === 0) {
      setManagerError("No students to submit");
      return;
    }
    setManagerLoading(true);
    try {
      const { data } = await uploadAttendanceBulk({
        date: selectedDate,
        batchId: selectedBatch || "",
        entries,
      });
      setManagerSuccess(`Attendance submitted successfully (${data.count})`);
      localStorage.removeItem(draftKey(selectedBatch, selectedDate));
    } catch (err) {
      setManagerError(err.response?.data?.error || err.message);
    } finally {
      setManagerLoading(false);
    }
  };

  const loadOverview = async (batchIdVal) => {
    if (!batchIdVal) {
      setOverviewRows([]);
      return;
    }
    setOverviewLoading(true);
    setOverviewError("");
    try {
      const [{ data: attendanceData }, { data: studentsData }] =
        await Promise.all([
          listAttendance({ batchId: batchIdVal }),
          listStudents({ limit: 1000, batchId: batchIdVal }),
        ]);
      const map = new Map(
        (studentsData.students || []).map((s) => [
          s.studentId || s._id || s.id,
          s.name,
        ]),
      );
      const grouped = (attendanceData.attendance || []).reduce((acc, log) => {
        const arr = acc.get(log.date) || [];
        arr.push(log);
        acc.set(log.date, arr);
        return acc;
      }, new Map());
      const rows = Array.from(grouped.entries())
        .map(([date, logs]) => {
          const present = logs.filter((l) => l.status === "present").length;
          const absentLogs = logs.filter((l) => l.status === "absent");
          const excused = logs.filter((l) => l.status === "excused").length;
          const absentNames = absentLogs.map(
            (l) => map.get(l.studentId) || l.studentId,
          );
          return {
            date,
            present,
            absent: absentLogs.length,
            excused,
            absentNames,
          };
        })
        .sort((a, b) => a.date.localeCompare(b.date));
      setOverviewRows(rows);
    } catch (err) {
      setOverviewError(err.response?.data?.error || err.message);
    } finally {
      setOverviewLoading(false);
    }
  };

  const exportOverviewPdf = () => {
    const doc = new jsPDF();
    doc.setFontSize(14);
    doc.text("Attendance Overview", 14, 16);
    const head = [["Date", "Present", "Absent", "On Leave"]];
    const body = overviewRows.map((r) => [
      r.date,
      String(r.present),
      String(r.absent),
      String(r.excused),
    ]);
    autoTable(doc, { head, body, startY: 22 });
    let y = doc.lastAutoTable.finalY + 8;
    doc.setFontSize(12);
    doc.text("Absent Students by Date", 14, y);
    y += 4;
    overviewRows.forEach((r) => {
      const names =
        r.absentNames && r.absentNames.length ? r.absentNames.join(", ") : "-";
      autoTable(doc, {
        head: [[r.date]],
        body: [[names]],
        startY: y,
        styles: { fontSize: 10 },
        columnStyles: { 0: { cellWidth: 180 } },
      });
      y = doc.lastAutoTable.finalY + 6;
    });
    doc.save(`attendance_overview_${selectedBatch || "all"}.pdf`);
  };

  const handleStatusChange = (studentId, newStatus) => {
    setStudents((prevStudents) =>
      prevStudents.map((student) =>
        student.id === studentId ? { ...student, status: newStatus } : student,
      ),
    );
  };

  const handleMarkAllPresent = () => {
    setStudents((prevStudents) =>
      prevStudents.map((student) => ({ ...student, status: "present" })),
    );
  };

  const handleExport = (format) => {
    const data = students.map(({ name, status, attendance }) => ({
      name,
      status,
      attendance: `${attendance}%`,
    }));

    if (format === "csv") {
      const csvContent = [
        ["Name", "Status", "Attendance"],
        ...data.map(Object.values),
      ]
        .map((row) => row.join(","))
        .join("\n");

      const blob = new Blob([csvContent], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `attendance_${selectedDate}.csv`;
      a.click();
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file) => {
    setUploadedFile(file);
    setTimeout(() => {
      setUploadSuccess(true);
      setTimeout(() => {
        setShowUploadModal(false);
        setUploadedFile(null);
        setUploadSuccess(false);
      }, 2000);
    }, 1500);
  };

  const filteredStudents = students.filter((student) =>
    student.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  // Reusable Components
  const StatCard = ({
    title,
    value,
    icon: Icon,
    subtext,
    color = "text-[#0e0f0c]",
  }) => (
    <motion.div
      className="bg-white border border-[#e8ebe6] rounded-xl p-5 flex items-center gap-4 hover:border-[#e8ebe6] transition-colors"
      whileHover={{ y: -4, boxShadow: "0 10px 30px -10px rgba(0,0,0,0.5)" }}
      transition={{ type: "spring", stiffness: 300 }}
    >
      <div className={`p-3 rounded-lg bg-[#e8ebe6] ${color}`}>
        <Icon size={24} />
      </div>
      <div>
        <h3 className="text-sm text-[#454745] font-medium">{title}</h3>
        <p className="text-2xl font-bold text-[#0e0f0c]">{value}</p>
        {subtext && <p className="text-xs text-[#868685] mt-1">{subtext}</p>}
      </div>
    </motion.div>
  );

  const Button = ({
    children,
    variant = "primary",
    className = "",
    ...props
  }) => {
    const variants = {
      primary: "bg-white text-black hover:bg-[#f9faf6] border border-transparent",
      secondary:
        "bg-white text-[#0e0f0c] border border-[#e8ebe6] hover:bg-[#e8ebe6] hover:border-[#e8ebe6]",
      accent:
        "bg-bb-green text-[#0e0f0c] hover:bg-bb-green-dark border border-transparent",
      danger:
        "bg-bb-danger/10 text-bb-danger border border-bb-danger/20 hover:bg-bb-danger/20",
      success:
        "bg-bb-positive/10 text-bb-positive border border-bb-positive/20 hover:bg-bb-positive/20",
    };

    return (
      <motion.button
        className={`px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${className}`}
        whileTap={{ scale: 0.98 }}
        {...props}
      >
        {children}
      </motion.button>
    );
  };

  const Badge = ({ status }) => {
    const styles = {
      present:
        "bg-bb-positive/10 text-bb-positive border-bb-positive/20",
      absent: "bg-bb-danger/10 text-bb-danger border-bb-danger/20",
      excused:
        "bg-bb-warning/10 text-bb-warning border-bb-warning/20",
      on_leave:
        "bg-bb-warning/10 text-bb-warning border-bb-warning/20",
    };

    const key = status?.toLowerCase().replace(" ", "_") || "present";

    return (
      <span
        className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles[key] || styles.present} capitalize`}
      >
        {status?.replace("_", " ")}
      </span>
    );
  };

  return (
    <div className="flex h-screen bg-[var(--bb-offwhite)] text-[#0e0f0c] font-body overflow-hidden">
      <AdminSidebar />

      <motion.main
        className="flex-1 flex flex-col h-full overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8">
          {/* Header */}
          <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-[#0e0f0c] font-display tracking-tight tracking-tight">
                Attendance Management
              </h1>
              <p className="text-[#868685] mt-1">
                Manage student attendance, batches, and generate reports
              </p>
            </div>

            <div className="flex gap-3">
              <Button
                variant="accent"
                onClick={() => {
                  setManagerOpen(true);
                  const defaultBatch = selectedBatch || batches[0]?.id || "";
                  if (defaultBatch) handleBatchChangeManager(defaultBatch);
                  loadAttendanceHistory(defaultBatch);
                }}
              >
                <Calendar size={18} />
                Open Manager
              </Button>
            </div>
          </header>

          {/* Stats Section */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCard
              title="Total Students"
              value={students.length}
              icon={Users}
              color="text-bb-green"
              subtext="Across all batches"
            />
            <StatCard
              title="Present Today"
              value={`${Math.round((students.filter((s) => s.status === "present").length / (students.length || 1)) * 100)}%`}
              icon={Clock}
              color="text-bb-positive"
              subtext={`${students.filter((s) => s.status === "present").length} students checked in`}
            />
            <StatCard
              title="Monthly Average"
              value="92%"
              icon={Calendar}
              color="text-text-[#38c8ff]"
              subtext="+2.4% from last month"
            />
          </section>

          {/* Toolbar Section */}
          <section className="bg-white/80 border border-[#e8ebe6] rounded-xl p-4 backdrop-blur-sm">
            <div className="flex flex-col xl:flex-row justify-between gap-4">
              <div className="flex flex-1 flex-col md:flex-row gap-4">
                {/* Batch & Date Selectors */}
                <div className="flex gap-2 w-full md:w-auto">
                  <div className="relative min-w-[180px]">
                    <select
                      value={selectedBatch}
                      onChange={(e) => setSelectedBatch(e.target.value)}
                      className="w-full appearance-none bg-white border border-[#e8ebe6] text-[#0e0f0c] rounded-lg px-4 py-2.5 pr-10 focus:ring-1 focus:ring-bb-green focus:border-bb-green transition-all outline-none"
                    >
                      <option value="">Select Batch</option>
                      {batches.map((batch) => (
                        <option key={batch.id} value={batch.id}>
                          {batch.name}
                        </option>
                      ))}
                    </select>
                    <ChevronDown
                      className="absolute right-3 top-3 text-[#868685] pointer-events-none"
                      size={16}
                    />
                  </div>

                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="bg-white border border-[#e8ebe6] text-[#0e0f0c] rounded-lg px-4 py-2.5 focus:ring-1 focus:ring-bb-green focus:border-bb-green outline-none"
                  />
                </div>

                {/* Search */}
                <div className="relative flex-1 max-w-md">
                  <Search
                    className="absolute left-3 top-3 text-[#868685]"
                    size={18}
                  />
                  <input
                    type="text"
                    placeholder="Search students..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-white border border-[#e8ebe6] text-[#0e0f0c] rounded-lg pl-10 pr-4 py-2.5 focus:ring-1 focus:ring-bb-green focus:border-bb-green outline-none placeholder:text-[#868685]"
                  />
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Button variant="secondary" onClick={() => handleExport("csv")}>
                  <Download size={18} />
                  <span className="hidden sm:inline">Export CSV</span>
                </Button>

                <Button
                  variant="secondary"
                  onClick={() => setShowUploadModal(true)}
                >
                  <Upload size={18} />
                  <span className="hidden sm:inline">Bulk Upload</span>
                </Button>

                <div className="h-8 w-px bg-[#e8ebe6] mx-2 hidden md:block"></div>

                <div className="flex bg-white border border-[#e8ebe6] rounded-lg p-1">
                  <button
                    onClick={() => setView("list")}
                    className={`p-1.5 rounded transition-colors ${view === "list" ? "bg-[#e8ebe6] text-[#0e0f0c]" : "text-[#868685] hover:text-[#0e0f0c]"}`}
                  >
                    <List size={18} />
                  </button>
                  <button
                    onClick={() => setView("grid")}
                    className={`p-1.5 rounded transition-colors ${view === "grid" ? "bg-[#e8ebe6] text-[#0e0f0c]" : "text-[#868685] hover:text-[#0e0f0c]"}`}
                  >
                    <Grid size={18} />
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* Messages */}
          {saveMessage && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-bb-positive/10 border border-bb-positive/20 text-bb-positive px-4 py-3 rounded-lg flex items-center gap-2"
            >
              <CheckCircle size={18} />
              {saveMessage}
            </motion.div>
          )}

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-bb-danger/10 border border-bb-danger/20 text-bb-danger px-4 py-3 rounded-lg flex items-center gap-2"
            >
              <AlertCircle size={18} />
              {error}
            </motion.div>
          )}

          {/* Main Content Area */}
          <div className="space-y-6">
            {/* Batch Overview Panel */}
            <div className="bg-white border border-[#e8ebe6] rounded-xl overflow-hidden">
              <div className="p-4 border-b border-[#e8ebe6] flex justify-between items-center">
                <h3 className="font-medium text-lg">Batch Overview</h3>
                <div className="flex gap-2">
                  <Button
                    variant="secondary"
                    className="text-xs py-1.5"
                    onClick={() =>
                      loadOverview(selectedBatch || batches[0]?.id || "")
                    }
                  >
                    Refresh
                  </Button>
                  <Button
                    variant="secondary"
                    className="text-xs py-1.5"
                    onClick={exportOverviewPdf}
                    disabled={!overviewRows.length}
                  >
                    <Download size={14} /> PDF
                  </Button>
                </div>
              </div>

              {overviewLoading ? (
                <div className="p-8 text-center text-[#868685]">
                  Loading overview data...
                </div>
              ) : overviewError ? (
                <div className="p-8 text-center text-bb-danger">
                  {overviewError}
                </div>
              ) : overviewRows.length === 0 ? (
                <div className="p-8 text-center text-[#868685]">
                  <div className="inline-flex p-4 rounded-full bg-white border border-[#e8ebe6] mb-3 text-[#868685]">
                    <FileSpreadsheet size={24} />
                  </div>
                  <p>No attendance records found for the selected batch.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-white text-[#868685] text-xs uppercase tracking-wider font-medium">
                      <tr>
                        <th className="px-6 py-4">Date</th>
                        <th className="px-6 py-4">Present</th>
                        <th className="px-6 py-4">Absent</th>
                        <th className="px-6 py-4">On Leave</th>
                        <th className="px-6 py-4 w-1/3">Absent Students</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#e8ebe6]">
                      {overviewRows.map((r) => (
                        <tr
                          key={r.date}
                          className="hover:bg-[#f9faf6] transition-colors"
                        >
                          <td className="px-6 py-4 font-medium">{r.date}</td>
                          <td className="px-6 py-4 text-bb-positive font-medium">
                            {r.present}
                          </td>
                          <td className="px-6 py-4 text-bb-danger font-medium">
                            {r.absent}
                          </td>
                          <td className="px-6 py-4 text-bb-warning font-medium">
                            {r.excused}
                          </td>
                          <td
                            className="px-6 py-4 text-[#868685] text-sm truncate max-w-xs"
                            title={(r.absentNames || []).join(", ")}
                          >
                            {(r.absentNames || []).join(", ") || "-"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Student List/Grid Section */}
            <div className="space-y-4">
              <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <h3 className="text-xl font-bold text-[#0e0f0c] font-display tracking-tight">
                  Student Attendance
                </h3>
                <div className="flex gap-2">
                  <Button
                    variant="secondary"
                    onClick={handleMarkAllPresent}
                    className="text-xs"
                  >
                    Mark All Present
                  </Button>
                  <Button
                    variant="accent"
                    onClick={async () => {
                      try {
                        setLoading(true);
                        setError("");
                        setSaveMessage("");
                        const entries = students.map((s) => ({
                          studentId: s.id,
                          status: s.status,
                        }));
                        const payload = {
                          date: selectedDate,
                          batchId: selectedBatch || "",
                          entries,
                        };
                        const { data } = await uploadAttendanceBulk(payload);
                        setSaveMessage(`Attendance saved (${data.count})`);
                      } catch (err) {
                        setError(err.response?.data?.error || err.message);
                      } finally {
                        setLoading(false);
                      }
                    }}
                    className="text-xs"
                  >
                    <Save size={14} /> Save Changes
                  </Button>
                </div>
              </div>

              {loading ? (
                <div className="text-[#868685] text-center p-8">
                  Loading students...
                </div>
              ) : filteredStudents.length === 0 ? (
                <div className="text-[#868685] text-center p-8">
                  No students found.
                </div>
              ) : view === "list" ? (
                <div className="bg-white border border-[#e8ebe6] rounded-xl overflow-hidden">
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-white text-[#868685] text-xs uppercase tracking-wider font-medium border-b border-[#e8ebe6]">
                      <tr>
                        <th className="px-6 py-4">Name</th>
                        <th className="px-6 py-4">Attendance %</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#e8ebe6]">
                      {filteredStudents.map((student) => (
                        <tr
                          key={student.id}
                          className="hover:bg-[#f9faf6] transition-colors"
                        >
                          <td className="px-6 py-4 font-medium">
                            {student.name}
                          </td>
                          <td className="px-6 py-4">{student.attendance}%</td>
                          <td className="px-6 py-4">
                            <Badge status={student.status} />
                          </td>
                          <td className="px-6 py-4">
                            <select
                              value={student.status}
                              onChange={(e) =>
                                handleStatusChange(student.id, e.target.value)
                              }
                              className="bg-[var(--bb-offwhite)] border border-[#e8ebe6] rounded px-2 py-1 text-sm focus:ring-1 focus:ring-bb-green outline-none"
                            >
                              <option value="present">Present</option>
                              <option value="absent">Absent</option>
                              <option value="on_leave">On Leave</option>
                            </select>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {filteredStudents.map((student) => (
                    <motion.div
                      key={student.id}
                      className="bg-white border border-[#e8ebe6] rounded-xl p-4 flex flex-col gap-3"
                      whileHover={{ y: -4 }}
                    >
                      <div className="flex justify-between items-start">
                        <h4
                          className="font-medium truncate"
                          title={student.name}
                        >
                          {student.name}
                        </h4>
                        <Badge status={student.status} />
                      </div>
                      <div className="text-sm text-[#868685]">
                        Attendance: {student.attendance}%
                      </div>
                      <div className="mt-auto pt-3 border-t border-[#e8ebe6]">
                        <select
                          value={student.status}
                          onChange={(e) =>
                            handleStatusChange(student.id, e.target.value)
                          }
                          className="w-full bg-[var(--bb-offwhite)] border border-[#e8ebe6] rounded px-2 py-1 text-sm focus:ring-1 focus:ring-bb-green outline-none"
                        >
                          <option value="present">Present</option>
                          <option value="absent">Absent</option>
                          <option value="on_leave">On Leave</option>
                        </select>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.main>

      {/* Modals */}
      <AnimatePresence>
        {showUploadModal && (
          <motion.div
            className="fixed inset-0 bg-[var(--bb-offwhite)]/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowUploadModal(false)}
          >
            <motion.div
              className="bg-white border border-[#e8ebe6] rounded-xl w-full max-w-lg overflow-hidden shadow-2xl"
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b border-[#e8ebe6] flex justify-between items-center">
                <h2 className="text-xl font-bold">Bulk Upload Attendance</h2>
                <button
                  onClick={() => setShowUploadModal(false)}
                  className="text-[#868685] hover:text-[#0e0f0c] transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="p-6 space-y-6">
                <div
                  className={`border-2 border-dashed rounded-xl p-10 text-center transition-all ${
                    dragActive
                      ? "border-bb-green bg-bb-green/5"
                      : "border-[#e8ebe6] hover:border-[#9fe870] hover:bg-white"
                  }`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  {uploadSuccess ? (
                    <motion.div
                      initial={{ scale: 0.5, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="flex flex-col items-center text-bb-positive"
                    >
                      <div className="w-16 h-16 rounded-full bg-bb-positive/20 flex items-center justify-center mb-4">
                        <CheckCircle size={32} />
                      </div>
                      <p className="font-medium">Upload Successful!</p>
                    </motion.div>
                  ) : uploadedFile ? (
                    <div className="flex flex-col items-center">
                      <FileSpreadsheet
                        size={48}
                        className="text-bb-green mb-4"
                      />
                      <p className="font-medium text-[#0e0f0c]">
                        {uploadedFile.name}
                      </p>
                      <p className="text-sm text-[#868685] mt-1">
                        {(uploadedFile.size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center">
                      <div className="w-16 h-16 rounded-full bg-white border border-[#e8ebe6] flex items-center justify-center mb-4 text-[#868685]">
                        <Upload size={28} />
                      </div>
                      <p className="text-[#0e0f0c] font-medium mb-2">
                        Drag & drop file here
                      </p>
                      <p className="text-[#868685] text-sm mb-4">
                        or click to browse
                      </p>
                      <Button
                        variant="secondary"
                        onClick={() => fileInputRef.current?.click()}
                        className="text-xs"
                      >
                        Browse Files
                      </Button>
                    </div>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    onChange={handleFileInput}
                    accept=".csv,.xlsx,.xls"
                  />
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-sm text-[#868685] bg-white p-3 rounded-lg border border-[#e8ebe6]">
                    <AlertCircle
                      size={18}
                      className="text-text-[#38c8ff] shrink-0"
                    />
                    <p>Accepted formats: .csv, .xlsx, .xls (Max 5MB)</p>
                  </div>
                </div>

                <div className="flex justify-end gap-3">
                  <Button
                    variant="secondary"
                    onClick={() => setShowUploadModal(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="accent"
                    disabled={!uploadedFile || uploadSuccess}
                    onClick={() => {
                      setUploadSuccess(true);
                      setTimeout(() => {
                        setShowUploadModal(false);
                        setUploadedFile(null);
                        setUploadSuccess(false);
                      }, 2000);
                    }}
                  >
                    Upload
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Manager Modal */}
      <AnimatePresence>
        {managerOpen && (
          <motion.div
            className="fixed inset-0 bg-[var(--bb-offwhite)]/90 backdrop-blur-sm z-50 flex items-center justify-center p-4 md:p-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onKeyDown={(e) => {
              if (e.key === "Escape") setManagerOpen(false);
            }}
          >
            <motion.div
              className="bg-white border border-[#e8ebe6] rounded-xl w-full max-w-6xl h-[90vh] flex flex-col shadow-2xl overflow-hidden"
              initial={{ scale: 0.98, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.98, opacity: 0 }}
            >
              <div className="px-6 py-4 border-b border-[#e8ebe6] flex justify-between items-center bg-white z-10">
                <div>
                  <h2 className="text-xl font-bold text-[#0e0f0c] font-display tracking-tight">
                    Attendance Manager
                  </h2>
                  <p className="text-sm text-[#868685]">
                    Mark attendance for specific batches and dates
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  {managerError && (
                    <span className="text-bb-danger text-sm">
                      {managerError}
                    </span>
                  )}
                  {managerSuccess && (
                    <span className="text-bb-positive text-sm">
                      {managerSuccess}
                    </span>
                  )}
                  <button
                    onClick={() => setManagerOpen(false)}
                    className="p-2 hover:bg-[#e8ebe6] rounded-lg transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>

              <div className="flex flex-1 overflow-hidden">
                <div className="w-80 bg-white/80 border-r border-[#e8ebe6] p-5 overflow-y-auto space-y-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-medium text-[#868685] uppercase mb-1.5">
                        Select Batch
                      </label>
                      <div className="relative">
                        <select
                          ref={batchSelectRef}
                          value={selectedBatch}
                          onChange={(e) =>
                            handleBatchChangeManager(e.target.value)
                          }
                          className="w-full appearance-none bg-[var(--bb-offwhite)] border border-[#e8ebe6] text-[#0e0f0c] rounded-lg px-3 py-2 pr-10 text-sm focus:ring-1 focus:ring-bb-green outline-none"
                        >
                          <option value="">Select Batch</option>
                          {batches.map((b) => (
                            <option key={b.id} value={b.id}>
                              {b.name}
                            </option>
                          ))}
                        </select>
                        <ChevronDown
                          className="absolute right-3 top-2.5 text-[#868685] pointer-events-none"
                          size={14}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-[#868685] uppercase mb-1.5">
                        Select Date
                      </label>
                      <input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => handleDateChange(e.target.value)}
                        className={`w-full bg-[var(--bb-offwhite)] border ${dateError ? "border-bb-danger" : "border-[#e8ebe6]"} text-[#0e0f0c] rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-bb-green outline-none`}
                      />
                      {dateError && (
                        <p className="text-xs text-bb-danger mt-1">
                          {dateError}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="h-px bg-[#e8ebe6]"></div>

                  <div className="space-y-2">
                    <label className="block text-xs font-medium text-[#868685] uppercase mb-1.5">
                      Quick Actions
                    </label>
                    <Button
                      variant="secondary"
                      className="w-full justify-start text-xs"
                      onClick={() => markAll("present")}
                    >
                      <CheckCircle size={14} className="text-bb-positive" />{" "}
                      Mark All Present
                    </Button>
                    <Button
                      variant="secondary"
                      className="w-full justify-start text-xs"
                      onClick={() => markAll("absent")}
                    >
                      <X size={14} className="text-bb-danger" /> Mark All
                      Absent
                    </Button>
                    <Button
                      variant="secondary"
                      className="w-full justify-start text-xs"
                      onClick={() => markAll("on_leave")}
                    >
                      <Clock size={14} className="text-bb-warning" /> Mark
                      All On Leave
                    </Button>
                  </div>

                  <div className="h-px bg-[#e8ebe6]"></div>

                  <div>
                    <label className="block text-xs font-medium text-[#868685] uppercase mb-3">
                      Recent History
                    </label>
                    <div className="space-y-2">
                      {attendanceHistory.length > 0 ? (
                        attendanceHistory.map((h) => (
                          <div
                            key={h.date}
                            className="bg-[var(--bb-offwhite)] border border-[#e8ebe6] rounded-lg p-3 text-xs"
                          >
                            <div className="flex justify-between mb-2">
                              <span className="text-[#454745] font-medium">
                                {h.date}
                              </span>
                            </div>
                            <div className="flex gap-2 text-[#868685]">
                              <span className="text-bb-positive">
                                P: {h.present}
                              </span>
                              <span className="text-bb-danger">
                                A: {h.absent}
                              </span>
                              <span className="text-bb-warning">
                                L: {h.excused}
                              </span>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-[#868685] text-sm italic">
                          No recent history
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex-1 flex flex-col bg-[var(--bb-offwhite)] overflow-hidden">
                  <div className="p-4 border-b border-[#e8ebe6] bg-white/60 flex gap-4 items-center">
                    <div className="relative flex-1">
                      <Search
                        className="absolute left-3 top-2.5 text-[#868685]"
                        size={16}
                      />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search students within batch..."
                        className="w-full bg-[var(--bb-offwhite)] border border-[#e8ebe6] text-[#0e0f0c] rounded-lg pl-10 pr-4 py-2 text-sm focus:ring-1 focus:ring-bb-green outline-none"
                      />
                    </div>
                    <div className="text-sm text-[#868685]">
                      {filteredManagerStudents.length} students
                    </div>
                  </div>

                  <div className="flex-1 overflow-y-auto p-0">
                    <table className="w-full text-left border-collapse">
                      <thead className="bg-white text-[#868685] text-xs uppercase tracking-wider sticky top-0 z-10 shadow-sm">
                        <tr>
                          <th className="px-6 py-3 font-medium border-b border-[#e8ebe6]">
                            Name
                          </th>
                          <th className="px-6 py-3 font-medium border-b border-[#e8ebe6]">
                            Status
                          </th>
                          <th className="px-6 py-3 font-medium border-b border-[#e8ebe6]">
                            Reason / Note
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#e8ebe6]">
                        {managerLoading ? (
                          <tr>
                            <td
                              className="px-6 py-8 text-center text-[#868685]"
                              colSpan="3"
                            >
                              Loading students...
                            </td>
                          </tr>
                        ) : filteredManagerStudents.length ? (
                          filteredManagerStudents.map((s) => (
                            <tr
                              key={s.id}
                              className="hover:bg-white/80 transition-colors group"
                            >
                              <td className="px-6 py-3 text-sm font-medium">
                                {s.name}
                              </td>
                              <td className="px-6 py-3">
                                <div className="flex gap-1">
                                  {[
                                    {
                                      val: "present",
                                      label: "P",
                                      col: "success",
                                    },
                                    { val: "absent", label: "A", col: "error" },
                                    {
                                      val: "on_leave",
                                      label: "L",
                                      col: "warning",
                                    },
                                  ].map((opt) => (
                                    <button
                                      key={opt.val}
                                      onClick={() =>
                                        setManagerStudents((prev) =>
                                          prev.map((x) =>
                                            x.id === s.id
                                              ? { ...x, status: opt.val }
                                              : x,
                                          ),
                                        )
                                      }
                                      className={`w-8 h-8 rounded flex items-center justify-center text-xs font-bold transition-all ${
                                        s.status === opt.val
                                          ? `bg-accent-${opt.col} text-[#0e0f0c] shadow-lg scale-110`
                                          : "bg-white text-[#868685] border border-[#e8ebe6] hover:border-[#9fe870]"
                                      }`}
                                      title={opt.val.replace("_", " ")}
                                    >
                                      {opt.label}
                                    </button>
                                  ))}
                                </div>
                              </td>
                              <td className="px-6 py-3">
                                <input
                                  type="text"
                                  value={s.reason || ""}
                                  onChange={(e) =>
                                    setManagerStudents((prev) =>
                                      prev.map((x) =>
                                        x.id === s.id
                                          ? { ...x, reason: e.target.value }
                                          : x,
                                      ),
                                    )
                                  }
                                  className="w-full bg-transparent border-b border-transparent focus:border-bb-green text-sm py-1 px-0 outline-none transition-colors placeholder:text-[#e8ebe6] group-hover:placeholder:text-[#868685]"
                                  placeholder="Add a note..."
                                />
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td
                              className="px-6 py-8 text-center text-[#868685]"
                              colSpan="3"
                            >
                              No students found for selected batch
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              <div className="px-6 py-4 bg-white border-t border-[#e8ebe6] flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Button
                    variant="secondary"
                    onClick={saveDraft}
                    className="text-sm"
                  >
                    <Save size={16} /> Save Draft
                  </Button>
                  {draftSaved && (
                    <span className="text-bb-positive text-xs animate-fade-in">
                      Draft saved
                    </span>
                  )}
                </div>
                <div className="flex gap-3">
                  <Button
                    variant="secondary"
                    onClick={() => setManagerOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="accent"
                    onClick={submitAttendance}
                    disabled={managerLoading || !!dateError}
                  >
                    {managerLoading ? "Submitting..." : "Submit Attendance"}
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AttendanceManagement;
