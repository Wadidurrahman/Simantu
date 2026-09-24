import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { Head, useForm } from '@inertiajs/react';

export default function ForceChangePassword() {
    const { data, setData, post, processing, errors } = useForm({
        password: '',
        password_confirmation: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('password.change.update'));
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50">
            <Head title="Ganti Password Default" />

            <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden border border-red-100">
                <div className="h-1.5 w-full bg-gradient-to-r from-red-600 to-orange-500"></div>

                <div className="p-8">
                    <div className="flex items-center justify-center w-16 h-16 bg-red-50 rounded-full mx-auto mb-4">
                        <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                    </div>
                    <h2 className="text-2xl font-bold text-center text-gray-900 mb-2">Tindakan Diperlukan</h2>
                    <p className="text-sm text-center text-gray-600 mb-8">
                        Demi keamanan sistem SIMANTU, Anda <strong>diwajibkan</strong> untuk mengubah kata sandi default sebelum dapat mengakses Dashboard.
                    </p>

                    <form onSubmit={submit} className="space-y-5">
                        <div>
                            <InputLabel htmlFor="password" value="Kata Sandi Baru" />
                            <TextInput
                                id="password"
                                type="password"
                                className="mt-1 block w-full"
                                value={data.password}
                                onChange={(e) => setData('password', e.target.value)}
                                isFocused={true}
                            />
                            <InputError message={errors.password} className="mt-2" />
                        </div>

                        <div>
                            <InputLabel htmlFor="password_confirmation" value="Konfirmasi Kata Sandi Baru" />
                            <TextInput
                                id="password_confirmation"
                                type="password"
                                className="mt-1 block w-full"
                                value={data.password_confirmation}
                                onChange={(e) => setData('password_confirmation', e.target.value)}
                            />
                            <InputError message={errors.password_confirmation} className="mt-2" />
                        </div>

                        <PrimaryButton className="w-full justify-center py-3 bg-red-600 hover:bg-red-700 focus:ring-red-500" disabled={processing}>
                            Simpan & Lanjutkan
                        </PrimaryButton>
                    </form>
                </div>
            </div>
        </div>
    );
}
