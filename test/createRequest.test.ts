import mock, { delay } from 'xhr-mock';
import { createRequest } from '../src';

describe(`.fetch`, () => {
  let consoleErrorSpy: jest.MockInstance<any, any> = jest.fn();

  beforeEach(() => {
    mock.setup();
  });

  afterEach(() => {
    mock.teardown();
    consoleErrorSpy.mockRestore();
  });

  it(`.fetch just like fetch`, async () => {
    expect.assertions(2);
    const result = {
      a: 'b',
    };

    mock.get('/api', (req, res) => {
      expect(req.header('Content-Type')).toBeNull();
      return res.status(200).body(JSON.stringify(result));
    });

    const response = await createRequest('/api')
      .fetch()
      .then(res => res.json());

    expect(response).toStrictEqual(result);
  });

  it(`can be invoked for json`, async () => {
    const result = {
      x: 'y',
    };
    mock.get('/api', delay({ status: 200, body: JSON.stringify(result) }, 500));

    const onSuccess = jest.fn();
    const onError = jest.fn();

    createRequest('/api', {
      headers: {
        Accept: 'application/json',
      },
    })
      .fetch()
      .then(res => res.json())
      .then(onSuccess, onError);

    await new Promise(fulfill => setTimeout(fulfill, 700));

    expect(onSuccess).toHaveBeenCalledTimes(1);
    expect(onSuccess).toHaveBeenCalledWith(result);
    expect(onError).not.toHaveBeenCalled();
  });

  it(`can be invoked for text`, async () => {
    const result = 'The request success';
    mock.get('/api', { status: 200, body: result });

    const onSuccess = jest.fn();
    const onError = jest.fn();

    await createRequest('/api', {
      headers: {
        Accept: 'application/json',
      },
    })
      .fetch()
      .then(res => res.text())
      .then(onSuccess, onError);

    expect(onSuccess).toHaveBeenCalledTimes(1);
    expect(onSuccess).toHaveBeenCalledWith(result);
    expect(onError).not.toHaveBeenCalled();
  });

  it(`can be invoked for blob`, async () => {
    expect.assertions(6);

    const result = 'Some text file';
    mock.post('/api', {
      status: 200,
      body: result,
      headers: {
        'Content-Length': result.length.toString(),
        'Content-Type': 'text/plain',
        'X-custom': 'y',
      },
    });

    const onSuccess = jest.fn();
    const onError = jest.fn();

    await createRequest('/api', {
      method: 'POST',
      headers: {
        Accept: 'application/plain',
      },
    })
      .fetch()
      .then(res => {
        expect(res.headers.keys()).toMatchInlineSnapshot(`
          Array [
            "content-length",
            "content-type",
            "x-custom",
          ]
        `);
        expect(res.headers.entries()).toMatchInlineSnapshot(`
          Array [
            Array [
              "content-length",
              "14",
            ],
            Array [
              "content-type",
              "text/plain",
            ],
            Array [
              "x-custom",
              "y",
            ],
          ]
        `);
        expect(res.headers.has('Content-Type')).toBe(true);
        expect(res.headers.get('Content-Type')).toBe('text/plain');

        return res.blob();
      })
      .then(onSuccess, onError);

    expect(onSuccess.mock.calls[0][0]).toBeInstanceOf(Blob);
    expect(onError).not.toHaveBeenCalled();
  });

  it(`reject Promise when error`, async () => {
    consoleErrorSpy = jest
      .spyOn(global.console, 'error')
      .mockImplementation(() => {});

    mock.get('/api', () => Promise.reject(new Error('Network Error')));

    await expect(
      createRequest('/api', {
        headers: {
          Accept: 'application/json',
        },
      }).fetch()
    ).rejects.toBeDefined();
  });
});

describe(`.xhr`, () => {
  beforeEach(() => {
    mock.setup();
  });

  afterEach(() => {
    mock.teardown();
  });

  it(`can be cancelled`, async () => {
    mock.get('/api', delay({ status: 200 }, 500));

    const onSuccess = jest.fn();
    const onError = jest.fn();

    const { xhr, fetch } = createRequest('/api');

    fetch().then(onSuccess, onError);

    xhr.abort();

    await new Promise(fulfill => setTimeout(fulfill, 700));

    expect(onSuccess).not.toHaveBeenCalled();
    expect(onError).not.toHaveBeenCalled();
  });
});
