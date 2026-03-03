import { NextResponse } from 'next/server'

export async function GET() {
    const host = 'check402.com'
    const key = 'f9d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8'
    const keyLocation = `https://${host}/${key}.txt`

    const urls = [
        `https://${host}/`,
        `https://${host}/docs`,
        `https://${host}/login`,
        `https://${host}/signup`,
    ]

    const indexNowPayload = {
        host,
        key,
        keyLocation,
        urlList: urls,
    }

    try {
        const response = await fetch('https://api.indexnow.org/indexnow', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json; charset=utf-8',
            },
            body: JSON.stringify(indexNowPayload),
        })

        if (response.ok) {
            return NextResponse.json({ message: 'IndexNow ping successful' })
        } else {
            const error = await response.text()
            return NextResponse.json({ error: 'IndexNow ping failed', details: error }, { status: response.status })
        }
    } catch (err) {
        return NextResponse.json({ error: 'IndexNow ping failed', details: err instanceof Error ? err.message : String(err) }, { status: 500 })
    }
}
