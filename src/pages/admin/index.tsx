"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useWebContext } from "@context/auth";
import { Button } from "@components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle
} from "@components/ui/card";
import {
	Clock,
	Download,
	FileCode,
	Loader2,
	Users,
	Search,
	X,
	User,
	Database
} from "lucide-react";
import { getCookie } from "@utils/cookies";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger
} from "@components/ui/dialog";
import { Input } from "@components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@components/ui/avatar";
import { Badge } from "@components/ui/badge";
import { Label } from "@components/ui/label";

interface InternalStats {
	users: {
		monthly: {
			count: number;
			timeframe: string;
		};
		total: number;
	};
	themes: {
		total: number;
		totalDownloads: number;
		topAuthor: {
			discord_snowflake: string;
			themeCount: number;
		};
		mostLiked: string;
	};
	dbst: {
		collections: number;
		objects: number;
		dataSize: number;
		storageSize: number;
		indexes: number;
		size: number;
	};
	sst: {
		cn: any;
		nw: any;
		op: any;
		up: number;
	};
}

interface Theme {
	_id: string;
	title: string;
	description: string;
	file: string;
	fileUrl: string;
	contributors: string[];
	sourceLink: string;
	validatedUsers: {
		[key: string]: {
			id: string;
			username: string;
			avatar: string;
		};
	};
	state: "pending" | "approved" | "rejected";
	themeContent: string;
	submittedAt: Date;
	submittedBy: string;
}

