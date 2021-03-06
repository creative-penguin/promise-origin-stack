# Promise Origin Stack

Since the dawn of time, there has been one major issue with the use of promises: The stack
trace only goes back as far as the Promise's creation  (or the last `then` in most cases).

This leads to long nights spent debuging code.
 > I know my API call failed, but which of my many modules that use my API wrapper made
 > initial call that failed?

Promise libraries like Q and Bluebird have long had settings to provide "long stack
support", but now that native promises are supported by so many browsers and Node, why
should we need to use a heavy library just to add this one needed feature?

Now we don't have to. Simply install and register `promise-origin-stack` and you'll get
stack traces that point to the creation of the promise. No other dependencies.
Lightweight. Easy to use. What more could you ask for?

## Installation

Install it:

```bash
npm install --save promise-origin-stack
```

## Usage

Then register it:

```javascript
require('promise-origin-stack').register();
```

That's it. Any error thrown by a promise will automatically have an additional stack trace
from the creation of the promise appended to it's own stack trace.

You can continue to use your promises with no modification to the code.


## Caveats

### When is the Promise created?

The originating stack will point to the creation of the promise that threw the error.
Since each `.then` returns a new promise, the origin point will usually point to the
`.then` before the erroring function, not necessarily `Promise.resolve` or `new Promise`.

### Performance

In order to get the original stack trace, `promise-origin-stack` has to create an error
and save the stack whenever a promise is created. Unfortunately, creating an error is not
a cheap operation. It takes a couple of milliseconds. Granted, that doesn't sound like a
lot, but if you are creating many promises, chained together, this can take some time.
Usually, this is only noticeable in limited use cases.

To mitigate this problem, there is a flag to allow us to temporarily (or permanently)
disable origin stacks after registering this package. Simply add the following code before
you create your Promise.

```javascript
Promise.disableOriginStacks = true;
```

## Example

```javascript
require('promise-origin-stack').register();

function bad() {
   throw new Error('This error will have extra information');
}

function appendSomething(s) {
   return s + ' something';
}

(function() {
   Promise.resolve('new promise')
      .then(appendSomething)
      .then(appendSomething)
      .then(appendSomething) // This is where the stack trace will point [1]
      .then(bad) // This is where the error is thrown [2]
      .then(appendSomething)
      .then(appendSomething);
})();
```

Will provide stack trace like this:
```
(node:91797) UnhandledPromiseRejectionWarning: Error: This error will have extra information
    at bad ({Path to File}/example.js:4:10)
    at <anonymous>
    at process._tickCallback (internal/process/next_tick.js:188:7)
    at Function.Module.runMain (module.js:695:11)
    at startup (bootstrap_node.js:188:16)
    at bootstrap_node.js:609:3
Error: Promise Created At:
    at Promise.then (<anonymous>)
    at {Path to File}/example.js:15:8 <<<< Points to the line marked [1] above
    at Object.<anonymous> ({Path to File}/example.js:19:3)
    at Module._compile (module.js:652:30)
    at Object.Module._extensions..js (module.js:663:10)
    at Module.load (module.js:565:32)
    at tryModuleLoad (module.js:505:12)
```
