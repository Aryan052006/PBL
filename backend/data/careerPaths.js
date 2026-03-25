const careerPaths = [
    // ── Common / CS-oriented domains ──────────────────────────────────────────
    {
        id: "web-dev",
        title: "Full Stack & App Development",
        description: "Build robust web and mobile applications. High demand in startups and MNCs.",
        keywords: ["javascript", "react", "node", "html", "css", "mongodb", "sql", "web", "app dev", "react native", "flutter", "mobile"],
        preferredBranches: ["ce", "it", "ece"],
        roadmap: ["HTML/CSS", "JavaScript", "React", "Node.js", "Database Design"],
        tags: ["MERN Stack", "System Design", "API Development"]
    },
    {
        id: "ai-ml",
        title: "Data Science & AI",
        description: "Analyze complex data to predict trends and build intelligent systems.",
        keywords: ["python", "statistics", "machine learning", "data", "sql", "pandas", "pytorch", "tensorflow"],
        preferredBranches: ["ce", "it", "aids"],
        roadmap: ["Python", "Statistics", "Data Analysis", "Machine Learning", "Deep Learning"],
        tags: ["Python", "TensorFlow", "Big Data"]
    },
    {
        id: "cloud",
        title: "Cloud & DevOps",
        description: "Manage scalable infrastructure and automate deployment pipelines.",
        keywords: ["aws", "azure", "docker", "kubernetes", "linux", "ci/cd", "network"],
        preferredBranches: ["ce", "it", "entc"],
        roadmap: ["Linux", "Networking", "AWS/Azure", "Docker/K8s", "Terraform"],
        tags: ["AWS", "DevOps", "Infrastructure"]
    },
    {
        id: "cyber-security",
        title: "Cyber Security",
        description: "Protect systems and networks from digital attacks.",
        keywords: ["security", "network", "linux", "cryptography", "hacking", "firewall"],
        preferredBranches: ["ce", "it"],
        roadmap: ["Networking", "Linux", "Ethical Hacking", "Network Security", "Cryptography"],
        tags: ["Ethical Hacking", "Network Security"]
    },
    {
        id: "blockchain",
        title: "Blockchain Development",
        description: "Build decentralized applications and smart contracts.",
        keywords: ["blockchain", "solidity", "crypto", "smart contracts", "ethereum", "web3"],
        preferredBranches: ["ce", "it"],
        roadmap: ["Cryptography", "Blockchain Basics", "Solidity", "Web3.js", "DApps"],
        tags: ["Web3", "Smart Contracts"]
    },

    // ── ENTC / E & CE specific domains ───────────────────────────────────────
    {
        id: "embedded-iot",
        title: "Embedded Systems & IoT",
        description: "Design software for hardware devices, smart systems, and robots.",
        keywords: ["c", "c++", "arduino", "raspberry pi", "electronics", "microcontroller", "iot", "robotics", "rtos"],
        preferredBranches: ["entc", "ece", "ce"],
        roadmap: ["C/C++", "Microcontrollers", "RTOS", "IoT Protocols", "PCB Design"],
        tags: ["IoT", "Robotics", "Firmware"]
    },
    {
        id: "vlsi",
        title: "VLSI & Chip Design",
        description: "Design integrated circuits and semiconductor chips using HDLs. Core to the semiconductor industry.",
        keywords: ["vlsi", "verilog", "vhdl", "fpga", "semiconductor", "cadence", "synopsys", "digital design", "analog"],
        preferredBranches: ["entc", "ece"],
        roadmap: ["Digital Electronics", "Verilog/VHDL", "FPGA Prototyping", "ASIC Flow", "Cadence/Synopsys Tools"],
        tags: ["VLSI", "FPGA", "Semiconductor"]
    },
    {
        id: "signal-dsp",
        title: "Signal Processing & DSP",
        description: "Process and analyze audio, video, and sensor signals for communication and multimedia systems.",
        keywords: ["dsp", "matlab", "signal processing", "fourier", "filter design", "audio", "image processing", "communications"],
        preferredBranches: ["entc", "ece"],
        roadmap: ["Signals & Systems", "MATLAB", "DSP Algorithms", "Filter Design", "OFDM/Communication Systems"],
        tags: ["MATLAB", "DSP", "Audio Processing"]
    },
    {
        id: "telecom-5g",
        title: "Telecommunications & 5G",
        description: "Build and optimize wireless communication systems, networks, and 5G infrastructure.",
        keywords: ["5g", "lte", "networking", "rf", "antenna", "wireless", "telecom", "protocol"],
        preferredBranches: ["entc", "ece"],
        roadmap: ["RF Fundamentals", "LTE/5G NR", "Network Planning", "Protocol Stacks", "SDN/NFV"],
        tags: ["5G", "Wireless", "RF Engineering"]
    },
    {
        id: "robotics",
        title: "Robotics & Automation",
        description: "Design autonomous systems, industrial robots, and control systems.",
        keywords: ["robotics", "ros", "control systems", "automation", "plc", "pid", "actuator", "sensors"],
        preferredBranches: ["entc", "ece", "ce"],
        roadmap: ["Control Systems", "ROS", "Kinematics", "Sensor Fusion", "Path Planning"],
        tags: ["ROS", "Control Systems", "Automation"]
    },

    // ── AIDS specific domains ─────────────────────────────────────────────────
    {
        id: "computer-vision",
        title: "Computer Vision & Image Processing",
        description: "Teach machines to see — from object detection to autonomous vehicles.",
        keywords: ["opencv", "yolo", "image processing", "computer vision", "cnn", "deep learning", "pytorch", "tensorflow"],
        preferredBranches: ["aids", "ce"],
        roadmap: ["Python", "OpenCV", "CNN Architectures", "Object Detection (YOLO)", "Model Deployment"],
        tags: ["OpenCV", "YOLO", "Deep Learning"]
    },
    {
        id: "nlp",
        title: "Natural Language Processing",
        description: "Build systems that understand, generate, and reason about human language.",
        keywords: ["nlp", "transformers", "bert", "llm", "huggingface", "langchain", "spacy", "text", "language model"],
        preferredBranches: ["aids", "ce"],
        roadmap: ["Python", "Text Preprocessing", "Transformers/BERT", "Fine-tuning LLMs", "RAG / Agents"],
        tags: ["Transformers", "LLMs", "HuggingFace"]
    },
    {
        id: "data-engineering",
        title: "Data Engineering & Analytics",
        description: "Build data pipelines, warehouses, and real-time analytics platforms.",
        keywords: ["sql", "spark", "airflow", "kafka", "data pipeline", "etl", "hadoop", "data warehouse", "dbt"],
        preferredBranches: ["aids", "it", "ce"],
        roadmap: ["SQL Mastery", "Python + Pandas", "Apache Spark", "Airflow Pipelines", "Cloud Data Lakes"],
        tags: ["Spark", "Airflow", "ETL"]
    }
];

module.exports = careerPaths;
