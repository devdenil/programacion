<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('sales', function (Blueprint $table) {
            $table->id();
            $table->bigInteger('client')->unsigned();
            $table->foreign('client')->references('id')->on('users')->onUpdate('cascade')->onDelete('cascade');
            $table->bigInteger('seller')->unsigned()->nullable();
            $table->foreign('seller')->references('id')->on('users')->onUpdate('cascade')->onDelete('cascade');
            $table->double('mount');
            $table->string('type');
            $table->timestamps();
        });
        Schema::create('detailssales', function (Blueprint $table) {
            $table->id();
            $table->bigInteger('sale')->unsigned();
            $table->foreign('sale')->references('id')->on('sales')->onUpdate('cascade')->onDelete('cascade');
            $table->bigInteger('product')->unsigned();
            $table->foreign('product')->references('id')->on('products')->onUpdate('cascade')->onDelete('cascade');
            $table->integer('quantity');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('sales');
        Schema::dropIfExists('detailssales');
    }
};
