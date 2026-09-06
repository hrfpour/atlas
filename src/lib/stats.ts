/**
 * Pure-TypeScript statistical library for the interactive tools.
 * Provides PDF/PMF, CDF, quantile, mean, variance, skewness, kurtosis,
 * and random sampling for the most-used distributions.
 *
 * All functions are numerically robust enough for visualization and
 * interactive playgrounds (not research-grade).
 */

// ---------- special functions ----------

const LANCZOS_G = 7;
const LANCZOS_C = [
  0.99999999999980993, 676.5203681218851, -1259.1392167224028,
  771.32342877765313, -176.61502916214059, 12.507343278686905,
  -0.13857109526572012, 9.9843695780195716e-6, 1.5056327351493116e-7,
];

/** Natural log of the gamma function (Lanczos). */
export function lgamma(x: number): number {
  if (x < 0.5) {
    // reflection
    return (
      Math.log(Math.PI / Math.sin(Math.PI * x)) - lgamma(1 - x)
    );
  }
  x -= 1;
  let a = LANCZOS_C[0];
  const t = x + LANCZOS_G + 0.5;
  for (let i = 1; i < LANCZOS_C.length; i++) {
    a += LANCZOS_C[i] / (x + i);
  }
  return (
    0.5 * Math.log(2 * Math.PI) + (x + 0.5) * Math.log(t) - t + Math.log(a)
  );
}

export function gamma(x: number): number {
  if (!isFinite(x)) return x;
  if (x <= 0 && Math.abs(x - Math.round(x)) < 1e-9) return Infinity;
  return Math.exp(lgamma(x));
}

/** Regularized lower incomplete gamma P(a,x) via series + continued fraction. */
function gammp(a: number, x: number): number {
  if (x < 0 || a <= 0) return 0;
  if (x < a + 1) {
    // series
    let ap = a;
    let sum = 1 / a;
    let del = sum;
    for (let n = 0; n < 200; n++) {
      ap += 1;
      del *= x / ap;
      sum += del;
      if (Math.abs(del) < Math.abs(sum) * 1e-12) break;
    }
    return sum * Math.exp(-x + a * Math.log(x) - lgamma(a));
  }
  // continued fraction (Q)
  let b = x + 1 - a;
  let c = 1e30;
  let d = 1 / b;
  let h = d;
  for (let i = 1; i < 200; i++) {
    const an = -i * (i - a);
    b += 2;
    d = an * d + b;
    if (Math.abs(d) < 1e-30) d = 1e-30;
    c = b + an / c;
    if (Math.abs(c) < 1e-30) c = 1e-30;
    d = 1 / d;
    const del = d * c;
    h *= del;
    if (Math.abs(del - 1) < 1e-12) break;
  }
  const q = Math.exp(-x + a * Math.log(x) - lgamma(a)) * h;
  return 1 - q;
}

/** Regularized upper incomplete gamma Q(a,x) = 1 - P(a,x). */
function gammq(a: number, x: number): number {
  return 1 - gammp(a, x);
}

/** Inverse of gammp: given p, return x such that P(a,x)=p. */
function gammpInv(a: number, p: number): number {
  if (p <= 0) return 0;
  if (p >= 1) return Infinity;
  // initial guess
  let x = Math.max(1, a);
  for (let i = 0; i < 100; i++) {
    const err = gammp(a, x) - p;
    if (Math.abs(err) < 1e-8) return x;
    const d = Math.exp(-x + a * Math.log(x) - lgamma(a));
    if (d < 1e-300) break;
    x -= err / d;
    if (x <= 0) x = 1e-8;
  }
  return x;
}

/** Error function. */
export function erf(x: number): number {
  // use incomplete gamma: erf(x) = P(1/2, x^2) for x>=0; sign for x<0
  const t = x * x;
  return x >= 0 ? gammp(0.5, t) : -gammp(0.5, t);
}
export function erfc(x: number): number {
  return 1 - erf(x);
}

