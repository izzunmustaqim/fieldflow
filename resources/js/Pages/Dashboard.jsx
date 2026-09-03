import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';

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

export default function Dashboard({ stats, upcomingWorkOrders, recentActivity }) {
    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Dashboard
                </h2>
            }
        >
            <Head title="Dashboard" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    {/* Summary Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                        <Link href={route('customers.index')} className="block">
                            <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg p-6 hover:shadow-md transition-shadow">
                                <div className="text-sm font-medium text-gray-500">Total Customers</div>
                                <div className="mt-2 text-3xl font-semibold text-gray-900">
                                    {stats?.total_customers ?? 0}
                                </div>
                            </div>
                        </Link>

                        <Link href={route('work-orders.index')} className="block">
                            <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg p-6 hover:shadow-md transition-shadow">
                                <div className="text-sm font-medium text-gray-500">Active Jobs</div>
                                <div className="mt-2 text-3xl font-semibold text-amber-600">
                                    {stats?.active_work_orders ?? 0}
                                </div>
                            </div>
                        </Link>

                        <Link href={route('work-orders.index')} className="block">
                            <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg p-6 hover:shadow-md transition-shadow">
                                <div className="text-sm font-medium text-gray-500">Completed This Week</div>
                                <div className="mt-2 text-3xl font-semibold text-green-600">
                                    {stats?.completed_this_week ?? 0}
                                </div>
                            </div>
                        </Link>

                        <Link href={route('work-orders.index')} className="block">
                            <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg p-6 hover:shadow-md transition-shadow">
                                <div className="text-sm font-medium text-gray-500">Scheduled This Week</div>
                                <div className="mt-2 text-3xl font-semibold text-blue-600">
                                    {stats?.scheduled_this_week ?? 0}
                                </div>
                            </div>
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Upcoming Work Orders */}
                        <div className="bg-white shadow-sm sm:rounded-lg">
                            <div className="p-6 border-b border-gray-200">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-lg font-medium text-gray-900">Upcoming (Next 7 Days)</h3>
                                    <Link
                                        href={route('work-orders.index')}
                                        className="text-sm text-indigo-600 hover:text-indigo-500"
                                    >
                                        View all
                                    </Link>
                                </div>
                            </div>
                            <div className="p-6">
                                {upcomingWorkOrders?.length > 0 ? (
                                    <ul className="divide-y divide-gray-200">
                                        {upcomingWorkOrders.map((wo) => (
                                            <li key={wo.id} className="py-4">
                                                <div className="flex items-center justify-between">
                                                    <div className="min-w-0 flex-1">
                                                        <p className="text-sm font-medium text-gray-900 truncate">
                                                            {wo.title}
                                                        </p>
                                                        <p className="text-sm text-gray-500">
                                                            {wo.customer.name}
                                                            {wo.customer.phone && (
                                                                <span className="ml-2 text-gray-400">
                                                                    {wo.customer.phone}
                                                                </span>
                                                            )}
                                                        </p>
                                                    </div>
                                                    <div className="ml-4 flex-shrink-0 text-right">
                                                        <p className="text-sm text-gray-900">
                                                            {wo.scheduled_at}
                                                        </p>
                                                        {wo.estimated_cost && (
                                                            <p className="text-sm text-gray-500">
                                                                ${parseFloat(wo.estimated_cost).toFixed(2)}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className="text-sm text-gray-500 text-center py-4">
                                        No work orders scheduled for the next 7 days.
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Recent Activity */}
                        <div className="bg-white shadow-sm sm:rounded-lg">
                            <div className="p-6 border-b border-gray-200">
                                <h3 className="text-lg font-medium text-gray-900">Recent Activity</h3>
                            </div>
                            <div className="p-6">
                                {recentActivity?.length > 0 ? (
                                    <ul className="divide-y divide-gray-200">
                                        {recentActivity.map((wo) => (
                                            <li key={wo.id} className="py-4">
                                                <div className="flex items-center justify-between">
                                                    <div className="min-w-0 flex-1">
                                                        <p className="text-sm font-medium text-gray-900 truncate">
                                                            {wo.title}
                                                        </p>
                                                        <p className="text-sm text-gray-500">
                                                            {wo.customer_name}
                                                        </p>
                                                    </div>
                                                    <div className="ml-4 flex-shrink-0 flex items-center gap-3">
                                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[wo.status] || 'bg-gray-100 text-gray-800'}`}>
                                                            {statusLabels[wo.status] || wo.status}
                                                        </span>
                                                        <span className="text-xs text-gray-400 whitespace-nowrap">
                                                            {wo.updated_at}
                                                        </span>
                                                    </div>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className="text-sm text-gray-500 text-center py-4">
                                        No recent activity.
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="mt-8 bg-white shadow-sm sm:rounded-lg">
                        <div className="p-6">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
                            <div className="flex flex-wrap gap-4">
                                <Link
                                    href={route('customers.index')}
                                    className="inline-flex items-center px-4 py-2 bg-gray-800 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-gray-700 focus:bg-gray-700 active:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition ease-in-out duration-150"
                                >
                                    View Customers
                                </Link>
                                <Link
                                    href={route('work-orders.index')}
                                    className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-md font-semibold text-xs text-gray-700 uppercase tracking-widest shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-25 transition ease-in-out duration-150"
                                >
                                    View Work Orders
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
