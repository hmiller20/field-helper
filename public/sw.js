if(!self.define){let e,s={};const i=(i,n)=>(i=new URL(i+".js",n).href,s[i]||new Promise((s=>{if("document"in self){const e=document.createElement("script");e.src=i,e.onload=s,document.head.appendChild(e)}else e=i,importScripts(i),s()})).then((()=>{let e=s[i];if(!e)throw new Error(`Module ${i} didn’t register its module`);return e})));self.define=(n,t)=>{const a=e||("document"in self?document.currentScript.src:"")||location.href;if(s[a])return;let c={};const r=e=>i(e,a),f={module:{uri:a},exports:c,require:r};s[a]=Promise.all(n.map((e=>f[e]||r(e)))).then((e=>(t(...e),c)))}}define(["./workbox-4754cb34"],(function(e){"use strict";importScripts(),self.skipWaiting(),e.clientsClaim(),e.precacheAndRoute([{url:"/_next/app-build-manifest.json",revision:"05130a79b021a49b089ff42683eeec66"},{url:"/_next/static/chunks/117-2f90871eb274e056.js",revision:"jmkDl7U2Si-G5VLR-DWf9"},{url:"/_next/static/chunks/508-056f1d3d68dca1ae.js",revision:"jmkDl7U2Si-G5VLR-DWf9"},{url:"/_next/static/chunks/522-2da5c47eb942d316.js",revision:"jmkDl7U2Si-G5VLR-DWf9"},{url:"/_next/static/chunks/793-3e5a3db270413c5f.js",revision:"jmkDl7U2Si-G5VLR-DWf9"},{url:"/_next/static/chunks/812-6983b8ba475b362e.js",revision:"jmkDl7U2Si-G5VLR-DWf9"},{url:"/_next/static/chunks/93-f16daf9888045b19.js",revision:"jmkDl7U2Si-G5VLR-DWf9"},{url:"/_next/static/chunks/963-82e245303c9cb492.js",revision:"jmkDl7U2Si-G5VLR-DWf9"},{url:"/_next/static/chunks/app/_not-found/page-6d6f02352e3a435e.js",revision:"jmkDl7U2Si-G5VLR-DWf9"},{url:"/_next/static/chunks/app/consent/page-da4f1579551c7755.js",revision:"jmkDl7U2Si-G5VLR-DWf9"},{url:"/_next/static/chunks/app/debriefing/page-0982b0283de7fdc8.js",revision:"jmkDl7U2Si-G5VLR-DWf9"},{url:"/_next/static/chunks/app/draw/page-566185e001a01eee.js",revision:"jmkDl7U2Si-G5VLR-DWf9"},{url:"/_next/static/chunks/app/experimenter/page-708feec095067aae.js",revision:"jmkDl7U2Si-G5VLR-DWf9"},{url:"/_next/static/chunks/app/layout-5fa6e8234b51bcb1.js",revision:"jmkDl7U2Si-G5VLR-DWf9"},{url:"/_next/static/chunks/app/page-6d9b82c12a717854.js",revision:"jmkDl7U2Si-G5VLR-DWf9"},{url:"/_next/static/chunks/app/session/page-26cc4d4f27f2e978.js",revision:"jmkDl7U2Si-G5VLR-DWf9"},{url:"/_next/static/chunks/app/survey/page-26c9d0ec9773fd63.js",revision:"jmkDl7U2Si-G5VLR-DWf9"},{url:"/_next/static/chunks/app/vignette/page-afa47be2d94f8201.js",revision:"jmkDl7U2Si-G5VLR-DWf9"},{url:"/_next/static/chunks/fd9d1056-dd504a17eef30e15.js",revision:"jmkDl7U2Si-G5VLR-DWf9"},{url:"/_next/static/chunks/framework-f66176bb897dc684.js",revision:"jmkDl7U2Si-G5VLR-DWf9"},{url:"/_next/static/chunks/main-1fde2b0da248ae71.js",revision:"jmkDl7U2Si-G5VLR-DWf9"},{url:"/_next/static/chunks/main-app-cc7a986f77e17b30.js",revision:"jmkDl7U2Si-G5VLR-DWf9"},{url:"/_next/static/chunks/pages/_app-72b849fbd24ac258.js",revision:"jmkDl7U2Si-G5VLR-DWf9"},{url:"/_next/static/chunks/pages/_error-7ba65e1336b92748.js",revision:"jmkDl7U2Si-G5VLR-DWf9"},{url:"/_next/static/chunks/polyfills-42372ed130431b0a.js",revision:"846118c33b2c0e922d7b3a7676f81f6f"},{url:"/_next/static/chunks/webpack-ce0d7dcb781264d4.js",revision:"jmkDl7U2Si-G5VLR-DWf9"},{url:"/_next/static/css/fc8ea81767f2b927.css",revision:"fc8ea81767f2b927"},{url:"/_next/static/jmkDl7U2Si-G5VLR-DWf9/_buildManifest.js",revision:"c155cce658e53418dec34664328b51ac"},{url:"/_next/static/jmkDl7U2Si-G5VLR-DWf9/_ssgManifest.js",revision:"b6652df95db52feb4daf4eca35380933"},{url:"/_next/static/media/26a46d62cd723877-s.woff2",revision:"befd9c0fdfa3d8a645d5f95717ed6420"},{url:"/_next/static/media/55c55f0601d81cf3-s.woff2",revision:"43828e14271c77b87e3ed582dbff9f74"},{url:"/_next/static/media/581909926a08bbc8-s.woff2",revision:"f0b86e7c24f455280b8df606b89af891"},{url:"/_next/static/media/6d93bde91c0c2823-s.woff2",revision:"621a07228c8ccbfd647918f1021b4868"},{url:"/_next/static/media/97e0cb1ae144a2a9-s.woff2",revision:"e360c61c5bd8d90639fd4503c829c2dc"},{url:"/_next/static/media/a34f9d1faa5f3315-s.p.woff2",revision:"d4fe31e6a2aebc06b8d6e558c9141119"},{url:"/_next/static/media/df0a9ae256c0569c-s.woff2",revision:"d54db44de5ccb18886ece2fda72bdfe0"},{url:"/manifest.json",revision:"fdc0398115885aebf7d5bd64e8931b26"},{url:"/offline.html",revision:"5662f34f34ab185b01421f781aa9d8ee"},{url:"/old-consent-form.pdf",revision:"6f5fe2873121b87acf7f17d893282486"},{url:"/old-debriefing-form.pdf",revision:"1fbfb23eac1407b5434c9ae18c62e5ac"}],{ignoreURLParametersMatching:[]}),e.cleanupOutdatedCaches(),e.registerRoute("/",new e.NetworkFirst({cacheName:"start-url",plugins:[{cacheWillUpdate:async({request:e,response:s,event:i,state:n})=>s&&"opaqueredirect"===s.type?new Response(s.body,{status:200,statusText:"OK",headers:s.headers}):s}]}),"GET"),e.registerRoute(/\.pdf$/i,new e.CacheFirst({cacheName:"static-pdf-assets",plugins:[new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:86400})]}),"GET"),e.registerRoute(/^https:\/\/fonts\.(?:gstatic)\.com\/.*/i,new e.CacheFirst({cacheName:"google-fonts-webfonts",plugins:[new e.ExpirationPlugin({maxEntries:4,maxAgeSeconds:31536e3})]}),"GET"),e.registerRoute(/^https:\/\/fonts\.(?:googleapis)\.com\/.*/i,new e.StaleWhileRevalidate({cacheName:"google-fonts-stylesheets",plugins:[new e.ExpirationPlugin({maxEntries:4,maxAgeSeconds:604800})]}),"GET"),e.registerRoute(/\.(?:eot|otf|ttc|ttf|woff|woff2|font.css)$/i,new e.StaleWhileRevalidate({cacheName:"static-font-assets",plugins:[new e.ExpirationPlugin({maxEntries:4,maxAgeSeconds:604800})]}),"GET"),e.registerRoute(/\.(?:jpg|jpeg|gif|png|svg|ico|webp)$/i,new e.StaleWhileRevalidate({cacheName:"static-image-assets",plugins:[new e.ExpirationPlugin({maxEntries:64,maxAgeSeconds:86400})]}),"GET"),e.registerRoute(/\/_next\/image\?url=.+$/i,new e.StaleWhileRevalidate({cacheName:"next-image",plugins:[new e.ExpirationPlugin({maxEntries:64,maxAgeSeconds:86400})]}),"GET"),e.registerRoute(/\.(?:mp3|wav|ogg)$/i,new e.CacheFirst({cacheName:"static-audio-assets",plugins:[new e.RangeRequestsPlugin,new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:86400})]}),"GET"),e.registerRoute(/\.(?:mp4)$/i,new e.CacheFirst({cacheName:"static-video-assets",plugins:[new e.RangeRequestsPlugin,new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:86400})]}),"GET"),e.registerRoute(/\.(?:js)$/i,new e.StaleWhileRevalidate({cacheName:"static-js-assets",plugins:[new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:86400})]}),"GET"),e.registerRoute(/\.(?:css|less)$/i,new e.StaleWhileRevalidate({cacheName:"static-style-assets",plugins:[new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:86400})]}),"GET"),e.registerRoute(/\/_next\/data\/.+\/.+\.json$/i,new e.StaleWhileRevalidate({cacheName:"next-data",plugins:[new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:86400})]}),"GET"),e.registerRoute(/\.(?:json|xml|csv)$/i,new e.NetworkFirst({cacheName:"static-data-assets",plugins:[new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:86400})]}),"GET"),e.registerRoute((({url:e})=>{if(!(self.origin===e.origin))return!1;const s=e.pathname;return!s.startsWith("/api/auth/")&&!!s.startsWith("/api/")}),new e.NetworkFirst({cacheName:"apis",networkTimeoutSeconds:10,plugins:[new e.ExpirationPlugin({maxEntries:16,maxAgeSeconds:86400})]}),"GET"),e.registerRoute((({url:e})=>{if(!(self.origin===e.origin))return!1;return!e.pathname.startsWith("/api/")}),new e.NetworkFirst({cacheName:"others",networkTimeoutSeconds:10,plugins:[new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:86400})]}),"GET"),e.registerRoute((({url:e})=>!(self.origin===e.origin)),new e.NetworkFirst({cacheName:"cross-origin",networkTimeoutSeconds:10,plugins:[new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:3600})]}),"GET")}));
