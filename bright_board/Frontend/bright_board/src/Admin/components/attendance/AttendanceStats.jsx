import React from "react";
import { motion } from "framer-motion";
import { Users, Clock, Calendar, TrendingUp } from "lucide-react";

const StatCard = ({ title, value, icon: Icon, subtext, gradient, iconColor }) => (
    <motion.div
        className={`relative overflow-hidden rounded-2xl p-6 border border-white/5 ${gradient}`}
        whileHover={{ y: -4, scale: 1.01 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
        {/* Background Glow */}
        <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-white/10 rounded-full blur-2xl" />

        <div className="relative z-10 flex items-start justify-between">
            <div>
                <h3 className="text-sm font-medium text-white/70 mb-1">{title}</h3>
                <div className="text-3xl font-bold text-white tracking-tight">{value}</div>
                {subtext && (
                    <div className="flex items-center gap-1.5 mt-2 text-xs font-medium text-white/50 bg-black/20 w-fit px-2 py-1 rounded-full backdrop-blur-sm">
                        <TrendingUp size={12} />
                        {subtext}
                    </div>
                )}
            </div>
            <div className={`p-3 rounded-xl bg-white/10 backdrop-blur-md border border-white/10 ${iconColor}`}>
                <Icon size={24} className="text-white" />
            </div>
        </div>
    </motion.div>
);

const AttendanceStats = ({ students }) => {
    const totalStudents = students.length;
    const presentCount = students.filter((s) => s.status === "present").length;
    const presentPercentage = totalStudents
        ? Math.round((presentCount / totalStudents) * 100)
        : 0;

    return (
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCard
                title="Total Students"
                value={totalStudents}
                icon={Users}
                gradient="bg-gradient-to-br from-blue-600/20 to-blue-900/20 hover:from-blue-600/30 hover:to-blue-900/30"
                iconColor="bg-blue-500/20"
                subtext="Across all batches"
            />
            <StatCard
                title="Present Today"
                value={`${presentPercentage}%`}
                icon={Clock}
                gradient="bg-gradient-to-br from-emerald-600/20 to-emerald-900/20 hover:from-emerald-600/30 hover:to-emerald-900/30"
                iconColor="bg-emerald-500/20"
                subtext={`${presentCount} students checked in`}
            />
            <StatCard
                title="Monthly Average"
                value="92%"
                icon={Calendar}
                gradient="bg-gradient-to-br from-violet-600/20 to-violet-900/20 hover:from-violet-600/30 hover:to-violet-900/30"
                iconColor="bg-violet-500/20"
                subtext="+2.4% from last month"
            />
        </section>
    );
};

export default AttendanceStats;
