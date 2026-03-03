"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { BookOpen, Globe, Triangle, Heart, Box, Circle, Hexagon, Diamond, FileText, Zap, CheckCircle2, Clock, Ban, ArrowRight } from "lucide-react";

type Framework = "overview" | "html" | "nextjs" | "react" | "vue" | "angular" | "laravel" | "django" | "rails" | "wordpress";

const tabs: { id: Framework; label: string; icon: React.ReactNode }[] = [
    { id: "overview", label: "Overview", icon: <BookOpen size={18} /> },
    { id: "html", label: "HTML / JS", icon: <Globe size={18} /> },
    { id: "nextjs", label: "Next.js", icon: <Triangle size={18} /> },
    { id: "react", label: "React", icon: <Box size={18} /> },
    { id: "vue", label: "Vue.js", icon: <Heart size={18} /> },
    { id: "angular", label: "Angular", icon: <Hexagon size={18} /> },
    { id: "laravel", label: "Laravel", icon: <Circle size={18} fill="currentColor" /> },
    { id: "django", label: "Django", icon: <Circle size={18} /> },
    { id: "rails", label: "Rails", icon: <Diamond size={18} /> },
    { id: "wordpress", label: "WordPress", icon: <FileText size={18} /> },
];

function CodeBlock({ id, lang, code, copiedId, onCopy }: { id: string; lang: string; code: string; copiedId: string | null; onCopy: (c: string, i: string) => void }) {
    return (
        <div className="my-6 rounded-2xl overflow-hidden shadow-sm border border-slate-800 bg-slate-900 text-slate-300">
            <div className="flex items-center justify-between px-4 py-2 bg-slate-950/50 border-b border-slate-800">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{lang}</span>
                <button
                    className="text-xs font-bold text-teal-400 hover:text-teal-300 transition-colors bg-teal-500/10 hover:bg-teal-500/20 px-2.5 py-1 rounded-md"
                    onClick={() => onCopy(code, id)}
                >
                    {copiedId === id ? "✓ Copied!" : "Copy"}
                </button>
            </div>
            <pre className="p-4 overflow-x-auto text-sm font-mono leading-loose m-0 text-teal-50"><code>{code}</code></pre>
        </div>
    );
}

export default function DocsPage() {
    const [active, setActive] = useState<Framework>("overview");
    const [copiedId, setCopiedId] = useState<string | null>(null);
    const [scrolled, setScrolled] = useState(false);
    const server = typeof window !== "undefined" ? window.location.origin : "https://check402.com";

    useEffect(() => {
        const h = () => setScrolled(window.scrollY > 10);
        window.addEventListener("scroll", h);
        return () => window.removeEventListener("scroll", h);
    }, []);

    const copy = (code: string, id: string) => {
        navigator.clipboard.writeText(code);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-teal-100 selection:text-teal-900">
            {/* Navigation */}
            <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "bg-white/80 backdrop-blur-md shadow-sm border-b border-slate-200" : "bg-white/80 backdrop-blur-md border-b border-slate-200"}`}>
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2 group">
                        <img src="/logo.png" alt="check402" className="h-6 w-auto group-hover:opacity-80 transition-opacity" />
                        <span className="text-lg font-extrabold tracking-tight">
                            <span className="text-teal-500">Check</span> <span className="text-slate-900">402</span>
                        </span>
                    </Link>
                    <div className="hidden md:flex items-center gap-8">
                        <Link href="/#features" className="text-sm font-bold text-slate-500 hover:text-slate-900 transition-colors">Features</Link>
                        <Link href="/docs" className="text-sm font-bold text-teal-600">Documentation</Link>
                    </div>
                    <div className="flex items-center gap-4">
                        <Link href="/login" className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-sm font-bold rounded-lg shadow-sm transition-all">
                            Dashboard →
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Docs Layout */}
            <div className="pt-24 pb-20 max-w-7xl mx-auto px-6 flex flex-col md:flex-row gap-8 relative items-start">

                {/* Sidebar */}
                <aside className="w-full md:w-64 flex-shrink-0 md:sticky md:top-24 space-y-1">
                    <div className="px-3 pb-3 mb-2 border-b border-slate-200">
                        <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-widest">Integration Guides</h3>
                    </div>
                    {tabs.map((t) => (
                        <button
                            key={t.id}
                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-bold text-sm transition-all ${active === t.id ? "bg-white text-teal-600 shadow-sm border border-slate-200" : "text-slate-500 hover:bg-slate-200/50 hover:text-slate-900 border border-transparent"}`}
                            onClick={() => setActive(t.id)}
                        >
                            <span className={active === t.id ? "text-teal-500" : "text-slate-400"}>{t.icon}</span>
                            {t.label}
                        </button>
                    ))}
                </aside>

                {/* Content */}
                <main className="flex-1 bg-white p-8 sm:p-12 rounded-3xl border border-slate-200 shadow-sm w-full prose prose-slate max-w-none prose-headings:font-extrabold prose-h1:text-4xl prose-h1:tracking-tight prose-h1:mb-6 prose-h2:text-2xl prose-h2:mt-12 prose-h3:text-xl prose-a:text-teal-600 prose-a:no-underline hover:prose-a:underline prose-code:text-teal-600 prose-code:bg-teal-50 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md prose-code:before:content-none prose-code:after:content-none">
                    {active === "overview" && <Overview server={server} copiedId={copiedId} copy={copy} />}
                    {active === "html" && <HtmlGuide server={server} copiedId={copiedId} copy={copy} />}
                    {active === "nextjs" && <NextjsGuide server={server} copiedId={copiedId} copy={copy} />}
                    {active === "react" && <ReactGuide server={server} copiedId={copiedId} copy={copy} />}
                    {active === "vue" && <VueGuide server={server} copiedId={copiedId} copy={copy} />}
                    {active === "angular" && <AngularGuide server={server} copiedId={copiedId} copy={copy} />}
                    {active === "laravel" && <LaravelGuide server={server} copiedId={copiedId} copy={copy} />}
                    {active === "django" && <DjangoGuide server={server} copiedId={copiedId} copy={copy} />}
                    {active === "rails" && <RailsGuide server={server} copiedId={copiedId} copy={copy} />}
                    {active === "wordpress" && <WordPressGuide server={server} copiedId={copiedId} copy={copy} />}
                </main>
            </div>
        </div>
    );
}

