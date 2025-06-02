'use client'
import {useEffect, useState} from 'react'
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card"
import Spinner from '@/components/Spinner'

export default function WeatherPage() {
    const [weather, setWeather] = useState<null | {
        temperature: number
        windspeed: number
        time: string
    }>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        if (!navigator.geolocation) {
            setError('위치 정보를 지원하지 않는 브라우저입니다.')
            setLoading(false)
            return
        }

        navigator.geolocation.getCurrentPosition(async pos => {
            const {latitude, longitude} = pos.coords
            const res = await fetch(`/api/weather?lat=${latitude}&lon=${longitude}`)
            const data = await res.json()
            setWeather(data)
            setLoading(false)
        }, () => {
            setError('위치 정보 접근이 거부되었습니다.')
            setLoading(false)
        })
    }, [])

    return (
        <Card>
            <CardHeader>
                <CardTitle>🌤 현재 날씨</CardTitle>
            </CardHeader>
            <CardContent>
                {loading && <Spinner message="위치 정보를 불러오는 중..."/>}
                {error && <p className="text-destructive">{error}</p>}
                {weather && (
                    <ul className="space-y-1 text-sm">
                        <li>🌡 온도: {weather.temperature}°C</li>
                        <li>💨 풍속: {weather.windspeed} km/h</li>
                        <li>⏰ 시각: {weather.time}</li>
                    </ul>
                )}
            </CardContent>
        </Card>
    )
}