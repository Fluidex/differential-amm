//require("util").inspect.defaultOptions.depth = null;
function solveQuadraticEquation(a, b, c) {
  const discriminant = b * b - 4 * a * c;
  const root1 = (-b + Math.sqrt(discriminant)) / (2 * a);
  const root2 = (-b - Math.sqrt(discriminant)) / (2 * a);
  return [root1, root2];
}
export default class DAMM {
  //price: number;
  //depth: number;
  realBase
  realQuote
  virtualBase
  virtualQuote
  k
  // spread: number; // default 0.003

  get totalBase() {
    return this.realBase + this.virtualBase;
  }
  get totalQuote() {
    return this.realQuote + this.virtualQuote;
  }
  get price() {
    return this.totalQuote / this.totalBase;
  }
  get depth() {
    return this.totalBase ** 2 / (2 * this.totalQuote);
  }
  get lowPrice() {
    const low = this.virtualQuote ** 2 / this.k;
    return low;
  }
  get highPrice() {
    const high = this.k / this.virtualBase ** 2;
    return high;
  }

  static createFromDepthAndReserve(depth, price, base0, quote0) {
    const totalBase = 2 * price * depth;
    const totalQuote = 2 * price ** 2 * depth;
    const k = totalBase * totalQuote;
    const virtualBase = totalBase - base0;
    const virtualQuote = totalQuote - quote0;
    let dAMM = new DAMM();
    dAMM.realBase = base0;
    dAMM.realQuote = quote0;
    dAMM.virtualBase = virtualBase;
    dAMM.virtualQuote = virtualQuote;
    dAMM.k = k;
    return dAMM;
  }
  static createFromDepthAndRange(
    depth,
    price,
    lowPrice = 0,
    highPrice = Infinity
  ) {
    //if (price == null) {
    //  price = Math.sqrt(lowPrice * highPrice);
    //}
    const totalBase = 2 * price * depth;
    const totalQuote = 2 * price ** 2 * depth;
    const k = totalBase * totalQuote;
    const virtualBase = Math.sqrt(k / highPrice);
    const virtualQuote = Math.sqrt(k * lowPrice);
    const realBase = totalBase - virtualBase;
    const realQuote = totalQuote - virtualQuote;
    //console.log({ depth, price, base0, quote0, totalBase, totalQuote });
    return this.createFromDepthAndReserve(depth, price, realBase, realQuote);
  }
  static createFromRangeAndReserve(lowPrice, highPrice, base0, quote0) {
    if (highPrice === Infinity) {
      // highPrice being Infinity means virtualBase equals to 0
      let a = 1;
      let b = -lowPrice * base0;
      let c = -lowPrice * base0 * quote0;
      let roots = solveQuadraticEquation(a, b, c);
      let virtualQuote = roots[0];
      let virtualBase = 0;
      return this.createFromReserve(base0, quote0, virtualBase, virtualQuote);
    }
    const avgPrice = Math.sqrt(lowPrice * highPrice);
    // solve virtualBase
    // highPrice * virtualBase**2 == virtualQuote**2 / lowPrice == (virtualBase+base0) * (virtualQuote+quote0)
    // so, virtualBase * avgPrice == virtualQuote
    let a = avgPrice - highPrice;
    let b = base0 * avgPrice + quote0;
    let c = base0 * quote0;
    let roots = solveQuadraticEquation(a, b, c);
    let virtualBase = roots[1]; // first root is always negative
    let virtualQuote = avgPrice * virtualBase;
    return this.createFromReserve(base0, quote0, virtualBase, virtualQuote);
  }
  static createFromReserve(base, quote, virtualBase, virtualQuote) {
    const totalBase = base + virtualBase;
    const totalQuote = quote + virtualQuote;
    const k = totalBase * totalQuote;
    const price = totalQuote / totalBase;
    const depth = totalBase ** 2 / (2 * totalQuote);
    let dAMM = new DAMM();
    dAMM.realBase = base;
    dAMM.realQuote = quote;
    dAMM.virtualBase = virtualBase;
    dAMM.virtualQuote = virtualQuote;
    dAMM.k = k;
    return dAMM;
  }
  static getK(p, d) {
    const k = 4 * p ** 3 * d ** 2;
    return k;
  }
  getBaseDiffForQuoteDiff(qouteDiff) {
    return this.k / (this.totalQuote + qouteDiff) - this.totalBase;
  }
  getQuoteDiffForBaseDiff(baseDiff) {
    return this.k / (this.totalBase + baseDiff) - this.totalQuote;
  }
  getReserveAtPrice(p) {
    const totalBase = Math.sqrt(this.k / p);
    const totalQuote = Math.sqrt(this.k * p);
    return {
      totalBase: totalBase,
      totalQuote: totalQuote,
      realBase: totalBase - this.virtualBase,
      realQuote: totalQuote - this.virtualQuote,
    };
  }
  updateQuote(quoteDiff) {
    this.realQuote += quoteDiff;
    this.realBase =
      this.k / (this.realQuote + this.virtualQuote) - this.virtualBase;
  }
  updateBase(baseDiff) {
    this.realBase += baseDiff;
    this.realQuote =
      this.k / (this.realBase + this.virtualBase) - this.virtualQuote;
  }
  getRange() {
    return [this.lowPrice, this.highPrice];
  }
  sellBase(base, dryRun = false) {
    const quote = -this.getQuoteDiffForBaseDiff(base);
    console.log("avg price", quote / base);
    if (!dryRun) this.updateBase(base);
    return quote;
  }
  buyBase(base, dryRun = false) {
    const quote = this.getQuoteDiffForBaseDiff(-base);
    console.log("avg price", quote / base);
    if (!dryRun) this.updateBase(-base);
    return quote;
  }
  sellForQuote(quote, dryRun = false) {
    const base = this.getBaseDiffForQuoteDiff(-quote);
    console.log("avg price", quote / base);
    if (!dryRun) this.updateQuote(-quote);
    return base;
  }
  buyWithQuote(quote, dryRun = false) {
    const base = -this.getBaseDiffForQuoteDiff(quote);
    console.log("avg price", quote / base);
    if (!dryRun) this.updateQuote(quote);
    return base;
  }
  toOrders(interval, num) {
    // sell orders
    let sellOrders = [];
    for (let i = 1; i <= num; i++) {
      if (this.price + i * interval > this.highPrice) {
        break;
      }
      const {
        realBase: realBase1,
        realQuote: realQuote1,
      } = this.getReserveAtPrice(this.price + (i - 1) * interval);
      const {
        realBase: realBase2,
        realQuote: realQuote2,
      } = this.getReserveAtPrice(this.price + i * interval);
      const avgPrice = (realQuote2 - realQuote1) / (realBase1 - realBase2);
      const amount = realBase1 - realBase2;
      sellOrders.push({ price: avgPrice, amount: amount });
    }
    let buyOrders = [];
    for (let i = 1; i <= num; i++) {
      if (this.price - i * interval < this.lowPrice) {
        break;
      }
      const {
        realBase: realBase1,
        realQuote: realQuote1,
      } = this.getReserveAtPrice(this.price - (i - 1) * interval);
      const {
        realBase: realBase2,
        realQuote: realQuote2,
      } = this.getReserveAtPrice(this.price - i * interval);
      const avgPrice = (realQuote1 - realQuote2) / (realBase2 - realBase1);
      const amount = realBase2 - realBase1;
      buyOrders.push({ price: avgPrice, amount: amount });
    }
    return { buy: buyOrders, sell: sellOrders };
  }
}
