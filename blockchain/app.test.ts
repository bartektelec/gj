import { BlockChain } from './app';

describe('BlockChain', () => {
  it('should allow to create a blockchain with a name', () => {
    const chain = new BlockChain({
      props: {
        identifier: 'CoolChain',
      },
    });

    expect(chain.props.identifier).toEqual('CoolChain');
  });

  const chain = new BlockChain({
    props: {
      identifier: 'testChain',
    },
  });

  it('should return null if no blocks were added and .getLastBlock() is called', () => {
    expect(chain.getLastBlock()).toEqual(null);
    expect(chain.checkChainValidity()).toEqual(true);
  });

  it('should return last block when .getLastBlock() is called', () => {
    chain.addNewBlock({ props: { id: 'first block' }, data: { amount: 1000 } });
    expect(chain.getLastBlock()).not.toEqual(null);
    expect(chain.getLastBlock().createdAt > 0).toEqual(true);
    expect(chain.getLastBlock().props.id).toEqual('first block');
    expect(chain.getLastBlock().data.amount).toEqual(1000);
    expect(chain.getLastBlock().prevHash).toEqual('GENESIS');
    expect(chain.getLastBlock().hash).toBeTruthy();
    expect(chain.checkChainValidity()).toEqual(true);
  });

  it('should return true when next block is added and validated', () => {
    chain.addNewBlock({
      props: { id: 'second block' },
      data: { title: 'Hello' },
    });

    expect(chain.blocks[0].hash).toEqual(chain.getLastBlock().prevHash);
    expect(chain.getLastBlock().props.id).toEqual('second block');
    expect(chain.getLastBlock().data.title).toEqual('Hello');
    expect(chain.checkChainValidity()).toEqual(true);
  });

  it('should handle adding multiple blocks and validate them', () => {
    const mocks = Array.from({ length: 40 }, (_, index) => {
      return {
        props: { id: `Title ${index}` },
        data: { amount: index * 100, message: `lorem ${index}` },
      };
    });

    mocks.forEach(mockBlock => {
      chain.addNewBlock(mockBlock);
    });

    const randomIdx = Math.floor(Math.random() * mocks.length - 1);

    expect(chain.blocks[randomIdx + 2].props.id).toEqual(
      mocks[randomIdx].props.id
    );

    expect(chain.blocks[randomIdx + 2].data.amount).toEqual(
      mocks[randomIdx].data.amount
    );
    expect(chain.blocks[randomIdx + 2].data.message).toEqual(
      mocks[randomIdx].data.message
    );
    expect(chain.checkChainValidity()).toEqual(true);
  });

  it('should NOT validate a chain after blocks have been modified', () => {
    chain.addInformationToLastBlock({ amount: 999999999999 });

    expect(chain.checkChainValidity()).toEqual(false);
  });
});
