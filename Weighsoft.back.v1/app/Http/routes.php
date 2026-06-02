<?php

// replaced with routes\api.php
// use Illuminate\Support\Facades\Route;
// /*
//   |--------------------------------------------------------------------------
//   | Application Routes
//   |--------------------------------------------------------------------------
//   |
//   | Here is where you can register all of the routes for an application.
//   | It's a breeze. Simply tell Laravel the URIs it should respond to
//   | and give it the controller to call when that URI is requested.
//   |
//  */

// Route::get('/', function () {
//   return view('welcome');
// });

// Route::group(['prefix' => 'api'], function () {
//   Route::resource('userprofile', 'UserController');
//   Route::resource('usertype', 'UserTypeController');
//   Route::resource('company', 'CompanyController');
//   Route::resource('site', 'SiteController');
//   Route::resource('workstation', 'WorkStationController');
//   Route::resource('weighbridge', 'WeighbridgeController');
//   Route::resource('camera', 'CameraController');

//   Route::resource('contract', 'ContractController');
//   Route::resource('pallets', 'PalletController');
//   Route::resource('tares', 'TareController');
//   Route::post('contract/{id}/delete', 'ContractController@deteleWithReason');
//   Route::post('pallets/{id}/delete', 'PalletController@deteleWithReason');
//   Route::post('timeAndDate', 'TimeAndDateController@set');
//   Route::post('getImageFromIpString', 'CameraController@getImageFromIpString');

//   Route::resource('contracttransaction', 'ContractTransactionController');
//   Route::resource('errorlog', 'ErrorLogController');
//   Route::resource('exceptions', 'ExceptionsController');
//   Route::resource('reporting', 'ReportingController');
//   Route::resource('businesspartner', 'BusinessPartnerController');
//   Route::resource('haulier', 'HauliersController');
//   Route::resource('rfidvehicle', 'RFIDVehiclesController');
//   Route::resource('grade', 'GradesController');
//   Route::resource('product', 'ProductsController');
//   Route::resource('weighingtransactions', 'WeighingTransactionsController');

//   Route::resource('weighingheaders', 'WeighingHeadersController');
//   Route::post('weighingheaders/{id}/delete', 'WeighingHeadersController@deteleWithReason');

//   Route::resource('authenticate', 'TokenAuthController', ['only' => ['welcome']]);
//   Route::resource('settings', 'SettingsController');
//   Route::resource('axelsetup', 'AxelSetupsController');
//   Route::resource('axletypes', 'AxelTypesController');

//   Route::post('register', 'TokenAuthController@register');
//   Route::get('refresh', 'TokenAuthController@refreshToken');
//   Route::post('authenticate', 'TokenAuthController@authenticate');
//   // Route::get('authenticate/user', 'TokenAuthController@getAuthenticatedUser');
// });
