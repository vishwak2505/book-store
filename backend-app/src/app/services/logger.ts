import ecsFormat = require('@elastic/ecs-winston-format');
import { HttpResponse, HttpResponseBadRequest } from '@foal/core';
import {createLogger, format, transports } from 'winston';

export class LoggerService {
  
  private logger: any;

  constructor() {
    this.logger = createLogger({
        format: format.combine(
            ecsFormat(),
            format.colorize(),
        ),
        transports: [
            new transports.Console(),
            new transports.File({
                level: 'info',  
                filename: 'src/logs/logsInfo.log'
            }),
            new transports.File({
                level: 'warn',  
                filename: 'src/logs/logsWarning.log'
            }),
            new transports.File({
                level: 'error',  
                filename: 'src/logs/logsError.log'
            }),
        ]
    });
  }

  info(msg: string|Error) {
    this.logger.info(msg);
  }

  warn(msg: string|Error) {
    this.logger.warn(msg);
  }

  error(msg: string|Error) {
    this.logger.error(msg);
  }
}

