# xhfetch

<div align="center">

<a href="https://www.npmjs.org/package/xhfetch"><img src="https://img.shields.io/npm/v/xhfetch.svg?style=flat" alt="npm"></a>
<a href="https://unpkg.com/xhfetch/polyfill"><img src="https://img.badgesize.io/https://unpkg.com/xhfetch/dist/xhfetch.cjs.production.min.js?compression=gzip" alt="gzip size"></a>
<a href='https://coveralls.io/github/malcolm-kee/xhfetch?branch=master'><img src='https://coveralls.io/repos/github/malcolm-kee/xhfetch/badge.svg?branch=master' alt='Coverage Status' /></a>

</div>

> Tiny cancellable fetch

- _Tiny_: about 600 bytes of ES3 gzipped
- _Familiar_: uses common `fetch` and `XMLHttpRequest` api
- _Supported_: supports IE8+ (assuming `Promise` is polyfilled)

## Installation

```bash
npm install xhfetch
```

## Usage

### No Cancellation

```js
import { createRequest } from 'xhfetch';

// createRequest accepts same parameter as window.fetch
createRequest('https://api.github.com/users', {
    headers: {
        'Accept': 'application/json',
    },
})
  .fetch() // the api request will only be invoked when you call `fetch`
  .then(res => res.json());
  .then(users => console.log(users))
```

### With Cancellation

```js
import { createRequest } from 'xhfetch';

const { xhr, fetch } = createRequest('https://api.github.com/users', {
    headers: {
        'Accept': 'application/json',
    },
})

fetch()
  .then(res => res.json());
  .then(users => console.log(users))

setTimeout(() => {
    // cancels if the request takes more than a second
    xhr.abort();
}, 1000)
```

## API

The goal of Xhfetch is to provide a familiar interface while keeping small size, therefore we only focus on a subset of fetch API that is most commonly used.

### `createRequest(url: string, options: Object) => { fetch, xhr }`

Specify a request that you want to make and get a `fetch` function and a `XMLHttpRequest` object. The following properties in `options` will be accounted:

- `method`
- `headers`
- `credentials`: Accepts a "include" string, which will allow both CORS and same origin requests to work with cookies. Xhfetch won't send or receive cookies otherwise. The "same-origin" value is not supported (just don't set it if it's same-origin).
- `body`: The content to be transmitted in request's body. Common content types include FormData, JSON, Blob, ArrayBuffer or plain text.

### `.fetch()`

The `fetch` function returns by `createRequest` does not accepts any parameter. Invoking this call will kicks off the API request and returns a response object in the Promise chain. The response object contains a subset of [`Response`][response] class functionality:

- `response.ok`
- `response.status`
- `response.statusText`
- `response.clone()`
- `response.text()`, `response.json()`, `response.blob()`
- `response.headers`

### `.xhr`

The `xhr` object returns by `createRequest` is the underlying `XMLHttpRequest` object that is making the request, therefore you have access to all methods available for `XMLHttpRequest`, e.g. `.abort()` and `.addEventListener()`

## License

MIT

## Acknowledgements

- The code of `xhfetch` is based on [`unfetch`][unfetch].

[response]: https://fetch.spec.whatwg.org/#response-class
[unfetch]: https://github.com/developit/unfetch
