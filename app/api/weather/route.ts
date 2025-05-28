export async function GET(request: Request) {
    const {searchParams} = new URL(request.url)
    const latitude = searchParams.get('lat')
    const longitude = searchParams.get('lon')

    if (!latitude || !longitude) {
        return new Response(JSON.stringify({error: '위도와 경도를 제공해주세요.'}), {status: 400})
    }

    const response = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`)
    const data = await response.json()
    const weather = data.current_weather

    return Response.json({
        temperature: weather.temperature,
        windspeed: weather.windspeed,
        time: weather.time,
    })
}