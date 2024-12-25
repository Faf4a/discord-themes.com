"use client";

import { useRouter } from "next/router";
import { type FocusEvent, useEffect, useRef, useState } from "react";
import { Progress } from "@components/ui/progress";
import { Card } from "@components/ui/card";
import { Input } from "@components/ui/input";
import { Label } from "@components/ui/label";
import { Button } from "@components/ui/button";
import { ImageIcon, Loader2, Upload, X } from "lucide-react";
import MarkdownInput from "@components/ui/markdown-input";
import Image from "next/image";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@components/ui/dialog";
import { useWebContext } from "@context/auth";

export default function SubmitPage() {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [dragActive, setDragActive] = useState(false);
    const [formData, setFormData] = useState({
        title: "",
        shortDescription: "",
        file: null,
        fileUrl: "",
        longDescription: "",
        contributors: [""],
        sourceLink: ""
    });
    const [showPreviewModal, setShowPreviewModal] = useState(false);
    const [previewUrl, setPreviewUrl] = useState("");
    const [isLoadingPreview, setIsLoadingPreview] = useState(false);
    const [validSource, setValidSource] = useState(true);
    const [urlError, setUrlError] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const { authorizedUser, isAuthenticated, isLoading } = useWebContext();

    const isValidImageUrl = (url: string) => {
        if (!url) return false;
        const validExtensions = [".png", ".gif", ".webp", ".jpg", ".jpeg"];
        return validExtensions.some((ext) => url.toLowerCase().endsWith(ext));
    };


    useEffect(() => {
        function getCookie(name: string): string | undefined {
            const value = "; " + document.cookie;
            const parts = value.split("; " + name + "=");
            if (parts.length === 2) return parts.pop()?.split(";").shift();
        }

        function deleteCookie(name: string) {
            document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
        }

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

    const totalSteps = 5;
    const progress = (step / totalSteps) * 100;

    const updateFormData = (field: string, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    function validateStep(step: number, data: typeof formData) {
        const newErrors: Record<string, string> = {};
        if (step === 1 && !data.title.trim()) newErrors.title = "Title is required.";
        if (step === 2 && !data.shortDescription.trim()) newErrors.shortDescription = "Short description is required.";
        if (step === 3 && !data.longDescription.trim()) newErrors.longDescription = "Long description is required.";
        if (step === 4 && !data.file) newErrors.file = "Preview image is required.";
        if (step === 5 && data.sourceLink && !isValidSourceUrl(data.sourceLink)) newErrors.sourceLink = "Invalid source link.";
        return newErrors;
    }

    const nextStep = () => {
        const stepErrors = validateStep(step, formData);
        if (Object.keys(stepErrors).length > 0) {
            setErrors(stepErrors);
            return;
        }
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

    const handleSubmit = (form) => {
        const finalErrors = validateStep(step, form);
        if (Object.keys(finalErrors).length > 0) {
            setErrors(finalErrors);
            return;
        }

        form.contributors = [authorizedUser, ...form.contributors.filter((c) => c)];
        console.log(form);
    };

    const fetchPreview = async (url: string) => {
        setIsLoadingPreview(true);
        try {
            const response = await fetch(`/api/preview/screenshot?url=${encodeURIComponent(url)}`);
            const buffer = await response.arrayBuffer();
            const base64Image = btoa(
                new Uint8Array(buffer).reduce((data, byte) => data + String.fromCharCode(byte), "")
            );
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
        return url.includes("github.com/") || url.includes("github.io/") || url.includes("gitlab.com/");
    };

    const ContributorInputs = () => {
        const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
        const [bulkInput, setBulkInput] = useState("");

        const handleBulkInput = (e: FocusEvent<HTMLInputElement>) => {
            const value = e.target.value;
            if (!value) return;

            const newContributors = value
                .split(/[\s,]+/)
                .filter((id) => id.trim())
                .map((id) => id.trim());

            setFormData((prev) => ({
                ...prev,
                contributors: [...prev.contributors.filter((c) => c), ...newContributors]
            }));

            setBulkInput("");
        };

        const removeField = (index: number) => {
            setFormData((prev) => ({
                ...prev,
                contributors: prev.contributors.filter((_, i) => i !== index)
            }));
        };

        return (
            <div className="space-y-2 mt-2">
                {formData.contributors
                    .filter((c) => c)
                    .map((contributor, index) => (
                        <div key={`contributor-${index}`} className="flex items-center gap-2">
                            <Input
                                value={contributor}
                                onChange={(e) => {
                                    const newContributors = [...formData.contributors];
                                    newContributors[index] = e.target.value;
                                    setFormData((prev) => ({
                                        ...prev,
                                        contributors: newContributors
                                    }));
                                }}
                                placeholder="Discord User ID"
                                ref={(el) => {
                                    inputRefs.current[index] = el;
                                }}
                            />
                            <Button variant="ghost" size="icon" onClick={() => removeField(index)}>
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                    ))}

                <div className="flex items-center gap-4 mt-4">
                    <Input value={bulkInput} onChange={(e) => setBulkInput(e.target.value)} onBlur={handleBulkInput} placeholder="Type multiple IDs separated by spaces..." className="italic" />
                </div>
            </div>
        );
    };

    return (
        <>
            <header className="sticky top-0 z-999 border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <h1 className="text-xl font-semibold">
                            <a href="/">Theme Library</a>
                        </h1>
                    </div>
                </div>
            </header>
            <div className="min-h-screen">
                {!isLoading &&
                    (isAuthenticated ? (
                        <div className="container mx-auto px-4 py-8">
                            <div className="flex gap-8 max-w-6xl mx-auto">
                                <div className="w-64 hidden md:block">
                                    <div className="sticky top-8">
                                        <h2 className="text-lg font-semibold mb-4">Progress</h2>
                                        <div className="space-y-4">
                                            <Progress value={progress} className="h-2" />
                                            {["Title", "Short Description", "Long Description", "Cover Image", "Attribution"].map((label, index) => (
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
                                                    {errors.title && <p className="text-sm text-red-500">{errors.title}</p>}
                                                </div>
                                            </div>
                                        )}

                                        {step === 2 && (
                                            <div className="space-y-4">
                                                <h2 className="text-2xl font-semibold">Short Description</h2>
                                                <p className="text-muted-foreground">Provide a brief description of your theme, this will be shown on the front-page cards.</p>
                                                <MarkdownInput defaultContent={formData.shortDescription} onChange={(value) => updateFormData("shortDescription", value)} lines={3} />
                                                {errors.shortDescription && <p className="text-sm text-red-500">{errors.shortDescription}</p>}
                                            </div>
                                        )}

                                        {step === 3 && (
                                            <div className="space-y-4">
                                                <h2 className="text-2xl font-semibold">Long Description</h2>
                                                <p className="text-muted-foreground">Provide detailed information about your theme, this will be shown on the theme page.</p>
                                                <MarkdownInput defaultContent={formData.longDescription} onChange={(value) => updateFormData("longDescription", value)} lines={10} />
                                                {errors.longDescription && <p className="text-sm text-red-500">{errors.longDescription}</p>}
                                            </div>
                                        )}

                                        {step === 4 && (
                                            <div className="space-y-4">
                                                <h2 className="text-2xl font-semibold">Theme Preview</h2>
                                                <p className="text-muted-foreground">Upload a preview image of your theme. If you don't have one, generate a preview by using the "I don't have a Picture" button.</p>
                                                <div className="space-y-6">
                                                    <div className={`border-2 ${dragActive ? "border-primary" : "border-input"} hover:border-primary transition-colors duration-200 border-dashed rounded-lg p-8 text-center`} onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop}>
                                                        <Input type="file" accept="image/png, image/gif, image/webp" onChange={(e) => handleFileChange(e.target.files[0])} className="hidden" id="file-upload" />
                                                        <Label htmlFor="file-upload" className="flex flex-col items-center justify-center cursor-pointer">
                                                            <Upload className="w-12 h-12 text-muted-foreground mb-4" />
                                                            <p className="text-lg font-medium mb-2">Drag and drop a file here, or click to select</p>
                                                            <p className="text-sm text-muted-foreground">Supports PNG, GIF, WEBP</p>
                                                        </Label>
                                                    </div>
                                                    {formData.file && (
                                                        <div className="mt-4">
                                                            <Image priority width={854} height={480} src={formData.file} alt="Uploaded preview" className="rounded-lg w-full h-auto object-cover" />
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
                                                        {urlError && <p className="text-sm text-red-500">Please enter a valid image URL (PNG, GIF, WEBP, JPG)</p>}
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
                                                                <Button onClick={() => fetchPreview(previewUrl)} disabled={isLoadingPreview} className="w-full">
                                                                    {isLoadingPreview ? (
                                                                        <>
                                                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                                            Generating Preview...
                                                                        </>
                                                                    ) : (
                                                                        "Generate Preview"
                                                                    )}
                                                                </Button>
                                                            </div>
                                                        </DialogContent>
                                                    </Dialog>
                                                </div>
                                                {errors.file && <p className="text-sm text-red-500">{errors.file}</p>}
                                            </div>
                                        )}

                                        {step === 5 && (
                                            <div className="space-y-4">
                                                <section>
                                                    <h2 className="text-2xl font-semibold">Attribution</h2>
                                                    <p className="text-muted-foreground">
                                                        Anyone else that contributored to your theme? List their Discord User ID below! Make sure they used this site before, otherwise only their username will be shown.
                                                    </p>
                                                    <div className="space-y-4">
                                                        <ContributorInputs />
                                                    </div>
                                                </section>
                                                <div className="space-y-4">
                                                    <h2 className="text-2xl font-semibold">Source</h2>
                                                    <p className="text-muted-foreground">If your theme has a dedicated GitHub/GitLab repository, feel free to provide the link below.</p>
                                                    <Input
                                                        className={`${!validSource ? "border-red-500" : ""}`}
                                                        value={formData.sourceLink}
                                                        onChange={(e) => {
                                                            const value = e.target.value;
                                                            setValidSource(isValidSourceUrl(value));
                                                            updateFormData("sourceLink", value);
                                                        }}
                                                        placeholder="Enter source URL..."
                                                    />
                                                    {!validSource && <p className="text-sm text-red-500">URL must start with github.com/.io or gitlab.com</p>}{" "}
                                                </div>
                                                {errors.sourceLink && <p className="text-sm text-red-500">{errors.sourceLink}</p>}
                                            </div>
                                        )}

                                        <div className="flex justify-between mt-8">
                                            <Button variant="outline" onClick={prevStep} disabled={step === 1}>
                                                Previous
                                            </Button>
                                            <Button onClick={step === totalSteps ? () => handleSubmit(formData) : nextStep}>{step === totalSteps ? "Submit" : "Next"}</Button>
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
