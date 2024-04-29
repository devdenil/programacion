@extends('layouts.app')
@section('content')
<div class="card">
<form action="{{ route('sales.processPay') }}" method="POST">
    @csrf
    <div class="card-header">Nueva Venta</div>
    <div class="card-body">
        <div class="row">
            <div class="col">
                <input class="form-control mb-4" list="datalistOptions" id="searchProducts"
                    placeholder="Buscar por código o nombre">
                <datalist id="datalistOptions">
                    @foreach ($products as $product)
                    <option value="{{ $product->code }}">
                        @endforeach
                </datalist>

                <table class="table table-striped table-bordered" id="productsTable">
                    <thead>
                        <tr>
                            <th scope="col">Codigo</th>
                            <th scope="col">Producto</th>
                            <th scope="col">Precio<br>Unitario</th>
                            <th scope="col">Precio<br>Mayoritario</th>
                            <th scope="col">Cantidad<br>Disponible</th>
                        </tr>
                    </thead>
                    <tbody>
                        @forelse ($products as $product)
                        <tr>
                            <th scope="row">{{ $product->code }}</th>
                            <td>{{ $product->name }}</td>
                            <td>{{ $product->pricebyunit }}</td>
                            <td>{{ $product->wholesaleprice }}</td>
                            <td>{{ $product->quantity }}</td>
                            <td>
                                <form id="add-to-cart-form-{{ $product->id }}"
                                    action="{{ route('sales.cartAdd', ['productId' => $product->id]) }}" method="POST">
                                    @csrf
                                    <button type="button" class="add-to-cart-btn btn btn-primary"
                                        data-product-id="{{ $product->id }}"><i class="bi bi-cart-plus"></i></button>
                                </form>
                            </td>
                        </tr>
                        @empty
                        <td colspan="4">
                            <span class="text-danger">
                                <strong>No Product Found!</strong>
                            </span>
                        </td>
                        @endforelse
                    </tbody>
                </table>

                {{ $products->links() }}
            </div>
            <div class="col">
                <h2>Carrito</h2>
                <div class="btn-group mb-3" role="group" aria-label="Switch">
    <input type="radio" class="btn-check switch-option" name="switch" id="unitario" autocomplete="off">
    <label class="btn btn-outline-primary" for="unitario">Unitario <i class="bi bi-box"></i></label>

    <input type="radio" class="btn-check switch-option" name="switch" id="mayorista" autocomplete="off">
    <label class="btn btn-outline-primary" for="mayorista">Mayorista <i class="bi bi-boxes"></i></label>
</div>

                <table class="table table-striped table-bordered" id="selected-products">
                    <thead>
                        <tr>
                            <th scope="col">Código</th>
                            <th scope="col">Nombre</th>
                            <th scope="col">Precio Unitario</th>
                            <th scope="col">Cantidad</th>
                            <th scope="col">Subtotal</th>
                        </tr>
                    </thead>
                    <tbody>
                        @if(count($productsInCart) > 0)
                        @foreach($productsInCart as $item)
                        <tr>
                            <td>{{ $item['product']->code }}</td>
                            <td>{{ $item['product']->name }}</td>
                            <td>{{ $item['price'] }}</td>
                            <td>
                            <form id="update-cart-form-{{ $item['product']->id }}"
                            action="{{ route('sales.cartUpdate', ['productId' => $item['product']->id]) }}" method="POST">
                            @csrf
                            <input type="number" class="quantity-input" name="quantity" value="{{ $item['quantity'] }}" min="1">
                            </form>
                            </td>
                            <td>{{ $item['price'] * $item['quantity'] }}</td>
                            <td>
                                <form id="remove-to-cart-form-{{ $item['product']->id }}"
                                    action="{{ route('sales.cartRemove', ['productId' => $item['product']->id]) }}"
                                    method="POST">
                                    @csrf
                                    <button type="button" class="remove-to-cart-btn btn btn-danger"
                                        data-product-id="{{ $item['product']->id }}"><i class="bi bi-cart-dash"></i></button>
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
                            </td>
                            <td colspan="4" align="right">Total:</td>
                            <td>
                            @php
                            $total = 0;
                            foreach($productsInCart as $item) {
                            $total += $item['price'] * $item['quantity'];
                            }
                            echo number_format($total, 2);
                            @endphp
                            </td>
                        </tr>
                    </tfoot>
                </table>
            </div>
        </div>

        <div class="row">

        <div class="col">
    @can('create-user')
    <a href="{{ route('users.create') }}" class="btn btn-primary mb-3"><i class="bi bi-plus-circle"></i> Nuevo Cliente</a>
    @endcan

    <input class="form-control mb-4" list="datalistUsers" id="searchUsers" placeholder="Buscar por nombre">

    <datalist id="datalistUsers">
        @foreach ($users as $user)
        <option value="{{ $user->name }}"> 
            @endforeach
    </datalist>

    <table class="table table-striped table-bordered" id="usersTable">
        <thead>
            <tr>
                <th scope="col">Nombre</th>
                <th scope="col">Correo</th>
            </tr>
        </thead>
        <tbody>
            @forelse ($users as $user)
            <tr>
                <th scope="row">{{ $user->name }}</th>
                <td>{{ $user->email }}</td>
                <td><button type="button" class="btn btn-primary select-user"><i class="bi bi-check2-circle" data-user-id="{{ $user->id }}"></i></button></td> 
            </tr>
            @empty
            <td colspan="4">
                <span class="text-danger">
                    <strong>No Users Found!</strong>
                </span>
            </td>
            @endforelse
        </tbody>
    </table>
    {{ $users->links() }}
