import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const requests = {
  static: 0,
  pages: 0,
}

export async function middleware(request: NextRequest) {  
  const { pathname } = request.nextUrl;

  if (pathname.startsWith('/metrics')) {
    const responseString = [
      '# HELP http_requests Number of all HTTP requests',
      '# TYPE http_requests gauge',
      `http_requests ${requests.pages + requests.static}`,

      '# HELP http_requests_static Number of static requests',
      '# TYPE http_requests_static gauge',
      `http_requests_static ${requests.static}`,

      '# HELP http_requests_pages Number of pages requests',
      '# TYPE http_requests_pages gauge',
      `http_requests_pages ${requests.pages}`,
    ].join('\n');

    const response = new Response(responseString);
    response.headers.set('Content-Type', 'text/plain; version=0.0.4; charset=utf-8');

    console.log(request.headers, request.nextUrl.username, request.nextUrl.password, process.env.METRICS_USERNAME, process.env.METRICS_PASSWORD);

    return response;
  }

  if (pathname.startsWith('/_next/static')) {
    requests.static += 1;
  } else {
    requests.pages += 1;
  }
}

export const config = {
  matcher: '/:path*',
}
