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
  const spyFn = jest.spyOn(queue, 'onResultFunc');

  it('should allow naming the queue', () => {
    expect(queue.queueName).toEqual('test');
  });

  it('should throw when queue is empty and tried to be run', async () => {
    expect(queue.getQueue().length).toEqual(0);
    await expect(async () => {
      await queue.runNext();
    }).rejects.toThrowError('No items in the queue');
  });
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
    expect(queue.getQueue().length).toEqual(mocksOfPromises.length);
    mocksOfPromises.forEach((item, idx) => {
      expect(item).toEqual(queue.getQueue()[idx].function);
    });
  });

  it('should allow to add rejecting promises', () => {
    // create an array of promise wrappers
    const mocksOfPromises = Array.from(
      { length: 10 },
      (_, idx) =>
        function () {
          return failurePromiseFactory(idx);
        }
    );
    // add each promise wrapper to queue
    mocksOfPromises.forEach(promise => {
      queue.add(promise);
    });
    // check if promises are added properly
    expect(queue.getQueue().length).toEqual(20);
    mocksOfPromises.forEach((item, idx) => {
      expect(item).toEqual(queue.getQueue()[idx + 10].function);
    });
  });

  it('should run multiple promieses in order', async done => {
    expect(spyFn).toHaveBeenCalledTimes(0);
    // create a copy of promises array for testing purpose
    // only because every runNext() deletes an entry from promises
    // this would end up looping only half way through
    const mockArray = [...queue.getQueue()];
    // must use for .. of for async to work properly
    for (let i of mockArray) {
      try {
        // get expected promise and run it
        const currentResults = await queue.getResults();
        const currentQueue = await queue.getQueue();
        const nextInQueue = await queue.getNextInQueue();
        expect(spyFn).toHaveBeenCalledTimes(currentResults.length);
        await queue.runNext();
        // get results after promise call
        const resultsAfterCall = await queue.getResults().length;
        const lastResult = await queue.getLastResult();
        // get last result and compare its id to expected promise
        // check if onResultFunc has been invoked with proper args
        expect(spyFn).toHaveBeenCalledTimes(resultsAfterCall);
        expect(spyFn).toHaveBeenLastCalledWith(lastResult);
        expect(lastResult.promiseId).toEqual(nextInQueue.id);
        expect(lastResult.promiseResult).toEqual(nextInQueue.id);
        expect(lastResult.promiseDoneAt > 0).toEqual(true);
        done();
      } catch (e) {
        done(e);
      }
    }
  });
});
