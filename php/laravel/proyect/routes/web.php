<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\RoleController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\SalesController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\StoreController;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "web" middleware group. Make something great!
|
*/

Route::get('/', function () {
    return view('welcome');
});

Auth::routes();

Route::get('/home', [HomeController::class, 'index'])->name('home');

Route::resources([
    'roles' => RoleController::class,
    'users' => UserController::class,
    'products' => ProductController::class,
]);

Route::get('/store', [StoreController::class, 'index'])->name('store.index');
Route::get('/store/category/{category}', [StoreController::class, 'category'])->name('store.category');
Route::get('/store/cart', [StoreController::class, 'cart'])->name('store.cart');
Route::post('/store/cart/add/{productId}', [StoreController::class, 'cartAdd'])->name('store.cartAdd');
Route::post('/store/cart/remove/{productId}', [StoreController::class, 'cartRemove'])->name('store.cartRemove');
Route::post('/store/cart/update/{productId}', [StoreController::class, 'cartUpdate'])->name('store.cartUpdate');
Route::get('/store/pay', [StoreController::class, 'methodPay'])->name('store.methodPay');
Route::post('/store/pay/process', [StoreController::class, 'processPay'])->name('store.processPay');

Route::get('/sales', [SalesController::class, 'index'])->name('sales.index');
Route::get('/sales/create', [SalesController::class, 'create'])->name('sales.create');
Route::post('/sales/cart/add/{productId}', [SalesController::class, 'cartAdd'])->name('sales.cartAdd');
Route::post('/sales/cart/remove/{productId}', [SalesController::class, 'cartRemove'])->name('sales.cartRemove');
Route::post('/sales/cart/update/{productId}', [SalesController::class, 'cartUpdate'])->name('sales.cartUpdate');
Route::post('/sales/type', [SalesController::class, 'typeSale'])->name('sales.typeSale');
Route::post('/sales/user', [SalesController::class, 'selectUser'])->name('sales.selectUser');
Route::post('/sales/pay/process', [SalesController::class, 'processPay'])->name('sales.processPay');
Route::get('/sales/reports', [SalesController::class, 'reports'])->name('sales.reports');