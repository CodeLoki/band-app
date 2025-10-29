import { Link } from "react-router";

export function meta() {
	return [
		{ title: "About - Daisy UI" },
		{ name: "description", content: "About Daisy UI project" },
	];
}

export default function About() {
	return (
		<div className="min-h-screen bg-base-100">
			<div className="navbar bg-base-300">
				<div className="flex-1">
					<Link to="/" className="btn btn-ghost normal-case text-xl">
						DaisyUI Demo
					</Link>
				</div>
				<div className="flex-none">
					<div className="badge badge-primary">Dark Mode</div>
				</div>
			</div>

			<div className="container mx-auto px-4 py-8">
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
					<div className="card bg-base-200 shadow-xl">
						<div className="card-body">
							<h2 className="card-title text-primary">About This Project</h2>
							<p className="text-base-content">
								This project demonstrates a modern React application built with
								React Router v7, TypeScript, and Biome for code quality, now
								enhanced with DaisyUI components in beautiful dark mode.
							</p>
							<div className="card-actions justify-end">
								<Link to="/" className="btn btn-primary">
									← Back to Home
								</Link>
							</div>
						</div>
					</div>

					<div className="card bg-base-200 shadow-xl">
						<div className="card-body">
							<h2 className="card-title text-secondary">DaisyUI Components</h2>
							<p>Here are some example components working in dark mode:</p>

							<div className="flex flex-wrap gap-2 my-4">
								<button type="button" className="btn btn-primary">
									Primary
								</button>
								<button type="button" className="btn btn-secondary">
									Secondary
								</button>
								<button type="button" className="btn btn-accent">
									Accent
								</button>
								<button type="button" className="btn btn-ghost">
									Ghost
								</button>
							</div>

							<div className="alert alert-info">
								<svg
									xmlns="http://www.w3.org/2000/svg"
									fill="none"
									viewBox="0 0 24 24"
									className="stroke-current shrink-0 w-6 h-6"
								>
									<title>Info icon</title>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth="2"
										d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
									/>
								</svg>
								<span>Dark mode is automatically enabled!</span>
							</div>

							<progress
								className="progress progress-primary w-full"
								value="70"
								max="100"
							/>
						</div>
					</div>
				</div>

				<div className="mt-8">
					<div className="stats shadow w-full">
						<div className="stat">
							<div className="stat-figure text-primary">
								<svg
									xmlns="http://www.w3.org/2000/svg"
									fill="none"
									viewBox="0 0 24 24"
									className="inline-block w-8 h-8 stroke-current"
								>
									<title>Heart icon</title>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth="2"
										d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
									/>
								</svg>
							</div>
							<div className="stat-title">Components</div>
							<div className="stat-value text-primary">50+</div>
							<div className="stat-desc">DaisyUI components available</div>
						</div>

						<div className="stat">
							<div className="stat-figure text-secondary">
								<svg
									xmlns="http://www.w3.org/2000/svg"
									fill="none"
									viewBox="0 0 24 24"
									className="inline-block w-8 h-8 stroke-current"
								>
									<title>Lightning bolt icon</title>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth="2"
										d="M13 10V3L4 14h7v7l9-11h-7z"
									/>
								</svg>
							</div>
							<div className="stat-title">Performance</div>
							<div className="stat-value text-secondary">Optimized</div>
							<div className="stat-desc">Built on Tailwind CSS</div>
						</div>

						<div className="stat">
							<div className="stat-figure text-accent">
								<svg
									xmlns="http://www.w3.org/2000/svg"
									fill="none"
									viewBox="0 0 24 24"
									className="inline-block w-8 h-8 stroke-current"
								>
									<title>Archive box icon</title>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth="2"
										d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
									/>
								</svg>
							</div>
							<div className="stat-title">Themes</div>
							<div className="stat-value text-accent">30+</div>
							<div className="stat-desc">Built-in themes available</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
