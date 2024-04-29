@extends('layouts.app')

@section('content')
<div class="d-flex flex-wrap">
    @forelse ($products as $product)
    <div class="card m-2 card-product">
        <img src="{{ asset('storage/images/' . $product->image) }}" class="card-img-top img-product" data-bs-toggle="modal"
            data-bs-target="#descriptionModal{{ $product->id }}">

        <div class="modal fade" id="descriptionModal{{ $product->id }}" tabindex="-1" aria-labelledby="descriptionModalLabel"
            aria-hidden="true">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h1 class="modal-title fs-5" id="descriptionModalLabel">{{ $product->name }}</h1>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">

                        <div class="row g-0">
                            <div class="col-md-4">
                                <img src="{{ asset('storage/images/' . $product->image) }}"
                                    class="img-fluid rounded-start">
                            </div>
                            <div class="col-md-8">
                                <div class="card-body">
                                    <h5 class="card-title">Bs.<strong>{{ $product->pricebyunit }}</strong></h5>
                                    <p class="card-text">{{ $product->description }}</p>
                                    <p class="card-text"><small class="text-body-secondary">{{ $product->updated_at }}</small></p>
                                </div>
                            </div>
                        </div>

                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cerrar</button>
                    </div>
                </div>
            </div>
        </div>


        <div class="card-body">
            <h5 class="card-title">{{ $product->name }}</h5>
            <p class="card-text">Bs.{{ $product->pricebyunit }}</p>
            <form id="add-to-cart-form-{{ $product->id }}" action="{{ route('store.cartAdd', ['productId' => $product->id]) }}" method="POST">
            @csrf
            <button type="button" class="add-to-cart-btn btn btn-primary" data-product-id="{{ $product->id }}">Agregar al <i class="bi bi-cart-plus"></i></button>
            </form>
        </div>
    </div>
    @empty
    <td colspan="4">
        <span class="text-danger">
            <strong>Error al cargar, recargue la pagina!</strong>
        </span>
    </td>
    @endforelse
</div>

{{ $products->links() }}

<script>
    $(document).ready(function() {
        $('.add-to-cart-btn').on('click', function() {
            var productId = $(this).data('product-id');
            var form = $('#add-to-cart-form-' + productId);

            $.ajax({
                url: form.attr('action'),
                method: 'POST',
                data: form.serialize(),
                success: function(response) {
                    // Manejar la respuesta del servidor, por ejemplo, mostrar un mensaje de éxito
                    alert('Producto agregado al carrito exitosamente.');
                },
                error: function(xhr, status, error) {
                    // Manejar errores, por ejemplo, mostrar un mensaje de error
                    alert('Hubo un error al agregar el producto al carrito.');
                }
            });
        });
    });
</script>

@endsection