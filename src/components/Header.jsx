// Header component displaying the app title, logo, and current model selection

import { TbLayoutSidebarLeftExpand } from 'react-icons/tb'

const Header = ({ selectedModel, toggleSidebar }) => (
    <header className="absolute top-0 left-0 right-0 p-4 pb-4 z-50 bg-transparent backdrop-blur-sm">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
            {/* Left side: Hamburger (Mobile) + Brand */}
            <div className="flex items-center gap-3">
                <button
                    onClick={toggleSidebar}
                    className="p-2 -ml-2 rounded-xl text-custom-secondary hover:text-custom-primary hover:bg-custom-tertiary transition-colors md:hidden"
                >
                    <TbLayoutSidebarLeftExpand className="w-5 h-5" />
                </button>
                <div className="flex items-center gap-2 px-3 py-2 rounded-xl transition-colors">
                    <span className="text-custom-primary font-medium text-lg flex items-center gap-2">
                        Aether AI <span className="text-custom-secondary">Assistant</span>
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-custom-tertiary text-xs text-custom-secondary hidden sm:inline-block">
                        {selectedModel?.shortLabel}
                    </span>
                </div>
            </div>

            {/* Status Dot */}
            <div className="w-2 h-2 bg-green-500 rounded-full shadow-[0_0_8px_rgba(34,197,94,0.6)]"></div>
        </div>
    </header>
)

export default Header;