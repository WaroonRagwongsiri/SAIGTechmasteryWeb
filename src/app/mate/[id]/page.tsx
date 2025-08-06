// app/mate/[id]/page.tsx
import BookingForm from '@/app/components/booking_form';
import Navbar from '@/app/components/navbar';

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function MateProfilePage({ params }: { params: { id: string } }) {
	const { id } = await params;

	const mate = await prisma.mateProfile.findUnique({
		where: { id },
		include: { user: true },
	});

	if (!mate) {
		return (
			<div>
				<Navbar />
				<div className="p-4">
					<div className="text-center py-8">
						<h2 className="text-2xl font-bold text-gray-800">Mate not found</h2>
						<p className="text-gray-600 mt-2">The mate profile you're looking for doesn't exist.</p>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div>
			<Navbar />
			<div className="max-w-4xl mx-auto p-6">
				<div className="bg-white rounded-lg shadow-md p-6 mb-8 sm:grid sm:grid-cols-1">
					<div className="flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-4 mb-6">
						{mate.user.profilePhoto && (
							<img
								src={mate.user.profilePhoto}
								alt={`${mate.user.firstName} ${mate.user.lastName}`}
								className="w-60 h-60 rounded-full object-cover"
							/>
						)}
						<div className="text-center md:text-left">
							<h1 className="text-3xl font-bold text-gray-800">
								{mate.user.firstName} {mate.user.lastName}
							</h1>
							<div className="flex justify-center md:justify-start items-center mt-2">
								<span
									className={`px-2 py-1 rounded-full text-sm ${mate.isAvailable
											? 'bg-green-100 text-green-800'
											: 'bg-red-100 text-red-800'
										}`}
								>
									{mate.isAvailable ? 'Available' : 'Unavailable'}
								</span>
							</div>
						</div>
					</div>

					<div className="grid md:grid-cols-2 gap-6">
						<div>
							<h2 className="text-xl font-semibold mb-3">About</h2>
							<p className="text-gray-700 leading-relaxed">
								{mate.bio || "No bio provided."}
							</p>

							<h2 className="text-xl font-semibold mb-3">Rating</h2>
							<p className="text-gray-700 leading-relaxed">
								⭐{mate.rating?.toFixed(2) || 0.00.toFixed(2)} / 5.00
							</p>

							<div className="mt-4">
								<h3 className="text-lg font-medium mb-2">Pricing</h3>
								<div className="bg-blue-50 p-3 rounded-md">
									<span className="text-2xl font-bold text-blue-600">฿{mate.hourlyRate}</span>
									<span className="text-gray-600 ml-2">per hour</span>
								</div>
							</div>
						</div>

						<div>
							{mate.isAvailable ? (
								<BookingForm
									mateId={mate.userId}
									hourlyRate={mate.hourlyRate}
									mateName={`${mate.user.firstName} ${mate.user.lastName}`}
									rating={mate.rating || 0}
								/>
							) : (
								<div className="bg-gray-50 p-6 rounded-lg text-center">
									<h3 className="text-lg font-medium text-gray-800 mb-2">
										Currently Unavailable
									</h3>
									<p className="text-gray-600">
										This mate is not accepting new bookings at the moment.
									</p>
								</div>
							)}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}