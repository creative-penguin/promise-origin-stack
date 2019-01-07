# Promise Origin Stack

Since the dawn of time, there has been 1 major issue with the use of promises: The stack
trace only goes back as far as the Promise's creation.

This leads to long nights spent debuging code.
 > I know my API call failed, but which of my many modules that use my API wrapper made
 > the call that failed?

Promise libraries like Q and Bluebird have long had settings to provide "long stack
support", but now that native promises are supported by so many browsers and node, why
should we need to use a heavy library just to add this one needed feature?

Now we don't have to. Simply install and register `promise-origin-stack` and you'll get
stack traces that point to the creation of the promise. No other dependencies. Less than
50 lines of code. Easy to use. What more could you ask for?

## Installation

Install it:

```bash
npm install --save promise-origin-stack
```

Then register it:

```javascript
require('promise-origin-stack').register();
```

## A Caveat

The originating stack will point to the creation of the promise that threw the error.
Since each `.then` returns a new promise, the origin point will usually point to the
`.then` before the erroring function, not necessarily `Promise.resolve` or `new Promise`.

Example:

```javascript
Promise.resolve('something')
   .then(foo)
   .then(bar) // This is where your originating stack trace will point
   .then(throwsAnError) // This line throws the error
   .then(baz);
```
