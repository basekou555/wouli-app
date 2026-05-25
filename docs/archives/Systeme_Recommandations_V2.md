### 🎯 PHILOSOPHIE & PRIORITÉS

```typescript
const WouliStrategy = {
  // MISSION
  mission: "Transformer le 'on fait quoi ce soir?' en soirée mémorable",
  positioning: "La personnalisation et centralisation des sorties à Lyon",
  
  // HIÉRARCHIE OPTIMISATION (ton ordre)
  optimization_priority: {
    1: "retention",        // Ils reviennent sur l'app
    2: "satisfaction",     // Ils sont contents de leur soirée
    3: "engagement",       // Ils swipent et interagissent
    4: "participation"     // Ils vont vraiment aux events
  },
  
  // NORTH STAR METRICS
  north_star: {
    primary: "Weekly Active Users > 60%",      // Rétention
    secondary: "Engagement Rate > 30 swipes/session", // Engagement
    tertiary: "Post-Event Satisfaction > 4.2/5"  // Satisfaction
  }
}
```

### 🚀 ONBOARDING - STYLE SPOTIFY

```typescript
interface OnboardingFlow {
  // ÉTAPE 1 : Sélection de préférences
  preference_selection: {
    display: "Grid de mots-clés stylés",
    categories: [
      // Visibles et fun
      "🍹 Afterwork", "🎵 Concerts", "🍔 Street food",
      "🎭 Culture", "🎮 Gaming", "🍷 Dégustations",
      "💃 Soirées", "🏃 Sport", "🎨 Créatif",
      "📚 Talks", "🍻 Bars", "🌙 Nocturne"
    ],
    minimum_selection: 5,
    ui: "Cards avec images de fond"
  },
  
  // ÉTAPE 2 : Premiers swipes
  first_swipes: {
    selection_strategy: [
      3, // Events populaires & safe (belles images)
      2, // Events urgents si pertinents
      3, // Events matchant les préférences choisies
      2  // Découvertes calibrées
    ],
    goal: "Accrocher avec du contenu premium"
  }
}
```

### 🤖 ALGORITHME DE RECOMMANDATION

```typescript
class WouliAlgorithmV2 {
  // ORDRE DE PRIORITÉ (selon tes préférences)
  generateFeed(user: User): Event[] {
    const feed = [];
    
    // 1. PRÉFÉRENCES (60% - PRIORITÉ)
    const preferred = this.getPreferredEvents(user, {
      ratio: 0.6,
      based_on: user.selected_keywords + user.interaction_history
    });
    feed.push(...preferred);
    
    // 2. SOCIAL (20%)
    const social = this.getSocialEvents(user, {
      ratio: 0.2,
      boost_if: "more_than_3_friends"
    });
    feed.push(...social);
    
    // 3. URGENCE (10% - si pertinent)
    const urgent = this.getUrgentEvents({
      max: 2,
      only_if: "matches_preferences",
      labels: ["Ce soir", "Dans 2h"]
    });
    feed.push(...urgent);
    
    // 4. DÉCOUVERTE (10% minimum garanti)
    const discovery = this.getDiscoveryEvents({
      ratio: 0.1,
      strategy: "adjacent_to_preferences" // Pas totalement random
    });
    feed.push(...discovery);
    
    return this.smartShuffle(feed);
  }
}
```

### 📊 TRACKING INTELLIGENT

```typescript
interface SmartTracking {
  // CE QU'ON TRACK
  interaction_signals: {
    // SIGNAL FORT : Vitesse de décision
    quick_like: "< 2s = coup de coeur",
    slow_like: "> 5s = hésitation mais intéressé",
    quick_dislike: "< 1s = pas du tout",
    slow_dislike: "> 5s = à reconsidérer plus tard",
    
    // CONTEXTE
    position_in_session: number,  // Fatigue décisionnelle ?
    time_since_last_action: number, // Engagement actif ?
    did_read_details: boolean,    // Vraiment intéressé ?
    did_check_friends: boolean    // Social important ?
  },
  
  // INTERPRÉTATION
  interpretation_rules: {
    "quick_like + participate": "Perfect match",
    "slow_like + no_action": "Interested but not now",
    "quick_dislike": "Not their thing",
    "slow_dislike": "Maybe later with friends"
  }
}
```

### 🧠 INTÉGRATION CLAUDE - ROADMAP

