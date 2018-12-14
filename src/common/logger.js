export class Logger {
  log (error, ...optionalParams) {
    if (global.environment.isProduction){
      this._capture(error);
    }
    else {
      console.log(error, optionalParams);
    }
  }

  error (error, ...optionalParams) {
    if (global.environment.isProduction){
      this._capture(error);
    }
    else {
      console.error(error, optionalParams);
    }
  }

  _capture (error) {
    /*
      Need to remote logging for production environment
    */
  }
}

export const logger = new Logger();
