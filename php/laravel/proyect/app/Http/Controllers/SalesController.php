<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\Auth;
use App\Models\Sales;
use App\Models\DetailsSales;
use App\Models\Product;
use App\Models\User;
use Illuminate\View\View;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class SalesController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth');
        $this->middleware('permission:edit-sale', ['only' => ['reports']]);
        $this->middleware('permission:create-sale', ['only' => ['index','create']]);
    }

    /**
     * Display a listing of the resource.
     */

     public function index()
     {
         $sales = Sales::latest()->paginate(3);
         foreach ($sales as $sale) {
             $seller = User::find($sale->seller);
             $client = User::find($sale->client);
             $sale->seller_name = $seller ? $seller->name : 'N/A';
             $sale->client_name = $client ? $client->name : 'N/A';
     
             // Cargar detalles de venta con nombres de productos
             $details = DetailsSales::where('sale', $sale->id)->get();
             foreach ($details as $detail) {
                 $product = Product::find($detail->product);
                 $detail->product_name = $product ? $product->name : 'N/A';
             }
             $sale->details = $details;
         }
     
         return view('sales.index', compact('sales'));
     }

    public function saleDetails(Request $request)
    {
        $details = $sale->details()->get();
        return response()->json($details);
    }

    public function create(Request $request)
    {
        $users = User::latest()->paginate(3);
        $products = Product::latest()->paginate(3);
    
        $cart = $request->session()->get('cartSales', []);
        $productsInCart = [];
        $typeSale = $request->session()->get('typeSale', 'unitario');
    
        foreach ($cart as $productId => $quantity) {
            $product = Product::find($productId);
    
            if ($product) {
                $price = ($typeSale == 'unitario') ? $product->pricebyunit : $product->wholesaleprice;
    
                $productsInCart[] = [
                    'product' => $product,
                    'quantity' => $quantity,
                    'price' => $price,
                ];
            }
        }
    
        return view('sales.create', compact('users', 'products', 'productsInCart'));
    }
    
     
     public function cartAdd(Request $request, $productId)
     {
         $cart = $request->session()->get('cartSales', []);
         $cart[$productId] = $cart[$productId] ?? 0;
         $cart[$productId]++;
     
         $request->session()->put('cartSales', $cart);
     
         return redirect()->route('sales.create');
     }
public function cartRemove(Request $request, $productId)
{
    $cart = $request->session()->get('cartSales', []);
    unset($cart[$productId]);

    $request->session()->put('cartSales', $cart);

    return redirect()->route('sales.create');
}

public function cartUpdate(Request $request, $productId)
{
    $quantity = $request->input('quantity');
    $request->session()->put("cartSales.$productId", $quantity);

    return response()->json(['success' => true]);
}
public function typeSale(Request $request)
    {
        $typeSale = $request->input('typeSale');
        $request->session()->put('typeSale', $typeSale);
        return response()->json(['success' => true]);
    }

    public function selectUser(Request $request)
    {
        $userId = $request->userId;
        $request->session()->put('selectedUserId', $userId);
    
        return response()->json(['success' => true]);
    }
    

    public function processPay(Request $request)
{
    $userId = Auth::id();
    $client = session()->get('selectedUserId', null);
    $typeSale = $request->session()->get('typeSale', 'unitario');

    $cart = $request->session()->get('cartSales', []);
    $montoTotal = 0;

    $sale = Sales::create([
        'client' => $client,
        'seller' => $userId,
        'mount' => $montoTotal,
        'type' => $typeSale,
    ]);

    foreach ($cart as $productId => $quantity) {
        $product = Product::find($productId);
        if ($product) {
            if ($quantity <= $product->quantity) {
                $price = $typeSale === 'unitario' ? $product->pricebyunit : $product->wholesaleprice;
                $subtotal = $price * $quantity;

                DetailsSales::create([
                    'sale' => $sale->id,
                    'product' => $productId,
                    'quantity' => $quantity,
                ]);

                $montoTotal += $subtotal;

                $product->quantity -= $quantity;
                $product->save();
            } else {
                return redirect()->route('sales.create')->with('error', 'La cantidad solicitada del producto ' . $product->name . ' es mayor a la cantidad disponible en el inventario.');
            }
        }
    }

    $sale->mount = $montoTotal;
    $sale->save();

    $request->session()->forget('cartSales');

    return redirect()->route('sales.index')
                ->withSuccess('Compra registrada.');
}
    
public function reports()
{
    // Obtener los clientes con más compras
    $topClients = DB::table('sales')
                    ->join('users', 'sales.client', '=', 'users.id')
                    ->select('users.name', DB::raw('COUNT(sales.id) as total_sales'))
                    ->groupBy('users.name')
                    ->orderByDesc('total_sales')
                    ->limit(10)
                    ->get();

    // Preparar los datos para el gráfico de frecuencia de clientes
    $labelsClients = $topClients->pluck('name');
    $dataClients = $topClients->pluck('total_sales');

    // Obtener los productos más vendidos
    $topProducts = DB::table('detailssales')
                    ->join('products', 'detailssales.product', '=', 'products.id')
                    ->select('products.name', DB::raw('SUM(detailssales.quantity) as total_quantity'))
                    ->groupBy('products.name')
                    ->orderByDesc('total_quantity')
                    ->limit(10)
                    ->get();

    // Preparar los datos para el gráfico de frecuencia de productos
    $labelsProducts = $topProducts->pluck('name');
    $dataProducts = $topProducts->pluck('total_quantity');

    // Obtener los vendedores con más ventas
    $topSellers = DB::table('sales')
                    ->join('users', 'sales.seller', '=', 'users.id')
                    ->select('users.name', DB::raw('COUNT(sales.id) as total_sales'))
                    ->groupBy('users.name')
                    ->orderByDesc('total_sales')
                    ->limit(10)
                    ->get();

    // Preparar los datos para el gráfico de frecuencia de vendedores
    $labelsSellers = $topSellers->pluck('name');
    $dataSellers = $topSellers->pluck('total_sales');

    // Obtener la cantidad de ventas por día de los últimos 10 días
    $salesPerDay = Sales::select(DB::raw('DATE(created_at) as date'), DB::raw('COUNT(*) as sales_count'))
                        ->where('created_at', '>=', now()->subDays(10))
                        ->groupBy('date')
                        ->orderBy('date')
                        ->get();

    // Preparar los datos para el gráfico de frecuencia de ventas por día
    $labelsSalesPerDay = $salesPerDay->pluck('date');
    $dataSalesPerDay = $salesPerDay->pluck('sales_count');

    return view('sales.reports', compact('labelsClients', 'dataClients', 'labelsProducts', 'dataProducts', 'labelsSalesPerDay', 'dataSalesPerDay', 'labelsSellers', 'dataSellers'));
}


        
}