/* ========== SECTION COMPONENTS ========== */

type GuideProps = { server: string; copiedId: string | null; copy: (c: string, i: string) => void };

function Callout({ type, title, children }: { type: 'info' | 'warning' | 'success', title: string, children: React.ReactNode }) {
    const styles = {
        info: "bg-blue-50 border-blue-100 text-blue-800",
        warning: "bg-amber-50 border-amber-100 text-amber-800",
        success: "bg-teal-50 border-teal-100 text-teal-800"
    };
    return (
        <div className={`p-5 my-6 border rounded-2xl ${styles[type]}`}>
            <h4 className="font-extrabold text-base mb-1 flex items-center gap-2">{title}</h4>
            <div className="text-sm font-medium leading-relaxed opacity-90">{children}</div>
        </div>
    );
}

function Overview({ server, copiedId, copy }: GuideProps) {
    return (
        <>
            <h1>Check 402 Documentation</h1>
            <p className="text-lg text-slate-500 font-medium lead">
                Learn how to integrate Check 402 into your client web applications.
                Check 402 is a payment enforcement system that blocks access to web apps
                when payment is overdue.
            </p>

            <h2>How It Works</h2>
            <p>
                Each project gets a unique API key. Your client's web app includes a
                lightweight script that calls the Check 402 API on every page load. If the
                payment status is <code>DEFAULTED</code>, the page is replaced with a
                "Payment Required" notice.
            </p>

            <h2>Payment Statuses</h2>
            <div className="grid sm:grid-cols-3 gap-4 my-8 not-prose">
                <div className="p-5 rounded-2xl border border-teal-200 bg-teal-50 text-teal-900 shadow-sm">
                    <div className="font-extrabold flex items-center gap-2 mb-2"><CheckCircle2 className="text-teal-500" size={18} /> Completed</div>
                    <p className="text-sm font-medium text-teal-700/80">Payment received. App loads normally.</p>
                </div>
                <div className="p-5 rounded-2xl border border-amber-200 bg-amber-50 text-amber-900 shadow-sm">
                    <div className="font-extrabold flex items-center gap-2 mb-2"><Clock className="text-amber-500" size={18} /> Pending</div>
                    <p className="text-sm font-medium text-amber-700/80">Awaiting payment. App loads normally (grace period).</p>
                </div>
                <div className="p-5 rounded-2xl border border-red-200 bg-red-50 text-red-900 shadow-sm">
                    <div className="font-extrabold flex items-center gap-2 mb-2"><Ban className="text-red-500" size={18} /> Defaulted</div>
                    <p className="text-sm font-medium text-red-700/80">Payment overdue. App is visually blocked.</p>
                </div>
            </div>

            <h2>API Reference</h2>
            <p>The public status endpoint that the SDK calls:</p>
            <CodeBlock id="api-ref" lang="http" copiedId={copiedId} onCopy={copy} code={`GET ${server}/api/check-status?key=YOUR_API_KEY

Response (200 OK):
{
  "status": "COMPLETED" | "PENDING" | "DEFAULTED",
  "project": "Project Name",
  "client": "Client Name"
}`} />

            <Callout type="info" title="Fail-Open Design">
                <p>If Check 402 is unreachable, client apps continue working. No false blocks from server issues.</p>
            </Callout>

            <p className="font-medium text-slate-500 mt-10">
                Select a framework from the sidebar for detailed, platform-specific guides.
            </p>

            <div className="mt-12 pt-8 border-t border-slate-100 flex flex-col sm:flex-row gap-4 items-center justify-between">
                <div className="text-sm font-bold text-slate-400 uppercase tracking-widest">Next Steps</div>
                <div className="flex gap-4">
                    <button onClick={() => setActive("html")} className="flex items-center gap-2 text-teal-600 hover:text-teal-700 font-bold text-sm bg-teal-50 px-4 py-2 rounded-xl border border-teal-100 transition-all">
                        HTML Guide <ArrowRight size={16} />
                    </button>
                    <button onClick={() => setActive("nextjs")} className="flex items-center gap-2 text-slate-600 hover:text-slate-900 font-bold text-sm bg-slate-100 px-4 py-2 rounded-xl border border-slate-200 transition-all">
                        Next.js Guide <ArrowRight size={16} />
                    </button>
                </div>
            </div>
        </>
    );
}

