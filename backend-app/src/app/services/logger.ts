import { HttpResponse, HttpResponseBadRequest } from '@foal/core';
import {createLogger, format, transports } from 'winston';

export class LoggerService {
  private logger: any;

  constructor() {
    this.logger = createLogger({
        format: format.combine(
            format.json(),
            format.timestamp(),
            format.prettyPrint(),
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

  returnError (error: Error|HttpResponse) {
    this.logger.error(error as Error);
      if (error instanceof HttpResponse) {
        return error;
      } else {
        return new HttpResponseBadRequest(error);
      }
  }
}

