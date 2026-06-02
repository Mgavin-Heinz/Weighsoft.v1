System Overview (Plain English)
This codebase is a two-app system:

Weighsoft.ui.v1 is a legacy AngularJS 1.4 single-page app used by operators/admins.
Weighsoft.back.v1 is a Laravel 8 + PHP 8.3 API backend that handles auth, business logic, persistence, and integrations.
At runtime, the UI talks to the backend REST API, and also talks to a separate scale endpoint (WebSocket/HTTP) for live weight data.


app.js
Lines 22-44
var app = angular.module('xenon-app', [
    'ngCookies',
    'ui.router',
    ...
    'restangular',
    ...
]);

composer.json
Lines 10-16
"require": {
    "php": "^8.3",
    ...
    "laravel/framework": "^8.40",
    ...
    "tymon/jwt-auth": "dev-develop"
},
Frontend Architecture
AngularJS app organized by old-school modules: xenon.controllers, xenon.services, xenon.factory.
Navigation is state-based (ui.router) with many feature states in one large routes.js.
API client is Restangular, with base URL from window.__env.base.
Auth token is stored in localStorage and appended to requests as token request param.
A lot of business behavior is concentrated in very large controllers (notably weighing flows), rather than split into small domain services.

routes.js
Lines 10-15
$authProvider.loginUrl = base + '/api/authenticate';
RestangularProvider.setBaseUrl(base + '/api');
RestangularProvider.setResponseExtractor(function (response) {
    return response;
});

app.js
Lines 53-59
$state.user_info = MyLocalStorage.getItem('user_info');
if($state.user_info){
    ...
    Restangular.setDefaultRequestParams({token: $state.user_info.token});
}
Frontend domain flow (weighing)
WeighingCreateCtrl manages the full weighing workflow: setup selection, camera polling, number plate recognition, contract/pallet/tare calculations, WebSocket listening, and save/print.
Hardware interactions include:
scale via /scale + /ws/emso
sync broadcast via /ws/syncin
ESP32 relay through backend proxy endpoint.

weighing_create.js
Lines 829-836
function startScale(record, port) {
    const bases = getScaleBases();
    return $http.post(bases.httpBase + '/scale', {
        record: record,
        enabled: true,
        port: port
    });
}

weighing_create.js
Lines 851-853
const bases = getScaleBases();
scaleSocket = new WebSocket(bases.wsBase + "/ws/emso");
Backend Architecture
Laravel API routes are in routes/api.php; many resources map directly to controllers.
Most controllers inherit JwtAuthController, which enforces auth:api.
Heavy domain logic is split across app/Services/*, especially for weighing header/transactions/contracts/cameras.
Persistence is mixed:
Eloquent models
significant hand-written SQL in services (especially UUID conversion + complex selects/inserts).

JwtAuthController.php
Lines 31-37
protected function __construct() {
    $this->middleware('auth:api');
    try {
        $this->user = auth()->user();

api.php
Lines 66-68
Route::resource('weighingtransactions', 'WeighingTransactionsController');
Route::resource('weighingheaders', 'WeighingHeadersController');
Route::post('weighingheaders/{id}/delete', [WeighingHeadersController::class, 'deleteWithReason']);
Key backend domain behavior
WeighingHeadersController orchestrates save/update/delete, invokes services, creates transactions, handles contract linking, camera capture, and queues Xero jobs.
WeighingHeaderService handles large SQL operations and UUID conversion strategy (UUID_TO_BIN/BIN_TO_UUID pattern is used heavily in code/docs).
Specialized integration endpoints include ESP32 relay proxy and Xero sync queueing.
End-to-End Shape
User logs into Angular app.
UI stores JWT-bearing user payload in localStorage.
UI calls backend /api/* endpoints through Restangular.
For active weighing, UI also connects to scale endpoint for live data.
On save, backend creates header + transactions + optional contract/camera records and may queue Xero invoice jobs.
Unclear / Risky Areas
Auth route mismatch: frontend posts to /api/authenticate, but backend docs/comments mention /api/login, and routes include refreshToken mapping to a method name that doesn’t appear to exist.
routes/api.php uses Route::get('refresh', [AuthController::class, 'refreshToken']);
AuthController has refresh() (not refreshToken()).
Env bootstrap typo in frontend: window.__env = window.__end || {}; likely disables external env injection unexpectedly.
Controller bloat in UI: critical workflows are in very large controllers, making behavior hard to reason about and increasing regression risk.
Mixed conventions in backend data layer: Eloquent + raw SQL + manual UUID conversion creates cognitive load and increases chance of subtle bugs.
Route organization not explicit about auth grouping: auth appears enforced via controller constructors, not clear route groups/middleware declarations in api.php, which makes security posture harder to audit quickly.
Docs/version drift signals: docs and code suggest mixed historical naming (login vs authenticate, old/new patterns), so some architecture docs may be partially stale.