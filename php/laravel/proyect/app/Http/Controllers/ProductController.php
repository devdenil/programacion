<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Http\Requests\StoreProductRequest;
use App\Http\Requests\UpdateProductRequest;
use Illuminate\View\View;
use Illuminate\Http\RedirectResponse;

class ProductController extends Controller
{
    /**
     * Instantiate a new ProductController instance.
     */
    public function __construct()
    {
       $this->middleware('auth');
       $this->middleware('permission:create-product|edit-product|delete-product', ['only' => ['index','show']]);
       $this->middleware('permission:create-product', ['only' => ['create','store']]);
       $this->middleware('permission:edit-product', ['only' => ['edit','update']]);
       $this->middleware('permission:delete-product', ['only' => ['destroy']]);
    }

    /**
     * Display a listing of the resource.
     */
    public function index(): View
    {
        return view('products.index', [
            'products' => Product::latest()->paginate(3)
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(): View
    {
        return view('products.create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreProductRequest $request): RedirectResponse
    {
                $imagePath = null;
                if ($request->hasFile('image')) {
                    $image = $request->file('image');
                    $imageName = time() . '.' . $image->getClientOriginalExtension();
                    $imagePath = $image->storeAs('images', $imageName, 'public');
                }
                
                Product::create([
                    'code' => $request->code,
                    'name' => $request->name,
                    'pricebyunit' => $request->pricebyunit,
                    'wholesaleprice' => $request->wholesaleprice,
                    'description' => $request->description,
                    'image' => $imageName,
                    'category' => $request->category,
                    'quantity' => $request->quantity,
                    'status' => 'asset'
                ]);
                
                return redirect()->route('products.index')
                    ->withSuccess('Nuevo producto agregado exitosamente.');
    }

    /**
     * Display the specified resource.
     */
    public function show(Product $product): View
    {
        return view('products.show', [
            'product' => $product
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Product $product): View
    {
        return view('products.edit', [
            'product' => $product
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateProductRequest $request, Product $product): RedirectResponse
    {
        $imageName = $product->image;
        if ($request->hasFile('image')) {
            // Eliminar la imagen anterior si existe
            $imagePath = public_path("storage/images/{$imageName}");
            if (file_exists($imagePath)) {
                unlink($imagePath);
            }
            // Subir la nueva imagen
            $image = $request->file('image');
            $imageName = time() . '.' . $image->getClientOriginalExtension();
            $image->storeAs('images', $imageName, 'public');
        }

        $product->update([
            'name' => $request->name,
            'wholesaleprice' => $request->wholesaleprice,
            'pricebyunit' => $request->pricebyunit,
            'description' => $request->description,
            'image' => $imageName,
            'category' => $request->category,
            'quantity' => $request->quantity,
            'status' => $request->status
        ]);

        return redirect()->back()->withSuccess('Producto actualizado exitosamente.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Product $product): RedirectResponse
    {
        $product->delete();
        return redirect()->route('products.index')
                ->withSuccess('Product is deleted successfully.');
    }
}