function HtmlGuide({ server, copiedId, copy }: GuideProps) {
    return (
        <>
            <h1 className="flex items-center gap-3"><Globe className="text-slate-400" size={32} /> HTML / Vanilla JS</h1>
            <p className="text-lg text-slate-500 font-medium">The simplest integration — just one script tag. No build tools required.</p>

            <h2>Add the Script Tag</h2>
            <p>Place this in the <code>&lt;head&gt;</code> of your HTML file, before any other scripts:</p>
            <CodeBlock id="html-full" lang="html" copiedId={copiedId} onCopy={copy} code={`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>My Client App</title>
  
  <!-- Check 402 -->
  <script src="${server}/sdk/check402.js" 
    data-api-key="YOUR_API_KEY"
    data-server="${server}">
  </script>
</head>
<body>
  <h1>My Application</h1>
</body>
</html>`} />

            <Callout type="success" title="That's it!">
                <p>No npm packages, no build configuration, no extra files. One script tag handles everything. This is the ideal way to enforce payments on static sites or simple client handoffs.</p>
            </Callout>

            <div className="mt-12 pt-8 border-t border-slate-100 flex flex-col sm:flex-row gap-4 items-center justify-between">
                <div className="text-sm font-bold text-slate-400 uppercase tracking-widest">Next Steps</div>
                <div className="flex gap-4">
                    <button onClick={() => setActive("react")} className="flex items-center gap-2 text-teal-600 hover:text-teal-700 font-bold text-sm bg-teal-50 px-4 py-2 rounded-xl border border-teal-100 transition-all">
                        React Guide <ArrowRight size={16} />
                    </button>
                    <button onClick={() => setActive("overview")} className="flex items-center gap-2 text-slate-600 hover:text-slate-900 font-bold text-sm bg-slate-100 px-4 py-2 rounded-xl border border-slate-200 transition-all">
                        Back to Overview <ArrowRight size={16} />
                    </button>
                </div>
            </div>
        </>
    );
}

