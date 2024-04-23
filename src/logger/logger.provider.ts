/* istanbul ignore file */
import { ConfigService } from '@nestjs/config';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const Winston = require('winston');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const CloudWatchTransport = require('winston-aws-cloudwatch');
const ENV_LOCAL = 'local';

import { Injectable, Scope } from '@nestjs/common';

@Injectable({ scope: Scope.TRANSIENT })
export class LoggerProvider {
    public logger = Winston.createLogger({
        transport: [new Winston.transports.Console()],
    });

    constructor(private config: ConfigService) {
        console.log('Log write initiated.');
        this.init();
    }

    //For local log check this might help in future
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    private setupFileLogger() {
        this.logger = Winston.createLogger({
            level: 'debug',
            transports: [
                new Winston.transports.File({
                    level: 'info',
                    filename:
                        this.config.get<string>('LOG_FILE_PATH') +
                        this.config.get<string>('LOG_FILE_NAME'),
                    handleExceptions: true,
                    json: true,
                    maxsize: 5243,
                    maxFiles: 5,
                    format: Winston.format.combine(
                        Winston.format.timestamp(),
                        Winston.format.align(),
                        Winston.format.printf((info) => {
                            const { timestamp, level, message, ...args } = info;

                            const ts = timestamp.slice(0, 19).replace('T', ' ');
                            return `${ts} [${level}]: ${message} ${
                                Object.keys(args).length
                                    ? JSON.stringify(args, null, 2)
                                    : ''
                            }`;
                        }),
                    ),
                }),
            ],
            exitOnError: false,
        });
    }

    private setupConsoleLogger() {
        this.logger = Winston.createLogger({
            level: 'debug',
            format: Winston.format.combine(
                Winston.format.colorize(),
                Winston.format.simple(),
                Winston.format.timestamp({ format: 'YYYY/MM/DD HH:mm:ss' }),
                Winston.format.printf(
                    (info) =>
                        `[${info.timestamp}] ${info.level}: ${info.message}`,
                ),
            ),
            transports: [
                new Winston.transports.Console({
                    timestamp: true,
                    colorize: true,
                }),
            ],
        });
    }

    private setupCloudWatchLogger() {
        this.logger = Winston.createLogger({
            level: 'info',
            format: Winston.format.combine(
                Winston.format.colorize(),
                Winston.format.simple(),
                Winston.format.timestamp(),
            ),
            transports: [
                new Winston.transports.Console({
                    timestamp: true,
                    colorize: true,
                }),
                new CloudWatchTransport({
                    logGroupName: this.config.get<string>('LOG_GROUP_NAME'), // REQUIRED
                    logStreamName: this.config.get<string>('LOG_STREAM_NAME'), // REQUIRED
                    createLogGroup: false,
                    createLogStream: false,
                    submissionInterval: Number(
                        this.config.get<number>('SUBMISSION_INTERVAL'),
                    ),
                    submissionRetryCount: Number(
                        this.config.get<number>('SUBMISSION_RETRY_COUNT'),
                    ),
                    batchSize: Number(this.config.get<number>('BATCH_SIZE')),
                    awsConfig: {
                        accessKeyId: this.config.get<string>(
                            'CLOUD_WATCH_ACCESS_KEY',
                        ),
                        secretAccessKey: this.config.get<string>(
                            'CLOUD_WATCH_SECRET_ACCESS_KEY',
                        ),
                        region: this.config.get<string>('CLOUD_WATCH_REGION'),
                    },
                    formatLog: (item) =>
                        `${item.level}: ${item.message} ${JSON.stringify(
                            item.meta,
                        )}`,
                }),
            ],
        });
    }

    init() {
        if (process.env.NODE_ENV === ENV_LOCAL) {
            const writeInFile = parseInt(this.config.get('WRITE_IN_FILE'));
            console.log('Write in file value:', writeInFile);
            if (writeInFile === 1) {
                this.setupFileLogger();
            } else {
                this.setupConsoleLogger();
            }
        } else {
            this.setupCloudWatchLogger();
        }
    }
}
