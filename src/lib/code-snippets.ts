import type { Distribution } from "@/data/distributions";

/**
 * Generate idiomatic scipy.stats Python and base-R code snippets
 * for a distribution, using its parameter symbols.
 */
export function pythonCode(d: Distribution): string {
  const p = d.params.map((x) => x.sym).join(", ");
  const name = scipyName(d.id);
  const dist = `${name}`;
  return [
    `from scipy import stats`,
    ``,
    `# ${d.name}  (${d.lawLabel})`,
    `${dist} = stats.${dist}(${p})`,
    ``,
    `# probability / density at x`,
    `x = ${defaultX(d)}`,
    `pdf = ${dist}.pdf(x)   # or .pmf(x) for discrete`,
    ``,
    `# cumulative probability  P(X <= x)`,
    `cdf = ${dist}.cdf(x)`,
    ``,
    `# quantile (inverse CDF)`,
    `q  = ${dist}.ppf(0.95)`,
    ``,
    `# draw 1000 random samples`,
    `samples = ${dist}.rvs(size=1000, random_state=42)`,
  ].join("\n");
}

export function rCode(d: Distribution): string {
  const r = rName(d.id);
  const p = d.params.map((x) => x.sym).join(", ");
  return [
    `# ${d.name}  (${d.lawLabel})`,
    `# density / mass, CDF, quantile, random sample`,
    `x <- ${defaultX(d)}`,
    `d <- d${r}(x, ${p})   # density / mass`,
    `p <- p${r}(x, ${p})   # CDF  P(X <= x)`,
    `q <- q${r}(0.95, ${p})  # quantile`,
    `s <- r${r}(1000, ${p})  # 1000 samples`,
  ].join("\n");
}

function scipyName(id: string): string {
  return (
    {
      bernoulli: "bernoulli",
      binomial: "binom",
      geometric: "geom",
      "negative-binomial": "nbinom",
      poisson: "poisson",
      hypergeometric: "hypergeom",
      "discrete-uniform": "randint",
      multinomial: "multinomial",
      "beta-binomial": "betabinom",
      "continuous-uniform": "uniform",
      normal: "norm",
      exponential: "expon",
      gamma: "gamma",
      beta: "beta",
      "chi-square": "chi2",
      "student-t": "t",
      "f-distribution": "f",
      lognormal: "lognorm",
      weibull: "weibull_min",
      rayleigh: "rayleigh",
      cauchy: "cauchy",
      erlang: "gamma",
      laplace: "laplace",
      logistic: "logistic",
      pareto: "pareto",
      dirichlet: "dirichlet",
      "multivariate-normal": "multivariate_normal",
      "folded-normal": "foldnorm",
      "half-normal": "halfnorm",
      "maxwell-boltzmann": "maxwell",
      "inverse-gamma": "invgamma",
      "inverse-gaussian": "invgauss",
      "beta-prime": "betaprime",
      levy: "levy",
      gumbel: "gumbel_r",
      gev: "genextreme",
      frechet: "frechet_r",
      zipf: "zipf",
      benford: "benford", // not in scipy; placeholder
      skellam: "skellam",
      triangular: "triang",
      "truncated-normal": "truncnorm",
      "skew-normal": "skewnorm",
      rademacher: "bernoulli",
    } as Record<string, string>
  )[id] ?? id.replace(/-/g, "_");
}

function rName(id: string): string {
  return (
    {
      bernoulli: "binom", // R: dbinom(x,1,p)
      binomial: "binom",
      geometric: "geom",
      "negative-binomial": "nbinom",
      poisson: "pois",
      hypergeometric: "hyper",
      "discrete-uniform": "unif",
      multinomial: "multinom",
      "beta-binomial": "bbinom",
      "continuous-uniform": "unif",
      normal: "norm",
      exponential: "exp",
      gamma: "gamma",
      beta: "beta",
      "chi-square": "chisq",
      "student-t": "t",
      "f-distribution": "f",
      lognormal: "lnorm",
      weibull: "weibull",
      rayleigh: "rayleigh",
      cauchy: "cauchy",
      erlang: "gamma",
      laplace: "laplace",
      logistic: "logis",
      pareto: "pareto",
      dirichlet: "dirichlet",
      "multivariate-normal": "mvrnorm",
      "folded-normal": "norm",
      "half-normal": "norm",
      "maxwell-boltzmann": "maxwell",
      "inverse-gamma": "invgamma",
      "inverse-gaussian": "invgauss",
      "beta-prime": "betaprime",
      levy: "levy",
      gumbel: "gumbel",
      gev: "gev",
      frechet: "frechet",
      zipf: "zipf",
      benford: "benford",
      skellam: "skellam",
      triangular: "triang",
      "truncated-normal": "truncnorm",
      "skew-normal": "sn",
      rademacher: "binom",
    } as Record<string, string>
  )[id] ?? id.replace(/-/g, "_");
}

function defaultX(d: Distribution): string {
  if (d.category === "discrete") return "3";
  if (d.id === "beta" || d.id === "dirichlet") return "0.5";
  return "1.0";
}
