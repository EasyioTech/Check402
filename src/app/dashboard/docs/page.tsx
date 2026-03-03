"use client";

import { useState } from "react";

type Framework = "overview" | "html" | "nextjs" | "react" | "vue" | "angular" | "laravel" | "django" | "rails" | "wordpress";

interface Tab {
    id: Framework;
    label: string;
    icon: string;
}

const tabs: Tab[] = [
    { id: "overview", label: "Overview", icon: "📖" },
    { id: "html", label: "HTML / Vanilla JS", icon: "🌐" },
    { id: "nextjs", label: "Next.js", icon: "▲" },
    { id: "react", label: "React (Vite/CRA)", icon: "⚛️" },
    { id: "vue", label: "Vue.js", icon: "💚" },
    { id: "angular", label: "Angular", icon: "🅰️" },
    { id: "laravel", label: "Laravel", icon: "🔴" },
    { id: "django", label: "Django", icon: "🐍" },
    { id: "rails", label: "Ruby on Rails", icon: "💎" },
    { id: "wordpress", label: "WordPress", icon: "📝" },
];

export default function DocsPage() {
    const [activeTab, setActiveTab] = useState<Framework>("overview");
    const [copiedId, setCopiedId] = useState<string | null>(null);

    const serverUrl = typeof window !== "undefined" ? window.location.origin : "https://your-domain.com";

    const copyCode = (code: string, id: string) => {
        navigator.clipboard.writeText(code);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    return (
        <>
            <div className="mb-8 border-b border-slate-200 pb-6">
                <div>
                    <h1 className="text-3xl font-extrabold text-slate-900 mb-2">Documentation</h1>
                    <p className="text-lg text-slate-500 font-medium">Learn how to integrate 402check into your client web apps</p>
                </div>
            </div>

            <div className="flex flex-col md:flex-row gap-8">
                {/* Sidebar Tabs */}
                <div className="w-full md:w-64 flex-shrink-0">
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 px-3">Frameworks</div>
                    <div className="flex flex-col space-y-1">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all text-left ${activeTab === tab.id
                                    ? "bg-teal-50 text-teal-700 shadow-sm border border-teal-100"
                                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-transparent"}`}
                                onClick={() => setActiveTab(tab.id)}
                            >
                                <span className={`text-lg ${activeTab === tab.id ? "opacity-100" : "opacity-70"}`}>{tab.icon}</span>
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 pb-24">
                    {activeTab === "overview" && (
                        <div className="space-y-8 animate-in fade-in duration-300">
                            <h2 className="text-2xl font-bold text-slate-900 border-b border-slate-100 pb-2">What is 402check?</h2>
                            <p className="text-slate-600 leading-relaxed">
                                402check is a payment confirmation system that lets you control access to your
                                client web app projects based on their payment status. When a client&apos;s payment
                                is overdue, their web application is automatically blocked with a professional
                                &ldquo;Payment Required&rdquo; page.
                            </p>

                            <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 my-6">
                                <strong className="flex items-center gap-2 text-blue-900 font-bold mb-2">How It Works</strong>
                                <p className="text-blue-800 text-sm leading-relaxed mb-0">
                                    Each project gets a unique API key. Clients embed a lightweight script in their
                                    web app that checks the payment status on every page load. If the status is
                                    <code className="bg-blue-100 px-1.5 py-0.5 rounded text-blue-900 ml-1 font-mono text-xs">DEFAULTED</code>, the system blocks the application.
                                </p>
                            </div>

                            <h3 className="text-xl font-bold text-slate-900 mt-10 mb-4 border-b border-slate-100 pb-2">Payment Statuses</h3>
                            <div className="grid sm:grid-cols-3 gap-4 mb-8">
                                <div className="bg-teal-50/50 border border-teal-100 rounded-xl p-5">
                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-teal-100 text-teal-800 border border-teal-200 mb-3"><span className="w-1.5 h-1.5 rounded-full bg-teal-500" />COMPLETED</span>
                                    <p className="text-slate-600 text-sm leading-relaxed">Payment received. The client&apos;s web app loads and functions normally.</p>
                                </div>
                                <div className="bg-amber-50/50 border border-amber-100 rounded-xl p-5">
                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200 mb-3"><span className="w-1.5 h-1.5 rounded-full bg-amber-500" />PENDING</span>
                                    <p className="text-slate-600 text-sm leading-relaxed">Payment awaiting. The client&apos;s web app still loads normally as a grace period.</p>
                                </div>
                                <div className="bg-red-50/50 border border-red-100 rounded-xl p-5">
                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-red-100 text-red-800 border border-red-200 mb-3"><span className="w-1.5 h-1.5 rounded-full bg-red-500" />DEFAULTED</span>
                                    <p className="text-slate-600 text-sm leading-relaxed">Payment overdue. The client&apos;s web app is <strong className="text-red-700 font-bold">blocked</strong> with a payment required page.</p>
                                </div>
                            </div>

                            <h3 className="text-xl font-bold text-slate-900 mt-10 mb-6 border-b border-slate-100 pb-2">Architecture</h3>
                            <div className="space-y-4 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent">
                                <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                                    <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-slate-900 text-white font-bold text-sm shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">1</div>
                                    <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                                        <strong className="block text-slate-900 font-bold mb-1">Create Project</strong>
                                        <p className="text-slate-600 text-sm">Add a new project in the dashboard. An API key is auto-generated.</p>
                                    </div>
                                </div>
                                <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                                    <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-slate-100 text-slate-500 font-bold text-sm shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">2</div>
                                    <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                                        <strong className="block text-slate-900 font-bold mb-1">Embed Script</strong>
                                        <p className="text-slate-600 text-sm">Add the 402check script tag to your client&apos;s web app with their API key.</p>
                                    </div>
                                </div>
                                <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                                    <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-slate-100 text-slate-500 font-bold text-sm shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">3</div>
                                    <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                                        <strong className="block text-slate-900 font-bold mb-1">Automatic Check</strong>
                                        <p className="text-slate-600 text-sm">On every page load, the script calls the 402check API to verify payment status.</p>
                                    </div>
                                </div>
                                <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                                    <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-slate-100 text-slate-500 font-bold text-sm shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">4</div>
                                    <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-slate-800 p-5 rounded-xl border border-slate-700 shadow-sm">
                                        <strong className="block text-white font-bold mb-1">Enforce Payment</strong>
                                        <p className="text-slate-400 text-sm">If status is DEFAULTED, the page is replaced with a &ldquo;Payment Required&rdquo; notice.</p>
                                    </div>
                                </div>
                            </div>

                            <h3 className="text-xl font-bold text-slate-900 mt-10 mb-4 border-b border-slate-100 pb-2">API Endpoint</h3>
                            <p className="text-slate-600 mb-4">The public API endpoint that the SDK calls:</p>
                            <CodeBlock
                                id="api-endpoint"
                                language="http"
                                code={`GET ${serverUrl}/api/check-status?key=YOUR_API_KEY

Response (200):
{
  "status": "COMPLETED" | "PENDING" | "DEFAULTED",
  "project": "Project Name",
  "client": "Client Name"
}`}
                                onCopy={copyCode}
                                copied={copiedId}
                            />

                            <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 my-8">
                                <strong className="flex items-center gap-2 text-amber-900 font-bold mb-2">Fail-Open Design</strong>
                                <p className="text-amber-800 text-sm leading-relaxed mb-0">
                                    If the 402check server is unreachable (network error, server down), the client
                                    app will <strong className="font-bold">continue working normally</strong>. This prevents false blocks
                                    due to infrastructure issues.
                                </p>
                            </div>
                        </div>
                    )}

                    {activeTab === "html" && (
                        <div className="docs-section">
                            <h2>🌐 HTML / Vanilla JavaScript</h2>
                            <p>The simplest integration. Just add a single script tag to your HTML file.</p>

                            <h3>Step 1: Add the Script Tag</h3>
                            <p>
                                Place this script tag in the <code>&lt;head&gt;</code> or at the beginning of{" "}
                                <code>&lt;body&gt;</code> of your HTML file. It should load <strong>before</strong>{" "}
                                any other application scripts.
                            </p>
                            <CodeBlock
                                id="html-basic"
                                language="html"
                                code={`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>My Client App</title>
  
  <!-- 402check: Add this BEFORE other scripts -->
  <script src="${serverUrl}/sdk/402check.js" 
    data-api-key="YOUR_API_KEY"
    data-server="${serverUrl}">
  </script>
</head>
<body>
  <h1>My Application</h1>
  <!-- Your app content -->
</body>
</html>`}
                                onCopy={copyCode}
                                copied={copiedId}
                            />

                            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5 mt-6">
                                <strong className="flex items-center gap-2 text-emerald-900 font-bold mb-2">That&apos;s it!</strong>
                                <p className="text-emerald-800 text-sm leading-relaxed mb-0">No build tools, no npm packages, no configuration files. Just one script tag.</p>
                            </div>
                        </div>
                    )}

                    {activeTab === "nextjs" && (
                        <div className="docs-section">
                            <h2>▲ Next.js Integration</h2>
                            <p>For Next.js apps (both App Router and Pages Router).</p>

                            <h3>Option A: Script Component (Recommended)</h3>
                            <p>
                                Use Next.js&apos;s built-in <code>Script</code> component for optimized loading.
                            </p>

                            <h4>App Router (<code>app/layout.tsx</code>)</h4>
                            <CodeBlock
                                id="nextjs-app"
                                language="tsx"
                                code={`import Script from "next/script";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {/* 402check Payment Check */}
        <Script 
          src="${serverUrl}/sdk/402check.js"
          data-api-key="YOUR_API_KEY"
          data-server="${serverUrl}"
          strategy="beforeInteractive"
        />
        {children}
      </body>
    </html>
  );
}`}
                                onCopy={copyCode}
                                copied={copiedId}
                            />

                            <h4>Pages Router (<code>pages/_app.tsx</code>)</h4>
                            <CodeBlock
                                id="nextjs-pages"
                                language="tsx"
                                code={`import type { AppProps } from "next/app";
import Script from "next/script";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Script 
        src="${serverUrl}/sdk/402check.js"
        data-api-key="YOUR_API_KEY"
        data-server="${serverUrl}"
        strategy="beforeInteractive"
      />
      <Component {...pageProps} />
    </>
  );
}`}
                                onCopy={copyCode}
                                copied={copiedId}
                            />

                            <h3>Option B: Environment Variable for API Key</h3>
                            <p>Keep the API key in your environment variables for cleaner code:</p>
                            <CodeBlock
                                id="nextjs-env"
                                language="bash"
                                code={`# .env.local
NEXT_PUBLIC_402CHECK_KEY=YOUR_API_KEY
NEXT_PUBLIC_402CHECK_SERVER=${serverUrl}`}
                                onCopy={copyCode}
                                copied={copiedId}
                            />
                            <CodeBlock
                                id="nextjs-env-usage"
                                language="tsx"
                                code={`<Script 
  src={\`\${process.env.NEXT_PUBLIC_402CHECK_SERVER}/sdk/402check.js\`}
  data-api-key={process.env.NEXT_PUBLIC_402CHECK_KEY}
  data-server={process.env.NEXT_PUBLIC_402CHECK_SERVER}
  strategy="beforeInteractive"
/>`}
                                onCopy={copyCode}
                                copied={copiedId}
                            />

                            <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 mt-6">
                                <strong className="flex items-center gap-2 text-blue-900 font-bold mb-2">Why <code className="bg-blue-100 px-1.5 py-0.5 rounded text-blue-900 font-mono text-xs">beforeInteractive</code>?</strong>
                                <p className="text-blue-800 text-sm leading-relaxed mb-0">
                                    This strategy ensures the payment check runs before the page hydrates,
                                    so the block page appears instantly if payment is defaulted.
                                </p>
                            </div>
                        </div>
                    )}

                    {activeTab === "react" && (
                        <div className="docs-section">
                            <h2>⚛️ React (Vite / Create React App)</h2>
                            <p>For React apps built with Vite, CRA, or any other bundler.</p>

                            <h3>Option A: Add to <code>index.html</code> (Simplest)</h3>
                            <p>Add the script tag directly to your <code>public/index.html</code> (CRA) or <code>index.html</code> (Vite):</p>
                            <CodeBlock
                                id="react-html"
                                language="html"
                                code={`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>My React App</title>

  <!-- 402check: Add BEFORE the root div -->
  <script src="${serverUrl}/sdk/402check.js" 
    data-api-key="YOUR_API_KEY"
    data-server="${serverUrl}">
  </script>
</head>
<body>
  <div id="root"></div>
  <script type="module" src="/src/main.tsx"></script>
</body>
</html>`}
                                onCopy={copyCode}
                                copied={copiedId}
                            />

                            <h3>Option B: useEffect Hook</h3>
                            <p>Dynamically load the script in your root component:</p>
                            <CodeBlock
                                id="react-hook"
                                language="tsx"
                                code={`// src/App.tsx
import { useEffect } from "react";

function App() {
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "${serverUrl}/sdk/402check.js";
    script.setAttribute("data-api-key", "YOUR_API_KEY");
    script.setAttribute("data-server", "${serverUrl}");
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, []);

  return (
    <div className="App">
      {/* Your app content */}
    </div>
  );
}

export default App;`}
                                onCopy={copyCode}
                                copied={copiedId}
                            />

                            <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 mt-6">
                                <strong className="flex items-center gap-2 text-blue-900 font-bold mb-2">Recommendation</strong>
                                <p className="text-blue-800 text-sm leading-relaxed mb-0">
                                    Option A (<code className="bg-blue-100 px-1.5 py-0.5 rounded text-blue-900 font-mono text-xs">index.html</code>) is preferred because it runs before React
                                    initializes, ensuring the block page appears immediately.
                                </p>
                            </div>
                        </div>
                    )}

                    {activeTab === "vue" && (
                        <div className="docs-section">
                            <h2>💚 Vue.js Integration</h2>
                            <p>For Vue 3 apps (Vite or Vue CLI).</p>

                            <h3>Option A: Add to <code>index.html</code></h3>
                            <CodeBlock
                                id="vue-html"
                                language="html"
                                code={`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>My Vue App</title>

  <!-- 402check -->
  <script src="${serverUrl}/sdk/402check.js" 
    data-api-key="YOUR_API_KEY"
    data-server="${serverUrl}">
  </script>
</head>
<body>
  <div id="app"></div>
  <script type="module" src="/src/main.ts"></script>
</body>
</html>`}
                                onCopy={copyCode}
                                copied={copiedId}
                            />

                            <h3>Option B: Vue Plugin</h3>
                            <p>Create a plugin that loads the script on app initialization:</p>
                            <CodeBlock
                                id="vue-plugin"
                                language="typescript"
                                code={`// src/plugins/402check.ts
import type { Plugin } from "vue";

export const Check402Plugin: Plugin = {
  install() {
    const script = document.createElement("script");
    script.src = "${serverUrl}/sdk/402check.js";
    script.setAttribute("data-api-key", "YOUR_API_KEY");
    script.setAttribute("data-server", "${serverUrl}");
    document.head.appendChild(script);
  },
};

// src/main.ts
import { createApp } from "vue";
import App from "./App.vue";
import { Check402Plugin } from "./plugins/402check";

const app = createApp(App);
app.use(Check402Plugin);
app.mount("#app");`}
                                onCopy={copyCode}
                                copied={copiedId}
                            />
                        </div>
                    )}

                    {activeTab === "angular" && (
                        <div className="docs-section">
                            <h2>🅰️ Angular Integration</h2>
                            <p>For Angular apps (v14+).</p>

                            <h3>Option A: Add to <code>index.html</code></h3>
                            <CodeBlock
                                id="angular-html"
                                language="html"
                                code={`<!-- src/index.html -->
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>My Angular App</title>
  <base href="/">

  <!-- 402check -->
  <script src="${serverUrl}/sdk/402check.js" 
    data-api-key="YOUR_API_KEY"
    data-server="${serverUrl}">
  </script>
</head>
<body>
  <app-root></app-root>
</body>
</html>`}
                                onCopy={copyCode}
                                copied={copiedId}
                            />

                            <h3>Option B: Angular Service</h3>
                            <p>Create a service with <code>APP_INITIALIZER</code> for more control:</p>
                            <CodeBlock
                                id="angular-service"
                                language="typescript"
                                code={`// src/app/services/402check.service.ts
import { Injectable } from "@angular/core";

@Injectable({ providedIn: "root" })
export class Check402Service {
  init(): Promise<void> {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "${serverUrl}/sdk/402check.js";
      script.setAttribute("data-api-key", "YOUR_API_KEY");
      script.setAttribute("data-server", "${serverUrl}");
      script.onload = () => resolve();
      script.onerror = () => resolve(); // Fail open
      document.head.appendChild(script);
    });
  }
}

// src/app/app.config.ts
import { ApplicationConfig, APP_INITIALIZER } from "@angular/core";
import { Check402Service } from "./services/402check.service";

export const appConfig: ApplicationConfig = {
  providers: [
    {
      provide: APP_INITIALIZER,
      useFactory: (pg: Check402Service) => () => pg.init(),
      deps: [Check402Service],
      multi: true,
    },
  ],
};`}
                                onCopy={copyCode}
                                copied={copiedId}
                            />
                        </div>
                    )}

                    {activeTab === "laravel" && (
                        <div className="docs-section">
                            <h2>🔴 Laravel Integration</h2>
                            <p>For Laravel apps using Blade templates or Inertia.js.</p>

                            <h3>Option A: Blade Layout</h3>
                            <p>Add the script tag to your main Blade layout file:</p>
                            <CodeBlock
                                id="laravel-blade"
                                language="php"
                                code={`{{-- resources/views/layouts/app.blade.php --}}
<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>{{ config('app.name') }}</title>

    <!-- 402check -->
    <script src="${serverUrl}/sdk/402check.js" 
      data-api-key="{{ config('services.402check.key') }}"
      data-server="${serverUrl}">
    </script>

    @vite(['resources/css/app.css', 'resources/js/app.js'])
</head>
<body>
    @yield('content')
</body>
</html>`}
                                onCopy={copyCode}
                                copied={copiedId}
                            />

                            <h3>Config Setup</h3>
                            <CodeBlock
                                id="laravel-config"
                                language="php"
                                code={`// .env
CHECK402_API_KEY=YOUR_API_KEY

// config/services.php
return [
    // ... other services
    '402check' => [
        'key' => env('CHECK402_API_KEY'),
    ],
];`}
                                onCopy={copyCode}
                                copied={copiedId}
                            />

                            <h3>Option B: Inertia.js (Vue/React)</h3>
                            <p>If using Inertia.js, add it to the <code>app.blade.php</code> the same way:</p>
                            <CodeBlock
                                id="laravel-inertia"
                                language="php"
                                code={`{{-- resources/views/app.blade.php --}}
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />

    <!-- 402check: BEFORE Inertia scripts -->
    <script src="${serverUrl}/sdk/402check.js" 
      data-api-key="{{ config('services.402check.key') }}"
      data-server="${serverUrl}">
    </script>

    @viteReactRefresh
    @vite(['resources/js/app.tsx'])
    @inertiaHead
</head>
<body>
    @inertia
</body>
</html>`}
                                onCopy={copyCode}
                                copied={copiedId}
                            />

                            <h3>Option C: Server-Side Middleware</h3>
                            <p>For stronger enforcement, add a Laravel middleware that checks status server-side:</p>
                            <CodeBlock
                                id="laravel-middleware"
                                language="php"
                                code={`<?php
// app/Http/Middleware/Check402.php
namespace App\\Http\\Middleware;

use Closure;
use Illuminate\\Http\\Request;
use Illuminate\\Support\\Facades\\Http;
use Illuminate\\Support\\Facades\\Cache;

class Check402
{
    public function handle(Request $request, Closure $next)
    {
        $status = Cache::remember('402check_status', 300, function () {
            $response = Http::timeout(5)->get('${serverUrl}/api/check-status', [
                'key' => config('services.402check.key'),
            ]);
            return $response->ok() ? $response->json('status') : 'COMPLETED';
        });

        if ($status === 'DEFAULTED') {
            return response()->view('payment-required', [], 503);
        }

        return $next($request);
    }
}`}
                                onCopy={copyCode}
                                copied={copiedId}
                            />
                            <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 mt-6">
                                <strong className="flex items-center gap-2 text-blue-900 font-bold mb-2">Server-side is stronger</strong>
                                <p className="text-blue-800 text-sm leading-relaxed mb-0">
                                    The client-side SDK can be bypassed by tech-savvy users disabling JavaScript.
                                    The Laravel middleware approach blocks requests at the server level.
                                    Use both for maximum enforcement.
                                </p>
                            </div>
                        </div>
                    )}

                    {activeTab === "django" && (
                        <div className="docs-section">
                            <h2>🐍 Django Integration</h2>
                            <p>For Django apps with templates or Django REST Framework + SPA.</p>

                            <h3>Option A: Base Template</h3>
                            <CodeBlock
                                id="django-template"
                                language="html"
                                code={`{# templates/base.html #}
{% load static %}
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>{% block title %}My App{% endblock %}</title>

    <!-- 402check -->
    <script src="${serverUrl}/sdk/402check.js" 
      data-api-key="{{ CHECK402_API_KEY }}"
      data-server="${serverUrl}">
    </script>
</head>
<body>
    {% block content %}{% endblock %}
</body>
</html>`}
                                onCopy={copyCode}
                                copied={copiedId}
                            />

                            <h3>Option B: Django Middleware</h3>
                            <CodeBlock
                                id="django-middleware"
                                language="python"
                                code={`# middleware/402check.py
import requests
from django.conf import settings
from django.core.cache import cache
from django.http import HttpResponse
from django.template.loader import render_to_string

class Check402Middleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        status = cache.get("402check_status")
        
        if status is None:
            try:
                resp = requests.get(
                    f"${serverUrl}/api/check-status",
                    params={"key": settings.CHECK402_API_KEY},
                    timeout=5,
                )
                status = resp.json().get("status", "COMPLETED")
            except Exception:
                status = "COMPLETED"  # Fail open
            cache.set("402check_status", status, 300)

        if status == "DEFAULTED":
            html = render_to_string("payment_required.html")
            return HttpResponse(html, status=503)

        return self.get_response(request)

# settings.py
CHECK402_API_KEY = os.environ.get("CHECK402_API_KEY", "")
MIDDLEWARE = [
    "middleware.402check.Check402Middleware",
    # ... other middleware
]`}
                                onCopy={copyCode}
                                copied={copiedId}
                            />
                        </div>
                    )}

                    {activeTab === "rails" && (
                        <div className="docs-section">
                            <h2>💎 Ruby on Rails Integration</h2>
                            <p>For Rails apps with ERB templates.</p>

                            <h3>Option A: Application Layout</h3>
                            <CodeBlock
                                id="rails-layout"
                                language="erb"
                                code={`<%# app/views/layouts/application.html.erb %>
<!DOCTYPE html>
<html>
<head>
  <title>My Rails App</title>
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <%= csrf_meta_tags %>
  <%= csp_meta_tag %>

  <!-- 402check -->
  <script src="${serverUrl}/sdk/402check.js" 
    data-api-key="<%= ENV['CHECK402_API_KEY'] %>"
    data-server="${serverUrl}">
  </script>

  <%= stylesheet_link_tag "application" %>
  <%= javascript_include_tag "application", defer: true %>
</head>
<body>
  <%= yield %>
</body>
</html>`}
                                onCopy={copyCode}
                                copied={copiedId}
                            />

                            <h3>Option B: Rails Middleware</h3>
                            <CodeBlock
                                id="rails-middleware"
                                language="ruby"
                                code={`# lib/middleware/check_402.rb
require "net/http"
require "json"

class Check402
  def initialize(app)
    @app = app
    @cache = {}
    @cache_ttl = 300
  end

  def call(env)
    status = check_status
    
    if status == "DEFAULTED"
      [503, { "Content-Type" => "text/html" },
       [File.read(Rails.root.join("public", "payment_required.html"))]]
    else
      @app.call(env)
    end
  end

  private

  def check_status
    if @cache[:expires_at].nil? || Time.now > @cache[:expires_at]
      uri = URI("${serverUrl}/api/check-status")
      uri.query = URI.encode_www_form(key: ENV["CHECK402_API_KEY"])
      response = Net::HTTP.get_response(uri)
      @cache[:status] = JSON.parse(response.body)["status"] rescue "COMPLETED"
      @cache[:expires_at] = Time.now + @cache_ttl
    end
    @cache[:status]
  rescue
    "COMPLETED" # Fail open
  end
end

# config/application.rb
config.middleware.insert_before 0, Check402`}
                                onCopy={copyCode}
                                copied={copiedId}
                            />
                        </div>
                    )}

                    {activeTab === "wordpress" && (
                        <div className="docs-section">
                            <h2>📝 WordPress Integration</h2>
                            <p>For WordPress sites (themes or plugins).</p>

                            <h3>Option A: functions.php</h3>
                            <p>Add this to your theme&apos;s <code>functions.php</code>:</p>
                            <CodeBlock
                                id="wp-functions"
                                language="php"
                                code={`<?php
// functions.php

function check402_enqueue_script() {
    wp_enqueue_script(
        '402check',
        '${serverUrl}/sdk/402check.js',
        array(),
        null,
        false // Load in <head>, not footer
    );
    
    // Add data attributes
    wp_script_add_data('402check', 'data-api-key', 'YOUR_API_KEY');
}
add_action('wp_enqueue_scripts', 'check402_enqueue_script');

// Since wp_enqueue_script doesn't support data- attributes,
// use script_loader_tag filter:
function check402_add_attributes($tag, $handle) {
    if ($handle !== '402check') return $tag;
    
    return str_replace(
        '<script ',
        '<script data-api-key="YOUR_API_KEY" data-server="${serverUrl}" ',
        $tag
    );
}
add_filter('script_loader_tag', 'check402_add_attributes', 10, 2);`}
                                onCopy={copyCode}
                                copied={copiedId}
                            />

                            <h3>Option B: Simple Header Injection</h3>
                            <p>If you prefer simplicity, add it directly to your theme&apos;s header:</p>
                            <CodeBlock
                                id="wp-header"
                                language="php"
                                code={`<?php // header.php — add inside <head> ?>

<script src="${serverUrl}/sdk/402check.js" 
  data-api-key="YOUR_API_KEY"
  data-server="${serverUrl}">
</script>`}
                                onCopy={copyCode}
                                copied={copiedId}
                            />

                            <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 mt-6">
                                <strong className="flex items-center gap-2 text-blue-900 font-bold mb-2">Plugin-based injection</strong>
                                <p className="text-blue-800 text-sm leading-relaxed mb-0">
                                    You can also use plugins like &ldquo;Insert Headers and Footers&rdquo; to add
                                    the script tag without modifying theme files.
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}

/* ========== Code Block Component ========== */
function CodeBlock({
    id,
    language,
    code,
    onCopy,
    copied,
}: {
    id: string;
    language: string;
    code: string;
    onCopy: (code: string, id: string) => void;
    copied: string | null;
}) {
    return (
        <div className="relative group rounded-xl overflow-hidden bg-[#0f172a] border border-slate-800 my-4 shadow-sm w-full">
            <div className="flex items-center justify-between px-4 py-2 bg-[#1e293b] border-b border-slate-700/50">
                <span className="text-xs font-mono font-medium text-slate-400 tracking-wider lowercase">{language}</span>
                <button
                    onClick={() => onCopy(code, id)}
                    className="text-slate-400 hover:text-white transition-colors bg-white/5 hover:bg-white/10 px-2.5 py-1 rounded-md text-xs font-medium flex items-center gap-1.5"
                >
                    {copied === id ? (
                        <><span className="text-teal-400">✓</span> Copied!</>
                    ) : (
                        <>Copy</>
                    )}
                </button>
            </div>
            <pre className="p-4 overflow-x-auto text-sm font-mono leading-relaxed text-slate-300">
                <code>{code}</code>
            </pre>
        </div>
    );
}
