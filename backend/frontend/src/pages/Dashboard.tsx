import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import toast from 'react-hot-toast'

type FoodItem = {
  _id: string
  name: string
  category: string
  quantity: number
  expiryDate: string
}

export default function Dashboard() {
  const navigate = useNavigate()
  const [items, setItems] = useState<FoodItem[]>([])
  const [loading, setLoading] = useState(true)

  const [name, setName] = useState('')
  const [category, setCategory] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [expiryDate, setExpiryDate] = useState('')

  const token = localStorage.getItem('token')

  useEffect(() => {
    if (!token) {
      navigate('/login')
      return
    }
    loadItems()
  }, [token, navigate])

  const loadItems = async () => {
    try {
      setLoading(true)
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/food`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      setItems(res.data)
    } catch (err: any) {
      console.error('Load items error:', err.response?.data || err.message)
      toast.error('Failed to load food items')
    } finally {
      setLoading(false)
    }
  }

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !category.trim() || !expiryDate) {
      toast.error('Please fill all fields')
      return
    }
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/food`,
        { name: name.trim(), category: category.trim(), quantity, expiryDate },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setItems(prev => [...prev, res.data])
      setName('')
      setCategory('')
      setQuantity(1)
      setExpiryDate('')
      toast.success('Food item added')
    } catch (err: any) {
      console.error('Add item error:', err.response?.data || err.message)
      toast.error('Failed to add item')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this item?')) return
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/food/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      setItems(prev => prev.filter(item => item._id !== id))
      toast.success('Item deleted')
    } catch (err: any) {
      console.error('Delete item error:', err.response?.data || err.message)
      toast.error('Failed to delete item')
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    navigate('/login')
  }

  if (!token) {
    return <div className="app-shell">Redirecting...</div>
  }

  return (
    <div className="min-h-screen bg-neutral py-8">
      <main className="max-w-6xl mx-auto px-4 py-6 md:py-10 space-y-8 animate-fade-in">
        {/* Greeting + stats */}
        <section className="grid md:grid-cols-3 gap-6">
          <div className="card md:col-span-2 p-6 transition-all duration-300 hover:shadow-lg">
            <h2 className="text-2xl font-bold text-gray-800 mb-2 tracking-tight">
              Dashboard
            </h2>
            <p className="text-md text-gray-600">
              Welcome back! Add new food items and keep track of expiry dates.
            </p>
          </div>
          <div className="card bg-gradient-to-br from-primary to-secondary text-white p-6 shadow-lg flex flex-col justify-center transform transition-transform duration-300 hover:scale-105">
            <p className="text-sm uppercase tracking-wider opacity-90 mb-1">
              Quick glance
            </p>
            <p className="text-4xl font-extrabold">{items.length}</p>
            <p className="text-md opacity-90">items currently tracked</p>
          </div>
        </section>

        {/* Add item card */}
        <section className="card p-6 space-y-6 transition-all duration-300 hover:shadow-lg">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3 className="text-xl font-semibold text-gray-800">
                Add food item
              </h3>
              <p className="text-sm text-gray-600">
                Fill in the details and click Add to start tracking.
              </p>
            </div>
            {/* Scanner toggle if you re-enable it */}
            {/* <button
              type="button"
              onClick={() => setScanning(s => !s)}
              className={`inline-flex items-center rounded-full px-3 py-1.5 text-xs font-semibold shadow-sm transition
              ${scanning ? 'bg-slate-200 text-slate-700' : 'bg-emerald-500 text-white hover:bg-emerald-600'}`}
            >
              {scanning ? 'Stop scanner' : 'Scan barcode'}
            </button> */}
          </div>

          {/* Scanner area (optional) */}
          {/* {scanning && (
            <div className="rounded-xl border border-dashed border-emerald-300 overflow-hidden bg-emerald-50/40 p-2">
              <Scanner
                onScan={handleScan}
                onError={err => {
                  console.error('Scanner error:', err)
                  toast.error('Camera error')
                }}
                constraints={{ facingMode: 'environment' }}
                styles={{ container: { width: '100%' }, video: { width: '100%' } }}
              />
            </div>
          )} */}

          <form
            onSubmit={handleAdd}
            className="grid md:grid-cols-5 gap-4 md:gap-6 items-end"
          >
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Name
              </label>
              <input
                type="text"
                placeholder="e.g. Milk"
                value={name}
                onChange={e => setName(e.target.value)}
                className="input focus:ring-primary focus:border-primary"
              />
            </div>
            <div className="md:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <input
                type="text"
                placeholder="Dairy, Fruit..."
                value={category}
                onChange={e => setCategory(e.target.value)}
                className="input focus:ring-primary focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Quantity
              </label>
              <input
                type="number"
                min={1}
                value={quantity}
                onChange={e => setQuantity(Number(e.target.value))}
                className="input focus:ring-primary focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Expiry date
              </label>
              <input
                type="date"
                value={expiryDate}
                onChange={e => setExpiryDate(e.target.value)}
                className="input focus:ring-primary focus:border-primary"
              />
            </div>
            <div className="md:col-span-5 flex justify-end">
              <button
                type="submit"
                className="btn bg-primary hover:bg-secondary transition-colors duration-200"
              >
                Add item
              </button>
            </div>
          </form>
        </section>

        {/* Items grid */}
        <section className="card p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-800">
              Your food items
            </h3>
          </div>

          {loading ? (
            <div className="py-10 text-center text-gray-500 text-lg">
              Loading items...
            </div>
          ) : items.length === 0 ? (
            <div className="py-10 text-center text-gray-500 text-lg">
              No items yet. Add your first item above.
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {items.map(item => (
                <div
                  key={item._id}
                  className="card relative overflow-hidden transition-all duration-300 hover:shadow-lg transform hover:-translate-y-1"
                >
                  <div className="p-4 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="font-semibold text-gray-800 text-lg">
                          {item.name}
                        </h4>
                        <p className="text-xs uppercase tracking-wider text-primary font-medium">
                          {item.category || 'Uncategorized'}
                        </p>
                      </div>
                      <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
                        Qty {item.quantity}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">
                      Expires:{' '}
                      <span className="font-medium text-gray-800">
                        {new Date(item.expiryDate).toLocaleDateString()}
                      </span>
                    </p>
                  </div>
                  <div className="px-4 pb-4 flex justify-end">
                    <button
                      onClick={() => handleDelete(item._id)}
                      className="text-sm font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-full px-3 py-1 transition-colors duration-200"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
