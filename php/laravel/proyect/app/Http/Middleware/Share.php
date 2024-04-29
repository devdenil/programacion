<?php
namespace App\Http\Middleware;

use Closure;
use App\Models\Category;

class Share
{
    public function handle($request, Closure $next)
    {
        $categories = Category::all();
        \View::share('categories', $categories);
        
        return $next($request);
    }
}
