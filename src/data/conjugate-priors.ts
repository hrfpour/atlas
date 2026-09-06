export type Bi = { fa: string; en: string };

export type ConjugatePrior = {
  id: string;
  likelihood: Bi; // e.g. Bernoulli/Binomial
  prior: string; // distribution name (English)
  priorFa: string;
  posterior: string;
  posteriorFa: string;
  update: string; // LaTeX update rule
  notes: Bi;
};

export const conjugatePriors: ConjugatePrior[] = [
  {
    id: "bernoulli-beta",
    likelihood: {
      fa: "برنولی / دو جمله‌ای",
      en: "Bernoulli / Binomial",
    },
    prior: "Beta",
    priorFa: "بتا",
    posterior: "Beta",
    posteriorFa: "بتا",
    update:
      "p\\sim\\mathrm{Beta}(\\alpha,\\beta)\\;\\Rightarrow\\;p\\mid x\\sim\\mathrm{Beta}(\\alpha+s,\\,\\beta+n-s),\\quad s=\\sum x_i",
    notes: {
      fa: "پیشین بتا به‌خاطر تطبیق فرم با توان‌های $p$ و $(1-p)$ درست‌نمایی، پسین را در همان خانواده نگه می‌دارد.",
      en: "The Beta prior matches the $p$ and $(1-p)$ powers in the likelihood, keeping the posterior in the same family.",
    },
  },
  {
    id: "poisson-gamma",
    likelihood: {
      fa: "پواسون",
      en: "Poisson",
    },
    prior: "Gamma",
    priorFa: "گاما",
    posterior: "Gamma",
    posteriorFa: "گاما",
    update:
      "\\lambda\\sim\\mathrm{Gamma}(a,b)\\;\\Rightarrow\\;\\lambda\\mid x\\sim\\mathrm{Gamma}\\!\\left(a+\\sum x_i,\\,b+n\\right)",
    notes: {
      fa: "نرخ پواسون با گاما مزدوج است؛ $a$ تمرکز و $b$ اندازه نمونه مؤثر را نشان می‌دهد.",
      en: "The Poisson rate is conjugate to a Gamma prior; $a$ is concentration and $b$ is the effective sample size.",
    },
  },
  {
    id: "exponential-gamma",
    likelihood: {
      fa: "نمایی",
      en: "Exponential",
    },
    prior: "Gamma",
    priorFa: "گاما",
    posterior: "Gamma",
    posteriorFa: "گاما",
    update:
      "\\lambda\\sim\\mathrm{Gamma}(a,b)\\;\\Rightarrow\\;\\lambda\\mid x\\sim\\mathrm{Gamma}\\!\\left(a+n,\\,b+\\sum x_i\\right)",
    notes: {
      fa: "نمایی حالت خاصی از پواسون است و همان به‌روزرسانی گامایی را با زمان‌های انتظار دارد.",
      en: "Exponential is a special case of Poisson and shares the same Gamma update, using waiting times instead of counts.",
    },
  },
  {
    id: "normal-mean-normal",
    likelihood: {
      fa: "نرمال (واریانس معلوم)",
      en: "Normal (known variance)",
    },
    prior: "Normal",
    priorFa: "نرمال",
    posterior: "Normal",
    posteriorFa: "نرمال",
    update:
      "\\mu\\sim N(\\mu_0,\\sigma_0^{2})\\;\\Rightarrow\\;\\mu\\mid x\\sim N\\!\\left(\\frac{\\sigma_0^{2}\\bar{x}+\\sigma^{2}\\mu_0/n}{\\sigma_0^{2}+\\sigma^{2}/n},\\,\\frac{\\sigma_0^{2}\\sigma^{2}/n}{\\sigma_0^{2}+\\sigma^{2}/n}\\right)",
    notes: {
      fa: "میانگین نرمال با واریانس معلوم، میانگین پسین میانگین موزون پیشین و میانگین نمونه است.",
      en: "With known variance, the normal posterior mean is a precision-weighted average of the prior and sample means.",
    },
  },
  {
    id: "normal-variance-normal-gamma",
    likelihood: {
      fa: "نرمال (واریانس نامعلوم)",
      en: "Normal (unknown variance)",
    },
    prior: "Normal-Gamma",
    priorFa: "نرمال-گاما",
    posterior: "Normal-Gamma",
    posteriorFa: "نرمال-گاما",
    update:
      "(\\mu,\\tau)\\sim\\mathrm{NG}(\\mu_0,\\kappa_0,\\alpha_0,\\beta_0)\\;\\Rightarrow\\;\\kappa_n=\\kappa_0+n,\\ \\alpha_n=\\alpha_0+n/2,\\ \\beta_n=\\beta_0+\\tfrac{1}{2}\\sum(x_i-\\bar{x})^{2}+\\tfrac{\\kappa_0 n}{2(\\kappa_0+n)}(\\bar{x}-\\mu_0)^{2}",
    notes: {
      fa: "دقت $\\tau=1/\\sigma^{2}$ گامایی است و میانگین شرطی روی دقت نرمال است؛ این جفت توزیع، ساختار طبیعی برای واریانس ناشناخته است.",
      en: "Precision $\\tau=1/\\sigma^{2}$ is Gamma and the conditional mean given precision is normal; this pair is the natural model for unknown variance.",
    },
  },
  {
    id: "multinomial-dirichlet",
    likelihood: {
      fa: "چندجمله‌ای",
      en: "Multinomial",
    },
    prior: "Dirichlet",
    priorFa: "دیریکله",
    posterior: "Dirichlet",
    posteriorFa: "دیریکله",
    update:
      "\\mathbf{p}\\sim\\mathrm{Dir}(\\boldsymbol{\\alpha})\\;\\Rightarrow\\;\\mathbf{p}\\mid x\\sim\\mathrm{Dir}\\!\\left(\\alpha_1+c_1,\\dots,\\alpha_k+c_k\\right),\\quad c_i=\\sum_j \\mathbf{1}[x_j=i]",
    notes: {
      fa: "دیریکله تعمیم چندبعدی بتا است؛ شمارش هر رده به پارامتر تمرکز همان رده افزوده می‌شود.",
      en: "Dirichlet is the multivariate Beta; category counts simply add to the corresponding concentration parameter.",
    },
  },
  {
    id: "geometric-beta",
    likelihood: {
      fa: "هندسی",
      en: "Geometric",
    },
    prior: "Beta",
    priorFa: "بتا",
    posterior: "Beta",
    posteriorFa: "بتا",
    update:
      "p\\sim\\mathrm{Beta}(\\alpha,\\beta)\\;\\Rightarrow\\;p\\mid x\\sim\\mathrm{Beta}\\!\\left(\\alpha+n,\\,\\beta+\\sum x_i\\right)",
    notes: {
      fa: "تعداد موفقیت‌ها $n$ به $\\alpha$ و تعداد کل شکست‌ها $\\sum x_i$ به $\\beta$ اضافه می‌شود.",
      en: "Each success adds to $\\alpha$ and total failures $\\sum x_i$ add to $\\beta$.",
    },
  },
  {
    id: "negative-binomial-beta",
    likelihood: {
      fa: "دو جمله‌ای منفی",
      en: "Negative Binomial",
    },
    prior: "Beta",
    priorFa: "بتا",
    posterior: "Beta",
    posteriorFa: "بتا",
    update:
      "p\\sim\\mathrm{Beta}(\\alpha,\\beta)\\;\\Rightarrow\\;p\\mid x\\sim\\mathrm{Beta}\\!\\left(\\alpha+rn,\\,\\beta+\\sum x_i-rn\\right)",
    notes: {
      fa: "با شمارش $r$ موفقیت در هر آزمایش، $rn$ به $\\alpha$ و کل شکست‌ها به $\\beta$ افزوده می‌شود.",
      en: "Counting $r$ successes per trial, $rn$ adds to $\\alpha$ and total failures add to $\\beta$.",
    },
  },
  {
    id: "uniform-pareto",
    likelihood: {
      fa: "یکنواخت پیوسته روی [0, θ]",
      en: "Continuous Uniform on [0, θ]",
    },
    prior: "Pareto",
    priorFa: "پارتو",
    posterior: "Pareto",
    posteriorFa: "پارتو",
    update:
      "\\theta\\sim\\mathrm{Pareto}(x_m,a)\\;\\Rightarrow\\;\\theta\\mid x\\sim\\mathrm{Pareto}\\!\\left(\\max(x_m,x_{(n)}),\\,a+n\\right)",
    notes: {
      fa: "پیشین پارتو به‌خاطر طبیعت قانون توانی با کران بالا سازگار است؛ بیشینه نمونه نقش کلیدی دارد.",
      en: "The Pareto prior matches the upper-bound structure of the uniform; the sample maximum drives the update.",
    },
  },
  {
    id: "gamma-rate-gamma",
    likelihood: {
      fa: "گاما (نرخ معلوم)",
      en: "Gamma (known rate)",
    },
    prior: "Gamma",
    priorFa: "گاما",
    posterior: "Gamma",
    posteriorFa: "گاما",
    update:
      "\\alpha\\sim\\mathrm{Gamma}(a,b)\\;\\Rightarrow\\;\\alpha\\mid x\\sim\\mathrm{Gamma}\\!\\left(a+n\\hat\\alpha,\\,b-\\sum\\log x_i+\\beta\\sum x_i\\right)",
    notes: {
      fa: "با نرخ معلوم $\\beta$، پارامتر شکل $\\alpha$ خود گامایی است؛ حداکثر درست‌نمایی به‌عنوان یک نقطه شروع به‌کار می‌رود.",
      en: "With known rate $\\beta$, the shape $\\alpha$ itself admits a Gamma prior; the MLE provides a starting point for the update.",
    },
  },
];
