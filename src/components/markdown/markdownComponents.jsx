// Custom React components for rendering markdown content in the asistant response

import React from 'react'
import ImageWithFallback from './ImageWithFallback'
import CodeBlock from './CodeBlock'

// Helper function to create styled HTML elements with consistent className
const asTag = (Tag, className) => ({ children }) => <Tag className={className}>{children}</Tag>

// Configuration object mapping markdown elements to React components with custom styling
const markdownComponents = {
    // Strip native pre tag because CodeBlock already generates its own styled `<pre>`, 
    // otherwise double `<pre>` forces massive full-screen horizontal parent overflow on mobile.
    pre: ({ children }) => <>{children}</>,
    // Code block with syntax highlighting
    code: CodeBlock,
    // Tables rigidly fit the screen (no horizontal scrolling required) matching ChatGPT UI
    table: ({ children }) => (
        <div className='w-full max-w-full pb-2 mb-4 rounded-xl'>
            <table className='w-full border-collapse border border-custom text-xs sm:text-sm table-fixed break-words'>{children}</table>
        </div>
    ),
    // Blockquotes with blue accent border
    blockquote: ({ children }) => (
        <blockquote className='border-l-4 border-blue-500 pl-4 italic text-custom-primary bg-custom-tertiary p-2 pb-1 rounded-r-lg mb-3'>
            {children}
        </blockquote>
    ),
    // Horizontal rules
    hr: () => <hr className='border-custom my-4' />,
    // Table headers with dark background
    th: asTag('th', 'border border-custom bg-custom-tertiary px-2 py-1.5 sm:px-4 sm:py-2 text-left font-semibold break-words'),
    // Table data cells
    td: asTag('td', 'border border-custom px-2 py-1.5 sm:px-4 sm:py-2 break-words'),
    // Heading styles (h1-h4)
    h1: asTag('h1', 'text-2xl font-bold text-custom-primary mb-3'),
    h2: asTag('h2', 'text-xl font-semibold text-custom-primary mb-2'),
    h3: asTag('h3', 'text-lg font-semibold text-custom-primary mb-2'),
    h4: asTag('h4', 'text-base font-semibold text-custom-primary mb-2'),
    // Paragraphs
    p: asTag('p', 'mb-3 text-custom-primary'),
    // Lists (unordered and ordered)
    ul: asTag('ul', 'list-disc list-inside space-y-1 mb-3'),
    ol: asTag('ol', 'list-decimal list-inside space-y-1 mb-3'),
    // List items
    li: asTag('li', 'text-custom-primary'),
    // Images
    img: ImageWithFallback,
}

export default markdownComponents;