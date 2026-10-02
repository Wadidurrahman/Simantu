import { useForm } from '@inertiajs/react';
import Modal from '@/Components/Modal';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';

export default function ForcePasswordModal({ show }) {
    const { data, setData, put, processing, errors } = useForm({
        password: '',
        password_confirmation: '',
    });

    const submit = (e) => {
        e.preventDefault();
        put(route('password.change.update'));
    };

    return (
        <Modal show={show} closeable={false}>
            <div className="p-6">
                <div className="flex items-center justify-center mb-4">
                    <div className="bg-red-100 p-3 rounded-full">
                        {/* Icon Peringatan */}
                        <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                </div>

                <h2 className="text-xl font-bold text-gray-900 text-center">
                    Tindakan Diperlukan
                </h2>
                <p className="mt-2 text-sm text-gray-600 text-center px-4">
                    Demi keamanan sistem SIMANTU, Anda <b>diwajibkan</b> untuk mengubah kata sandi default sebelum dapat beraktivitas di dalam Dashboard.
                </p>

                <form onSubmit={submit} className="mt-6 space-y-6">
                    <div>
                        <InputLabel htmlFor="password" value="Kata Sandi Baru" />
                        <TextInput
                            id="password"
                            type="password"
                            name="password"
                            value={data.password}
                            className="mt-1 block w-full"
                            isFocused={true}
                            onChange={(e) => setData('password', e.target.value)}
                        />
                        <InputError message={errors.password} className="mt-2" />
                    </div>

                    <div>
                        <InputLabel htmlFor="password_confirmation" value="Konfirmasi Kata Sandi Baru" />
                        <TextInput
                            id="password_confirmation"
                            type="password"
                            name="password_confirmation"
                            value={data.password_confirmation}
                            className="mt-1 block w-full"
                            onChange={(e) => setData('password_confirmation', e.target.value)}
                        />
                        <InputError message={errors.password_confirmation} className="mt-2" />
                    </div>

                    <div className="pt-2 flex justify-end">
                        <PrimaryButton className="w-full justify-center bg-red-600 hover:bg-red-700 focus:bg-red-700 active:bg-red-800" disabled={processing}>
                            SIMPAN & LANJUTKAN
                        </PrimaryButton>
                    </div>
                </form>
            </div>
        </Modal>
    );
}
