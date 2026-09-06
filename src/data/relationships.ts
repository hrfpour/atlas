export type RelationshipType =
  | "sum"
  | "limit"
  | "special-case"
  | "transformation"
  | "mixture"
  | "process"
  | "ratio"
  | "generalization";

export type Bi = { fa: string; en: string };

export type Relationship = {
  id: string;
  from: string;
  to: string;
  type: RelationshipType;
  formula: string;
  desc: Bi;
};

export const relationshipTypeMeta: Record<
  RelationshipType,
  { fa: string; en: string; color: string; short: string }
> = {
  sum: { fa: "مجموع (پیچش)", en: "Sum / convolution", color: "var(--accent-emerald)", short: "Σ" },
  limit: { fa: "حد", en: "Limit", color: "var(--accent-amber)", short: "→" },
  "special-case": { fa: "حالت خاص", en: "Special case", color: "var(--accent-rose)", short: "⊂" },
  transformation: { fa: "تبدیل", en: "Transformation", color: "var(--accent-teal)", short: "ƒ" },
  mixture: { fa: "مخلوط", en: "Mixture", color: "var(--accent-violet)", short: "∫" },
  process: { fa: "فرآیند", en: "Process", color: "var(--accent-slate)", short: "proc" },
  ratio: { fa: "نسبت", en: "Ratio", color: "var(--accent-rose)", short: "÷" },
  generalization: { fa: "تعمیم", en: "Generalization", color: "var(--accent-violet)", short: "k" },
};

