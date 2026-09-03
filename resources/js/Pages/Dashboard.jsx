import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';

export default function Dashboard({ stats }) {
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
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
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
                                <div className="text-sm font-medium text-gray-500">Active Work Orders</div>
                                <div className="mt-2 text-3xl font-semibold text-gray-900">
                                    {stats?.active_work_orders ?? 0}
                                </div>
                            </div>
                        </Link>

                        <Link href={route('work-orders.index')} className="block">
                            <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg p-6 hover:shadow-md transition-shadow">
                                <div className="text-sm font-medium text-gray-500">Scheduled This Week</div>
                                <div className="mt-2 text-3xl font-semibold text-gray-900">
                                    {stats?.scheduled_this_week ?? 0}
                                </div>
                            </div>
                        </Link>
                    </div>

                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
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
