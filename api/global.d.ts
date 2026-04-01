declare module 'multiparty' {
    import { IncomingMessage } from 'http';

    export class Form {
        constructor(options?: any);
        parse(req: IncomingMessage, callback: (err: any, fields: any, files: any) => void): void;
    }
}
