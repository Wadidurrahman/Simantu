<?php

return [
    'title' => 'Portal BPS Kota Probolinggo',
    'institution' => 'BPS Kota Probolinggo',
    'description' => 'Mengenal BPS, layanan statistik, direktori aplikasi, dan informasi kegiatan resmi Badan Pusat Statistik Kota Probolinggo.',
    'logo' => null,

    'hero' => [
        'image' => '/images/gedung-bps.webp',
        'foreground' => null,
        'alt' => 'Gedung BPS Kota Probolinggo',
        'caption' => 'Badan Pusat Statistik Kota Probolinggo',
    ],

    'profile' => [
        'title' => 'Apa Itu Badan Pusat Statistik?',
        'description' => 'BPS adalah Lembaga Pemerintah Nonkementerian yang bertanggung jawab langsung kepada Presiden. Kami menyediakan data statistik dasar dan sektoral yang akurat, mutakhir, dan terpercaya untuk mendukung perencanaan pembangunan nasional maupun daerah.',
        'video_id' => 'dQw4w9WgXcQ',
    ],

    'team' => [
        [
            'name' => 'Nama Kepala Kantor',
            'position' => 'Kepala BPS Kota Probolinggo',
            'photo' => '/images/team/kepala.webp',
            'is_leader' => true,
        ],
        [
            'name' => 'Nama Pegawai 1',
            'position' => 'Statistisi Ahli Madya',
            'photo' => '/images/team/pegawai-1.webp',
            'is_leader' => false,
        ],
        [
            'name' => 'Nama Pegawai 2',
            'position' => 'Pranata Komputer Muda',
            'photo' => '/images/team/pegawai-2.webp',
            'is_leader' => false,
        ],
    ],

    'services' => [
        [
            'id' => 'konsultasi',
            'title' => 'Konsultasi Statistik',
            'description' => 'Layanan konsultasi data, metodologi, dan konsultasi teknis statistik langsung dengan pakar kami.',
            'action' => 'Mulai Konsultasi',
            'url' => '#contact',
        ],
        [
            'id' => 'rekomendasi',
            'title' => 'Rekomendasi Kegiatan Statistik',
            'description' => 'Pengajuan rekomendasi survei atau sensus yang diselenggarakan oleh instansi pemerintah.',
            'action' => 'Ajukan Rekomendasi',
            'url' => '#contact',
        ],
        [
            'id' => 'perpustakaan',
            'title' => 'Perperpustakaan & Publikasi',
            'description' => 'Akses koleksi buku, buletin, dan unduh publikasi resmi BPS Kota Probolinggo secara lengkap.',
            'action' => 'Lihat Publikasi',
            'url' => '#applications',
        ],
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

    'tour' => [
        'title' => 'Jelajahi Kantor Kami',
        'description' => 'Saksikan tur singkat fasilitas Pelayanan Terpadu Satu Pintu (PST) dan ruang kerja kami.',
        'video_id' => 'dQw4w9WgXcQ',
    ],

    'gallery' => [
        [
            'title' => 'Pelayanan Terpadu Statistik',
            'image' => '/images/gallery/pst.webp',
            'caption' => 'Penerimaan tamu dan pelayanan konsultasi data di kantor.',
        ],
        [
            'title' => 'Kegiatan Lapangan Sensus',
            'image' => '/images/gallery/lapangan.webp',
            'caption' => 'Petugas pencacah melakukan pendataan langsung ke responden.',
        ],
        [
            'title' => 'Rapat Koordinasi Internal',
            'image' => '/images/gallery/rapat.webp',
            'caption' => 'Koordinasi berkala peningkatan kualitas data statistik daerah.',
        ],
    ],

    'contact' => [
        'address' => 'Jl. dr. Saleh No. 35, Probolinggo, Jawa Timur',
        'phone' => '(0335) 421234',
        'email' => 'bps3574@bps.go.id',
        'hours' => 'Senin - Jumat: 08:00 - 15:30 WIB',
        'maps_url' => 'https://maps.google.com',
    ],
];
