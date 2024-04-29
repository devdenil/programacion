@extends('layouts.app')

@section('content')
<div class="row">
    <div class="col-lg-4 mb-4">
        <div class="card">
            <div class="card-header">Clientes con más compras</div>
            <div class="card-body">
                <canvas id="topClientsChart" width="100" height="100"></canvas>
            </div>
        </div>
    </div>
    <div class="col-lg-4 mb-4">
        <div class="card">
            <div class="card-header">Productos más vendidos</div>
            <div class="card-body">
                <canvas id="topProductsChart" width="100" height="100"></canvas>
            </div>
        </div>
    </div>
    <div class="col-lg-4 mb-4">
        <div class="card">
            <div class="card-header">Ventas por día (Últimos 10 días)</div>
            <div class="card-body">
                <canvas id="salesPerDayChart" width="100" height="100"></canvas>
            </div>
        </div>
    </div>
</div>

<div class="row">
    <div class="col-lg-4 mb-4">
        <div class="card">
            <div class="card-header">Vendedores con más ventas</div>
            <div class="card-body">
                <canvas id="topSellersChart" width="100" height="100"></canvas>
            </div>
        </div>
    </div>
</div>

<script>
    // Código JavaScript para inicializar los gráficos utilizando Chart.js
    var ctxClients = document.getElementById('topClientsChart').getContext('2d');
    var myChartClients = new Chart(ctxClients, {
        type: 'bar',
        data: {
            labels: {!! json_encode($labelsClients) !!},
            datasets: [{
                label: 'Cantidad de compras',
                data: {!! json_encode($dataClients) !!},
                backgroundColor: 'rgba(255, 99, 132, 0.2)',
                borderColor: 'rgba(255, 99, 132, 1)',
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });

    var ctxProducts = document.getElementById('topProductsChart').getContext('2d');
    var myChartProducts = new Chart(ctxProducts, {
        type: 'bar',
        data: {
            labels: {!! json_encode($labelsProducts) !!},
            datasets: [{
                label: 'Cantidad vendida',
                data: {!! json_encode($dataProducts) !!},
                backgroundColor: 'rgba(54, 162, 235, 0.2)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });

    var ctxSalesPerDay = document.getElementById('salesPerDayChart').getContext('2d');
    var myChartSalesPerDay = new Chart(ctxSalesPerDay, {
        type: 'line',
        data: {
            labels: {!! json_encode($labelsSalesPerDay) !!},
            datasets: [{
                label: 'Ventas por día',
                data: {!! json_encode($dataSalesPerDay) !!},
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });

    var ctxSellers = document.getElementById('topSellersChart').getContext('2d');
    var myChartSellers = new Chart(ctxSellers, {
        type: 'bar',
        data: {
            labels: {!! json_encode($labelsSellers) !!},
            datasets: [{
                label: 'Cantidad de ventas',
                data: {!! json_encode($dataSellers) !!},
                backgroundColor: 'rgba(255, 206, 86, 0.2)',
                borderColor: 'rgba(255, 206, 86, 1)',
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
</script>

@endsection