function NextjsGuide({ server, copiedId, copy }: GuideProps) {
    return (
        <>
            <h1 className="flex items-center gap-3"><Triangle className="text-slate-900" size={32} fill="currentColor" /> Next.js Integration</h1>
            <p className="text-lg text-slate-500 font-medium">For Next.js apps using the App Router or Pages Router.</p>

            <h2>App Router</h2>
            <p>Add the Script component to your <code>app/layout.tsx</code>.</p>
            <CodeBlock id="nx-app" lang="tsx" copiedId={copiedId} onCopy={copy} code={`import Script from "next/script";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Script 
          src="${server}/sdk/check402.js"
          data-api-key="YOUR_API_KEY"
          data-server="${server}"
          strategy="beforeInteractive"
        />
        {children}
      </body>
    </html>
  );
}`} />

            <h2>Pages Router</h2>
            <p>Add the Script component to your <code>pages/_app.tsx</code>.</p>
            <CodeBlock id="nx-pages" lang="tsx" copiedId={copiedId} onCopy={copy} code={`import type { AppProps } from "next/app";
import Script from "next/script";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Script 
        src="${server}/sdk/check402.js"
        data-api-key="YOUR_API_KEY"
        data-server="${server}"
        strategy="beforeInteractive"
      />
      <Component {...pageProps} />
    </>
  );
}`} />

            <h2>Environment Variables (Optional)</h2>
            <CodeBlock id="nx-env" lang="bash" copiedId={copiedId} onCopy={copy} code={`# .env.local
NEXT_PUBLIC_CHECK402_KEY=YOUR_API_KEY
NEXT_PUBLIC_CHECK402_SERVER=${server}`} />

            <Callout type="info" title="Why beforeInteractive?">
                <p>Using <code>strategy="beforeInteractive"</code> ensures the payment check runs before React hydrates, so the block page appears instantly without layout shift.</p>
            </Callout>
        </>
    );
}

function ReactGuide({ server, copiedId, copy }: GuideProps) {
    return (
        <>
            <h1 className="flex items-center gap-3"><Box className="text-blue-500" size={32} /> React (Vite / CRA)</h1>
            <p className="text-lg text-slate-500 font-medium">For React apps built with Vite, Create React App, or any other bundler.</p>

            <h2>Option A: index.html (Recommended)</h2>
            <p>Add the script tag directly to your main HTML file so it blocks rendering before React loads.</p>
            <CodeBlock id="react-html" lang="html" copiedId={copiedId} onCopy={copy} code={`<!-- index.html (Vite) or public/index.html (CRA) -->
<head>
  <script src="${server}/sdk/check402.js" 
    data-api-key="YOUR_API_KEY"
    data-server="${server}">
  </script>
</head>`} />

            <h2>Option B: useEffect Hook</h2>
            <p>If you prefer to inject it dynamically using JavaScript.</p>
            <CodeBlock id="react-hook" lang="tsx" copiedId={copiedId} onCopy={copy} code={`// src/App.tsx
import { useEffect } from "react";

function App() {
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "${server}/sdk/check402.js";
    script.setAttribute("data-api-key", "YOUR_API_KEY");
    script.setAttribute("data-server", "${server}");
    document.head.appendChild(script);
    
    return () => { document.head.removeChild(script); };
  }, []);

  return <div>Your App</div>;
}`} />

            <Callout type="success" title="Recommendation">
                <p>Option A is preferred — since it runs before React initializes, it ensures an instant block without seeing a flash of unstyled content.</p>
            </Callout>
        </>
    );
}

function VueGuide({ server, copiedId, copy }: GuideProps) {
    return (
        <>
            <h1 className="flex items-center gap-3"><Heart className="text-emerald-500" size={32} fill="currentColor" /> Vue.js Integration</h1>
            <p className="text-lg text-slate-500 font-medium">For Vue 3 apps (Vite or Vue CLI).</p>

            <h2>Add to <code>index.html</code></h2>
            <p>This is the simplest way to add the guard to a Vue SPA.</p>
            <CodeBlock id="vue-html" lang="html" copiedId={copiedId} onCopy={copy} code={`<head>
  <script src="${server}/sdk/check402.js" 
    data-api-key="YOUR_API_KEY"
    data-server="${server}">
  </script>
</head>`} />

            <h2>Vue Plugin (Alternative)</h2>
            <p>If you want to manage the implementation via a strict Vue Plugin.</p>
            <CodeBlock id="vue-plugin" lang="typescript" copiedId={copiedId} onCopy={copy} code={`// src/plugins/Check 402.ts
import type { Plugin } from "vue";

export const Check402Plugin: Plugin = {
  install() {
    const s = document.createElement("script");
    s.src = "${server}/sdk/check402.js";
    s.setAttribute("data-api-key", "YOUR_API_KEY");
    s.setAttribute("data-server", "${server}");
    document.head.appendChild(s);
  },
};

// src/main.ts
import { Check402Plugin } from "./plugins/Check 402";
app.use(Check402Plugin);`} />
        </>
    );
}

