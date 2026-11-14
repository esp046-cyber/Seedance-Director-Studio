"use strict";
window.StudioData = (() => {
  const categories = [
    "Seedance & BytePlus",
    "AI Video Generation",
    "Cinematography & Editing",
    "Post-Production & Delivery",
  ];
  const options = {
    mode: [
      "Text-to-Video (T2V)",
      "Image-to-Video (I2V)",
      "First / Last Frame Interpolation",
    ],
    shot: [
      "Wide",
      "Extreme Close-Up (ECU)",
      "Close-Up (CU)",
      "Medium Close-Up (MCU)",
      "Aerial Drone",
    ],
    lens: ["24mm Wide", "50mm Prime", "85mm Portrait", "Anamorphic"],
    lighting: [
      "Golden Hour",
      "Chiaroscuro",
      "Volumetric God Rays",
      "Neon Cyberpunk",
      "Soft Window Light",
    ],
    camera: [
      "Slow Dolly In",
      "Orbit 360°",
      "FPV Tracking",
      "Static Tripod",
      "Crane Up",
      "Lateral Tracking",
      "Gentle Pan",
    ],
    ratio: ["16:9", "9:16", "1:1", "21:9"],
  };
  const defaults = {
    mode: options.mode[0],
    subject: "A young Emirati archivist in a sand-colored coat",
    action: "She opens a memory capsule; a warm light spills across her hands.",
    environment:
      "A quiet archive above the futuristic Dubai skyline at blue hour",
    tone: "Quiet wonder, intimate and hopeful",
    shot: "Medium Close-Up (MCU)",
    lens: "50mm Prime",
    lighting: "Chiaroscuro",
    camera: "Slow Dolly In",
    motion: 4,
    ratio: "16:9",
    duration: 5,
    fps: 24,
    seed: 2027,
    seedLocked: false,
    avoid: "Review hand anatomy, facial continuity and readable signage.",
  };
  const presets = [
    {
      id: "archive",
      genre: "SCI-FI NARRATIVE",
      title: "The last memory keeper",
      description:
        "A quiet encounter between a human archivist and a city that remembers.",
      values: { ...defaults },
    },
    {
      id: "portrait",
      genre: "DOCUMENTARY PORTRAIT",
      title: "Hands that hold history",
      description:
        "An intimate portrait of a craftsperson, led by patient observation.",
      values: {
        ...defaults,
        mode: options.mode[1],
        subject:
          "An elderly boatbuilder with weathered hands and a white cotton shirt",
        action:
          "He draws a wooden plane along a dhow plank, then pauses to inspect the grain.",
        environment: "A working Dubai Creek boatyard at sunrise",
        tone: "Respectful, tactile, observant",
        shot: "Close-Up (CU)",
        lens: "85mm Portrait",
        lighting: "Soft Window Light",
        camera: "Static Tripod",
        motion: 2,
        avoid:
          "Review tool contact, hand anatomy and consistency of wood grain.",
      },
    },
    {
      id: "commercial",
      genre: "HIGH-ENERGY COMMERCIAL",
      title: "Velocity after dark",
      description:
        "One confident tracking move turns a product moment into a kinetic story.",
      values: {
        ...defaults,
        subject: "An unbranded electric concept motorcycle and helmeted rider",
        action:
          "The rider accelerates through a single clean curve; reflections sweep over the bodywork.",
        environment: "A closed neon-lit Dubai-inspired boulevard at night",
        tone: "Precise, energetic, premium",
        shot: "Wide",
        lens: "24mm Wide",
        lighting: "Neon Cyberpunk",
        camera: "FPV Tracking",
        motion: 8,
        ratio: "9:16",
        duration: 5,
      },
    },
    {
      id: "heritage",
      genre: "CULTURAL HERITAGE EPIC",
      title: "A thread across generations",
      description:
        "Connect the present to living heritage without reducing it to spectacle.",
      values: {
        ...defaults,
        subject:
          "A grandmother teaching her teenage granddaughter traditional weaving",
        action:
          "Their hands meet over a single thread; the granddaughter completes the pattern.",
        environment:
          "A historically researched Emirati courtyard with woven shade",
        tone: "Warm, dignified, intergenerational",
        shot: "Medium Close-Up (MCU)",
        lens: "50mm Prime",
        lighting: "Golden Hour",
        camera: "Lateral Tracking",
        motion: 3,
        duration: 10,
      },
    },
    {
      id: "vfx",
      genre: "ABSTRACT VFX TRANSITION",
      title: "Sand becomes a signal",
      description:
        "A designed material transition with a stable start and a clear landing.",
      values: {
        ...defaults,
        mode: options.mode[2],
        subject: "A suspended ribbon of sand aligned with a ribbon of light",
        action:
          "Sand particles gradually become cyan light, holding the same graceful arc.",
        environment: "A dark, minimal studio with a reflective black floor",
        tone: "Mesmerizing, restrained, precise",
        shot: "Close-Up (CU)",
        lens: "Anamorphic",
        lighting: "Volumetric God Rays",
        camera: "Static Tripod",
        motion: 5,
        ratio: "21:9",
        avoid:
          "Review unexpected cuts, particle popping and inconsistent reflection.",
      },
    },
    {
      id: "climate",
      genre: "CLIMATE & HUMANITY",
      title: "The shade we leave",
      description:
        "Make climate personal through one small action and its emotional cost.",
      values: {
        ...defaults,
        subject: "A child carrying a small native seedling in a clay pot",
        action:
          "The child offers the seedling to a tired commuter waiting in a strip of shade.",
        environment: "A near-future neighborhood during extreme summer heat",
        tone: "Tender, urgent, quietly hopeful",
        shot: "Wide",
        lens: "24mm Wide",
        lighting: "Golden Hour",
        camera: "Slow Dolly In",
        motion: 3,
        duration: 10,
      },
    },
    {
      id: "truth",
      genre: "TRUTH & MISINFORMATION",
      title: "Before you share",
      description:
        "A held reaction reveals the human consequence behind a viral rumor.",
      values: {
        ...defaults,
        subject: "A young journalist alone at a newsroom desk",
        action:
          "She stops her finger above a phone screen, looks at a photograph, and sets the phone down.",
        environment: "A modest newsroom before dawn; no legible screen text",
        tone: "Reflective, tense, morally grounded",
        shot: "Close-Up (CU)",
        lens: "85mm Portrait",
        lighting: "Chiaroscuro",
        camera: "Static Tripod",
        motion: 2,
      },
    },
    {
      id: "relationship",
      genre: "HUMAN RELATIONSHIPS",
      title: "An empty chair, a new beginning",
      description:
        "A single gesture carries the weight of separation and forgiveness.",
      values: {
        ...defaults,
        subject: "An adult daughter setting a second cup on a kitchen table",
        action:
          "She slides the cup toward an empty chair, then notices her father at the doorway.",
        environment: "A sunlit family apartment with a distant Dubai skyline",
        tone: "Vulnerable, forgiving, intimate",
        shot: "Medium Close-Up (MCU)",
        lens: "50mm Prime",
        lighting: "Soft Window Light",
        camera: "Gentle Pan",
        motion: 2,
        duration: 10,
      },
    },
  ];
  const rawTerms = [
    [
      0,
      "Seedance Model",
      "Seedance is a family of video-generation models. Capabilities, pricing, input types and durations vary by version and endpoint. Record the exact model identifier with every approved take instead of treating the family name as one fixed specification.",
      "Record model ID, prompt, seed, reference assets and approved take for this shot.",
    ],
    [
      0,
      "BytePlus ModelArk",
      "ModelArk is BytePlus’s model access and application platform. A planning prompt is not an API request: authenticate on your own backend, select an available model, validate its schema and poll the task using the documented workflow. Never embed API secrets in a public PWA.",
      "Production note: use a server-side ModelArk integration; keep credentials out of this prompt.",
    ],
    [
      0,
      "Seed Locking",
      "A seed initializes a stochastic generation process when supported. Keeping it fixed helps controlled comparisons, but changing a model, reference or prompt can still change the result; a seed is not a character identity guarantee.",
      "Keep the same supported seed while comparing one prompt change at a time.",
    ],
    [
      0,
      "Generation Mode",
      "Text-to-video starts with language; image-to-video adds visual conditioning; first/last-frame workflows constrain a transition. The chosen model must explicitly support the required inputs. This app records intent and does not upload those inputs.",
      "Use an authorized first-frame reference; describe only the intended motion and scene change.",
    ],
    [
      0,
      "Model Version & Reproducibility",
      "Archive the exact model version, endpoint options, source image hashes, seed and output date. Providers can change model behavior; stored prompts and identical seeds alone cannot promise exact future reconstruction.",
      "Log the exact model version and archive the selected output alongside its generation settings.",
    ],
    [
      0,
      "Inference Endpoint",
      "An endpoint receives a structured request for an enabled model. Its accepted parameters are the authority; UI labels, natural-language controls and studio planning flags must not be copied into a request as if they were supported API fields.",
      "Map creative intent to the selected endpoint schema; omit unsupported controls.",
    ],
    [
      1,
      "Temporal Consistency",
      "Temporal consistency is stability over successive frames: faces, clothing, objects and scene geometry should not drift. Inspect both real-time playback and individual frames. Shorter coherent actions and stable references may reduce, but cannot eliminate, drift.",
      "Maintain the same face, clothing, object geometry and lighting throughout this uninterrupted shot.",
    ],
    [
      1,
      "Motion Intensity / Dynamics",
      "This is the perceived amount of subject, camera and environmental movement. The studio’s 1–10 scale is a creative shorthand, not a universal Seedance numeric parameter. Translate it into specific observable motion.",
      "Restrained motion: gentle breathing, a slight fabric flutter, and one slow camera move.",
    ],
    [
      1,
      "Image-to-Video Conditioning",
      "A reference image can anchor appearance and composition. Use images you own or have permission to use, describe how the shot develops and review whether the generated motion preserves identity and geometry.",
      "Preserve the reference composition and wardrobe; animate a small head turn and natural breathing.",
    ],
    [
      1,
      "Keyframe Interpolation",
      "A first/last-frame model attempts to connect two image states over time. It invents the intermediate motion rather than recovering real events; incompatible perspective or anatomy can create implausible transitions.",
      "Move smoothly from the supplied first frame to the supplied final frame without an abrupt cut.",
    ],
    [
      1,
      "Prompt Weighting",
      "Some systems offer explicit weighting syntax, but no bracket or numeric weighting notation is universal. Unless your endpoint documents it, prioritize with clear sentence order and unambiguous language rather than invented operators.",
      "Primary visual priority: the character’s held expression. Keep background activity subtle.",
    ],
    [
      1,
      "Negative Prompting",
      "A negative prompt is a separate avoidance input only in models that expose it. Where unsupported, treat avoidance text as review criteria and use positive descriptions of the desired image; do not assume a special negative field exists.",
      "Desired result: stable natural hands, coherent face geometry and an uncluttered background.",
    ],
    [
      1,
      "AI Artifacting & Morphing",
      "Artifacts include broken anatomy, texture crawling, object merging and unintended shape changes. Inspect contact points, occlusions, reflections and faces; regenerate, mask, composite or cut away instead of relying on upscale to fix structure.",
      "Review fingers, object contact, reflections and facial identity frame by frame before approval.",
    ],
    [
      1,
      "Character Consistency",
      "Consistency combines stable reference assets, wardrobe, proportions, lighting logic and performance. A character sheet and a continuity log are more reliable planning tools than repeated adjectives alone. Obtain consent for any real-person likeness.",
      "Same character reference, hairstyle, sand-colored coat and proportions across all shots.",
    ],
    [
      1,
      "Prompt Choreography",
      "Choreography describes an ordered, feasible action within the available clip time. Too many sequential beats or contradictory camera directions can dilute control. Give the shot a beginning, a readable primary action and a held endpoint.",
      "She lifts the capsule, opens it once, then holds still as the light reaches her face.",
    ],
    [
      2,
      "Shot Size",
      "Shot size communicates distance and emotional access: wide establishes space, MCU centers performance, CU emphasizes reaction and ECU isolates detail. Shot size is not a focal length; lens and camera position also shape perspective.",
      "Medium close-up, chest to head, with space in the direction of the character’s gaze.",
    ],
    [
      2,
      "Dolly vs Zoom",
      "A dolly physically changes viewpoint and foreground/background relationships; a zoom changes field of view without moving the viewpoint. Specify one when you want predictable perspective and avoid using the terms interchangeably.",
      "Slow physical dolly toward the subject; fixed focal length, natural background parallax.",
    ],
    [
      2,
      "180-Degree Rule",
      "Keep coverage on one side of the action axis so screen direction remains coherent. Crossing the line intentionally usually needs a neutral shot or visible camera movement to reorient the audience.",
      "Keep the camera on the courtyard side of the conversation axis; preserve left-to-right eyelines.",
    ],
    [
      2,
      "Aspect Ratio Safe Zones",
      "Safe zones protect faces, captions and essential action from crops and interface overlays. There is no universal social-platform safe area; test the actual destination. A 21:9 frame is not exactly the same ratio as 2.39:1.",
      "Keep faces and essential action in the central composition; reserve clear lower space for subtitles.",
    ],
    [
      2,
      "Anamorphic Look",
      "An anamorphic-inspired image may use oval bokeh, directional flares and a wide composition. A prompt can request the look but does not imply real anamorphic optics or a correct optical desqueeze. Avoid forcing flares into every light.",
      "Restrained anamorphic-inspired rendering, oval bokeh and subtle horizontal practical-light flares.",
    ],
    [
      2,
      "Match Cut",
      "A match cut connects shots through a shared shape, motion, sound or idea. Plan both sides with compatible framing and direction; the relationship is created in the edit, not guaranteed by one generation.",
      "End on the circular capsule centered in frame; match its scale to the moon in the next shot.",
    ],
    [
      2,
      "J-Cut & L-Cut",
      "A J-cut starts incoming audio before its picture; an L-cut carries outgoing audio over the next picture. Both help continuity and emotion. Plan dialogue, ambience and picture handles separately.",
      "Editorial note: let the next scene’s room tone enter before the picture cut.",
    ],
    [
      2,
      "Frame Rate / 24fps Pull-down",
      "Frame rate describes images shown each second. 24 fps is a common cinema timeline rate. Traditional 3:2 pulldown maps 24 fps material to 60 interlaced fields; it is not a quality upgrade or the same as interpolating to 60 progressive frames.",
      "Deliver on a 24 fps timeline; conform sources deliberately and inspect motion cadence.",
    ],
    [
      2,
      "Depth of Field",
      "Depth of field is the range that appears acceptably sharp. Shallow focus directs attention but can expose unstable AI focus transitions. Name the focal subject and the intended focus behavior.",
      "Focus stays on the subject’s near eye; softly separated background, no focus hunting.",
    ],
    [
      3,
      "Optical Flow Interpolation",
      "Optical flow estimates pixel motion to synthesize intermediate frames. It can smooth or retime footage but may tear around occlusions, hands and fast motion. Compare against frame duplication or a new generation rather than assuming improvement.",
      "Post note: test optical flow on this shot and inspect occlusion edges before approval.",
    ],
    [
      3,
      "Color Grading / LUTs",
      "Color correction balances exposure and color; grading shapes a coherent look. A LUT is a color transform, not an automatic repair. Match its expected input color space and exposure before applying it across shots.",
      "Warm highlights, restrained cyan shadows, consistent skin tones and controlled highlight roll-off.",
    ],
    [
      3,
      "4K Upscaling",
      "Upscaling increases pixel dimensions through reconstruction or resampling. It does not restore verified real detail or repair every artifact. Keep an optional 4K master if useful, then export to the award’s current delivery specification.",
      "Post note: clean structural artifacts before upscale; review at final delivery size.",
    ],
    [
      3,
      "Audio-Visual Sync",
      "Synchronize dialogue, impacts and musical edits with visible events. A requested action does not guarantee synchronized generated sound or lip movement; assess the actual output and repair timing in post.",
      "Sound note: align the capsule click with visible latch contact; leave room for a short reverberation.",
    ],
    [
      3,
      "Generation Log & Provenance",
      "A log links each timeline segment to its model, prompt, assets, take, seed and rights records. Track used final duration rather than raw generated footage when estimating a Seedance contribution percentage.",
      "Log the source model and exact used timeline duration for every final shot.",
    ],
    [
      3,
      "Codec vs Container",
      "MOV and MP4 are containers; H.264, HEVC and ProRes are codecs. A valid filename does not prove compliant encoding. Confirm allowed codecs, bitrates, color and audio requirements in the current submission portal.",
      "Delivery note: verify container, codec, resolution, frame rate, audio and playback after export.",
    ],
    [
      3,
      "English Subtitles & QC",
      "Subtitles convey dialogue and relevant sound to an audience. Check translation, timing, spelling, line breaks and contrast. The award page requires English subtitles; verify whether the portal needs burned-in text, a sidecar or both.",
      "Reserve subtitle space and complete a timed English subtitle review on the final export.",
    ],
    [
      3,
      "Sound Mix & Loudness",
      "A mix balances dialogue, music and effects without clipping. Loudness and true-peak targets depend on the destination; do not invent a mandatory LUFS target when none is published. Check on headphones and speakers.",
      "Mix note: prioritize intelligible dialogue, coherent ambience and unclipped transients.",
    ],
  ];
  const glossary = rawTerms.map((t, i) => ({
    id: "term-" + i,
    category: categories[t[0]],
    term: t[1],
    definition: t[2],
    snippet: t[3],
  }));
  const checklist = [
    [
      "story",
      "Workflow milestones",
      "Concept & script",
      "A complete arc with clear characters, conflict and emotional resolution.",
    ],
    [
      "characters",
      "Workflow milestones",
      "Character sheet consistency",
      "Authorized references, wardrobe notes and a continuity log.",
    ],
    [
      "logs",
      "Workflow milestones",
      "BytePlus / Seedance generation logs",
      "Record actual model IDs, prompts, selected takes, references and used duration.",
    ],
    [
      "sound",
      "Workflow milestones",
      "Sound design & voiceover mix",
      "Licensed or original sound, consent for voices, dialogue clarity and sync review.",
    ],
    [
      "grade",
      "Workflow milestones",
      "Upscale & color grade",
      "Optional 4K master; create the required 1080p submission export separately.",
    ],
    [
      "rights",
      "Workflow milestones",
      "Metadata & rights verification",
      "Confirm authorship, asset permissions, credits, consent and project metadata.",
    ],
    [
      "length",
      "Published award requirements",
      "One connected story, 5–7 minutes",
      "Verify runtime and treatment of the required intro in the latest terms.",
    ],
    [
      "format",
      "Published award requirements",
      "Horizontal 16:9, 1080p, MOV or MP4",
      "Watch the actual final file on a separate playback device.",
    ],
    [
      "subtitles",
      "Published award requirements",
      "English subtitles included",
      "Required regardless of the film’s spoken language.",
    ],
    [
      "seedance",
      "Published award requirements",
      "At least 70% generated with Seedance",
      "Measure final used footage; other tools may support production.",
    ],
    [
      "intro",
      "Published award requirements",
      "Required event intro added before film",
      "Download the current intro from the official award page.",
    ],
    [
      "original",
      "Published award requirements",
      "Original film created for this award",
      "Keep documentation of original work and rights.",
    ],
    [
      "theme",
      "Published award requirements",
      "One of the five published themes",
      "Match the story to an official theme, not only a visual genre.",
    ],
    [
      "eligibility",
      "Published award requirements",
      "Age, eligibility & current terms verified",
      "The page states applicants must be at least 18 at submission. Read all current terms.",
    ],
    [
      "submit",
      "Published award requirements",
      "Submission completed through official portal",
      "Deadline listed: 20 November 2026. This checklist does not submit a film.",
    ],
  ].map(([id, group, title, detail]) => ({ id, group, title, detail }));
  return Object.freeze({
    categories,
    options,
    defaults,
    presets,
    glossary,
    checklist,
  });
})();
