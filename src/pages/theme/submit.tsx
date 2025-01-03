"use client";

import { useRouter } from "next/router";
import { type FocusEvent, useEffect, useRef, useState } from "react";
import { Progress } from "@components/ui/progress";
import { Card } from "@components/ui/card";
import { Input } from "@components/ui/input";
import { Label } from "@components/ui/label";
import { Button } from "@components/ui/button";
import { ImageIcon, Loader2, LoaderCircleIcon, Upload, X } from "lucide-react";
import MarkdownInput from "@components/ui/markdown-input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@components/ui/dialog";
import { useWebContext } from "@context/auth";
import { Alert, AlertDescription } from "@components/ui/alert";
import { deleteCookie, getCookie } from "@utils/cookies";
import { toast } from "@hooks/use-toast";
import Head from "next/head";

interface ValidatedUser {
    id: string;
    username: string;
    avatar: string;
}

export default function SubmitPage() {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [dragActive, setDragActive] = useState(false);
    const [formData, setFormData] = useState({
        title: "",
        file: null,
        fileUrl: "",
        description: "",
        contributors: [""],
        sourceLink: "",
        validatedUsers: {} as Record<string, ValidatedUser>
    });
    const [showPreviewModal, setShowPreviewModal] = useState(false);
    const [previewUrl, setPreviewUrl] = useState("");
    const [isLoadingPreview, setIsLoadingPreview] = useState(false);
    const [validSource, setValidSource] = useState(false);
    const [urlError, setUrlError] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [shakeError, setShakeError] = useState(false);
    const { authorizedUser, isAuthenticated, isLoading } = useWebContext();

    const isValidImageUrl = (url: string) => {
        if (!url) return false;
        const validExtensions = [".png", ".gif", ".webp", ".jpg", ".jpeg"];
        return validExtensions.some((ext) => url.toLowerCase().endsWith(ext));
    };

    useEffect(() => {
        const token = getCookie("_dtoken");

        if (isAuthenticated === false && token) {
            deleteCookie("_dtoken");
            router.push("/");
        }
    }, [router, isAuthenticated]);

    useEffect(() => {
        const handleBeforeUnload = (event: BeforeUnloadEvent) => {
            if (step > 1) event.preventDefault();
        };

        window.addEventListener("beforeunload", handleBeforeUnload);

        return () => {
            window.removeEventListener("beforeunload", handleBeforeUnload);
        };
    }, [step]);

    const totalSteps = 4;
    const progress = (step / totalSteps) * 100;

    const updateFormData = (field: string, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    function validateStep(step: number, data: typeof formData) {
        const newErrors: Record<string, string> = {};
        if (step === 1 && data.title.trim().length < 3) newErrors.title = "Title must be longer than 3 characters.";
        if (step === 2 && !data.description.trim()) newErrors.description = "Description is required.";
        if (step === 3 && !data.file) newErrors.file = "Preview image is required.";
        if (step === 4) {
            if (!data.sourceLink.trim()) {
                newErrors.sourceLink = "Source link is required.";
            } else if (!isValidSourceUrl(data.sourceLink.trim())) {
                newErrors.sourceLink = "Invalid source link.";
            }
        }
        return newErrors;
    }

    const nextStep = () => {
        const stepErrors = validateStep(step, formData);
        if (Object.keys(stepErrors).length > 0) {
            setErrors(stepErrors);
            setShakeError(true);
            setTimeout(() => setShakeError(false), 500);
            return;
        }

        if (step === totalSteps) return handleSubmit(formData);
        setStep(step + 1);
    };

    const prevStep = () => {
        if (step > 1) setStep(step - 1);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        setDragActive(true);
    };

    const handleDragLeave = () => {
        setDragActive(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFileChange(e.dataTransfer.files[0]);
        }
    };

    const handleFileChange = (file) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            setFormData((prev) => ({ ...prev, file: e.target.result }));
        };
        reader.readAsDataURL(file);
    };

    const handleSubmit = async (form) => {
        setSubmitting(true);
        const finalErrors = validateStep(step, form);
        if (Object.keys(finalErrors).length > 0) {
            setErrors(finalErrors);
            return;
        }

        form.contributors = [authorizedUser.id, ...new Set(form.contributors)];

        form.validatedUsers = {
            ...form.validatedUsers,
            [authorizedUser.id]: {
                id: authorizedUser.id,
                username: authorizedUser.global_name,
                avatar: authorizedUser.avatar,
                github_name: authorizedUser.githubAccount
            }
        };

        const response = await fetch("/api/submit/theme", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${getCookie("_dtoken")}`
            },
            body: JSON.stringify(form)
        });

        if (response.ok) {
            const data = await response.json();
            router.push(`/theme/submitted/${data.id}`);
        } else {
            setSubmitting(false);
            toast({
                title: "Failed to submit",
                description: "An error occurred while submitting your theme. Please try again later.",
                variant: "destructive"
            })
        }
    };

    const fetchPreview = async (url: string) => {
        setIsLoadingPreview(true);
        try {
            const response = await fetch(`/api/preview/screenshot?url=${encodeURIComponent(url)}`);
            const buffer = await response.arrayBuffer();
            const base64Image = btoa(new Uint8Array(buffer).reduce((data, byte) => data + String.fromCharCode(byte), ""));
            setFormData((prev) => ({
                ...prev,
                file: `data:image/png;base64,${base64Image}`
            }));
            setShowPreviewModal(false);
        } catch (error) {
            console.error("Failed to fetch preview:", error);
        } finally {
            setIsLoadingPreview(false);
        }
    };

    const isValidSourceUrl = (url: string) => {
        if (!url) return true;
        return url.includes("github.com/") || url.includes("github.io/") || url.includes("gitlab.com/") || url.includes("raw.githubusercontent.com/");
    };

    const validateDiscordUsers = async (userIds: string[]) => {
        try {
            const response = await fetch("/api/user/isValid", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${getCookie("_dtoken")}`
                },
                body: JSON.stringify({ users: userIds })
            });

            if (!response.ok) return [];

            const data = await response.json();
            return data.users as ValidatedUser[];
        } catch (error) {
            console.error("Failed to validate users:", error);
            return [];
        }
    };

    const ContributorInputs = () => {
        const [isValidating, setIsValidating] = useState(false);
        const [validationError, setValidationError] = useState("");
        const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
        const [bulkInput, setBulkInput] = useState("");

        const validateAndAddUser = async (userId: string) => {
            if (!userId.trim()) return;
            setIsValidating(true);
            setValidationError("");

            const validUsers = await validateDiscordUsers([userId]);
            if (validUsers.length > 0) {
                const validUser = validUsers[0];
                setFormData((prev) => ({
                    ...prev,
                    validatedUsers: {
                        ...prev.validatedUsers,
                        [userId]: validUser
                    }
                }));
            } else {
                setValidationError(`Invalid Discord ID: ${userId}`);
            }
            setIsValidating(false);
        };

        const handleBulkInput = async (e: FocusEvent<HTMLInputElement>) => {
            const value = e.target.value;
            if (!value) return;

            const newIds = value.split(/[\s,]+/).filter((id) => id.trim());
            setBulkInput("");

            setIsValidating(true);
            const validUsers = await validateDiscordUsers(newIds);

            if (validUsers.length > 0) {
                const newValidatedUsers = validUsers.reduce(
                    (acc, user) => {
                        acc[user.id] = user;
                        return acc;
                    },
                    {} as Record<string, ValidatedUser>
                );

                setFormData((prev) => ({
                    ...prev,
                    contributors: [...new Set([...prev.contributors, ...validUsers.map((u) => u.id)])],
                    validatedUsers: { ...prev.validatedUsers, ...newValidatedUsers }
                }));
            }
            setIsValidating(false);
        };

        return (
            <div className="space-y-2 mt-2">
                {formData.contributors
                    .filter((id) => id)
                    .map((contributorId, index) => (
                        <div key={`contributor-${index}`} className="flex items-center gap-2">
                            <div className="flex-1 select-none flex items-center gap-2 p-2 border border-muted rounded">
                                {formData.validatedUsers[contributorId] ? (
                                    <div className="flex items-center gap-2 min-w-0">
                                        <img src={`https://cdn.discordapp.com/avatars/${contributorId}/${formData.validatedUsers[contributorId].avatar}.png`} className="w-8 h-8 rounded-full flex-shrink-0" draggable={false} alt={formData.validatedUsers[contributorId].username} />
                                        <span className="truncate">{formData.validatedUsers[contributorId].username}</span>
                                        <span className="text-muted-foreground text-sm truncate flex-shrink-0">({contributorId})</span>
                                    </div>
                                ) : (
                                    <Input
                                        value={contributorId}
                                        disabled={submitting}
                                        onChange={(e) => {
                                            const newContributors = [...formData.contributors];
                                            newContributors[index] = e.target.value;
                                            setFormData((prev) => ({
                                                ...prev,
                                                contributors: newContributors
                                            }));
                                        }}
                                        onBlur={(e) => validateAndAddUser(e.target.value)}
                                        placeholder="Discord User ID"
                                        ref={(el) => (inputRefs.current[index] = el)}
                                    />
                                )}
                            </div>
                            <Button
                                variant="ghost"
                                size="icon"
                                disabled={submitting}
                                onClick={() => {
                                    setFormData((prev) => ({
                                        ...prev,
                                        contributors: prev.contributors.filter((_, i) => i !== index)
                                    }));
                                }}
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                    ))}

                <div className="flex flex-col gap-2">
                    <Input value={bulkInput} onChange={(e) => setBulkInput(e.target.value)} onBlur={handleBulkInput} placeholder="Type multiple IDs separated by spaces..." className="italic" disabled={isValidating || submitting} />
                    {isValidating && <p className="text-sm text-muted-foreground">Validating users...</p>}
                    {validationError && (
                        <Alert className={`mt-2 border-red-600/20 bg-red-500/10 ${shakeError ? "shake" : ""}`}>
                            <AlertDescription className="text-sm">{validationError}</AlertDescription>
                        </Alert>
                    )}
                </div>
            </div>
        );
    };

    return (
        <>
            <Head>
                <meta name="viewport" content="initial-scale=1, width=device-width" />
                <meta name="keywords" content="discord themes, custom discord themes, discord css, betterdiscord themes, vencord themes, discord customization, theme submission" />
                <meta name="theme-color" content="#5865F2" />
                <meta name="application-name" content="Theme Library" />
                <meta name="description" content="Submit your custom Discord theme to our library. Share your creative Discord CSS themes with the community for BetterDiscord, Vencord and other Discord mods." />
                <meta property="og:type" content="website" />
                <meta property="og:url" content="https://discord-themes.com/" />
                <meta property="og:title" content="Submit Your Discord Theme | Theme Library" />
                <meta property="og:description" content="Share your custom Discord theme with our community. Submit your creative Discord CSS themes for BetterDiscord, Vencord and other Discord mods." />
                <title>Submit Your Discord Theme | Theme Library</title>
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <div className="min-h-screen">
                {!isLoading &&
                    (isAuthenticated ? (
                        <div className="container mx-auto px-4 py-8">
                            <div className="flex gap-8 max-w-6xl mx-auto">
                                <div className="w-64 hidden md:block">
                                    <div className="top-8 select-none">
                                        <h2 className="font-semibold mb-4">Progress</h2>
                                        <div className="space-y-4">
                                            <Progress value={progress} className="h-2" />
                                            {["Title", "Description", "Cover Image", "Attribution"].map((label, index) => (
                                                <div key={label} className={`flex items-center gap-3 ${step === index + 1 ? "text-primary font-medium" : "text-muted-foreground"}`}>
                                                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-sm ${step === index + 1 ? "bg-primary text-primary-foreground" : "bg-muted"}`}>{index + 1}</div>
                                                    <span>{label}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex-1">
                                    <Card className="p-6">
                                        {step === 1 && (
                                            <div className="space-y-4">
                                                <h2 className="text-2xl font-semibold">Theme Title</h2>
                                                <p className="text-muted-foreground">Choose a clear and descriptive title for your theme.</p>
                                                <div className="space-y-2">
                                                    <Label htmlFor="title">Title</Label>
                                                    <Input id="title" value={formData.title} onChange={(e) => updateFormData("title", e.target.value)} placeholder="Enter theme title..." />
                                                    {errors.title && (
                                                        <Alert className={`mt-2 border-red-600/20 bg-red-500/10 ${shakeError ? "shake" : ""}`}>
                                                            <AlertDescription className="text-sm">{errors.title}</AlertDescription>
                                                        </Alert>
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        {step === 2 && (
                                            <div className="space-y-4">
                                                <h2 className="text-2xl font-semibold">Description</h2>
                                                <p className="text-muted-foreground">Provide a brief description of your theme, this will be shown on the front-page cards.</p>
                                                <MarkdownInput defaultContent={formData.description} onChange={(value) => updateFormData("description", value)} lines={3} />
                                                {errors.description && (
                                                    <Alert className={`mt-2 border-red-600/20 bg-red-500/10 ${shakeError ? "shake" : ""}`}>
                                                        <AlertDescription className="text-sm">{errors.description}</AlertDescription>
                                                    </Alert>
                                                )}
                                            </div>
                                        )}

                                        {step === 3 && (
                                            <div className="space-y-4">
                                                <h2 className="text-2xl font-semibold">Theme Preview</h2>
                                                <p className="text-muted-foreground">Upload a preview image of your theme. If you don't have one, generate a preview by using the "I don't have a Picture" button.</p>
                                                <div className="space-y-6">
                                                    <div className={`border-2 ${dragActive ? "border-primary" : "border-input"} hover:border-primary transition-colors duration-200 border-dashed rounded-lg p-8 text-center`} onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop}>
                                                        <Input type="file" accept="image/png, image/gif, image/webp" onChange={(e) => handleFileChange(e.target.files[0])} className="hidden" id="file-upload" />
                                                        <Label htmlFor="file-upload" className="flex flex-col select-none items-center justify-center cursor-pointer">
                                                            <Upload className="w-12 h-12 text-muted-foreground mb-4" />
                                                            <p className="text-lg font-medium mb-2">Drag and drop a file here, or click to select</p>
                                                            <p className="text-sm text-muted-foreground">Supports PNG, GIF, WEBP</p>
                                                        </Label>
                                                    </div>
                                                    {formData.file && (
                                                        <div className="mt-4">
                                                            {/* Using <img> instead of <Image> because Next.js complains about hosts */}
                                                            <img draggable={false} width={854} height={480} src={formData.file} alt="Uploaded preview" className="rounded-lg w-full h-auto object-cover" />
                                                        </div>
                                                    )}
                                                    <div className="flex flex-col gap-2">
                                                        <div className="flex items-center space-x-2">
                                                            <ImageIcon className="w-5 h-5 text-muted-foreground" />
                                                            <Input
                                                                value={formData.fileUrl}
                                                                onChange={(e) => {
                                                                    setUrlError(false);
                                                                    updateFormData("fileUrl", e.target.value);
                                                                }}
                                                                placeholder="Or enter image URL..."
                                                                className={`flex-1 ${urlError ? "border-red-500" : ""}`}
                                                            />
                                                            <Button
                                                                variant="outline"
                                                                onClick={() => {
                                                                    if (isValidImageUrl(formData.fileUrl)) {
                                                                        setUrlError(false);
                                                                        updateFormData("file", formData.fileUrl);
                                                                    } else {
                                                                        setUrlError(true);
                                                                    }
                                                                }}
                                                            >
                                                                Load
                                                            </Button>
                                                        </div>
                                                        {urlError && (
                                                            <Alert className={`mt-2 border-red-600/20 bg-red-500/10 ${shakeError ? "shake" : ""}`}>
                                                                <AlertDescription className="text-sm">Please enter a valid image URL (PNG, GIF, WEBP, JPG)</AlertDescription>
                                                            </Alert>
                                                        )}
                                                    </div>
                                                    <Button variant="outline" onClick={() => setShowPreviewModal(true)} className="mt-4">
                                                        I don't have a Picture
                                                    </Button>

                                                    <Dialog open={showPreviewModal} onOpenChange={setShowPreviewModal}>
                                                        <DialogContent>
                                                            <DialogHeader>
                                                                <DialogTitle>Generate Theme Preview</DialogTitle>
                                                            </DialogHeader>
                                                            <p className="text-muted-foreground">Enter the URL of your theme to generate a preview image. Try to use GitHub raw URLs</p>
                                                            <div className="space-y-4">
                                                                <Input placeholder="Enter theme URL..." value={previewUrl} onChange={(e) => setPreviewUrl(e.target.value)} />
                                                                <Button onClick={() => fetchPreview(previewUrl)} disabled={isLoadingPreview || !previewUrl || !(previewUrl.startsWith("/api/") || previewUrl.startsWith("https://") || previewUrl.startsWith("http://"))} className="w-full">
                                                                    {isLoadingPreview ? (
                                                                        <>
                                                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                                            Generating Preview...
                                                                        </>
                                                                    ) : (
                                                                        "Generate Preview"
                                                                    )}
                                                                </Button>{" "}
                                                            </div>
                                                        </DialogContent>
                                                    </Dialog>
                                                </div>
                                                {errors.file && (
                                                    <Alert className={`mt-2 border-red-600/20 bg-red-500/10 ${shakeError ? "shake" : ""}`}>
                                                        <AlertDescription className="text-sm">{errors.file}</AlertDescription>
                                                    </Alert>
                                                )}
                                            </div>
                                        )}

                                        {step === 4 && (
                                            <div className="space-y-4">
                                                <section>
                                                    <h2 className="text-2xl font-semibold">Attribution</h2>
                                                    <p className="text-muted-foreground">Anyone else that contributored to your theme? List their Discord User ID below! Make sure they used this site before, otherwise only their username will be shown.</p>
                                                    <div className="space-y-4">
                                                        <ContributorInputs />
                                                    </div>
                                                </section>
                                                <div className="space-y-4">
                                                    <h2 className="text-2xl font-semibold">Source</h2>
                                                    <p className="text-muted-foreground">
                                                        Please use the <b>direct link</b> to your theme which contains the full source, this later will be served as a download link for the users.
                                                    </p>
                                                    <Alert className="border-yellow-600/20 bg-yellow-500/10">
                                                        <AlertDescription className="text-sm">Ensure your .css file/snippet has <b>metadata</b> at the top of it</AlertDescription>
                                                    </Alert>
                                                    <Input
                                                        className={`${!validSource ? "border-red-500" : ""}`}
                                                        value={formData.sourceLink}
                                                        disabled={submitting}
                                                        onChange={(e) => {
                                                            const value = e.target.value;
                                                            setValidSource(isValidSourceUrl(value));
                                                            updateFormData("sourceLink", value);
                                                        }}
                                                        placeholder="Enter source URL..."
                                                    />
                                                    {!validSource && formData.sourceLink && (
                                                        <Alert className="mt-4 border-yellow-600/20 bg-yellow-500/10">
                                                            <AlertDescription className="text-sm">Please use GitHub or GitLab for the source link.</AlertDescription>
                                                        </Alert>
                                                    )}
                                                </div>
                                                {errors.sourceLink && (
                                                    <Alert className={`mt-2 border-red-600/20 bg-red-500/10 ${shakeError ? "shake" : ""}`}>
                                                        <AlertDescription className="text-sm">{errors.sourceLink}</AlertDescription>
                                                    </Alert>
                                                )}
                                            </div>
                                        )}

                                        <div className="flex justify-between mt-8">
                                            <Button variant="outline" onClick={prevStep} disabled={step === 1 || submitting}>
                                                Previous
                                            </Button>
                                            <Button disabled={submitting} onClick={nextStep}>
                                                {step === totalSteps ? (
                                                    submitting ? (
                                                        <>
                                                            <LoaderCircleIcon className={`h-4 w-4 mr-2 animate-spin ${submitting ? "text-white" : "text-muted-foreground"}`} />
                                                            Submitting...
                                                        </>
                                                    ) : (
                                                        "Submit"
                                                    )
                                                ) : (
                                                    "Next Step"
                                                )}
                                            </Button>
                                        </div>
                                    </Card>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="flex justify-center items-center min-h-screen">
                            <p className="text-2xl">Redirecting...</p>
                        </div>
                    ))}
            </div>
        </>
    );
}
