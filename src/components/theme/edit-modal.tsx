import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@components/ui/dialog";
import { Button } from "@components/ui/button";
import { Input } from "@components/ui/input";
import { Textarea } from "@components/ui/textarea";
import { useMemo, useState } from "react";
import { ChevronLeft, Code, Edit2, Eye, Loader2Icon, Tag } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@lib/utils";
import { ThemeCard } from "./card";
import { Theme } from "@types";
import { useToast } from "@hooks/use-toast";

interface EditThemeModalProps {
    open: boolean;
    // eslint-disable-next-line no-unused-vars
    onOpenChange: (open: boolean) => void;
    theme?: Theme;
    // eslint-disable-next-line no-unused-vars
    onSave: (data: any) => Promise<void>;
}

export function EditThemeModal({ open, onOpenChange, theme, onSave }: EditThemeModalProps) {
    const { toast } = useToast();
    const [selectedOption, setSelectedOption] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        name: theme?.name || "",
        description: theme?.description || "",
        version: theme?.version || "",
        content: theme?.content || ""
    });

    const hasChanges = useMemo(() => {
        // Decode theme content only once
        const decodedThemeContent = theme?.content ? Buffer.from(theme.content, "base64").toString() : "";
        
        // Compare trimmed values to ignore whitespace differences
        return formData.name.trim() !== theme?.name?.trim() || 
               formData.description.trim() !== theme?.description?.trim() || 
               formData.version.trim() !== theme?.version?.trim() || 
               formData.content.trim() !== decodedThemeContent.trim();
    }, [formData, theme]);

    const isValid = useMemo(() => {
        return formData.name.trim() !== "" && 
               formData.description.trim() !== "" && 
               formData.version.trim() !== "" &&
               formData.content.trim() !== "";
    }, [formData]);

    const options = [
        { id: "name", label: "Name", icon: Edit2, current: theme?.name },
        { id: "description", label: "Description", icon: Edit2, current: theme?.description },
        { id: "version", label: "Version", icon: Tag, current: theme?.version },
        { id: "content", label: "CSS Content", icon: Code, current: Buffer.from(theme?.content || "", "base64").toString() },
        ...(hasChanges && isValid ? [{ id: "preview", label: "Preview Changes", icon: Eye }] : [])
    ];

    const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setError(null);
        setFormData((prev) => ({
            ...prev,
            [field]: e.target.value
        }));
    };

    const handleSave = async () => {
        if (!hasChanges || !isValid) return;

        try {
            setIsLoading(true);
            setError(null);
            await onSave(formData);
            toast({
                title: "Changes submitted",
                description: "Your changes have been submitted for review"
            });
            onOpenChange(false);
        } catch {
            setError("Failed to save changes. Please try again.");
            toast({
                title: "Error",
                description: "Failed to save changes. Please try again.",
                variant: "destructive"
            });
        } finally {
            setIsLoading(false);
        }
    };

    const renderEditView = () => {
        const commonHeaderClasses = "flex items-center space-x-4 mb-6 border-muted border-b pb-4";
        const inputClasses = "min-h-[200px] font-mono text-sm";

        return (
            <AnimatePresence mode="wait">
                <motion.div 
                    initial={{ opacity: 0, y: 20 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    exit={{ opacity: 0, y: -20 }} 
                    transition={{ duration: 0.2 }}
                >
                    {selectedOption ? (
                        <div className="space-y-4">
                            <div className={commonHeaderClasses}>
                                <Button variant="ghost" size="sm" onClick={() => setSelectedOption(null)}>
                                    <ChevronLeft className="h-4 w-4" />
                                </Button>
                                <h3 className="text-lg font-medium">Edit {options.find((opt) => opt.id === selectedOption)?.label}</h3>
                            </div>

                            <div className="space-y-6 px-1">
                                {selectedOption !== "preview" && (
                                    <div className="space-y-2">
                                        {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
                                        <label className="text-sm font-medium">Current Value:</label>
                                        <div className="text-sm text-muted-foreground bg-muted p-2 rounded">
                                            {options.find(opt => opt.id === selectedOption)?.current || 'None'}
                                        </div>
                                    </div>
                                )}

                                <div className="space-y-2">
                                    {selectedOption !== "preview" && (
                                        // eslint-disable-next-line jsx-a11y/label-has-associated-control
                                        <label className="text-sm font-medium">New Value:</label>
                                    )}
                                    {selectedOption === "name" && (
                                        <Input 
                                            value={formData.name} 
                                            onChange={handleChange("name")} 
                                            placeholder="Enter theme name" 
                                            className="text-lg"
                                            required 
                                        />
                                    )}
                                    {selectedOption === "description" && (
                                        <Textarea 
                                            value={formData.description} 
                                            onChange={handleChange("description")} 
                                            placeholder="Describe your theme..." 
                                            className={inputClasses}
                                            required
                                        />
                                    )}
                                    {selectedOption === "version" && (
                                        <Input 
                                            value={formData.version} 
                                            onChange={handleChange("version")} 
                                            placeholder="e.g. 1.0.0" 
                                            required
                                        />
                                    )}
                                    {selectedOption === "content" && (
                                        <Textarea 
                                            value={formData.content} // Remove Buffer.from here
                                            onChange={handleChange("content")} 
                                            placeholder="Paste your CSS here..." 
                                            className={cn(inputClasses, "font-mono")}
                                            required
                                        />
                                    )}
                                    {selectedOption === "preview" && (
                                        <div className="space-y-4">
                                            {/* @ts-ignore */}
                                            <ThemeCard
                                                theme={{
                                                    ...theme,
                                                    name: formData.name,
                                                    description: formData.description,
                                                    version: formData.version,
                                                    content: formData.content,
                                                    last_updated: new Date().toISOString(),
                                                    id: "preview",
                                                    type: "preview",
                                                }}
                                                disableDownloads
                                            />
                                            <Button 
                                                onClick={handleSave} 
                                                disabled={isLoading || !hasChanges || !isValid} 
                                                className="w-full"
                                            >
                                                {isLoading ? (
                                                    <>
                                                        <Loader2Icon className="h-4 w-4 animate-spin mr-2" />
                                                        Submitting...
                                                    </>
                                                ) : (
                                                    "Submit for Review"
                                                )}
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="grid gap-4 sm:grid-cols-2">
                            {options.map((option) => {
                                const Icon = option.icon;
                                const hasFieldChange = option.id === "content" 
                                    ? formData.content.trim() !== Buffer.from(theme?.content || "", "base64").toString().trim()
                                    : typeof formData[option.id as keyof typeof formData] === 'string' && typeof theme?.[option.id as keyof typeof theme] === 'string'
                                        ? (formData[option.id as keyof typeof formData] as string).trim() !== (theme?.[option.id as keyof typeof theme] as string).trim()
                                        : formData[option.id as keyof typeof formData] !== theme?.[option.id as keyof typeof theme];
                                
                                return (
                                    <Button
                                        key={option.id}
                                        variant="outline"
                                        className={cn(
                                            "h-auto p-4 justify-start space-x-4",
                                            !hasFieldChange && "border-primary"
                                        )}
                                        onClick={() => setSelectedOption(option.id)}
                                    >
                                        <Icon className={cn("h-5 w-5", !hasFieldChange && "text-primary")} />
                                        <div className="text-left">
                                            <span>{option.label}</span>
                                            {!hasFieldChange && (
                                                <span className="block text-xs text-primary">Modified</span>
                                            )}
                                        </div>
                                    </Button>
                                );
                            })}
                        </div>
                    )}
                </motion.div>
            </AnimatePresence>
        );
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[825px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold">Edit Theme</DialogTitle>
                </DialogHeader>

                <div className="py-4">
                    {renderEditView()}
                    {error && (
                        <div className="mt-4 p-3 bg-red-50 text-red-600 rounded-md text-sm">
                            {error}
                        </div>
                    )}
                </div>

                {selectedOption && selectedOption !== "preview" && (
                    <div className="flex justify-end pt-4 border-muted border-t">
                        <Button 
                            onClick={() => setSelectedOption("preview")} 
                            disabled={!hasChanges || !isValid}
                            className="space-x-2"
                        >
                            <Eye className="h-4 w-4" />
                            <span>Preview Changes</span>
                        </Button>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}