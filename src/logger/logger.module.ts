/* istanbul ignore file */
import { Global, Module } from '@nestjs/common';
import { ProjectLogger } from './logger';
import { LoggerProvider } from './logger.provider';

@Global()
@Module({
    imports: [],
    exports: [ProjectLogger, LoggerProvider],
    providers: [ProjectLogger, LoggerProvider],
})
export class LoggerModule {}
