export const DEFAULT_PREDICTION_CONFIG = {
  maxScale: 4.0,
  decayRate: 0.85,
  difficultyProfile: {
    // ID -> point penalty (e.g. sem 7 & 8 are structurally harder)
    7: -0.05,
    8: -0.10,
  },
};

/**
 * Advanced multi-strategy CGPA prediction algorithm.
 * @param {Array} completedSemesters - [{ id, sgpa, points, credits }]
 * @param {Array} futureSemesters - [{ id, credits }]
 * @param {Object} config - prediction configuration
 */
export function predictCGPA(completedSemesters, futureSemesters, config = DEFAULT_PREDICTION_CONFIG) {
  const { maxScale, decayRate, difficultyProfile } = config;
  const k = completedSemesters.length;

  if (k === 0 || futureSemesters.length === 0) {
    return {
      projections: futureSemesters.map(f => ({
        id: f.id,
        optimisticSgpa: null,
        likelySgpa: null,
        conservativeSgpa: null
      })),
      ranges: null,
    };
  }

  // Base stats (Step 1)
  let totalCompletedCredits = 0;
  let totalCompletedPoints = 0;
  completedSemesters.forEach(s => {
    totalCompletedCredits += s.credits;
    totalCompletedPoints += s.points;
  });

  const lastCompleted = completedSemesters[k - 1];
  const projections = [];

  // Logic variables for trend
  let m = 0, c = 0; 
  let recentAverage = 0;
  let rhythm = 0;
  let confidenceWeight = 0;

  if (k >= 3) {
    // 1. Trendline (linear regression on SGPA)
    let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;
    completedSemesters.forEach(s => {
      const x = s.id;
      const y = s.sgpa;
      sumX += x;
      sumY += y;
      sumXY += x * y;
      sumXX += x * x;
    });
    
    // slope (m) and intercept (c)
    m = (k * sumXY - sumX * sumY) / (k * sumXX - sumX * sumX);
    c = (sumY - m * sumX) / k;

    // 2. Rhythm (consistency check)
    let sumResiduals = 0;
    completedSemesters.forEach(s => {
      const predicted = m * s.id + c;
      sumResiduals += Math.abs(s.sgpa - predicted);
    });
    rhythm = sumResiduals / k;
    confidenceWeight = 1 / (1 + rhythm); // high rhythm spread = low confidence

    // recent average
    recentAverage = (completedSemesters[k - 1].sgpa + completedSemesters[k - 2].sgpa) / 2;
  } else if (k === 2) {
    // Dampened slope
    m = completedSemesters[1].sgpa - completedSemesters[0].sgpa;
  }

  const clamp = (val) => Math.max(0, Math.min(val, maxScale));

  futureSemesters.forEach((fs, i) => {
    const stepsAhead = i + 1;
    const diffPenalty = difficultyProfile[fs.id] || 0;

    let optimisticSgpa = 0;
    let likelySgpa = 0;
    let conservativeSgpa = 0;

    if (k === 1) {
      // Case k = 1: Adaptation model (No trend possible)
      // Semester 2 prediction = Semester 1 CGPA * 0.97
      // Semester 3 = * 0.98
      // Semester 4+ = * 1.01
      const base = lastCompleted.sgpa;
      
      let factor = 1.0;
      if (fs.id === 2) factor = 0.97;
      else if (fs.id === 3) factor = 0.98;
      else factor = 1.01;

      likelySgpa = base * factor + diffPenalty;
      optimisticSgpa = likelySgpa + 0.1; // Arbitrary small optimistic bump
      conservativeSgpa = base * 0.95 + diffPenalty; 

    } else if (k === 2) {
      // Case k = 2: Dampened slope
      const effectiveSlope = m * 0.5 * Math.pow(decayRate, stepsAhead);
      
      likelySgpa = lastCompleted.sgpa + effectiveSlope + diffPenalty;
      
      // Optimistic assumes the full slope continues un-dampened if it's positive
      optimisticSgpa = lastCompleted.sgpa + (m > 0 ? m : 0) * Math.pow(decayRate, stepsAhead);
      
      // Conservative assumes flatlining with penalty
      conservativeSgpa = lastCompleted.sgpa + diffPenalty; 

    } else {
      // Case k >= 3: Trendline + rhythm + difficulty
      
      // 4. Slope decay for distant semesters
      let accumulatedTrend = 0;
      for(let step = 1; step <= stepsAhead; step++) {
        accumulatedTrend += m * Math.pow(decayRate, step);
      }
      const decayingTrendlineValue = lastCompleted.sgpa + accumulatedTrend;

      const blendedProjection = (confidenceWeight * decayingTrendlineValue) + ((1 - confidenceWeight) * recentAverage);
      
      likelySgpa = blendedProjection + diffPenalty;
      
      // Optimistic: project using the raw trendline (no damping, no penalty)
      optimisticSgpa = m * fs.id + c;

      // Conservative: assume the most recent CGPA stays flat for all remaining semesters, minus the full difficulty penalty
      conservativeSgpa = lastCompleted.sgpa + diffPenalty;
    }

    // 5. Clamp every projected value between 0 and maxScale
    projections.push({
      id: fs.id,
      credits: fs.credits,
      optimisticSgpa: clamp(optimisticSgpa),
      likelySgpa: clamp(likelySgpa),
      conservativeSgpa: clamp(conservativeSgpa)
    });
  });

  // Calculate overall predicted Final CGPAs (Step 3 & 4)
  const calculateFinal = (sgpaKey) => {
    let totalCredits = totalCompletedCredits;
    let totalPoints = totalCompletedPoints;

    projections.forEach(p => {
      totalCredits += p.credits;
      totalPoints += p[sgpaKey] * p.credits;
    });

    return totalCredits > 0 ? clamp(totalPoints / totalCredits) : 0;
  };

  const ranges = {
    optimistic: calculateFinal('optimisticSgpa'),
    likely: calculateFinal('likelySgpa'),
    conservative: calculateFinal('conservativeSgpa'),
  };

  return {
    projections,
    ranges
  };
}