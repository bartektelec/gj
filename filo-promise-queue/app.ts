// Stwórz kolejkę typu FILO - First In Last Out dla zbioru promisów
// klasa powinna być podobnej struktury co do przykładu, jednak poniższa klasa nie zawiera wszystkich wymaganych metod

interface FILOQueueForPromises {
  queueName: string;
}

interface PromiseResult {
  promiseDoneAt: number;
  promiseResult: any;
  promiseId: number;
}

interface QueueItem {
  function: PromiseFunctionWrapper;
  id: number;
}

type QueueCallback = (result: PromiseResult) => void;

type PromiseFunctionWrapper = () => Promise<any>;

class FILOQueueForPromises {
  private promises: QueueItem[] = []; // lista dodanych do kolejki, nie wywołanych promisów
  private results: PromiseResult[] = []; // lista wyników (error to też wynik) z wywołanych promisów, łącznie z timestampem wykonania
  onResultFunc: QueueCallback = ({
    promiseDoneAt,
    promiseId,
    promiseResult,
  }: PromiseResult) => {
    console.log(`${promiseDoneAt}:[${promiseId}]-${promiseResult}`);
  };
  constructor(queueName: string) {
    this.queueName = queueName;
  }

  public getQueue() {
    return this.promises;
  }

  public getNextInQueue() {
    const [nextPromise] = this.promises;
    return nextPromise;
  }

  public getResults() {
    return this.results;
  }

  public getLastResult() {
    const [lastResult] = this.results;
    return lastResult;
  }

  public add(functionWrapperForPromise: PromiseFunctionWrapper) {
    const nextIdNumber: number = this.promises.length + this.results.length;
    this.promises.push({
      id: nextIdNumber,
      function: functionWrapperForPromise,
    });
  }

  public async runNext() {
    if (!this.promises.length) throw new Error('No items in the queue');

    const firstQueueItem = this.getNextInQueue();

    const result: Partial<PromiseResult> = {
      promiseResult: null,
    };

    try {
      const promiseResult = await firstQueueItem.function();
      result.promiseResult = promiseResult;
    } catch (error) {
      result.promiseResult = error;
    } finally {
      result.promiseId = firstQueueItem.id;
      result.promiseDoneAt = Date.now();
      this.promises.shift();
      this.results.unshift(result as PromiseResult);
      this.onResultFunc(result as PromiseResult);
    }
  }

  public onResult(callback: QueueCallback) {
    this.onResultFunc = callback;
  }
}

export default FILOQueueForPromises;