export default function AdminDashboard() {
	const router = useRouter();
	const { isAuthenticated, authorizedUser, isLoading } = useWebContext();
	const [stats, setStats] = useState<InternalStats | null>(null);
	const [loading, setLoading] = useState(true);
	const [submissions, setSubmissions] = useState([]);
	const [searchQuery, setSearchQuery] = useState("");
	const [searchResults, setSearchResults] = useState(null);
	const [isSearching, setIsSearching] = useState(false);
	const [searchError, setSearchError] = useState(null);

	useEffect(() => {
		if (!isLoading && (!isAuthenticated || !authorizedUser?.admin)) {
			router.push("/");
			return;
		}

		const fetchStats = async () => {
			try {
				const token = getCookie("_dtoken");
				if (!token) {
					router.push("/");
					return;
				}

				const response = await fetch("/api/internal", {
					headers: {
						"Content-Type": "application/json",
						Authorization: `Bearer ${token}`
					}
				});

				if (response.ok) {
					const data = await response.json();
					setStats(data);
				} else {
					router.push("/");
				}

				const submissionsResponse = await fetch(
					"/api/get/submissions",
					{
						headers: {
							Authorization: `Bearer ${token}`
						}
					}
				);

				if (submissionsResponse.ok) {
					const data = await submissionsResponse.json();
					setSubmissions(data);
				} else {
					console.error(submissionsResponse);
				}
			} catch {
				router.push("/");
			} finally {
				setLoading(false);
			}
		};

		fetchStats();
	}, [isAuthenticated, authorizedUser, isLoading, router]);

	if (isLoading || loading) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<Loader2 className="w-8 h-8 animate-spin" />
			</div>
		);
	}

	if (!isAuthenticated || !authorizedUser?.admin) {
		return null;
	}

	const handleUserSearch = async () => {
		if (!searchQuery.trim()) return;

		setIsSearching(true);
		setSearchError(null);

		try {
			const token = getCookie("_dtoken");
			const response = await fetch(
				`/api/users?userString=${encodeURIComponent(searchQuery)}`,
				{
					headers: {
						Authorization: `Bearer ${token}`
					}
				}
			);

			if (!response.ok) {
				throw new Error(response.statusText);
			}

			const data = await response.json();
			setSearchResults(data);
		} catch (error) {
			setSearchError(error.message);
			setSearchResults(null);
		} finally {
			setIsSearching(false);
		}
	};

	const formatBytes = (bytes: number) => {
		if (bytes === 0) return "0 Bytes";
		const k = 1024;
		const sizes = ["Bytes", "KB", "MB", "GB"];
		const i = Math.floor(Math.log(bytes) / Math.log(k));
		return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
	};

	return (
		<div className="container mx-auto p-4 md:p-8">
			<div className="flex justify-between items-center mb-6">
				<h1 className="text-3xl font-bold text-gray-800 dark:text-white">
					Site Statistics
				</h1>
			</div>

			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
				<Card className="hover:shadow-lg transition-shadow duration-200">
					<CardHeader className="flex flex-row items-center justify-between pb-2">
						<CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-300">
							Submissions
						</CardTitle>
						<Users className="h-4 w-4 text-gray-500 dark:text-gray-400" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold text-gray-900 dark:text-white">
							{submissions?.length
								? submissions.filter(
										x => x.pending === "pending"
								  )?.length
								: "0"}
							<span className="ml-1 mb-1 text-sm font-normal text-gray-500">
								pending
							</span>
						</div>
						
						<Button
							size="lg"
							variant="outline"
							className="mt-6 w-full"
							onClick={() => router.push("/theme/submitted")}
						>
							View Theme Submissions
						</Button>
					</CardContent>
				</Card>

				<Card className="hover:shadow-lg transition-shadow duration-200">
					<CardHeader className="flex flex-row items-center justify-between pb-2">
						<CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-300">
							Total Users
						</CardTitle>
						<Users className="h-4 w-4 text-gray-500 dark:text-gray-400" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold text-gray-900 dark:text-white">
							{stats?.users.total.toLocaleString()}
						</div>
						<p className="text-xs text-muted-foreground mt-1">
							<span className="text-green-500">
								↑ {stats?.users.monthly.count.toLocaleString()}
							</span>{" "}
							new this month
						</p>
						<Dialog>
							<DialogTrigger asChild>
								<Button
									size="lg"
									className="w-full justify-center"
									variant="outline"
								>
									<Search className="h-4 w-4 mr-2" />
									Search Users
								</Button>
							</DialogTrigger>

							<DialogContent className="w-[95vw] max-w-[95vw] sm:w-auto sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
								<DialogHeader>
									<DialogTitle>User Search</DialogTitle>
								</DialogHeader>

								<div className="flex flex-col sm:flex-row gap-2">
									<Input
										placeholder="Search by ID or username..."
										value={searchQuery}
										onChange={e =>
											setSearchQuery(e.target.value)
										}
										onKeyDown={e =>
											e.key === "Enter" &&
											handleUserSearch()
										}
										className="flex-1"
									/>
									<Button
										onClick={handleUserSearch}
										disabled={isSearching}
									>
										{isSearching ? (
											<Loader2 className="h-4 w-4 animate-spin" />
										) : (
											<Search className="h-4 w-4" />
										)}
									</Button>
								</div>

								{isSearching && (
									<div className="flex justify-center py-4">
										<Loader2 className="h-8 w-8 animate-spin" />
									</div>
								)}

								{searchError && (
									<div className="text-red-500 p-4 rounded-lg bg-red-50 dark:bg-red-900/20">
										Error: {searchError}
									</div>
								)}

								{searchResults && (
									<div className="mt-4 space-y-4">
										{/* User Profile Section */}
										<div className="flex flex-col sm:flex-row items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
											<Avatar className="h-16 w-16">
												<AvatarImage
													src={
														searchResults.discord
															?.avatar
															? `https://cdn.discordapp.com/avatars/${searchResults.discord.id}/${searchResults.discord.avatar}.png`
															: undefined
													}
												/>
												<AvatarFallback>
													{searchResults.discord?.username?.charAt(
														0
													) || "U"}
												</AvatarFallback>
											</Avatar>
											<div className="text-center sm:text-left space-y-1">
												<h3 className="text-xl font-bold">
													{searchResults.discord
														?.global_name ||
														searchResults.discord
															?.username}
													{searchResults.discord
														?.discriminator &&
														searchResults.discord
															.discriminator !==
															"0" && (
															<span className="text-gray-500 dark:text-gray-400">
																#
																{
																	searchResults
																		.discord
																		.discriminator
																}
															</span>
														)}
												</h3>
												<p className="text-gray-600 dark:text-gray-400">
													{searchResults.discord?.id}
												</p>
											</div>
										</div>

										{/* User Details in Input Fields */}
										<div className="space-y-3">
											<div>
												<Label htmlFor="userId">
													User ID
												</Label>
												<Input
													id="userId"
													value={
														searchResults.discord
															?.id || ""
													}
													disabled
													className="bg-gray-100 dark:bg-gray-800"
												/>
											</div>

											<div>
												<Label htmlFor="username">
													Username
												</Label>
												<Input
													id="username"
													value={
														searchResults.discord
															?.username || ""
													}
													disabled
													className="bg-gray-100 dark:bg-gray-800"
												/>
											</div>

											<div>
												<Label htmlFor="displayName">
													Display Name
												</Label>
												<Input
													id="displayName"
													value={
														searchResults.discord
															?.global_name ||
														"None"
													}
													disabled
													className="bg-gray-100 dark:bg-gray-800"
												/>
											</div>

											{searchResults.user && (
												<>
													<div>
														<Label htmlFor="createdAt">
															Account Created
														</Label>
														<Input
															id="createdAt"
															value={
																searchResults.discord
																	? new Date(
																			searchResults
																				.discord
																				.id /
																				4194304 +
																				1420070400000
																	  ).toLocaleDateString()
																	: "Unknown"
															}
															disabled
															className="bg-gray-100 dark:bg-gray-800"
														/>
													</div>

													<div>
														<Label htmlFor="registeredAt">
															Registered On Site
														</Label>
														<Input
															id="registeredAt"
															value={new Date(
																searchResults.user.createdAt
															).toLocaleDateString()}
															disabled
															className="bg-gray-100 dark:bg-gray-800"
														/>
													</div>

													<div className="flex items-center gap-4">
														<div className="flex-1">
															<Label htmlFor="adminStatus">
																Admin Status
															</Label>
															<Input
																id="adminStatus"
																value={
																	searchResults
																		.user
																		.user
																		.admin
																		? "Yes"
																		: "No"
																}
																disabled
																className="bg-gray-100 dark:bg-gray-800"
															/>
														</div>
														<div className="flex-1">
															<Label htmlFor="themeCount">
																Theme Count
															</Label>
															<Input
																id="themeCount"
																value={
																	searchResults
																		.user
																		.user
																		.themes
																		?.length ||
																	0
																}
																disabled
																className="bg-gray-100 dark:bg-gray-800"
															/>
														</div>
													</div>

													{searchResults.user.user
														.githubAccount && (
														<div>
															<Label htmlFor="githubAccount">
																GitHub Account
															</Label>
															<Input
																id="githubAccount"
																value={
																	searchResults
																		.user
																		.user
																		.githubAccount
																}
																disabled
																className="bg-gray-100 dark:bg-gray-800"
															/>
														</div>
													)}
												</>
											)}
										</div>
									</div>
								)}
							</DialogContent>
						</Dialog>
					</CardContent>
				</Card>

				<Card className="hover:shadow-lg transition-shadow duration-200">
					<CardHeader className="flex flex-row items-center justify-between pb-2">
						<CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-300">
							Total Themes
						</CardTitle>
						<FileCode className="h-4 w-4 text-gray-500 dark:text-gray-400" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold text-gray-900 dark:text-white">
							{stats?.themes.total}
						</div>
						<p className="text-xs text-muted-foreground mt-1">
							Top author:{" "}
							<span className="font-medium">
								{stats?.themes.topAuthor.themeCount}
							</span>{" "}
							themes
						</p>
					</CardContent>
				</Card>

				<Card className="hover:shadow-lg transition-shadow duration-200">
					<CardHeader className="flex flex-row items-center justify-between pb-2">
						<CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-300">
							Total Downloads
						</CardTitle>
						<Download className="h-4 w-4 text-gray-500 dark:text-gray-400" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold text-gray-900 dark:text-white">
							{stats?.themes.totalDownloads.toLocaleString()}
						</div>
					</CardContent>
				</Card>
			</div>

			<div className="grid grid-cols-1 gap-4 mt-4">
				<Card className="hover:shadow-lg transition-shadow duration-200">
					<CardHeader className="flex flex-row items-center justify-between pb-2">
						<CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-300">
							Server Uptime
						</CardTitle>
						<Clock className="h-4 w-4 text-gray-500 dark:text-gray-400" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold text-gray-900 dark:text-white">
							{Math.floor(stats?.sst.up / 86400)} days
						</div>
					</CardContent>
				</Card>
			</div>

			<div className="mt-8">
				<Card className="hover:shadow-lg transition-shadow duration-200">
					<CardHeader>
						<CardTitle className="text-gray-800 dark:text-white">
							Database Statistics
						</CardTitle>
						<CardDescription>
							Current database metrics and usage
						</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
							{[
								{
									title: "Collections",
									value: stats?.dbst.collections
								},
								{
									title: "Objects",
									value: stats?.dbst.objects.toLocaleString()
								},
								{
									title: "Data Size",
									value: formatBytes(stats?.dbst.dataSize)
								},
								{
									title: "Storage Size",
									value: formatBytes(stats?.dbst.storageSize)
								}
							].map((item, index) => (
								<div key={index} className="p-4 rounded-lg">
									<h3 className="text-sm font-medium text-gray-600 dark:text-gray-300">
										{item.title}
									</h3>
									<p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
										{item.value}
									</p>
								</div>
							))}
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
