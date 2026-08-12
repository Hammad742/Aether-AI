// Quick action buttons component providing preset prompts for common AI assistant tasks
/* eslint-disable no-unused-vars */

import { FaImage } from 'react-icons/fa'
import { useTranslation } from '../hooks/useTranslation'
import { memo } from 'react'

const QuickActions = ({ onSelect }) => {
    const { t } = useTranslation();

    // We recreate the array inside the component so we can use the translation hook
    const QUICK_ACTIONS = [
        { icon: FaImage, label: t('generate_image'), prompt: t('generate_image_prompt') || 'Generate an image of a ' },
    ];

    return (
        <div className="text-center">
            {/* Section description */}
            <p className="text-custom-secondary text-sm mb-4">{t('try_examples')}</p>
            {/* Quick action buttons grid */}
            <div className="flex flex-col justify-center gap-2 sm:flex-row sm:flex-wrap sm:gap-3">
                {QUICK_ACTIONS.map(({ icon: IconComponent, label, prompt: actionPrompt }) => (
                    <button 
                        key={label} 
                        onClick={() => onSelect(actionPrompt, { isImage: true })} 
                        className="group relative flex items-center gap-2 px-4 py-2 bg-custom-secondary/50 hover:bg-custom-tertiary border border-custom hover:border-blue-500/30 rounded-full text-custom-primary transition-all duration-300 shadow-sm hover:shadow-md hover:shadow-blue-500/10 backdrop-blur-md overflow-hidden"
                    >
                        {/* Glow effect on hover */}
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-blue-500/10 to-purple-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        
                        {/* Action icon with dynamic styling */}
                        <div className="relative flex items-center justify-center text-blue-400 group-hover:scale-110 transition-all duration-300">
                            <IconComponent className='w-3.5 h-3.5' />
                        </div>
                        
                        {/* Action label */}
                        <span className="relative text-sm font-medium">{label}</span>
                    </button>
                ))}
            </div>
        </div>
    );
}

export default memo(QuickActions);