function AngularGuide({ server, copiedId, copy }: GuideProps) {
    return (
        <>
            <h1 className="flex items-center gap-3"><Hexagon className="text-red-600" size={32} fill="currentColor" /> Angular Integration</h1>
            <p className="text-lg text-slate-500 font-medium">For modern Angular single-page applications.</p>

            <h2>Add to <code>src/index.html</code></h2>
            <CodeBlock id="ng-html" lang="html" copiedId={copiedId} onCopy={copy} code={`<head>
  <script src="${server}/sdk/check402.js" 
    data-api-key="YOUR_API_KEY"
    data-server="${server}">
  </script>
</head>`} />

            <h2>APP_INITIALIZER Service</h2>
            <p>If you prefer native Angular service initialization.</p>
            <CodeBlock id="ng-svc" lang="typescript" copiedId={copiedId} onCopy={copy} code={`// Check 402.service.ts
import { Injectable } from "@angular/core";

@Injectable({ providedIn: "root" })
export class Check402Service {
  init(): Promise<void> {
    return new Promise((resolve) => {
      const s = document.createElement("script");
      s.src = "${server}/sdk/check402.js";
      s.setAttribute("data-api-key", "YOUR_API_KEY");
      s.setAttribute("data-server", "${server}");
      s.onload = () => resolve();
      s.onerror = () => resolve(); // Fail open
      document.head.appendChild(s);
    });
  }
}

// app.config.ts
import { APP_INITIALIZER } from "@angular/core";
import { Check402Service } from "./Check 402.service";

providers: [{
  provide: APP_INITIALIZER,
  useFactory: (pg: Check402Service) => () => pg.init(),
  deps: [Check402Service],
  multi: true,
}]`} />
        </>
    );
}

function LaravelGuide({ server, copiedId, copy }: GuideProps) {
    return (
        <>
            <h1 className="flex items-center gap-3"><Circle className="text-red-500" size={32} fill="currentColor" /> Laravel Integration</h1>
            <p className="text-lg text-slate-500 font-medium">For Laravel apps using Blade templates or Inertia.js.</p>

            <h2>Blade Layout</h2>
            <p>Insert the script into the main app layout so it applies to all pages.</p>
            <CodeBlock id="lv-blade" lang="php" copiedId={copiedId} onCopy={copy} code={`{{-- resources/views/layouts/app.blade.php --}}
<head>
    <script src="${server}/sdk/check402.js" 
      data-api-key="{{ config('services.Check 402.key') }}"
      data-server="${server}">
    </script>
    @vite(['resources/css/app.css', 'resources/js/app.js'])
</head>`} />

            <h2>Config Setup</h2>
            <CodeBlock id="lv-env" lang="php" copiedId={copiedId} onCopy={copy} code={`// .env
CHECK402_API_KEY=YOUR_API_KEY

// config/services.php
'Check 402' => ['key' => env('CHECK402_API_KEY')]`} />

            <h2>Server-Side Middleware (Recommended)</h2>
            <p>For absolute security, you can block the request at the server level so the page HTML never even renders.</p>
            <CodeBlock id="lv-mid" lang="php" copiedId={copiedId} onCopy={copy} code={`<?php
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
        $status = Cache::remember('Check 402_status', 300, function () {
            $resp = Http::timeout(5)->get('${server}/api/check-status', [
                'key' => config('services.Check 402.key'),
            ]);
            return $resp->ok() ? $resp->json('status') : 'COMPLETED';
        });

        if ($status === 'DEFAULTED') {
            return response()->view('payment-required', [], 402);
        }

        return $next($request);
    }
}`} />

            <Callout type="warning" title="Server-side is stronger">
                <p>The client-side JavaScript SDK can technically be bypassed if the user disables JavaScript in their browser entirely. For mission-critical applications, use both methods (Middleware + Script) for maximum enforcement.</p>
            </Callout>
        </>
    );
}

