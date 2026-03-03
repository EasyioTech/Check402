# React / Vite Integration Guide

To protect your React application:

### 1. Add the Script to `index.html`
Insert the guard script before the closing `</body>` tag:

```html
<script 
  src="https://your-server.com/sdk/402check.js" 
  data-api-key="YOUR_API_KEY"
  data-server="https://your-server.com">
</script>
```

### 2. React Component Protection
You can also use a hook to check status within your components:

```javascript
import { useEffect, useState } from 'react';

function usePaymentStatus() {
  const [isBlocked, setIsBlocked] = useState(false);

  useEffect(() => {
    fetch('https://your-server.com/api/check-status?apiKey=YOUR_API_KEY')
      .then(res => res.json())
      .then(data => setIsBlocked(data.blocked));
  }, []);

  return isBlocked;
}
```
