/**
 * BlockyKids - Local Python Executor Server
 * Simple Express server to execute Python code locally
 * For development only - NOT FOR PRODUCTION
 */

const express = require('express');
const { spawn, execSync } = require('child_process');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const os = require('os');

const app = express();
const PORT = 2359;

app.use(cors());
app.use(express.json());

// Health check
app.get('/about', (req, res) => {
    res.json({
        version: '1.0.0',
        name: 'BlockyKids Local Python Executor',
        description: 'Development-only Python execution server'
    });
});

// Execute Python code
app.post('/submissions', async (req, res) => {
    const { source_code, language_id } = req.body;
    const base64Encoded = req.query.base64_encoded === 'true';
    const waitForResult = req.query.wait === 'true';

    let code = source_code;

    // Decode base64 if needed
    if (base64Encoded) {
        try {
            code = Buffer.from(source_code, 'base64').toString('utf-8');
        } catch (e) {
            return res.status(400).json({ error: 'Invalid base64 encoding' });
        }
    }

    // Only support Python
    if (language_id !== 71) {
        return res.status(400).json({ error: 'Only Python (language_id=71) is supported' });
    }

    try {
        const result = await executePython(code);

        if (waitForResult) {
            res.json({
                stdout: base64Encoded ? Buffer.from(result.stdout).toString('base64') : result.stdout,
                stderr: base64Encoded ? Buffer.from(result.stderr).toString('base64') : result.stderr,
                status: { id: result.success ? 3 : 11, description: result.success ? 'Accepted' : 'Runtime Error' },
                time: '0.1',
                memory: 1000,
                exit_code: result.exitCode
            });
        } else {
            // Return token for async mode (we just execute immediately)
            const token = Date.now().toString(36);
            res.json({ token });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

function executePython(code) {
    return new Promise((resolve) => {
        // Write code to temp file to avoid shell escaping issues
        const tempDir = os.tmpdir();
        const tempFile = path.join(tempDir, `blockykids_${Date.now()}.py`);

        try {
            // Write code to temp file
            fs.writeFileSync(tempFile, code, 'utf-8');

            // Execute Python with the temp file
            const python = spawn('python', [tempFile], {
                timeout: 10000, // 10 second timeout
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
                // Clean up temp file
                try {
                    fs.unlinkSync(tempFile);
                } catch (e) {
                    // Ignore cleanup errors
                }

                resolve({
                    success: exitCode === 0,
                    stdout,
                    stderr,
                    exitCode
                });
            });

            python.on('error', (err) => {
                // Clean up temp file
                try {
                    fs.unlinkSync(tempFile);
                } catch (e) {
                    // Ignore cleanup errors
                }

                resolve({
                    success: false,
                    stdout: '',
                    stderr: err.message,
                    exitCode: 1
                });
            });
        } catch (err) {
            // Clean up temp file on any error
            try {
                fs.unlinkSync(tempFile);
            } catch (e) {
                // Ignore cleanup errors
            }

            resolve({
                success: false,
                stdout: '',
                stderr: err.message,
                exitCode: 1
            });
        }
    });
}

app.listen(PORT, () => {
    console.log(`🐍 BlockyKids Python Executor running on http://localhost:${PORT}`);
    console.log('⚠️  Development server only - NOT FOR PRODUCTION');
});
