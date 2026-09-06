export type Bi = { fa: string; en: string };

export type Inequality = {
  id: string;
  name: string;
  fa: string;
  statement: string; // LaTeX
  intuition: Bi;
  use: Bi;
};

export const inequalities: Inequality[] = [
  {
    id: "markov",
    name: "Markov",
    fa: "نامساوی مارکوف",
    statement: "P(X\\ge a)\\le \\frac{E[X]}{a},\\qquad X\\ge0,\\ a>0",
    intuition: {
      fa: "اگر میانگین یک متغیر نامنفی کوچک باشد، احتمال اینکه مقدار بزرتی بگیرد محدود است.",
      en: "If the mean of a non-negative variable is small, its probability of taking a large value is bounded.",
    },
    use: {
      fa: "ساده‌ترین کران دم؛ گام اول در اثبات چبیشف و نامساوی‌های غلظت.",
      en: "The simplest tail bound; the first step in proving Chebyshev and concentration inequalities.",
    },
  },
  {
    id: "chebyshev",
    name: "Chebyshev",
    fa: "نامساوی چبیشف",
    statement: "P(|X-\\mu|\\ge k\\sigma)\\le \\frac{1}{k^{2}},\\qquad \\mu=E[X],\\ \\sigma^{2}=\\mathrm{Var}(X)",
    intuition: {
      fa: "هر مقدار میانگین منحرف با چند برابر انحراف معیار، احتمال متناسب با معکوس مجذور آن برابر دارد.",
      en: "A deviation measured in multiples of the standard deviation has probability bounded by the reciprocal of the squared multiple.",
    },
    use: {
      fa: "اثبات LLN و ساختن بازه‌های اطمینان تقریبی بدون فرض توزیع.",
      en: "Proves the LLN and yields distribution-free approximate confidence intervals.",
    },
  },
  {
    id: "jensen",
    name: "Jensen",
    fa: "نامساوی ینسن",
    statement: "g\\ \\text{convex}\\ \\Rightarrow\\ E[g(X)]\\ge g(E[X]),\\qquad g\\ \\text{concave}\\ \\Rightarrow\\ E[g(X)]\\le g(E[X])",
    intuition: {
      fa: "میانگین یک تابع محدب از متغیر، بزرگ‌تر از تابع محدب اعمال‌شده به میانگین است؛ انحنای تابع مهم است.",
      en: "The mean of a convex function of the variable exceeds the function applied to the mean; curvature matters.",
    },
    use: {
      fa: "اثبات نامساوی AM-GM، کران‌های اطلاعاتی و تحلیل الگوریتم‌های تصادفی.",
      en: "Proves AM-GM, information-theoretic bounds, and underlies analysis of randomized algorithms.",
    },
  },
  {
    id: "holder",
    name: "Hölder",
    fa: "نامساوی هولدر",
    statement: "E[|XY|]\\le \\bigl(E|X|^{p}\\bigr)^{1/p}\\bigl(E|Y|^{q}\\bigr)^{1/q},\\qquad \\frac{1}{p}+\\frac{1}{q}=1",
    intuition: {
      fa: "هم‌بسته‌بودن $|XY|$ را به اندازه‌های $L^p$ و $L^q$ تجزیه می‌کند؛ حالت $p=q=2$ کوشی-اشوارتز است.",
      en: "Decomposes the dependence of $|XY|$ into $L^p$ and $L^q$ norms; the case $p=q=2$ is Cauchy-Schwarz.",
    },
    use: {
      fa: "تحلیل فضاها و برآوردگرها در $L^p$، و اثبات نامساوی مثلث مینکوفسکی.",
      en: "Analyzes $L^p$ spaces and estimators, and proves the Minkowski triangle inequality.",
    },
  },
  {
    id: "cauchy-schwarz",
    name: "Cauchy–Schwarz",
    fa: "نامساوی کوشی-اشوارتز",
    statement: "|E[XY]|^{2}\\le E[X^{2}]\\,E[Y^{2}],\\qquad |\\rho_{X,Y}|\\le 1",
    intuition: {
      fa: "همبستگی مطلقاً از یک بیشتر نمی‌شود؛ ضرب داخلی دو متغیر از ضرب نرم‌هایشان کوچک‌تر است.",
      en: "Correlation cannot exceed one in absolute value; the inner product of two variables is bounded by the product of their norms.",
    },
    use: {
      fa: "کران بر همبستگی، اثبات نامساوی اطلاعات و کران کرامر-راو.",
      en: "Bounds correlation and underlies proofs of information inequalities and the Cramér-Rao bound.",
    },
  },
  {
    id: "minkowski",
    name: "Minkowski",
    fa: "نامساوی مینکوفسکی",
    statement: "\\bigl(E|X+Y|^{p}\\bigr)^{1/p}\\le \\bigl(E|X|^{p}\\bigr)^{1/p}+\\bigl(E|Y|^{p}\\bigr)^{1/p},\\qquad p\\ge1",
    intuition: {
      fa: "نامساوی مثلث در فضای $L^p$؛ جمع دو متغیر از جمع نرم‌های جداگانه بزرگ‌تر نمی‌شود.",
      en: "The triangle inequality in $L^p$; the norm of a sum is bounded by the sum of the individual norms.",
    },
    use: {
      fa: "اثبات کامل‌بودن فضاهای $L^p$ و کران نرم برآوردگرها.",
      en: "Establishes completeness of $L^p$ spaces and bounds estimator norms.",
    },
  },
  {
    id: "chernoff",
    name: "Chernoff Bound",
    fa: "کران چرنوف",
    statement: "P(X\\ge a)\\le \\inf_{t>0} e^{-ta}\\,M_X(t),\\qquad X=\\sum_i X_i",
    intuition: {
      fa: "با بهینه‌سازی توان نمایی، کران دم بسیار تنگ‌تر از چبیشف به‌دست می‌آید.",
      en: "Optimizing an exponential tilt yields a much tighter tail bound than Chebyshev.",
    },
    use: {
      fa: "تحلیل احتمال رویدادهای نادر در یادگیری ماشین، الگوریتم‌ها و صف.",
      en: "Analyzes rare-event probabilities in machine learning, algorithms, and queueing theory.",
    },
  },
  {
    id: "hoeffding",
    name: "Hoeffding",
    fa: "کران هفدینگ",
    statement: "P\\!\\left(\\frac{1}{n}\\sum_i X_i-\\mu\\ge \\varepsilon\\right)\\le \\exp\\!\\left(-\\frac{2n^{2}\\varepsilon^{2}}{\\sum_i(b_i-a_i)^{2}}\\right)",
    intuition: {
      fa: "برای متغیرهای کراندار و مستقل، احتمال انحراف میانگین نمونه به‌صورت نمایی با $n$ کاهش می‌یابد.",
      en: "For bounded independent variables, the probability that the sample mean deviates from $\\mu$ decays exponentially in $n$.",
    },
    use: {
      fa: "پایه نامساوی‌های غلظت در یادگیری آماری و کرن برای برآوردگرها.",
      en: "The workhorse concentration inequality for statistical learning and estimator bounds.",
    },
  },
];
