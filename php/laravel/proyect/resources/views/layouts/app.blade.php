<!DOCTYPE html>
<html lang="es">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="csrf-token" content="{{ csrf_token() }}">

    <title>E-commerce</title>

    <!-- Fonts -->
    <link rel="dns-prefetch" href="//fonts.bunny.net">
    <link href="https://fonts.bunny.net/css?family=Nunito" rel="stylesheet">
    <link rel="stylesheet" href="{{ asset('css/app.css') }}">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.5/font/bootstrap-icons.css">
    <!-- Scripts -->
    @vite(['resources/sass/app.scss', 'resources/js/app.js'])

    <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>

</head>

<body>
    <div id="app">
        <nav class="navbar navbar-expand-md navbar-light shadow-sm mb-4 rounded-5 rounded-top-0">
            <div class="container">
                <a class="navbar-brand" href="{{ url('/') }}">
                    E-commerce
                </a>
                <button class="navbar-toggler" type="button" data-bs-toggle="collapse"
                    data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent"
                    aria-expanded="false" aria-label="{{ __('Toggle navigation') }}">
                    <span class="navbar-toggler-icon"></span>
                </button>

                <div class="collapse navbar-collapse" id="navbarSupportedContent">
                    <ul class="navbar-nav me-auto">
                    </ul>
                    <ul class="navbar-nav ms-auto">
                        <li class="nav-item">
                            <a class="nav-link" href="{{ route('home') }}">Inicio</a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link" href="{{ route('store.index') }}">Productos</a>
                        </li>
                        <li class="nav-item dropdown">
                            <a class="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown"
                                aria-expanded="false">
                                Categorias
                            </a>
                            <ul class="dropdown-menu">
                                @foreach ($categories as $category)
                                <li><a class="dropdown-item"
                                        href="{{ route('store.category', $category->id) }}">{{ $category->name }}</a>
                                </li>
                                @endforeach
                            </ul>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link" href="{{ route('store.cart') }}">Carrito</a>
                        </li>
                        <!-- Authentication Links -->
                        @guest
                        @if (Route::has('login'))
                        <li class="nav-item">
                            <a class="nav-link" href="{{ route('login') }}">{{ __('Ingresar') }}</a>
                        </li>
                        @endif

                        @if (Route::has('register'))
                        <li class="nav-item">
                            <a class="nav-link" href="{{ route('register') }}">{{ __('Registrarse') }}</a>
                        </li>
                        @endif
                        @else
                        @canany(['create-sale', 'edit-sale'])
                        <li><a class="nav-link" href="{{ route('sales.index') }}">Administrar Ventas</a></li>
                        @endcanany
                        @canany(['create-role', 'edit-role', 'delete-role'])
                        <li><a class="nav-link" href="{{ route('roles.index') }}">Administrar Roles</a></li>
                        @endcanany
                        @canany(['create-user', 'edit-user', 'delete-user'])
                        <li><a class="nav-link" href="{{ route('users.index') }}">Administrar Usuarios</a></li>
                        @endcanany
                        @canany(['create-product', 'edit-product', 'delete-product'])
                        <li><a class="nav-link" href="{{ route('products.index') }}">Administrar Productos</a></li>
                        @endcanany

                        <li class="nav-item dropdown">
                            <a class="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown"
                                aria-expanded="false">
                                {{ Auth::user()->name }}
                            </a>
                            <ul class="dropdown-menu">
                                <li class="nav-item">
                                    <a class="dropdown-item" href="{{ route('logout') }}" onclick="event.preventDefault();
                                                     document.getElementById('logout-form').submit();">
                                        {{ __('Cerrar Sesion') }}
                                    </a>
                                    <form id="logout-form" action="{{ route('logout') }}" method="POST" class="d-none">
                                        @csrf
                                    </form>
                                </li>
                            </ul>
                        </li>
                        @endguest

                        <li>
                            <div class="dropdown bd-mode-toggle">
                                <button class="btn btn-bd-primary py-2 dropdown-toggle d-flex align-items-center"
                                    id="bd-theme" type="button" aria-expanded="false" data-bs-toggle="dropdown"
                                    aria-label="Toggle theme (auto)">
                                    <i class="bi bi-circle-half me-2 opacity-50 theme-icon"></i>
                                    <span class="visually-hidden" id="bd-theme-text">Cambiar Tema</span>
                                </button>
                                <ul class="dropdown-menu dropdown-menu-end shadow" aria-labelledby="bd-theme-text">
                                    <li>
                                        <button type="button" class="dropdown-item d-flex align-items-center"
                                            data-bs-theme-value="light" aria-pressed="false" id="light-theme-btn">
                                            <i class="bi bi-sun me-2 opacity-50 theme-icon"></i>
                                            Claro
                                            <i class="bi bi-check2 ms-auto d-none"></i>
                                        </button>
                                    </li>
                                    <li>
                                        <button type="button" class="dropdown-item d-flex align-items-center"
                                            data-bs-theme-value="dark" aria-pressed="false" id="dark-theme-btn">
                                            <i class="bi bi-moon me-2 opacity-50 theme-icon"></i>
                                            Oscuro
                                            <i class="bi bi-check2 ms-auto d-none"></i>
                                        </button>
                                    </li>
                                    <li>
                                        <button type="button" class="dropdown-item d-flex align-items-center"
                                            data-bs-theme-value="auto" aria-pressed="true" id="auto-theme-btn">
                                            <i class="bi bi-circle-half me-2 opacity-50 theme-icon"></i>
                                            Automatico
                                            <i class="bi bi-check2 ms-auto d-none"></i>
                                        </button>
                                    </li>
                                </ul>
                            </div>
                        </li>
                    </ul>
                </div>
            </div>
        </nav>

        <main class="container">
            @if ($message = Session::get('success'))
            <div class="alert alert-success text-center" role="alert">
                {{ $message }}
            </div>
            @endif
            @if ($message = Session::get('error'))
            <div class="alert alert-danger text-center" role="alert">
                {{ $message }}
            </div>
            @endif

            @yield('content')
        </main>

        <footer class="ps-5 pe-5 pt-4 mt-5 shadow-lg rounded-5 rounded-bottom-0">
            <div class="row">
                <div class="col-6 col-md-2 mb-3">
                    <h5>Section</h5>
                    <ul class="nav flex-column">
                        <li class="nav-item mb-2"><a href="#" class="nav-link p-0 text-body-secondary">Home</a></li>
                        <li class="nav-item mb-2"><a href="#" class="nav-link p-0 text-body-secondary">Features</a></li>
                        <li class="nav-item mb-2"><a href="#" class="nav-link p-0 text-body-secondary">Pricing</a></li>
                        <li class="nav-item mb-2"><a href="#" class="nav-link p-0 text-body-secondary">FAQs</a></li>
                        <li class="nav-item mb-2"><a href="#" class="nav-link p-0 text-body-secondary">About</a></li>
                    </ul>
                </div>

                <div class="col-6 col-md-2 mb-3">
                    <h5>Section</h5>
                    <ul class="nav flex-column">
                        <li class="nav-item mb-2"><a href="#" class="nav-link p-0 text-body-secondary">Home</a></li>
                        <li class="nav-item mb-2"><a href="#" class="nav-link p-0 text-body-secondary">Features</a></li>
                        <li class="nav-item mb-2"><a href="#" class="nav-link p-0 text-body-secondary">Pricing</a></li>
                        <li class="nav-item mb-2"><a href="#" class="nav-link p-0 text-body-secondary">FAQs</a></li>
                        <li class="nav-item mb-2"><a href="#" class="nav-link p-0 text-body-secondary">About</a></li>
                    </ul>
                </div>

                <div class="col-6 col-md-2 mb-3">
                    <h5>Section</h5>
                    <ul class="nav flex-column">
                        <li class="nav-item mb-2"><a href="#" class="nav-link p-0 text-body-secondary">Home</a></li>
                        <li class="nav-item mb-2"><a href="#" class="nav-link p-0 text-body-secondary">Features</a></li>
                        <li class="nav-item mb-2"><a href="#" class="nav-link p-0 text-body-secondary">Pricing</a></li>
                        <li class="nav-item mb-2"><a href="#" class="nav-link p-0 text-body-secondary">FAQs</a></li>
                        <li class="nav-item mb-2"><a href="#" class="nav-link p-0 text-body-secondary">About</a></li>
                    </ul>
                </div>

                <div class="col-md-5 offset-md-1 mb-3">
                    <form>
                        <h5>Subscribe to our newsletter</h5>
                        <p>Monthly digest of what's new and exciting from us.</p>
                        <div class="d-flex flex-column flex-sm-row w-100 gap-2">
                            <label for="newsletter1" class="visually-hidden">Email address</label>
                            <input id="newsletter1" type="text" class="form-control" placeholder="Email address">
                            <button class="btn btn-primary" type="button">Subscribe</button>
                        </div>
                    </form>
                </div>
            </div>

            <div class="d-flex flex-column flex-sm-row justify-content-between py-4 border-top">
                <p>&copy; 2023 Company, Inc. All rights reserved.</p>
                <ul class="list-unstyled d-flex">
                    <li class="ms-3"><a class="link-body-emphasis" href="#"><svg class="bi" width="24" height="24">
                                <use xlink:href="#twitter" />
                            </svg></a></li>
                    <li class="ms-3"><a class="link-body-emphasis" href="#"><svg class="bi" width="24" height="24">
                                <use xlink:href="#instagram" />
                            </svg></a></li>
                    <li class="ms-3"><a class="link-body-emphasis" href="#"><svg class="bi" width="24" height="24">
                                <use xlink:href="#facebook" />
                            </svg></a></li>
                </ul>
            </div>
        </footer>
    </div>

    <script>
    function setTheme(theme) {
        document.documentElement.setAttribute('data-bs-theme', theme);
        // Guardar la preferencia del usuario en una cookie
        document.cookie = "theme=" + theme + ";path=/";
    }

    document.getElementById('dark-theme-btn').addEventListener('click', function() {
        setTheme('dark');
        updateCheckmarks('dark-theme-btn');
    });

    document.getElementById('light-theme-btn').addEventListener('click', function() {
        setTheme('light');
        updateCheckmarks('light-theme-btn');
    });

    document.getElementById('auto-theme-btn').addEventListener('click', function() {
        // Detectar el tema del dispositivo o del navegador
        const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const newTheme = prefersDarkScheme ? 'dark' : 'light';
        setTheme(newTheme);
        updateCheckmarks(newTheme + '-theme-btn');
    });

    // Función para obtener el valor de una cookie
    function getCookie(name) {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop().split(';').shift();
    }

    // Establecer el tema inicial desde la cookie al cargar la página
    window.onload = function() {
        const theme = getCookie("theme") || 'auto';
        if (theme === 'auto') {
            // Detectar el tema del dispositivo o del navegador si está en modo "Auto"
            const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)').matches;
            const newTheme = prefersDarkScheme ? 'dark' : 'light';
            setTheme(newTheme);
        } else {
            // Establecer el tema desde la cookie si no está en modo "Auto"
            setTheme(theme);
        }
        updateCheckmarks(theme + '-theme-btn');
    };

    // Función para actualizar los íconos de verificación y el fondo del botón activo
    function updateCheckmarks(activeButtonId) {
        const buttons = document.querySelectorAll('.dropdown-menu button');
        buttons.forEach(function(button) {
            const isActive = button.id === activeButtonId;
            button.querySelector('.bi.bi-check2').classList.toggle('d-none', !isActive);
            button.classList.toggle('bg-primary', isActive);
            button.classList.toggle('text-white', isActive);
        });
    }
    </script>

</body>

</html>