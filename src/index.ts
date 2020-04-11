export type SimpleResponse = {
  ok: boolean;
  statusText: string;
  status: number;
  url: string;
  text: () => Promise<string>;
  json: () => Promise<any>;
  blob: () => Promise<Blob>;
  clone: () => SimpleResponse;
  headers: {
    keys: () => string[];
    entries: () => Array<[string, string]>;
    get: (name: string) => string;
    has: (name: string) => boolean;
  };
};

export const createRequest = (url: string, options: RequestInit = {}) => {
  const xhr = new XMLHttpRequest();
  const keys: string[] = [];
  const all: Array<[string, string]> = [];
  const headers: Record<string, string> = {};

  const response = (): SimpleResponse => ({
    ok: ((xhr.status / 100) | 0) === 2, // 200-299
    statusText: xhr.statusText,
    status: xhr.status,
    url: xhr.responseURL,
    text: () => Promise.resolve(xhr.responseText),
    json: () => Promise.resolve(JSON.parse(xhr.responseText)),
    blob: () => Promise.resolve(new Blob([xhr.response])),
    clone: response,
    headers: {
      keys: () => keys,
      entries: () => all,
      get: (name: string) => headers[name.toLowerCase()],
      has: (name: string) => name.toLowerCase() in headers,
    },
  });

  xhr.open(options.method || 'get', url, true);

  xhr.withCredentials = options.credentials === 'include';

  for (const i in options.headers) {
    xhr.setRequestHeader(i, (options.headers as Record<string, string>)[i]);
  }

  return {
    xhr,
    fetch: () =>
      new Promise<SimpleResponse>((fulfill, reject) => {
        xhr.onload = () => {
          xhr.getAllResponseHeaders().replace(/^(.*?):[^\S\n]*([\s\S]*?)$/gm, ((
            _: string,
            key: string,
            value: string
          ) => {
            keys.push((key = key.toLowerCase()));
            all.push([key, value]);
            headers[key] = headers[key] ? `${headers[key]},${value}` : value;
          }) as any);
          fulfill(response());
        };

        xhr.onerror = reject;
        xhr.send(options.body || null);
      }),
  };
};
