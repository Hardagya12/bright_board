import React, { useState, useEffect, useRef } from "react";
import {
    X,
    Search,
    CheckCircle,
    Clock,
    Save,
    ChevronDown,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { listStudents } from "../../../utils/services/students";
import {
    listAttendance,
    uploadAttendanceBulk,
} from "../../../utils/services/attendance";

const Button = ({
    children,
    variant = "primary",
    className = "",
    ...props
}) => {
    const variants = {
        primary: "bg-white text-black hover:bg-gray-200 border border-transparent shadow-lg shadow-white/10",
        secondary:
            "bg-white/5 text-white border border-white/10 hover:bg-white/10 hover:border-white/20 backdrop-blur-sm",
        accent:
            "bg-blue-600 text-white hover:bg-blue-700 border border-transparent shadow-lg shadow-blue-500/20",
    };

    return (
        <motion.button
            className={`px-4 py-2 rounded-xl font-medium text-sm flex items-center gap-2 transition-all ${variants[variant]} ${className}`}
            whileTap={{ scale: 0.98 }}
            whileHover={{ scale: 1.02 }}
            {...props}
        >
            {children}
        </motion.button>
    );
};

const AttendanceManager = ({ isOpen, onClose, batches, initialBatchId }) => {
    const [selectedBatch, setSelectedBatch] = useState(initialBatchId || "");
    const [selectedDate, setSelectedDate] = useState(
        new Date().toISOString().split("T")[0]
    );
    const [searchQuery, setSearchQuery] = useState("");
    const [managerStudents, setManagerStudents] = useState([]);
    const [attendanceHistory, setAttendanceHistory] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [dateError, setDateError] = useState("");
    const [draftSaved, setDraftSaved] = useState(false);
    const batchSelectRef = useRef(null);

    useEffect(() => {
        if (isOpen && initialBatchId) {
            setSelectedBatch(initialBatchId);
            handleBatchChange(initialBatchId);
        }
    }, [isOpen, initialBatchId]);

    useEffect(() => {
        if (isOpen) {
            setTimeout(() => {
                batchSelectRef.current?.focus();
            }, 0);
        }
    }, [isOpen]);

    const handleBatchChange = async (val) => {
        setSelectedBatch(val);
        setLoading(true);
        setError("");
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
        } catch (err) {
            setError(err.response?.data?.error || err.message);
        } finally {
            setLoading(false);
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
        } catch (e) {
            console.error(e);
        }
    };

    const handleDateChange = (val) => {
        setSelectedDate(val);
        const todayStr = new Date().toISOString().split("T")[0];
        if (val > todayStr) {
            setDateError("Future dates are not allowed");
        } else {
            setDateError("");
        }
        loadDraftIfAvailable(selectedBatch, val);
        loadAttendanceHistory(selectedBatch);
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
            JSON.stringify(draft)
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
                })
            );
        } catch (e) {
            console.error(e);
        }
    };

    const markAll = (status) => {
        setManagerStudents((prev) => prev.map((s) => ({ ...s, status })));
    };

    const submitAttendance = async () => {
        setSuccess("");
        setError("");
        if (!selectedBatch) {
            setError("Please select a batch");
            return;
        }
        if (dateError) {
            setError("Please fix date errors before submitting");
            return;
        }
        const entries = managerStudents.map((s) => ({
            studentId: s.id,
            status: s.status === "on_leave" ? "excused" : s.status,
            reason: s.reason || "",
        }));
        if (entries.length === 0) {
            setError("No students to submit");
            return;
        }
        setLoading(true);
        try {
            const { data } = await uploadAttendanceBulk({
                date: selectedDate,
                batchId: selectedBatch || "",
                entries,
            });
            setSuccess(`Attendance submitted successfully (${data.count})`);
        } catch (err) {
            setError(err.response?.data?.error || err.message);
        } finally {
            setLoading(false);
        }
    };

    const filteredManagerStudents = managerStudents.filter((s) =>
        s.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4 md:p-8"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onKeyDown={(e) => {
                        if (e.key === "Escape") onClose();
                    }}
                >
                    <motion.div
                        className="bg-bw-12/90 border border-white/10 rounded-2xl w-full max-w-6xl h-[90vh] flex flex-col shadow-2xl overflow-hidden backdrop-blur-xl relative"
                        initial={{ scale: 0.98, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.98, opacity: 0 }}
                    >
                        {/* Modal Header */}
                        <div className="px-6 py-4 border-b border-white/10 flex justify-between items-center bg-white/5 z-10">
                            <div>
                                <h2 className="text-2xl font-bold text-white font-comic tracking-tight">
                                    Attendance Manager
                                </h2>
                                <p className="text-sm text-white/50">
                                    Mark attendance for specific batches and dates
                                </p>
                            </div>
                            <div className="flex items-center gap-4">
                                {error && (
                                    <span className="text-red-400 text-sm bg-red-500/10 px-3 py-1 rounded-full border border-red-500/20">{error}</span>
                                )}
                                {success && (
                                    <span className="text-emerald-400 text-sm bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">{success}</span>
                                )}
                                <button
                                    onClick={onClose}
                                    className="p-2 hover:bg-white/10 rounded-lg transition-colors text-white/70 hover:text-white"
                                >
                                    <X size={20} />
                                </button>
                            </div>
                        </div>

                        {/* Modal Content */}
                        <div className="flex flex-1 overflow-hidden">
                            {/* Left Sidebar - Controls */}
                            <div className="w-80 bg-black/20 border-r border-white/10 p-5 overflow-y-auto space-y-6">
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-xs font-medium text-white/50 uppercase mb-1.5">
                                            Select Batch
                                        </label>
                                        <div className="relative">
                                            <select
                                                ref={batchSelectRef}
                                                value={selectedBatch}
                                                onChange={(e) => handleBatchChange(e.target.value)}
                                                className="w-full appearance-none bg-black/40 border border-white/10 text-white rounded-xl px-3 py-2.5 pr-10 text-sm focus:ring-2 focus:ring-accent-primary/50 outline-none hover:bg-black/60 transition-all"
                                            >
                                                <option value="">Select Batch</option>
                                                {batches.map((b) => (
                                                    <option key={b.id} value={b.id}>
                                                        {b.name}
                                                    </option>
                                                ))}
                                            </select>
                                            <ChevronDown
                                                className="absolute right-3 top-3 text-white/50 pointer-events-none"
                                                size={14}
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-medium text-white/50 uppercase mb-1.5">
                                            Select Date
                                        </label>
                                        <input
                                            type="date"
                                            value={selectedDate}
                                            onChange={(e) => handleDateChange(e.target.value)}
                                            className={`w-full bg-black/40 border ${dateError ? "border-red-500/50" : "border-white/10"
                                                } text-white rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-accent-primary/50 outline-none hover:bg-black/60 transition-all`}
                                        />
                                        {dateError && (
                                            <p className="text-xs text-red-400 mt-1">
                                                {dateError}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <div className="h-px bg-white/10"></div>

                                <div className="space-y-2">
                                    <label className="block text-xs font-medium text-white/50 uppercase mb-1.5">
                                        Quick Actions
                                    </label>
                                    <Button
                                        variant="secondary"
                                        className="w-full justify-start text-xs py-2.5 bg-white/5 hover:bg-white/10 border-white/5"
                                        onClick={() => markAll("present")}
                                    >
                                        <CheckCircle size={14} className="text-emerald-400" />{" "}
                                        Mark All Present
                                    </Button>
                                    <Button
                                        variant="secondary"
                                        className="w-full justify-start text-xs py-2.5 bg-white/5 hover:bg-white/10 border-white/5"
                                        onClick={() => markAll("absent")}
                                    >
                                        <X size={14} className="text-red-400" /> Mark All
                                        Absent
                                    </Button>
                                    <Button
                                        variant="secondary"
                                        className="w-full justify-start text-xs py-2.5 bg-white/5 hover:bg-white/10 border-white/5"
                                        onClick={() => markAll("on_leave")}
                                    >
                                        <Clock size={14} className="text-amber-400" /> Mark All
                                        On Leave
                                    </Button>
                                </div>

                                <div className="h-px bg-white/10"></div>

                                <div>
                                    <label className="block text-xs font-medium text-white/50 uppercase mb-3">
                                        Recent History
                                    </label>
                                    <div className="space-y-2">
                                        {attendanceHistory.length > 0 ? (
                                            attendanceHistory.map((h) => (
                                                <div
                                                    key={h.date}
                                                    className="bg-white/5 border border-white/10 rounded-lg p-3 text-xs hover:bg-white/10 transition-colors"
                                                >
                                                    <div className="flex justify-between mb-2">
                                                        <span className="text-white/90 font-medium">
                                                            {h.date}
                                                        </span>
                                                    </div>
                                                    <div className="flex gap-2 text-white/60">
                                                        <span className="text-emerald-400">
                                                            P: {h.present}
                                                        </span>
                                                        <span className="text-red-400">
                                                            A: {h.absent}
                                                        </span>
                                                        <span className="text-amber-400">
                                                            L: {h.excused}
                                                        </span>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <p className="text-white/30 text-sm italic">
                                                No recent history
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Right Content - Student List */}
                            <div className="flex-1 flex flex-col bg-black/20 overflow-hidden">
                                <div className="p-4 border-b border-white/10 bg-white/5 flex gap-4 items-center">
                                    <div className="relative flex-1">
                                        <Search
                                            className="absolute left-3 top-2.5 text-white/40"
                                            size={16}
                                        />
                                        <input
                                            type="text"
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            placeholder="Search students within batch..."
                                            className="w-full bg-black/40 border border-white/10 text-white rounded-xl pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-accent-primary/50 outline-none hover:bg-black/60 transition-all"
                                        />
                                    </div>
                                    <div className="text-sm text-white/50">
                                        {filteredManagerStudents.length} students
                                    </div>
                                </div>

                                <div className="flex-1 overflow-y-auto p-0 scrollbar-thin scrollbar-thumb-white/10">
                                    <table className="w-full text-left border-collapse">
                                        <thead className="bg-white/5 text-white/60 text-xs uppercase tracking-wider sticky top-0 z-10 backdrop-blur-md">
                                            <tr>
                                                <th className="px-6 py-3 font-medium border-b border-white/10">
                                                    Name
                                                </th>
                                                <th className="px-6 py-3 font-medium border-b border-white/10">
                                                    Status
                                                </th>
                                                <th className="px-6 py-3 font-medium border-b border-white/10">
                                                    Reason / Note
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-white/5">
                                            {loading ? (
                                                <tr>
                                                    <td
                                                        className="px-6 py-8 text-center text-white/50"
                                                        colSpan="3"
                                                    >
                                                        <div className="flex justify-center items-center gap-2">
                                                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                            Loading students...
                                                        </div>
                                                    </td>
                                                </tr>
                                            ) : filteredManagerStudents.length ? (
                                                filteredManagerStudents.map((s) => (
                                                    <tr
                                                        key={s.id}
                                                        className="hover:bg-white/5 transition-colors group"
                                                    >
                                                        <td className="px-6 py-3 text-sm font-medium text-white/90">
                                                            {s.name}
                                                        </td>
                                                        <td className="px-6 py-3">
                                                            <div className="flex gap-1">
                                                                {[
                                                                    {
                                                                        val: "present",
                                                                        label: "P",
                                                                        col: "bg-emerald-500 hover:bg-emerald-600",
                                                                        activeRing: "ring-emerald-500/50"
                                                                    },
                                                                    {
                                                                        val: "absent",
                                                                        label: "A",
                                                                        col: "bg-red-500 hover:bg-red-600",
                                                                        activeRing: "ring-red-500/50"
                                                                    },
                                                                    {
                                                                        val: "on_leave",
                                                                        label: "L",
                                                                        col: "bg-amber-500 hover:bg-amber-600",
                                                                        activeRing: "ring-amber-500/50"
                                                                    },
                                                                ].map((opt) => (
                                                                    <button
                                                                        key={opt.val}
                                                                        onClick={() =>
                                                                            setManagerStudents((prev) =>
                                                                                prev.map((x) =>
                                                                                    x.id === s.id
                                                                                        ? { ...x, status: opt.val }
                                                                                        : x
                                                                                )
                                                                            )
                                                                        }
                                                                        className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold transition-all ${s.status === opt.val
                                                                                ? `${opt.col} text-white shadow-lg scale-105 ring-2 ${opt.activeRing}`
                                                                                : "bg-white/5 text-white/40 border border-white/10 hover:border-white/30 hover:text-white"
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
                                                                                : x
                                                                        )
                                                                    )
                                                                }
                                                                className="w-full bg-transparent border-b border-transparent focus:border-accent-primary/50 text-sm py-1 px-0 outline-none transition-colors placeholder:text-white/20 group-hover:placeholder:text-white/40 text-white/80"
                                                                placeholder="Add a note..."
                                                            />
                                                        </td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td
                                                        className="px-6 py-8 text-center text-white/40"
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

                        {/* Footer Actions */}
                        <div className="px-6 py-4 bg-white/5 border-t border-white/10 flex justify-between items-center backdrop-blur-md">
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="secondary"
                                    onClick={saveDraft}
                                    className="text-sm bg-white/5 hover:bg-white/10 border-white/10"
                                >
                                    <Save size={16} /> Save Draft
                                </Button>
                                {draftSaved && (
                                    <span className="text-emerald-400 text-xs animate-fade-in flex items-center gap-1">
                                        <CheckCircle size={12} /> Draft saved
                                    </span>
                                )}
                            </div>
                            <div className="flex gap-3">
                                <Button variant="secondary" onClick={onClose} className="bg-white/5 hover:bg-white/10 border-white/10">
                                    Cancel
                                </Button>
                                <Button
                                    variant="accent"
                                    onClick={submitAttendance}
                                    disabled={loading || !!dateError}
                                    className="shadow-lg shadow-blue-600/20"
                                >
                                    {loading ? "Submitting..." : "Submit Attendance"}
                                </Button>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default AttendanceManager;