/** Inverse normal CDF (Acklam / Beasley-Springer-Moro). */
export function normInv(p: number): number {
  if (p <= 0) return -Infinity;
  if (p >= 1) return Infinity;
  const a = [
    -3.969683028665376e1, 2.209460984245205e2, -2.759285104469687e2,
    1.38357751867269e2, -3.066479806614716e1, 2.506628277459239,
  ];
  const b = [
    -5.447609879822406e1, 1.615858368580409e2, -1.556989798598866e2,
    6.680131188771972e1, -1.328068155288572e1,
  ];
  const c = [
    -7.784894002430293e-3, -3.223964580411365e-1, -2.400758277161838,
    -2.549732539343734, 4.374664141464968, 2.938163982698783,
  ];
  const d = [
    7.784695709041462e-3, 3.224671290700398e-1, 2.445134137142996,
    3.754408661907416,
  ];
  const plow = 0.02425;
  const phigh = 1 - plow;
  let q, r;
  if (p < plow) {
    q = Math.sqrt(-2 * Math.log(p));
    return (
      (((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) /
      ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1)
    );
  } else if (p <= phigh) {
    q = p - 0.5;
    r = q * q;
    return (
      ((((((a[0] * r + a[1]) * r + a[2]) * r + a[3]) * r + a[4]) * r + a[5]) * q) /
      (((((b[0] * r + b[1]) * r + b[2]) * r + b[3]) * r + b[4]) * r + 1)
    );
  } else {
    q = Math.sqrt(-2 * Math.log(1 - p));
    return (
      -(
        ((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]
      ) /
      ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1)
    );
  }
}

/** Inverse via bisection for any monotone CDF fn. */
function bisectInverse(
  cdf: (x: number) => number,
  p: number,
  lo: number,
  hi: number,
): number {
  if (p <= 0) return lo;
  if (p >= 1) return hi;
  let a = lo;
  let b = hi;
  for (let i = 0; i < 100; i++) {
    const m = (a + b) / 2;
    const v = cdf(m);
    if (v < p) a = m;
    else b = m;
    if (b - a < 1e-9 * (1 + Math.abs(m))) return m;
  }
  return (a + b) / 2;
}

// ---------- combinations / factorials ----------

const LOG_FACT: number[] = [0];
export function logFact(n: number): number {
  if (n < 0) return NaN;
  while (LOG_FACT.length <= n) {
    const k = LOG_FACT.length;
    LOG_FACT.push(LOG_FACT[k - 1] + Math.log(k));
  }
  return LOG_FACT[n];
}
export function binom(n: number, k: number): number {
  if (k < 0 || k > n) return 0;
  return Math.round(
    Math.exp(logFact(n) - logFact(k) - logFact(n - k)),
  );
}
export function logBinom(n: number, k: number): number {
  if (k < 0 || k > n) return -Infinity;
  return logFact(n) - logFact(k) - logFact(n - k);
}

// ---------- PRNG (seedable Mulberry32) ----------

export function makeRng(seed = 1): () => number {
  let s = seed >>> 0;
  return function () {
    s |= 0;
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ---------- distribution implementations ----------

export type DistId =
  | "normal" | "continuous-uniform" | "exponential" | "gamma"
  | "beta" | "chi-square" | "student-t" | "lognormal" | "weibull"
  | "rayleigh" | "cauchy" | "laplace" | "logistic" | "pareto"
  | "poisson" | "binomial" | "geometric" | "negative-binomial"
  | "hypergeometric" | "discrete-uniform" | "triangular";

export type DistParams = Record<string, number>;

/** A pluggable distribution descriptor for the playground / calculator. */
export type DistSpec = {
  id: DistId;
  label: string;
  discrete: boolean;
  params: { name: string; min: number; max: number; step: number; init: number }[];
  domain: [number, number];
  pdf: (x: number, p: DistParams) => number;       // density or mass
  cdf: (x: number, p: DistParams) => number;
  quantile: (q: number, p: DistParams) => number;
  mean: (p: DistParams) => number;
  variance: (p: DistParams) => number;
  sample: (p: DistParams, rng: () => number) => number;
};

// helper: log-pdf convenience
function normPdf(x: number, mu: number, sigma: number): number {
  const z = (x - mu) / sigma;
  return Math.exp(-0.5 * z * z) / (sigma * Math.sqrt(2 * Math.PI));
}
function normCdf(x: number, mu: number, sigma: number): number {
  return 0.5 * erfc(-(x - mu) / (sigma * Math.SQRT2));
}

export const distSpecs: Record<DistId, DistSpec> = {
  normal: {
    id: "normal",
    label: "Normal",
    discrete: false,
    params: [
      { name: "mu", min: -5, max: 5, step: 0.1, init: 0 },
      { name: "sigma", min: 0.2, max: 3, step: 0.1, init: 1 },
    ],
    domain: [-5, 5],
    pdf: (x, p) => normPdf(x, p.mu, p.sigma),
    cdf: (x, p) => normCdf(x, p.mu, p.sigma),
    quantile: (q, p) => p.mu + p.sigma * normInv(q),
    mean: (p) => p.mu,
    variance: (p) => p.sigma * p.sigma,
    sample: (p, rng) =>
      p.mu + p.sigma * Math.sqrt(-2 * Math.log(rng())) * Math.cos(2 * Math.PI * rng()),
  },
  "continuous-uniform": {
    id: "continuous-uniform",
    label: "Continuous Uniform",
    discrete: false,
    params: [
      { name: "a", min: -3, max: 3, step: 0.1, init: 0 },
      { name: "b", min: 0.5, max: 6, step: 0.1, init: 1 },
    ],
    domain: [-3, 6],
    pdf: (x, p) => (x >= p.a && x <= p.b ? 1 / (p.b - p.a) : 0),
    cdf: (x, p) =>
      x < p.a ? 0 : x > p.b ? 1 : (x - p.a) / (p.b - p.a),
    quantile: (q, p) => p.a + q * (p.b - p.a),
    mean: (p) => (p.a + p.b) / 2,
    variance: (p) => ((p.b - p.a) ** 2) / 12,
    sample: (p, rng) => p.a + rng() * (p.b - p.a),
  },
  exponential: {
    id: "exponential",
    label: "Exponential",
    discrete: false,
    params: [{ name: "lambda", min: 0.1, max: 5, step: 0.1, init: 1 }],
    domain: [0, 8],
    pdf: (x, p) => (x < 0 ? 0 : p.lambda * Math.exp(-p.lambda * x)),
    cdf: (x, p) => (x < 0 ? 0 : 1 - Math.exp(-p.lambda * x)),
    quantile: (q, p) => (-Math.log(1 - q)) / p.lambda,
    mean: (p) => 1 / p.lambda,
    variance: (p) => 1 / (p.lambda * p.lambda),
    sample: (p, rng) => -Math.log(1 - rng()) / p.lambda,
  },
  gamma: {
    id: "gamma",
    label: "Gamma",
    discrete: false,
    params: [
      { name: "alpha", min: 0.5, max: 10, step: 0.1, init: 2 },
      { name: "beta", min: 0.2, max: 5, step: 0.1, init: 1 },
    ],
    domain: [0, 15],
    pdf: (x, p) =>
      x <= 0
        ? 0
        : Math.exp(p.alpha * Math.log(p.beta) - lgamma(p.alpha) + (p.alpha - 1) * Math.log(x) - p.beta * x),
    cdf: (x, p) => (x <= 0 ? 0 : gammp(p.alpha, p.beta * x)),
    quantile: (q, p) => gammpInv(p.alpha, q) / p.beta,
    mean: (p) => p.alpha / p.beta,
    variance: (p) => p.alpha / (p.beta * p.beta),
    sample: (p, rng) => {
      // Marsaglia-Tsang for shape >=1; else boost
      const a = p.alpha;
      const d = a < 1 ? a + 1 : a;
      const c = 1 / Math.sqrt(2 * d - 1);
      const x4 = d - 0.5;
      while (true) {
        const u = rng();
        const v = 1 + c * (rng() * 2 - 1);
        if (v <= 0) continue;
        const t = v * v * v;
        const x = u * v * v;
        const z = x * x;
        if (Math.log(u) < x4 + x - 0.5 * z + 0.5 * Math.log(t)) {
          const g = d * t / p.beta;
          return a < 1 ? g * Math.pow(rng(), 1 / a) : g;
        }
      }
    },
  },
  beta: {
    id: "beta",
    label: "Beta",
    discrete: false,
    params: [
      { name: "alpha", min: 0.5, max: 8, step: 0.1, init: 2 },
      { name: "beta", min: 0.5, max: 8, step: 0.1, init: 2 },
    ],
    domain: [0, 1],
    pdf: (x, p) => {
      if (x <= 0 || x >= 1) return 0;
      const lb = lgamma(p.alpha + p.beta) - lgamma(p.alpha) - lgamma(p.beta);
      return Math.exp(lb + (p.alpha - 1) * Math.log(x) + (p.beta - 1) * Math.log(1 - x));
    },
    cdf: (x, p) => {
      if (x <= 0) return 0;
      if (x >= 1) return 1;
      // regularized incomplete beta via numerical integration (simpson)
      return incompleteBeta(x, p.alpha, p.beta);
    },
    quantile: (q, p) => bisectInverse((x) => incompleteBeta(x, p.alpha, p.beta), q, 0, 1),
    mean: (p) => p.alpha / (p.alpha + p.beta),
    variance: (p) => {
      const s = p.alpha + p.beta;
      return (p.alpha * p.beta) / (s * s * (s + 1));
    },
    sample: (p, rng) => {
      // via two gammas
      const g = distSpecs.gamma.sample;
      const x = g({ alpha: p.alpha, beta: 1 }, rng);
      const y = g({ alpha: p.beta, beta: 1 }, rng);
      return x / (x + y);
    },
  },
  "chi-square": {
    id: "chi-square",
    label: "Chi-square",
    discrete: false,
    params: [{ name: "k", min: 1, max: 20, step: 1, init: 4 }],
    domain: [0, 30],
    pdf: (x, p) =>
      x <= 0
        ? 0
        : Math.exp(
            (p.k / 2) * Math.log(0.5) - lgamma(p.k / 2) + (p.k / 2 - 1) * Math.log(x) - x / 2,
          ),
    cdf: (x, p) => (x <= 0 ? 0 : gammp(p.k / 2, x / 2)),
    quantile: (q, p) => gammpInv(p.k / 2, q) * 2,
    mean: (p) => p.k,
    variance: (p) => 2 * p.k,
    sample: (p, rng) => distSpecs.gamma.sample({ alpha: p.k / 2, beta: 0.5 }, rng),
  },
  "student-t": {
    id: "student-t",
    label: "Student's t",
    discrete: false,
    params: [{ name: "nu", min: 1, max: 30, step: 1, init: 5 }],
    domain: [-5, 5],
    pdf: (x, p) => {
      const nu = p.nu;
      const lp =
        lgamma((nu + 1) / 2) - lgamma(nu / 2) - 0.5 * Math.log(nu * Math.PI);
      return Math.exp(lp - ((nu + 1) / 2) * Math.log(1 + (x * x) / nu));
    },
    cdf: (x, p) => {
      const nu = p.nu;
      const z = nu / (nu + x * x);
      const ib = 0.5 * incompleteBeta(z, nu / 2, 0.5);
      return x >= 0 ? 1 - 0.5 * ib : 0.5 * ib;
    },
    quantile: (q, p) => bisectInverse((x) => distSpecs["student-t"].cdf(x, p), q, -50, 50),
    mean: (p) => (p.nu > 1 ? 0 : NaN),
    variance: (p) => (p.nu > 2 ? p.nu / (p.nu - 2) : NaN),
    sample: (p, rng) => {
      const z = distSpecs.normal.sample({ mu: 0, sigma: 1 }, rng);
      const c = distSpecs["chi-square"].sample({ k: p.nu }, rng);
      return z / Math.sqrt(c / p.nu);
    },
  },
  lognormal: {
    id: "lognormal",
    label: "Lognormal",
    discrete: false,
    params: [
      { name: "mu", min: -2, max: 2, step: 0.1, init: 0 },
      { name: "sigma", min: 0.1, max: 1.5, step: 0.05, init: 0.5 },
    ],
    domain: [0, 6],
    pdf: (x, p) => {
      if (x <= 0) return 0;
      const z = (Math.log(x) - p.mu) / p.sigma;
      return Math.exp(-0.5 * z * z) / (x * p.sigma * Math.sqrt(2 * Math.PI));
    },
    cdf: (x, p) =>
      x <= 0 ? 0 : normCdf(Math.log(x), p.mu, p.sigma),
    quantile: (q, p) => Math.exp(p.mu + p.sigma * normInv(q)),
    mean: (p) => Math.exp(p.mu + 0.5 * p.sigma * p.sigma),
    variance: (p) => {
      const v = p.sigma * p.sigma;
      return (Math.exp(v) - 1) * Math.exp(2 * p.mu + v);
    },
    sample: (p, rng) =>
      Math.exp(p.mu + p.sigma * Math.sqrt(-2 * Math.log(rng())) * Math.cos(2 * Math.PI * rng())),
  },
  weibull: {
    id: "weibull",
    label: "Weibull",
    discrete: false,
    params: [
      { name: "lambda", min: 0.5, max: 4, step: 0.1, init: 1 },
      { name: "k", min: 0.5, max: 5, step: 0.1, init: 1.5 },
    ],
    domain: [0, 6],
    pdf: (x, p) => {
      if (x < 0) return 0;
      if (x === 0) return p.k === 1 ? 1 / p.lambda : 0;
      return (p.k / p.lambda) * Math.pow(x / p.lambda, p.k - 1) * Math.exp(-Math.pow(x / p.lambda, p.k));
    },
    cdf: (x, p) => (x < 0 ? 0 : 1 - Math.exp(-Math.pow(x / p.lambda, p.k))),
    quantile: (q, p) => p.lambda * Math.pow(-Math.log(1 - q), 1 / p.k),
    mean: (p) => p.lambda * Math.exp(lgamma(1 + 1 / p.k)),
    variance: (p) =>
      p.lambda * p.lambda * (Math.exp(lgamma(1 + 2 / p.k)) - Math.exp(2 * lgamma(1 + 1 / p.k))),
    sample: (p, rng) => p.lambda * Math.pow(-Math.log(1 - rng()), 1 / p.k),
  },
  rayleigh: {
    id: "rayleigh",
    label: "Rayleigh",
    discrete: false,
    params: [{ name: "sigma", min: 0.2, max: 3, step: 0.1, init: 1 }],
    domain: [0, 6],
    pdf: (x, p) =>
      x <= 0 ? 0 : (x / (p.sigma * p.sigma)) * Math.exp(-(x * x) / (2 * p.sigma * p.sigma)),
    cdf: (x, p) => (x <= 0 ? 0 : 1 - Math.exp(-(x * x) / (2 * p.sigma * p.sigma))),
    quantile: (q, p) => p.sigma * Math.sqrt(-2 * Math.log(1 - q)),
    mean: (p) => p.sigma * Math.sqrt(Math.PI / 2),
    variance: (p) => ((4 - Math.PI) / 2) * p.sigma * p.sigma,
    sample: (p, rng) => p.sigma * Math.sqrt(-2 * Math.log(rng())),
  },
  cauchy: {
    id: "cauchy",
    label: "Cauchy",
    discrete: false,
    params: [
      { name: "x0", min: -2, max: 2, step: 0.1, init: 0 },
      { name: "gamma", min: 0.2, max: 3, step: 0.1, init: 1 },
    ],
    domain: [-6, 6],
    pdf: (x, p) =>
      1 / (Math.PI * p.gamma * (1 + ((x - p.x0) / p.gamma) ** 2)),
    cdf: (x, p) => 0.5 + Math.atan((x - p.x0) / p.gamma) / Math.PI,
    quantile: (q, p) => p.x0 + p.gamma * Math.tan(Math.PI * (q - 0.5)),
    mean: () => NaN,
    variance: () => NaN,
    sample: (p, rng) => p.x0 + p.gamma * Math.tan(Math.PI * (rng() - 0.5)),
  },
  laplace: {
    id: "laplace",
    label: "Laplace",
    discrete: false,
    params: [
      { name: "mu", min: -3, max: 3, step: 0.1, init: 0 },
      { name: "b", min: 0.2, max: 3, step: 0.1, init: 1 },
    ],
    domain: [-6, 6],
    pdf: (x, p) => (1 / (2 * p.b)) * Math.exp(-Math.abs(x - p.mu) / p.b),
    cdf: (x, p) => {
      if (x < p.mu) return 0.5 * Math.exp((x - p.mu) / p.b);
      return 1 - 0.5 * Math.exp(-(x - p.mu) / p.b);
    },
    quantile: (q, p) =>
      q < 0.5 ? p.mu + p.b * Math.log(2 * q) : p.mu - p.b * Math.log(2 - 2 * q),
    mean: (p) => p.mu,
    variance: (p) => 2 * p.b * p.b,
    sample: (p, rng) => {
      const u = rng() - 0.5;
      return p.mu - p.b * Math.sign(u) * Math.log(1 - 2 * Math.abs(u));
    },
  },
  logistic: {
    id: "logistic",
    label: "Logistic",
    discrete: false,
    params: [
      { name: "mu", min: -3, max: 3, step: 0.1, init: 0 },
      { name: "s", min: 0.2, max: 3, step: 0.1, init: 1 },
    ],
    domain: [-6, 6],
    pdf: (x, p) => {
      const e = Math.exp(-(x - p.mu) / p.s);
      return e / (p.s * (1 + e) * (1 + e));
    },
    cdf: (x, p) => 1 / (1 + Math.exp(-(x - p.mu) / p.s)),
    quantile: (q, p) => p.mu + p.s * Math.log(q / (1 - q)),
    mean: (p) => p.mu,
    variance: (p) => (p.s * p.s * Math.PI * Math.PI) / 3,
    sample: (p, rng) => p.mu + p.s * Math.log(rng() / (1 - rng())),
  },
  pareto: {
    id: "pareto",
    label: "Pareto",
    discrete: false,
    params: [
      { name: "xm", min: 0.5, max: 3, step: 0.1, init: 1 },
      { name: "alpha", min: 0.5, max: 6, step: 0.1, init: 2 },
    ],
    domain: [0, 8],
    pdf: (x, p) =>
      x < p.xm ? 0 : (p.alpha * Math.pow(p.xm, p.alpha)) / Math.pow(x, p.alpha + 1),
    cdf: (x, p) => (x < p.xm ? 0 : 1 - Math.pow(p.xm / x, p.alpha)),
    quantile: (q, p) => p.xm / Math.pow(1 - q, 1 / p.alpha),
    mean: (p) => (p.alpha > 1 ? (p.alpha * p.xm) / (p.alpha - 1) : NaN),
    variance: (p) =>
      p.alpha > 2
        ? (p.xm * p.xm * p.alpha) / ((p.alpha - 1) ** 2 * (p.alpha - 2))
        : NaN,
    sample: (p, rng) => p.xm / Math.pow(rng(), 1 / p.alpha),
  },
  // ---- discrete ----
  poisson: {
    id: "poisson",
    label: "Poisson",
    discrete: true,
    params: [{ name: "lambda", min: 0.5, max: 20, step: 0.5, init: 4 }],
    domain: [0, 30],
    pdf: (x, p) => {
      const k = Math.round(x);
      if (k < 0) return 0;
      return Math.exp(k * Math.log(p.lambda) - p.lambda - logFact(k));
    },
    cdf: (x, p) => {
      const k = Math.floor(x);
      if (k < 0) return 0;
      let s = 0;
      for (let i = 0; i <= k; i++) s += Math.exp(i * Math.log(p.lambda) - p.lambda - logFact(i));
      return Math.min(1, s);
    },
    quantile: (q, p) => bisectInverse((x) => distSpecs.poisson.cdf(x, p), q, 0, 1000),
    mean: (p) => p.lambda,
    variance: (p) => p.lambda,
    sample: (p, rng) => {
      // Knuth
      const L = Math.exp(-p.lambda);
      let k = 0;
      let prod = 1;
      do {
        k++;
        prod *= rng();
      } while (prod > L);
      return k - 1;
    },
  },
  binomial: {
    id: "binomial",
    label: "Binomial",
    discrete: true,
    params: [
      { name: "n", min: 1, max: 50, step: 1, init: 20 },
      { name: "p", min: 0.01, max: 0.99, step: 0.01, init: 0.3 },
    ],
    domain: [0, 50],
    pdf: (x, p) => {
      const k = Math.round(x);
      if (k < 0 || k > p.n) return 0;
      return Math.exp(logBinom(p.n, k) + k * Math.log(p.p) + (p.n - k) * Math.log(1 - p.p));
    },
    cdf: (x, p) => {
      const k = Math.floor(x);
      if (k < 0) return 0;
      if (k >= p.n) return 1;
      let s = 0;
      for (let i = 0; i <= k; i++)
        s += Math.exp(logBinom(p.n, i) + i * Math.log(p.p) + (p.n - i) * Math.log(1 - p.p));
      return s;
    },
    quantile: (q, p) => bisectInverse((x) => distSpecs.binomial.cdf(x, p), q, 0, p.n),
    mean: (p) => p.n * p.p,
    variance: (p) => p.n * p.p * (1 - p.p),
    sample: (p, rng) => {
      let k = 0;
      for (let i = 0; i < p.n; i++) if (rng() < p.p) k++;
      return k;
    },
  },
  geometric: {
    id: "geometric",
    label: "Geometric",
    discrete: true,
    params: [{ name: "p", min: 0.05, max: 0.95, step: 0.01, init: 0.3 }],
    domain: [0, 30],
    pdf: (x, p) => {
      const k = Math.round(x);
      if (k < 1) return 0;
      return Math.pow(1 - p.p, k - 1) * p.p;
    },
    cdf: (x, p) => {
      const k = Math.floor(x);
      if (k < 1) return 0;
      return 1 - Math.pow(1 - p.p, k);
    },
    quantile: (q, p) => Math.ceil(Math.log(1 - q) / Math.log(1 - p.p)),
    mean: (p) => 1 / p.p,
    variance: (p) => (1 - p.p) / (p.p * p.p),
    sample: (p, rng) => Math.ceil(Math.log(1 - rng()) / Math.log(1 - p.p)),
  },
  "negative-binomial": {
    id: "negative-binomial",
    label: "Negative Binomial",
    discrete: true,
    params: [
      { name: "r", min: 1, max: 15, step: 1, init: 5 },
      { name: "p", min: 0.05, max: 0.95, step: 0.01, init: 0.5 },
    ],
    domain: [0, 60],
    pdf: (x, p) => {
      const k = Math.round(x);
      if (k < p.r) return 0;
      return Math.exp(
        logBinom(k - 1, p.r - 1) + p.r * Math.log(p.p) + (k - p.r) * Math.log(1 - p.p),
      );
    },
    cdf: (x, p) => {
      const k = Math.floor(x);
      if (k < p.r) return 0;
      let s = 0;
      for (let i = p.r; i <= k; i++)
        s += Math.exp(logBinom(i - 1, p.r - 1) + p.r * Math.log(p.p) + (i - p.r) * Math.log(1 - p.p));
      return s;
    },
    quantile: (q, p) => bisectInverse((x) => distSpecs["negative-binomial"].cdf(x, p), q, 0, 1000),
    mean: (p) => p.r / p.p,
    variance: (p) => (p.r * (1 - p.p)) / (p.p * p.p),
    sample: (p, rng) => {
      let k = 0;
      let succ = 0;
      while (succ < p.r) {
        k++;
        if (rng() < p.p) succ++;
      }
      return k;
    },
  },
  hypergeometric: {
    id: "hypergeometric",
    label: "Hypergeometric",
    discrete: true,
    params: [
      { name: "N", min: 10, max: 100, step: 5, init: 50 },
      { name: "K", min: 1, max: 50, step: 1, init: 20 },
      { name: "n", min: 1, max: 30, step: 1, init: 10 },
    ],
    domain: [0, 30],
    pdf: (x, p) => {
      const k = Math.round(x);
      const lo = Math.max(0, p.n + p.K - p.N);
      const hi = Math.min(p.K, p.n);
      if (k < lo || k > hi) return 0;
      return (
        (binom(p.K, k) * binom(p.N - p.K, p.n - k)) / binom(p.N, p.n)
      );
    },
    cdf: (x, p) => {
      const k = Math.floor(x);
      const lo = Math.max(0, p.n + p.K - p.N);
      let s = 0;
      for (let i = lo; i <= k; i++) s += distSpecs.hypergeometric.pdf(i, p);
      return s;
    },
    quantile: (q, p) => bisectInverse((x) => distSpecs.hypergeometric.cdf(x, p), q, 0, p.n),
    mean: (p) => (p.n * p.K) / p.N,
    variance: (p) => {
      const r = p.K / p.N;
      return p.n * r * (1 - r) * ((p.N - p.n) / (p.N - 1));
    },
    sample: (p, rng) => {
      let k = p.K;
      let rem = p.N;
      let succ = 0;
      for (let i = 0; i < p.n; i++) {
        if (rng() < k / rem) {
          succ++;
          k--;
        }
        rem--;
      }
      return succ;
    },
  },
  "discrete-uniform": {
    id: "discrete-uniform",
    label: "Discrete Uniform",
    discrete: true,
    params: [
      { name: "a", min: 0, max: 5, step: 1, init: 1 },
      { name: "b", min: 5, max: 30, step: 1, init: 10 },
    ],
    domain: [0, 30],
    pdf: (x, p) => {
      const k = Math.round(x);
      if (k < p.a || k > p.b) return 0;
      return 1 / (p.b - p.a + 1);
    },
    cdf: (x, p) => {
      const k = Math.floor(x);
      if (k < p.a) return 0;
      if (k > p.b) return 1;
      return (k - p.a + 1) / (p.b - p.a + 1);
    },
    quantile: (q, p) => p.a + Math.floor(q * (p.b - p.a + 1)),
    mean: (p) => (p.a + p.b) / 2,
    variance: (p) => ((p.b - p.a + 1) ** 2 - 1) / 12,
    sample: (p, rng) => p.a + Math.floor(rng() * (p.b - p.a + 1)),
  },
  triangular: {
    id: "triangular",
    label: "Triangular",
    discrete: false,
    params: [
      { name: "a", min: -3, max: 0, step: 0.1, init: -1 },
      { name: "c", min: 0, max: 3, step: 0.1, init: 1 },
      { name: "b", min: 1, max: 6, step: 0.1, init: 3 },
    ],
    domain: [-3, 6],
    pdf: (x, p) => {
      if (x < p.a || x > p.b) return 0;
      if (x < p.c)
        return (2 * (x - p.a)) / ((p.b - p.a) * (p.c - p.a));
      if (x > p.c)
        return (2 * (p.b - x)) / ((p.b - p.a) * (p.b - p.c));
      return 2 / (p.b - p.a);
    },
    cdf: (x, p) => {
      if (x <= p.a) return 0;
      if (x >= p.b) return 1;
      if (x <= p.c)
        return ((x - p.a) ** 2) / ((p.b - p.a) * (p.c - p.a));
      return 1 - ((p.b - x) ** 2) / ((p.b - p.a) * (p.b - p.c));
    },
    quantile: (q, p) => {
      const fc = (p.c - p.a) / (p.b - p.a);
      if (q < fc) return p.a + Math.sqrt(q * (p.b - p.a) * (p.c - p.a));
      return p.b - Math.sqrt((1 - q) * (p.b - p.a) * (p.b - p.c));
    },
    mean: (p) => (p.a + p.c + p.b) / 3,
    variance: (p) => {
      const a = p.a, b = p.b, c = p.c;
      return (a * a + b * b + c * c - a * b - a * c - b * c) / 18;
    },
    sample: (p, rng) => distSpecs.triangular.quantile(rng(), p),
  },
};

/** Regularized incomplete beta function I_x(a,b) via continued fraction. */
export function incompleteBeta(x: number, a: number, b: number): number {
  if (x <= 0) return 0;
  if (x >= 1) return 1;
  const lbeta = lgamma(a) + lgamma(b) - lgamma(a + b);
  const front =
    Math.exp(a * Math.log(x) + b * Math.log(1 - x) - lbeta) / a;
  // continued fraction (Lentz)
  let qab = a + b;
  let qap = a + 1;
  let qam = a - 1;
  let c = 1;
  let d = 1 - (qab * x) / qap;
  if (Math.abs(d) < 1e-30) d = 1e-30;
  d = 1 / d;
  let h = d;
  for (let m = 1; m <= 200; m++) {
    const m2 = 2 * m;
    const aa = (m * (b - m) * x) / ((qam + m2) * (a + m2));
    d = 1 + aa * d;
    if (Math.abs(d) < 1e-30) d = 1e-30;
    c = 1 + aa / c;
    if (Math.abs(c) < 1e-30) c = 1e-30;
    d = 1 / d;
    h *= d * c;
    const aa2 = -((a + m) * (qab + m) * x) / ((a + m2) * (qap + m2));
    d = 1 + aa2 * d;
    if (Math.abs(d) < 1e-30) d = 1e-30;
    c = 1 + aa2 / c;
    if (Math.abs(c) < 1e-30) c = 1e-30;
    d = 1 / d;
    const del = d * c;
    h *= del;
    if (Math.abs(del - 1) < 1e-12) break;
  }
  return front * h;
}

/** Compute central moments for an array of samples. */
export function sampleMoments(xs: number[]) {
  const n = xs.length;
  const mean = xs.reduce((a, b) => a + b, 0) / n;
  let m2 = 0, m3 = 0, m4 = 0;
  for (const x of xs) {
    const d = x - mean;
    m2 += d * d;
    m3 += d * d * d;
    m4 += d * d * d * d;
  }
  m2 /= n; m3 /= n; m4 /= n;
  const variance = m2;
  const sd = Math.sqrt(variance);
  const skewness = sd > 0 ? m3 / (sd * sd * sd) : 0;
  const kurtosis = variance > 0 ? m4 / (variance * variance) - 3 : 0;
  return { mean, variance, sd, skewness, kurtosis };
}

/** Sort a copy. */
export function sorted(xs: number[]): number[] {
  return [...xs].sort((a, b) => a - b);
}
