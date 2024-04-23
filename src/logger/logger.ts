/* istanbul ignore file */
import {
    ConsoleLogger,
    Injectable,
    LoggerService,
    Scope,
} from '@nestjs/common';

import { LoggerProvider } from './logger.provider';

@Injectable({ scope: Scope.TRANSIENT })
export class ProjectLogger extends ConsoleLogger implements LoggerService {
    constructor(private readonly loggerProvider: LoggerProvider) {
        super();
        console.log('ProjectLogger Initiated.');
    }
    verbose(correlationId: string, message: any) {
        this.loggerProvider.logger.log(
            'verbose',
            ProjectLogger.formatLogging(correlationId, message),
        );
    }

    debug(correlationId: string, message: any) {
        this.loggerProvider.logger.log(
            'debug',
            ProjectLogger.formatLogging(correlationId, message),
        );
    }

    log(correlationId: any, message: any) {
        this.loggerProvider.logger.log(
            'info',
            ProjectLogger.formatLogging(correlationId, message),
        );
    }

    warn(correlationId: string, message: any) {
        this.loggerProvider.logger.log(
            'warn',
            ProjectLogger.formatLogging(correlationId, message),
        );
    }

    error(correlationId: string, message: any) {
        this.loggerProvider.logger.log(
            'error',
            ProjectLogger.formatLogging(correlationId, message),
        );
    }

    private static formatLogging(correlationId: string, message: any): any {
        return `[CorrelationId] : ${correlationId} -- [Message] : ${message}`;
    }
}
