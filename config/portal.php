<?php

return [
    'title' => 'Portal Aplikasi',
    'institution' => 'BPS Kota Probolinggo',
    'description' => 'Akses aplikasi, layanan, dan informasi BPS Kota Probolinggo dengan lebih mudah dalam satu portal.',
    'logo' => null,

    'hero' => [
        'image' => '/images/gedung-bps.webp',
        'alt' => 'Gedung BPS Kota Probolinggo',
        'caption' => 'Badan Pusat Statistik Kota Probolinggo',
    ],

    'categories' => [
        ['id' => 'internal', 'label' => 'Internal'],
        ['id' => 'publik', 'label' => 'Layanan Publik'],
        ['id' => 'pusat', 'label' => 'Aplikasi Pusat'],
    ],

    'applications' => [
        [
            'id' => 'simantu',
            'name' => 'SIMANTU',
            'description' => 'Pengelolaan kegiatan, penugasan, dan administrasi pegawai serta mitra.',
            'category' => 'internal',
            'audience' => 'Pegawai dan mitra',
            'route' => 'dashboard',
            'url' => null,
            'logo' => null,
            'enabled' => true,
        ],
    ],

    'banners' => [
        [
            'id' => 'jelajahi-aplikasi',
            'label' => 'LAYANAN DIGITAL',
            'title' => 'Aplikasi yang Anda perlukan, dalam satu tempat.',
            'description' => 'Temukan sistem dan layanan sesuai kebutuhan melalui direktori aplikasi BPS Kota Probolinggo.',
            'image' => null,
            'image_alt' => '',
            'url' => '#applications',
            'button' => 'Jelajahi aplikasi',
        ],
    ],
];
