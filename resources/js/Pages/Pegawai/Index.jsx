import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';

export default function Index({ auth, pegawai }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        nip: '',
        nama_lengkap: '',
        jabatan: '',
        is_active: true,
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('pegawai.store'), {
            onSuccess: () => reset(),
        });
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Master Pegawai</h2>}
        >
            <Head title="Master Pegawai" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">

                        {/* Form Tambah Pegawai Sederhana */}
                        <form onSubmit={submit} className="mb-6 space-y-4">
                            <div>
                                <TextInput
                                    type="text"
                                    placeholder="NIP"
                                    value={data.nip}
                                    onChange={(e) => setData('nip', e.target.value)}
                                    className="block w-full"
                                />
                                {errors.nip && <div className="text-red-500 mt-1">{errors.nip}</div>}
                            </div>
                            <div>
                                <TextInput
                                    type="text"
                                    placeholder="Nama Lengkap"
                                    value={data.nama_lengkap}
                                    onChange={(e) => setData('nama_lengkap', e.target.value)}
                                    className="block w-full"
                                />
                                {errors.nama_lengkap && <div className="text-red-500 mt-1">{errors.nama_lengkap}</div>}
                            </div>
                            <PrimaryButton disabled={processing}>Simpan</PrimaryButton>
                        </form>

                        {/* Tabel Data Pegawai */}
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead>
                                <tr>
                                    <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase">NIP</th>
                                    <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase">Nama</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {pegawai.map((item) => (
                                    <tr key={item.id}>
                                        <td className="px-6 py-4 whitespace-nowrap">{item.nip}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">{item.nama_lengkap}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
