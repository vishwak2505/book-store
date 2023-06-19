import { HttpResponse, HttpResponseBadRequest, dependency } from "@foal/core";
import { LoggerService } from "./logger";

export class ErrorHandler {

    @dependency
    logger: LoggerService

    returnError (error: Error|HttpResponse|String) {

        this.logger.error(`${error}`);
            if (error instanceof HttpResponse) {
            return error;
            } else {
            return new HttpResponseBadRequest(error);
            }
        }
}
