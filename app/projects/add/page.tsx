'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

type ProjectFormState = {
	name: string;
	description: string;
	status: 'planning' | 'active' | 'completed' | 'on_hold';
	startDate: string;
	endDate: string;
};

const INITIAL_STATE: ProjectFormState = {
	name: '',
	description: '',
	status: 'planning',
	startDate: '',
	endDate: '',
};

export default function AddProjectPage() {
	const router = useRouter();
	const [form, setForm] = useState<ProjectFormState>(INITIAL_STATE);
	const [submitting, setSubmitting] = useState(false);
	const [error, setError] = useState('');

	const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		setError('');

		if (!form.name.trim()) {
			setError('Project name is required.');
			return;
		}

		if (form.startDate && form.endDate && form.endDate < form.startDate) {
			setError('End date must be after start date.');
			return;
		}

		setSubmitting(true);
		try {
			const response = await fetch('/api/projects', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					name: form.name.trim(),
					description: form.description.trim() || null,
					status: form.status,
					startDate: form.startDate || null,
					endDate: form.endDate || null,
				}),
			});

			const data = await response.json();
			if (!response.ok) {
				setError(data?.error ?? 'Failed to create project.');
				return;
			}

			router.push(`/projects/${data.project.id}`);
			router.refresh();
		} catch (submitError) {
			console.error('Create project failed:', submitError);
			setError('Something went wrong while creating the project.');
		} finally {
			setSubmitting(false);
		}
	};

	return (
		<div className="p-4 sm:p-6 lg:p-8 max-w-4xl">
			<div className="mb-6">
				<Link href="/projects" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
					<ArrowLeft className="w-4 h-4" />
					Back to Projects
				</Link>
			</div>

			<div className="bg-card rounded-2xl border border-border shadow-sm p-6 sm:p-8">
				<h1 className="text-2xl sm:text-3xl font-bold text-foreground">Create New Project</h1>
				<p className="text-muted-foreground text-sm mt-2">
					A full 35-task RACI workflow will be seeded automatically when you create this project.
				</p>

				{error && (
					<div className="mt-4 rounded-lg border border-destructive/30 bg-destructive/10 text-destructive text-sm px-4 py-3">
						{error}
					</div>
				)}

				<form onSubmit={handleSubmit} className="mt-6 space-y-5">
					<div>
						<label className="block text-sm font-medium text-foreground mb-2">Project Name</label>
						<input
							value={form.name}
							onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
							className="w-full rounded-lg border border-input bg-background px-4 py-2.5 text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
							placeholder="e.g. NH-45 Corridor Upgrade"
							required
						/>
					</div>

					<div>
						<label className="block text-sm font-medium text-foreground mb-2">Description</label>
						<textarea
							value={form.description}
							onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
							className="w-full rounded-lg border border-input bg-background px-4 py-2.5 text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
							rows={4}
							placeholder="Project scope, key constraints, and deliverables"
						/>
					</div>

					<div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
						<div>
							<label className="block text-sm font-medium text-foreground mb-2">Status</label>
							<select
								value={form.status}
								onChange={(e) => setForm((prev) => ({ ...prev, status: e.target.value as ProjectFormState['status'] }))}
								className="w-full rounded-lg border border-input bg-background px-4 py-2.5 text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
							>
								<option value="planning">Planning</option>
								<option value="active">Active</option>
								<option value="on_hold">On Hold</option>
								<option value="completed">Completed</option>
							</select>
						</div>
						<div>
							<label className="block text-sm font-medium text-foreground mb-2">Start Date</label>
							<input
								type="date"
								value={form.startDate}
								onChange={(e) => setForm((prev) => ({ ...prev, startDate: e.target.value }))}
								className="w-full rounded-lg border border-input bg-background px-4 py-2.5 text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
							/>
						</div>
						<div>
							<label className="block text-sm font-medium text-foreground mb-2">End Date</label>
							<input
								type="date"
								value={form.endDate}
								onChange={(e) => setForm((prev) => ({ ...prev, endDate: e.target.value }))}
								className="w-full rounded-lg border border-input bg-background px-4 py-2.5 text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
							/>
						</div>
					</div>

					<div className="flex items-center gap-3 pt-2">
						<Button type="submit" disabled={submitting} className="bg-indigo-600 hover:bg-indigo-700 text-white">
							{submitting ? (
								<span className="inline-flex items-center gap-2">
									<Loader2 className="w-4 h-4 animate-spin" />
									Creating Project...
								</span>
							) : (
								'Create Project'
							)}
						</Button>
						<Link href="/projects">
							<Button type="button" variant="outline">Cancel</Button>
						</Link>
					</div>
				</form>
			</div>
		</div>
	);
}
