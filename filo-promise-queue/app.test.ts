import FILOPromiseQueue from './app';

const successPromiseFactory = result =>
  new Promise(resolve => {
    resolve(result);
  });
const failurePromiseFactory = result =>
  new Promise((_, reject) => {
    reject(result);
  });

describe('test FILO Promise queue', () => {
  const queue = new FILOPromiseQueue('test');
  it('should allow naming the queue', () => {
    expect(queue.queueName).toEqual('test');
  });
  const spyFn = jest.spyOn(queue, 'onResultFunc');
  it('should allow to add new promises to queue', () => {
    // create an array of promise wrappers
    const mocksOfPromises = Array.from(
      { length: 10 },
      (_, idx) =>
        function () {
          return successPromiseFactory(idx);
        }
    );
    // add each promise wrapper to queue
    mocksOfPromises.forEach(promise => {
      queue.add(promise);
    });
    // check if promises are added properly
    expect(queue.promises.length).toEqual(mocksOfPromises.length);
    mocksOfPromises.forEach((item, idx) => {
      expect(item).toEqual(queue.promises[idx].function);
    });
  });

  it('should allow to run promises and call onResultFunc ', async () => {
    // get expected promise and run it
    expect(spyFn).toHaveBeenCalledTimes(0);
    const [promiseToBeRun] = queue.promises;
    await queue.runNext();
    // get last result and compare its id to expected promise
    // check if onResultFunc has been invoked with proper args
    const [lastResult] = queue.results;
    expect(spyFn).toHaveBeenLastCalledWith(lastResult);
    expect(spyFn).toHaveBeenCalledTimes(queue.results.length);
    expect(promiseToBeRun.id).toEqual(lastResult.promiseId);
  });

  it('should allow to run multiple promieses in order', done => {
    queue.promises.forEach(async () => {
      try {
        // get expected promise and run it
        expect(spyFn).toHaveBeenCalledTimes(queue.results.length);
        const [promiseToBeRun] = queue.promises;
        await queue.runNext();
        // get last result and compare its id to expected promise
        // check if onResultFunc has been invoked with proper args
        const [lastResult] = queue.results;
        expect(spyFn).toHaveBeenCalledTimes(queue.results.length);
        expect(spyFn).toHaveBeenLastCalledWith(lastResult);
        expect(promiseToBeRun.id).toEqual(lastResult.promiseId);
        expect(lastResult.promiseId).toEqual(promiseToBeRun.id);
        expect(lastResult.promiseResult).toEqual(promiseToBeRun.id);
        done();
      } catch (e) {
        done(e);
      }
    });
  });
});
