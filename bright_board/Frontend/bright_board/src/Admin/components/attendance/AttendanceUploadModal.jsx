import React, { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    X,
    Upload,
    FileSpreadsheet,
    AlertCircle,
    CheckCircle,
} from "lucide-react";

const Button = ({
    children,
    variant = "primary",
    className = "",
    ...props
}) => {
    const variants = {
        primary: "bg-white text-black hover:bg-bw-87 border border-transparent",
        secondary:
            "bg-bw-12 text-bw-100 border border-bw-25 hover:bg-bw-25 hover:border-bw-37",
        accent:
            "bg-accent-primary text-white hover:bg-accent-primaryDark border border-transparent",
    };

    return (
        <motion.button
            className={`px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2 transition-colors ${variants[variant]} ${className}`}
            whileTap={{ scale: 0.98 }}
            {...props}
        >
            {children}
        </motion.button>
    );
};

const AttendanceUploadModal = ({ isOpen, onClose }) => {
    const [dragActive, setDragActive] = useState(false);
    const [uploadedFile, setUploadedFile] = useState(null);
    const [uploadSuccess, setUploadSuccess] = useState(false);
    const fileInputRef = useRef(null);

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
        // Mock upload simulation
        setTimeout(() => {
            setUploadSuccess(true);
            setTimeout(() => {
                onClose();
                setUploadedFile(null);
                setUploadSuccess(false);
            }, 2000);
        }, 1500);
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                >
                    <motion.div
                        className="bg-bw-12 border border-bw-25 rounded-xl w-full max-w-lg overflow-hidden shadow-2xl"
                        initial={{ scale: 0.95, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.95, opacity: 0, y: 20 }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="p-6 border-b border-bw-25 flex justify-between items-center">
                            <h2 className="text-xl font-bold">Bulk Upload Attendance</h2>
                            <button
                                onClick={onClose}
                                className="text-bw-50 hover:text-white transition-colors"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        <div className="p-6 space-y-6">
                            <div
                                className={`border-2 border-dashed rounded-xl p-10 text-center transition-all ${dragActive
                                        ? "border-accent-primary bg-accent-primary/5"
                                        : "border-bw-37 hover:border-bw-50 hover:bg-bw-12"
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
                                        className="flex flex-col items-center text-accent-success"
                                    >
                                        <div className="w-16 h-16 rounded-full bg-accent-success/20 flex items-center justify-center mb-4">
                                            <CheckCircle size={32} />
                                        </div>
                                        <p className="font-medium">Upload Successful!</p>
                                    </motion.div>
                                ) : uploadedFile ? (
                                    <div className="flex flex-col items-center">
                                        <FileSpreadsheet
                                            size={48}
                                            className="text-accent-primary mb-4"
                                        />
                                        <p className="font-medium text-white">
                                            {uploadedFile.name}
                                        </p>
                                        <p className="text-sm text-bw-62 mt-1">
                                            {(uploadedFile.size / 1024).toFixed(1)} KB
                                        </p>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center">
                                        <div className="w-16 h-16 rounded-full bg-bw-12 border border-bw-25 flex items-center justify-center mb-4 text-bw-50">
                                            <Upload size={28} />
                                        </div>
                                        <p className="text-white font-medium mb-2">
                                            Drag & drop file here
                                        </p>
                                        <p className="text-bw-62 text-sm mb-4">
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
                                <div className="flex items-center gap-3 text-sm text-bw-62 bg-bw-12 p-3 rounded-lg border border-bw-25">
                                    <AlertCircle size={18} className="text-accent-info shrink-0" />
                                    <p>Accepted formats: .csv, .xlsx, .xls (Max 5MB)</p>
                                </div>
                            </div>

                            <div className="flex justify-end gap-3">
                                <Button variant="secondary" onClick={onClose}>
                                    Cancel
                                </Button>
                                <Button
                                    variant="accent"
                                    disabled={!uploadedFile || uploadSuccess}
                                    onClick={() => {
                                        setUploadSuccess(true);
                                        setTimeout(() => {
                                            onClose();
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
    );
};

export default AttendanceUploadModal;
