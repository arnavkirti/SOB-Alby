import { useState, useEffect } from 'react'
import { requestProvider } from 'webln'
// import QRCode from 'qrcode.react'

function App() {
  const [webln, setWebln] = useState(null)
  const [error, setError] = useState(null)
  const [nodeInfo, setNodeInfo] = useState(null)
  const [invoice, setInvoice] = useState(null)
  const [amount, setAmount] = useState(10)
  const [lnAddress, setLnAddress] = useState('')
  const [recipient, setRecipient] = useState('')
  const [keysendAmount, setKeysendAmount] = useState(10)
  const [autoPayEnabled, setAutoPayEnabled] = useState(false)
  const [lastScrollTime, setLastScrollTime] = useState(0)
  const [paymentStatus, setPaymentStatus] = useState('')

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
    } catch (err) {
      setError('Failed to get node info: ' + err.message)
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
      
      const { paymentRequest } = await webln.makeInvoice(invoiceRequest)
      setInvoice(paymentRequest)
    } catch (err) {
      setError('Failed to create invoice: ' + err.message)
    }
  }

  // Send payment
  const handleSendPayment = async () => {
    if (!webln) return
    
    try {
      setPaymentStatus('Processing payment...')
      const result = await webln.sendPayment(lnAddress)
      setPaymentStatus(`Payment sent successfully! Preimage: ${result.preimage}`)
    } catch (err) {
      setPaymentStatus('Payment failed: ' + err.message)
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
    } catch (err) {
      setPaymentStatus('Keysend payment failed: ' + err.message)
    }
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Lightning WebLN Demo</h1>
      
      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}
      {paymentStatus && <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded mb-4">{paymentStatus}</div>}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* WebLN Status */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">WebLN Status</h2>
          <p className="mb-4">
            {webln ? 'WebLN provider connected ✅' : 'WebLN provider not connected ❌'}
          </p>
          {!webln && (
            <p className="text-sm text-gray-600">
              Please install a WebLN compatible wallet like Alby to use this application.
            </p>
          )}
        </div>

        {/* Get Info */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Get Node Info</h2>
          <button 
            onClick={handleGetInfo}
            disabled={!webln}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
          >
            Get Info
          </button>
          
          {nodeInfo && (
            <div className="mt-4">
              <h3 className="font-semibold">Node Info:</h3>
              <pre className="bg-gray-100 p-2 rounded mt-2 overflow-x-auto">
                {JSON.stringify(nodeInfo, null, 2)}
              </pre>
            </div>
          )}
        </div>

        {/* Make Invoice */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Generate Invoice</h2>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Amount (sats):
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(parseInt(e.target.value) || 0)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
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
              <div className="bg-gray-100 p-2 rounded mt-2 overflow-x-auto break-all">
                <p className="text-xs">{invoice}</p>
              </div>
              <div className="mt-4 flex justify-center">
                <QRCode value={invoice} size={150} />
              </div>
            </div>
          )}
        </div>

        {/* Send Payment */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Pay via WebLN</h2>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Lightning Invoice or LNURL:
            </label>
            <textarea
              value={lnAddress}
              onChange={(e) => setLnAddress(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              rows="3"
            />
          </div>
          
          <button 
            onClick={handleSendPayment}
            disabled={!webln || !lnAddress}
            className="bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
          >
            Send Payment
          </button>
        </div>

        {/* Keysend Payment */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Keysend Payment</h2>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Recipient Node Pubkey:
            </label>
            <input
              type="text"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Amount (sats):
            </label>
            <input
              type="number"
              value={keysendAmount}
              onChange={(e) => setKeysendAmount(parseInt(e.target.value) || 0)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
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
        <div className="bg-white p-6 rounded-lg shadow-md">
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
              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="auto-payment" className="ml-2 text-sm font-medium text-gray-900">
              Enable Auto-payment on Scroll (1 sat per scroll)
            </label>
          </div>
          
          <div className="mt-4">
            <p className="text-xs text-gray-600">
              Note: Payments are throttled to prevent multiple payments on a single scroll action.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
