@extends('layouts.app')

@section('content')
<div class="card">
    <div class="card-header">Administrar Ventas</div>
    <div class="card-body">
        @can('create-sale')
            <a href="{{ route('sales.create') }}" class="btn btn-primary"><i class="bi bi-plus-circle"></i> Nueva Venta</a>
        @endcan
        @can('edit-sale')
            <a href="{{ route('sales.reports') }}" class="btn btn-primary"><i class="bi bi-file-earmark-ruled"></i> Reportes</a>
        @endcan

        <div class="table-responsive">
            <table class="table table-striped">
                <thead>
                    <tr>
                        <th scope="col">Fecha</th>
                        <th scope="col">Vendedor/a</th>
                        <th scope="col">Cliente</th>
                        <th scope="col">Monto</th>
                        <th scope="col">Tipo</th>
                    </tr>
                </thead>
                <tbody id="tablaVentas">
                    @forelse ($sales as $sale)
                    <tr data-bs-toggle="collapse" data-bs-target="#collapse{{ $sale->id }}" aria-expanded="false" aria-controls="collapse{{ $sale->id }}">
                        <td>{{ $sale->created_at }}</td>
                        <td>{{ $sale->seller_name }}</td>
                        <td>{{ $sale->client_name }}</td>
                        <td>{{ $sale->mount }}</td>
                        <td>{{ $sale->type }}</td>
                    </tr>
                    <tr>
                        <td colspan="5" class="hiddenRow">
                            <div id="collapse{{ $sale->id }}" class="collapse">
                                <table class="table">
                                    <thead>
                                        <tr>
                                            <th scope="col">Producto</th>
                                            <th scope="col">Cantidad</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        @foreach ($sale->details as $detail)
                                        <tr>
                                            <td>{{ $detail->product_name }}</td>
                                            <td>{{ $detail->quantity }}</td>
                                        </tr>
                                        @endforeach
                                    </tbody>
                                </table>
                            </div>
                        </td>
                    </tr>
                    @empty
                    <tr>
                        <td colspan="5">No hay ventas registradas.</td>
                    </tr>
                    @endforelse
                </tbody>
            </table>
        </div>
        {{ $sales->links() }}
    </div>
</div>
@endsection
