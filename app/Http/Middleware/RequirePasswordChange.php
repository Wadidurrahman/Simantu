<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class RequirePasswordChange
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if ($user && $user->must_change_password == 1) {
            $allowedRoutes = ['dashboard', 'password.change.update', 'logout'];

            if (!$request->routeIs($allowedRoutes)) {
                return redirect()->route('dashboard');
            }
        }

        return $next($request);
    }
}
