/**
 * BlockyKids - Python Executor Server
 * Express server to execute Python code
 * Deploy to: Replit, Railway, Render
 */

const express = require('express');
const { spawn } = require('child_process');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const os = require('os');

const app = express();
const PORT = process.env.PORT || 3000;

// CORS - Allow all origins for BlockyKids
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type']
}));

app.use(express.json());

// Health check / About
app.get('/', (req, res) => {
    res.json({
        name: 'BlockyKids Python Executor',
        version: '1.0.0',
        status: 'running',
        endpoints: {
            'GET /': 'This info',
            'GET /about': 'Server info',
            'POST /submissions': 'Execute Python code'
        }
    });
});

app.get('/about', (req, res) => {
    res.json({
        version: '1.0.0',
        name: 'BlockyKids Python Executor',
        description: 'Python code execution API for BlockyKids educational platform'
    });
});

// Execute Python code
app.post('/submissions', async (req, res) => {
    const { source_code, language_id } = req.body;
    const base64Encoded = req.query.base64_encoded === 'true';

    let code = source_code;

    // Decode base64 if needed
    if (base64Encoded) {
        try {
            code = Buffer.from(source_code, 'base64').toString('utf-8');
        } catch (e) {
            return res.status(400).json({ error: 'Invalid base64 encoding' });
        }
    }

    // Only support Python (language_id 71)
    if (language_id !== 71) {
        return res.status(400).json({ error: 'Only Python (language_id=71) is supported' });
    }

    try {
        const result = await executePython(code);

        res.json({
            stdout: base64Encoded ? Buffer.from(result.stdout).toString('base64') : result.stdout,
            stderr: base64Encoded ? Buffer.from(result.stderr).toString('base64') : result.stderr,
            status: {
                id: result.success ? 3 : 11,
                description: result.success ? 'Accepted' : 'Runtime Error'
            },
            time: '0.1',
            memory: 1000,
            exit_code: result.exitCode
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

function executePython(code) {
    return new Promise((resolve) => {
        const tempDir = os.tmpdir();
        const tempFile = path.join(tempDir, `blockykids_${Date.now()}.py`);

        try {
            fs.writeFileSync(tempFile, code, 'utf-8');

            // Try 'python' first (works on Replit/most systems), fallback to 'python3'
            const pythonCmd = 'python';
            const python = spawn(pythonCmd, [tempFile], {
                timeout: 10000,
            });

            let stdout = '';
            let stderr = '';

            python.stdout.on('data', (data) => {
                stdout += data.toString();
            });

            python.stderr.on('data', (data) => {
                stderr += data.toString();
            });

            python.on('close', (exitCode) => {
                cleanup(tempFile);
                resolve({ success: exitCode === 0, stdout, stderr, exitCode });
            });

            python.on('error', (err) => {
                cleanup(tempFile);
                resolve({ success: false, stdout: '', stderr: err.message, exitCode: 1 });
            });
        } catch (err) {
            cleanup(tempFile);
            resolve({ success: false, stdout: '', stderr: err.message, exitCode: 1 });
        }
    });
}

function cleanup(filePath) {
    try {
        fs.unlinkSync(filePath);
    } catch (e) {
        // Ignore cleanup errors
    }
}

app.listen(PORT, '0.0.0.0', () => {
    console.log(`🐍 BlockyKids Python Executor running on port ${PORT}`);
    console.log(`🌐 Server ready at http://0.0.0.0:${PORT}`);
});
