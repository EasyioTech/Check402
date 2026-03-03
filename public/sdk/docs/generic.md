# Generic JS Integration Guide

For static sites or other frameworks:

### 1. Include the Script
Add this to your HTML `<head>` or before `</body>`:

```html
<script 
  src="https://your-server.com/sdk/402check.js" 
  data-api-key="YOUR_API_KEY"
  data-server="https://your-server.com">
</script>
```

### 2. Manual Check (Optional)
You can manually trigger a check using the global `_402check` object if needed:

```javascript
window.addEventListener('load', () => {
  if (window._402check) {
    window._402check.init({
      apiKey: 'YOUR_API_KEY',
      server: 'https://your-server.com'
    });
  }
});
```
