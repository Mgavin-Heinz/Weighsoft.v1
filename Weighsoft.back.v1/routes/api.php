<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\ContractsController;
use App\Http\Controllers\PalletController;
use App\Http\Controllers\TimeAndDateController;
use App\Http\Controllers\WeighingHeadersController;
use App\Http\Controllers\CameraController;
use App\Http\Controllers\ESP32RelayController;
use App\Http\Controllers\XeroController;
use App\Http\Controllers\XeroCallbackController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ReportingController;
use App\Http\Controllers\SettingsController;
use App\Http\Controllers\NumberplateRecognitionController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
*/

// Xero OAuth callback, tenant selection, and tenant-switch confirmation (no JWT -- runs in popup)
Route::get('xero/callback', [XeroCallbackController::class, 'callback']);
Route::post('xero/select-tenant', [XeroCallbackController::class, 'selectTenant']);
Route::post('xero/confirm-tenant-switch', [XeroCallbackController::class, 'confirmTenantSwitch']);

Route::group([],
    function () {
        Route::resource('userprofile', 'UserController');
        Route::resource('usertype', 'UserTypeController');
        Route::resource('company', 'CompanyController');
        Route::resource('site', 'SiteController');
        Route::resource('workstation', 'WorkStationsController');
        Route::resource('weighbridge', 'WeighbridgeController');
        Route::resource('camera', 'CameraController');
        Route::resource('contract', 'ContractsController');
        Route::resource('pallets', 'PalletController');
        Route::resource('tares', 'TareController');
        Route::post('contract/{id}/delete', [ContractsController::class, 'deleteWithReason']);
        Route::post('pallets/{id}/delete', [PalletController::class, 'deleteWithReason']);
        Route::post('timeAndDate', [TimeAndDateController::class, 'set']);
        Route::post('getImageFromIpString', [CameraController::class, 'getImageFromIpString']);
        Route::post('numberplate-recognition', [NumberplateRecognitionController::class, 'recognize']);
        Route::post('reportEmail', [ReportingController::class, 'email']);
        Route::post('updateImage', [SettingsController::class, 'updateImage']);
        Route::get('weighingLoad', [SettingsController::class, 'weighingLoad']);
        Route::get('weighingAdd', [SettingsController::class, 'weighingAdd']);
        Route::get('secondWeightLoad', [WeighingHeadersController::class, 'secondWeightLoad']);
        Route::resource('contracttransaction', 'ContractTransactionsController');
        Route::resource('errorlog', 'ErrorLogController');
        Route::resource('exceptions', 'ExceptionsController');
        Route::resource('reporting', 'ReportingController');
        Route::resource('businesspartner', 'BusinessPartnerController');
        Route::resource('haulier', 'HaulierController');
        Route::get('vehicle-lookup', [App\Http\Controllers\RFIDVehicleController::class, 'lookup']);
        Route::resource('rfidvehicle', 'RFIDVehicleController');
        Route::resource('grade', 'GradeController');
        Route::resource('product', 'ProductController');
        Route::resource('weighingtransactions', 'WeighingTransactionsController');
        Route::resource('weighingheaders', 'WeighingHeadersController');
        Route::post('weighingheaders/{id}/delete', [WeighingHeadersController::class, 'deleteWithReason']);

        // ESP32 Relay Control Proxy
        Route::post('esp32/relay', [ESP32RelayController::class, 'controlRelay']);
        Route::get('esp32/relay', [ESP32RelayController::class, 'getRelayStates']);

        Route::resource('authenticate', 'AuthController', ['only' => ['welcome']]);
        Route::resource('settings', 'SettingsController');
        Route::resource('axelsetup', 'AxelSetupsController');
        Route::resource('axletypes', 'AxelTypesController');

        // Xero Integration (JWT-protected)
        Route::get('xero/settings/{companyId}', [XeroController::class, 'getSettings']);
        Route::put('xero/settings/{companyId}', [XeroController::class, 'updateSettings']);
        Route::get('xero/connect/{companyId}', [XeroController::class, 'connect']);
        Route::delete('xero/disconnect/{companyId}', [XeroController::class, 'disconnect']);
        Route::post('xero/sync/{companyId}', [XeroController::class, 'syncAll']);
        Route::post('xero/sync/{companyId}/customers', [XeroController::class, 'syncCustomers']);
        Route::post('xero/sync/{companyId}/items', [XeroController::class, 'syncItems']);
        Route::get('xero/invoices/{companyId}', [XeroController::class, 'invoiceQueue']);
        Route::post('xero/invoices/{companyId}/sync-status', [XeroController::class, 'syncInvoiceStatuses']);
        Route::post('xero/invoices/{queueId}/retry', [XeroController::class, 'retryInvoice']);
        Route::post('xero/invoices/{queueId}/void', [XeroController::class, 'voidInvoice']);
        Route::post('xero/invoices/{queueId}/delete', [XeroController::class, 'deleteInvoice']);
        Route::get('xero/sync-log/{companyId}', [XeroController::class, 'syncLog']);

        Route::post('register', [AuthController::class, 'register']);
        Route::get('refresh', [AuthController::class, 'refreshToken']);
        Route::post('authenticate', [AuthController::class, 'login']);
    }
);

