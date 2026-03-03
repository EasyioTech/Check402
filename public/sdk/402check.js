/**
 * 402check — Payment Status Guard
 * Lightweight client-side SDK (~2KB)
 * 
 * Usage:
 * <script src="https://check402.com/sdk/402check.js" 
 *         data-api-key="YOUR_API_KEY"
 *         data-server="https://check402.com">
 * </script>
 */
(function () {
    "use strict";

    // Find our own script tag to read data attributes
    var scripts = document.querySelectorAll("script[data-api-key]");
    var scriptTag = scripts[scripts.length - 1];

    if (!scriptTag) {
        console.warn("[402check] No script tag found with data-api-key attribute.");
        return;
    }

    var apiKey = scriptTag.getAttribute("data-api-key");
    var server = scriptTag.getAttribute("data-server") || "";

    if (!apiKey) {
        console.warn("[402check] data-api-key is required.");
        return;
    }

    // Remove trailing slash from server URL
    server = server.replace(/\/+$/, "");

    function checkPaymentStatus() {
        var url = server + "/api/check-status?key=" + encodeURIComponent(apiKey);

        fetch(url)
            .then(function (response) {
                if (!response.ok) {
                    throw new Error("HTTP " + response.status);
                }
                return response.json();
            })
            .then(function (data) {
                if (data.status === "DEFAULTED") {
                    showBlockPage(data.project, data.client);
                }
                // COMPLETED or PENDING — do nothing, app loads normally
            })
            .catch(function (err) {
                // Fail open — if we can't reach the server, let the app run
                console.warn("[402check] Could not verify payment status:", err.message);
            });
    }

    function showBlockPage(projectName, clientName) {
        // Prevent any further interaction
        document.title = "Payment Required — " + (projectName || "System Blocked");

        // Replace the entire body
        document.body.innerHTML = "";
        document.body.style.cssText =
            "margin:0;padding:0;min-height:100vh;display:flex;align-items:center;justify-content:center;" +
            "background:#0a0a0f;font-family:'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;" +
            "color:#f0f0f5;overflow:hidden;";

        // Add background gradient
        var bg = document.createElement("div");
        bg.style.cssText =
            "position:fixed;inset:0;z-index:0;" +
            "background:radial-gradient(circle at 30% 40%,rgba(239,68,68,0.08) 0%,transparent 50%)," +
            "radial-gradient(circle at 70% 60%,rgba(245,158,11,0.06) 0%,transparent 50%);";
        document.body.appendChild(bg);

        // Create the block card
        var card = document.createElement("div");
        card.style.cssText =
            "position:relative;z-index:1;max-width:520px;width:90%;padding:48px;text-align:center;" +
            "background:rgba(22,22,31,0.7);backdrop-filter:blur(24px);-webkit-backdrop-filter:blur(24px);" +
            "border:1px solid rgba(255,255,255,0.06);border-radius:20px;" +
            "box-shadow:0 8px 32px rgba(0,0,0,0.5);animation:check402-in 0.5s ease;";

        card.innerHTML =
            '<style>@keyframes check402-in{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}' +
            "@keyframes check402-pulse{0%,100%{opacity:1}50%{opacity:0.5}}</style>" +
            // Warning Icon
            '<div style="width:72px;height:72px;margin:0 auto 24px;border-radius:50%;' +
            "background:rgba(239,68,68,0.12);border:2px solid rgba(239,68,68,0.3);" +
            'display:flex;align-items:center;justify-content:center;font-size:32px;">' +
            "⚠️</div>" +
            // Title
            '<h1 style="font-size:1.6rem;font-weight:800;margin-bottom:8px;' +
            'background:linear-gradient(135deg,#ef4444,#f59e0b);-webkit-background-clip:text;' +
            '-webkit-text-fill-color:transparent;background-clip:text;">' +
            "Payment Required</h1>" +
            // Subtitle
            '<p style="color:#9595a8;font-size:0.95rem;margin-bottom:32px;line-height:1.6;">' +
            "This system has been temporarily suspended due to an outstanding payment. " +
            "Please complete your payment to restore access.</p>" +
            // Project Info
            '<div style="background:#12121a;border:1px solid #2a2a3a;border-radius:10px;padding:16px;margin-bottom:24px;">' +
            '<div style="display:flex;justify-content:space-between;margin-bottom:8px;">' +
            '<span style="color:#6b6b7d;font-size:0.8rem;">Project</span>' +
            '<span style="font-weight:600;font-size:0.85rem;">' +
            (projectName || "—") +
            "</span></div>" +
            '<div style="display:flex;justify-content:space-between;">' +
            '<span style="color:#6b6b7d;font-size:0.8rem;">Client</span>' +
            '<span style="font-weight:600;font-size:0.85rem;">' +
            (clientName || "—") +
            "</span></div></div>" +
            // Status badge
            '<div style="display:inline-flex;align-items:center;gap:8px;padding:8px 20px;' +
            "border-radius:9999px;background:rgba(239,68,68,0.12);border:1px solid rgba(239,68,68,0.3);" +
            'color:#ef4444;font-size:0.8rem;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;">' +
            '<span style="width:8px;height:8px;border-radius:50%;background:#ef4444;' +
            'animation:check402-pulse 2s infinite;"></span>' +
            "Payment Defaulted</div>" +
            // Contact
            '<p style="color:#6b6b7d;font-size:0.8rem;margin-top:32px;">' +
            "If you believe this is an error, please contact the project administrator.</p>";

        document.body.appendChild(card);

        // Prevent navigation
        window.history.pushState(null, "", window.location.href);
        window.addEventListener("popstate", function () {
            window.history.pushState(null, "", window.location.href);
        });
    }

    // Run on DOM ready
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", checkPaymentStatus);
    } else {
        checkPaymentStatus();
    }
})();
