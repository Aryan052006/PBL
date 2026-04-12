"""
Feature builder: converts raw student profile dict → normalized numeric feature vector
Matches the 10-feature vector defined in the research paper (Feature Set 1).
"""

import json
import os
import numpy as np

# All skills recognized by the system (used to compute technical_skills_score)
SKILL_UNIVERSE = [
    "html", "css", "javascript", "typescript", "react", "next.js", "node.js", "express",
    "mongodb", "postgresql", "mysql", "python", "java", "c++", "c#", "flutter",
    "react native", "docker", "aws", "azure", "gcp", "kubernetes", "linux", "terraform",
    "git", "jenkins", "ci/cd", "bash", "ansible", "microservices",
    "machine learning", "deep learning", "tensorflow", "pytorch", "scikit-learn",
    "pandas", "numpy", "matplotlib", "sql", "r", "statistics", "data visualization",
    "jupyter", "spark", "big data", "hadoop", "kafka", "airflow", "etl", "dbt",
    "opencv", "yolo", "cnn", "image processing", "computer vision",
    "nlp", "transformers", "bert", "llm", "huggingface", "langchain", "spacy",
    "security", "network", "cryptography", "ethical hacking", "firewall", "linux",
    "blockchain", "solidity", "web3", "smart contracts", "ethereum",
    "c", "arduino", "raspberry pi", "microcontroller", "iot", "rtos", "electronics",
    "verilog", "vhdl", "fpga", "vlsi", "semiconductor", "cadence",
    "matlab", "dsp", "signal processing", "fourier", "filter design",
    "5g", "lte", "rf", "antenna", "wireless", "telecom",
    "ros", "control systems", "automation", "plc", "pid", "robotics",
]

# Domain keywords for computing domain_interest_score
DOMAIN_KEYWORDS = {
    0:  ["javascript", "react", "node", "html", "css", "mongodb", "web", "mobile", "flutter", "app"],
    1:  ["python", "machine learning", "data", "sql", "tensorflow", "pytorch", "statistics", "ai"],
    2:  ["aws", "azure", "docker", "kubernetes", "linux", "ci/cd", "cloud", "devops", "terraform"],
    3:  ["security", "network", "linux", "cryptography", "hacking", "firewall", "cyber"],
    4:  ["blockchain", "solidity", "crypto", "smart contracts", "ethereum", "web3"],
    5:  ["c", "c++", "arduino", "raspberry pi", "microcontroller", "iot", "electronics", "rtos"],
    6:  ["vlsi", "verilog", "vhdl", "fpga", "semiconductor", "cadence", "digital design"],
    7:  ["dsp", "matlab", "signal processing", "fourier", "filter", "audio", "image processing"],
    8:  ["5g", "lte", "rf", "antenna", "wireless", "telecom", "networking"],
    9:  ["robotics", "ros", "control systems", "automation", "plc", "pid"],
    10: ["opencv", "yolo", "cnn", "image processing", "computer vision", "deep learning"],
    11: ["nlp", "transformers", "bert", "llm", "huggingface", "langchain", "text", "language"],
    12: ["sql", "spark", "airflow", "kafka", "data pipeline", "etl", "hadoop", "dbt"],
}


def build_feature_vector(profile: dict) -> list:
    """
    Convert a student profile dict into a 10-dim feature vector.
    """
    skills_raw = [s.lower().strip() for s in (profile.get("skills") or [])]
    
    # Feature 1: CGPA (0-10)
    cgpa = float(profile.get("cgpa") or 0)
    cgpa = min(max(cgpa, 0), 10)

    # Feature 2: Technical Skills Score (0-100)
    # We now weigh it based on "density" rather than just discovery count
    if len(SKILL_UNIVERSE) > 0:
        matched = sum(1 for su in SKILL_UNIVERSE if any(su in sk or sk in su for sk in skills_raw))
        # More aggressive scaling: if they match 10 solid skills, they should be at 70%+
        tech_skill_score = min(100.0, (matched / 15) * 100) 
        # Cap at 15 skills for full score to reward specialization
    else:
        tech_skill_score = 0.0

    # Feature 3: Projects Count (0+)
    projects_count = int(profile.get("projects_count") or 0)

    # Feature 4: Internship Experience (months, 0+)
    internship_experience = int(profile.get("internship_experience") or 0)

    # Feature 5: Certifications Count (0+)
    certifications = int(profile.get("certifications") or 0)

    # Feature 6: Coding Platform Rating (0-2500)
    coding_rating = int(profile.get("coding_platform_rating") or 0)
    coding_rating = min(max(coding_rating, 0), 2500)

    # Feature 7: Communication Score (1-10)
    comm_score = int(profile.get("communication_score") or 5)
    comm_score = min(max(comm_score, 1), 10)

    # Feature 8: Aptitude Score (0-100)
    aptitude_score = float(profile.get("aptitude_score") or 50)
    aptitude_score = min(max(aptitude_score, 0), 100)

    # Feature 9: Domain Interest Score (0-100)
    interests_raw = profile.get("domain_interest") or profile.get("interests") or []
    if isinstance(interests_raw, str):
        interests_raw = [interests_raw]
    interests_raw = [i.lower().strip() for i in interests_raw]
    combined_tokens = skills_raw + interests_raw

    best_domain_overlap = 0
    for domain_id, kws in DOMAIN_KEYWORDS.items():
        overlap = sum(1 for kw in kws if any(kw in tok or tok in kw for tok in combined_tokens))
        score = (overlap / len(kws)) * 100
        if score > best_domain_overlap:
            best_domain_overlap = score
    domain_interest_score = min(100.0, best_domain_overlap * 1.5) # Boost interest signals

    # Feature 10: Hackathon Count (0+)
    hackathon_count = int(profile.get("hackathon_count") or 0)

    return [
        cgpa,
        tech_skill_score,
        float(projects_count),
        float(internship_experience),
        float(certifications),
        float(coding_rating),
        float(comm_score),
        aptitude_score,
        domain_interest_score,
        float(hackathon_count),
    ]


FEATURE_NAMES = [
    "cgpa",
    "technical_skills_score",
    "projects_count",
    "internship_experience",
    "certifications",
    "coding_platform_rating",
    "communication_score",
    "aptitude_score",
    "domain_interest_score",
    "hackathon_count",
]
