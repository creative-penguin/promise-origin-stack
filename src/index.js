'use strict';

module.exports = {
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
         then(onResolved, rejected) {
            var promise = super.then(onResolved, rejected);

            if (!rejected) {
               promise = promise.then(onResolved, (err) => {
                  // Don't add the additional trace info if it already exists. Otherwise,
                  // we'll add another trace for every `then` that follows the throw of
                  // the error, because a new promise is created each time we add a
                  // `then`.
                  if (err.stack.indexOf(HEADER_MESSAGE) < 0) {
                     err.stack += `\n${this.__originalErrorStack}`;
                  }
                  throw err;
               });
            }

            return promise;
         }
      };
   },
};
