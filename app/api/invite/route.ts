import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const { token } = await req.json()

  const inviteUrl = `${process.env.NEXT_PUBLIC_APP_URL}/invite/${token}`

  return NextResponse.json({ success: true, inviteUrl })
}