# Next.js Integration Guide

To protect your Next.js application, follow these steps:

### 1. Install the SDK
Copy the `402check.js` file to your `public/sdk/` directory.

### 2. Add the Guard Script
Add the following script to your root layout (`app/layout.tsx` or `pages/_document.tsx`):

```html
<script 
  src="https://your-server.com/sdk/402check.js" 
  data-api-key="YOUR_API_KEY"
  data-server="https://your-server.com"
  async>
</script>
```

### 3. Middleware (Optional but Recommended)
For server-side protection, you can check the status in your middleware.

```typescript
// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const res = await fetch(`https://your-server.com/api/check-status?apiKey=YOUR_API_KEY`)
  const status = await res.json()
  
  if (status.blocked) {
    return NextResponse.rewrite(new URL('/blocked', request.url))
  }
}
```
