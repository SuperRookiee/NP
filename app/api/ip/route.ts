export async function GET(req: Request) {
    const forwarded = req.headers.get('x-forwarded-for')
    console.log(req.headers)
    const ip = forwarded?.split(',')[0] || 'IP 확인 불가'
    return Response.json({ip})
}