"use client"

import { useState, useEffect } from "react"

export default function AdminProvidersPage() {
    const [providers, setProviders] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [formData, setFormData] = useState({
        name: "",
        baseUrl: "",
        authType: "none",
        authConfig: "{}",
        docsUrl: "",
        description: "",
        category: ""
    })

    useEffect(() => {
        fetchProviders()
    }, [])

    const fetchProviders = async () => {
        const res = await fetch("/api/providers")
        if (res.ok) {
            setProviders(await res.json())
        }
        setLoading(false)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        const res = await fetch("/api/providers", {
            method: "POST",
            body: JSON.stringify(formData)
        })
        if (res.ok) {
            setFormData({ name: "", baseUrl: "", authType: "none", authConfig: "{}", docsUrl: "", description: "", category: "" })
            fetchProviders()
        } else {
            alert("Failed to create provider")
        }
    }

    return (
        <div className="container mx-auto py-10 px-4">
            <h1 className="text-2xl font-bold mb-6">Manage API Providers</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="border p-4 rounded shadow">
                    <h2 className="text-xl font-semibold mb-4">Add New Provider</h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium">Name</label>
                            <input className="w-full border p-2 rounded" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required />
                        </div>
                        <div>
                            <label className="block text-sm font-medium">Base URL</label>
                            <input className="w-full border p-2 rounded" value={formData.baseUrl} onChange={e => setFormData({ ...formData, baseUrl: e.target.value })} required />
                        </div>
                        <div>
                            <label className="block text-sm font-medium">Auth Type</label>
                            <select className="w-full border p-2 rounded" value={formData.authType} onChange={e => setFormData({ ...formData, authType: e.target.value })}>
                                <option value="none">None</option>
                                <option value="bearer">Bearer Token</option>
                                <option value="header">Custom Header</option>
                                <option value="query">Query Param</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium">Auth Config (JSON)</label>
                            <textarea className="w-full border p-2 rounded" value={formData.authConfig} onChange={e => setFormData({ ...formData, authConfig: e.target.value })} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium">Docs URL</label>
                            <input className="w-full border p-2 rounded" value={formData.docsUrl} onChange={e => setFormData({ ...formData, docsUrl: e.target.value })} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium">Description</label>
                            <textarea className="w-full border p-2 rounded" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium">Category</label>
                            <input className="w-full border p-2 rounded" value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })} />
                        </div>
                        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Add Provider</button>
                    </form>
                </div>

                <div>
                    <h2 className="text-xl font-semibold mb-4">Existing Providers</h2>
                    {loading ? <p>Loading...</p> : (
                        <div className="space-y-4">
                            {providers.map(p => (
                                <div key={p.id} className="border p-4 rounded hover:bg-gray-50">
                                    <h3 className="font-bold">{p.name}</h3>
                                    <p className="text-sm text-gray-600">{p.baseUrl}</p>
                                    <p className="text-sm">{p.description}</p>
                                    <div className="mt-2 text-xs text-gray-500">
                                        Auth: {p.authType} | Category: {p.category}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
