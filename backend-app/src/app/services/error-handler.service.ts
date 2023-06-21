import { HttpResponse, HttpResponseBadRequest, HttpResponseForbidden, HttpResponseNotFound, HttpResponseNotImplemented, dependency } from "@foal/core";
import { LoggerService } from "./logger";

export enum errors {
    notImplemented = 'notImplemented',
    notFound = 'notFound',
    badRequest = 'badRequest',
    forbidden = 'forbidden'
}

export class ErrorHandler {

    @dependency
    logger: LoggerService

    handleError(type: errors, error: String|null) {

        if (type == errors.notFound) {
            this.logger.warn(`${error}`);
            return new HttpResponseNotFound(error);
        } else if (type == errors.badRequest) {
            this.logger.warn(`${error}`);
            return new HttpResponseBadRequest(error);
        } else if (type == errors.notImplemented) {
            this.logger.warn(`${error}`);
            return new HttpResponseNotImplemented(error);
        } else if (type == errors.forbidden) {
            this.logger.warn(`${error}`);
            return new HttpResponseForbidden(error);
        }
    }    
}
