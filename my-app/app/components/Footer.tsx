export default function Footer() {
    return (
        <footer className="w-full py-8 mt-auto border-t border-white/5 bg-black/20 backdrop-blur-sm">
            <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-6">
                <div className="text-center md:text-left">
                    <h3 className="font-clash font-bold text-lg text-white">CareerForge</h3>
                    <p className="text-sm text-gray-500 mt-1">
                        Empowering engineers specifically for the modern world.
                    </p>
                </div>

                <div className="flex gap-6 text-sm text-gray-400">
                    <a href="#" className="hover:text-secondary transition-colors" target="_blank">Privacy</a>
                    <a href="#" className="hover:text-secondary transition-colors" target="_blank">Terms</a>
                    <a href="https://github.com/Aryan052006/PBL" target="_blank" className="hover:text-secondary transition-colors">GitHub</a>
                </div>

                <div className="text-xs text-gray-600 text-center md:text-right">
                    © {new Date().getFullYear()} CareerForge. Precision Career Mapping.
                </div>
            </div>
        </footer >
    );
}
