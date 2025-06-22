import React, { useEffect, useState } from "react";
import { useWebContext } from "@context/auth";
import { useRouter } from "next/router";
import { getCookie } from "@utils/cookies";
import { AlertTriangle, CheckCircle2, Hourglass, XCircle } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface Submission {
    title: string;
    description: string;
    sourceLink: string;
    validatedUsers: { [key: string]: { id: string; username: string; avatar: string } };
    themeContent: string;
    submittedAt: { $date: string };
    fileUrl?: string;
    file?: string;
    reason?: string;
    state: string;
}

const SubmissionsPage: React.FC = () => {
    const { authorizedUser, isLoading } = useWebContext();
    const [submissions, setSubmissions] = useState<Submission[]>([]);
    const [isAdmin, setIsAdmin] = useState<boolean>(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    useEffect(() => {
      if (isLoading) return;
        const fetchSubmissions = async () => {
            setLoading(true);
            setError(null);
            try {
                const token = getCookie("_dtoken");
                if (!token) {
                    router.push("/");
                    setLoading(false);
                    return;
                }
                setIsAdmin(authorizedUser.admin);
                const submissionsResponse = await fetch("/api/get/submissions", {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                if (!submissionsResponse.ok) {
                    throw new Error("Failed to fetch submissions");
                }
                const data = await submissionsResponse.json();
                setSubmissions(data);
            } catch (err: any) {
                setError(err.message || "Unknown error");
            } finally {
                setLoading(false);
            }
        };
        fetchSubmissions();
    }, [authorizedUser, isLoading]);

    const getStateIcon = (state: string) => {
        switch (state) {
            case "approved":
                return <CheckCircle2 className="text-green-500 mr-1 w-4 h-4" aria-label="Approved" />;
            case "pending":
                return <Hourglass className="text-yellow-500 mr-1 w-4 h-4" aria-label="Pending" />;
            default:
                return <XCircle className="text-red-500 mr-1 w-4 h-4" aria-label="Rejected" />;
        }
    };

    return (
        <div className="min-h-screen py-10 px-2 md:px-8">
            <div className="max-w-5xl mx-auto">
                <h1 className="text-4xl font-extrabold mb-6 text-center drop-shadow-sm">My Theme Submissions</h1>
                {isAdmin && (
                    <div className="flex items-center gap-2 bg-yellow-100 border-l-4 border-yellow-400 text-yellow-800 px-4 py-3 rounded mb-6 shadow">
                        <AlertTriangle className="text-yellow-500 w-5 h-5" />
                        <span className="font-semibold">Admin Warning:</span>
                        <span>
                            This page will display <b>all</b> theme submissions.
                        </span>
                    </div>
                )}
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-16">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-400 mb-4" />
                        <div className="text-lg text-gray-500">Loading your submissions...</div>
                    </div>
                ) : error ? (
                    <div className="flex flex-col items-center py-12">
                        <XCircle className="text-3xl text-red-400 mb-2" />
                        <div className="text-center text-red-500 font-medium">{error}</div>
                    </div>
                ) : submissions.length === 0 ? (
                    <div className="flex flex-col items-center py-12">
                        <div className="text-2xl text-gray-300 mb-2">¯{"\\"}_(ツ)_/¯</div>
                        <div className="text-center text-gray-400">No submissions found.</div>
                    </div>
                ) : (
                    <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                        {submissions.map((submission, idx) => (
                            <div key={idx} className="bg-card rounded-2xl shadow-lg p-0 flex flex-col border border-border hover:shadow-2xl transition-shadow relative group overflow-hidden">
                                {submission.fileUrl && <img src={submission.fileUrl} alt={submission.title} className="w-full h-40 object-cover object-center border-b border-border" />}
                                <div className="p-6 flex flex-col flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="text-lg font-semibold text-foreground truncate">{submission.title}</span>
                                        <span className="ml-auto flex items-center">
                                            {getStateIcon(submission.state)}
                                            <span className={`text-xs font-bold uppercase tracking-wide ml-1 ${submission.state === "approved" ? "text-green-400" : submission.state === "pending" ? "text-yellow-400" : "text-red-400"}`}>{submission.state}</span>
                                        </span>
                                    </div>
                                    <p className="mb-3 text-muted-foreground line-clamp-3">
                                        {" "}
                                        <ReactMarkdown remarkPlugins={[remarkGfm]}>{submission.description}</ReactMarkdown>
                                    </p>
                                    <div className="flex flex-col gap-2 mt-auto">
                                        {submission.reason && (
                                            <div className="flex items-center gap-2 text-sm text-red-400 bg-red-900/20 rounded px-2 py-1">
                                                <AlertTriangle className="text-red-400 w-4 h-4" />
                                                <span className="font-medium">Reason:</span>
                                                <span>{submission.reason}</span>
                                            </div>
                                        )}
                                        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-2">
                                            <span>Submitted:</span>
                                            <span className="font-mono">{new Date(submission.submittedAt as any as string).toLocaleString()}</span>
                                        </div>
                                        {submission.sourceLink && (
                                            <a href={submission.sourceLink} target="_blank" rel="noopener noreferrer" className="inline-block text-indigo-400 hover:underline text-xs font-medium">
                                                Source Link
                                            </a>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default SubmissionsPage;
