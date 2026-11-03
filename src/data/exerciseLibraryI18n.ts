import { SupportedLanguage } from '../types';

export interface LibraryUITranslation {
  title: string;
  subtitle: string;
  searchPlaceholder: string;
  allCategories: string;
  filterBy: string;
  bodyPart: string;
  goal: string;
  difficulty: string;
  equipment: string;
  movementType: string;
  viewExercise: string;
  backToLibrary: string;
  targetMuscles: string;
  primary: string;
  secondary: string;
  instructionsTitle: string;
  formTipsTitle: string;
  commonMistakesTitle: string;
  safetyTitle: string;
  whyItMattersTitle: string;
  simpleExplanationTitle: string;
  scientificExplanationTitle: string;
  benefitsTitle: string;
  referencesTitle: string;
  relatedTitle: string;
  addToFavorites: string;
  inFavorites: string;
  mySavedExercises: string;
  addToWorkout: string;
  selectWorkoutDay: string;
  addedToWorkoutSuccess: string;
  disclaimerText: string;
  clearFilters: string;
  noExercisesFound: string;
  exerciseCountPrefix: string;
  exerciseCountSuffix: string;
  equipmentAlternatives: string;
  movementPatternLabel: string;
}

export const LIBRARY_UI_TRANSLATIONS: Record<SupportedLanguage, LibraryUITranslation> = {
  en: {
    title: 'FITORA Exercise Library',
    subtitle: 'Explore our evidence-based exercise encyclopedia with 3D biomechanics, form tips, and physiological breakdowns.',
    searchPlaceholder: 'Search exercises, muscles, equipment, goals (e.g. Chest, Squat, Mobility)...',
    allCategories: 'All Categories',
    filterBy: 'Filter Database',
    bodyPart: 'Body Part',
    goal: 'Training Goal',
    difficulty: 'Difficulty',
    equipment: 'Equipment',
    movementType: 'Type',
    viewExercise: 'View Exercise',
    backToLibrary: '← Back to Exercise Library',
    targetMuscles: 'Target Muscles & Biomechanics',
    primary: 'Primary',
    secondary: 'Secondary',
    instructionsTitle: 'How to Perform (Step-by-Step)',
    formTipsTitle: 'Form & Technique Cues',
    commonMistakesTitle: 'Common Mistakes to Avoid',
    safetyTitle: 'Safety & Clinical Considerations',
    whyItMattersTitle: 'Why This Exercise Matters',
    simpleExplanationTitle: 'Simple Real-World Breakdown',
    scientificExplanationTitle: 'Physiological & Biomechanical Science',
    benefitsTitle: 'Evidence-Based Key Benefits',
    referencesTitle: 'Reputable Scientific Literature & Sources',
    relatedTitle: 'Related & Progression Exercises',
    addToFavorites: 'Save to Favorites',
    inFavorites: 'Saved to Favorites',
    mySavedExercises: 'My Saved Exercises',
    addToWorkout: 'Add to Workout',
    selectWorkoutDay: 'Select Target Workout Day',
    addedToWorkoutSuccess: 'Added to your scheduled workout!',
    disclaimerText: 'FITORA provides educational fitness information and is not a substitute for professional medical advice. If you have an injury or medical condition, consult a qualified healthcare professional before attempting new exercises.',
    clearFilters: 'Clear Filters',
    noExercisesFound: 'No exercises match your search and filter criteria. Try adjusting your search term or clearing filters.',
    exerciseCountPrefix: 'Showing',
    exerciseCountSuffix: 'evidence-based exercises',
    equipmentAlternatives: 'Equipment Alternatives',
    movementPatternLabel: 'Movement Pattern',
  },

  kn: {
    title: 'ಫಿಟೋರಾ (FITORA) ವ್ಯಾಯಾಮ ಲೈಬ್ರರಿ',
    subtitle: '3D ಬಯೋಮೆಕ್ಯಾನಿಕ್ಸ್, ನಿಖರ ತಂತ್ರಗಳು ಮತ್ತು ವೈಜ್ಞಾನಿಕ ವಿವರಣೆಗಳೊಂದಿಗೆ ಸಮಗ್ರ ವ್ಯಾಯಾಮ ವಿಶ್ವಕೋಶ.',
    searchPlaceholder: 'ವ್ಯಾಯಾಮಗಳು, ಸ್ನಾಯುಗಳು, ಸಲಕರಣೆಗಳು ಹುಡುಕಿ (ಉದಾ: Chest, Squat, Mobility)...',
    allCategories: 'ಎಲ್ಲಾ ವಿಭಾಗಗಳು',
    filterBy: 'ಫಿಲ್ಟರ್ ಮಾಡಿ',
    bodyPart: 'ದೇಹದ ಭಾಗ',
    goal: 'ತರಬೇತಿ ಗುರಿ',
    difficulty: 'ಕಷ್ಟದ ಮಟ್ಟ',
    equipment: 'ಸಲಕರಣೆ',
    movementType: 'ರೀತಿ',
    viewExercise: 'ಪೂರ್ಣ ವಿವರ ನೋಡಿ',
    backToLibrary: '← ವ್ಯಾಯಾಮ ಲೈಬ್ರರಿಗೆ ಹಿಂತಿರುಗಿ',
    targetMuscles: 'ಗುರಿ ಸ್ನಾಯುಗಳು & ಬಯೋಮೆಕ್ಯಾನಿಕ್ಸ್',
    primary: 'ಪ್ರಾಥಮಿಕ',
    secondary: 'ದ್ವಿತೀಯಕ',
    instructionsTitle: 'ಹೇಗೆ ಮಾಡಬೇಕು (ಹಂತ-ಹಂತವಾಗಿ)',
    formTipsTitle: 'ಸರಿಯಾದ ತಂತ್ರ & ಟಿಪ್ಸ್',
    commonMistakesTitle: 'ತಪ್ಪಿಸಬೇಕಾದ ಸಾಮಾನ್ಯ ತಪ್ಪುಗಳು',
    safetyTitle: 'ಸುರಕ್ಷತೆ & ಜಾಗರೂಕತೆ',
    whyItMattersTitle: 'ಈ ವ್ಯಾಯಾಮ ಏಕೆ ಮುಖ್ಯ?',
    simpleExplanationTitle: 'ಸರಳ ದೈನಂದಿನ ವಿವರಣೆ',
    scientificExplanationTitle: 'ಶಾರೀರಿಕ & ಬಯೋಮೆಕ್ಯಾನಿಕಲ್ ವಿಜ್ಞಾನ',
    benefitsTitle: 'ವೈಜ್ಞಾನಿಕ ಪ್ರಮುಖ ಪ್ರಯೋಜನಗಳು',
    referencesTitle: 'ವಿಜ್ಞಾನ ಪತ್ರಿಕೆಗಳು & ಆಕರ ಗ್ರಂಥಗಳು',
    relatedTitle: 'ಸಂಬಂಧಿತ & ಮುಂದಿನ ಹಂತದ ವ್ಯಾಯಾಮಗಳು',
    addToFavorites: 'ಮೆಚ್ಚಿನವುಗಳಿಗೆ ಸೇರಿಸಿ',
    inFavorites: 'ಮೆಚ್ಚಿನವುಗಳಲ್ಲಿದೆ',
    mySavedExercises: 'ನನ್ನ ಉಳಿಸಿದ ವ್ಯಾಯಾಮಗಳು',
    addToWorkout: 'ವರ್ಕೌಟ್‌ಗೆ ಸೇರಿಸಿ',
    selectWorkoutDay: 'ವರ್ಕೌಟ್ ದಿನ ಆಯ್ಕೆಮಾಡಿ',
    addedToWorkoutSuccess: 'ನಿಮ್ಮ ವರ್ಕೌಟ್‌ಗೆ ಯಶಸ್ವಿಯಾಗಿ ಸೇರಿಸಲಾಗಿದೆ!',
    disclaimerText: 'ಫಿಟೋರಾ (FITORA) ಶೈಕ್ಷಣಿಕ ಫಿಟ್‌ನೆಸ್ ಮಾಹಿತಿಯನ್ನು ಮಾತ್ರ ಒದಗಿಸುತ್ತದೆ ಮತ್ತು ಇದು ವೈದ್ಯಕೀಯ ಸಲಹೆಯ ಬದಲಿಯಾಗಿಲ್ಲ. ಗಾಯ ಅಥವಾ ವೈದ್ಯಕೀಯ ಪರಿಸ್ಥಿತಿಗಳಿದ್ದಲ್ಲಿ, ವೈದ್ಯರನ್ನು ಸಂಪರ್ಕಿಸಿ.',
    clearFilters: 'ಫಿಲ್ಟರ್ ತೆರವುಗೊಳಿಸಿ',
    noExercisesFound: 'ಯಾವುದೇ ವ್ಯಾಯಾಮಗಳು ಹೊಂದಿಕೆಯಾಗಿಲ್ಲ. ದಯವಿಟ್ಟು ಬೇರೆ ಕೀವರ್ಡ್ ಹುಡುಕಿ.',
    exerciseCountPrefix: 'ಒಟ್ಟು',
    exerciseCountSuffix: 'ವ್ಯಾಯಾಮಗಳು ಲಭ್ಯವಿವೆ',
    equipmentAlternatives: 'ಪರ್ಯಾಯ ಸಲಕರಣೆಗಳು',
    movementPatternLabel: 'ಚಲನೆಯ ಮಾದರಿ',
  },

  te: {
    title: 'ఫిటోరా (FITORA) వ్యాయామ లైబ్రరీ',
    subtitle: '3D బయోమెకానిక్స్, సరైన భంగిమ పద్ధతులు మరియు శాస్త్రీయ వివరణలతో సమగ్ర వ్యాయామ డేటాబేస్.',
    searchPlaceholder: 'వ్యాయామాలు, కండరాలు, పరికరాలను శోధించండి (ఉదా: Chest, Squat, Mobility)...',
    allCategories: 'అన్ని విభాగాలు',
    filterBy: 'ఫిల్టర్ చేయండి',
    bodyPart: 'శరీర భాగం',
    goal: 'లక్ష్యం',
    difficulty: 'స్థాయి',
    equipment: 'పరికరాలు',
    movementType: 'రకం',
    viewExercise: 'పూర్తి వివరాలు చూడండి',
    backToLibrary: '← వ్యాయామ లైబ్రరీకి తిరిగి వెళ్ళు',
    targetMuscles: 'టార్గెట్ కండరాలు & బయోమెకానిక్స్',
    primary: 'ప్రధాన',
    secondary: 'ద్వితీయ',
    instructionsTitle: 'ఎలా చేయాలి (దశలవారీగా)',
    formTipsTitle: 'సరైన టెక్నిక్ సూచనలు',
    commonMistakesTitle: 'నివారించాల్సిన సాధారణ తప్పులు',
    safetyTitle: 'భద్రత & జాగ్రత్తలు',
    whyItMattersTitle: 'ఈ వ్యాయామం ఎందుకు ముఖ్యం?',
    simpleExplanationTitle: 'సరళమైన వివరణ',
    scientificExplanationTitle: 'శాస్త్రీయ & శారీరక దృక్పథం',
    benefitsTitle: 'శాస్త్రీయ కీలక ప్రయోజనాలు',
    referencesTitle: 'పరిశోధన గ్రంథాలు & ఆధారాలు',
    relatedTitle: 'సంబంధిత వ్యాయామాలు',
    addToFavorites: 'ఇష్టమైన వాటిలో చేర్చు',
    inFavorites: 'ఇష్టమైన వాటిలో ఉంది',
    mySavedExercises: 'నా సేవ్ చేసిన వ్యాయామాలు',
    addToWorkout: 'వర్కౌట్‌కు జోడించు',
    selectWorkoutDay: 'వర్కౌట్ రోజును ఎంచుకోండి',
    addedToWorkoutSuccess: 'మీ వర్కౌట్ ప్రణాళికకు విజయవంతంగా జోడించబడింది!',
    disclaimerText: 'ఫిటోరా (FITORA) విద్యాపరమైన ఫిట్‌నెస్ సమాచారాన్ని మాత్రమే అందిస్తుంది మరియు ఇది వైద్య సలహాకు ప్రత్యామ్నాయం కాదు. గాయాలు ఉంటే అర్హత కలిగిన వైద్యుడిని సంప్రదించండి.',
    clearFilters: 'ఫిల్టర్లను క్లియర్ చేయండి',
    noExercisesFound: 'మీ శోధనకు తగిన వ్యాయామాలు కనుగొనబడలేదు.',
    exerciseCountPrefix: 'మొత్తం',
    exerciseCountSuffix: 'వ్యాయామాలు అందుబాటులో ఉన్నాయి',
    equipmentAlternatives: 'ప్రత్యామ్నాయ పరికరాలు',
    movementPatternLabel: 'మూవ్‌మెంట్ ప్యాటర్న్',
  },

  ta: {
    title: 'FITORA உடற்பயிற்சி நூலகம் (Exercise Library)',
    subtitle: '3D உடற்கூறியல் அனிமேஷன்கள், சரியான நுட்பங்கள் மற்றும் அறிவியல் விளக்கங்களுடன் கூடிய முழுமையான உடற்பயிற்சி தளம்.',
    searchPlaceholder: 'பயிற்சிகள், தசைகள், உபகரணங்களைத் தேடுங்கள் (எ.கா: Chest, Squat, Mobility)...',
    allCategories: 'அனைத்து பிரிவுகள்',
    filterBy: 'வடிகட்டுக',
    bodyPart: 'உடல் பகுதி',
    goal: 'பயிற்சி இலக்கு',
    difficulty: 'சிரம நிலை',
    equipment: 'உபகரணம்',
    movementType: 'வகை',
    viewExercise: 'விவரங்களை காண்க',
    backToLibrary: '← உடற்பயிற்சி நூலகத்திற்குத் திரும்பு',
    targetMuscles: 'இலக்கு தசைகள் & உடற்கூறியல்',
    primary: 'முதன்மை',
    secondary: 'இரண்டாம் நிலை',
    instructionsTitle: 'செய்முறை வழிகாட்டி (படி-படியாக)',
    formTipsTitle: 'சரியான நுட்பக் குறிப்புகள்',
    commonMistakesTitle: 'தவிர்க்க வேண்டிய பொதுவான தவறுகள்',
    safetyTitle: 'பாதுகாப்பு & மருத்துவ எச்சரிக்கை',
    whyItMattersTitle: 'இந்த பயிற்சி ஏன் முக்கியமானது?',
    simpleExplanationTitle: 'எளிமையான அன்றாட விளக்கம்',
    scientificExplanationTitle: 'உடலியல் & அறிவியல் விளக்கம்',
    benefitsTitle: 'ஆராய்ச்சி அடிப்படையிலான நன்மைகள்',
    referencesTitle: 'அறிவியல் குறிப்புகள் & சான்றுகள்',
    relatedTitle: 'தொடர்புடைய உடற்பயிற்சிகள்',
    addToFavorites: 'விருப்பத்தில் சேர்',
    inFavorites: 'விருப்பத்தில் உள்ளது',
    mySavedExercises: 'சேமிக்கப்பட்ட பயிற்சிகள்',
    addToWorkout: 'பயிற்சி திட்டத்தில் சேர்',
    selectWorkoutDay: 'பயிற்சி நாளைத் தேர்ந்தெடுக்கவும்',
    addedToWorkoutSuccess: 'உங்கள் பயிற்சி அட்டவணையில் சேர்க்கப்பட்டது!',
    disclaimerText: 'FITORA பொதுவான உடற்பயிற்சி தகவலை மட்டுமே வழங்குகிறது. ஏதேனும் காயங்கள் அல்லது உடல்நலக் குறைபாடுகள் இருந்தால் மருத்துவரை அணுகவும்.',
    clearFilters: 'வடிகட்டிகளை நீக்கு',
    noExercisesFound: 'பயிற்சிகள் எதுவும் கிடைக்கவில்லை.',
    exerciseCountPrefix: 'காட்டப்படும்',
    exerciseCountSuffix: 'உடற்பயிற்சிகள்',
    equipmentAlternatives: 'மாற்று உபகரணங்கள்',
    movementPatternLabel: 'இயக்க முறை',
  },

  ml: {
    title: 'ഫിറ്റോറ (FITORA) വ്യായാമ ലൈബ്രറി',
    subtitle: '3D ശരീരഘടന അനിമേഷനുകളും ശാസ്ത്രീയ വിശകലനങ്ങളും ഉൾക്കൊള്ളുന്ന സമഗ്രമായ വ്യായാമ ശേഖരം.',
    searchPlaceholder: 'വ്യായാമങ്ങൾ, പേശികൾ, ഉപകരണങ്ങൾ തിരയുക (ഉദാ: Chest, Squat, Mobility)...',
    allCategories: 'എല്ലാ വിഭാഗങ്ങളും',
    filterBy: 'ഫിൽട്ടർ ചെയ്യുക',
    bodyPart: 'ശരീര ഭാഗം',
    goal: 'ലക്ഷ്യം',
    difficulty: 'ലെവൽ',
    equipment: 'ഉപകരണം',
    movementType: 'തരം',
    viewExercise: 'വിശദാംശങ്ങൾ കാണുക',
    backToLibrary: '← വ്യായാമ ലൈബ്രറിയിലേക്ക് മടങ്ങുക',
    targetMuscles: 'ലക്ഷ്യ പേശികൾ & ബയോമെക്കാനിക്സ്',
    primary: 'പ്രധാനം',
    secondary: 'ദ്വിതീയം',
    instructionsTitle: 'ചെയ്യേണ്ട രീതി (ഘട്ടം ഘട്ടമായി)',
    formTipsTitle: 'ശരിയായ സാങ്കേതിക വിദ്യകൾ',
    commonMistakesTitle: 'ഒഴിവാക്കേണ്ട സാധാരണ തെറ്റുകൾ',
    safetyTitle: 'സുരക്ഷാ നിർദ്ദേശങ്ങൾ',
    whyItMattersTitle: 'ഈ വ്യായാമം എന്തുകൊണ്ട് പ്രധാനമാണ്?',
    simpleExplanationTitle: 'ലളിതമായ വിവരണം',
    scientificExplanationTitle: 'ശരീരശാസ്ത്ര ശാസ്ത്രീയ വശം',
    benefitsTitle: 'ശാസ്ത്രീയമായ പ്രധാന നേട്ടങ്ങൾ',
    referencesTitle: 'ശാസ്ത്രീയ റഫറൻസുകൾ',
    relatedTitle: 'ബന്ധപ്പെട്ട വ്യായാമങ്ങൾ',
    addToFavorites: 'പ്രിയപ്പെട്ടവയിൽ ചേർക്കുക',
    inFavorites: 'പ്രിയപ്പെട്ടവയിൽ ഉണ്ട്',
    mySavedExercises: 'സേവ് ചെയ്ത വ്യായാമങ്ങൾ',
    addToWorkout: 'വർക്കൗട്ടിലേക്ക് ചേർക്കുക',
    selectWorkoutDay: 'വർക്കൗട്ട് ദിവസം തിരഞ്ഞെടുക്കുക',
    addedToWorkoutSuccess: 'നിങ്ങളുടെ വർക്കൗട്ടിലേക്ക് ചേർത്തു!',
    disclaimerText: 'ഫിറ്റോറ (FITORA) വ്യായാമ വിവരങ്ങൾ മാത്രമാണ് നൽകുന്നത്. ആരോഗ്യ പ്രശ്നങ്ങൾക്ക് ഡോക്ടറുടെ നിർദ്ദേശം തേടുക.',
    clearFilters: 'ഫിൽട്ടർ മാറ്റുക',
    noExercisesFound: 'വ്യായാമങ്ങളൊന്നും കണ്ടെത്താനായില്ല.',
    exerciseCountPrefix: 'ആകെ',
    exerciseCountSuffix: 'വ്യായാമങ്ങൾ ലഭ്യമാണ്',
    equipmentAlternatives: 'മറ്റു ഉപകരണങ്ങൾ',
    movementPatternLabel: 'മൂവ്മെന്റ് പാറ്റേൺ',
  },
};
