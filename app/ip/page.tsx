'use client'
import {useEffect, useState} from 'react'
import axios from "axios";

export default function IPPage() {
    const [ip, setIp] = useState('')

    useEffect(() => {
        axios.get('/api/ip').then(res => setIp(res.data.ip))
    }, [])

    return (
        <div>
            <h2 className="text-xl font-bold mb-4">🌐 내 IP 주소 확인</h2>
            <p className="text-gray-300">🧾 당신의 IP: <span className="text-white">{ip}</span></p>
        </div>
    )
}