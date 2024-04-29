@extends('layouts.app')

@section('content')

<div class="float-end">
    <a href="{{ route('store.cart') }}" class="btn btn-primary btn-sm">&larr; Back</a>
</div>

<form action="{{ route('store.processPay') }}" method="post">
    @csrf
    <div class="btn-group" role="group" aria-label="Opciones">

        <input type="radio" class="btn-check" name="methods" id="method1" value="1" autocomplete="off">
        <label class="btn btn-outline-primary" for="method1" data-bs-toggle="collapse" href="#collapseOption1"
            aria-expanded="false" aria-controls="collapseOption1">Metodo 1</label>

        <input type="radio" class="btn-check" name="methods" id="method2" value="2" autocomplete="off">
        <label class="btn btn-outline-primary" for="method2" data-bs-toggle="collapse" href="#collapseOption2"
            aria-expanded="false" aria-controls="collapseOption2">Metodo 2</label>
    </div>

    <div class="accordion mt-3" id="accordionExample">
        <div class="collapse" id="collapseOption1" aria-labelledby="headingOption1" data-bs-parent="#accordionExample">
            <div class="card card-body">
                <div class="mb-3">
                    <label class="form-label">Telefono</label>
                    <input type="number" class="form-control" name="phone" id="phone">
                    @if ($errors->has('phone'))
                    <span class="text-danger">{{ $errors->first('phone') }}</span>
                    @endif
                </div>
            </div>
        </div>

        <div class="collapse" id="collapseOption2" aria-labelledby="headingOption2" data-bs-parent="#accordionExample">
            <div class="card card-body">
                <div class="mb-3">
                    <label class="form-label">Direccion</label>
                    <input type="text" class="form-control" name="direction" id="direction">
                    @if ($errors->has('direction'))
                    <span class="text-danger">{{ $errors->first('direction') }}</span>
                    @endif
                    <div class="form-text">Avenida o Calle principal, calle y calle paralela - Nro</div>
                </div>
            </div>
        </div>
    </div>

    <button type="submit" class="btn btn-primary mt-4">Enviar</button>
</form>

@endsection