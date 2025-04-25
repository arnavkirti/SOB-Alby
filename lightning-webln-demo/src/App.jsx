import { useState, useEffect } from 'react'
import { requestProvider } from 'webln'
import { QRCodeSVG } from 'qrcode.react'
import { QrReader } from 'react-qr-reader'

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
  const [methodResult, setMethodResult] = useState(null)
  const [activeMethod, setActiveMethod] = useState(null)
  const [showScanner, setShowScanner] = useState(false)

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
          // First create an invoice
          const invoiceResult = await webln.makeInvoice({
            amount: 1,
            defaultMemo: 'Auto-payment on scroll'
          })

          await new Promise(resolve => setTimeout(resolve, 1000))
          
          // Then pay the invoice
          await webln.sendPayment(invoiceResult.paymentRequest)
          
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

  // Handle QR code scan result
  const handleScan = async (result) => {
    if (result) {
      // Extract the invoice from the QR code data
      const scannedInvoice = result?.text || '';
      
      // Check if it's a Lightning invoice (starts with 'lnbc')
      if (scannedInvoice.startsWith('lnbc')) {
        setLnAddress(scannedInvoice);
        setShowScanner(false);
        
        // Optionally, automatically pay the invoice
        if (webln) {
          try {
            setPaymentStatus('Processing payment from scanned QR code...');
            const payResult = await webln.sendPayment(scannedInvoice);
            setPaymentStatus(`Payment sent successfully! Preimage: ${payResult.preimage}`);
            setMethodResult(payResult);
            setActiveMethod('sendPayment');
          } catch (err) {
            setPaymentStatus('Payment failed: ' + err.message);
          }
        }
      } else {
        setError('Invalid Lightning invoice QR code');
        setTimeout(() => setError(null), 3000);
      }
    }
  };

  // Toggle QR scanner
  const toggleScanner = () => {
    setShowScanner(!showScanner);
  };

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
    <div className={`min-h-screen ${darkMode ? 'dark bg-gray-900 text-white' : 'bg-gray-50'} transition-colors duration-200`}>
      <div className="container mx-auto p-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Lightning WebLN Demo</h1>
          <button 
            onClick={toggleDarkMode}
            className={`p-2 rounded-lg ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-blue-100 hover:bg-blue-200'} transition-colors`}
            aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
          >
            {darkMode ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            )}
          </button>
        </div>
        
        {error && <div className={`${darkMode ? 'bg-red-900 border-red-700 text-red-300' : 'bg-red-50 border-red-200 text-red-600'} border px-4 py-3 rounded mb-4`}>{error}</div>}
        {paymentStatus && <div className={`${darkMode ? 'bg-blue-900 border-blue-700 text-blue-300' : 'bg-blue-50 border-blue-200 text-blue-600'} border px-4 py-3 rounded mb-4`}>{paymentStatus}</div>}
        
        {/* QR Code Scanner */}
        {showScanner && (
          <div className={`${darkMode ? 'bg-gray-800' : 'bg-white border border-gray-200'} p-6 rounded-lg shadow-sm mb-6`}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Scan Lightning Invoice</h2>
              <button 
                onClick={toggleScanner}
                className={`p-2 rounded-lg ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-red-100 hover:bg-red-200'} transition-colors`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="max-w-md mx-auto">
              <QrReader
                constraints={{ facingMode: 'environment' }}
                onResult={handleScan}
                className={`${darkMode ? 'border-gray-700' : 'border-gray-300'} border rounded overflow-hidden`}
                scanDelay={500}
              />
              <p className={`mt-2 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                Point your camera at a Lightning invoice QR code to scan and pay.
              </p>
            </div>
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* WebLN Status */}
          <div className={`${darkMode ? 'bg-gray-800' : 'bg-white border border-gray-200'} p-6 rounded-lg shadow-sm`}>
            <h2 className="text-xl font-semibold mb-4">WebLN Status</h2>
            <p className="mb-4">
              {webln ? 'WebLN provider connected ✅' : 'WebLN provider not connected ❌'}
            </p>
            {!webln && (
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                Please install a WebLN compatible wallet like Alby to use this application.
              </p>
            )}
          </div>

          {/* WebLN Methods */}
          <div className={`${darkMode ? 'bg-gray-800' : 'bg-white border border-gray-200'} p-6 rounded-lg shadow-sm`}>
            <h2 className="text-xl font-semibold mb-4">WebLN Methods</h2>
            <div className="flex flex-wrap gap-2 mb-4">
              <button 
                onClick={handleGetInfo}
                disabled={!webln}
                className={`px-3 py-1 rounded text-sm font-medium ${
                  activeMethod === 'getInfo' 
                    ? 'bg-blue-600 text-white' 
                    : darkMode 
                      ? 'bg-blue-900 text-blue-300' 
                      : 'bg-blue-50 text-blue-600 border border-blue-200'
                } disabled:opacity-50`}
              >
                getInfo
              </button>
              <button 
                onClick={handleGetBalance}
                disabled={!webln}
                className={`px-3 py-1 rounded text-sm font-medium ${
                  activeMethod === 'getBalance' 
                    ? 'bg-blue-600 text-white' 
                    : darkMode 
                      ? 'bg-blue-900 text-blue-300' 
                      : 'bg-blue-50 text-blue-600 border border-blue-200'
                } disabled:opacity-50`}
              >
                getBalance
              </button>
              <button 
                onClick={handleMakeInvoice}
                disabled={!webln}
                className={`px-3 py-1 rounded text-sm font-medium ${
                  activeMethod === 'makeInvoice' 
                    ? 'bg-blue-600 text-white' 
                    : darkMode 
                      ? 'bg-green-900 text-green-300' 
                      : 'bg-green-50 text-green-600 border border-green-200'
                } disabled:opacity-50`}
              >
                makeInvoice
              </button>
              <button 
                onClick={handleSendPayment}
                disabled={!webln || !lnAddress}
                className={`px-3 py-1 rounded text-sm font-medium ${
                  activeMethod === 'sendPayment' 
                    ? 'bg-blue-600 text-white' 
                    : darkMode 
                      ? 'bg-purple-900 text-purple-300' 
                      : 'bg-purple-50 text-purple-600 border border-purple-200'
                } disabled:opacity-50`}
              >
                sendPayment
              </button>
              <button 
                onClick={handleSendPaymentAsync}
                disabled={!webln || !lnAddress}
                className={`px-3 py-1 rounded text-sm font-medium ${
                  activeMethod === 'sendPaymentAsync' 
                    ? 'bg-blue-600 text-white' 
                    : darkMode 
                      ? 'bg-purple-900 text-purple-300' 
                      : 'bg-purple-50 text-purple-600 border border-purple-200'
                } disabled:opacity-50`}
              >
                sendPaymentAsync
              </button>
              <button 
                onClick={handleKeysend}
                disabled={!webln || !recipient}
                className={`px-3 py-1 rounded text-sm font-medium ${
                  activeMethod === 'keysend' 
                    ? 'bg-blue-600 text-white' 
                    : darkMode 
                      ? 'bg-yellow-900 text-yellow-300' 
                      : 'bg-yellow-50 text-yellow-600 border border-yellow-200'
                } disabled:opacity-50`}
              >
                keysend
              </button>
            </div>
            
            {methodResult && (
              <div className="mt-4">
                <h3 className="font-semibold">Method Result: {activeMethod}</h3>
                <pre className={`${darkMode ? 'bg-gray-700' : 'bg-gray-50 border border-gray-200'} p-2 rounded mt-2 overflow-x-auto text-xs`}>
                  {JSON.stringify(methodResult, null, 2)}
                </pre>
              </div>
            )}
          </div>

          {/* Make Invoice */}
          <div className={`${darkMode ? 'bg-gray-800' : 'bg-white border border-gray-200'} p-6 rounded-lg shadow-sm`}>
            <h2 className="text-xl font-semibold mb-4">Generate Invoice</h2>
            <div className="mb-4">
              <label className={`block ${darkMode ? 'text-gray-300' : 'text-gray-700'} text-sm font-bold mb-2`}>
                Amount (sats):
              </label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(parseInt(e.target.value) || 0)}
                className={`shadow appearance-none border rounded w-full py-2 px-3 ${
                  darkMode ? 'text-gray-300 bg-gray-700 border-gray-600' : 'text-gray-700 bg-white border-gray-300'
                } leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
              />
            </div>
            
            <button 
              onClick={handleMakeInvoice}
              disabled={!webln}
              className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded disabled:opacity-50 transition-colors"
            >
              Generate Invoice
            </button>
            
            {invoice && (
              <div className="mt-4">
                <h3 className="font-semibold">Invoice:</h3>
                <div className={`${darkMode ? 'bg-gray-700' : 'bg-gray-50 border border-gray-200'} p-2 rounded mt-2 overflow-x-auto break-all`}>
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
          <div className={`${darkMode ? 'bg-gray-800' : 'bg-white border border-gray-200'} p-6 rounded-lg shadow-sm`}>
            <h2 className="text-xl font-semibold mb-4">Pay via WebLN</h2>
            <div className="mb-4">
              <label className={`block ${darkMode ? 'text-gray-300' : 'text-gray-700'} text-sm font-bold mb-2`}>
                Lightning Invoice or LNURL:
              </label>
              <textarea
                value={lnAddress}
                onChange={(e) => setLnAddress(e.target.value)}
                className={`shadow appearance-none border rounded w-full py-2 px-3 ${
                  darkMode ? 'text-gray-300 bg-gray-700 border-gray-600' : 'text-gray-700 bg-white border-gray-300'
                } leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                rows="3"
              />
            </div>
            
            <div className="flex gap-2 flex-wrap">
              <button 
                onClick={handleSendPayment}
                disabled={!webln || !lnAddress}
                className="bg-purple-500 hover:bg-purple-600 text-white font-bold py-2 px-4 rounded disabled:opacity-50 transition-colors"
              >
                Send Payment
              </button>
              
              <button 
                onClick={handleSendPaymentAsync}
                disabled={!webln || !lnAddress}
                className="bg-purple-400 hover:bg-purple-500 text-white font-bold py-2 px-4 rounded disabled:opacity-50 transition-colors"
              >
                Send Async
              </button>
              
              <button 
                onClick={toggleScanner}
                disabled={!webln}
                className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded disabled:opacity-50 transition-colors"
              >
                <span className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Scan QR Code
                </span>
              </button>
            </div>
          </div>

          {/* Keysend Payment */}
          <div className={`${darkMode ? 'bg-gray-800' : 'bg-white border border-gray-200'} p-6 rounded-lg shadow-sm`}>
            <h2 className="text-xl font-semibold mb-4">Keysend Payment</h2>
            <div className="mb-4">
              <label className={`block ${darkMode ? 'text-gray-300' : 'text-gray-700'} text-sm font-bold mb-2`}>
                Recipient Node Pubkey:
              </label>
              <input
                type="text"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                className={`shadow appearance-none border rounded w-full py-2 px-3 ${
                  darkMode ? 'text-gray-300 bg-gray-700 border-gray-600' : 'text-gray-700 bg-white border-gray-300'
                } leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
              />
            </div>
            
            <div className="mb-4">
              <label className={`block ${darkMode ? 'text-gray-300' : 'text-gray-700'} text-sm font-bold mb-2`}>
                Amount (sats):
              </label>
              <input
                type="number"
                value={keysendAmount}
                onChange={(e) => setKeysendAmount(parseInt(e.target.value) || 0)}
                className={`shadow appearance-none border rounded w-full py-2 px-3 ${
                  darkMode ? 'text-gray-300 bg-gray-700 border-gray-600' : 'text-gray-700 bg-white border-gray-300'
                } leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
              />
            </div>
            
            <button 
              onClick={handleKeysend}
              disabled={!webln || !recipient}
              className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded disabled:opacity-50 transition-colors"
            >
              Send Keysend Payment
            </button>
          </div>

          {/* Auto-payment on Scroll */}
          <div className={`${darkMode ? 'bg-gray-800' : 'bg-white border border-gray-200'} p-6 rounded-lg shadow-sm`}>
            <h2 className="text-xl font-semibold mb-4">Auto-payment on Scroll</h2>
            <p className={`mb-4 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              When enabled, this will automatically send 1 sat payment each time you scroll on the page.
            </p>
            
            <div className="flex items-center mb-4">
              <input
                id="auto-payment"
                type="checkbox"
                checked={autoPayEnabled}
                onChange={(e) => setAutoPayEnabled(e.target.checked)}
                disabled={!webln}
                className={`w-4 h-4 text-blue-600 ${
                  darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-100 border-gray-300'
                } rounded focus:ring-blue-500`}
              />
              <label htmlFor="auto-payment" className={`ml-2 text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Enable Auto-payment on Scroll (1 sat per scroll)
              </label>
            </div>
            
            <div className="mt-4">
              <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
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
