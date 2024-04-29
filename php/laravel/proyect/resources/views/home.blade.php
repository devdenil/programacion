@extends('layouts.app')
<style>
.container{
    --bs-gutter-x: 0 !important;
    --bs-gutter-y: 0;
    padding-right: 0 !important;
    padding-left: 0 !important;
    margin-right: 0 !important;
    margin-left: 0 !important;
    max-width: 100% !important;
}
.footer{
    padding: 0px 95px !important;
}
.navbar {
    background: #0000004f;
    padding: 7px 95px !important;
    position:fixed !important;
    top:0 !important;
    right:0 !important;
    left:0 !important;
    z-index:1030 !important;
}
.navbar ul ul {
    background: #0000004f;
}
.navbar a,
.navbar ul ul a {
    color: white;
}
.header {
    background: linear-gradient(60deg, rgba(84, 58, 183, 1) 0%, rgba(0, 172, 193, 1) 100%);
}

.waves {
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
}

.parallax>use {
    animation: move-forever 25s cubic-bezier(.55, .5, .45, .5) infinite;
}

.parallax>use:nth-child(1) {
    animation-delay: -2s;
    animation-duration: 7s;
}

.parallax>use:nth-child(2) {
    animation-delay: -3s;
    animation-duration: 10s;
}

.parallax>use:nth-child(3) {
    animation-delay: -4s;
    animation-duration: 13s;
}

.parallax>use:nth-child(4) {
    animation-delay: -5s;
    animation-duration: 20s;
}

@keyframes move-forever {
    0% {
        transform: translate3d(-90px, 0, 0);
    }

    100% {
        transform: translate3d(85px, 0, 0);
    }
}

.bi-chevron-double-down {
    position: absolute;
    left: 50%;
    right: 50%;
    bottom: 20px;
    font-size: 25px;
    color: blue;
    z-index: 5;
    animation: slidein 3s infinite;
}

@keyframes slidein {
    from {
        height: 80px;
    }

    to {
        height: 10px;
    }
}
</style>
@section('content')

@if (session('status'))
<div class="alert alert-success" role="alert">
    {{ session('status') }}
</div>
@endif

<div class="header h-100 w-100">
    <i class="bi bi-chevron-double-down"></i>

    <svg class="waves" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
        viewBox="0 24 150 28" preserveAspectRatio="none" shape-rendering="auto">
        <defs>
            <path id="gentle-wave" d="M-160 44c30 0 58-18 88-18s 58 18 88 18 58-18 88-18 58 18 88 18 v44h-352z" />
        </defs>
        <g class="parallax">
            <use xlink:href="#gentle-wave" x="48" y="0" fill="rgba(255,255,255,0.7" />
            <use xlink:href="#gentle-wave" x="48" y="3" fill="rgba(255,255,255,0.5)" />
            <use xlink:href="#gentle-wave" x="48" y="5" fill="rgba(255,255,255,0.3)" />
            <use xlink:href="#gentle-wave" x="48" y="7" fill="#fff" />
        </g>
    </svg>
</div>

<div id="carouselExampleCaptions" class="carousel slide h-100">
  <div class="carousel-indicators">
    <button type="button" data-bs-target="#carouselExampleCaptions" data-bs-slide-to="0" class="active" aria-current="true" aria-label="Slide 1"></button>
    <button type="button" data-bs-target="#carouselExampleCaptions" data-bs-slide-to="1" aria-label="Slide 2"></button>
    <button type="button" data-bs-target="#carouselExampleCaptions" data-bs-slide-to="2" aria-label="Slide 3"></button>
  </div>
  <div class="carousel-inner">
  @forelse ($products as $product)
    <div class="carousel-item h-100 active">
      <img src="{{ asset('storage/images/' . $product->image) }}" class="d-block m-0 m-auto h-100">
      <div class="carousel-caption d-none d-md-block text-primary-emphasis">
        <h5>{{ $product->name }}</h5>
        <p>{{ $product->description }}</p>
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
  <button class="carousel-control-prev" type="button" data-bs-target="#carouselExampleCaptions" data-bs-slide="prev">
    <i class="bi bi-chevron-compact-left fs-1 text-primary-emphasis"></i>
  </button>
  <button class="carousel-control-next" type="button" data-bs-target="#carouselExampleCaptions" data-bs-slide="next">
    <i class="bi bi-chevron-compact-right fs-1 text-primary-emphasis"></i>
  </button>
</div>

@endsection