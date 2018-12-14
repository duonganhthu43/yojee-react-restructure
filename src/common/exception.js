export class Exception {
	constructor(error) {
		this.isHttpError = error instanceof Response;

		if (this.isHttpError) {
				this.exception = error;
				this.statusCode = error['status'];
				this.message = error['body'];
		}
		else {
				this.message = error.toString();
		}
	}
}
