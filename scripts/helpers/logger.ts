import fs from 'fs';
import path from 'path';

export class Logger {
    private logFile: string;
    private logsRequest: any[] = [];

    constructor() {
        const logDir = path.join(process.cwd(), 'logs');
        if (!fs.existsSync(logDir)) fs.mkdirSync(logDir, { recursive: true });

        // Create timestamped log file
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        this.logFile = path.join(logDir, `import-${timestamp}.log`);

        console.log(`Logs will be written to: ${this.logFile}`);
    }

    log(message: string, type: 'INFO' | 'WARN' | 'ERROR' | 'SUCCESS' = 'INFO') {
        const timestamp = new Date().toISOString();
        const formatted = `[${timestamp}] [${type}] ${message}`;

        // Console output
        switch (type) {
            case 'ERROR': console.error(formatted); break;
            case 'WARN': console.warn(formatted); break;
            default: console.log(formatted);
        }

        // File output
        fs.appendFileSync(this.logFile, formatted + '\n');

        // Store for report if needed
        if (type === 'ERROR' || type === 'WARN') {
            this.logsRequest.push({ timestamp, type, message });
        }
    }

    startSpinner(text: string) {
        process.stdout.write(`\r- ${text}`);
        // Simple spinner implementation (optional improvement)
    }

    stopSpinner(text: string) {
        process.stdout.write(`\r✓ ${text}\n`);
    }

    getErrors() {
        return this.logsRequest;
    }

    getPath() {
        return this.logFile;
    }
}

export const logger = new Logger();
