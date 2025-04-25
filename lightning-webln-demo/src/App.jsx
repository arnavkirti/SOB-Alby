import { useState, useEffect } from 'react'
import { requestProvider } from 'webln'
import { QRCodeSVG } from 'qrcode.react'

function App() {
  const [webln, setWebln] = useState(null)
  const [error, setError] = useState(null)
  const [, setNodeInfo] = useState(null)
  const [invoice, setInvoice] = useState(null)
  const [amount, setAmount] = useState(10)
  const [lnAddress, setLnAddress] = useState('')
  const [recipient, setRecipient] = useState('')
  const [keysendAmount, setKeysendAmount] = useState(10)
  const [autoPayEnabled, setAutoPayEnabled] = useState(false)
  const [lastScrollTime, setLastScrollTime] = useState(0)
  const [paymentStatus, setPaymentStatus] = useState('')
  const [darkMode, setDarkMode] = useState(() => {
    // Check for saved preference or use system preference
    const savedMode = localStorage.getItem('darkMode')
    return savedMode !== null 
      ? JSON.parse(savedMode) 
      : window.matchMedia('(prefers-color-scheme: dark)').matches
  })
  const [, setBalance] = useState(null)
  const [, setTransactions] = useState(null)
  const [methodResult, setMethodResult] = useState(null)
  const [activeMethod, setActiveMethod] = useState(null)

  // Initialize WebLN
  useEffect(() => {
    const initWebLN = async () => {
      try {
        const provider = await requestProvider()
        setWebln(provider)
        console.log('WebLN provider found:', provider)
      } catch (err) {
        setError('WebLN provider not found. Please install Alby or another WebLN compatible wallet.')
        console.error('WebLN Error:', err)
      }
    }
    
    initWebLN()
  }, [])

  // Handle auto-payment on scroll
  useEffect(() => {
    if (!autoPayEnabled || !webln) return

    const handleScroll = async () => {
      const now = Date.now()
      // Throttle to prevent multiple payments on a single scroll action (1 second cooldown)
      if (now - lastScrollTime > 1000) {
        setLastScrollTime(now)
        try {
          await webln.sendPayment({
            amount: 1,
            memo: 'Auto-payment on scroll'
          })
          setPaymentStatus('Auto-payment of 1 sat sent successfully!')
          setTimeout(() => setPaymentStatus(''), 3000)
        } catch (err) {
          setPaymentStatus('Auto-payment failed: ' + err.message)
        }
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [autoPayEnabled, webln, lastScrollTime])

  // Get Lightning node info
  const handleGetInfo = async () => {
    if (!webln) return
    
    try {
      const info = await webln.getInfo()
      setNodeInfo(info)
      setMethodResult(info)
      setActiveMethod('getInfo')
    } catch (err) {
      setError('Failed to get node info: ' + err.message)
    }
  }

  // Get balance
  const handleGetBalance = async () => {
    if (!webln) return
    
    try {
      setActiveMethod('getBalance')
      const balanceInfo = await webln.getBalance()
      setBalance(balanceInfo)
      setMethodResult(balanceInfo)
    } catch (err) {
      setError('Failed to get balance: ' + err.message)
    }
  }

  // Get transactions
  const handleGetTransactions = async () => {
    if (!webln) return
    
    try {
      setActiveMethod('getTransactions')
      const txs = await webln.getTransactions()
      setTransactions(txs)
      setMethodResult(txs)
    } catch (err) {
      setError('Failed to get transactions: ' + err.message)
    }
  }

  // Make an invoice
  const handleMakeInvoice = async () => {
    if (!webln) return
    
    try {
      const invoiceRequest = {
        amount,
        defaultMemo: `Invoice for ${amount} sats`
      }
      
      const result = await webln.makeInvoice(invoiceRequest)
      setInvoice(result.paymentRequest)
      setMethodResult(result)
      setActiveMethod('makeInvoice')
    } catch (err) {
      setError('Failed to create invoice: ' + err.message)
    }
  }

  // Save dark mode preference
  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode)
    localStorage.setItem('darkMode', JSON.stringify(darkMode))
  }, [darkMode])

  // Toggle dark mode
  const toggleDarkMode = () => {
    setDarkMode(prevMode => !prevMode)
  }

  // Send payment
  const handleSendPayment = async () => {
    if (!webln) return
    
    try {
      setPaymentStatus('Processing payment...')
      const result = await webln.sendPayment(lnAddress)
      setPaymentStatus(`Payment sent successfully! Preimage: ${result.preimage}`)
      setMethodResult(result)
      setActiveMethod('sendPayment')
    } catch (err) {
      setPaymentStatus('Payment failed: ' + err.message)
    }
  }

  // Send payment async
  const handleSendPaymentAsync = async () => {
    if (!webln || !lnAddress) return
    
    try {
      setPaymentStatus('Processing async payment...')
      const result = await webln.sendPaymentAsync(lnAddress)
      setPaymentStatus(`Async payment initiated! Payment hash: ${result.paymentHash}`)
      setMethodResult(result)
      setActiveMethod('sendPaymentAsync')
    } catch (err) {
      setPaymentStatus('Async payment failed: ' + err.message)
    }
  }

  // Send keysend payment
  const handleKeysend = async () => {
    if (!webln) return
    
    try {
      setPaymentStatus('Processing keysend payment...')
      const result = await webln.keysend({
        destination: recipient,
        amount: keysendAmount,
        customRecords: {
          '696969': 'Hello from Lightning WebLN Demo!'
        }
      })
      setPaymentStatus(`Keysend payment sent successfully! Preimage: ${result.preimage}`)
      setMethodResult(result)
      setActiveMethod('keysend')
    } catch (err) {
      setPaymentStatus('Keysend payment failed: ' + err.message)
    }
  }

  return (
    <div className={`min-h-screen ${darkMode ? 'dark:bg-gray-900 dark:text-white' : 'bg-white'} transition-colors duration-200`}>
      <div className="container mx-auto p-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Lightning WebLN Demo</h1>
          <button 
            onClick={toggleDarkMode}
            className="p-2 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
          >
            {darkMode ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            )}
          </button>
        </div>
        
        {error && <div className="bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-300 px-4 py-3 rounded mb-4">{error}</div>}
        {paymentStatus && <div className="bg-blue-100 dark:bg-blue-900 border border-blue-400 dark:border-blue-700 text-blue-700 dark:text-blue-300 px-4 py-3 rounded mb-4">{paymentStatus}</div>}
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* WebLN Status */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">WebLN Status</h2>
            <p className="mb-4">
              {webln ? 'WebLN provider connected ✅' : 'WebLN provider not connected ❌'}
            </p>
            {!webln && (
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Please install a WebLN compatible wallet like Alby to use this application.
              </p>
            )}
          </div>

          {/* WebLN Methods */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">WebLN Methods</h2>
            <div className="flex flex-wrap gap-2 mb-4">
              <button 
                onClick={handleGetInfo}
                disabled={!webln}
                className={`px-3 py-1 rounded text-sm font-medium ${activeMethod === 'getInfo' ? 'bg-blue-600 text-white' : 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'} disabled:opacity-50`}
              >
                getInfo
              </button>
              <button 
                onClick={handleGetBalance}
                disabled={!webln}
                className={`px-3 py-1 rounded text-sm font-medium ${activeMethod === 'getBalance' ? 'bg-blue-600 text-white' : 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'} disabled:opacity-50`}
              >
                getBalance
              </button>
              <button 
                onClick={handleGetTransactions}
                disabled={!webln}
                className={`px-3 py-1 rounded text-sm font-medium ${activeMethod === 'getTransactions' ? 'bg-blue-600 text-white' : 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'} disabled:opacity-50`}
              >
                getTransactions
              </button>
              <button 
                onClick={handleMakeInvoice}
                disabled={!webln}
                className={`px-3 py-1 rounded text-sm font-medium ${activeMethod === 'makeInvoice' ? 'bg-blue-600 text-white' : 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300'} disabled:opacity-50`}
              >
                makeInvoice
              </button>
              <button 
                onClick={handleSendPayment}
                disabled={!webln || !lnAddress}
                className={`px-3 py-1 rounded text-sm font-medium ${activeMethod === 'sendPayment' ? 'bg-blue-600 text-white' : 'bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300'} disabled:opacity-50`}
              >
                sendPayment
              </button>
              <button 
                onClick={handleSendPaymentAsync}
                disabled={!webln || !lnAddress}
                className={`px-3 py-1 rounded text-sm font-medium ${activeMethod === 'sendPaymentAsync' ? 'bg-blue-600 text-white' : 'bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300'} disabled:opacity-50`}
              >
                sendPaymentAsync
              </button>
              <button 
                onClick={handleKeysend}
                disabled={!webln || !recipient}
                className={`px-3 py-1 rounded text-sm font-medium ${activeMethod === 'keysend' ? 'bg-blue-600 text-white' : 'bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300'} disabled:opacity-50`}
              >
                keysend
              </button>
            </div>
            
            {methodResult && (
              <div className="mt-4">
                <h3 className="font-semibold">Method Result: {activeMethod}</h3>
                <pre className="bg-gray-100 dark:bg-gray-700 p-2 rounded mt-2 overflow-x-auto text-xs">
                  {JSON.stringify(methodResult, null, 2)}
                </pre>
              </div>
            )}
          </div>

          {/* Make Invoice */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Generate Invoice</h2>
            <div className="mb-4">
              <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">
                Amount (sats):
              </label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(parseInt(e.target.value) || 0)}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 dark:text-gray-300 dark:bg-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              />
            </div>
            
            <button 
              onClick={handleMakeInvoice}
              disabled={!webln}
              className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
            >
              Generate Invoice
            </button>
            
            {invoice && (
              <div className="mt-4">
                <h3 className="font-semibold">Invoice:</h3>
                <div className="bg-gray-100 dark:bg-gray-700 p-2 rounded mt-2 overflow-x-auto break-all">
                  <p className="text-xs">{invoice}</p>
                </div>
                <div className="mt-4 flex justify-center">
                  <QRCodeSVG 
                    value={invoice} 
                    size={150} 
                    bgColor={darkMode ? "#1f2937" : "#ffffff"} 
                    fgColor={darkMode ? "#ffffff" : "#000000"} 
                  />
                </div>
              </div>
            )}
          </div>

          {/* Send Payment */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Pay via WebLN</h2>
            <div className="mb-4">
              <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">
                Lightning Invoice or LNURL:
              </label>
              <textarea
                value={lnAddress}
                onChange={(e) => setLnAddress(e.target.value)}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 dark:text-gray-300 dark:bg-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                rows="3"
              />
            </div>
            
            <div className="flex gap-2">
              <button 
                onClick={handleSendPayment}
                disabled={!webln || !lnAddress}
                className="bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
              >
                Send Payment
              </button>
              
              <button 
                onClick={handleSendPaymentAsync}
                disabled={!webln || !lnAddress}
                className="bg-purple-300 hover:bg-purple-500 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
              >
                Send Async
              </button>
            </div>
          </div>

          {/* Keysend Payment */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Keysend Payment</h2>
            <div className="mb-4">
              <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">
                Recipient Node Pubkey:
              </label>
              <input
                type="text"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 dark:text-gray-300 dark:bg-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">
                Amount (sats):
              </label>
              <input
                type="number"
                value={keysendAmount}
                onChange={(e) => setKeysendAmount(parseInt(e.target.value) || 0)}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 dark:text-gray-300 dark:bg-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              />
            </div>
            
            <button 
              onClick={handleKeysend}
              disabled={!webln || !recipient}
              className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
            >
              Send Keysend Payment
            </button>
          </div>

          {/* Auto-payment on Scroll */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Auto-payment on Scroll</h2>
            <p className="mb-4 text-sm">
              When enabled, this will automatically send 1 sat payment each time you scroll on the page.
            </p>
            
            <div className="flex items-center mb-4">
              <input
                id="auto-payment"
                type="checkbox"
                checked={autoPayEnabled}
                onChange={(e) => setAutoPayEnabled(e.target.checked)}
                disabled={!webln}
                className="w-4 h-4 text-blue-600 bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500"
              />
              <label htmlFor="auto-payment" className="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300">
                Enable Auto-payment on Scroll (1 sat per scroll)
              </label>
            </div>
            
            <div className="mt-4">
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Note: Payments are throttled to prevent multiple payments on a single scroll action.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
