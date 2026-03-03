
/**
 * Exports a chat session to a JSON file
 * @param {Object} session - The chat session object { id, title, messages, date }
 */
export const exportToJSON = (session) => {
    if (!session) return;

    const data = JSON.stringify(session, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `chat-${session.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}-${session.date}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
};

/**
 * Exports a chat session to a formatted Markdown file
 * @param {Object} session - The chat session object { id, title, messages, date }
 */
export const exportToMarkdown = (session) => {
    if (!session || !session.messages) return;

    let content = `# ${session.title || 'Chat Export'}\n\n`;
    content += `*Date: ${new Date(session.date).toLocaleString()}*\n\n---\n\n`;

    session.messages.forEach(msg => {
        const role = msg.role === 'user' ? 'User' : 'Assistant';
        content += `### ${role}\n\n${msg.content}\n\n`;
    });

    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `chat-${session.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
};
