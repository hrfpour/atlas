export type Bi = { fa: string; en: string };

export type InferenceMethod = {
  id: string;
  name: string;
  fa: string;
  idea: Bi;
  formula: string; // LaTeX
  example: Bi;
};

export const inferenceMethods: InferenceMethod[] = [
  {
    id: "mle",
    name: "Maximum Likelihood Estimation",
    fa: "برآورد بیشینه درست‌نمایی",
    idea: {
      fa: "پارامتری را برگزین که داده مشاهده‌شده را محتمل‌ترین می‌کند؛ یعنی درست‌نمایی را به‌حداکثر برساند.",
      en: "Pick the parameter that makes the observed data most probable by maximizing the likelihood function.",
    },
    formula:
      "\\hat{\\theta}_{\\mathrm{MLE}}=\\arg\\max_{\\theta\\in\\Theta}\\prod_{i=1}^{n}p_{\\theta}(x_i)=\\arg\\max_{\\theta}\\sum_{i=1}^{n}\\log p_{\\theta}(x_i)",
    example: {
      fa: "برای $X_i\\sim\\mathrm{Pois}(\\lambda)$، برآورد $\\hat{\\lambda}=\\bar{x}$ به‌دست می‌آید.",
      en: "For $X_i\\sim\\mathrm{Pois}(\\lambda)$, the MLE is $\\hat{\\lambda}=\\bar{x}$.",
    },
  },
  {
    id: "method-of-moments",
    name: "Method of Moments",
    fa: "روش گشتاوراورها",
    idea: {
      fa: "گشتاورهای نظری را با گشتاورهای نمونه‌ای برابر بگذار و دستگاه را برای پارامترها حل کن.",
      en: "Equate theoretical moments with sample moments and solve the resulting system for the parameters.",
    },
    formula:
      "\\frac{1}{n}\\sum_{i=1}^{n}X_i^{k}=E_{\\theta}[X^{k}],\\qquad k=1,2,\\dots,\\dim(\\theta)",
    example: {
      fa: "برای $X_i\\sim\\mathrm{Gamma}(\\alpha,\\beta)$ از $\\bar{x}$ و $\\overline{x^2}$، $\\hat\\alpha=\\bar{x}^{2}/s^{2}$ و $\\hat\\beta=\\bar{x}/s^{2}$.",
      en: "For $X_i\\sim\\mathrm{Gamma}(\\alpha,\\beta)$, using $\\bar{x}$ and $\\overline{x^2}$ gives $\\hat\\alpha=\\bar{x}^{2}/s^{2}$, $\\hat\\beta=\\bar{x}/s^{2}$.",
    },
  },
  {
    id: "bayesian-estimation",
    name: "Bayesian Estimation",
    fa: "برآورد بیزی",
    idea: {
      fa: "با استفاده از قانون بیز، باور پیشین را با درست‌نمایی داده ترکیب کن و توزیع پسین را به‌دست آور.",
      en: "Combine a prior belief with the likelihood of the data via Bayes' rule to obtain the posterior distribution.",
    },
    formula:
      "p(\\theta\\mid x_{1:n})=\\frac{L(\\theta;x_{1:n})\\,\\pi(\\theta)}{\\int_{\\Theta}L(\\theta';x_{1:n})\\,\\pi(\\theta')\\,d\\theta'}\\propto L(\\theta;x_{1:n})\\,\\pi(\\theta)",
    example: {
      fa: "با پیشین $\\mathrm{Beta}(1,1)$ و $n$ آزمایش برنولی، پسین $\\mathrm{Beta}(1+s,1+n-s)$ می‌شود.",
      en: "With a $\\mathrm{Beta}(1,1)$ prior and $n$ Bernoulli trials, the posterior is $\\mathrm{Beta}(1+s,1+n-s)$.",
    },
  },
  {
    id: "confidence-interval",
    name: "Confidence Interval",
    fa: "بازه اطمینان",
    idea: {
      fa: "بازه‌ای تصادفی بساز که با احتمال از پیش تعیین‌شده پارامتر واقعی را پوشش دهد؛ تفسیر فرکانسی دارد.",
      en: "Construct a random interval that covers the true parameter with a pre-specified probability; interpreted in the frequentist sense.",
    },
    formula:
      "P_{\\theta}\\bigl(L(X_{1:n})\\le \\theta\\le U(X_{1:n})\\bigr)=1-\\alpha,\\qquad \\text{e.g.}\\ \\bar{X}\\pm z_{1-\\alpha/2}\\frac{\\sigma}{\\sqrt{n}}",
    example: {
      fa: "برای میانگین نرمال با $\\sigma$ معلوم، بازه $\\bar{X}\\pm 1.96\\,\\sigma/\\sqrt{n}$ اطمینان ۹۵٪ است.",
      en: "For a normal mean with known $\\sigma$, the interval $\\bar{X}\\pm 1.96\\,\\sigma/\\sqrt{n}$ is a 95% confidence interval.",
    },
  },
  {
    id: "hypothesis-testing",
    name: "Hypothesis Testing",
    fa: "آزمون فرض",
    idea: {
      fa: "فرض صفر را در برابر فرض جایگزین آزمون کن و بر اساس p-value یا ناحیه رد، تصمیم بگیر.",
      en: "Test a null hypothesis against an alternative and decide via the p-value or a rejection region.",
    },
    formula:
      "p\\text{-value}=P_{H_0}(T(X)\\ge T(x_{\\mathrm{obs}})),\\qquad \\text{reject }H_0\\text{ if }p\\text{-value}\\le \\alpha",
    example: {
      fa: "آزمون $z$ برای میانگین: $z=\\sqrt{n}(\\bar{x}-\\mu_0)/\\sigma$ را با نقطه بحرانی $z_{1-\\alpha/2}$ مقایسه کن.",
      en: "A $z$-test for the mean compares $z=\\sqrt{n}(\\bar{x}-\\mu_0)/\\sigma$ with the critical value $z_{1-\\alpha/2}$.",
    },
  },
  {
    id: "bootstrap",
    name: "Bootstrap",
    fa: "بوت‌استرپ",
    idea: {
      fa: "از نمونه با جای‌گذاری نمونه‌گیری کن و توزیع نمونه‌برداری آماره را بدون فرض پارامتری تقریب بزن.",
      en: "Resample with replacement to approximate the sampling distribution of a statistic without parametric assumptions.",
    },
    formula:
      "\\hat{F}_n(x)=\\frac{1}{n}\\sum_{i=1}^{n}\\mathbf{1}\\{X_i\\le x\\},\\qquad \\hat{\\theta}^{*}_{b}=T(X^{*}_{b,1},\\dots,X^{*}_{b,n}),\\ X^{*}_{b,i}\\sim_{\\mathrm{iid}}\\hat{F}_n",
    example: {
      fa: "برای تقریب واریانس $\\bar{X}$، $B$ نمونه بوت‌استرپ بساز و واریانس $\\bar{X}^{*}_b$ را حساب کن.",
      en: "To approximate the variance of $\\bar{X}$, generate $B$ bootstrap samples and compute the variance of $\\bar{X}^{*}_b$.",
    },
  },
];
