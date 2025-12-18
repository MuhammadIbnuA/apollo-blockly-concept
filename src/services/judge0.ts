/**
 * BlockyKids - Judge0 API Service
 * Service untuk code execution menggunakan self-hosted Judge0
 */

// Configuration for Python Executor API
// Uses Replit deployment by default, can override with NEXT_PUBLIC_JUDGE0_URL env var
const JUDGE0_API_URL = process.env.NEXT_PUBLIC_JUDGE0_URL || 'https://58c49b59-8519-4977-9f46-1c91e83377c7-00-hwboarrnk2v4.sisko.replit.dev';

// Language IDs in Judge0
export const LANGUAGE_IDS = {
    python3: 71,
    javascript: 63,
    c: 50,
    cpp: 54,
    java: 62,
} as const;

export type LanguageId = keyof typeof LANGUAGE_IDS;

export interface ExecutionResult {
    status: 'success' | 'error' | 'timeout' | 'pending' | 'compile_error';
    output?: string;
    error?: string;
    stderr?: string;
    time?: string;
    memory?: number;
    exitCode?: number;
}

export interface SubmissionResponse {
    token: string;
}

export interface SubmissionResult {
    stdout: string | null;
    stderr: string | null;
    compile_output: string | null;
    message: string | null;
    status: {
        id: number;
        description: string;
    };
    time: string;
    memory: number;
    exit_code: number | null;
}

/**
 * Submit code to Judge0 for execution
 */
export async function submitCode(
    code: string,
    language: LanguageId = 'python3',
    stdin?: string
): Promise<string> {
    const response = await fetch(`${JUDGE0_API_URL}/submissions?base64_encoded=true&wait=false`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            source_code: btoa(unescape(encodeURIComponent(code))),
            language_id: LANGUAGE_IDS[language],
            stdin: stdin ? btoa(unescape(encodeURIComponent(stdin))) : undefined,
        }),
    });

    if (!response.ok) {
        throw new Error(`Judge0 submission failed: ${response.statusText}`);
    }

    const data: SubmissionResponse = await response.json();
    return data.token;
}

/**
 * Get submission result by token
 */
export async function getSubmissionResult(token: string): Promise<SubmissionResult> {
    const response = await fetch(
        `${JUDGE0_API_URL}/submissions/${token}?base64_encoded=true&fields=stdout,stderr,compile_output,message,status,time,memory,exit_code`,
        {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        }
    );

    if (!response.ok) {
        throw new Error(`Judge0 result fetch failed: ${response.statusText}`);
    }

    return response.json();
}

/**
 * Decode base64 string safely
 */
function decodeBase64(str: string | null): string {
    if (!str) return '';
    try {
        return decodeURIComponent(escape(atob(str)));
    } catch {
        return str;
    }
}

/**
 * Poll for submission result with timeout
 */
async function pollResult(token: string, maxAttempts = 20, intervalMs = 500): Promise<SubmissionResult> {
    for (let i = 0; i < maxAttempts; i++) {
        const result = await getSubmissionResult(token);

        // Status ID 1 = In Queue, 2 = Processing
        if (result.status.id > 2) {
            return result;
        }

        await new Promise(resolve => setTimeout(resolve, intervalMs));
    }

    throw new Error('Execution timed out');
}

/**
 * Run code and get result (combined helper) - Uses synchronous wait mode
 */
export async function runCode(
    code: string,
    language: LanguageId = 'python3',
    stdin?: string
): Promise<ExecutionResult> {
    try {
        // Use synchronous wait=true mode for compatibility with local Python executor
        const response = await fetch(`${JUDGE0_API_URL}/submissions?base64_encoded=true&wait=true`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                source_code: btoa(unescape(encodeURIComponent(code))),
                language_id: LANGUAGE_IDS[language],
                stdin: stdin ? btoa(unescape(encodeURIComponent(stdin))) : undefined,
            }),
        });

        if (!response.ok) {
            throw new Error(`Judge0 submission failed: ${response.statusText}`);
        }

        const result: SubmissionResult = await response.json();

        // Status descriptions:
        // 3 = Accepted (success)
        // 4 = Wrong Answer
        // 5 = Time Limit Exceeded
        // 6 = Compilation Error
        // 7-12 = Runtime errors
        // 13 = Internal Error
        // 14 = Exec Format Error

        const stdout = decodeBase64(result.stdout);
        const stderr = decodeBase64(result.stderr);
        const compileOutput = decodeBase64(result.compile_output);

        if (result.status.id === 3) {
            // Accepted - successful execution
            return {
                status: 'success',
                output: stdout.trim(),
                stderr: stderr || undefined,
                time: result.time,
                memory: result.memory,
                exitCode: result.exit_code ?? undefined,
            };
        } else if (result.status.id === 6) {
            // Compilation Error
            return {
                status: 'compile_error',
                error: compileOutput || result.message || 'Compilation failed',
                time: result.time,
                memory: result.memory,
            };
        } else if (result.status.id === 5) {
            // Time Limit Exceeded
            return {
                status: 'timeout',
                error: 'Time limit exceeded',
                output: stdout || undefined,
                time: result.time,
                memory: result.memory,
            };
        } else {
            // Runtime error or other errors
            return {
                status: 'error',
                output: stdout || undefined,
                error: stderr || compileOutput || result.message || result.status.description,
                time: result.time,
                memory: result.memory,
                exitCode: result.exit_code ?? undefined,
            };
        }
    } catch (error) {
        return {
            status: 'error',
            error: error instanceof Error ? error.message : 'Unknown error occurred',
        };
    }
}

/**
 * Check if Judge0 is available
 */
export async function checkJudge0Health(): Promise<boolean> {
    try {
        const response = await fetch(`${JUDGE0_API_URL}/about`, {
            method: 'GET',
            signal: AbortSignal.timeout(5000),
        });
        return response.ok;
    } catch {
        return false;
    }
}

/**
 * Run Python code specifically
 */
export async function runPython(code: string, stdin?: string): Promise<ExecutionResult> {
    return runCode(code, 'python3', stdin);
}
