!function(){"use strict";let e,t,a,s,r;let i=(e,...t)=>{let a=e;return t.length>0&&(a+=` :: ${JSON.stringify(t)}`),a};class n extends Error{details;constructor(e,t){super(i(e,t)),this.name=e,this.details=t}}let c=e=>new URL(String(e),location.href).href.replace(RegExp(`^${location.origin}`),""),o={googleAnalytics:"googleAnalytics",precache:"precache-v2",prefix:"serwist",runtime:"runtime",suffix:"undefined"!=typeof registration?registration.scope:""},l=e=>[o.prefix,e,o.suffix].filter(e=>e&&e.length>0).join("-"),h=e=>{for(let t of Object.keys(o))e(t)},u=e=>{h(t=>{let a=e[t];"string"==typeof a&&(o[t]=a)})},d=e=>e||l(o.googleAnalytics),f=e=>e||l(o.precache),p=e=>e||l(o.runtime);class m{promise;resolve;reject;constructor(){this.promise=new Promise((e,t)=>{this.resolve=e,this.reject=t})}}function w(e,t){let a=new URL(e);for(let e of t)a.searchParams.delete(e);return a.href}async function y(e,t,a,s){let r=w(t.url,a);if(t.url===r)return e.match(t,s);let i={...s,ignoreSearch:!0};for(let n of(await e.keys(t,i)))if(r===w(n.url,a))return e.match(n,s)}let g=new Set,_=async()=>{for(let e of g)await e()};function b(e){return new Promise(t=>setTimeout(t,e))}let R="-precache-",q=async(e,t=R)=>{let a=(await self.caches.keys()).filter(a=>a.includes(t)&&a.includes(self.registration.scope)&&a!==e);return await Promise.all(a.map(e=>self.caches.delete(e))),a},E=e=>{self.addEventListener("activate",t=>{t.waitUntil(q(f(e)).then(e=>{}))})},v=()=>{self.addEventListener("activate",()=>self.clients.claim())},D=(e,t)=>{let a=t();return e.waitUntil(a),a},x=(e,t)=>t.some(t=>e instanceof t),S=new WeakMap,C=new WeakMap,P=new WeakMap,T={get(e,t,a){if(e instanceof IDBTransaction){if("done"===t)return S.get(e);if("store"===t)return a.objectStoreNames[1]?void 0:a.objectStore(a.objectStoreNames[0])}return k(e[t])},set:(e,t,a)=>(e[t]=a,!0),has:(e,t)=>e instanceof IDBTransaction&&("done"===t||"store"===t)||t in e};function k(e){var s;if(e instanceof IDBRequest)return function(e){let t=new Promise((t,a)=>{let s=()=>{e.removeEventListener("success",r),e.removeEventListener("error",i)},r=()=>{t(k(e.result)),s()},i=()=>{a(e.error),s()};e.addEventListener("success",r),e.addEventListener("error",i)});return P.set(t,e),t}(e);if(C.has(e))return C.get(e);let r="function"==typeof(s=e)?(a||(a=[IDBCursor.prototype.advance,IDBCursor.prototype.continue,IDBCursor.prototype.continuePrimaryKey])).includes(s)?function(...e){return s.apply(I(this),e),k(this.request)}:function(...e){return k(s.apply(I(this),e))}:(s instanceof IDBTransaction&&function(e){if(S.has(e))return;let t=new Promise((t,a)=>{let s=()=>{e.removeEventListener("complete",r),e.removeEventListener("error",i),e.removeEventListener("abort",i)},r=()=>{t(),s()},i=()=>{a(e.error||new DOMException("AbortError","AbortError")),s()};e.addEventListener("complete",r),e.addEventListener("error",i),e.addEventListener("abort",i)});S.set(e,t)}(s),x(s,t||(t=[IDBDatabase,IDBObjectStore,IDBIndex,IDBCursor,IDBTransaction])))?new Proxy(s,T):s;return r!==e&&(C.set(e,r),P.set(r,e)),r}let I=e=>P.get(e);function N(e,t,{blocked:a,upgrade:s,blocking:r,terminated:i}={}){let n=indexedDB.open(e,t),c=k(n);return s&&n.addEventListener("upgradeneeded",e=>{s(k(n.result),e.oldVersion,e.newVersion,k(n.transaction),e)}),a&&n.addEventListener("blocked",e=>a(e.oldVersion,e.newVersion,e)),c.then(e=>{i&&e.addEventListener("close",()=>i()),r&&e.addEventListener("versionchange",e=>r(e.oldVersion,e.newVersion,e))}).catch(()=>{}),c}let L=["get","getKey","getAll","getAllKeys","count"],U=["put","add","delete","clear"],A=new Map;function O(e,t){if(!(e instanceof IDBDatabase&&!(t in e)&&"string"==typeof t))return;if(A.get(t))return A.get(t);let a=t.replace(/FromIndex$/,""),s=t!==a,r=U.includes(a);if(!(a in(s?IDBIndex:IDBObjectStore).prototype)||!(r||L.includes(a)))return;let i=async function(e,...t){let i=this.transaction(e,r?"readwrite":"readonly"),n=i.store;return s&&(n=n.index(t.shift())),(await Promise.all([n[a](...t),r&&i.done]))[0]};return A.set(t,i),i}T={...s=T,get:(e,t,a)=>O(e,t)||s.get(e,t,a),has:(e,t)=>!!O(e,t)||s.has(e,t)};let M=["continue","continuePrimaryKey","advance"],B={},F=new WeakMap,K=new WeakMap,W={get(e,t){if(!M.includes(t))return e[t];let a=B[t];return a||(a=B[t]=function(...e){F.set(this,K.get(this)[t](...e))}),a}};async function*j(...e){let t=this;if(t instanceof IDBCursor||(t=await t.openCursor(...e)),!t)return;let a=new Proxy(t,W);for(K.set(a,t),P.set(a,I(t));t;)yield a,t=await (F.get(a)||t.continue()),F.delete(a)}function H(e,t){return t===Symbol.asyncIterator&&x(e,[IDBIndex,IDBObjectStore,IDBCursor])||"iterate"===t&&x(e,[IDBIndex,IDBObjectStore])}T={...r=T,get:(e,t,a)=>H(e,t)?j:r.get(e,t,a),has:(e,t)=>H(e,t)||r.has(e,t)};let $=e=>e&&"object"==typeof e?e:{handle:e};class V{handler;match;method;catchHandler;constructor(e,t,a="GET"){this.handler=$(t),this.match=e,this.method=a}setCatchHandler(e){this.catchHandler=$(e)}}class Q extends V{_allowlist;_denylist;constructor(e,{allowlist:t=[/./],denylist:a=[]}={}){super(e=>this._match(e),e),this._allowlist=t,this._denylist=a}_match({url:e,request:t}){if(t&&"navigate"!==t.mode)return!1;let a=e.pathname+e.search;for(let e of this._denylist)if(e.test(a))return!1;return!!this._allowlist.some(e=>e.test(a))}}let G=(e,t=[])=>{for(let a of[...e.searchParams.keys()])t.some(e=>e.test(a))&&e.searchParams.delete(a);return e};class z extends V{constructor(e,t,a){super(({url:t})=>{let a=e.exec(t.href);if(a&&(t.origin===location.origin||0===a.index))return a.slice(1)},t,a)}}let J=async(e,t,a)=>{let s=t.map((e,t)=>({index:t,item:e})),r=async e=>{let t=[];for(;;){let r=s.pop();if(!r)return e(t);let i=await a(r.item);t.push({result:i,index:r.index})}},i=Array.from({length:e},()=>new Promise(r));return(await Promise.all(i)).flat().sort((e,t)=>e.index<t.index?-1:1).map(e=>e.result)},Y=()=>{self.__WB_DISABLE_DEV_LOGS=!0};function X(e){return"string"==typeof e?new Request(e):e}class Z{event;request;url;params;_cacheKeys={};_strategy;_handlerDeferred;_extendLifetimePromises;_plugins;_pluginStateMap;constructor(e,t){for(let a of(this.event=t.event,this.request=t.request,t.url&&(this.url=t.url,this.params=t.params),this._strategy=e,this._handlerDeferred=new m,this._extendLifetimePromises=[],this._plugins=[...e.plugins],this._pluginStateMap=new Map,this._plugins))this._pluginStateMap.set(a,{});this.event.waitUntil(this._handlerDeferred.promise)}async fetch(e){let{event:t}=this,a=X(e),s=await this.getPreloadResponse();if(s)return s;let r=this.hasCallback("fetchDidFail")?a.clone():null;try{for(let e of this.iterateCallbacks("requestWillFetch"))a=await e({request:a.clone(),event:t})}catch(e){if(e instanceof Error)throw new n("plugin-error-request-will-fetch",{thrownErrorMessage:e.message})}let i=a.clone();try{let e;for(let s of(e=await fetch(a,"navigate"===a.mode?void 0:this._strategy.fetchOptions),this.iterateCallbacks("fetchDidSucceed")))e=await s({event:t,request:i,response:e});return e}catch(e){throw r&&await this.runCallbacks("fetchDidFail",{error:e,event:t,originalRequest:r.clone(),request:i.clone()}),e}}async fetchAndCachePut(e){let t=await this.fetch(e),a=t.clone();return this.waitUntil(this.cachePut(e,a)),t}async cacheMatch(e){let t;let a=X(e),{cacheName:s,matchOptions:r}=this._strategy,i=await this.getCacheKey(a,"read"),n={...r,cacheName:s};for(let e of(t=await caches.match(i,n),this.iterateCallbacks("cachedResponseWillBeUsed")))t=await e({cacheName:s,matchOptions:r,cachedResponse:t,request:i,event:this.event})||void 0;return t}async cachePut(e,t){let a=X(e);await b(0);let s=await this.getCacheKey(a,"write");if(!t)throw new n("cache-put-with-no-response",{url:c(s.url)});let r=await this._ensureResponseSafeToCache(t);if(!r)return!1;let{cacheName:i,matchOptions:o}=this._strategy,l=await self.caches.open(i),h=this.hasCallback("cacheDidUpdate"),u=h?await y(l,s.clone(),["__WB_REVISION__"],o):null;try{await l.put(s,h?r.clone():r)}catch(e){if(e instanceof Error)throw"QuotaExceededError"===e.name&&await _(),e}for(let e of this.iterateCallbacks("cacheDidUpdate"))await e({cacheName:i,oldResponse:u,newResponse:r.clone(),request:s,event:this.event});return!0}async getCacheKey(e,t){let a=`${e.url} | ${t}`;if(!this._cacheKeys[a]){let s=e;for(let e of this.iterateCallbacks("cacheKeyWillBeUsed"))s=X(await e({mode:t,request:s,event:this.event,params:this.params}));this._cacheKeys[a]=s}return this._cacheKeys[a]}hasCallback(e){for(let t of this._strategy.plugins)if(e in t)return!0;return!1}async runCallbacks(e,t){for(let a of this.iterateCallbacks(e))await a(t)}*iterateCallbacks(e){for(let t of this._strategy.plugins)if("function"==typeof t[e]){let a=this._pluginStateMap.get(t),s=s=>{let r={...s,state:a};return t[e](r)};yield s}}waitUntil(e){return this._extendLifetimePromises.push(e),e}async doneWaiting(){let e;for(;e=this._extendLifetimePromises.shift();)await e}destroy(){this._handlerDeferred.resolve(null)}async getPreloadResponse(){if(this.event instanceof FetchEvent&&"navigate"===this.event.request.mode&&"preloadResponse"in this.event)try{let e=await this.event.preloadResponse;if(e)return e}catch(e){}}async _ensureResponseSafeToCache(e){let t=e,a=!1;for(let e of this.iterateCallbacks("cacheWillUpdate"))if(t=await e({request:this.request,response:t,event:this.event})||void 0,a=!0,!t)break;return!a&&t&&200!==t.status&&(t=void 0),t}}class ee{cacheName;plugins;fetchOptions;matchOptions;constructor(e={}){this.cacheName=p(e.cacheName),this.plugins=e.plugins||[],this.fetchOptions=e.fetchOptions,this.matchOptions=e.matchOptions}handle(e){let[t]=this.handleAll(e);return t}handleAll(e){e instanceof FetchEvent&&(e={event:e,request:e.request});let t=e.event,a="string"==typeof e.request?new Request(e.request):e.request,s=new Z(this,e.url?{event:t,request:a,url:e.url,params:e.params}:{event:t,request:a}),r=this._getResponse(s,a,t),i=this._awaitComplete(r,s,a,t);return[r,i]}async _getResponse(e,t,a){let s;await e.runCallbacks("handlerWillStart",{event:a,request:t});try{if(s=await this._handle(t,e),void 0===s||"error"===s.type)throw new n("no-response",{url:t.url})}catch(r){if(r instanceof Error){for(let i of e.iterateCallbacks("handlerDidError"))if(void 0!==(s=await i({error:r,event:a,request:t})))break}if(!s)throw r}for(let r of e.iterateCallbacks("handlerWillRespond"))s=await r({event:a,request:t,response:s});return s}async _awaitComplete(e,t,a,s){let r,i;try{r=await e}catch(e){}try{await t.runCallbacks("handlerDidRespond",{event:s,request:a,response:r}),await t.doneWaiting()}catch(e){e instanceof Error&&(i=e)}if(await t.runCallbacks("handlerDidComplete",{event:s,request:a,response:r,error:i}),t.destroy(),i)throw i}}let et={cacheWillUpdate:async({response:e})=>200===e.status||0===e.status?e:null};class ea extends ee{_networkTimeoutSeconds;constructor(e={}){super(e),this.plugins.some(e=>"cacheWillUpdate"in e)||this.plugins.unshift(et),this._networkTimeoutSeconds=e.networkTimeoutSeconds||0}async _handle(e,t){let a;let s=[],r=[];if(this._networkTimeoutSeconds){let{id:i,promise:n}=this._getTimeoutPromise({request:e,logs:s,handler:t});a=i,r.push(n)}let i=this._getNetworkPromise({timeoutId:a,request:e,logs:s,handler:t});r.push(i);let c=await t.waitUntil((async()=>await t.waitUntil(Promise.race(r))||await i)());if(!c)throw new n("no-response",{url:e.url});return c}_getTimeoutPromise({request:e,logs:t,handler:a}){let s;return{promise:new Promise(t=>{s=setTimeout(async()=>{t(await a.cacheMatch(e))},1e3*this._networkTimeoutSeconds)}),id:s}}async _getNetworkPromise({timeoutId:e,request:t,logs:a,handler:s}){let r,i;try{i=await s.fetchAndCachePut(t)}catch(e){e instanceof Error&&(r=e)}return e&&clearTimeout(e),(r||!i)&&(i=await s.cacheMatch(t)),i}}class es extends ee{_networkTimeoutSeconds;constructor(e={}){super(e),this._networkTimeoutSeconds=e.networkTimeoutSeconds||0}async _handle(e,t){let a,s;try{let s=[t.fetch(e)];if(this._networkTimeoutSeconds){let e=b(1e3*this._networkTimeoutSeconds);s.push(e)}if(!(a=await Promise.race(s)))throw Error(`Timed out the network response after ${this._networkTimeoutSeconds} seconds.`)}catch(e){e instanceof Error&&(s=e)}if(!a)throw new n("no-response",{url:e.url,error:s});return a}}let er="requests",ei="queueName";class en{_db=null;async addEntry(e){let t=(await this.getDb()).transaction(er,"readwrite",{durability:"relaxed"});await t.store.add(e),await t.done}async getFirstEntryId(){let e=await this.getDb(),t=await e.transaction(er).store.openCursor();return t?.value.id}async getAllEntriesByQueueName(e){let t=await this.getDb();return await t.getAllFromIndex(er,ei,IDBKeyRange.only(e))||[]}async getEntryCountByQueueName(e){return(await this.getDb()).countFromIndex(er,ei,IDBKeyRange.only(e))}async deleteEntry(e){let t=await this.getDb();await t.delete(er,e)}async getFirstEntryByQueueName(e){return await this.getEndEntryFromIndex(IDBKeyRange.only(e),"next")}async getLastEntryByQueueName(e){return await this.getEndEntryFromIndex(IDBKeyRange.only(e),"prev")}async getEndEntryFromIndex(e,t){let a=await this.getDb(),s=await a.transaction(er).store.index(ei).openCursor(e,t);return s?.value}async getDb(){return this._db||(this._db=await N("serwist-background-sync",3,{upgrade:this._upgradeDb})),this._db}_upgradeDb(e,t){t>0&&t<3&&e.objectStoreNames.contains(er)&&e.deleteObjectStore(er),e.createObjectStore(er,{autoIncrement:!0,keyPath:"id"}).createIndex(ei,ei,{unique:!1})}}class ec{_queueName;_queueDb;constructor(e){this._queueName=e,this._queueDb=new en}async pushEntry(e){delete e.id,e.queueName=this._queueName,await this._queueDb.addEntry(e)}async unshiftEntry(e){let t=await this._queueDb.getFirstEntryId();t?e.id=t-1:delete e.id,e.queueName=this._queueName,await this._queueDb.addEntry(e)}async popEntry(){return this._removeEntry(await this._queueDb.getLastEntryByQueueName(this._queueName))}async shiftEntry(){return this._removeEntry(await this._queueDb.getFirstEntryByQueueName(this._queueName))}async getAll(){return await this._queueDb.getAllEntriesByQueueName(this._queueName)}async size(){return await this._queueDb.getEntryCountByQueueName(this._queueName)}async deleteEntry(e){await this._queueDb.deleteEntry(e)}async _removeEntry(e){return e&&await this.deleteEntry(e.id),e}}let eo=["method","referrer","referrerPolicy","mode","credentials","cache","redirect","integrity","keepalive"];class el{_requestData;static async fromRequest(e){let t={url:e.url,headers:{}};for(let a of("GET"!==e.method&&(t.body=await e.clone().arrayBuffer()),e.headers.forEach((e,a)=>{t.headers[a]=e}),eo))void 0!==e[a]&&(t[a]=e[a]);return new el(t)}constructor(e){"navigate"===e.mode&&(e.mode="same-origin"),this._requestData=e}toObject(){let e=Object.assign({},this._requestData);return e.headers=Object.assign({},this._requestData.headers),e.body&&(e.body=e.body.slice(0)),e}toRequest(){return new Request(this._requestData.url,this._requestData)}clone(){return new el(this.toObject())}}let eh="serwist-background-sync",eu=new Set,ed=e=>{let t={request:new el(e.requestData).toRequest(),timestamp:e.timestamp};return e.metadata&&(t.metadata=e.metadata),t};class ef{_name;_onSync;_maxRetentionTime;_queueStore;_forceSyncFallback;_syncInProgress=!1;_requestsAddedDuringSync=!1;constructor(e,{forceSyncFallback:t,onSync:a,maxRetentionTime:s}={}){if(eu.has(e))throw new n("duplicate-queue-name",{name:e});eu.add(e),this._name=e,this._onSync=a||this.replayRequests,this._maxRetentionTime=s||10080,this._forceSyncFallback=!!t,this._queueStore=new ec(this._name),this._addSyncListener()}get name(){return this._name}async pushRequest(e){await this._addRequest(e,"push")}async unshiftRequest(e){await this._addRequest(e,"unshift")}async popRequest(){return this._removeRequest("pop")}async shiftRequest(){return this._removeRequest("shift")}async getAll(){let e=await this._queueStore.getAll(),t=Date.now(),a=[];for(let s of e){let e=6e4*this._maxRetentionTime;t-s.timestamp>e?await this._queueStore.deleteEntry(s.id):a.push(ed(s))}return a}async size(){return await this._queueStore.size()}async _addRequest({request:e,metadata:t,timestamp:a=Date.now()},s){let r={requestData:(await el.fromRequest(e.clone())).toObject(),timestamp:a};switch(t&&(r.metadata=t),s){case"push":await this._queueStore.pushEntry(r);break;case"unshift":await this._queueStore.unshiftEntry(r)}this._syncInProgress?this._requestsAddedDuringSync=!0:await this.registerSync()}async _removeRequest(e){let t;let a=Date.now();switch(e){case"pop":t=await this._queueStore.popEntry();break;case"shift":t=await this._queueStore.shiftEntry()}if(t){let s=6e4*this._maxRetentionTime;return a-t.timestamp>s?this._removeRequest(e):ed(t)}}async replayRequests(){let e;for(;e=await this.shiftRequest();)try{await fetch(e.request.clone())}catch(t){throw await this.unshiftRequest(e),new n("queue-replay-failed",{name:this._name})}}async registerSync(){if("sync"in self.registration&&!this._forceSyncFallback)try{await self.registration.sync.register(`${eh}:${this._name}`)}catch(e){}}_addSyncListener(){"sync"in self.registration&&!this._forceSyncFallback?self.addEventListener("sync",e=>{if(e.tag===`${eh}:${this._name}`){let t=async()=>{let t;this._syncInProgress=!0;try{await this._onSync({queue:this})}catch(e){if(e instanceof Error)throw e}finally{this._requestsAddedDuringSync&&!(t&&!e.lastChance)&&await this.registerSync(),this._syncInProgress=!1,this._requestsAddedDuringSync=!1}};e.waitUntil(t())}}):this._onSync({queue:this})}static get _queueNames(){return eu}}class ep{_queue;constructor(e,t){this._queue=new ef(e,t)}async fetchDidFail({request:e}){await this._queue.pushRequest({request:e})}}let em=async(t,a)=>{let s=null;if(t.url&&(s=new URL(t.url).origin),s!==self.location.origin)throw new n("cross-origin-copy-response",{origin:s});let r=t.clone(),i={headers:new Headers(r.headers),status:r.status,statusText:r.statusText},c=a?a(i):i,o=!function(){if(void 0===e){let t=new Response("");if("body"in t)try{new Response(t.body),e=!0}catch(t){e=!1}e=!1}return e}()?await r.blob():r.body;return new Response(o,c)};class ew extends ee{_fallbackToNetwork;static defaultPrecacheCacheabilityPlugin={cacheWillUpdate:async({response:e})=>!e||e.status>=400?null:e};static copyRedirectedCacheableResponsesPlugin={cacheWillUpdate:async({response:e})=>e.redirected?await em(e):e};constructor(e={}){e.cacheName=f(e.cacheName),super(e),this._fallbackToNetwork=!1!==e.fallbackToNetwork,this.plugins.push(ew.copyRedirectedCacheableResponsesPlugin)}async _handle(e,t){let a=await t.getPreloadResponse();return a?a:await t.cacheMatch(e)||(t.event&&"install"===t.event.type?await this._handleInstall(e,t):await this._handleFetch(e,t))}async _handleFetch(e,t){let a;let s=t.params||{};if(this._fallbackToNetwork){let r=s.integrity,i=e.integrity,n=!i||i===r;a=await t.fetch(new Request(e,{integrity:"no-cors"!==e.mode?i||r:void 0})),r&&n&&"no-cors"!==e.mode&&(this._useDefaultCacheabilityPluginIfNeeded(),await t.cachePut(e,a.clone()))}else throw new n("missing-precache-entry",{cacheName:this.cacheName,url:e.url});return a}async _handleInstall(e,t){this._useDefaultCacheabilityPluginIfNeeded();let a=await t.fetch(e);if(!await t.cachePut(e,a.clone()))throw new n("bad-precaching-response",{url:e.url,status:a.status});return a}_useDefaultCacheabilityPluginIfNeeded(){let e=null,t=0;for(let[a,s]of this.plugins.entries())s!==ew.copyRedirectedCacheableResponsesPlugin&&(s===ew.defaultPrecacheCacheabilityPlugin&&(e=a),s.cacheWillUpdate&&t++);0===t?this.plugins.push(ew.defaultPrecacheCacheabilityPlugin):t>1&&null!==e&&this.plugins.splice(e,1)}}let ey=()=>!!self.registration?.navigationPreload,eg=e=>{ey()&&self.addEventListener("activate",t=>{t.waitUntil(self.registration.navigationPreload.enable().then(()=>{e&&self.registration.navigationPreload.setHeaderValue(e)}))})},e_=e=>{u(e)};class eb{updatedURLs=[];notUpdatedURLs=[];handlerWillStart=async({request:e,state:t})=>{t&&(t.originalRequest=e)};cachedResponseWillBeUsed=async({event:e,state:t,cachedResponse:a})=>{if("install"===e.type&&t?.originalRequest&&t.originalRequest instanceof Request){let e=t.originalRequest.url;a?this.notUpdatedURLs.push(e):this.updatedURLs.push(e)}return a}}let eR=e=>{if(!e)throw new n("add-to-cache-list-unexpected-type",{entry:e});if("string"==typeof e){let t=new URL(e,location.href);return{cacheKey:t.href,url:t.href}}let{revision:t,url:a}=e;if(!a)throw new n("add-to-cache-list-unexpected-type",{entry:e});if(!t){let e=new URL(a,location.href);return{cacheKey:e.href,url:e.href}}let s=new URL(a,location.href),r=new URL(a,location.href);return s.searchParams.set("__WB_REVISION__",t),{cacheKey:s.href,url:r.href}},eq=(e,t,a)=>{if("string"==typeof e){let s=new URL(e,location.href);return new V(({url:e})=>e.href===s.href,t,a)}if(e instanceof RegExp)return new z(e,t,a);if("function"==typeof e)return new V(e,t,a);if(e instanceof V)return e;throw new n("unsupported-route-type",{moduleName:"serwist",funcName:"parseRoute",paramName:"capture"})};class eE extends V{constructor(e,t){super(({request:a})=>{let s=e.getUrlsToPrecacheKeys();for(let r of function*(e,{directoryIndex:t="index.html",ignoreURLParametersMatching:a=[/^utm_/,/^fbclid$/],cleanURLs:s=!0,urlManipulation:r}={}){let i=new URL(e,location.href);i.hash="",yield i.href;let n=G(i,a);if(yield n.href,t&&n.pathname.endsWith("/")){let e=new URL(n.href);e.pathname+=t,yield e.href}if(s){let e=new URL(n.href);e.pathname+=".html",yield e.href}if(r)for(let e of r({url:i}))yield e.href}(a.url,t)){let t=s.get(r);if(t){let a=e.getIntegrityForPrecacheKey(t);return{cacheKey:t,integrity:a}}}},e.precacheStrategy)}}let ev="www.google-analytics.com",eD="www.googletagmanager.com",ex=/^\/(\w+\/)?collect/,eS=e=>async({queue:t})=>{let a;for(;a=await t.shiftRequest();){let{request:s,timestamp:r}=a,i=new URL(s.url);try{let t="POST"===s.method?new URLSearchParams(await s.clone().text()):i.searchParams,a=r-(Number(t.get("qt"))||0),n=Date.now()-a;if(t.set("qt",String(n)),e.parameterOverrides)for(let a of Object.keys(e.parameterOverrides)){let s=e.parameterOverrides[a];t.set(a,s)}"function"==typeof e.hitFilter&&e.hitFilter.call(null,t),await fetch(new Request(i.origin+i.pathname,{body:t.toString(),method:"POST",mode:"cors",credentials:"omit",headers:{"Content-Type":"text/plain"}}))}catch(e){throw await t.unshiftRequest(a),e}}},eC=e=>{let t=({url:e})=>e.hostname===ev&&ex.test(e.pathname),a=new es({plugins:[e]});return[new V(t,a,"GET"),new V(t,a,"POST")]},eP=e=>new V(({url:e})=>e.hostname===ev&&"/analytics.js"===e.pathname,new ea({cacheName:e}),"GET"),eT=e=>new V(({url:e})=>e.hostname===eD&&"/gtag/js"===e.pathname,new ea({cacheName:e}),"GET"),ek=e=>new V(({url:e})=>e.hostname===eD&&"/gtm.js"===e.pathname,new ea({cacheName:e}),"GET"),eI=({serwist:e,cacheName:t,...a})=>{let s=d(t),r=new ep("serwist-google-analytics",{maxRetentionTime:2880,onSync:eS(a)});for(let t of[ek(s),eP(s),eT(s),...eC(r)])e.registerRoute(t)};class eN{_fallbackUrls;_serwist;constructor({fallbackUrls:e,serwist:t}){this._fallbackUrls=e,this._serwist=t}async handlerDidError(e){for(let t of this._fallbackUrls)if("string"==typeof t){let e=await this._serwist.matchPrecache(t);if(void 0!==e)return e}else if(t.matcher(e)){let e=await this._serwist.matchPrecache(t.url);if(void 0!==e)return e}}}class eL{_precacheController;constructor({precacheController:e}){this._precacheController=e}cacheKeyWillBeUsed=async({request:e,params:t})=>{let a=t?.cacheKey||this._precacheController.getPrecacheKeyForUrl(e.url);return a?new Request(a,{headers:e.headers}):e}}let eU=(e,t={})=>{let{cacheName:a,plugins:s=[],fetchOptions:r,matchOptions:i,fallbackToNetwork:n,directoryIndex:c,ignoreURLParametersMatching:o,cleanURLs:l,urlManipulation:h,cleanupOutdatedCaches:u,concurrency:d=10,navigateFallback:p,navigateFallbackAllowlist:m,navigateFallbackDenylist:w}=t??{};return{precacheStrategyOptions:{cacheName:f(a),plugins:[...s,new eL({precacheController:e})],fetchOptions:r,matchOptions:i,fallbackToNetwork:n},precacheRouteOptions:{directoryIndex:c,ignoreURLParametersMatching:o,cleanURLs:l,urlManipulation:h},precacheMiscOptions:{cleanupOutdatedCaches:u,concurrency:d,navigateFallback:p,navigateFallbackAllowlist:m,navigateFallbackDenylist:w}}};class eA{_urlsToCacheKeys=new Map;_urlsToCacheModes=new Map;_cacheKeysToIntegrities=new Map;_concurrentPrecaching;_precacheStrategy;_routes;_defaultHandlerMap;_catchHandler;constructor({precacheEntries:e,precacheOptions:t,skipWaiting:a=!1,importScripts:s,navigationPreload:r=!1,cacheId:i,clientsClaim:n=!1,runtimeCaching:c,offlineAnalyticsConfig:o,disableDevLogs:l=!1,fallbacks:h}={}){let{precacheStrategyOptions:u,precacheRouteOptions:d,precacheMiscOptions:f}=eU(this,t);if(this._concurrentPrecaching=f.concurrency,this._precacheStrategy=new ew(u),this._routes=new Map,this._defaultHandlerMap=new Map,this.handleInstall=this.handleInstall.bind(this),this.handleActivate=this.handleActivate.bind(this),this.handleFetch=this.handleFetch.bind(this),this.handleCache=this.handleCache.bind(this),s&&s.length>0&&self.importScripts(...s),r&&eg(),void 0!==i&&e_({prefix:i}),a?self.skipWaiting():self.addEventListener("message",e=>{e.data&&"SKIP_WAITING"===e.data.type&&self.skipWaiting()}),n&&v(),e&&e.length>0&&this.addToPrecacheList(e),f.cleanupOutdatedCaches&&E(u.cacheName),this.registerRoute(new eE(this,d)),f.navigateFallback&&this.registerRoute(new Q(this.createHandlerBoundToUrl(f.navigateFallback),{allowlist:f.navigateFallbackAllowlist,denylist:f.navigateFallbackDenylist})),void 0!==o&&("boolean"==typeof o?o&&eI({serwist:this}):eI({...o,serwist:this})),void 0!==c){if(void 0!==h){let e=new eN({fallbackUrls:h.entries,serwist:this});c.forEach(t=>{t.handler instanceof ee&&!t.handler.plugins.some(e=>"handlerDidError"in e)&&t.handler.plugins.push(e)})}for(let e of c)this.registerCapture(e.matcher,e.handler,e.method)}l&&Y()}get precacheStrategy(){return this._precacheStrategy}get routes(){return this._routes}addEventListeners(){self.addEventListener("install",this.handleInstall),self.addEventListener("activate",this.handleActivate),self.addEventListener("fetch",this.handleFetch),self.addEventListener("message",this.handleCache)}addToPrecacheList(e){let t=[];for(let a of e){"string"==typeof a?t.push(a):a&&!a.integrity&&void 0===a.revision&&t.push(a.url);let{cacheKey:e,url:s}=eR(a),r="string"!=typeof a&&a.revision?"reload":"default";if(this._urlsToCacheKeys.has(s)&&this._urlsToCacheKeys.get(s)!==e)throw new n("add-to-cache-list-conflicting-entries",{firstEntry:this._urlsToCacheKeys.get(s),secondEntry:e});if("string"!=typeof a&&a.integrity){if(this._cacheKeysToIntegrities.has(e)&&this._cacheKeysToIntegrities.get(e)!==a.integrity)throw new n("add-to-cache-list-conflicting-integrities",{url:s});this._cacheKeysToIntegrities.set(e,a.integrity)}this._urlsToCacheKeys.set(s,e),this._urlsToCacheModes.set(s,r),t.length>0&&console.warn(`Serwist is precaching URLs without revision info: ${t.join(", ")}
This is generally NOT safe. Learn more at https://bit.ly/wb-precache`)}}handleInstall(e){return D(e,async()=>{let t=new eb;this.precacheStrategy.plugins.push(t),await J(this._concurrentPrecaching,Array.from(this._urlsToCacheKeys.entries()),async([t,a])=>{let s=this._cacheKeysToIntegrities.get(a),r=this._urlsToCacheModes.get(t),i=new Request(t,{integrity:s,cache:r,credentials:"same-origin"});await Promise.all(this.precacheStrategy.handleAll({event:e,request:i,url:new URL(i.url),params:{cacheKey:a}}))});let{updatedURLs:a,notUpdatedURLs:s}=t;return{updatedURLs:a,notUpdatedURLs:s}})}handleActivate(e){return D(e,async()=>{let e=await self.caches.open(this.precacheStrategy.cacheName),t=await e.keys(),a=new Set(this._urlsToCacheKeys.values()),s=[];for(let r of t)a.has(r.url)||(await e.delete(r),s.push(r.url));return{deletedCacheRequests:s}})}handleFetch(e){let{request:t}=e,a=this.handleRequest({request:t,event:e});a&&e.respondWith(a)}handleCache(e){if(e.data&&"CACHE_URLS"===e.data.type){let{payload:t}=e.data,a=Promise.all(t.urlsToCache.map(t=>{let a;return a="string"==typeof t?new Request(t):new Request(...t),this.handleRequest({request:a,event:e})}));e.waitUntil(a),e.ports?.[0]&&a.then(()=>e.ports[0].postMessage(!0))}}setDefaultHandler(e,t="GET"){this._defaultHandlerMap.set(t,$(e))}setCatchHandler(e){this._catchHandler=$(e)}registerCapture(e,t,a){let s=eq(e,t,a);return this.registerRoute(s),s}registerRoute(e){this._routes.has(e.method)||this._routes.set(e.method,[]),this._routes.get(e.method).push(e)}unregisterRoute(e){if(!this._routes.has(e.method))throw new n("unregister-route-but-not-found-with-method",{method:e.method});let t=this._routes.get(e.method).indexOf(e);if(t>-1)this._routes.get(e.method).splice(t,1);else throw new n("unregister-route-route-not-registered")}getUrlsToPrecacheKeys(){return this._urlsToCacheKeys}getPrecachedUrls(){return[...this._urlsToCacheKeys.keys()]}getPrecacheKeyForUrl(e){let t=new URL(e,location.href);return this._urlsToCacheKeys.get(t.href)}getIntegrityForPrecacheKey(e){return this._cacheKeysToIntegrities.get(e)}async matchPrecache(e){let t=e instanceof Request?e.url:e,a=this.getPrecacheKeyForUrl(t);if(a)return(await self.caches.open(this.precacheStrategy.cacheName)).match(a)}createHandlerBoundToUrl(e){let t=this.getPrecacheKeyForUrl(e);if(!t)throw new n("non-precached-url",{url:e});return a=>(a.request=new Request(e),a.params={cacheKey:t,...a.params},this.precacheStrategy.handle(a))}handleRequest({request:e,event:t}){let a;let s=new URL(e.url,location.href);if(!s.protocol.startsWith("http"))return;let r=s.origin===location.origin,{params:i,route:n}=this.findMatchingRoute({event:t,request:e,sameOrigin:r,url:s}),c=n?.handler,o=e.method;if(!c&&this._defaultHandlerMap.has(o)&&(c=this._defaultHandlerMap.get(o)),!c)return;try{a=c.handle({url:s,request:e,event:t,params:i})}catch(e){a=Promise.reject(e)}let l=n?.catchHandler;return a instanceof Promise&&(this._catchHandler||l)&&(a=a.catch(async a=>{if(l)try{return await l.handle({url:s,request:e,event:t,params:i})}catch(e){e instanceof Error&&(a=e)}if(this._catchHandler)return this._catchHandler.handle({url:s,request:e,event:t});throw a})),a}findMatchingRoute({url:e,sameOrigin:t,request:a,event:s}){for(let r of this._routes.get(a.method)||[]){let i;let n=r.match({url:e,sameOrigin:t,request:a,event:s});if(n)return Array.isArray(i=n)&&0===i.length?i=void 0:n.constructor===Object&&0===Object.keys(n).length?i=void 0:"boolean"==typeof n&&(i=void 0),{route:r,params:i}}return{}}}"undefined"!=typeof navigator&&/^((?!chrome|android).)*safari/i.test(navigator.userAgent);let eO="cache-entries",eM=e=>{let t=new URL(e,location.href);return t.hash="",t.href};class eB{_cacheName;_db=null;constructor(e){this._cacheName=e}_getId(e){return`${this._cacheName}|${eM(e)}`}_upgradeDb(e){let t=e.createObjectStore(eO,{keyPath:"id"});t.createIndex("cacheName","cacheName",{unique:!1}),t.createIndex("timestamp","timestamp",{unique:!1})}_upgradeDbAndDeleteOldDbs(e){this._upgradeDb(e),this._cacheName&&function(e,{blocked:t}={}){let a=indexedDB.deleteDatabase(e);t&&a.addEventListener("blocked",e=>t(e.oldVersion,e)),k(a).then(()=>void 0)}(this._cacheName)}async setTimestamp(e,t){e=eM(e);let a={id:this._getId(e),cacheName:this._cacheName,url:e,timestamp:t},s=(await this.getDb()).transaction(eO,"readwrite",{durability:"relaxed"});await s.store.put(a),await s.done}async getTimestamp(e){let t=await this.getDb(),a=await t.get(eO,this._getId(e));return a?.timestamp}async expireEntries(e,t){let a=await this.getDb(),s=await a.transaction(eO,"readwrite").store.index("timestamp").openCursor(null,"prev"),r=[],i=0;for(;s;){let a=s.value;a.cacheName===this._cacheName&&(e&&a.timestamp<e||t&&i>=t?(s.delete(),r.push(a.url)):i++),s=await s.continue()}return r}async getDb(){return this._db||(this._db=await N("serwist-expiration",1,{upgrade:this._upgradeDbAndDeleteOldDbs.bind(this)})),this._db}}class eF{_isRunning=!1;_rerunRequested=!1;_maxEntries;_maxAgeSeconds;_matchOptions;_cacheName;_timestampModel;constructor(e,t={}){this._maxEntries=t.maxEntries,this._maxAgeSeconds=t.maxAgeSeconds,this._matchOptions=t.matchOptions,this._cacheName=e,this._timestampModel=new eB(e)}async expireEntries(){if(this._isRunning){this._rerunRequested=!0;return}this._isRunning=!0;let e=this._maxAgeSeconds?Date.now()-1e3*this._maxAgeSeconds:0,t=await this._timestampModel.expireEntries(e,this._maxEntries),a=await self.caches.open(this._cacheName);for(let e of t)await a.delete(e,this._matchOptions);this._isRunning=!1,this._rerunRequested&&(this._rerunRequested=!1,this.expireEntries())}async updateTimestamp(e){await this._timestampModel.setTimestamp(e,Date.now())}async isURLExpired(e){if(!this._maxAgeSeconds)return!1;let t=await this._timestampModel.getTimestamp(e),a=Date.now()-1e3*this._maxAgeSeconds;return void 0===t||t<a}async delete(){this._rerunRequested=!1,await this._timestampModel.expireEntries(Number.POSITIVE_INFINITY)}}let eK=e=>{g.add(e)};class eW{_config;_cacheExpirations;constructor(e={}){this._config=e,this._cacheExpirations=new Map,this._config.maxAgeFrom||(this._config.maxAgeFrom="last-fetched"),this._config.purgeOnQuotaError&&eK(()=>this.deleteCacheAndMetadata())}_getCacheExpiration(e){if(e===p())throw new n("expire-custom-caches-only");let t=this._cacheExpirations.get(e);return t||(t=new eF(e,this._config),this._cacheExpirations.set(e,t)),t}cachedResponseWillBeUsed({event:e,cacheName:t,request:a,cachedResponse:s}){if(!s)return null;let r=this._isResponseDateFresh(s),i=this._getCacheExpiration(t),n="last-used"===this._config.maxAgeFrom,c=(async()=>{n&&await i.updateTimestamp(a.url),await i.expireEntries()})();try{e.waitUntil(c)}catch(e){}return r?s:null}_isResponseDateFresh(e){if("last-used"===this._config.maxAgeFrom)return!0;let t=Date.now();if(!this._config.maxAgeSeconds)return!0;let a=this._getDateHeaderTimestamp(e);return null===a||a>=t-1e3*this._config.maxAgeSeconds}_getDateHeaderTimestamp(e){if(!e.headers.has("date"))return null;let t=new Date(e.headers.get("date")).getTime();return Number.isNaN(t)?null:t}async cacheDidUpdate({cacheName:e,request:t}){let a=this._getCacheExpiration(e);await a.updateTimestamp(t.url),await a.expireEntries()}async deleteCacheAndMetadata(){for(let[e,t]of this._cacheExpirations)await self.caches.delete(e),await t.delete();this._cacheExpirations=new Map}}class ej extends ee{async _handle(e,t){let a,s=await t.cacheMatch(e);if(!s)try{s=await t.fetchAndCachePut(e)}catch(e){e instanceof Error&&(a=e)}if(!s)throw new n("no-response",{url:e.url,error:a});return s}}new eA({precacheEntries:[{'revision':null,'url':'/_next/static/chunks/177-12376368dbab53dd.js'},{'revision':null,'url':'/_next/static/chunks/508-056f1d3d68dca1ae.js'},{'revision':null,'url':'/_next/static/chunks/522-2da5c47eb942d316.js'},{'revision':null,'url':'/_next/static/chunks/734-8dc9ffdc477396ef.js'},{'revision':null,'url':'/_next/static/chunks/793-3e5a3db270413c5f.js'},{'revision':null,'url':'/_next/static/chunks/812-6983b8ba475b362e.js'},{'revision':null,'url':'/_next/static/chunks/93-f16daf9888045b19.js'},{'revision':null,'url':'/_next/static/chunks/963-82e245303c9cb492.js'},{'revision':null,'url':'/_next/static/chunks/app/_not-found/page-5b5001024bb51452.js'},{'revision':null,'url':'/_next/static/chunks/app/consent/page-dd6d95726981ede7.js'},{'revision':null,'url':'/_next/static/chunks/app/debriefing/page-d3f00e4ccf35ec9d.js'},{'revision':null,'url':'/_next/static/chunks/app/draw/page-3f4c94b9bbdfb027.js'},{'revision':null,'url':'/_next/static/chunks/app/experimenter/page-80d8afc636ca8160.js'},{'revision':null,'url':'/_next/static/chunks/app/layout-8de8a7fa111ee15e.js'},{'revision':null,'url':'/_next/static/chunks/app/page-efeff1abd5e3780d.js'},{'revision':null,'url':'/_next/static/chunks/app/session/page-052a621bf2a5a3d5.js'},{'revision':null,'url':'/_next/static/chunks/app/survey/page-d8fae7e434f46a45.js'},{'revision':null,'url':'/_next/static/chunks/app/vignette/page-7d2653c06f424b62.js'},{'revision':null,'url':'/_next/static/chunks/fd9d1056-dd504a17eef30e15.js'},{'revision':null,'url':'/_next/static/chunks/framework-f66176bb897dc684.js'},{'revision':null,'url':'/_next/static/chunks/main-app-90ce1d0c34242eb2.js'},{'revision':null,'url':'/_next/static/chunks/main-e8a01f8fe743b4ad.js'},{'revision':null,'url':'/_next/static/chunks/pages/_app-72b849fbd24ac258.js'},{'revision':null,'url':'/_next/static/chunks/pages/_error-7ba65e1336b92748.js'},{'revision':'846118c33b2c0e922d7b3a7676f81f6f','url':'/_next/static/chunks/polyfills-42372ed130431b0a.js'},{'revision':null,'url':'/_next/static/chunks/webpack-ce0d7dcb781264d4.js'},{'revision':null,'url':'/_next/static/css/a096c926933b0bf5.css'},{'revision':'c155cce658e53418dec34664328b51ac','url':'/_next/static/lR0Xvv6UZx-wbe_Ng1hop/_buildManifest.js'},{'revision':'b6652df95db52feb4daf4eca35380933','url':'/_next/static/lR0Xvv6UZx-wbe_Ng1hop/_ssgManifest.js'},{'revision':'befd9c0fdfa3d8a645d5f95717ed6420','url':'/_next/static/media/26a46d62cd723877-s.woff2'},{'revision':'43828e14271c77b87e3ed582dbff9f74','url':'/_next/static/media/55c55f0601d81cf3-s.woff2'},{'revision':'f0b86e7c24f455280b8df606b89af891','url':'/_next/static/media/581909926a08bbc8-s.woff2'},{'revision':'621a07228c8ccbfd647918f1021b4868','url':'/_next/static/media/6d93bde91c0c2823-s.woff2'},{'revision':'e360c61c5bd8d90639fd4503c829c2dc','url':'/_next/static/media/97e0cb1ae144a2a9-s.woff2'},{'revision':'d4fe31e6a2aebc06b8d6e558c9141119','url':'/_next/static/media/a34f9d1faa5f3315-s.p.woff2'},{'revision':'d54db44de5ccb18886ece2fda72bdfe0','url':'/_next/static/media/df0a9ae256c0569c-s.woff2'},{'revision':'a2612bdc9773cbb36641d58eb95dd465','url':'/consent-form.pdf'},{'revision':'1cb1f0ebc849ba5e912bf308d4907e7f','url':'/debriefing-form.pdf'},{'revision':'a97aed4fe30f854dfc8302446805e424','url':'/icon-192x192.png'},{'revision':'aba8a0e113770b07e0528c557fd88950','url':'/icon-512x512.png'},{'revision':'fdc0398115885aebf7d5bd64e8931b26','url':'/manifest.json'},{'revision':'5662f34f34ab185b01421f781aa9d8ee','url':'/offline.html'},{'revision':'6f5fe2873121b87acf7f17d893282486','url':'/old-consent-form.pdf'},{'revision':'1fbfb23eac1407b5434c9ae18c62e5ac','url':'/old-debriefing-form.pdf'},{'revision':'f27b1085f1bde66bc7a1eb79c524581a','url':'/pdf.worker.mjs'}],skipWaiting:!0,clientsClaim:!0,runtimeCaching:[{matcher:e=>{let{url:t}=e;return null!==t.pathname.match(/\.(pdf|mjs)$/i)},handler:new ej({cacheName:"pdf-cache",plugins:[new eW({maxAgeSeconds:2592e3})]})},{matcher:e=>{let{url:t}=e;return t.protocol.startsWith("http")},handler:new ea({cacheName:"offlineCache",plugins:[new eW({maxEntries:200})]})}]}).addEventListeners()}();