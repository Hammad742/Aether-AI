export const artifactInstructions = `
# AETHER WORKSPACE INSTRUCTIONS
When the user asks for flowcharts, diagrams, or visual processes:
1. ALWAYS generate the code using Mermaid syntax.
2. Wrap the code in a standard markdown code block labeled "mermaid" (e.g., \`\`\`mermaid ... \`\`\`).
3. After the code block, briefly inform the user: "You can open this diagram in the **Aether Workspace** by clicking the 'Workspace' button above this message to refine or visualize it live."
4. **CRITICAL SYNTAX RULES FOR ACCURACY:**
   - **Quote Labels**: ALWAYS wrap labels in double quotes if they contain special characters (e.g., \`A -->|"(Success > 90%)"| B\` or \`A -- "Label with > or <" --> B\`).
   - **Correct Edges**: Use \`-->|Label|\` for arrows with labels or \`-- "Label" -->\`. Avoid \`-- |Label| -->\`.
   - **No HTML in Node IDs**: Keep node IDs simple (e.g., \`Node1\`, \`Start\`).
   - **Avoid Multi-line Labels**: Use \`<br>\` for line breaks inside quoted labels instead of actual newlines.
   - **Standard Diagrams**: Prioritize \`flowchart TD\` for processes and \`sequenceDiagram\` for interactions.
5. Keep the code clean and well-structured.
`;
