import './App.css';
import React, {useState, useEffect, useRef} from 'react'
import { Typography, Button, InputNumber, Tabs, Checkbox, Table, Select} from 'antd'
import DAMM from './differential-amm'
import { useTranslation} from "react-i18next";

const {Text} = Typography
const { TabPane } = Tabs;
const { Option } = Select;

const ORDER_AMOUNT = 7

const levels = [0.01, 0.1, 1, 10, 100, 1000]

function InputField(props) {
  return (
      <InputNumber  {...props} 
        min={0}
        formatter={(value) => {
          //console.log(typeof value)
          const dotIndex = value.indexOf('.')

          if (dotIndex > -1) {
            //return parseFloat(value).toPrecision(dotIndex + 3)
            return value.length < dotIndex + 3  ? value : parseFloat(value).toPrecision(dotIndex + 3)
          } else {
            return value
          }
        }}
      />
  )
}

function App(props) {
  const [tabIndex, setTabIndex] = useState(0)
  const [damm, setDamm] = useState(DAMM.createFromDepthAndRange(8.394814025505184, 3445.4497187900683))

  //console.log('props', props)
  const { t, i18n } = useTranslation();

  //console.log(damm.price, damm.depth, damm.lowPrice, damm.highPrice, damm.realBase, damm.realQuote)
  const [price, setPrice] = useState(damm.price)
  const [depth, setDepth] = useState(damm.depth)

  const [low, setLow] = useState(damm.lowPrice)
  const [high, setHigh] = useState(damm.highPrice)

  const [base, setBase] = useState(damm.realBase)
  const [quote, setQuote] = useState(damm.realQuote)

  const [interval, setInterval] = useState(levels[2])
  const [isAutoComputing, setIsAutoComputing] = useState(true)

  const [buyingEth, setBuyingEth] = useState(0)
  const [buyingUsd, setBuyingUsd] = useState(0)
  const [average, setAverage] = useState(0)

  const [sellingEth, setSellingEth] = useState(0)
  const [sellingUsd, setSellingUsd] = useState(0)

  const [buyOrders, setBuyOrders] = useState([])
  const [sellOrders, setSellOrders] = useState([])

  const [buyingEthEdited, setBuyingEthEdited] = useState(false)
  const [buyingUsdEdited, setBuyingUsdEdited] = useState(false)

  const [sellingEthEdited, setSellingEthEdited] = useState(false)
  const [sellingUsdEdited, setSellingUsdEdited] = useState(false)

  const [customizePrice, setCustomizePrice] = useState(false)
  const [customizeAmount, setCustomizeAmount] = useState(false)

  const isInit = useRef(true)

  useEffect(() => {
    if (isInit.current) {
      isInit.current = false;
      return
    }

    if (isAutoComputing) {
      console.log(low, high, base, quote)
      const newDamm = DAMM.createFromRangeAndReserve(low, high, base, quote)
      setDamm(newDamm)
      setPrice(newDamm.price)
      setDepth(newDamm.depth)
      console.log(newDamm.price, newDamm.depth)

      //updateOrderBook(damm)
    } 
    //console.log('useeffect', low)
  }, [low, high, base, quote])

  useEffect(() => {
    console.log('update order book')
    updateOrderBook(damm)
  }, [damm])

  const updateOrderBook = (damm, newInterval) => {

    const orders = damm.toOrders(newInterval ? newInterval : interval, ORDER_AMOUNT)
    setBuyOrders([...orders.buy])
    setSellOrders([...orders.sell])
  }

  const onIntervalChanged = async (value) => {
    setInterval(value)


    updateOrderBook(damm, value)
  }

  const onPriceChanged = (value) => {
    setPrice(value)

    const newDamm = DAMM.createFromDepthAndRange(depth, value)
    setDamm(newDamm)

    setLow(newDamm.lowPrice)
    setHigh(newDamm.highPrice)
    setBase(newDamm.realBase)
    setQuote(newDamm.realQuote)
  }

  const onDepthChanged = (value) => {
    setDepth(value)

    const newDamm = DAMM.createFromDepthAndRange(value, price)
    setDamm(newDamm)

    setLow(newDamm.lowPrice)
    setHigh(newDamm.highPrice)
    setBase(newDamm.realBase)
    setQuote(newDamm.realQuote)
  }

  const onCustomizePriceChanged = (e) => {
    setCustomizePrice(e.target.checked)
  }

  const onCustomizeAmountChanged = (e) => {
    setCustomizeAmount(e.target.checked)
  }

  const onLowPriceChanged = (value) => {
    //const adjusted = value > price - 0.01 ? price - 0.01 : value

    setLow(value)

    console.log('price changed', value)

    const newDamm = DAMM.createFromDepthAndRange(depth, price, value, high)
    setDamm(newDamm)

    setBase(newDamm.realBase)
    setQuote(newDamm.realQuote)
  }

  const onHighPriceChanged = (value) => {
    //const adjusted = value < price + 0.01 ? price + 0.01 : value
    setHigh(value)


    const newDamm = DAMM.createFromDepthAndRange(depth, price, low, value)
    setDamm(newDamm)

    setBase(newDamm.realBase)
    setQuote(newDamm.realQuote)
  }

  const onBaseChanged = (value) => {
    setBase(value)

    const newDamm = DAMM.createFromDepthAndReserve(depth, price, value, quote)
    setDamm(newDamm)

    setLow(newDamm.lowPrice)
    setHigh(newDamm.highPrice)
  }

  const onQuoteChanged = (value) => {
    setQuote(value)

    const newDamm = DAMM.createFromDepthAndReserve(depth, price, base, value)
    setDamm(newDamm)

    setLow(newDamm.lowPrice)
    setHigh(newDamm.highPrice)
  }

  const buildAutoComputing = () => {
    return (
        <div>
          <div style={styles.row}>
            <Text style={styles.label}>{t('price')}</Text>
            <InputField style={styles.input} readOnly={true} min={0} value={price} onChange={setPrice} />
            <Text>USD</Text>
          </div>
          <div style={styles.row}>
            <Text style={styles.label}>{t('depth')}</Text>
            <InputField style={styles.input} readOnly={true} min={0} value={depth} onChange={setDepth} />
            <Text>ETH/USD</Text>
          </div>
          <div style={styles.row}>
            <Text style={styles.label}>{t('minPrice')}</Text>
            <InputField style={{...styles.input}} min={0} value={low} onChange={setLow} />
            <Text>USD</Text>
            <Text style={{marginLeft: 60}}>{t('maxPrice')}</Text>
            <InputField style={{...styles.input}} min={1} value={high} onChange={setHigh}/>
            <Text>USD</Text>
          </div>
          <div style={styles.row}>
            <Text style={styles.label}>{t('tokenAmount')}</Text>
            <InputField style={{...styles.input}} min={0} value={base} onChange={setBase} />
            <Text style={styles.label}>ETH</Text>
            <InputField style={{...styles.input, marginLeft: 80}} value={quote} onChange={setQuote}/>
            <Text>USD</Text>
          </div>
        </div>
    )
  }

  const onChangeLanguage = (v) => {
  }

  const buildManualInput = () => {
    return (
        <div>
          <div style={styles.row}>
            <Text style={styles.label}>{t('price')}</Text>
            <InputField style={styles.input} min={0} value={price} onChange={onPriceChanged} />
            <Text>USD</Text>
          </div>
          <div style={styles.row}>
            <Text style={styles.label}>{t('depth')}</Text>
            <InputField style={styles.input} min={0} value={depth} onChange={onDepthChanged} />
            <Text>ETH/USD</Text>
          </div>
          <div style={styles.row}>
            <Text style={styles.label} >{t('minPrice')}</Text>
            <InputField readOnly={!customizePrice} style={{...styles.input}} min={0} value={low} onChange={onLowPriceChanged} 
            onBlur={() => {
              if (low >= price) {
                onLowPriceChanged(price)
              }
            }}
            />
            <Text>USD</Text>
            <Text style={{marginLeft: 60}}>{t('maxPrice')}</Text>
            <InputField readOnly={!customizePrice} style={{...styles.input}} min={1} value={high} onChange={onHighPriceChanged}
            onBlur={() => {
              if (high <= price) {
                onHighPriceChanged(price)
              }
            }}
            />
            <Text>USD</Text>
          </div>
          <Checkbox disabled={customizeAmount} style={styles.check} onChange={onCustomizePriceChanged}>{t('customizePriceRange')}</Checkbox>
          <div style={styles.row}>
            <Text style={styles.label}>{t('tokenAmount')}</Text>
            <InputField readOnly={!customizeAmount} style={{...styles.input}} value={base} onChange={onBaseChanged} />
            <Text style={styles.label}>ETH</Text>
            <InputField readOnly={!customizeAmount} style={{...styles.input, marginLeft: 80}} min={0} value={quote} onChange={onQuoteChanged}/>
            <Text>USD</Text>
          </div>
          <Checkbox disabled={customizePrice} style={styles.check} onChange={onCustomizeAmountChanged}>{t('customizeTokenAmount')}</Checkbox>
        </div>
    )
  }

  const raiseNumberToPrecision = (number, precision) => {
    if (number === null || precision === null) {
      return null;
    }
    // Example: 1234.56 @ 0.1 becomes 12345, 1234.56 @ 10 becomes 123.
    return Math.floor(number / precision) * precision;
  };


  const buildOrderBook = () => {
    const columns = [
      {
        title: 'Price(USDT)',
        dataIndex: 'price',
        key: 'price',
        render: (text, row, index) => {
          return parseFloat(text) > 0 ? text : <Text style={{color: 'white'}}>0</Text>
        }
      },
      {
        title: 'Amount(ETH)',
        dataIndex: 'amount',
        key: 'amount',
        render: (text, row, index) => {
          return parseFloat(text) > 0 ? text : <Text style={{color: 'white'}}>0</Text>
        }
      },
      {
        title: 'Total(USDT)',
        dataIndex: 'total',
        key: 'total',
        render: (text, row, index) => {
          return parseFloat(text) > 0 ? text : <Text style={{color: 'white'}}>0</Text>
        }
      },
    ]

    //console.log('>>>sel orders', sellOrders)

    const adjustedSellOrders = sellOrders.sort((a, b) => b.price - a.price).map(v => {
      return {
        price: formatNumber(v.price),
        amount: formatNumber(v.amount),
        total: formatNumber(v.price * v.amount),
      }
    })

    if (adjustedSellOrders.length < ORDER_AMOUNT) {
      const originLength = adjustedSellOrders.length

      for (let i = 0; i < ORDER_AMOUNT - originLength; i++) {
        adjustedSellOrders.unshift({
          price: '-1',
          amount: '-1',
          total: '-1',
        })
      }
    }

    const adjustedBuyOrders = buyOrders.sort((a, b) => b.price - a.price).map(v => {
      return {
        price: formatNumber(v.price),
        amount: formatNumber(v.amount),
        total: formatNumber(v.price * v.amount),
      }
    })

    if (adjustedBuyOrders.length < ORDER_AMOUNT) {
      const originLength = adjustedBuyOrders.length

      for (let i = 0; i < ORDER_AMOUNT - originLength; i++) {
        adjustedBuyOrders.push({
          price: '-1',
          amount: '-1',
          total: '-1',
        })
      }
    }

    return (
      <div style={styles.orderBook}>
        <div style={styles.header}>
          <Text style={styles.title} strong>Order book</Text>
          <Select defaultValue={levels[2]} style={styles.select} onChange={onIntervalChanged}>
            {levels.map(v => {
              return <Option key={v} value={v} >{v}</Option>
            })
            }
          </Select>
        </div>
        <Table columns={columns} scroll={{y: 280}} bordered size={'small'} sticky={{offsetScroll: 180}}
        dataSource={ adjustedSellOrders } 
        pagination={false} style={{...styles.table, borderBottom: '0px solid #2593fc'}} 
        />
        <Table showHeader={false} columns={columns} scroll={{y: 280}} bordered size={'small'}
        dataSource={ adjustedBuyOrders } 
         pagination={false} style={{...styles.table, borderTop: '0px solid #2593fc'}} 
         />
      </div>
    )
  }

  const formatNumber = (num) => {
    const str = num.toString()
    const dotIndex = str.indexOf('.')
    //console.log(str)

    if (dotIndex > -1) {
      return parseFloat(str).toPrecision(dotIndex + 3)
    } else {
      return str
    }
  }

  const onChangeTab = (key) => {
    setIsAutoComputing(key === '0')
  }

  const buyEth = () => {
    console.log('buy')
    setBuyingEthEdited(false)
    setBuyingUsdEdited(false)

    if (buyingEthEdited) {
      damm.buyBase(buyingEth, false)
      setBuyingEth(0)
      setBuyingUsd(0)
      setAverage(0)

      const orders = damm.toOrders(interval, ORDER_AMOUNT)
      setBuyOrders([...orders.buy])
      setSellOrders([...orders.sell])

      console.log(orders)
    } else if (buyingUsdEdited) {

      damm.buyWithQuote(buyingUsd, false)
      setBuyingEth(0)
      setBuyingUsd(0)
      setAverage(0)

      const orders = damm.toOrders(interval, ORDER_AMOUNT)
      setBuyOrders([...orders.buy])
      setSellOrders([...orders.sell])

      console.log(orders)
    }
  }

  const sellEth = () => {
    console.log('sell')
    setSellingEthEdited(false)
    setSellingUsdEdited(false)

    if (sellingEthEdited) {
      damm.sellBase(sellingEth, false)
      setSellingEth(0)
      setSellingUsd(0)
      setAverage(0)

      const orders = damm.toOrders(interval, ORDER_AMOUNT)
      setSellOrders([...orders.sell])
      setBuyOrders([...orders.buy])

      console.log(orders)
    } else if (sellingUsdEdited) {

      damm.sellWithQuote(sellingUsd, false)
      setSellingEth(0)
      setSellingUsd(0)
      setAverage(0)

      const orders = damm.toOrders(interval, ORDER_AMOUNT)
      setSellOrders([...orders.sell])
      setBuyOrders([...orders.buy])

      console.log(orders)
    }
  }

  const onBuyingEthChanged = (value) => {
    setBuyingEth(value)

    const usd = damm.buyBase(value, true) 
    setBuyingUsd(usd)

    setAverage(value > 0 ? usd / value : 0)

    setBuyingEthEdited(true)
    setBuyingUsdEdited(false)
  }

  const onBuyingUsdChanged = (value) => {
    setBuyingUsd(value)

    const eth = damm.buyWithQuote(value, true) 
    setBuyingEth(eth)

    setAverage(value > 0 ? value / eth : 0)

    setBuyingEthEdited(false)
    setBuyingUsdEdited(true)
  }

  const onSellingEthChanged = (value) => {
    setSellingEth(value)

    const usd = damm.sellBase(value, true) 
    setSellingUsd(usd)

    setAverage(value > 0 ? usd / value : 0)

    setSellingEthEdited(true)
    setSellingUsdEdited(false)
  }

  const onSellingUsdChanged = (value) => {
    setSellingUsd(value)

    const eth = damm.sellForQuote(value, true) 
    setSellingEth(eth)

    setAverage(value > 0 ? value / eth : 0)

    setSellingEthEdited(false)
    setSellingUsdEdited(true)
  }

  return (
    <div className="App">
      <div style={styles.paramPanel}>
        <Tabs defaultActiveKey="0" onChange={onChangeTab}>
          <TabPane tab={t('setPrice')} key="1">
            {buildManualInput()}
          </TabPane>
          <TabPane tab={t('autoComputePrice')} key="0">
            {buildAutoComputing()}
          </TabPane>
        </Tabs>
        <div style={styles.line} />
        <div style={styles.buyAndSell}>
          <div style={styles.buyPanel}>
            <Button style={styles.button} type={'primary'} onClick={buyEth}>{'BUY   ETH'}</Button>
            <div style={styles.row}>
              <Text style={styles.label}>ETH</Text>
              <InputField style={{...styles.input}} value={buyingEth} onChange={onBuyingEthChanged} />
            </div>
            <div style={styles.row}>
              <Text style={styles.label}>USD</Text>
              <InputField style={{...styles.input}} value={buyingUsd} onChange={onBuyingUsdChanged} />
            </div>
          </div>
          <div style={styles.divider} />
          <div style={styles.sellPanel}>
            <Button style={styles.button} type={'primary'} onClick={sellEth}>{'SELL   ETH'}</Button>
            <div style={styles.row}>
              <Text style={styles.label}>ETH</Text>
              <InputField style={{...styles.input}} value={sellingEth} onChange={onSellingEthChanged} />
            </div>
            <div style={styles.row}>
              <Text style={styles.label}>USD</Text>
              <InputField style={{...styles.input}} value={sellingUsd} onChange={onSellingUsdChanged} />
            </div>
          </div>
        </div>
        <div style={styles.line} />
        <div style={styles.row}>
          <Text style={styles.label}>Avg Price</Text>
          <InputField readOnly={true}  value={average}  style={{...styles.input}} />
        </div>
        <Button style={{position: 'absolute', top: 10, right: 10}} type={'link'} 
        onClick={() => {
          i18n.changeLanguage(i18n.language === 'zh' ? 'en' : 'zh')
        }}
        >
          {i18n.language === 'zh' ? 'en' : 'zh'}
          </Button>
      </div>
      {
        buildOrderBook()
      }
    </div>
  );
}

