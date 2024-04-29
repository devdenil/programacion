@extends('layouts.app')

@section('content')

<div class="row justify-content-center">
    <div class="col-md-8">

        <div class="card">
            <div class="card-header">
                <div class="float-start">
                    Editar Producto
                </div>
                <div class="float-end">
                    <a href="{{ route('products.index') }}" class="btn btn-primary btn-sm">&larr; Back</a>
                </div>
            </div>
            <div class="card-body">
                <form action="{{ route('products.update', $product->id) }}" method="post" enctype="multipart/form-data">
                    @csrf
                    @method("PUT")

                    <div class="mb-3 row">
                        <label for="name" class="col-md-4 col-form-label text-md-end text-start">Nombre</label>
                        <div class="col-md-6">
                          <input type="text" class="form-control @error('name') is-invalid @enderror" id="name" name="name" value="{{ $product->name }}">
                            @if ($errors->has('name'))
                                <span class="text-danger">{{ $errors->first('name') }}</span>
                            @endif
                        </div>
                    </div>

                    <div class="mb-3 row">
                            <label for="pricebyunit" class="col-md-4 col-form-label text-md-end text-start">Precio
                                Unitario</label>
                            <div class="col-md-6">
                                <input type="number" class="form-control @error('pricebyunit') is-invalid @enderror"
                                    id="pricebyunit" name="pricebyunit" value="{{ $product->pricebyunit }}">
                                @if ($errors->has('pricebyunit'))
                                    <span class="text-danger">{{ $errors->first('pricebyunit') }}</span>
                                @endif
                            </div>
                        </div>

                        <div class="mb-3 row">
                            <label for="wholesaleprice" class="col-md-4 col-form-label text-md-end text-start">Precio por
                                Mayor</label>
                            <div class="col-md-6">
                                <input type="number" class="form-control @error('wholesaleprice') is-invalid @enderror"
                                    id="wholesaleprice" name="wholesaleprice" value="{{ $product->wholesaleprice }}">
                                @if ($errors->has('wholesaleprice'))
                                    <span class="text-danger">{{ $errors->first('wholesaleprice') }}</span>
                                @endif
                            </div>
                        </div>

                    <div class="mb-3 row">
                        <label for="description" class="col-md-4 col-form-label text-md-end text-start">Description</label>
                        <div class="col-md-6">
                            <textarea class="form-control @error('description') is-invalid @enderror" id="description" name="description">{{ $product->description }}</textarea>
                            @if ($errors->has('description'))
                                <span class="text-danger">{{ $errors->first('description') }}</span>
                            @endif
                        </div>
                    </div>

                    <div class="mb-3 row">
                            <label for="image"
                                class="col-md-4 col-form-label text-md-end text-start">Imagen</label>
                                <img src="{{ asset('storage/images/' . $product->image) }}" class="card-img-top w-25">
                            <div class="col-md-6">
                                <input class="form-control" type="file" id="image" name="image">
                            </div>
                        </div>

                        <div class="mb-3 row">
                            <label for="quantity" class="col-md-4 col-form-label text-md-end text-start">Cantidad</label>
                            <div class="col-md-6">
                                <input type="number" class="form-control @error('quantity') is-invalid @enderror"
                                    id="quantity" name="quantity" value="{{ $product->quantity }}">
                                @if ($errors->has('quantity'))
                                    <span class="text-danger">{{ $errors->first('quantity') }}</span>
                                @endif
                            </div>
                        </div>

                        <div class="mb-3 row">
                            <label for="category"
                                class="col-md-4 col-form-label text-md-end text-start">Categoria</label>
                            <div class="col-md-6">
                                <select class="form-select" name="category" id="category">
                                    <option selected value="{{ $product->category }}">Seleccionar</option>
                                    @foreach ($categories as $category)
                                    <option value="{{ $category->id }}">{{ $category->name }}</option>
                                    @endforeach
                                </select>
                            </div>
                        </div>

                        <div class="mb-3 row">
                            <label for="category"
                                class="col-md-4 col-form-label text-md-end text-start">Categoria</label>
                            <div class="col-md-6">
                                <select class="form-select" name="status" id="category">
                                    <option selected value="{{ $product->status }}">Seleccionar</option>
                                    <option value="asset">Activo</option>
                                    <option value="inactive">Inactivo</option>
                                </select>
                            </div>
                        </div>
                    
                    <div class="mb-3 row">
                        <input type="submit" class="col-md-3 offset-md-5 btn btn-primary" value="Actualizar Datos">
                    </div>
                    
                </form>
            </div>
        </div>
    </div>    
</div>
    
@endsection