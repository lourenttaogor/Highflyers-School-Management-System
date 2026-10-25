import {NextResponse} from 'next/server';
export const config={matcher:['/dashboard/:path*']};
export function middleware(r){return r.cookies.get('t')?NextResponse.next():NextResponse.redirect(new URL('/',r.url))}