function DjangoGuide({ server, copiedId, copy }: GuideProps) {
    return (
        <>
            <h1 className="flex items-center gap-3"><Circle className="text-emerald-700" size={32} /> Django Integration</h1>
            <p className="text-lg text-slate-500 font-medium">For Django apps with templates or DRF APIs.</p>

            <h2>Base Template</h2>
            <CodeBlock id="dj-tpl" lang="html" copiedId={copiedId} onCopy={copy} code={`{# templates/base.html #}
<head>
    <script src="${server}/sdk/check402.js" 
      data-api-key="{{ settings.CHECK402_API_KEY }}"
      data-server="${server}">
    </script>
</head>`} />

            <h2>Django Middleware</h2>
            <p>Block access server-side in Django using middleware.</p>
            <CodeBlock id="dj-mid" lang="python" copiedId={copiedId} onCopy={copy} code={`# middleware/Check 402.py
import requests
from django.conf import settings
from django.core.cache import cache
from django.http import HttpResponse

class Check402Middleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        status = cache.get("Check 402_status")
        if status is None:
            try:
                resp = requests.get(
                    "${server}/api/check-status",
                    params={"key": settings.CHECK402_API_KEY},
                    timeout=5,
                )
                status = resp.json().get("status", "COMPLETED")
            except Exception:
                status = "COMPLETED"
            cache.set("Check 402_status", status, 300)

        if status == "DEFAULTED":
            return HttpResponse("Payment Required", status=402)
        return self.get_response(request)

# settings.py
CHECK402_API_KEY = os.environ.get("CHECK402_API_KEY")
MIDDLEWARE = [
    "middleware.Check 402.Check402Middleware", 
    ...
]`} />
        </>
    );
}

function RailsGuide({ server, copiedId, copy }: GuideProps) {
    return (
        <>
            <h1 className="flex items-center gap-3"><Diamond className="text-red-500" size={32} fill="currentColor" /> Ruby on Rails</h1>
            <p className="text-lg text-slate-500 font-medium">For Rails apps utilizing ERB templates and Rack.</p>

            <h2>Application Layout</h2>
            <CodeBlock id="rb-layout" lang="erb" copiedId={copiedId} onCopy={copy} code={`<%# app/views/layouts/application.html.erb %>
<head>
  <script src="${server}/sdk/check402.js" 
    data-api-key="<%= ENV['CHECK402_API_KEY'] %>"
    data-server="${server}">
  </script>
  <%= stylesheet_link_tag "application" %>
</head>`} />

            <h2>Rack Middleware</h2>
            <CodeBlock id="rb-mid" lang="ruby" copiedId={copiedId} onCopy={copy} code={`# lib/middleware/check_402.rb
require "net/http"
require "json"

class Check402
  def initialize(app)
    @app = app
    @cache = {}
  end

  def call(env)
    if check_status == "DEFAULTED"
      [402, {"Content-Type" => "text/html"},
       [File.read(Rails.root.join("public/402.html"))]]
    else
      @app.call(env)
    end
  end

  private

  def check_status
    if @cache[:exp].nil? || Time.now > @cache[:exp]
      uri = URI("${server}/api/check-status?key=#{ENV['CHECK402_API_KEY']}")
      @cache[:status] = JSON.parse(Net::HTTP.get(uri))["status"] rescue "COMPLETED"
      @cache[:exp] = Time.now + 300
    end
    @cache[:status]
  end
end

# config/application.rb
config.middleware.insert_before 0, Check402`} />
        </>
    );
}

function WordPressGuide({ server, copiedId, copy }: GuideProps) {
    return (
        <>
            <h1 className="flex items-center gap-3"><FileText className="text-slate-700" size={32} /> WordPress Integration</h1>
            <p className="text-lg text-slate-500 font-medium">Ensure standard PHP-based applications are also covered.</p>

            <h2>functions.php Injection</h2>
            <p>You can enqueue the script directly via your theme's functions file.</p>
            <CodeBlock id="wp-fn" lang="php" copiedId={copiedId} onCopy={copy} code={`<?php
// functions.php

function check402_enqueue() {
    wp_enqueue_script('Check 402', '${server}/sdk/check402.js', [], null, false);
}
add_action('wp_enqueue_scripts', 'check402_enqueue');

function check402_attrs($tag, $handle) {
    if ($handle !== 'Check 402') return $tag;
    return str_replace(
        '<script ',
        '<script data-api-key="YOUR_API_KEY" data-server="${server}" ',
        $tag
    );
}
add_filter('script_loader_tag', 'check402_attrs', 10, 2);`} />

            <h2>Header.php Override</h2>
            <p>Alternatively, paste the script into the `&lt;head&gt;` section.</p>
            <CodeBlock id="wp-header" lang="php" copiedId={copiedId} onCopy={copy} code={`<?php // In root header.php, inside <head> ?>
<script src="${server}/sdk/check402.js" 
  data-api-key="YOUR_API_KEY"
  data-server="${server}">
</script>`} />

            <Callout type="info" title="Plugin Alternative">
                <p>You can also use an "Insert Headers and Footers" plugin to add the script tag globally without modifying any of your theme's files.</p>
            </Callout>
        </>
    );
}
