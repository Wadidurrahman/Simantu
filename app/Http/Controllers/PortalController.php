<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Inertia\Response;

class PortalController extends Controller
{
    public function index(): Response
    {
        $applications = collect(config('portal.applications', []))
            ->filter(fn (array $application) => ($application['enabled'] ?? false) === true)
            ->map(function (array $application): array {
                $routeName = $application['route'] ?? null;

                $url = $routeName && Route::has($routeName)
                    ? route($routeName, [], false)
                    : ($application['url'] ?? null);

                return [
                    'id' => $application['id'],
                    'name' => $application['name'],
                    'description' => $application['description'] ?? '',
                    'category' => $application['category'] ?? '',
                    'audience' => $application['audience'] ?? '',
                    'logo' => $this->safeUrl($application['logo'] ?? null),
                    'url' => $this->safeUrl($url),
                ];
            })
            ->values()
            ->all();

        $banners = collect(config('portal.banners', []))
            ->map(fn (array $banner): array => [
                'id' => $banner['id'],
                'label' => $banner['label'] ?? 'INFORMASI',
                'title' => $banner['title'],
                'description' => $banner['description'] ?? '',
                'image' => $this->safeUrl($banner['image'] ?? null),
                'image_alt' => $banner['image_alt'] ?? '',
                'url' => $this->safeUrl($banner['url'] ?? null),
                'button' => $banner['button'] ?? 'Selengkapnya',
            ])
            ->values()
            ->all();

        return Inertia::render('Portal/Index', [
            'portal' => [
                'title' => config('portal.title'),
                'institution' => config('portal.institution'),
                'description' => config('portal.description'),
                'logo' => $this->safeUrl(config('portal.logo')),
                'hero' => [
                    'image' => $this->safeUrl(config('portal.hero.image')),
                    'alt' => config('portal.hero.alt'),
                    'caption' => config('portal.hero.caption'),
                ],
            ],
            'categories' => config('portal.categories', []),
            'applications' => $applications,
            'banners' => $banners,
            'year' => (int) now()->format('Y'),
        ]);
    }

    private function safeUrl(mixed $value): ?string
    {
        if (!is_string($value) || $value === '') {
            return null;
        }

        if (
            preg_match('/[\x00-\x20\x7F]/', $value)
            || str_contains($value, '\\')
        ) {
            return null;
        }

        if (str_starts_with($value, '#')) {
            return preg_match('/^#[a-zA-Z][a-zA-Z0-9_-]*$/', $value)
                ? $value
                : null;
        }

        if (str_starts_with($value, '/') && !str_starts_with($value, '//')) {
            return $value;
        }

        if (
            filter_var($value, FILTER_VALIDATE_URL)
            && strtolower((string) parse_url($value, PHP_URL_SCHEME)) === 'https'
            && parse_url($value, PHP_URL_USER) === null
            && parse_url($value, PHP_URL_PASS) === null
        ) {
            return $value;
        }

        return null;
    }
}
