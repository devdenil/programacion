<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\Auth;
use App\Models\Product;
use App\Models\Category;
use App\Models\Sales;
use App\Models\DetailsSales;
use Illuminate\Http\Request;
use Illuminate\View\View;
use Illuminate\Http\RedirectResponse;
use App\Http\Requests\PayProcessRequest;

class StoreController extends Controller
{ 
    public function __construct()
    {
        $this->middleware('auth');
        $this->middleware('permission:methods-pay|process-pay', ['only' => ['methodPay']]);
    }

    public function index(): View
{
    return view('store.index', [
        'products' => Product::where('status', 'asset')->latest()->paginate(3)
    ]);
}

public function category($id): View
{
    $category = Category::where('id', $id)->firstOrFail();
    $products = Product::where('category', $category->id)
                       ->where('status', 'asset')
                       ->latest()
                       ->paginate(3);

    return view('store.index', compact('products', 'category'));
}

    public function cart(Request $request)
{
    $cart = $request->session()->get('cart', []);
    $productsInCart = [];

    foreach ($cart as $productId => $quantity) {
        $product = Product::find($productId);

        if ($product) {
            $productsInCart[] = [
                'product' => $product,
                'quantity' => $quantity
            ];
        }
    }

    return view('store.cart', ['cart' => $productsInCart]);
}

    public function cartAdd(Request $request, $productId)
{
    $cart = $request->session()->get('cart', []);
    $cart[$productId] = $cart[$productId] ?? 0;
    $cart[$productId]++;

    $request->session()->put('cart', $cart);

    return redirect()->route('store.cart');
}

public function cartRemove(Request $request, $productId)
{
    $cart = $request->session()->get('cart', []);
    unset($cart[$productId]);

    $request->session()->put('cart', $cart);

    return redirect()->route('store.cart');
}

public function cartUpdate(Request $request, $productId)
{
    $quantity = $request->input('quantity');
    $request->session()->put("cart.$productId", $quantity);

    return response()->json(['success' => true]);
}

public function methodPay()
    {
        return view('store.pay');
    }

    public function processPay(PayProcessRequest $request)
    {
        $userId = Auth::id();
        
        $cart = $request->session()->get('cart', []);
        $montoTotal = 0;
    
        $sale = Sales::create([
            'client' => $userId,
            'seller' => null,
            'mount' => $montoTotal,
            'type' => 'unitario',
        ]);
    
        foreach ($cart as $productId => $quantity) {
            $product = Product::find($productId);
            if ($product) {
                if ($quantity <= $product->quantity) {
                    $subtotal = $product->pricebyunit * $quantity;

                    DetailsSales::create([
                        'sale' => $sale->id,
                        'product' => $productId,
                        'quantity' => $quantity,
                    ]);
    
                    $montoTotal += $subtotal;
    
                    $product->quantity -= $quantity;
                    $product->save();
                } else {
                    return redirect()->route('store.cart')->with('error', 'La cantidad solicitada del producto ' . $product->name . ' es mayor a la cantidad disponible en el inventario.');
                }
            }
        }

        $sale->mount = $montoTotal;
        $sale->save();
    
        $request->session()->forget('cart');
    
        return redirect()->route('store.index')
                    ->withSuccess('Compra exitosamente procesada, revise su correo electronico.');
    }
    
}