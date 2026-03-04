// Header component displaying the app title, logo, and current model selection

import { FaCoins, FaProjectDiagram } from 'react-icons/fa';
import { useLanguage } from '../contexts/LanguageContext';

const Header = ({ selectedModel, isSidebarOpen, sessionTokens }) => {
    const { t } = useLanguage();

    return (
        <header className={`w-full p-4 z-50 transition-all duration-300 ${!isSidebarOpen ? 'pl-16' : 'pl-16 md:p-4'}`}>
            <div className="max-w-4xl mx-auto flex items-center justify-between">
                {/* Model Selector / Title Button */}
                <div className="flex items-center gap-2 px-3 py-2 rounded-xl">
                    <span className="text-zinc-800 dark:text-zinc-200 font-medium text-lg flex items-center gap-2 transition-colors">
                        {t('app.title')}
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-zinc-200 dark:bg-zinc-800 text-xs text-zinc-600 dark:text-zinc-400 transition-colors">
                        {selectedModel?.shortLabel}
                    </span>
                </div>

                {/* Right side controls */}
                <div className="flex items-center gap-2 sm:gap-4">
                    {/* Token Counter */}
                    {sessionTokens > 0 && (
                        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200/50 dark:border-zinc-700/50 text-xs text-zinc-600 dark:text-zinc-400 font-medium tracking-wide">
                            <FaCoins className="w-3 h-3 text-yellow-500/80" />
                            <span>~{sessionTokens.toLocaleString()} tx</span>
                        </div>
                    )}

                    <div className="w-2 h-2 bg-green-500 rounded-full shadow-[0_0_8px_rgba(34,197,94,0.6)]"></div>
                </div>
            </div>
        </header>
    );
}

export default React.memo(Header);