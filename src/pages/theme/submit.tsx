import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { Progress } from "@components/ui/progress";
import { Card } from "@components/ui/card";
import { Input } from "@components/ui/input";
import { Label } from "@components/ui/label";
import { Button } from "@components/ui/button";
import { ImageIcon, Upload, Users } from "lucide-react";
import MarkdownInput from "@components/ui/markdown-input";
import Image from "next/image";

export default function SubmitPage() {
    const router = useRouter();
    const [isAuthed, setIsAuthed] = useState(null);
    // eslint-disable-next-line no-unused-vars
    const [user, setUser] = useState({});
    const [step, setStep] = useState(1);
    const [dragActive, setDragActive] = useState(false);
    const [formData, setFormData] = useState({
        title: "",
        shortDescription: "",
        file: null,
        fileUrl: "",
        longDescription: "",
        contributors: ""
    });
    const [fetching, setFetching] = useState(true);

    useEffect(() => {
        function getCookie(name: string): string | undefined {
            const value = "; " + document.cookie;
            const parts = value.split("; " + name + "=");
            if (parts.length === 2) return parts.pop()?.split(";").shift();
        }

        const token = getCookie("_dtoken");

        async function fetchData() {
            const response = await fetch("/api/user/isAuthed", {
                method: "POST",
                headers: { "Content-Type": "application/json" , Authorization: `Bearer ${token}` }
            }).then((res) => res.json());
            setIsAuthed(response?.authenticated ?? false);
            setUser(response.user);
            setFetching(false);
        }

        if (token) {
            fetchData();
        } else {
            setIsAuthed(false);
        }
    }, []);

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

        if (isAuthed === false && token) {
            deleteCookie("_dtoken");
            router.push("/");
        }
    }, [router, isAuthed]);

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

    const nextStep = () => {
        if (step < totalSteps) setStep(step + 1);
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
        console.log(form);
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
                {!fetching &&
                    (isAuthed ? (
                        <div className="container mx-auto px-4 py-8">
                            <div className="flex gap-8 max-w-6xl mx-auto">
                                <div className="w-64 hidden md:block">
                                    <div className="sticky top-8">
                                        <h2 className="text-lg font-semibold mb-4">Progress</h2>
                                        <div className="space-y-4">
                                            <Progress value={progress} className="h-2" />
                                            {["Title", "Short Description", "Long Description", "Cover Image", "Contributors"].map((label, index) => (
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
                                                    <Input id="title" value={formData.title} onChange={(e) => updateFormData("title", e.target.value)} placeholder="Enter project title..." />
                                                </div>
                                            </div>
                                        )}

                                        {step === 2 && (
                                            <div className="space-y-4">
                                                <h2 className="text-2xl font-semibold">Short Description</h2>
                                                <p className="text-muted-foreground">Provide a brief description of your theme, this will be shown on the front-page cards.</p>
                                                <MarkdownInput defaultContent={formData.shortDescription} onChange={(value) => updateFormData("shortDescription", value)} lines={3} />
                                            </div>
                                        )}

                                        {step === 3 && (
                                            <div className="space-y-4">
                                                <h2 className="text-2xl font-semibold">Long Description</h2>
                                                <p className="text-muted-foreground">Provide detailed information about your theme, this will be shown on the theme page.</p>
                                                <MarkdownInput defaultContent={formData.longDescription} onChange={(value) => updateFormData("longDescription", value)} lines={10} />
                                            </div>
                                        )}

                                        {step === 4 && (
                                            <div className="space-y-4">
                                                <h2 className="text-2xl font-semibold">Theme Preview</h2>
                                                <p className="text-muted-foreground">
                                                    Upload a preview image of your theme. If you don't have one, use our API:
                                                    <a href="/api/preview" className="text-primary hover:underline ml-1" target="_blank" rel="noopener noreferrer">
                                                        https://discord-themes.com/api/preview?url=https://...
                                                    </a>
                                                </p>
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
                                                    <div className="flex items-center space-x-2">
                                                        <ImageIcon className="w-5 h-5 text-muted-foreground" />
                                                        <Input value={formData.fileUrl} onChange={(e) => updateFormData("fileUrl", e.target.value)} placeholder="Or enter image URL..." className="flex-1" />
                                                        <Button variant="outline" onClick={() => updateFormData("file", formData.fileUrl)}>
                                                            Load
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {step === 5 && (
                                            <div className="space-y-4">
                                                <h2 className="text-2xl font-semibold">Contributors</h2>
                                                <p className="text-muted-foreground">Any contributors? List their Discord User Ids below!</p>
                                                <div className="space-y-4">
                                                    <div className="flex items-center gap-4">
                                                        <Users className="h-12 w-12 text-muted-foreground" />
                                                        <Input value={formData.contributors} onChange={(e) => updateFormData("contributors", e.target.value)} placeholder="Enter contributors (comma separated)..." />
                                                    </div>
                                                </div>
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
