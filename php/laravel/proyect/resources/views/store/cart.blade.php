@extends('layouts.app')

@section('content')

<table class="table table-striped table-bordered" id="selected-products">
    <thead>
        <tr>
            <th scope="col">Código</th>
            <th scope="col">Nombre</th>
            <th scope="col">Precio Unitario</th>
            <th scope="col">Cantidad</th>
            <th scope="col">Subtotal</th>
            <th scope="col">Acción</th>
        </tr>
    </thead>
    <tbody>
        @if(count($cart) > 0)
        @foreach($cart as $item)
        <tr>
            <td>{{ $item['product']->code }}</td>
            <td>{{ $item['product']->name }}</td>
            <td>{{ $item['product']->pricebyunit }}</td>
            <td>
                <form id="update-cart-form-{{ $item['product']->id }}"
                    action="{{ route('store.cartUpdate', ['productId' => $item['product']->id]) }}" method="POST">
                    @csrf
                    <input type="number" class="quantity-input" name="quantity" value="{{ $item['quantity'] }}" min="1">
                </form>
            </td>
            <td>{{ $item['product']->pricebyunit * $item['quantity'] }}</td>
            <td>
                <form id="remove-to-cart-form-{{ $item['product']->id }}"
                    action="{{ route('store.cartRemove', ['productId' => $item['product']->id]) }}" method="POST">
                    @csrf
                    <button type="button" class="remove-to-cart-btn btn btn-danger"
                        data-product-id="{{ $item['product']->id }}"><i class="bi bi-trash"></i></button>
                </form>
            </td>
        </tr>
        @endforeach
        @else
        <td colspan="6">El carrito está vacío.</td>
        @endif
    </tbody>
    <tfoot>
        <tr>
            <td colspan="4" align="right">Total:</td>
            <td>
                @php
                $total = 0;
                foreach($cart as $item) {
                $total += $item['product']->pricebyunit * $item['quantity'];
                }
                echo number_format($total, 2);
                @endphp</td>
            <td><a href="{{ route('store.methodPay') }}" class="btn btn-primary">Proceder al pago</a></td>
        </tr>
    </tfoot>
</table>

<script>
$(document).ready(function() {
    loadCartItems();

    $('.remove-to-cart-btn').on('click', function() {
        var productId = $(this).data('product-id');
        var form = $('#remove-to-cart-form-' + productId);

        $.ajax({
            url: form.attr('action'),
            method: 'POST',
            data: form.serialize(),
            success: function(response) {
                loadCartItems();
                alert('Producto eliminado del carrito exitosamente.');
            },
            error: function(xhr, status, error) {
                alert('Hubo un error al agregar el producto al carrito.');
            }
        });
    });

    $('.quantity-input').on('change', function() {
        var productId = $(this).closest('form').attr('id').split('-').pop();
        var form = $('#update-cart-form-' + productId);

        $.ajax({
            url: form.attr('action'),
            method: 'POST',
            data: form.serialize(),
            success: function(response) {
                loadCartItems();
                location.reload();
            },
            error: function(xhr, status, error) {
                alert('Hubo un error al actualizar la cantidad del producto.');
            }
        });
    });

    function loadCartItems() {
        $.ajax({
            url: '{{ route('store.cart') }}',
            method: 'GET',
            success: function(response) {
                $('#cart-items-container').html(response);
            },
            error: function(xhr, status, error) {
                alert('Hubo un error al cargar los productos del carrito.');
            }
        });
    }
});
</script>


@endsection