const styles = {
  select: {
    width: 90,
  },
  header: {
    display: 'flex',
    width: '100%',
    height: 48,
    marginTop: 0,
    backgroundColor: 'white',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  check: {
    marginTop: 10,
  },
  buyPanel: {
    display: 'flex',
    flex: 1,
    backgroundColor: 'white',
    flexDirection: 'column',
    marginTop: 10,
  },
  sellPanel: {
    display: 'flex',
    flex: 1,
    flexDirection: 'column',
    marginTop: 10,
  },
  divider: {
    marginRight: 30,
    width: 1,
    height: 140,
    backgroundColor: '#f0f0f0',
  },
  buyAndSell: {
    display: 'flex',
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: '#f0f0f0',
    marginTop: 20,
  },
  paramPanel: {
    position: 'relative',
    flex: 8,
    flexDirection: 'column',
    justifyContent: 'flex-start',
    minHeight: '100vh',
    padding: 20,
    paddingTop: 0,
  },
  row: {
    display: 'flex',
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 25,
  },
  label: {
    width: 70,
  },
  input: {
    width: 150,
    marginLeft: 20,
    marginRight: 20,
  },
  orderBook: {
    display: 'flex',
    flex: 5,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'flex-start',
    minHeight: '100vh',
    backgroundColor: 'white',
    padding: 10,
    paddingTop: 0,
  },
  table: {
    width: '100%',
    flex: 1,
  },
  tableContainer: {
    width: '100%',
    minHeight: 400,
    maxHeight: 400,
    backgroundColor: 'pink'
  },
  title: {
    fontSize: 18,
  },
  button: {
    width: '50%',
  },
  tableDivider: {
    height: 2,
    marginBottom: 5,
    width: '95%',
    backgroundColor: '#2593fc',
  },
}

export default App;
