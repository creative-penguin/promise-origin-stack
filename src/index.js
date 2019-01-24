'use strict';


/**
 * Filters out any stack trace information from this file.
 *
 * @param {string} stack - stack trace to filter
 * @returns {string} - filtered stack trace
 */
function filterStack(stack) {
   let lines = stack.split('\n');

   return lines.reduce((memo, line) => {
      if (line.indexOf(__filename) < 0) {
         memo += line + '\n';
      }

      return memo;
   }, '');
}


module.exports = {


   /**
    * Register the shim.
    *
    * This overrides the native constructor to store a stack trace and overrides the
    * native `then` to add a `catch` which appends the origin stack the native error.
    *
    * @param {string} [headerMSG=Promise Created At:] - Label for the the origin stack
    * @returns {void}
    */
   register(headerMSG) {
      const HEADER_MESSAGE = headerMSG || 'Promise Created At:';

      Promise = class extends Promise {

         /**
          * Override to add the stack from the point the promise was created
          */
         constructor(...args) {
            super(...args);

            // This stack trace will point to the creation of the Promise that throws the
            // error. Because each `.then` always creates a new Promise, this will point
            // to the last `.then` statement before the `.then` that threw the actual
            // error.
            this.__originalErrorStack = (new Error(HEADER_MESSAGE)).stack;
         }

         /**
          * Override to throw new error with additional stack trace information.
          */
         then(onResolved, onRejected) {
            if (!onRejected) {
               return super.then(onResolved).catch((err) => {
                  // Don't add the additional trace info if it already exists. Otherwise,
                  // we'll add another trace for every `then` that follows the throw of
                  // the error, because a new promise is created each time we add a
                  // `then`.
                  if (err.stack.indexOf(HEADER_MESSAGE) < 0) {
                     let stack = filterStack(this.__originalErrorStack);

                     err.stack += `\n${stack}`;
                  }
                  throw err;
               });
            }

            return super.then(onResolved, onRejected);
         }
      };
   },
};
