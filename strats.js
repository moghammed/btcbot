const state = {}

module.exports = {
  dayJob(buy, sell, {usdt, btc, candle: {date, open, high, low, close, VBTC, VUSDT, tradecount}}){
    const d = new Date(date);
    if(d.getHours() === 9){
      buy(1)
    }
    if(d.getHours() === 17){
      sell(1)
    }
  }
}