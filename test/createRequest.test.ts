import mock, { delay } from 'xhr-mock';
import { createRequest } from '../src';

describe(`.fetch`, () => {
  beforeEach(() => {
    mock.setup();
  });

  afterEach(() => {
    mock.teardown();
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
});

describe(`.xhr`, () => {
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
