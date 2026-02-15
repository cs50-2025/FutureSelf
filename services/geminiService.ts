import { UserHabits, SimulationMetrics, WorkoutPlan, Drill, StudyCurriculum, StudyLesson } from "../types";

// --- CONFIGURATION ---
const API_URL = 'https://openrouter.ai/api/v1/chat/completions';
const API_KEY = process.env.API_KEY;
// Using a reliable high-intelligence model available on OpenRouter
const MODEL_ID = 'openai/gpt-4o'; 

const FALLBACK_IMAGE = `data:image/svg+xml;base64,${btoa('<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600"><rect width="800" height="600" fill="#0f172a"/><path d="M400 250 L420 290 L460 290 L430 320 L440 360 L400 330 L360 360 L370 320 L340 290 L380 290 Z" fill="none" stroke="#334155" stroke-width="2"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#334155" font-family="sans-serif" font-size="24" font-weight="bold" dy="40">Visual Unavailable</text><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#475569" font-family="sans-serif" font-size="14" dy="65">Offline Mode</text></svg>')}`;

// --- HELPERS ---

const getRandomScore = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
const getRandomItem = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)];

async function callOpenRouter(messages: any[], jsonMode = false) {
  if (!API_KEY) throw new Error("API_KEY is missing");

  const headers: any = {
    'Authorization': `Bearer ${API_KEY}`,
    'Content-Type': 'application/json',
    'HTTP-Referer': typeof window !== 'undefined' ? window.location.origin : 'https://futureself.app',
    'X-Title': 'FutureSelf App',
  };

  const body: any = {
    model: MODEL_ID,
    messages: messages,
    temperature: 0.7,
  };

  if (jsonMode) {
    body.response_format = { type: 'json_object' };
  }

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      if (response.status === 429) {
        throw new Error("429 Rate Limit Exceeded");
      }
      throw new Error(`OpenRouter API Error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content || "";
  } catch (error: any) {
    console.warn("AI Service Error:", error.message);
    throw error; // Propagate to let specific functions handle fallbacks
  }
}

// --- TYPES ---

export interface DrillResponse {
  sport: string;
  selected_drills: {
    name: string;
    instruction: string;
    duration: string;
  }[];
  purpose: string;
}

export interface YogaResponse {
  focus: string;
  selected_poses: {
    name: string;
    instruction: string;
    duration: string;
  }[];
  purpose: string;
}

export interface PerformanceAnalysis {
  drill_name: string;
  score: number;
  areas_to_improve: string[];
  exp_earned: number;
  coach_message: string;
}

// --- CORE FUNCTIONS ---

export const generateDrillPlan = async (sport: string): Promise<DrillResponse | null> => {
  try {
    const systemPrompt = `You are an expert AI fitness coach. Create a ${sport} drill plan. Return JSON only.`;
    const userPrompt = `
      Create a home workout for ${sport} with NO equipment.
      Respond with this JSON structure:
      {
        "sport": "${sport}",
        "selected_drills": [
          { "name": "Drill Name", "instruction": "Concise how-to (max 15 words)", "duration": "30s" },
          { "name": "Drill Name", "instruction": "Concise how-to", "duration": "30s" },
          { "name": "Drill Name", "instruction": "Concise how-to", "duration": "30s" },
          { "name": "Drill Name", "instruction": "Concise how-to", "duration": "30s" }
        ],
        "purpose": "Brief session goal"
      }
    `;

    const content = await callOpenRouter([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ], true);

    return JSON.parse(content);
  } catch (error) {
    return {
      sport: sport,
      selected_drills: [
        { name: "General Warm-up", instruction: "High knees and light jogging", duration: "45s" },
        { name: "Core Activation", instruction: "Plank hold for stability", duration: "45s" },
        { name: "Shadow Mechanics", instruction: "Practice sport movements", duration: "60s" },
        { name: "Cooldown", instruction: "Static stretching", duration: "60s" }
      ],
      purpose: "Conditioning (Offline Mode)"
    };
  }
};

export const generateYogaPlan = async (focus: string): Promise<YogaResponse | null> => {
  try {
    const systemPrompt = `You are a Yoga instructor. Create a plan for ${focus}. Return JSON only.`;
    const userPrompt = `
      Respond with this JSON structure:
      {
        "focus": "${focus}",
        "selected_poses": [
          { "name": "Pose Name", "instruction": "How-to (max 15 words)", "duration": "45s" },
          { "name": "Pose Name", "instruction": "How-to", "duration": "45s" },
          { "name": "Pose Name", "instruction": "How-to", "duration": "45s" },
          { "name": "Pose Name", "instruction": "How-to", "duration": "45s" }
        ],
        "purpose": "Session intention"
      }
    `;

    const content = await callOpenRouter([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ], true);

    return JSON.parse(content);
  } catch (error) {
    return {
      focus: focus,
      selected_poses: [
        { name: "Mountain Pose", instruction: "Stand tall, breathe deeply", duration: "45s" },
        { name: "Forward Fold", instruction: "Hinge at hips, relax neck", duration: "45s" },
        { name: "Child's Pose", instruction: "Rest forehead on mat", duration: "45s" },
        { name: "Deep Breathing", instruction: "Inhale 4s, Exhale 4s", duration: "60s" }
      ],
      purpose: "Balance (Offline Mode)"
    };
  }
};

export const analyzeDrillPerformance = async (sport: string, drillName: string, repCount: number): Promise<PerformanceAnalysis> => {
  try {
    const scenarios = ["Perfect form", "Slight imbalance", "Good tempo", "Excellent stability"];
    const randomScenario = scenarios[Math.floor(Math.random() * scenarios.length)];
    
    const systemPrompt = `You are a sports performance analyzer. Analyze a simulated user clip of ${drillName} (${sport}). Scenario: ${randomScenario}. Return JSON.`;
    const userPrompt = `
      Return JSON:
      { 
        "drill_name": "${drillName}", 
        "score": number (0-100), 
        "areas_to_improve": ["string", "string"], 
        "exp_earned": number, 
        "coach_message": "Energetic feedback under 20 words" 
      }
    `;

    const content = await callOpenRouter([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ], true);

    return JSON.parse(content);
  } catch (error) {
    const score = getRandomScore(70, 95);
    return {
      drill_name: drillName,
      score: score,
      areas_to_improve: ["Balance", "Core"],
      exp_earned: score * 2,
      coach_message: "Great effort! Keep your form tight and breathe."
    };
  }
};

export const analyzeYogaPerformance = async (focus: string, poseName: string): Promise<PerformanceAnalysis> => {
  try {
    const scenarios = ["Calm breath", "Tense shoulders", "Good alignment", "Shaky balance"];
    const randomScenario = scenarios[Math.floor(Math.random() * scenarios.length)];

    const systemPrompt = `You are a Yoga instructor. Analyze a simulated clip of ${poseName}. Scenario: ${randomScenario}. Return JSON.`;
    const userPrompt = `
      Return JSON:
      { 
        "drill_name": "${poseName}", 
        "score": number (0-100), 
        "areas_to_improve": ["string", "string"], 
        "exp_earned": number, 
        "coach_message": "Calm feedback under 20 words" 
      }
    `;

    const content = await callOpenRouter([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ], true);

    return JSON.parse(content);
  } catch (error) {
    const score = getRandomScore(75, 98);
    return {
      drill_name: poseName,
      score: score,
      areas_to_improve: ["Breath", "Relaxation"],
      exp_earned: score * 2,
      coach_message: "Beautiful stillness. Focus on deep exhales."
    };
  }
};

// --- IMAGE GENERATION (Via SVG from LLM) ---

export const generateDrillImage = async (drillName: string, sport: string): Promise<string | null> => {
  try {
    const systemPrompt = "You are an expert SVG artist. Return ONLY raw SVG code. No markdown.";
    const userPrompt = `Create a simple, minimalist white-line-on-black SVG illustration of a person doing the ${drillName} exercise for ${sport}. 
    Use neon blue accents (#00f3ff). ViewBox 0 0 300 300. Keep it simple.`;
    
    let content = await callOpenRouter([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ]);
    
    // Clean up markdown code blocks if present
    content = content.replace(/```svg/g, '').replace(/```xml/g, '').replace(/```/g, '').trim();
    
    if (content.startsWith('<svg')) {
      return `data:image/svg+xml;base64,${btoa(content)}`;
    }
    return FALLBACK_IMAGE;
  } catch (error) {
    return FALLBACK_IMAGE;
  }
};

export const generatePoseImage = async (poseName: string): Promise<string | null> => {
  try {
    const systemPrompt = "You are an expert SVG artist. Return ONLY raw SVG code. No markdown.";
    const userPrompt = `Create a simple, minimalist white-line-on-black SVG illustration of the yoga pose: ${poseName}. 
    Use neon pink accents (#ff00ff). ViewBox 0 0 300 300. Zen style.`;
    
    let content = await callOpenRouter([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ]);

    content = content.replace(/```svg/g, '').replace(/```xml/g, '').replace(/```/g, '').trim();

    if (content.startsWith('<svg')) {
      return `data:image/svg+xml;base64,${btoa(content)}`;
    }
    return FALLBACK_IMAGE;
  } catch (error) {
    return FALLBACK_IMAGE;
  }
};

// --- GENERAL SERVICES ---

export const generateFutureMessage = async (habits: UserHabits, metrics: SimulationMetrics): Promise<string> => {
  try {
    const prompt = `Act as the user's Future Self (Year 2029). Current habits: Sleep ${habits.sleepHours}h, Study ${habits.studyHours}h/wk. Write a message to your past self (max 50 words).`;
    return await callOpenRouter([{ role: 'user', content: prompt }]);
  } catch (error) {
    return "I am currently unreachable due to high traffic. Keep building good habits!";
  }
};

export const generateWorkoutPlan = async (sport: string): Promise<WorkoutPlan | null> => {
  const data = await generateDrillPlan(sport);
  if (!data) return null;
  return {
    sport: data.sport,
    drills: data.selected_drills.map(d => ({ name: d.name, reps: 10, instruction: d.instruction }))
  };
};

export const chatWithCoach = async (sport: string, drills: Drill[], userMessage: string, chatHistory: string[]): Promise<string> => {
  try {
    return await callOpenRouter([
      { role: 'system', content: `You are a ${sport} coach.` },
      { role: 'user', content: userMessage }
    ]);
  } catch (error) {
    return "Let's focus on the drill for now!";
  }
};

export const runGeneralChat = async (message: string, history: any[]): Promise<string> => {
  try {
    // Convert history format if needed (OpenRouter expects {role, content})
    const formattedHistory = history.map(h => ({
      role: h.role === 'model' ? 'assistant' : h.role, // Gemini uses 'model', OpenRouter uses 'assistant'
      content: h.parts ? h.parts[0].text : h.text || ""
    }));
    
    formattedHistory.push({ role: 'user', content: message });
    
    // Add system prompt to start
    const messages = [
      { role: 'system', content: "You are 'FutureSelf AI', a helpful behavioral coach." },
      ...formattedHistory
    ];

    return await callOpenRouter(messages);
  } catch (error) {
    return "I'm currently offline due to high traffic. Please try again later.";
  }
};

export const generateStudyCurriculum = async (role: string, detail: string): Promise<StudyCurriculum | null> => {
  try {
    const systemPrompt = "You are an academic planner. Return JSON only.";
    const userPrompt = `
      Create a curriculum for a ${role} focusing on ${detail}.
      Return JSON: { 
        "title": "Course Title", 
        "description": "Brief overview", 
        "units": [
          { "id":"1", "title":"Unit Title", "description":"Desc", "estimatedTime":"1h" },
          { "id":"2", "title":"Unit Title", "description":"Desc", "estimatedTime":"1h" },
          { "id":"3", "title":"Unit Title", "description":"Desc", "estimatedTime":"1h" },
          { "id":"4", "title":"Unit Title", "description":"Desc", "estimatedTime":"1h" },
          { "id":"5", "title":"Unit Title", "description":"Desc", "estimatedTime":"1h" },
          { "id":"6", "title":"Unit Title", "description":"Desc", "estimatedTime":"1h" }
        ] 
      }
    `;

    const content = await callOpenRouter([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ], true);

    return JSON.parse(content);
  } catch (error) {
    return {
      title: `${detail} Essentials`,
      description: "A foundational course (Offline Mode).",
      units: [
        { id: "1", title: "Introduction", description: "Basics.", estimatedTime: "45m" },
        { id: "2", title: "Core Concepts", description: "Theory.", estimatedTime: "1h" },
        { id: "3", title: "Practice", description: "Application.", estimatedTime: "1h" },
        { id: "4", title: "Advanced", description: "Deep dive.", estimatedTime: "1h" },
        { id: "5", title: "Review", description: "Summary.", estimatedTime: "1h" },
        { id: "6", title: "Final", description: "Test.", estimatedTime: "1h" }
      ]
    };
  }
};

export const generateStudyLesson = async (unitTitle: string, userContext: string): Promise<StudyLesson | null> => {
  try {
    const systemPrompt = "You are an expert tutor. Return JSON only.";
    const userPrompt = `
      Create a lesson for "${unitTitle}" for a student in: ${userContext}.
      Return JSON:
      {
        "title": "${unitTitle}",
        "content": "Detailed markdown content. Use headers, bullets.",
        "quiz": [
          {
            "question": "Multiple choice question?",
            "options": ["A", "B", "C", "D"],
            "correctIndex": 0,
            "explanation": "Why correct.",
            "glossary": { "Term": "Def" }
          },
          {
            "question": "Question 2?",
            "options": ["A", "B", "C", "D"],
            "correctIndex": 0,
            "explanation": "Why.",
            "glossary": { "Term": "Def" }
          }
        ]
      }
    `;

    const content = await callOpenRouter([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ], true);

    return JSON.parse(content);
  } catch (error) {
    return {
      title: unitTitle,
      content: `# ${unitTitle}\n\nWe are currently unable to generate the full lesson. \n\n### Offline Mode\nPlease review your textbooks for **${unitTitle}** and practice active recall.`,
      quiz: [
        {
          question: `What is the topic?`,
          options: [unitTitle, "Math", "History", "Science"],
          correctIndex: 0,
          explanation: `This lesson covers ${unitTitle}.`,
          glossary: { [unitTitle]: "The subject." }
        }
      ]
    };
  }
};