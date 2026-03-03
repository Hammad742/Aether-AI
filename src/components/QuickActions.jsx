// Quick action buttons component providing preset prompts for common AI assistant tasks
/* eslint-disable no-unused-vars */

import { FaImage, FaProjectDiagram } from 'react-icons/fa';
import { useLanguage } from '../contexts/LanguageContext';

const QuickActions = ({ onSelect, onOpenEditor, prompt }) => {
    const { t } = useLanguage();

    const QUICK_ACTIONS = [
        { icon: FaImage, label: t('quick.generateImage'), prompt: t('quick.generateImagePrompt') },
    ];

    const isPromptEmpty = !prompt || prompt.trim() === '';

    return (
        <div className="text-center">
            {/* Section description */}
            <p className="text-zinc-400 text-sm mb-4">Try these examples to get started</p>
            {/* Quick action buttons grid */}
            <div className="flex flex-col justify-center gap-2 sm:flex-row sm:flex-wrap sm:gap-3">
                {QUICK_ACTIONS.map(({ icon: IconComponent, label, prompt: actionPrompt }) => (
                    <button key={label} onClick={() => onSelect(actionPrompt)} className='group flex items-center gap-2 px-4 py-2 bg-zinc-800/80 hover:bg-zinc-700/80 border border-zinc-700/50 rounded-full text-zinc-300 hover:text-white transition-all duration-200 shadow-md backdrop-blur-sm'>
                        {/* Action icon with hover color change */}
                        <div className="text-zinc-400 group-hover:text-accent-light transition-colors">
                            <IconComponent className='w-3.5 h-3.5' />
                        </div>
                        {/* Action label */}
                        <span className="text-sm font-medium">{label}</span>
                    </button>
                ))}

                {/* Direct Editor Trigger */}
                <button
                    onClick={onOpenEditor}
                    className="group glass-apple-blue flex items-center gap-2 px-4 py-2 border-accent/20 rounded-full transition-all duration-300 shadow-sm hover:border-accent/40 hover:shadow-lg hover:shadow-accent/20 active:scale-95"
                >
                    <div className="flex items-center gap-2 relative z-20">
                        <FaProjectDiagram className='w-3.5 h-3.5 text-accent group-hover:scale-110 transition-transform' />
                        <span className="text-sm font-medium text-zinc-700 dark:text-zinc-200 group-hover:text-zinc-900 dark:group-hover:text-white transition-colors">Aether Workspace</span>
                    </div>
                </button>
            </div>
        </div>
    );
};

export default QuickActions;