import React from 'react';
import { PERSONAS } from '../constants/personas';
import { useLanguage } from '../contexts/LanguageContext';

const PersonaSelector = ({ selectedPersona, onSelect }) => {
    useLanguage();

    return (
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none px-4 max-w-full">
            {PERSONAS.map((persona) => {
                const Icon = persona.icon;
                const isSelected = selectedPersona.id === persona.id;

                return (
                    <button
                        key={persona.id}
                        onClick={() => onSelect(persona)}
                        className={`
                            flex-shrink-0 flex items-center gap-2.5 px-4 py-2 rounded-xl transition-all duration-300
                            ${isSelected
                                ? 'bg-accent-DEFAULT text-accent-contrast shadow-lg shadow-accent-glow/20 scale-105 border-accent-DEFAULT'
                                : 'bg-zinc-100 dark:bg-zinc-800/50 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700/50 hover:bg-zinc-200 dark:hover:bg-zinc-700/50 hover:scale-102'
                            }
                            border-1
                        `}
                        title={persona.description}
                    >
                        <div className={`p-1.5 rounded-lg ${isSelected ? 'bg-white/20' : 'bg-zinc-200 dark:bg-zinc-700'}`}>
                            <Icon size={16} />
                        </div>
                        <span className="text-sm font-medium whitespace-nowrap">
                            {persona.name}
                        </span>
                    </button>
                );
            })}
        </div>
    );
};

export default PersonaSelector;
