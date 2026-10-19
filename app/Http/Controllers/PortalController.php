<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Inertia\Response;

class PortalController extends Controller
{
    public function index(): Response
    {
        $config = config('portal', []);
        $hero = $config['hero'] ?? [];
        $profile = $config['profile'] ?? [];
        $tour = $config['tour'] ?? [];
        $contact = $config['contact'] ?? [];
        $phone = preg_replace('/[^0-9+]/', '', $contact['phone'] ?? '');

        $applications = collect($config['applications'] ?? [])
            ->filter(fn (array $item) => ($item['enabled'] ?? false) === true)
            ->map(function (array $item): array {
                $routeName = $item['route'] ?? null;
                $url = $routeName && Route::has($routeName) ? route($routeName, [], false) : ($item['url'] ?? null);

                return [
                    'id' => $item['id'], 'name' => $item['name'], 'description' => $item['description'] ?? '',
                    'category' => $item['category'] ?? '', 'audience' => $item['audience'] ?? '',
                    'logo' => $this->safeUrl($item['logo'] ?? null, false), 'url' => $this->safeUrl($url),
                ];
            })->values()->all();

        $banners = collect($config['banners'] ?? [])->map(fn (array $item): array => [
            'id' => $item['id'], 'label' => $item['label'] ?? 'INFORMASI', 'title' => $item['title'],
            'description' => $item['description'] ?? '', 'image' => $this->safeUrl($item['image'] ?? null, false),
            'image_alt' => $item['image_alt'] ?? '', 'url' => $this->safeUrl($item['url'] ?? null), 'button' => $item['button'] ?? 'Selengkapnya',
        ])->values()->all();

        $team = collect($config['team'] ?? [])->map(fn (array $item, int $index): array => [
            'id' => $item['id'] ?? $index, 'name' => $item['name'], 'position' => $item['position'] ?? '',
            'photo' => $this->safeUrl($item['photo'] ?? null, false), 'is_leader' => (bool) ($item['is_leader'] ?? false),
        ])->sortByDesc('is_leader')->values()->all();

        $services = collect($config['services'] ?? [])->map(fn (array $item): array => [
            'id' => $item['id'], 'title' => $item['title'], 'description' => $item['description'] ?? '',
            'url' => $this->safeUrl($item['url'] ?? null), 'action' => $item['action'] ?? 'Akses layanan',
        ])->values()->all();

        $gallery = collect($config['gallery'] ?? [])->map(fn (array $item, int $index): array => [
            'id' => $item['id'] ?? $index, 'title' => $item['title'] ?? '', 'caption' => $item['caption'] ?? '',
            'image' => $this->safeUrl($item['image'] ?? null, false),
        ])->values()->all();

        return Inertia::render('Portal/Index', [
            'portal' => [
                'title' => $config['title'] ?? 'Portal BPS', 'institution' => $config['institution'] ?? 'Badan Pusat Statistik',
                'description' => $config['description'] ?? '', 'logo' => $this->safeUrl($config['logo'] ?? null, false),
                'hero' => [
                    'image' => $this->safeUrl($hero['image'] ?? null, false), 'image_mobile' => $this->safeUrl($hero['image_mobile'] ?? null, false),
                    'foreground' => $this->safeUrl($hero['foreground'] ?? null, false), 'foreground_mobile' => $this->safeUrl($hero['foreground_mobile'] ?? null, false),
                    'alt' => $hero['alt'] ?? '', 'foreground_alt' => $hero['foreground_alt'] ?? '', 'caption' => $hero['caption'] ?? '',
                ],
                'profile' => [
                    'title' => $profile['title'] ?? 'Mengenal BPS', 'description' => $profile['description'] ?? '',
                    'video_id' => $this->videoId($profile['video_id'] ?? null),
                ],
                'team' => $team, 'services' => $services, 'gallery' => $gallery,
                'tour' => [
                    'title' => $tour['title'] ?? 'Jelajahi Kantor Kami', 'description' => $tour['description'] ?? '',
                    'video_id' => $this->videoId($tour['video_id'] ?? null),
                ],
                'contact' => [
                    'address' => $contact['address'] ?? '', 'hours' => $contact['hours'] ?? '', 'phone' => $contact['phone'] ?? '',
                    'phone_href' => preg_match('/^\+?[0-9]{6,16}$/D', $phone) ? 'tel:'.$phone : null,
                    'email' => filter_var($contact['email'] ?? '', FILTER_VALIDATE_EMAIL) ?: null,
                    'maps_url' => $this->safeUrl($contact['maps_url'] ?? null, false),
                ],
            ],
            'categories' => $config['categories'] ?? [], 'applications' => $applications,
            'banners' => $banners, 'year' => (int) now()->format('Y'),
        ]);
    }

    private function videoId(mixed $value): ?string
    {
        return is_string($value) && preg_match('/^[A-Za-z0-9_-]{11}$/D', $value) ? $value : null;
    }

    private function safeUrl(mixed $value, bool $allowFragment = true): ?string
    {
        if (!is_string($value) || $value === '' || preg_match('/[\x00-\x20\x7F]/', $value) || str_contains($value, '\\')) return null;
        if (str_starts_with($value, '#')) return $allowFragment && preg_match('/^#[a-zA-Z][a-zA-Z0-9_-]*$/D', $value) ? $value : null;
        if (str_starts_with($value, '/') && !str_starts_with($value, '//')) return $value;
        if (filter_var($value, FILTER_VALIDATE_URL) && strtolower((string) parse_url($value, PHP_URL_SCHEME)) === 'https'
            && parse_url($value, PHP_URL_USER) === null && parse_url($value, PHP_URL_PASS) === null) return $value;

        return null;
    }
}
