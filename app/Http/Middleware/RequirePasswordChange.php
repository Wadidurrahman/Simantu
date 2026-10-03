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

        // Jika user masuk dan wajib ganti password
        if ($user && $user->must_change_password == 1) {

            // Izinkan akses HANYA ke rute dashboard (untuk menampilkan Modal), eksekusi update, dan logout
            $allowedRoutes = [
                'dashboard',
                'password.force.update',
                'logout'
            ];

            if (!$request->routeIs($allowedRoutes)) {
                return redirect()->route('dashboard');
            }
        }

        return $next($request);
    }
}
