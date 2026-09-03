import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import { useState } from 'react';
import Modal from '@/Components/Modal';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import DangerButton from '@/Components/DangerButton';
import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';
import InputError from '@/Components/InputError';

const statusColors = {
    scheduled: 'bg-blue-100 text-blue-800',
    in_progress: 'bg-amber-100 text-amber-800',
    completed: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
};

const statusLabels = {
    scheduled: 'Scheduled',
    in_progress: 'In Progress',
    completed: 'Completed',
    cancelled: 'Cancelled',
};

export default function Index({ workOrders, customers }) {
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedWorkOrder, setSelectedWorkOrder] = useState(null);

    const createForm = useForm({
        customer_id: '',
        title: '',
        description: '',
        scheduled_at: '',
        estimated_cost: '',
        status: 'scheduled',
    });

    const editForm = useForm({
        customer_id: '',
        title: '',
        description: '',
        scheduled_at: '',
        estimated_cost: '',
        actual_cost: '',
        status: '',
    });

    const deleteForm = useForm();
    const statusForm = useForm();

    const handleCreate = (e) => {
        e.preventDefault();
        createForm.post(route('work-orders.store'), {
            onSuccess: () => {
                setShowCreateModal(false);
                createForm.reset();
            },
        });
    };

    const handleEdit = (e) => {
        e.preventDefault();
        editForm.put(route('work-orders.update', selectedWorkOrder.id), {
            onSuccess: () => {
                setShowEditModal(false);
                setSelectedWorkOrder(null);
            },
        });
    };

    const handleDelete = (e) => {
        e.preventDefault();
        deleteForm.delete(route('work-orders.destroy', selectedWorkOrder.id), {
            onSuccess: () => {
                setShowDeleteModal(false);
                setSelectedWorkOrder(null);
            },
        });
    };

    const handleStatusChange = (workOrder, newStatus) => {
        statusForm.patch(route('work-orders.update', workOrder.id), {
            data: { status: newStatus },
            preserveScroll: true,
        });
    };

    const openEditModal = (workOrder) => {
        setSelectedWorkOrder(workOrder);
        editForm.setData({
            customer_id: workOrder.customer_id,
            title: workOrder.title,
            description: workOrder.description || '',
            scheduled_at: workOrder.scheduled_at.replace(' ', 'T').slice(0, 16),
            estimated_cost: workOrder.estimated_cost || '',
            actual_cost: workOrder.actual_cost || '',
            status: workOrder.status,
        });
        setShowEditModal(true);
    };

    const openDeleteModal = (workOrder) => {
        setSelectedWorkOrder(workOrder);
        setShowDeleteModal(true);
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
        });
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold leading-tight text-gray-800">
                        Work Orders
                    </h2>
                    <PrimaryButton onClick={() => setShowCreateModal(true)}>
                        New Work Order
                    </PrimaryButton>
                </div>
            }
        >
            <Head title="Work Orders" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        <div className="p-6">
                            {workOrders.length === 0 ? (
                                <p className="text-gray-500 text-center py-8">
                                    No work orders yet. Click "New Work Order" to get started.
                                </p>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Title
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Customer
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Scheduled
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Estimated
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Status
                                                </th>
                                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Actions
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {workOrders.map((workOrder) => (
                                                <tr key={workOrder.id}>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm font-medium text-gray-900">
                                                            {workOrder.title}
                                                        </div>
                                                        {workOrder.description && (
                                                            <div className="text-sm text-gray-500 truncate max-w-xs">
                                                                {workOrder.description}
                                                            </div>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {workOrder.customer?.name}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {formatDate(workOrder.scheduled_at)}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {workOrder.estimated_cost
                                                            ? `$${parseFloat(workOrder.estimated_cost).toFixed(2)}`
                                                            : '—'}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <select
                                                            value={workOrder.status}
                                                            onChange={(e) => handleStatusChange(workOrder, e.target.value)}
                                                            className={`text-xs font-medium px-2 py-1 rounded-full border-0 ${statusColors[workOrder.status]}`}
                                                        >
                                                            {Object.entries(statusLabels).map(([value, label]) => (
                                                                <option key={value} value={value}>
                                                                    {label}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                                        <button
                                                            onClick={() => openEditModal(workOrder)}
                                                            className="text-indigo-600 hover:text-indigo-900"
                                                        >
                                                            Edit
                                                        </button>
                                                        <button
                                                            onClick={() => openDeleteModal(workOrder)}
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
                        New Work Order
                    </h2>

                    <div className="space-y-4">
                        <div>
                            <InputLabel htmlFor="customer_id" value="Customer" />
                            <select
                                id="customer_id"
                                className="mt-1 block w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm"
                                value={createForm.data.customer_id}
                                onChange={(e) => createForm.setData('customer_id', e.target.value)}
                                required
                            >
                                <option value="">Select a customer</option>
                                {customers.map((customer) => (
                                    <option key={customer.id} value={customer.id}>
                                        {customer.name}
                                    </option>
                                ))}
                            </select>
                            <InputError message={createForm.errors.customer_id} className="mt-2" />
                        </div>

                        <div>
                            <InputLabel htmlFor="title" value="Title" />
                            <TextInput
                                id="title"
                                className="mt-1 block w-full"
                                value={createForm.data.title}
                                onChange={(e) => createForm.setData('title', e.target.value)}
                                required
                            />
                            <InputError message={createForm.errors.title} className="mt-2" />
                        </div>

                        <div>
                            <InputLabel htmlFor="description" value="Description" />
                            <textarea
                                id="description"
                                className="mt-1 block w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm"
                                rows={3}
                                value={createForm.data.description}
                                onChange={(e) => createForm.setData('description', e.target.value)}
                            />
                            <InputError message={createForm.errors.description} className="mt-2" />
                        </div>

                        <div>
                            <InputLabel htmlFor="scheduled_at" value="Scheduled At" />
                            <TextInput
                                id="scheduled_at"
                                type="datetime-local"
                                className="mt-1 block w-full"
                                value={createForm.data.scheduled_at}
                                onChange={(e) => createForm.setData('scheduled_at', e.target.value)}
                                required
                            />
                            <InputError message={createForm.errors.scheduled_at} className="mt-2" />
                        </div>

                        <div>
                            <InputLabel htmlFor="estimated_cost" value="Estimated Cost ($)" />
                            <TextInput
                                id="estimated_cost"
                                type="number"
                                step="0.01"
                                min="0"
                                className="mt-1 block w-full"
                                value={createForm.data.estimated_cost}
                                onChange={(e) => createForm.setData('estimated_cost', e.target.value)}
                            />
                            <InputError message={createForm.errors.estimated_cost} className="mt-2" />
                        </div>
                    </div>

                    <div className="mt-6 flex justify-end space-x-3">
                        <SecondaryButton onClick={() => setShowCreateModal(false)}>
                            Cancel
                        </SecondaryButton>
                        <PrimaryButton disabled={createForm.processing}>
                            Create
                        </PrimaryButton>
                    </div>
                </form>
            </Modal>

            {/* Edit Modal */}
            <Modal show={showEditModal} onClose={() => setShowEditModal(false)}>
                <form onSubmit={handleEdit} className="p-6">
                    <h2 className="text-lg font-medium text-gray-900 mb-4">
                        Edit Work Order
                    </h2>

                    <div className="space-y-4">
                        <div>
                            <InputLabel htmlFor="edit-customer_id" value="Customer" />
                            <select
                                id="edit-customer_id"
                                className="mt-1 block w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm"
                                value={editForm.data.customer_id}
                                onChange={(e) => editForm.setData('customer_id', e.target.value)}
                                required
                            >
                                <option value="">Select a customer</option>
                                {customers.map((customer) => (
                                    <option key={customer.id} value={customer.id}>
                                        {customer.name}
                                    </option>
                                ))}
                            </select>
                            <InputError message={editForm.errors.customer_id} className="mt-2" />
                        </div>

                        <div>
                            <InputLabel htmlFor="edit-title" value="Title" />
                            <TextInput
                                id="edit-title"
                                className="mt-1 block w-full"
                                value={editForm.data.title}
                                onChange={(e) => editForm.setData('title', e.target.value)}
                                required
                            />
                            <InputError message={editForm.errors.title} className="mt-2" />
                        </div>

                        <div>
                            <InputLabel htmlFor="edit-description" value="Description" />
                            <textarea
                                id="edit-description"
                                className="mt-1 block w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm"
                                rows={3}
                                value={editForm.data.description}
                                onChange={(e) => editForm.setData('description', e.target.value)}
                            />
                            <InputError message={editForm.errors.description} className="mt-2" />
                        </div>

                        <div>
                            <InputLabel htmlFor="edit-scheduled_at" value="Scheduled At" />
                            <TextInput
                                id="edit-scheduled_at"
                                type="datetime-local"
                                className="mt-1 block w-full"
                                value={editForm.data.scheduled_at}
                                onChange={(e) => editForm.setData('scheduled_at', e.target.value)}
                                required
                            />
                            <InputError message={editForm.errors.scheduled_at} className="mt-2" />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <InputLabel htmlFor="edit-estimated_cost" value="Estimated Cost ($)" />
                                <TextInput
                                    id="edit-estimated_cost"
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    className="mt-1 block w-full"
                                    value={editForm.data.estimated_cost}
                                    onChange={(e) => editForm.setData('estimated_cost', e.target.value)}
                                />
                                <InputError message={editForm.errors.estimated_cost} className="mt-2" />
                            </div>

                            <div>
                                <InputLabel htmlFor="edit-actual_cost" value="Actual Cost ($)" />
                                <TextInput
                                    id="edit-actual_cost"
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    className="mt-1 block w-full"
                                    value={editForm.data.actual_cost}
                                    onChange={(e) => editForm.setData('actual_cost', e.target.value)}
                                />
                                <InputError message={editForm.errors.actual_cost} className="mt-2" />
                            </div>
                        </div>

                        <div>
                            <InputLabel htmlFor="edit-status" value="Status" />
                            <select
                                id="edit-status"
                                className="mt-1 block w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm"
                                value={editForm.data.status}
                                onChange={(e) => editForm.setData('status', e.target.value)}
                            >
                                {Object.entries(statusLabels).map(([value, label]) => (
                                    <option key={value} value={value}>
                                        {label}
                                    </option>
                                ))}
                            </select>
                            <InputError message={editForm.errors.status} className="mt-2" />
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
                        Delete Work Order
                    </h2>
                    <p className="mt-1 text-sm text-gray-600">
                        Are you sure you want to delete <strong>{selectedWorkOrder?.title}</strong>? 
                        This action cannot be undone.
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
