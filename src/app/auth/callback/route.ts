import { NextResponse, type NextRequest } from 'next/server';

// Phase 1 stub — Task 10 exchanges the OAuth code here.
export function GET(request: NextRequest) {
  return NextResponse.redirect(new URL('/join', request.url));
}
