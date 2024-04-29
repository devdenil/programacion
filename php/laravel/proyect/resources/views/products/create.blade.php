@extends('layouts.app')

@section('content')
    <div class="row justify-content-center">
        <div class="col-md-8">

            <div class="card">
                <div class="card-header">
                    <div class="float-start">
                        Nuevo Producto
                    </div>
                    <div class="float-end">
                        <a href="{{ route('products.index') }}" class="btn btn-primary">&larr; Back</a>
                    </div>
                </div>
                <div class="card-body">
                    <form action="{{ route('products.store') }}" method="post"  enctype="multipart/form-data">
                        @csrf

                        <div class="mb-3 row">
                            <label for="code" class="col-md-4 col-form-label text-md-end text-start">Codigo</label>
                            <div class="col-md-6">
                                <input type="text" class="form-control @error('code') is-invalid @enderror"
                                    id="code" name="code" value="{{ old('code') }}">
                                @if ($errors->has('code'))
                                    <span class="text-danger">{{ $errors->first('code') }}</span>
                                @endif
                            </div>
                        </div>

                        <div class="mb-3 row">
                            <label for="name" class="col-md-4 col-form-label text-md-end text-start">Nombre</label>
                            <div class="col-md-6">
                                <input type="text" class="form-control @error('name') is-invalid @enderror"
                                    id="name" name="name" value="{{ old('name') }}">
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
                                    id="pricebyunit" name="pricebyunit" value="{{ old('pricebyunit') }}">
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
                                    id="wholesaleprice" name="wholesaleprice" value="{{ old('wholesaleprice') }}">
                                @if ($errors->has('wholesaleprice'))
                                    <span class="text-danger">{{ $errors->first('wholesaleprice') }}</span>
                                @endif
                            </div>
                        </div>

                        <div class="mb-3 row">
                            <label for="description"
                                class="col-md-4 col-form-label text-md-end text-start">Description</label>
                            <div class="col-md-6">
                                <textarea class="form-control @error('description') is-invalid @enderror" id="description" name="description">{{ old('description') }}</textarea>
                                @if ($errors->has('description'))
                                    <span class="text-danger">{{ $errors->first('description') }}</span>
                                @endif
                            </div>
                        </div>

                        <div class="mb-3 row">
                            <label for="image"
                                class="col-md-4 col-form-label text-md-end text-start">Imagen</label>
                            <div class="col-md-6">
                                <input class="form-control" type="file" id="image" name="image">
                            </div>
                        </div>

                        <div class="mb-3 row">
                            <label for="quantity" class="col-md-4 col-form-label text-md-end text-start">Cantidad</label>
                            <div class="col-md-6">
                                <input type="number" class="form-control @error('quantity') is-invalid @enderror"
                                    id="quantity" name="quantity" value="{{ old('quantity') }}">
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
                                    <option selected>Seleccionar</option>
                                    @foreach ($categories as $category)
                                    <option value="{{ $category->id }}">{{ $category->name }}</option>
                                    @endforeach
                                </select>
                            </div>
                        </div>

                        <div class="mb-3 row">
                            <input type="submit" class="col-md-3 offset-md-5 btn btn-primary" value="Agregar Producto">
                        </div>

                    </form>
                </div>
            </div>
        </div>
    </div>
@endsection
