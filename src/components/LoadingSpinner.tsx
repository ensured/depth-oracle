interface LoadingSpinnerProps {
  className?: string;
}

export default function LoadingSpinner({ className = "" }: LoadingSpinnerProps) {
  return (
    <div className={`flex min-h-[calc(100vh-3.6rem)] items-center justify-center bg-gradient-to-br from-slate-50 via-indigo-50/30 to-purple-50/30 dark:from-slate-900 dark:via-indigo-950/20 dark:to-purple-950/20 ${className}`}>
      <div className="text-center px-6 relative">
        {/* Mystical background glow */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-32 h-32 bg-gradient-to-r from-purple-400/20 to-indigo-400/20 rounded-full blur-xl animate-pulse"></div>
        </div>

        {/* Enhanced spinner with mystical design */}
        <div className="relative z-10 mx-auto mb-8 h-20 w-20">
          <div className="absolute inset-0 rounded-full border-4 border-purple-200/30 animate-spin"></div>
          <div className="absolute inset-2 rounded-full border-4 border-transparent border-t-purple-500 animate-spin"></div>
          <div className="absolute inset-4 rounded-full border-2 border-transparent border-t-indigo-400 animate-spin"></div>

          {/* Center mystical symbol */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center shadow-lg">
              <div className="w-3 h-3 bg-white rounded-full opacity-80"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
