import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, router } from '@inertiajs/react';
import { useState } from 'react';
import Modal from '@/Components/Modal';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import DangerButton from '@/Components/DangerButton';
import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';
import InputError from '@/Components/InputError';

export default function Index({ customers }) {
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedCustomer, setSelectedCustomer] = useState(null);

    const createForm = useForm({
        name: '',
        email: '',
        phone: '',
        address: '',
        notes: '',
    });

    const editForm = useForm({
        name: '',
        email: '',
        phone: '',
        address: '',
        notes: '',
    });

    const deleteForm = useForm();

    const handleCreate = (e) => {
        e.preventDefault();
        createForm.post(route('customers.store'), {
            onSuccess: () => {
                setShowCreateModal(false);
                createForm.reset();
            },
        });
    };

    const handleEdit = (e) => {
        e.preventDefault();
        editForm.put(route('customers.update', selectedCustomer.id), {
            onSuccess: () => {
                setShowEditModal(false);
                setSelectedCustomer(null);
            },
        });
    };

    const handleDelete = (e) => {
        e.preventDefault();
        deleteForm.delete(route('customers.destroy', selectedCustomer.id), {
            onSuccess: () => {
                setShowDeleteModal(false);
                setSelectedCustomer(null);
            },
        });
    };

    const openEditModal = (customer) => {
        setSelectedCustomer(customer);
        editForm.setData({
            name: customer.name,
            email: customer.email || '',
            phone: customer.phone || '',
            address: customer.address || '',
            notes: customer.notes || '',
        });
        setShowEditModal(true);
    };

    const openDeleteModal = (customer) => {
        setSelectedCustomer(customer);
        setShowDeleteModal(true);
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold leading-tight text-gray-800">
                        Customers
                    </h2>
                    <PrimaryButton onClick={() => setShowCreateModal(true)}>
                        Add Customer
                    </PrimaryButton>
                </div>
            }
        >
            <Head title="Customers" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        <div className="p-6">
                            {customers.length === 0 ? (
                                <p className="text-gray-500 text-center py-8">
                                    No customers yet. Click "Add Customer" to get started.
                                </p>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Name
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Phone
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Email
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Work Orders
                                                </th>
                                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Actions
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {customers.map((customer) => (
                                                <tr key={customer.id}>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm font-medium text-gray-900">
                                                            {customer.name}
                                                        </div>
                                                        {customer.address && (
                                                            <div className="text-sm text-gray-500 truncate max-w-xs">
                                                                {customer.address}
                                                            </div>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {customer.phone || '—'}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {customer.email || '—'}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {customer.work_orders_count}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                                        <button
                                                            onClick={() => openEditModal(customer)}
                                                            className="text-indigo-600 hover:text-indigo-900"
                                                        >
                                                            Edit
                                                        </button>
                                                        <button
                                                            onClick={() => openDeleteModal(customer)}
                                                            className="text-red-600 hover:text-red-900"
                                                        >
                                                            Delete
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Create Modal */}
            <Modal show={showCreateModal} onClose={() => setShowCreateModal(false)}>
                <form onSubmit={handleCreate} className="p-6">
                    <h2 className="text-lg font-medium text-gray-900 mb-4">
                        Add Customer
                    </h2>

                    <div className="space-y-4">
                        <div>
                            <InputLabel htmlFor="name" value="Name" />
                            <TextInput
                                id="name"
                                className="mt-1 block w-full"
                                value={createForm.data.name}
                                onChange={(e) => createForm.setData('name', e.target.value)}
                                required
                            />
                            <InputError message={createForm.errors.name} className="mt-2" />
                        </div>

                        <div>
                            <InputLabel htmlFor="email" value="Email" />
                            <TextInput
                                id="email"
                                type="email"
                                className="mt-1 block w-full"
                                value={createForm.data.email}
                                onChange={(e) => createForm.setData('email', e.target.value)}
                            />
                            <InputError message={createForm.errors.email} className="mt-2" />
                        </div>

                        <div>
                            <InputLabel htmlFor="phone" value="Phone" />
                            <TextInput
                                id="phone"
                                className="mt-1 block w-full"
                                value={createForm.data.phone}
                                onChange={(e) => createForm.setData('phone', e.target.value)}
                            />
                            <InputError message={createForm.errors.phone} className="mt-2" />
                        </div>

                        <div>
                            <InputLabel htmlFor="address" value="Address" />
                            <TextInput
                                id="address"
                                className="mt-1 block w-full"
                                value={createForm.data.address}
                                onChange={(e) => createForm.setData('address', e.target.value)}
                            />
                            <InputError message={createForm.errors.address} className="mt-2" />
                        </div>

                        <div>
                            <InputLabel htmlFor="notes" value="Notes" />
                            <textarea
                                id="notes"
                                className="mt-1 block w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm"
                                rows={3}
                                value={createForm.data.notes}
                                onChange={(e) => createForm.setData('notes', e.target.value)}
                            />
                            <InputError message={createForm.errors.notes} className="mt-2" />
                        </div>
                    </div>

                    <div className="mt-6 flex justify-end space-x-3">
                        <SecondaryButton onClick={() => setShowCreateModal(false)}>
                            Cancel
                        </SecondaryButton>
                        <PrimaryButton disabled={createForm.processing}>
                            Save
                        </PrimaryButton>
                    </div>
                </form>
            </Modal>

            {/* Edit Modal */}
            <Modal show={showEditModal} onClose={() => setShowEditModal(false)}>
                <form onSubmit={handleEdit} className="p-6">
                    <h2 className="text-lg font-medium text-gray-900 mb-4">
                        Edit Customer
                    </h2>

                    <div className="space-y-4">
                        <div>
                            <InputLabel htmlFor="edit-name" value="Name" />
                            <TextInput
                                id="edit-name"
                                className="mt-1 block w-full"
                                value={editForm.data.name}
                                onChange={(e) => editForm.setData('name', e.target.value)}
                                required
                            />
                            <InputError message={editForm.errors.name} className="mt-2" />
                        </div>

                        <div>
                            <InputLabel htmlFor="edit-email" value="Email" />
                            <TextInput
                                id="edit-email"
                                type="email"
                                className="mt-1 block w-full"
                                value={editForm.data.email}
                                onChange={(e) => editForm.setData('email', e.target.value)}
                            />
                            <InputError message={editForm.errors.email} className="mt-2" />
                        </div>

                        <div>
                            <InputLabel htmlFor="edit-phone" value="Phone" />
                            <TextInput
                                id="edit-phone"
                                className="mt-1 block w-full"
                                value={editForm.data.phone}
                                onChange={(e) => editForm.setData('phone', e.target.value)}
                            />
                            <InputError message={editForm.errors.phone} className="mt-2" />
                        </div>

                        <div>
                            <InputLabel htmlFor="edit-address" value="Address" />
                            <TextInput
                                id="edit-address"
                                className="mt-1 block w-full"
                                value={editForm.data.address}
                                onChange={(e) => editForm.setData('address', e.target.value)}
                            />
                            <InputError message={editForm.errors.address} className="mt-2" />
                        </div>

                        <div>
                            <InputLabel htmlFor="edit-notes" value="Notes" />
                            <textarea
                                id="edit-notes"
                                className="mt-1 block w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm"
                                rows={3}
                                value={editForm.data.notes}
                                onChange={(e) => editForm.setData('notes', e.target.value)}
                            />
                            <InputError message={editForm.errors.notes} className="mt-2" />
                        </div>
                    </div>

                    <div className="mt-6 flex justify-end space-x-3">
                        <SecondaryButton onClick={() => setShowEditModal(false)}>
                            Cancel
                        </SecondaryButton>
                        <PrimaryButton disabled={editForm.processing}>
                            Update
                        </PrimaryButton>
                    </div>
                </form>
            </Modal>

            {/* Delete Confirmation Modal */}
            <Modal show={showDeleteModal} onClose={() => setShowDeleteModal(false)}>
                <form onSubmit={handleDelete} className="p-6">
                    <h2 className="text-lg font-medium text-gray-900">
                        Delete Customer
                    </h2>
                    <p className="mt-1 text-sm text-gray-600">
                        Are you sure you want to delete <strong>{selectedCustomer?.name}</strong>? 
                        All associated work orders will also be deleted.
                    </p>

                    <div className="mt-6 flex justify-end space-x-3">
                        <SecondaryButton onClick={() => setShowDeleteModal(false)}>
                            Cancel
                        </SecondaryButton>
                        <DangerButton disabled={deleteForm.processing}>
                            Delete
                        </DangerButton>
                    </div>
                </form>
            </Modal>
        </AuthenticatedLayout>
    );
}
