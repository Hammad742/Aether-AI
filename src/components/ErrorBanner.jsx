// Error banner component that displays error messages or status updates

import { FaExclamationTriangle, FaSpinner } from "react-icons/fa";

const ErrorBanner = ({ message }) => {
    if (!message) return null;

    const lowerMsg = message.toLowerCase();
    const isInfo = lowerMsg.includes('searching') || lowerMsg.includes('generating');

    const containerClasses = isInfo
        ? "border-accent/30 bg-gradient-to-r from-accent/10 to-transparent text-accent-light dark:text-accent-light/90"
        : "border-red-500/30 bg-gradient-to-r from-red-500/10 to-rose-500/10 text-red-200";

    const Icon = isInfo ? FaSpinner : FaExclamationTriangle;
    const iconClasses = `w-4 h-4 sm:w-5 sm:h-5 mt-0.5 shrink-0 ${isInfo ? 'text-accent animate-spin' : 'text-red-400'}`;

    const titleText = isInfo ? "Status" : "Error";
    const titleClasses = `font-medium mb-1 text-sm sm:text-base ${isInfo ? 'text-accent dark:text-accent-light' : 'text-red-300'}`;

    return (
        <div className={`rounded-2xl border px-4 py-3 backdrop-blur-sm shadow-xl sm:px-6 sm:py-4 transition-all duration-300 ${containerClasses}`}>
            <div className="flex items-start gap-2 sm:gap-3">
                <Icon className={iconClasses} />
                <div>
                    <p className={titleClasses}>{titleText}</p>
                    <p className="text-xs leading-relaxed sm:text-sm">{message}</p>
                </div>
            </div>
        </div>
    );
};

export default ErrorBanner;