"use client"

import { useState, useEffect } from "react"
import { Copy, Trash, RefreshCw } from "lucide-react"

export default function DashboardKeysPage() {
    const [keys, setKeys] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [newKeyRaw, setNewKeyRaw] = useState<string | null>(null)

    // Form for new key
    const [keyName, setKeyName] = useState("")

    useEffect(() => {
        fetchKeys()
    }, [])

    const fetchKeys = async () => {
        try {
            const res = await fetch("/api/keys")
            if (res.ok) {
                setKeys(await res.json())
            }
        } finally {
            setLoading(false)
        }
    }

    const handleCreateKey = async (e: React.FormEvent) => {
        e.preventDefault()
        const res = await fetch("/api/keys", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name: keyName })
        })
        if (res.ok) {
            const data = await res.json()
            setNewKeyRaw(data.rawKey) // Show raw key once
            setKeyName("")
            fetchKeys()
        } else {
            alert("Failed to create key")
        }
    }

    const handleRevoke = async (keyId: string) => {
        if (!confirm("Are you sure you want to revoke this key?")) return
        const res = await fetch("/api/keys/revoke", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ keyId })
        })
        if (res.ok) fetchKeys()
        else alert("Failed to revoke")
    }

    const handleRotate = async (keyId: string) => {
        if (!confirm("This will revoke the old key and create a new one. Continue?")) return
        const res = await fetch("/api/keys/rotate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ keyId })
        })
        if (res.ok) {
            const data = await res.json()
            setNewKeyRaw(data.rawKey)
            fetchKeys()
        } else {
            alert("Failed to rotate")
        }
    }

    return (
        <div className="container mx-auto py-10 px-4">
            <h1 className="text-2xl font-bold mb-6">My API Keys</h1>

            {newKeyRaw && (
                <div className="bg-green-50 border border-green-200 p-4 rounded mb-6">
                    <h3 className="text-green-800 font-bold mb-2">New Key Generated!</h3>
                    <p className="text-sm text-green-700 mb-2">Copy this key now. You won't be able to see it again.</p>
                    <div className="flex items-center gap-2">
                        <code className="flex-1 bg-white border p-2 rounded font-mono break-all">{newKeyRaw}</code>
                        <button onClick={() => navigator.clipboard.writeText(newKeyRaw)} className="p-2 bg-white border rounded hover:bg-gray-50">
                            <Copy size={16} />
                        </button>
                    </div>
                    <button onClick={() => setNewKeyRaw(null)} className="mt-4 text-sm text-green-800 underline">Dismiss</button>
                </div>
            )}

            <div className="bg-white p-6 rounded shadow mb-8">
                <h2 className="text-lg font-semibold mb-4">Create New Key</h2>
                <form onSubmit={handleCreateKey} className="flex gap-4">
                    <input
                        placeholder="Key Name (e.g. Production)"
                        className="flex-1 border p-2 rounded"
                        value={keyName}
                        onChange={e => setKeyName(e.target.value)}
                        required
                    />
                    <button type="submit" className="bg-black text-white px-4 py-2 rounded">Generate Key</button>
                </form>
            </div>

            <div>
                <h2 className="text-lg font-semibold mb-4">Active Keys</h2>
                {loading ? <p>Loading...</p> : (
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                            <thead>
                                <tr className="bg-gray-50 text-left border-b">
                                    <th className="p-3">Name</th>
                                    <th className="p-3">Prefix</th>
                                    <th className="p-3">Status</th>
                                    <th className="p-3">Last Used</th>
                                    <th className="p-3">Created</th>
                                    <th className="p-3">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {keys.map(key => (
                                    <tr key={key.id} className="border-b">
                                        <td className="p-3 font-medium">{key.name}</td>
                                        <td className="p-3 font-mono text-xs text-gray-500">{key.id}...</td>
                                        <td className="p-3">
                                            <span className={`px-2 py-1 rounded text-xs ${key.revoked ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                                                {key.revoked ? 'Revoked' : 'Active'}
                                            </span>
                                        </td>
                                        <td className="p-3 text-sm text-gray-500">{key.lastUsedAt ? new Date(key.lastUsedAt).toLocaleDateString() : 'Never'}</td>
                                        <td className="p-3 text-sm text-gray-500">{new Date(key.createdAt).toLocaleDateString()}</td>
                                        <td className="p-3 flex gap-2">
                                            {!key.revoked && (
                                                <>
                                                    <button onClick={() => handleRotate(key.id)} className="p-1 text-blue-600 hover:text-blue-800" title="Rotate">
                                                        <RefreshCw size={16} />
                                                    </button>
                                                    <button onClick={() => handleRevoke(key.id)} className="p-1 text-red-600 hover:text-red-800" title="Revoke">
                                                        <Trash size={16} />
                                                    </button>
                                                </>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                                {keys.length === 0 && (
                                    <tr>
                                        <td colSpan={6} className="p-4 text-center text-gray-500">No keys found.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    )
}
