// Stwórz kolejkę typu FILO - First In Last Out dla zbioru promisów
// klasa powinna być podobnej struktury co do przykładu, jednak poniższa klasa nie zawiera wszystkich wymaganych metod

interface FILOQueueForPromises {
  queueName: string;
}

interface PromiseResult {
  timestamp: number;
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
  promises: QueueItem[] = []; // lista dodanych do kolejki, nie wywołanych promisów
  results: PromiseResult[] = []; // lista wyników (error to też wynik) z wywołanych promisów, łącznie z timestampem wykonania
  onResultFunc: QueueCallback = (result: PromiseResult) => {
    // console.log(result.promiseResult);
  };
  constructor(queueName: string) {
    // queueName - nazwa kolejki w celach identyfikacyjnym
    this.queueName = queueName;
  }

  add(functionWrapperForPromise: PromiseFunctionWrapper) {
    // metoda, która dodaje do kolejki this.promises kolejną niewykonaną promisę
    const nextIdNumber: number = this.promises.length + this.results.length;
    this.promises.push({
      id: nextIdNumber,
      function: functionWrapperForPromise,
    });
  }

  async runNext() {
    // metoda, która odpowiada za uruchamianie ostatnio dodanej do kolejki promisy
    if (!this.promises.length) throw new Error('No items in the queue');
    const [firstQueueItem] = this.promises;

    const result: Partial<PromiseResult> = {
      promiseId: firstQueueItem.id,
    };
    try {
      const promiseResult = await firstQueueItem.function();
      result.promiseResult = promiseResult;
    } catch (error) {
      result.promiseResult = error;
    } finally {
      result.timestamp = Date.now();
    }

    this.promises.shift();
    this.results.unshift(result as PromiseResult);
    this.onResultFunc(result as PromiseResult);
  }

  onResult(callback: QueueCallback) {
    this.onResultFunc = callback;
    // metoda, wywołująca się po ukończeniu każdej promisy z kolejki z argumentem callback
    // który działa tak -> callback(promiseId, promiseResult, promiseDoneAt)
  }
}

export default FILOQueueForPromises;