</div>

            <div class="col">
                <div class="row g-3 align-items-center">
                    <div class="col-auto">
                        <label class="col-form-label">Monto Ingresado</label>
                    </div>
                    <div class="col-auto">
                        <input type="number" class="form-control" id="montoIngresado" placeholder="Bs." onchange="calcularSaldo()">
                    </div>
                    <div class="col-auto">
                        <span id="saldo" class="form-text fs-4">Su cambio es: </span>
                    </div>
                </div>
                <button type="submit" class="btn btn-primary mb-3 mt-4">Registrar Venta</button>
            </div>
        </div>
    </div>
</form>
</div>

<script>
    var inputProducts = document.getElementById('searchProducts');
    var tableProducts = document.getElementById('productsTable');

    inputProducts.addEventListener('keyup', function() {
        var searchTerm = inputProducts.value.toLowerCase();

        var rows = tableProducts.getElementsByTagName('tr');

        for (var i = 1; i < rows.length; i++) {
            var codeCell = rows[i].getElementsByTagName('td')[0];
            var nameCell = rows[i].getElementsByTagName('td')[1];

            var codeText = codeCell.textContent.toLowerCase();
            var nameText = nameCell.textContent.toLowerCase();

            if (codeText.includes(searchTerm) || nameText.includes(searchTerm)) {
                rows[i].style.display = '';
            } else {
                rows[i].style.display = 'none';
            }
        }
    });

var input = document.getElementById('searchUsers');
var table = document.getElementById('usersTable');

input.addEventListener('keyup', function() {
    var searchTerm = input.value.toLowerCase();

    var rows = table.getElementsByTagName('tr');

    for (var i = 1; i < rows.length; i++) {
        var codeCell = rows[i].getElementsByTagName('td')[0];
        var nameCell = rows[i].getElementsByTagName('td')[1];

        var codeText = codeCell.textContent.toLowerCase();
        var nameText = nameCell.textContent.toLowerCase();

        if (codeText.includes(searchTerm) || nameText.includes(searchTerm)) {
            rows[i].style.display = '';
        } else {
            rows[i].style.display = 'none';
        }
    }
});
</script>

<script>
$(document).ready(function() {
    loadCartItems();

    $('.add-to-cart-btn').on('click', function() {
        var productId = $(this).data('product-id');
        var form = $('#add-to-cart-form-' + productId);

        $.ajax({
            url: form.attr('action'),
            method: 'POST',
            data: form.serialize(),
            success: function(response) {
                location.reload();
            },
            error: function(xhr, status, error) {
                alert('Hubo un error al agregar el producto al carrito.');
            }
        });
    });

    $('.remove-to-cart-btn').on('click', function() {
        var productId = $(this).data('product-id');
        var form = $('#remove-to-cart-form-' + productId);

        $.ajax({
            url: form.attr('action'),
            method: 'POST',
            data: form.serialize(),
            success: function(response) {
                loadCartItems();
                location.reload();
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
            url: '{{ route('sales.create') }}',
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

<script>
$(document).ready(function() {
    var typeSale = "{{ session('typeSale', 'unitario') }}";
    $("#" + typeSale).prop('checked', true);
    $("#" + typeSale).addClass('bg-primary');
});

$('.switch-option').change(function() {
    var selectedOption = $(this).attr('id');

    $.ajax({
        url: "{{ route('sales.typeSale') }}",
        method: "POST",
        data: {
            typeSale: selectedOption,
            _token: "{{ csrf_token() }}"
        },
        success: function(response) {
            $('.switch-option').removeClass('bg-primary');
            $("#" + selectedOption).addClass('bg-primary');
        },
        error: function(xhr, status, error) {
            console.error(error);
        }
    });
});
</script>

<script>
    $(document).ready(function() {
        var selectedUserId = '{{ session("selectedUserId") }}';
        if (selectedUserId) {
            $('.select-user[data-user-id="' + selectedUserId + '"]').addClass('btn-light');
        }
        $('.select-user').on('click', function() {
            var userId = $(this).data('user-id');
            $('.select-user').removeClass('btn-light');
            $(this).addClass('btn-light');

            var csrfToken = '{{ csrf_token() }}';

            $.ajax({
                url: '{{ route("sales.selectUser") }}',
                method: 'POST',
                data: {
                    userId: userId,
                    _token: csrfToken
                },
            });
        });
    });
</script>

<script>
    function calcularSaldo() {
        var montoIngresado = parseFloat(document.getElementById('montoIngresado').value);
        var total = parseFloat('{{ $total }}');

        if (isNaN(montoIngresado) || isNaN(total)) {
            document.getElementById('saldo').textContent = 'Ingrese un monto válido';
            return;
        }

        var saldo = montoIngresado - total;
        document.getElementById('saldo').textContent = 'Su cambio es: ' + saldo.toFixed(2);
    }
</script>



@endsection