export const relationships: Relationship[] = [
  // ---- Bernoulli family ----
  {
    id: "bern-bin",
    from: "bernoulli",
    to: "binomial",
    type: "sum",
    formula: "X=\\sum_{i=1}^{n}B_i,\\ B_i\\overset{iid}{\\sim}\\mathrm{Bern}(p)\\;\\Rightarrow\\;X\\sim\\mathrm{Bin}(n,p)",
    desc: { fa: "مجموع n متغیر برنولی مستقل، توزیع دو جمله‌ای می‌دهد.", en: "The sum of n independent Bernoulli variables yields a Binomial." },
  },
  {
    id: "bin-multinomial",
    from: "binomial",
    to: "multinomial",
    type: "generalization",
    formula: "k=2\\;\\Rightarrow\\;\\mathrm{Multinomial}(n;p,1-p)\\equiv\\mathrm{Bin}(n,p)",
    desc: { fa: "چندجمله‌ای با k=2 همان دو جمله‌ای است؛ تعمیم به چند رده.", en: "Multinomial with k=2 is the Binomial; the multiclass generalization." },
  },
  {
    id: "bin-poisson",
    from: "binomial",
    to: "poisson",
    type: "limit",
    formula: "n\\to\\infty,\\ p\\to 0,\\ np\\to\\lambda\\;\\Rightarrow\\;\\mathrm{Bin}(n,p)\\to\\mathrm{Pois}(\\lambda)",
    desc: { fa: "حد پواسون: تعداد زیادی آزمایش با احتمال موفقیت بسیار کم.", en: "Poisson limit: many trials with very small success probability." },
  },
  {
    id: "bin-normal",
    from: "binomial",
    to: "normal",
    type: "limit",
    formula: "n\\to\\infty\\;\\Rightarrow\\;\\frac{X-np}{\\sqrt{np(1-p)}}\\xrightarrow{d}N(0,1)",
    desc: { fa: "قضیه دموآور-لاپلاس؛ نمونه‌ی اولیه قانون مرکز (CLT).", en: "De Moivre–Laplace theorem; an early instance of the CLT." },
  },
  {
    id: "bin-betabinomial",
    from: "binomial",
    to: "beta-binomial",
    type: "mixture",
    formula: "X\\mid P=p\\sim\\mathrm{Bin}(n,p),\\ p\\sim\\mathrm{Beta}(\\alpha,\\beta)\\;\\Rightarrow\\;X\\sim\\mathrm{BetaBin}",
    desc: { fa: "مخلوط‌سازی p با پیشین بتا؛ واریانس بزرگ‌تر (بیش‌پراکندگی).", en: "Mixing p over a Beta prior inflates the variance (overdispersion)." },
  },
  {
    id: "bern-rademacher",
    from: "bernoulli",
    to: "rademacher",
    type: "transformation",
    formula: "Y=2X-1,\\ X\\sim\\mathrm{Bern}(\\tfrac12)\\;\\Rightarrow\\;Y\\sim\\mathrm{Rademacher}",
    desc: { fa: "تبدیل خطی برنولی به مقادیر ±۱، رادماخر می‌دهد.", en: "An affine map of a fair Bernoulli onto ±1 gives a Rademacher variable." },
  },

  // ---- Geometric family ----
  {
    id: "geo-negbin",
    from: "geometric",
    to: "negative-binomial",
    type: "sum",
    formula: "X=\\sum_{i=1}^{r}G_i,\\ G_i\\overset{iid}{\\sim}\\mathrm{Geom}(p)\\;\\Rightarrow\\;X\\sim\\mathrm{NegBin}(r,p)",
    desc: { fa: "مجموع r هندسی، دو جمله‌ای منفی می‌دهد.", en: "Sum of r geometrics gives a Negative Binomial." },
  },
  {
    id: "geo-exp",
    from: "geometric",
    to: "exponential",
    type: "limit",
    formula: "\\lfloor Y/h\\rfloor,\\ Y\\sim\\mathrm{Exp}(\\lambda)\\;\\approx\\;\\mathrm{Geom}(p),\\ p=1-e^{-\\lambda h}",
    desc: { fa: "گسسته‌سازی نمایی روی شبکه زمان h؛ نظیره پیوسته هندسی.", en: "Discretizing an exponential on a time grid of step h recovers the geometric." },
  },
  {
    id: "negbin-poisson",
    from: "negative-binomial",
    to: "poisson",
    type: "limit",
    formula: "r\\to\\infty,\\ p\\to 1,\\ \\frac{r(1-p)}{p}\\to\\lambda\\;\\Rightarrow\\;\\mathrm{NegBin}\\to\\mathrm{Pois}(\\lambda)",
    desc: { fa: "حد پواسون برای دو جمله‌ای منفی؛ گامای-پواسون هم‌خانواده.", en: "Poisson limit of the Negative Binomial; the Gamma–Poisson is the same family." },
  },

  // ---- Poisson process ----
  {
    id: "poisson-exp",
    from: "poisson",
    to: "exponential",
    type: "process",
    formula: "N(t)\\sim\\mathrm{Pois}(\\lambda t)\\;\\Rightarrow\\;T_1\\sim\\mathrm{Exp}(\\lambda)",
    desc: { fa: "در فرآیند پواسون، فاصله میان رویدادها نمایی است.", en: "In a Poisson process, inter-arrival times are exponential." },
  },
  {
    id: "poisson-erlang",
    from: "poisson",
    to: "erlang",
    type: "process",
    formula: "T_k=T_1+\\dots+T_k,\\ T_i\\sim\\mathrm{Exp}(\\lambda)\\;\\Rightarrow\\;T_k\\sim\\mathrm{Erlang}(k,\\lambda)",
    desc: { fa: "زمان انتظار تا kامین رویداد پواسون، ارلانگ است.", en: "The waiting time to the k-th Poisson event is Erlang." },
  },
  {
    id: "poisson-normal",
    from: "poisson",
    to: "normal",
    type: "limit",
    formula: "\\lambda\\to\\infty\\;\\Rightarrow\\;\\frac{X-\\lambda}{\\sqrt{\\lambda}}\\xrightarrow{d}N(0,1)",
    desc: { fa: "برای نرخ بزرگ، پواسون به نرمال میل می‌کند (CLT).", en: "For large rate the Poisson approaches the Normal (CLT)." },
  },
  {
    id: "poisson-skellam",
    from: "poisson",
    to: "skellam",
    type: "transformation",
    formula: "Y=X_1-X_2,\\ X_i\\sim\\mathrm{Pois}(\\lambda_i)\\;\\Rightarrow\\;Y\\sim\\mathrm{Skellam}(\\lambda_1,\\lambda_2)",
    desc: { fa: "تفاضل دو پواسون مستقل، اسکلام می‌دهد.", en: "The difference of two independent Poissons is Skellam." },
  },

  // ---- Exponential / Gamma hub ----
  {
    id: "exp-gamma",
    from: "exponential",
    to: "gamma",
    type: "sum",
    formula: "X=\\sum_{i=1}^{\\alpha}Y_i,\\ Y_i\\overset{iid}{\\sim}\\mathrm{Exp}(\\beta)\\;\\Rightarrow\\;X\\sim\\mathrm{Gamma}(\\alpha,\\beta)",
    desc: { fa: "مجموع α متغیر نمایی مستقل، گامای با شکل α.", en: "Sum of α independent exponentials is Gamma(α, β)." },
  },
  {
    id: "gamma-exp",
    from: "gamma",
    to: "exponential",
    type: "special-case",
    formula: "\\mathrm{Gamma}(1,\\beta)\\equiv\\mathrm{Exp}(\\beta)",
    desc: { fa: "گاما با α=1 به نمایی تقلیل می‌یابد.", en: "Gamma with α=1 reduces to the Exponential." },
  },
  {
    id: "gamma-chisq",
    from: "gamma",
    to: "chi-square",
    type: "special-case",
    formula: "\\mathrm{Gamma}\\!\\left(\\tfrac{k}{2},\\tfrac{1}{2}\\right)\\equiv\\chi^{2}_{k}",
    desc: { fa: "کای-دو همان گاما با α=k/2 و نرخ β=1/2 (= مقیاس 2).", en: "Chi-square is Gamma with α=k/2 and rate β=1/2 (scale 2)." },
  },
  {
    id: "gamma-erlang",
    from: "gamma",
    to: "erlang",
    type: "special-case",
    formula: "\\mathrm{Gamma}(k,\\lambda),\\ k\\in\\mathbb{N}\\;\\equiv\\;\\mathrm{Erlang}(k,\\lambda)",
    desc: { fa: "ارلانگ گامایی است که شکل آن عدد صحیح باشد.", en: "Erlang is a Gamma whose shape is a positive integer." },
  },
  {
    id: "gamma-beta",
    from: "gamma",
    to: "beta",
    type: "transformation",
    formula: "X=\\frac{G_1}{G_1+G_2},\\ G_i\\sim\\mathrm{Gamma}\\;\\Rightarrow\\;X\\sim\\mathrm{Beta}",
    desc: { fa: "نسبت دو گاما بر مجموعشان، بتا می‌سازد.", en: "The ratio of two Gammas over their sum yields a Beta." },
  },
  {
    id: "gamma-dirichlet",
    from: "gamma",
    to: "dirichlet",
    type: "generalization",
    formula: "X_i=\\frac{G_i}{\\sum_j G_j},\\ G_i\\sim\\mathrm{Gamma}(\\alpha_i,1)\\;\\Rightarrow\\;\\mathbf{X}\\sim\\mathrm{Dir}",
    desc: { fa: "نرمال‌سازی k متغیر گامای مستقل، دیریکله می‌دهد.", en: "Normalizing k independent Gammas gives a Dirichlet." },
  },
  {
    id: "gamma-invgamma",
    from: "gamma",
    to: "inverse-gamma",
    type: "transformation",
    formula: "Y=1/X,\\ X\\sim\\mathrm{Gamma}(\\alpha,\\beta)\\;\\Rightarrow\\;Y\\sim\\mathrm{InvGamma}(\\alpha,\\beta)",
    desc: { fa: "معکوس یک گاما، وارون-گاما می‌دهد.", en: "The reciprocal of a Gamma is an Inverse-Gamma." },
  },
  {
    id: "gamma-levy",
    from: "gamma",
    to: "levy",
    type: "special-case",
    formula: "\\mathrm{Levy}(\\mu,c)\\equiv\\mathrm{InvGamma}\\!\\left(\\tfrac12,\\tfrac{c}{2}\\right)",
    desc: { fa: "لوی حالت خاص وارون-گاما است (با شکل ۱/۲).", en: "Lévy is an Inverse-Gamma with shape 1/2." },
  },
  {
    id: "exp-weibull",
    from: "exponential",
    to: "weibull",
    type: "transformation",
    formula: "X=Y^{1/k}/\\lambda^{1/k},\\ Y\\sim\\mathrm{Exp}(1)\\;\\Rightarrow\\;X\\sim\\mathrm{Weibull}",
    desc: { fa: "توان نمایی، وایبول می‌سازد؛ پایه روش تبدیل معکوس.", en: "Power-transforming an exponential builds a Weibull (inverse-transform method)." },
  },
  {
    id: "exp-laplace",
    from: "exponential",
    to: "laplace",
    type: "transformation",
    formula: "X=Y_1-Y_2,\\ Y_i\\overset{iid}{\\sim}\\mathrm{Exp}(1/b)\\;\\Rightarrow\\;X\\sim\\mathrm{Laplace}(0,b)",
    desc: { fa: "تفاضل دو نمایی مستقل، لاپلاس با اوج تیز.", en: "The difference of two exponentials gives a sharp-peaked Laplace." },
  },
  {
    id: "exp-pareto",
    from: "exponential",
    to: "pareto",
    type: "transformation",
    formula: "X=x_m\\,e^{Y},\\ Y\\sim\\mathrm{Exp}(\\alpha)\\;\\Rightarrow\\;X\\sim\\mathrm{Pareto}(x_m,\\alpha)",
    desc: { fa: "توان نمایی روی نمایی، پارتو (قانون توان) می‌دهد.", en: "Exponentiating an exponential yields a Pareto (power law)." },
  },
  {
    id: "pareto-exp",
    from: "pareto",
    to: "exponential",
    type: "transformation",
    formula: "\\ln\\!\\left(\\frac{X}{x_m}\\right)\\sim\\mathrm{Exp}(\\alpha)",
    desc: { fa: "لگاریتم پارتو، نمایی می‌شود؛ روشی برای برازش قانون توان.", en: "Logging a Pareto recovers an exponential; useful for fitting power laws." },
  },
  {
    id: "exp-gev",
    from: "exponential",
    to: "gev",
    type: "limit",
    formula: "\\text{block maxima of Exp}\\;\\Rightarrow\\;\\mathrm{GEV}(\\xi=0)\\sim\\mathrm{Gumbel}",
    desc: { fa: "ماکزیمم بلوک‌های نمایی، به گامبل (GEV با ξ=0) میل می‌کند.", en: "Block maxima of exponentials converge to the Gumbel (GEV with ξ=0)." },
  },

  // ---- Weibull hub ----
  {
    id: "weibull-exp",
    from: "weibull",
    to: "exponential",
    type: "special-case",
    formula: "\\mathrm{Weibull}(\\lambda,1)\\equiv\\mathrm{Exp}(1/\\lambda)",
    desc: { fa: "وایبول با k=1 به نمایی تقلیل می‌یابد.", en: "Weibull with k=1 reduces to the Exponential." },
  },
  {
    id: "weibull-rayleigh",
    from: "weibull",
    to: "rayleigh",
    type: "special-case",
    formula: "\\mathrm{Weibull}\\!\\left(\\sigma\\sqrt{2},\\,2\\right)\\equiv\\mathrm{Rayleigh}(\\sigma)",
    desc: { fa: "وایبول با k=2، ریلی است (با مقیاس مناسب).", en: "Weibull with k=2 is the Rayleigh (with rescaled λ)." },
  },
  {
    id: "weibull-gev",
    from: "weibull",
    to: "gev",
    type: "special-case",
    formula: "\\text{Weibull} \\equiv \\mathrm{GEV}(\\xi<0)\\ \\text{(reflected)}",
    desc: { fa: "وایبول معادل GEV با ξ<0 است (منعکس‌شده).", en: "The Weibull is the GEV with ξ<0 (reflected onto a finite upper bound)." },
  },

  // ---- Normal hub ----
  {
    id: "normal-chisq",
    from: "normal",
    to: "chi-square",
    type: "transformation",
    formula: "X=\\sum_{i=1}^{k}Z_i^{2},\\ Z_i\\overset{iid}{\\sim}N(0,1)\\;\\Rightarrow\\;X\\sim\\chi^{2}_{k}",
    desc: { fa: "مجموع مربع k نرمال استاندارد، کای-دو می‌سازد.", en: "Sum of k squared standard normals builds a Chi-square." },
  },
  {
    id: "normal-lognormal",
    from: "normal",
    to: "lognormal",
    type: "transformation",
    formula: "X=e^{Y},\\ Y\\sim N(\\mu,\\sigma^{2})\\;\\Rightarrow\\;X\\sim\\mathrm{Lognormal}",
    desc: { fa: "توان نمایی یک نرمال، لگاریتم-نرمال می‌دهد.", en: "Exponentiating a Normal gives a Lognormal." },
  },
  {
    id: "normal-t",
    from: "normal",
    to: "student-t",
    type: "ratio",
    formula: "T=\\frac{Z}{\\sqrt{V/\\nu}},\\ Z\\sim N(0,1),\\ V\\sim\\chi^{2}_{\\nu}\\;\\Rightarrow\\;T\\sim t_{\\nu}",
    desc: { fa: "نسبت نرمال به ریشه کای-دو، تی استیودنت می‌سازد.", en: "Ratio of a normal to a scaled chi-square root yields Student's t." },
  },
  {
    id: "normal-cauchy",
    from: "normal",
    to: "cauchy",
    type: "ratio",
    formula: "C=\\frac{Z_1}{Z_2},\\ Z_i\\overset{iid}{\\sim}N(0,1)\\;\\Rightarrow\\;C\\sim\\mathrm{Cauchy}(0,1)",
    desc: { fa: "نسبت دو نرمال استاندارد، کوشی با دم سنگین می‌دهد.", en: "Ratio of two standard normals gives the heavy-tailed Cauchy." },
  },
  {
    id: "normal-mvn",
    from: "normal",
    to: "multivariate-normal",
    type: "generalization",
    formula: "\\mathbf{X}\\sim\\mathcal{N}(\\boldsymbol{\\mu},\\Sigma)\\;\\Rightarrow\\;X_i\\sim N(\\mu_i,\\Sigma_{ii})",
    desc: { fa: "نرمال چندمتغیره تعمیم بُعدی نرمال است؛ هر مؤلفه حاشیه‌ای نرمال.", en: "The multivariate Normal generalizes to k dimensions; each margin is Normal." },
  },
  {
    id: "normal-rayleigh",
    from: "normal",
    to: "rayleigh",
    type: "transformation",
    formula: "R=\\sqrt{X^{2}+Y^{2}},\\ X,Y\\overset{iid}{\\sim}N(0,\\sigma^{2})\\;\\Rightarrow\\;R\\sim\\mathrm{Rayleigh}(\\sigma)",
    desc: { fa: "اندازه بردار با مؤلفه‌های نرمال، ریلی است.", en: "The norm of a 2D standard-normal vector is Rayleigh." },
  },
  {
    id: "normal-maxwell",
    from: "normal",
    to: "maxwell-boltzmann",
    type: "transformation",
    formula: "R=\\sqrt{X^{2}+Y^{2}+Z^{2}},\\ X_i\\overset{iid}{\\sim}N(0,\\sigma^{2})\\;\\Rightarrow\\;R\\sim\\mathrm{Maxwell}(\\sigma)",
    desc: { fa: "اندازه بردار سه‌بعدی نرمال، ماکسول-بولتزمن می‌دهد.", en: "The norm of a 3D standard-normal vector is Maxwell–Boltzmann." },
  },
  {
    id: "normal-halfnormal",
    from: "normal",
    to: "half-normal",
    type: "transformation",
    formula: "Y=|X|,\\ X\\sim N(0,\\sigma^{2})\\;\\Rightarrow\\;Y\\sim\\mathrm{HalfNormal}(\\sigma)",
    desc: { fa: "قدرمطلق یک نرمال، نیمه‌نرمال می‌دهد.", en: "The absolute value of a Normal is Half-Normal." },
  },
  {
    id: "halfnormal-folded",
    from: "half-normal",
    to: "folded-normal",
    type: "special-case",
    formula: "\\mathrm{HalfNormal}\\equiv\\mathrm{FoldedNormal}(\\mu=0,\\sigma^{2})",
    desc: { fa: "نیمه‌نرمال حالت خاص تا-نرمال در μ=0 است.", en: "The Half-Normal is the Folded-Normal at μ=0." },
  },
  {
    id: "normal-skewnormal",
    from: "normal",
    to: "skew-normal",
    type: "generalization",
    formula: "\\mathrm{SkewNormal}(0,1,0)\\equiv N(0,1)",
    desc: { fa: "اسکو-نرمال با پارامتر چولگی صفر همان نرمال است.", en: "Skew-Normal with zero skewness parameter reduces to the Normal." },
  },

  // ---- Derived from Normal/Chi-square ----
  {
    id: "chisq-normal",
    from: "chi-square",
    to: "normal",
    type: "limit",
    formula: "k\\to\\infty\\;\\Rightarrow\\;\\frac{\\chi^{2}_{k}-k}{\\sqrt{2k}}\\xrightarrow{d}N(0,1)",
    desc: { fa: "برای درجه آزادی بزرگ، کای-دو به نرمال نزدیک می‌شود (CLT).", en: "For large degrees of freedom, Chi-square approaches the Normal (CLT)." },
  },
  {
    id: "chisq-f",
    from: "chi-square",
    to: "f-distribution",
    type: "ratio",
    formula: "F=\\frac{U_1/d_1}{U_2/d_2},\\ U_i\\sim\\chi^{2}\\;\\Rightarrow\\;F\\sim F_{d_1,d_2}",
    desc: { fa: "نسبت دو کای-دو نرمال‌شده، توزیع اف می‌دهد.", en: "The ratio of two normalized Chi-squares gives the F distribution." },
  },
  {
    id: "chisq-betaprime",
    from: "chi-square",
    to: "beta-prime",
    type: "ratio",
    formula: "\\frac{\\chi^{2}_{\\nu_1}/\\nu_1}{\\chi^{2}_{\\nu_2}/\\nu_2}\\sim F\\Rightarrow\\ \\text{Beta-Prime}",
    desc: { fa: "توزیع اف با باز-پارامتری به بتا-پرایم نزدیک می‌شود.", en: "The F distribution reparameterizes to the Beta-Prime." },
  },
  {
    id: "t-cauchy",
    from: "student-t",
    to: "cauchy",
    type: "special-case",
    formula: "t_{1}\\equiv\\mathrm{Cauchy}(0,1)",
    desc: { fa: "تی با یک درجه آزادی همان کوشی استاندارد.", en: "Student's t with 1 degree of freedom is the standard Cauchy." },
  },
  {
    id: "t-normal",
    from: "student-t",
    to: "normal",
    type: "limit",
    formula: "\\nu\\to\\infty\\;\\Rightarrow\\;t_{\\nu}\\to N(0,1)",
    desc: { fa: "تی استیودنت با درجه آزادی بزرگ به نرمال میل می‌کند.", en: "Student's t approaches the Normal as degrees of freedom grow." },
  },
  {
    id: "t-f",
    from: "student-t",
    to: "f-distribution",
    type: "transformation",
    formula: "T\\sim t_{\\nu}\\;\\Rightarrow\\;T^{2}\\sim F_{1,\\nu}",
    desc: { fa: "مربع تی استیودنت، توزیع اف با (۱، ν) می‌دهد.", en: "Squaring a Student's t gives an F with (1, ν) degrees of freedom." },
  },

  // ---- Beta / Dirichlet ----
  {
    id: "beta-dirichlet",
    from: "beta",
    to: "dirichlet",
    type: "generalization",
    formula: "\\mathrm{Dirichlet}(\\alpha_1,\\alpha_2)\\equiv\\mathrm{Beta}(\\alpha_1,\\alpha_2)",
    desc: { fa: "دیریکله با k=2 همان بتا است؛ تعمیم به ساده‌کاش.", en: "Dirichlet with k=2 is the Beta; the simplex-valued generalization." },
  },
  {
    id: "beta-betaprime",
    from: "beta",
    to: "beta-prime",
    type: "transformation",
    formula: "Y=\\frac{X}{1-X},\\ X\\sim\\mathrm{Beta}(\\alpha,\\beta)\\;\\Rightarrow\\;Y\\sim\\mathrm{BetaPrime}",
    desc: { fa: "نسبت X/(1−X) از بتا، بتا-پرایم می‌دهد.", en: "The odds ratio X/(1−X) of a Beta gives a Beta-Prime." },
  },

  // ---- Uniform as universal generator ----
  {
    id: "unif-exp",
    from: "continuous-uniform",
    to: "exponential",
    type: "transformation",
    formula: "X=-\\frac{\\ln U}{\\lambda},\\ U\\sim\\mathrm{Unif}(0,1)\\;\\Rightarrow\\;X\\sim\\mathrm{Exp}(\\lambda)",
    desc: { fa: "روش تبدیل معکوس؛ پایه تولید اعداد تصادفی.", en: "Inverse-transform method; the basis of random number generation." },
  },
  {
    id: "unif-normal",
    from: "continuous-uniform",
    to: "normal",
    type: "transformation",
    formula: "Z=\\sqrt{-2\\ln U_1}\\cos(2\\pi U_2),\\ U_i\\sim\\mathrm{Unif}(0,1)\\;\\Rightarrow\\;Z\\sim N(0,1)",
    desc: { fa: "روش باکس-مولر: نرمال از دو یکنواخت.", en: "Box–Muller: a Normal from two uniforms." },
  },
  {
    id: "unif-logistic",
    from: "continuous-uniform",
    to: "logistic",
    type: "transformation",
    formula: "X=\\mu+s\\ln\\!\\frac{U}{1-U},\\ U\\sim\\mathrm{Unif}(0,1)\\;\\Rightarrow\\;X\\sim\\mathrm{Logistic}",
    desc: { fa: "تبدیل معکوس CDF لجستیک، لوژستیک می‌سازد.", en: "Inverting the logistic CDF builds a Logistic variable." },
  },
  {
    id: "unif-triangular",
    from: "continuous-uniform",
    to: "triangular",
    type: "transformation",
    formula: "X=F^{-1}(U),\\ U\\sim\\mathrm{Unif}(0,1)\\;\\Rightarrow\\;X\\sim\\mathrm{Triangular}",
    desc: { fa: "تبدیل معکوس CDF سه‌گوش، سه‌گوش می‌دهد.", en: "Inverting the Triangular CDF from a uniform yields a Triangular variable." },
  },

  // ---- Extreme value family ----
  {
    id: "gev-gumbel",
    from: "gev",
    to: "gumbel",
    type: "special-case",
    formula: "\\mathrm{GEV}(\\xi=0)\\equiv\\mathrm{Gumbel}",
    desc: { fa: "گامبل GEV با ξ=0 است.", en: "Gumbel is GEV with ξ=0." },
  },
  {
    id: "gev-frechet",
    from: "gev",
    to: "frechet",
    type: "special-case",
    formula: "\\mathrm{GEV}(\\xi>0)\\equiv\\mathrm{Frechet}",
    desc: { fa: "فرشت GEV با ξ>0 است.", en: "Fréchet is GEV with ξ>0." },
  },

  // ---- Inverse Gaussian / Levy ----
  {
    id: "invgauss-normal",
    from: "inverse-gaussian",
    to: "normal",
    type: "limit",
    formula: "\\lambda\\to\\infty\\;\\Rightarrow\\;\\mathrm{InvGaussian}\\to N(\\mu,\\sigma^{2})",
    desc: { fa: "وارون-گاوسی برای پارامتر شکل بزرگ به نرمال میل می‌کند.", en: "The Inverse-Gaussian approaches the Normal as the shape parameter grows." },
  },

  // ---- Truncated / folded ----
  {
    id: "normal-truncated",
    from: "normal",
    to: "truncated-normal",
    type: "transformation",
    formula: "X\\sim N(\\mu,\\sigma^{2})\\ \\text{restricted to }[a,b]\\Rightarrow\\ \\mathrm{TruncNormal}",
    desc: { fa: "محدودکردن نرمال به بازه، نرمال بریده می‌دهد.", en: "Restricting a Normal to an interval gives the Truncated-Normal." },
  },
];

/** Map of distribution id → incoming (derived from) and outgoing (leads to) relationship ids. */
export const backlinks: Record<string, { incoming: string[]; outgoing: string[] }> = (() => {
  const map: Record<string, { incoming: string[]; outgoing: string[] }> = {};
  for (const r of relationships) {
    (map[r.from] ??= { incoming: [], outgoing: [] }).outgoing.push(r.id);
    (map[r.to] ??= { incoming: [], outgoing: [] }).incoming.push(r.id);
  }
  return map;
})();
