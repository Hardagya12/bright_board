import React from "react";
import { Download, FileSpreadsheet, RefreshCw } from "lucide-react";
import { motion } from "framer-motion";

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

const AttendanceOverview = ({
    loading,
    error,
    rows,
    onRefresh,
    onExport,
}) => {
    return (
        <div className="bg-bw-12/40 border border-white/5 rounded-2xl overflow-hidden backdrop-blur-xl relative">
            {/* Decorative gradient blob */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-accent-primary/5 rounded-full blur-3xl -z-10 pointer-events-none" />

            <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/5 backdrop-blur-md">
                <div>
                    <h3 className="font-bold text-xl text-white tracking-tight">Batch Overview</h3>
                    <p className="text-white/50 text-sm mt-1">Summary of attendance records</p>
                </div>
                <div className="flex gap-3">
                    <Button
                        variant="secondary"
                        className="text-xs py-2"
                        onClick={onRefresh}
                    >
                        <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
                        Refresh
                    </Button>
                    <Button
                        variant="secondary"
                        className="text-xs py-2"
                        onClick={onExport}
                        disabled={!rows.length}
                    >
                        <Download size={14} /> Export PDF
                    </Button>
                </div>
            </div>

            {loading ? (
                <div className="p-12 text-center text-white/50 flex flex-col items-center gap-4">
                    <div className="w-8 h-8 border-2 border-accent-primary border-t-transparent rounded-full animate-spin" />
                    <p>Loading overview data...</p>
                </div>
            ) : error ? (
                <div className="p-12 text-center text-red-400 bg-red-500/5 border-b border-red-500/10">
                    {error}
                </div>
            ) : rows.length === 0 ? (
                <div className="p-16 text-center text-white/40 flex flex-col items-center">
                    <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-4">
                        <FileSpreadsheet size={32} />
                    </div>
                    <p className="text-lg font-medium text-white/70">No records found</p>
                    <p className="text-sm mt-1">Select a batch to view attendance history.</p>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-white/5 text-white/60 text-xs uppercase tracking-wider font-semibold backdrop-blur-sm">
                            <tr>
                                <th className="px-6 py-4">Date</th>
                                <th className="px-6 py-4">Present</th>
                                <th className="px-6 py-4">Absent</th>
                                <th className="px-6 py-4">On Leave</th>
                                <th className="px-6 py-4 w-1/3">Absent Students</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {rows.map((r, idx) => (
                                <motion.tr
                                    key={r.date}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                    className="hover:bg-white/5 transition-colors group"
                                >
                                    <td className="px-6 py-4 font-medium text-white/90 group-hover:text-white transition-colors">
                                        {new Date(r.date).toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                            {r.present}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-500/10 text-red-400 border border-red-500/20">
                                            {r.absent}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
                                            {r.excused}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-white/50 text-sm truncate max-w-xs group-hover:text-white/70 transition-colors" title={(r.absentNames || []).join(", ")}>
                                            {(r.absentNames || []).join(", ") || <span className="text-white/20">-</span>}
                                        </div>
                                    </td>
                                </motion.tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default AttendanceOverview;
