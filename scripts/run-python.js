#!/usr/bin/env node
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

function getPythonPath() {
  const rootDir = path.resolve(__dirname, '..');
  const candidates = [
    path.join(rootDir, '.venv', 'bin', 'python'),
    path.join(rootDir, '.venv', 'bin', 'python3'),
    path.join(rootDir, '.venv', 'Scripts', 'python.exe'),
    path.join(rootDir, 'backend', '.venv', 'bin', 'python'),
    path.join(rootDir, 'backend', '.venv', 'Scripts', 'python.exe'),
  ];

  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) {
      return candidate;
    }
  }

  return process.platform === 'win32' ? 'python' : 'python3';
}

const pythonBin = getPythonPath();
const args = process.argv.slice(2);

const child = spawn(pythonBin, args, {
  stdio: 'inherit',
  shell: process.platform === 'win32',
});

// Forward signals to child process
process.on('SIGINT', () => {
  if (child.pid) child.kill('SIGINT');
});
process.on('SIGTERM', () => {
  if (child.pid) child.kill('SIGTERM');
});

child.on('exit', (code, signal) => {
  if (code !== null) {
    process.exit(code);
  } else if (signal) {
    process.kill(process.pid, signal);
  }
});
