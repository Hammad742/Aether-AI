// Custom React components for rendering markdown content in the asistant response

import React from 'react'
import ImageWithFallback from './ImageWithFallback'
import CodeBlock from './CodeBlock'

// Helper function to create styled HTML elements with consistent className
const asTag = (Tag, className) => ({ children }) => <Tag className={className}>{children}</Tag>

// Configuration object mapping markdown elements to React components with custom styling
const markdownComponents = {
    // Code block with syntax highlighting
    code: CodeBlock,
    // Tables with horizontal scrolling for mobile
    table: ({ children }) => (
        <div className='overflow-x-auto my-6 rounded-lg border border-zinc-200 dark:border-zinc-700/50'>
            <table className='min-w-full divide-y divide-zinc-200 dark:divide-zinc-700/50'>{children}</table>
        </div>
    ),
    // Blockquotes with blue accent border
    blockquote: asTag('blockquote', 'border-l-4 border-accent pl-4 py-1 my-4 italic text-zinc-700 dark:text-zinc-300 bg-zinc-100/50 dark:bg-zinc-800/30 rounded-r-lg'),
    // Horizontal rules
    hr: () => <hr className='border-zinc-200 dark:border-zinc-700/50 my-6' />,
    // Table headers with dynamic background
    th: asTag('th', 'bg-zinc-100 dark:bg-zinc-800/50 px-4 py-3 text-left text-sm font-semibold text-zinc-800 dark:text-zinc-100'),
    // Table data cells
    td: asTag('td', 'px-4 py-3 text-sm text-zinc-700 dark:text-zinc-300 border-t border-zinc-200 dark:border-zinc-700/50'),
    // Heading styles (h1-h4)
    h1: asTag('h1', 'text-2xl font-bold text-zinc-900 dark:text-white mt-6 mb-4 first:mt-0'),
    h2: asTag('h2', 'text-xl font-semibold text-zinc-900 dark:text-white mt-5 mb-3'),
    h3: asTag('h3', 'text-lg font-semibold text-zinc-800 dark:text-white mt-4 mb-2'),
    h4: asTag('h4', 'text-base font-semibold text-zinc-800 dark:text-zinc-100 mt-4 mb-2'),
    // Paragraphs - inteligentes to avoid <div> inside <p> errors when images are present
    p: ({ children }) => {
        // If the only child is an image, don't wrap it in a <p>
        const isImage = React.Children.toArray(children).some(child =>
            child.type && (child.type.name === 'ImageWithFallback' || child.type === 'img')
        );

        if (isImage) return <>{children}</>;

        return <p className='mb-4 last:mb-0 leading-relaxed text-zinc-800 dark:text-zinc-300'>{children}</p>
    },
    // Lists (unordered and ordered)
    ul: asTag('ul', 'list-disc list-outside ml-6 space-y-1 mb-4 text-zinc-800 dark:text-zinc-300 marker:text-zinc-500 dark:marker:text-zinc-400'),
    ol: asTag('ol', 'list-decimal list-outside ml-6 space-y-1 mb-4 text-zinc-800 dark:text-zinc-300'),
    // List items
    li: asTag('li', 'pl-1 leading-relaxed'),
    // Images
    img: ImageWithFallback,
    // Links
    a: ({ href, children }) => (
        <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent dark:text-accent-light hover:text-accent-hover dark:hover:text-accent hover:underline transition-colors"
        >
            {children}
        </a>
    )
}

export default markdownComponents;