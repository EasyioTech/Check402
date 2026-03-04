/**
 * check402 — Payment Status Guard
 * Lightweight client-side SDK (~2KB)
 * 
 * Usage:
 * <script src="https://check402.com/sdk/check402.js" 
 *         data-api-key="YOUR_API_KEY"
 *         data-server="https://check402.com">
 * </script>
 */
(function () {
    "use strict";

    // Base64 decoder for environments without atob
    var decode = function (str) {
        try {
            return decodeURIComponent(atob(str).split('').map(function (c) {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join(''));
        } catch (e) { return str; }
    };

    // Find script tag (check generic names first for stealth)
    var scriptTag = document.querySelector("script[data-id]") ||
        document.querySelector("script[data-api-key]");

    if (!scriptTag) return;

    // Read attributes (cleartext or encoded)
    var rawKey = scriptTag.getAttribute("data-id") || scriptTag.getAttribute("data-api-key");
    var rawServer = scriptTag.getAttribute("data-v") || scriptTag.getAttribute("data-server") || "";

    if (!rawKey) return;

    // Decode if it looks like Base64 (heuristic: no spaces, contains only B64 chars, often ends in =)
    var apiKey = /^[A-Za-z0-9+/=]+$/.test(rawKey) && rawKey.length > 20 ? decode(rawKey) : rawKey;
    var server = /^[A-Za-z0-9+/=]+$/.test(rawServer) && rawServer.length > 10 ? decode(rawServer) : rawServer;

    // Clean server URL
    server = (server || "").replace(/\/+$/, "");

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
                if (data.status && data.status.toUpperCase() === "DEFAULTED") {
                    showBlockPage(data.project, data.client);
                } else {
                    // Silently succeed in production
                    if (window.location.hostname === "localhost") {
                        console.log("[Security] Module verified.");
                    }
                }
            })
            .catch(function (err) {
                // Fail open
            });
    }

    function showBlockPage(projectName, clientName) {
        document.title = "Service Suspended — Check 402";

        // Replace the entire body
        document.body.innerHTML = "";
        document.body.style.cssText =
            "margin:0;padding:0;min-height:100vh;display:flex;align-items:center;justify-content:center;" +
            "background:#ffffff;font-family:'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;" +
            "color:#0f172a;overflow:hidden;";

        // Add background pattern (subtle mesh/radial)
        var bg = document.createElement("div");
        bg.style.cssText =
            "position:fixed;inset:0;z-index:0;pointer-events:none;" +
            "background-image:radial-gradient(at 0% 0%, rgba(20,184,166,0.03) 0, transparent 50%)," +
            "radial-gradient(at 100% 100%, rgba(20,184,166,0.02) 0, transparent 50%);";
        document.body.appendChild(bg);

        // Create the block card
        var card = document.createElement("div");
        card.style.cssText =
            "position:relative;z-index:1;max-width:440px;width:90%;padding:48px;text-align:center;" +
            "background:#ffffff;border:1px solid #f1f5f9;border-radius:24px;" +
            "box-shadow:0 25px 50px -12px rgba(0,0,0,0.08);animation:check402-fade-in 0.8s cubic-bezier(0.16, 1, 0.3, 1);";

        card.innerHTML =
            '<style>' +
            '@keyframes check402-fade-in{from{opacity:0;transform:translateY(16px) scale(0.98)}to{opacity:1;transform:translateY(0) scale(1)}}' +
            '@keyframes check402-float{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}' +
            '@keyframes check402-pulse{0%,100%{opacity:1}50%{opacity:0.4}}' +
            '</style>' +
            // Animated Icon
            '<div style="width:80px;height:80px;margin:0 auto 32px;border-radius:24px;' +
            "background:#fff;border:1px solid #f1f5f9;box-shadow:0 10px 15px -3px rgba(0,0,0,0.05);" +
            'display:flex;align-items:center;justify-content:center;font-size:32px;animation:check402-float 3s ease-in-out infinite;">' +
            '<span style="filter:grayscale(1) opacity(0.8);">🔒</span></div>' +
            // Title
            '<h1 style="font-size:1.75rem;font-weight:800;margin-bottom:12px;letter-spacing:-0.02em;color:#0f172a;">' +
            "Service Suspended</h1>" +
            // Subtitle
            '<p style="color:#64748b;font-size:1rem;margin-bottom:32px;line-height:1.6;font-weight:450;">' +
            "Access to this application has been temporarily paused due to an outstanding payment balance.</p>" +
            // Status badge
            '<div style="display:inline-flex;align-items:center;gap:10px;padding:10px 24px;' +
            "border-radius:9999px;background:#fef2f2;border:1px solid #fee2e2;" +
            'color:#991b1b;font-size:0.85rem;font-weight:700;text-transform:uppercase;letter-spacing:0.04em;margin-bottom:40px;">' +
            '<span style="width:8px;height:8px;border-radius:50%;background:#ef4444;' +
            'animation:check402-pulse 2s infinite;"></span>' +
            "Payment Required</div>" +
            // Divider
            '<div style="height:1px;background:#f1f5f9;width:100%;margin-bottom:24px;"></div>' +
            // Branding
            '<div style="font-size:0.85rem;color:#94a3b8;display:flex;align-items:center;justify-content:center;gap:6px;">' +
            '<span>Powered by</span>' +
            '<span style="font-weight:800;letter-spacing:-0.01em;">' +
            '<span style="color:#14b8a6;">Check</span> <span style="color:#0f172a;">402</span>' +
            '</span>' +
            '</div>';

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
