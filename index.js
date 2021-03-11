const Fs = require('fs');
const CsvReadableStream = require('csv-reader');
const strategies = require('./strats.js');
const cliProgress = require('cli-progress');

// create new container
const multibar = new cliProgress.MultiBar({
    clearOnComplete: false,
    hideCursor: true,
    format: '[{bar}] ${value}'
}, cliProgress.Presets.rect);

// add bars
const timeBar = multibar.create(258948, 0);
const valueBar = multibar.create(20000, 0);
const controlBar = multibar.create(20000, 0);

valueBar.update({
  format: 'Your bot: [{bar}] ${value}'
})

// control bars
// b1.increment();
// b2.update(20, {filename: "helloworld.txt"});

let inputStream = Fs.createReadStream('Binance_BTCUSDT_minute.csv', 'utf8');
 
const STRAT = 'dayJob';
const INITIAL_USDT = 1000;
const INITIAL_CANDLE = { unix: 1599856800000,
  date: '2020-09-11 20:40:00',
  symbol: 'BTC/USDT',
  open: 10317,
  high: 10317.01,
  low: 10314.36,
  close: 10316,
  VBTC: 32.997684,
  VUSDT: 340398.47755266,
  tradecount: 342 
}


const state = {
  usdt: INITIAL_USDT,
  btc: 0,
  candle: INITIAL_CANDLE
};

const buy = (pct) => {
  const amount = pct * state.usdt;
  state.usdt -= amount;
  state.btc += 0.999 * amount / (state.candle.low + Math.random() * (state.candle.high - state.candle.low))
};

const sell = (pct) => {
  const amount = pct * state.btc;
  state.btc -= amount;
  state.usdt += 0.999 * amount * (state.candle.low + Math.random() * (state.candle.high - state.candle.low))
};

const getUSDTValue = ({usdt, btc}) => {
  return usdt + 0.999 * btc * (state.candle.low + Math.random() * (state.candle.high - state.candle.low))
}

const control = (initial, current, usdt) => {
  const intialBTC = 0.999 * usdt / (initial.low + Math.random() * (initial.high - initial.low));
  const endUSDT = 0.999 * intialBTC * (current.low + Math.random() * (current.high - current.low));

  return endUSDT;
}

let flipper = true;
inputStream
    .pipe(new CsvReadableStream({ parseNumbers: true, parseBooleans: true, trim: true, asObject: true }))
    .on('data', function (row) {
      state.candle = row;
      timeBar.increment();
      valueBar.update(getUSDTValue(state))
      controlBar.update(control(INITIAL_CANDLE, row, INITIAL_USDT));
      strategies[STRAT](buy, sell, state);
    })
    .on('end', function (data) {
      multibar.stop();
      console.log(`You have: $${getUSDTValue(state)}`);
      console.log(`You could've had: $${control(INITIAL_CANDLE, state.candle, INITIAL_USDT)}`);
    });
