import { NextResponse } from 'next/server';

export async function GET() {
  const version = process.env.APP_VERSION || 'stable';
  
  return NextResponse.json({
    version,
    isCanary: version === 'canary',
    timestamp: new Date().toISOString(),
  });
}
