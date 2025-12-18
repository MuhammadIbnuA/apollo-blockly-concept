/**
 * BlockyKids - Code Editor Component
 * Monaco Editor wrapper untuk Python code editing
 */

'use client';

import { useRef, useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

// Dynamically import Monaco Editor (client-side only)
const Editor = dynamic(() => import('@monaco-editor/react').then(mod => mod.default), {
    ssr: false,
    loading: () => (
        <div className="flex items-center justify-center h-full bg-[#1e1e1e] text-gray-400">
            <div className="flex flex-col items-center gap-2">
                <div className="animate-spin w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full" />
                <span>Loading editor...</span>
            </div>
        </div>
    ),
});

export interface CodeEditorProps {
    value: string;
    onChange: (value: string) => void;
    language?: string;
    readOnly?: boolean;
    height?: string | number;
    placeholder?: string;
}

export default function CodeEditor({
    value,
    onChange,
    language = 'python',
    readOnly = false,
    height = '100%',
    placeholder = '# Write your Python code here\n',
}: CodeEditorProps) {
    const [isReady, setIsReady] = useState(false);
    const editorRef = useRef<any>(null);

    const handleEditorDidMount = (editor: any, monaco: any) => {
        editorRef.current = editor;
        setIsReady(true);

        // Configure Python specific settings
        monaco.languages.setLanguageConfiguration('python', {
            indentationRules: {
                increaseIndentPattern: /^.*:\s*$/,
                decreaseIndentPattern: /^\s*(else|elif|except|finally)\b.*:\s*$/,
            },
        });

        // Custom theme matching BlockyKids dark theme
        monaco.editor.defineTheme('blockykids-dark', {
            base: 'vs-dark',
            inherit: true,
            rules: [
                { token: 'comment', foreground: '6A9955', fontStyle: 'italic' },
                { token: 'keyword', foreground: 'C586C0' },
                { token: 'string', foreground: 'CE9178' },
                { token: 'number', foreground: 'B5CEA8' },
                { token: 'function', foreground: 'DCDCAA' },
                { token: 'variable', foreground: '9CDCFE' },
                { token: 'type', foreground: '4EC9B0' },
            ],
            colors: {
                'editor.background': '#1a1a35',
                'editor.foreground': '#D4D4D4',
                'editor.lineHighlightBackground': '#2a2a50',
                'editor.selectionBackground': '#6c5ce750',
                'editorCursor.foreground': '#6c5ce7',
                'editorLineNumber.foreground': '#858585',
                'editorLineNumber.activeForeground': '#C6C6C6',
                'editor.inactiveSelectionBackground': '#6c5ce730',
            },
        });

        monaco.editor.setTheme('blockykids-dark');

        // Focus the editor
        editor.focus();
    };

    const handleEditorChange = (newValue: string | undefined) => {
        onChange(newValue || '');
    };

    // Set placeholder if value is empty
    useEffect(() => {
        if (isReady && !value && placeholder && editorRef.current) {
            // Don't set placeholder as value, just show it visually
        }
    }, [isReady, value, placeholder]);

    return (
        <div className="h-full w-full overflow-hidden rounded-lg">
            <Editor
                height={height}
                language={language}
                value={value}
                onChange={handleEditorChange}
                onMount={handleEditorDidMount}
                options={{
                    readOnly,
                    minimap: { enabled: false },
                    fontSize: 14,
                    lineNumbers: 'on',
                    roundedSelection: true,
                    scrollBeyondLastLine: false,
                    automaticLayout: true,
                    tabSize: 4,
                    insertSpaces: true,
                    wordWrap: 'on',
                    folding: true,
                    lineDecorationsWidth: 10,
                    lineNumbersMinChars: 3,
                    renderLineHighlight: 'line',
                    cursorBlinking: 'smooth',
                    cursorSmoothCaretAnimation: 'on',
                    smoothScrolling: true,
                    padding: { top: 10, bottom: 10 },
                    suggestOnTriggerCharacters: true,
                    quickSuggestions: true,
                    formatOnPaste: true,
                    formatOnType: true,
                }}
            />
        </div>
    );
}
