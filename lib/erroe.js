/* eslint-disable constructor-super */
/* eslint-disable no-empty-function */
/* eslint-disable no-unused-vars */
class myError extends Error() {
    constructor(message, status) {
        super(message);
        this.name = this.constructor.name;
        this.status = status || 500;
        this.captureErrorTrace(this, this.constructor);
    }
}
