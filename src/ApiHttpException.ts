import { NextFunction, Response, Request } from 'express';
import { HttpExceptionParams } from './types.js';
import { Services } from './ApiServices.js';
 
export class HttpException {

    constructor({ name, message, stack }: HttpExceptionParams) {
        let error = new Error(message);
        error.name = name || "Error";
        error.stack = stack
        throw error
    }
    static ExceptionHandler(err: Error, req: Request, res: Response, next: NextFunction) {
        const errStatus = 500;
        Services.info("Error Handled ")
        const errMsg = err.message || 'Something went wrong';
        res.status(errStatus).send({
            success: false,
            status: errStatus,
            message: err.name,
            stack: process.env.NODE_ENV === 'development' ? err.stack : {}
        })
        next(errMsg)
    }


}