// SECTION INFO
// wykorzystując dowolną bibliotekę do szyfrowania np wbudowane crypto
// zbuduj klasę, która będzie wykorzystywać schemat działania blockchain -
// doczytaj jak nie wiesz jak działa blockchain

// to Twoja klasa przetrzymująca bloki z informacjami -
// np np dokładnie 40 stringów z lorem ipsum

// SECTION TASK
import { lib, SHA256 } from 'crypto-js';

// blok przechowywuje dane mu podane, swoj hash i hash poprzedniego bloku
// blockchain nie pozwala na edytowanie wartosci blokow i ich usuwanie z blockchainu
class InformationBlock {
  data: any;
  readonly props: { [key: string]: any };
  readonly createdAt: number;
  readonly prevHash: string;
  readonly hash: string;

  constructor({ props, prevHash, data, timestamp }) {
    if (!prevHash) throw new Error('No previous block hash provided');
    if (!data) throw new Error('No data provided');
    if (!props) throw new Error('No props provided');
    this.props = props;
    this.createdAt = timestamp;
    this.prevHash = prevHash;
    this.data = data;
    this.hash = this.calculateHash();
  }

  calculateHash(): string {
    const strigifiedData = JSON.stringify({
      ...this.props,
      ...this.data,
    });
    return SHA256(strigifiedData + this.prevHash + this.createdAt).toString();
  }

  add(information: { [key: string]: any }) {
    if (!information) return;
    this.data = { ...this.data, ...information };
  }
}

// blockchain przechowuje bloki i je waliduje
// kazdy blok powinien miec prevHash ktory zgadza sie z hashem poprzedniego bloku
// pierwszy blok 'genesis' nie bedzie mial takiego hasha

class BlockChain {
  readonly props: { [key: string]: any };
  blocks: InformationBlock[];

  constructor({ props }) {
    if (!props) throw new Error('No props provided');
    this.props = props;
    this.blocks = [];
  }

  // metody
  addNewBlock({ props, data }): void {
    const prevHash = this.getLastBlock() ? this.getLastBlock().hash : 'GENESIS';
    const timestamp = Date.now();
    const newBlock = new InformationBlock({
      props,
      data,
      timestamp,
      prevHash,
    });

    this.blocks.push(newBlock);
  }
  getLastBlock(): InformationBlock | null {
    if (!this.blocks.length) return null;
    return this.blocks[this.blocks.length - 1];
  }
  addInformationToLastBlock(information: any) {
    if (!information) return;
    this.getLastBlock().add(information);
  }
  checkChainValidity() {
    if (!this.blocks.length) return true;
    for (let i = 1; i < this.blocks.length; i++) {
      const current = this.blocks[i];
      const previous = this.blocks[i - 1];
      if (current.prevHash !== previous.hash) return false;

      if (current.hash !== current.calculateHash()) return false;
    }
    return true;
  }
}

export { InformationBlock, BlockChain };