```typescript
const ClaudeRoadmap = {
  // PHASE 1 - IMMÉDIAT (Différenciation)
  week_1: {
    feature: "Smart Descriptions",
    implementation: `
      // Quand un business crée un event
      const generateDescription = async (event) => {
        const prompt = "Génère une description engageante...";
        return await claude.complete(prompt, { max_tokens: 200 });
      };
    `,
    cost: "5€/mois",
    value: "Descriptions 3x plus engageantes"
  },
  
  // PHASE 2 - MOIS 1
  month_1: {
    feature: "Preference Analysis",
    implementation: "Analyse quotidienne des patterns",
    cost: "20€/mois",
    value: "Comprendre les envies cachées"
  },
  
  // PHASE 3 - MOIS 2  
  month_2: {
    feature: "Success Prediction",
    implementation: "Score de succès par event",
    cost: "25€/mois",
    value: "30% meilleur taux de participation"
  }
}
```

### 🔔 GESTION DE LA FRUSTRATION

```typescript
const FrustrationManagement = {
  // QUAND 0 RÉSULTATS
  no_results: {
    message: "Aucun événement ne correspond exactement",
    action: "show_alternatives",
    ui: `
      <EmptyState>
        <Icon>🔍</Icon>
        <Title>Rien pour ces critères</Title>
        <Subtitle>Mais voici des alternatives proches :</Subtitle>
        <AlternativeEvents />
        <Button>Élargir ma recherche</Button>
      </EmptyState>
    `
  },
  
  // FALLBACK INTELLIGENT
  fallback_strategy: [
    "Relax price constraint",    // D'abord le prix
    "Expand time window",         // Puis l'horaire
    "Increase distance",          // Puis la distance
    "Show different categories"   // Enfin les catégories
  ]
}
```

### 📈 MÉTRIQUES BUSINESS

```typescript
const BusinessMetrics = {
  // POUR LES ÉTABLISSEMENTS (ils comprennent)
  for_establishments: {
    primary: "Vues de votre établissement",
    secondary: "Taux de conversion vue → visite",
    tertiary: "Position vs concurrents"
  },
  
  // POUR LES INVESTISSEURS (evolution)
  for_investors: {
    // Phase 1 : Vanity metrics (ils connaissent)
    early_stage: {
      "downloads": "1000 en 3 mois",
      "total_swipes": "50k interactions",
      "establishments": "10 payants"
    },
    
    // Phase 2 : Real metrics
    growth_stage: {
      "WAU": "60% reviennent chaque semaine",
      "viral_coefficient": "1.2 (croissance organique)",
      "LTV/CAC": "6x (rentable)"
    }
  }
}
```

### 🛠️ IMPLÉMENTATION - PLAN D'ACTION

```typescript
// SEMAINE 1 - BASE FONCTIONNELLE
const Week1 = {
  // 1. ONBOARDING (2h)
  monday: {
    task: "Create onboarding with keyword selection",
    components: ["OnboardingFlow", "KeywordGrid", "PreferenceStorage"]
  },
  
  // 2. TRACKING INTELLIGENT (2h)
  tuesday: {
    task: "Implement smart tracking hook",
    code: `
      const useSmartTracking = () => {
        const [startTime, setStartTime] = useState(Date.now());
        
        const trackInteraction = (action: 'like' | 'dislike', eventId: string) => {
          const duration = Date.now() - startTime;
          const signal = interpretDuration(action, duration);
          
          saveInteraction({ eventId, action, signal });
        };
        
        return { trackInteraction };
      };
    `
  },
  
  // 3. ALGO V1 (3h)
  wednesday: {
    task: "Basic recommendation algorithm",
    priority: ["preferences", "social", "urgent", "discovery"]
  },
  
  // 4. CLAUDE DESCRIPTIONS (2h)
  thursday: {
    task: "Edge function for smart descriptions",
    endpoint: "/api/generate-description"
  },
  
  // 5. TESTS & POLISH (1 jour)
  friday: {
    task: "Testing with real data",
    checklist: [
      "Onboarding flow smooth",
      "Tracking working",
      "Feed feels personalized",
      "Descriptions engaging"
    ]
  }
}
```

### ✅ CHECKLIST FINALE AVANT DEV

```typescript
const FinalValidation = {
  // CONFIRMÉ
  ✅ optimization_order: "Rétention > Satisfaction > Engagement > Participation",
  ✅ onboarding: "Style Spotify avec 5+ keywords",
  ✅ algorithm_priority: "Préférences > Social > Urgence > Découverte",
  ✅ tracking: "Vitesse de décision = signal fort",
  ✅ ai_integration: "Dès le début pour différenciation",
  ✅ frustration: "Toujours proposer des alternatives",
  ✅ budget_ia: "50€/mois acceptable",
  
  // READY TO CODE
  ready: true,
  confidence: "95%",
  first_task: "Créer le flow d'onboarding"
}
```