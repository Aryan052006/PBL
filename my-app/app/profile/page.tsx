"use client";

import { useAuth } from "../context/AuthContext";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
    User, BookOpen, Calendar, Mail, Award, CheckCircle2,
    ArrowRight, Sparkles, Rocket, Edit2, X, Save, Loader2,
    BarChart3, Trophy, Star, Cpu, TrendingUp
} from "lucide-react";

const TECH_STACKS = [
    "HTML","CSS","JavaScript","TypeScript","React","Next.js","Node.js","Express",
    "MongoDB","PostgreSQL","Python","Java","C++","C","C#","Flutter","React Native",
    "Docker","AWS","Azure","TensorFlow","PyTorch","Arduino","Verilog","MATLAB",
    "Solidity","ROS","OpenCV",
];
const INTERESTS = [
    "Web Dev","AI/ML","Data Science","Cloud/DevOps","Cybersecurity",
    "Embedded/IoT","VLSI","Robotics","Blockchain","NLP","Computer Vision",
    "Data Engineering","Signal Processing","Telecom/5G",
];
const BRANCHES = ["CE","IT","ENTC","E & CE","AIDS"];
const YEARS = ["1st Year","2nd Year","3rd Year","4th Year"];

const SkillTag = ({ skill, known }: { skill: string; known?: boolean }) => (
    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-medium transition-all hover:scale-105 ${
        known ? "bg-green-500/10 border-green-500/20 text-green-400" : "bg-white/5 border-white/10 text-gray-400"
    }`}>
        <div className={`w-1.5 h-1.5 rounded-full ${known ? "bg-green-500" : "bg-gray-500"}`} />
        {skill}
    </div>
);

const StatCard = ({ label, value, icon: Icon, color }: any) => (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center gap-4">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
            <Icon className="w-5 h-5 text-white" />
        </div>
        <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide">{label}</p>
            <p className="text-xl font-bold text-white">{value ?? "—"}</p>
        </div>
    </div>
);

export default function ProfilePage() {
    const { user, isAuthenticated, isLoading, updateUser } = useAuth();
    const router = useRouter();
    const [editOpen, setEditOpen] = useState(false);
    const [saving, setSaving] = useState(false);
    const [editError, setEditError] = useState("");

    const [editData, setEditData] = useState<any>({});

    useEffect(() => {
        if (!isLoading && !isAuthenticated) router.push("/sign-in");
    }, [isLoading, isAuthenticated, router]);

    useEffect(() => {
        if (user) {
            setEditData({
                branch: user.branch || "",
                year: user.year || "",
                skills: user.skills || [],
                interests: user.interests || [],
                cgpa: user.cgpa ?? "",
                projects_count: user.projects_count ?? "",
                internship_experience: user.internship_experience ?? "",
                certifications: user.certifications ?? "",
                hackathon_count: user.hackathon_count ?? "",
                coding_platform_rating: user.coding_platform_rating ?? "",
                communication_score: user.communication_score ?? 5,
                aptitude_score: user.aptitude_score ?? "",
            });
        }
    }, [user]);

    if (isLoading || !user) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    const knownSkills = user.skills && user.skills.length > 0 ? user.skills : [];
    const roadmapItems = user.roadmap && user.roadmap.length > 0 ? user.roadmap : [
        { domainTitle: "Get Started", skillsToLearn: ["Complete your profile"], skillsHave: [], recommended: true }
    ];

    const calculateAge = (birthdate: string) => {
        const d = new Date(birthdate), t = new Date();
        let age = t.getFullYear() - d.getFullYear();
        if (t.getMonth() - d.getMonth() < 0 || (t.getMonth() - d.getMonth() === 0 && t.getDate() < d.getDate())) age--;
        return age;
    };
    const age = user.birthdate ? calculateAge(user.birthdate) : null;

    const toggleArr = (key: "skills" | "interests", val: string) =>
        setEditData((prev: any) => ({
            ...prev,
            [key]: prev[key].includes(val) ? prev[key].filter((s: string) => s !== val) : [...prev[key], val]
        }));

    const handleSave = async () => {
        setSaving(true);
        setEditError("");
        try {
            const res = await fetch("http://127.0.0.1:5000/api/auth/profile/update", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId: user?.id, ...editData }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.msg || "Update failed");
            updateUser(data.user);
            setEditOpen(false);
        } catch (err: any) {
            setEditError(err.message || "Could not save changes.");
        } finally {
            setSaving(false);
        }
    };

    return (
        <main className="min-h-screen px-4 py-8 max-w-7xl mx-auto space-y-8">

            {/* ── Header Card ─────────────────────────────────────────── */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                className="glass-panel p-8 rounded-3xl flex flex-col md:flex-row gap-8 items-center md:items-start">
                <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-primary to-secondary p-1 shrink-0">
                    <div className="w-full h-full rounded-full bg-black flex items-center justify-center">
                        <span className="text-3xl font-bold text-white">{user.name.charAt(0)}</span>
                    </div>
                </div>
                <div className="flex-1 text-center md:text-left space-y-2">
                    <h1 className="text-3xl font-clash font-bold text-white">{user.name}</h1>
                    <div className="flex flex-wrap gap-4 justify-center md:justify-start text-gray-400 text-sm">
                        <div className="flex items-center gap-1.5"><Mail className="w-4 h-4" /> {user.email}</div>
                        <div className="flex items-center gap-1.5"><BookOpen className="w-4 h-4" /> {user.branch}</div>
                        <div className="flex items-center gap-1.5"><Calendar className="w-4 h-4" /> {user.year}</div>
                        {age !== null && <div className="flex items-center gap-1.5"><User className="w-4 h-4" /> {age} years old</div>}
                    </div>
                </div>
                <button onClick={() => setEditOpen(true)}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl border border-white/10 hover:bg-white/5 transition-colors text-sm font-medium text-white shrink-0">
                    <Edit2 className="w-4 h-4" /> Edit Profile
                </button>
            </motion.div>

            {/* ── KNN Feature Stats Grid ───────────────────────────────── */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
                <h2 className="text-sm text-gray-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <Cpu className="w-4 h-4" /> ML Model Input Features
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <StatCard label="CGPA" value={user.cgpa ? `${user.cgpa}/10` : "—"} icon={Star} color="bg-yellow-500/20" />
                    <StatCard label="Projects" value={user.projects_count ?? "—"} icon={Trophy} color="bg-blue-500/20" />
                    <StatCard label="Internship" value={user.internship_experience ? `${user.internship_experience}mo` : "—"} icon={TrendingUp} color="bg-green-500/20" />
                    <StatCard label="Certifications" value={user.certifications ?? "—"} icon={Award} color="bg-purple-500/20" />
                    <StatCard label="Hackathons" value={user.hackathon_count ?? "—"} icon={Rocket} color="bg-orange-500/20" />
                    <StatCard label="Coding Rating" value={user.coding_platform_rating ?? "—"} icon={BarChart3} color="bg-cyan-500/20" />
                    <StatCard label="Comm. Score" value={user.communication_score ? `${user.communication_score}/10` : "—"} icon={Sparkles} color="bg-pink-500/20" />
                    <StatCard label="Aptitude" value={user.aptitude_score ? `${user.aptitude_score}%` : "—"} icon={BarChart3} color="bg-indigo-500/20" />
                </div>
            </motion.div>

            {/* ── Skills + Roadmap ─────────────────────────────────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}
                    className="glass-panel p-8 rounded-3xl space-y-6">
                    <h2 className="text-xl font-clash font-semibold text-white flex items-center gap-2">
                        <Award className="text-green-500 w-5 h-5" /> Skills You Know
                    </h2>
                    <div className="flex flex-wrap gap-2">
                        {knownSkills.length > 0
                            ? knownSkills.map(skill => <SkillTag key={skill} skill={skill} known />)
                            : <p className="text-gray-500 text-sm">No skills added yet. Edit your profile to add them.</p>
                        }
                    </div>
                </motion.div>

                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}
                    className="glass-panel p-8 rounded-3xl space-y-6">
                    <h2 className="text-xl font-clash font-semibold text-white flex items-center gap-2">
                        <ArrowRight className="text-primary w-5 h-5" /> Recommended Learning Path
                    </h2>
                    <div className="space-y-4">
                        {roadmapItems.map((path: any, i: number) => (
                            <div key={i} className="p-4 rounded-xl bg-white/5 border border-white/10">
                                <h3 className="font-medium text-secondary mb-3 flex items-center gap-2">
                                    {path.recommended && <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full">Top Pick</span>}
                                    {path.domainTitle}
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                    {path.skillsToLearn?.map((skill: string) => <SkillTag key={skill} skill={skill} />)}
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>
            </div>

            {/* ── AI Career Insights ───────────────────────────────────── */}
            {user.skillAnalysis && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                    className="glass-panel p-8 rounded-3xl space-y-6 border-primary/20 bg-gradient-to-br from-primary/5 to-secondary/5">
                    <div className="flex flex-col md:flex-row gap-8">
                        <div className="flex-1 space-y-4">
                            <h2 className="text-xl font-clash font-semibold text-white flex items-center gap-2">
                                <Sparkles className="text-primary w-5 h-5" /> AI Skill Assessment
                            </h2>
                            <p className="text-gray-400 leading-relaxed italic">"{user.skillAnalysis}"</p>
                        </div>
                        <div className="flex-1 space-y-4">
                            <h2 className="text-xl font-clash font-semibold text-white flex items-center gap-2">
                                <Rocket className="text-secondary w-5 h-5" /> What to Focus On Next
                            </h2>
                            <ul className="space-y-3">
                                {user.futureDevelopment?.map((item: string, i: number) => (
                                    <li key={i} className="flex items-start gap-3 text-sm text-gray-400">
                                        <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-secondary shrink-0" />
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </motion.div>
            )}

            {/* ── Edit Profile Modal ───────────────────────────────────── */}
            <AnimatePresence>
                {editOpen && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
                        onClick={e => e.target === e.currentTarget && setEditOpen(false)}>
                        <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-[#0d0d1a] border border-white/10 rounded-3xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto custom-scrollbar">

                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-2xl font-clash font-bold text-white flex items-center gap-2">
                                    <Edit2 className="text-primary w-5 h-5" /> Edit Profile
                                </h2>
                                <button onClick={() => setEditOpen(false)} className="p-2 rounded-xl hover:bg-white/5 text-gray-400 hover:text-white transition-colors">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="space-y-6">
                                {/* Branch & Year */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm text-gray-400 mb-2 block">Branch</label>
                                        <select value={editData.branch}
                                            onChange={e => setEditData((p: any) => ({ ...p, branch: e.target.value }))}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-4 text-white focus:outline-none focus:border-primary/50">
                                            {BRANCHES.map(b => <option key={b} value={b.toLowerCase().replace(" & ","").replace(" ","")} className="bg-[#0d0d1a]">{b}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-sm text-gray-400 mb-2 block">Year</label>
                                        <select value={editData.year}
                                            onChange={e => setEditData((p: any) => ({ ...p, year: e.target.value }))}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-4 text-white focus:outline-none focus:border-primary/50">
                                            {YEARS.map(y => <option key={y} value={y} className="bg-[#0d0d1a]">{y}</option>)}
                                        </select>
                                    </div>
                                </div>

                                {/* Skills */}
                                <div>
                                    <label className="text-sm text-gray-400 mb-2 block">Technologies</label>
                                    <div className="grid grid-cols-3 gap-2 max-h-40 overflow-y-auto pr-1 custom-scrollbar">
                                        {TECH_STACKS.map(skill => (
                                            <button key={skill} onClick={() => toggleArr("skills", skill)}
                                                className={`flex items-center gap-1.5 p-2 rounded-lg border text-xs transition-all ${
                                                    editData.skills?.includes(skill)
                                                        ? "bg-primary/20 border-primary text-white"
                                                        : "bg-white/5 border-white/10 text-gray-400 hover:bg-white/10"
                                                }`}>
                                                <CheckCircle2 className={`w-3 h-3 shrink-0 ${editData.skills?.includes(skill) ? "opacity-100" : "opacity-0"}`} />
                                                {skill}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Interests */}
                                <div>
                                    <label className="text-sm text-gray-400 mb-2 block">Career Interests</label>
                                    <div className="flex flex-wrap gap-2">
                                        {INTERESTS.map(interest => (
                                            <button key={interest} onClick={() => toggleArr("interests", interest)}
                                                className={`px-3 py-1 rounded-full border text-xs transition-all ${
                                                    editData.interests?.includes(interest)
                                                        ? "bg-secondary/20 border-secondary text-white"
                                                        : "bg-white/5 border-white/10 text-gray-400 hover:bg-white/10"
                                                }`}>{interest}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Numeric fields */}
                                <div className="grid grid-cols-2 gap-4">
                                    {[
                                        { label: "CGPA", key: "cgpa", placeholder: "8.5" },
                                        { label: "Projects", key: "projects_count", placeholder: "4" },
                                        { label: "Internship (months)", key: "internship_experience", placeholder: "3" },
                                        { label: "Certifications", key: "certifications", placeholder: "2" },
                                        { label: "Hackathons", key: "hackathon_count", placeholder: "1" },
                                        { label: "Coding Rating", key: "coding_platform_rating", placeholder: "1200" },
                                        { label: "Aptitude Score (%)", key: "aptitude_score", placeholder: "75" },
                                    ].map(({ label, key, placeholder }) => (
                                        <div key={key}>
                                            <label className="text-sm text-gray-400 mb-1 block">{label}</label>
                                            <input type="number" value={editData[key] ?? ""} placeholder={placeholder}
                                                onChange={e => setEditData((p: any) => ({ ...p, [key]: e.target.value }))}
                                                className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-3 text-white text-sm focus:outline-none focus:border-primary/50 placeholder-gray-600" />
                                        </div>
                                    ))}
                                </div>

                                {/* Communication slider */}
                                <div>
                                    <label className="text-sm text-gray-400 mb-2 block">
                                        Communication Score — <span className="text-white font-medium">{editData.communication_score}/10</span>
                                    </label>
                                    <input type="range" min="1" max="10" step="1" value={editData.communication_score}
                                        onChange={e => setEditData((p: any) => ({ ...p, communication_score: parseInt(e.target.value) }))}
                                        className="w-full accent-primary cursor-pointer" />
                                </div>
                            </div>

                            {editError && <p className="mt-4 text-red-400 text-sm">{editError}</p>}

                            <div className="flex gap-3 mt-8">
                                <button onClick={() => setEditOpen(false)}
                                    className="px-6 py-3 rounded-xl border border-white/10 text-gray-400 hover:text-white hover:bg-white/5 transition-colors text-sm">
                                    Cancel
                                </button>
                                <button onClick={handleSave} disabled={saving}
                                    className="flex-1 py-3 bg-primary rounded-xl font-bold text-white flex items-center justify-center gap-2 disabled:opacity-60 transition-all hover:shadow-[0_0_20px_rgba(255,46,99,0.3)]">
                                    {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving & Re-analyzing...</> : <><Save className="w-4 h-4" /> Save Changes</>}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

        </main>
    );
}
