/* eslint-disable no-constant-binary-expression */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-hooks/rules-of-hooks */
"use client";

import { useRouter } from "next/navigation";
import { Button } from "@components/ui/button";
import {
	Book,
	Calendar,
	Check,
	Code,
	Copy,
	Download,
	ExternalLink,
	Eye,
	Github,
	Heart
} from "lucide-react";
import { MouseEvent, useEffect, useState } from "react";
import Head from "next/head";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import Image from "next/image";
import { useWebContext } from "@context/auth";
import { Card, CardContent } from "@components/ui/card";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger
} from "@components/ui/tooltip";
import { useToast } from "@hooks/use-toast";
import { getCookie } from "@utils/cookies";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/cjs/styles/prism";
import { EditThemeModal } from "@components/theme/edit-modal";
import { ConfirmDialog } from "@components/ui/confirm-modal";
import { type Theme } from "@types";

const Skeleton = ({ className = "", ...props }) => (
	<div
		className={`animate-pulse bg-muted/30 rounded ${className}`}
		{...props}
	/>
);

export default function Component({
	id,
	theme
}: {
	id?: string;
	theme: Theme;
}) {
	const [isDownloaded, setIsDownloaded] = useState(false);
	const [isExpanded, setIsExpanded] = useState(false);
	const [likedThemes, setLikedThemes] = useState();
	const [isLikeDisabled, setIsLikeDisabled] = useState(false);
	const [isMobile, setIsMobile] = useState(false);
	const { authorizedUser, isAuthenticated, isLoading } = useWebContext();
	const { toast } = useToast();
	const [isCopied, setIsCopied] = useState(false);
	const [editModalOpen, setEditModalOpen] = useState(false);
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

	const router = useRouter();
	const previewUrl = `/api/preview?url=/api/${id}`;

	useEffect(() => {
		setIsMobile(window.innerWidth <= 768);

		const handleResize = () => {
			setIsMobile(window.innerWidth <= 768);
		};

		window.addEventListener("resize", handleResize);
		return () => window.removeEventListener("resize", handleResize);
	}, []);

	useEffect(() => {
		if (isAuthenticated) {
			getLikedThemes();
		}
	}, [isAuthenticated]);

	if (!id) {
		return (
			<div className="flex items-center justify-center min-h-screen">
				<Skeleton className="w-32 h-8" />
			</div>
		);
	}

	const handleAuthorClick = author => {
		router.push(`/users/${author.discord_snowflake}`);
	};

	const handleGithubClick = githubName => {
		window.open(`https://github.com/${githubName}`, "_blank");
	};

	const handleEdit = async updatedTheme => {
		try {
			const response = await fetch(`/api/themes/${theme.id}`, {
				method: "PUT",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${getCookie("_dtoken")}`
				},
				body: JSON.stringify(updatedTheme)
			});

			if (response.ok) {
				toast({ description: "Theme updated successfully" });
				window.location.reload();
			}
		} catch {
			toast({ description: "Failed to update theme" });
		}
	};

	const handleDelete = async () => {
		try {
			const response = await fetch(`/api/themes/${theme.id}`, {
				method: "DELETE",
				headers: {
					Authorization: `Bearer ${getCookie("_dtoken")}`
				}
			});

			if (response.ok) {
				toast({ description: "Theme deleted successfully" });
				window.location.href = "/";
			}
		} catch {
			toast({ description: "Failed to delete theme" });
		}
	};

	const renderAuthor = author => {
		if (isLoading) {
			return (
				<div
					key={author.discord_snowflake}
					className="p-2 rounded-lg border bg-background border-input"
				>
					<Skeleton className="h-4 w-1/2 mb-2" />
					<Skeleton className="h-4 w-1/3" />
					<Skeleton className="h-4 w-1/4 mt-2" />
				</div>
			);
		}

		return (
			<div
				key={author.discord_snowflake}
				className="p-3 rounded-lg border bg-background border-input hover:border-primary/40 transition-colors"
			>
				<p className="font-semibold">{author.discord_name}</p>
				<p className="text-xs text-muted-foreground">
					ID: {author.discord_snowflake}
				</p>
				<div
					className={`grid ${
						author.github_name ? "grid-cols-2" : "grid-cols-1"
					} gap-2 mt-2`}
				>
					<Button
						variant="outline"
						onClick={() => handleAuthorClick(author)}
					>
						<ExternalLink className="mr-2 h-4 w-4" />
						Profile
					</Button>
					{author.github_name && (
						<Button
							variant="outline"
							onClick={() =>
								handleGithubClick(author.github_name)
							}
						>
							<Github className="mr-2 h-4 w-4" />
							Github
						</Button>
					)}
				</div>
			</div>
		);
	};

	const handleDownload = async (e: MouseEvent) => {
		e.preventDefault();
		e.stopPropagation();

		setIsDownloaded(true);

		window.location.href = `/api/download/${theme.id}`;

		setTimeout(() => {
			setIsDownloaded(false);
		}, 5000);
	};

	const handleLike = themeId => async () => {
		if (!isAuthenticated || isLikeDisabled) return;
		if (!themeId || !likedThemes) return;

		setIsLikeDisabled(true);

		const token = getCookie("_dtoken");
		let response: Response;
		// @ts-ignore
		const isCurrentlyLiked = likedThemes?.likes?.find(
			t => t.themeId === themeId
		)?.hasLiked;

		setLikedThemes(prev => ({
			// @ts-ignore
			...prev,
			likes: (prev as any)!.likes.map(like =>
				like.themeId === themeId
					? { ...like, hasLiked: !isCurrentlyLiked }
					: like
			)
		}));

		try {
			if (isCurrentlyLiked) {
				response = await fetch("/api/likes/remove", {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
						Authorization: `Bearer ${token}`
					},
					body: JSON.stringify({ themeId })
				});
			} else {
				response = await fetch("/api/likes/add", {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
						Authorization: `Bearer ${token}`
					},
					body: JSON.stringify({ themeId })
				});
			}

			if (!response.ok) {
				setLikedThemes(prev => ({
					// @ts-ignore
					...prev,
					likes: (prev as any)!.likes.map(like =>
						like.themeId === themeId
							? { ...like, hasLiked: isCurrentlyLiked }
							: like
					)
				}));

				toast({
					description: "Failed to like theme, try again later."
				});
			}
		} catch {
			setLikedThemes(prev => ({
				// @ts-ignore
				...prev,
				likes: (prev as any)!.likes.map(like =>
					like.themeId === themeId
						? { ...like, hasLiked: isCurrentlyLiked }
						: like
				)
			}));

			toast({
				description: "Failed to like theme, try again later."
			});
		}

		setTimeout(() => {
			setIsLikeDisabled(false);
		}, 1500);
	};

	async function getLikedThemes() {
		const token = getCookie("_dtoken");

		const response = await fetch("/api/likes/get", {
			method: "GET",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${token}`
			}
		}).then(res => res.json());

		setLikedThemes(response);
	}

	const decodeThemeContent = (content: string) => {
		try {
			return atob(content);
		} catch {
			return content;
		}
	};

	const handleCopyCode = (content: string) => {
		navigator.clipboard.writeText(content);
		setIsCopied(true);
		setTimeout(() => setIsCopied(false), 2000);
	};

	const statsItems = [
		{
			icon: Download,
			label: "Downloads",
			value: theme?.downloads || 0
		},
		{
			icon: Heart,
			label: "Likes",
			value: theme?.likes || 0
		},
		{
			icon: Calendar,
			label: "Created",
			value: theme?.release_date
				? new Date(theme.release_date).toLocaleDateString()
				: "Recently"
		},
		{
			icon: Book,
			label: "Version",
			value: theme?.version || "1.0.0"
		}
	];

	const ThemeStats = () => (
		<div className="grid grid-cols-2 gap-4 mt-6 select-none">
			{statsItems.map(({ icon: Icon, label, value }) => (
				<Card key={label} className="p-4">
					<CardContent className="p-0 flex flex-col items-center">
						<Icon className="h-5 w-5 text-muted-foreground mb-2" />
						<p className="text-xl font-bold">{value}</p>
						<p className="text-xs text-muted-foreground">{label}</p>
					</CardContent>
				</Card>
			))}
		</div>
	);

	return (
		<>
			<Head>
				<title>{theme.name} - Discord Theme</title>
				<meta name="description" content={theme.description} />
				<meta name="keywords" content={theme.tags.join(", ")} />
				<meta name="author" content="discord-themes.com" />

				<meta property="og:type" content="website" />
				<meta property="og:title" content={theme.name} />
				<meta property="og:description" content={theme.description} />
				<meta property="og:image" content={theme.thumbnail_url} />
				<meta property="og:url" content="https://discord-themes.com" />
				<meta
					property="og:site_name"
					content={`${
						// @ts-ignore
						theme.author?.discord_name
							? `@${theme.author.discord_name}`
							: theme.author
									.map(x => `@${x.discord_name}`)
									.join(", ")
					} - https://discord-themes.com`}
				/>

				<meta name="twitter:card" content="summary_large_image" />
				<meta name="twitter:title" content={theme.name} />
				<meta name="twitter:description" content={theme.description} />
				<meta name="twitter:image" content={theme.thumbnail_url} />
				<meta name="twitter:site" content="discord-themes.com" />
			</Head>

			<div className="min-h-screen bg-background">
				<div className="container mx-auto px-4 py-6">
					<div className="grid grid-cols-1 gap-6 md:grid-cols-[1fr_300px]">
						<div className="space-y-6">
							{isLoading ? (
								<>
									<Skeleton className="h-8 w-3/4" />
									<Skeleton className="h-32 w-full" />
									<Skeleton className="h-64 w-full" />
								</>
							) : (
								<div>
									<div className="rounded-lg border-b border-border/40 bg-card p-6 mb-2">
										<h2 className="text-2xl font-bold mb-4">
											{theme.name}
										</h2>
										<p className="description text-muted-foreground">
											<ReactMarkdown
												remarkPlugins={[remarkGfm]}
											>
												{theme.description}
											</ReactMarkdown>
										</p>
									</div>
									<div className="rounded-lg border-b border-border/40 bg-card p-6">
										<div className="bg-muted rounded-lg flex justify-center items-center max-w-[900px] overflow-hidden">
											<Image
												unoptimized
												draggable={false}
												src={theme.thumbnail_url}
												alt={theme.name}
												width={1920}
												height={1080}
												className="rounded-lg object-contain"
												priority
											/>
										</div>
									</div>
									<div className="rounded-lg border-b border-border/40 bg-card p-6 mt-2">
										<div className="mb-4">
											<div className="flex justify-between items-center mb-2">
												<h3 className="text-lg font-semibold">
													Theme Source
												</h3>
												<Button
													variant="outline"
													size="sm"
													onClick={() =>
														handleCopyCode(
															decodeThemeContent(
																theme.content
															)
														)
													}
												>
													{isCopied ? (
														<>
															<Check className="h-4 w-4 mr-2" />{" "}
															Copied
														</>
													) : (
														<>
															<Copy className="h-4 w-4 mr-2" />{" "}
															Copy Code
														</>
													)}
												</Button>
											</div>
										</div>

										<div
											className={`relative rounded-lg overflow-hidden max-w-[900px] codeFont font-mono transition-all duration-500 ${
												isMobile && !isExpanded
													? "max-h-[200px] fade-out"
													: "max-h-full"
											}`}
										>
											<SyntaxHighlighter
												language="css"
												style={vscDarkPlus}
												wrapLines={true}
												showLineNumbers={true}
												customStyle={{
													margin: 0,
													borderRadius: "0.5rem",
													maxHeight:
														isMobile && !isExpanded
															? "200px"
															: "none",
													fontFamily:
														"'Fira Code', monospace !important"
												}}
												codeTagProps={{
													style: {
														fontFamily: "monospace"
													}
												}}
											>
												{decodeThemeContent(
													theme.content
												)}
											</SyntaxHighlighter>
											{isMobile && !isExpanded && (
												<div className="absolute bottom-0 left-0 w-full h-12 bg-gradient-to-t from-card to-transparent"></div>
											)}
										</div>

										{isMobile && (
											<div className="rounded-lg border-b border-border/40 p-4">
												<Button
													variant="outline"
													className="w-full"
													size="sm"
													onClick={() =>
														setIsExpanded(
															!isExpanded
														)
													}
												>
													{isExpanded
														? "Collapse"
														: "Expand"}
												</Button>
											</div>
										)}
									</div>
								</div>
							)}
						</div>

						<div className="space-y-4">
							<div className="rounded-lg border-b border-border/40 bg-card p-4">
								<div className="space-y-3">
									<Button
										size="sm"
										disabled={isLoading || isDownloaded}
										onClick={handleDownload}
										className="w-full flex items-center gap-2 justify-center"
									>
										{isDownloaded ? (
											<>
												<Check className="h-4 w-4" />
												Downloaded
											</>
										) : (
											<>
												<Download className="h-4 w-4" />
												Download
											</>
										)}
									</Button>
									{theme.source && (
										<Button
											disabled={isLoading}
											variant="outline"
											className="w-full"
											size="lg"
											onClick={() =>
												window.open(
													theme.source,
													"_blank",
													"noopener,noreferrer"
												)
											}
										>
											<Github className="mr-2 h-4 w-4" />
											View on GitHub
										</Button>
									)}
									<Button
										disabled={isLoading || isMobile}
										variant="outline"
										className="w-full"
										size="lg"
										onClick={() =>
											window.open(
												previewUrl,
												"_blank",
												"noopener,noreferrer"
											)
										}
									>
										<Eye className="mr-2 h-4 w-4" />
										{isMobile
											? "Not available on mobile"
											: "Preview"}
									</Button>
									{!isLoading &&
										(isAuthenticated ? (
											<Button
												variant="outline"
												disabled={
													!isAuthenticated ||
													isLoading ||
													isLikeDisabled
												}
												className={`w-full ${
													// @ts-ignore
													likedThemes?.likes?.find(
														t =>
															t.themeId ===
															theme.id
													)?.hasLiked
														? "text-primary border-primary hover:bg-primary/10"
														: ""
												}`}
												onClick={handleLike(theme.id)}
											>
												{
													// @ts-ignore
													likedThemes?.likes?.find(
														t =>
															t.themeId ===
															theme.id
													)?.hasLiked ? (
														<Heart className="fill-current mr-2 h-4 w-4" />
													) : (
														<Heart className="mr-2 h-4 w-4" />
													)
												}
												{
													// @ts-ignore
													likedThemes?.likes?.find(
														t =>
															t.themeId ===
															theme.id
													)?.hasLiked
														? "Liked"
														: "Like"
												}
											</Button>
										) : (
											<TooltipProvider>
												<Tooltip>
													<TooltipTrigger className="w-full">
														<Button
															variant="outline"
															disabled={
																!isAuthenticated
															}
															className="w-full"
														>
															<Heart className="mr-2 h-4 w-4" />{" "}
															Like
														</Button>
													</TooltipTrigger>
													<TooltipContent>
														<p>
															You must be logged
															in to like themes.
														</p>
													</TooltipContent>
												</Tooltip>
											</TooltipProvider>
										))}
									{false &&
										!isLoading &&
										isAuthenticated &&
										(authorizedUser?.id ===
											// @ts-ignore
											theme?.author?.discord_snowflake ||
											authorizedUser?.is_admin) && (
											<div className="bg-card border border-muted rounded-lg p-4">
												<p className="text-l text-muted-foreground">
													Author Options
												</p>
												<Button
													variant="outline"
													className="w-full"
													onClick={() =>
														setEditModalOpen(true)
													}
												>
													<Code className="mr-2 h-4 w-4" />
													Edit
												</Button>
												<Button
													variant="outline"
													className="mt-2 w-full border-red-500 text-red-500 hover:bg-red-500 hover:text-white transition-colors"
													onClick={() =>
														setDeleteDialogOpen(
															true
														)
													}
												>
													<Code className="mr-2 h-4 w-4" />
													Delete
												</Button>
											</div>
										)}
								</div>
								{!isLoading && <ThemeStats />}
							</div>
							{!isLoading && (
								<div className="rounded-lg border-b border-border/40 bg-card p-4">
									<div className="space-y-3">
										<h2 className="text-lg font-semibold">
											Contributors
										</h2>
										<div className="grid gap-2">
											{Array.isArray(theme.author)
												? theme.author.map(renderAuthor)
												: renderAuthor(theme.author)}
										</div>
									</div>
								</div>
							)}
							{!isLoading && theme.guild && (
								<div className="rounded-lg border-b border-border/40 bg-card p-4">
									<div className="space-y-3">
										<h2>Support Server</h2>
										<Button
											variant="outline"
											onClick={() =>
												window.open(
													theme?.guild?.invite_link,
													"_blank"
												)
											}
											className="w-full"
										>
											<ExternalLink className="mr-2 h-4 w-4" />
											Join {theme.guild.name}
										</Button>
									</div>
								</div>
							)}
						</div>
					</div>
				</div>
				{!isLoading && (
					<>
						<EditThemeModal
							open={editModalOpen}
							onOpenChange={setEditModalOpen}
							theme={theme}
							onSave={handleEdit}
						/>

						<ConfirmDialog
							open={deleteDialogOpen}
							onOpenChange={setDeleteDialogOpen}
							onConfirm={handleDelete}
							title="Delete Theme"
							description="Are you sure you want to delete this theme? This action cannot be undone."
						/>
					</>
				)}
			</div>
		</>
	);
}
