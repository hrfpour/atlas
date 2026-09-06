export type Bi = { fa: string; en: string };

export type GlossaryEntry = { term: string; fa: string; def: Bi };

export const glossary: GlossaryEntry[] = [
  {
    term: "Random Variable",
    fa: "متغیر تصادفی",
    def: {
      fa: "تابعی از فضای نمونه به اعداد حقیقی که خروجی‌های یک آزمایش تصادفی را به عدد نگاشت می‌کند؛ با یک توزیع احتمال مشخص می‌شود.",
      en: "A function from the sample space to the reals that assigns numeric values to outcomes of a random experiment; it is governed by a probability distribution.",
    },
  },
  {
    term: "PMF",
    fa: "تابع جرم احتمال",
    def: {
      fa: "برای متغیر گسسته $X$، تابع $p(x)=P(X=x)$ که احتمال هر مقدار را می‌دهد و روی پشتیبانی مجموعش یک است.",
      en: "For a discrete variable $X$, the function $p(x)=P(X=x)$ giving the probability of each value, summing to one over its support.",
    },
  },
  {
    term: "PDF",
    fa: "تابع چگالی احتمال",
    def: {
      fa: "برای متغیر پیوسته $X$، تابع $f(x)$ که $P(a\\le X\\le b)=\\int_{a}^{b}f(x)\\,dx$ را برآورده می‌کند و غیرمنفی و انتگرال‌پذیر به یک است.",
      en: "For a continuous variable $X$, the function $f(x)$ such that $P(a\\le X\\le b)=\\int_{a}^{b}f(x)\\,dx$; non-negative and integrating to one.",
    },
  },
  {
    term: "CDF",
    fa: "تابع توزیع تجمعی",
    def: {
      fa: "تابع $F(x)=P(X\\le x)$ که احتمال تجمعی تا $x$ را می‌دهد؛ برای متغیر پیوسته پیوسته و ناپیوسته برای گسسته است.",
      en: "The function $F(x)=P(X\\le x)$ giving cumulative probability up to $x$; continuous for continuous variables and step-wise for discrete ones.",
    },
  },
  {
    term: "Quantile",
    fa: "چارک (کوانتایل)",
    def: {
      fa: "برای $p\\in[0,1]$ مقدار $Q(p)=\\inf\\{x:F(x)\\ge p\\}$ که معکوس تعمیم‌یافته‌ی CDF است و صدک‌ها را تعریف می‌کند.",
      en: "For $p\\in[0,1]$, the value $Q(p)=\\inf\\{x:F(x)\\ge p\\}$, the generalized inverse of the CDF, defining percentiles.",
    },
  },
  {
    term: "Expectation",
    fa: "امید ریاضی",
    def: {
      fa: "میانگین وزنی مقدار متغیر: $E[X]=\\sum x\\,p(x)$ برای گسسته و $E[X]=\\int x\\,f(x)\\,dx$ برای پیوسته.",
      en: "The probability-weighted average of $X$: $E[X]=\\sum x\\,p(x)$ for discrete and $E[X]=\\int x\\,f(x)\\,dx$ for continuous variables.",
    },
  },
  {
    term: "Variance",
    fa: "واریانس",
    def: {
      fa: "میانگین مربع انحراف از میانگین: $\\mathrm{Var}(X)=E[(X-\\mu)^{2}]=E[X^{2}]-\\mu^{2}$؛ اندازه پراکندگی است.",
      en: "The mean squared deviation from the mean: $\\mathrm{Var}(X)=E[(X-\\mu)^{2}]=E[X^{2}]-\\mu^{2}$; a measure of spread.",
    },
  },
  {
    term: "Standard Deviation",
    fa: "انحراف معیار",
    def: {
      fa: "ریشه دوم واریانس $\\sigma=\\sqrt{\\mathrm{Var}(X)}$ که هم‌واحد با خود متغیر است و پراکندگی را خواناتر می‌کند.",
      en: "The square root of variance $\\sigma=\\sqrt{\\mathrm{Var}(X)}$, in the same units as the variable, making spread easier to interpret.",
    },
  },
  {
    term: "Moment",
    fa: "گشتاور",
    def: {
      fa: "گشتاور $k$ام $E[X^{k}]$ است؛ گشتاور مرکزی $E[(X-\\mu)^{k}]$ و گشتاورها توزیع را تا حد زیادی مشخص می‌کنند.",
      en: "The $k$-th moment is $E[X^{k}]$; central moments are $E[(X-\\mu)^{k}]$, and moments largely determine the distribution.",
    },
  },
  {
    term: "MGF",
    fa: "تابع مولد گشتاور",
    def: {
      fa: "تابع $M_X(t)=E[e^{tX}]$ که اگر در همسایگی صفر موجود باشد، تمام گشتاورها را با مشتق‌گیری تولید می‌کند.",
      en: "The function $M_X(t)=E[e^{tX}]$ which, when finite near zero, generates all moments via differentiation.",
    },
  },
  {
    term: "Characteristic Function",
    fa: "تابع مشخصه",
    def: {
      fa: "تابع $\\varphi_X(t)=E[e^{itX}]$ که همیشه موجود است و توزیع را یک‌به‌یک مشخص می‌کند.",
      en: "The function $\\varphi_X(t)=E[e^{itX}]$ which always exists and uniquely determines the distribution.",
    },
  },
  {
    term: "Skewness",
    fa: "چولگی",
    def: {
      fa: "گشتاور مرکزی نرمال‌شده سوم $\\gamma_1=E[(X-\\mu)^{3}]/\\sigma^{3}$ که میزان نامتقارنی دم‌ها را نشان می‌دهد.",
      en: "The third standardized central moment $\\gamma_1=E[(X-\\mu)^{3}]/\\sigma^{3}$ measuring asymmetry of the tails.",
    },
  },
  {
    term: "Kurtosis",
    fa: "کشیدگی",
    def: {
      fa: "گشتاور مرکزی نرمال‌شده چهارم $\\gamma_2=E[(X-\\mu)^{4}]/\\sigma^{4}-3$ که سنگینی دم‌ها را نسبت به نرمال نشان می‌دهد.",
      en: "The fourth standardized central moment $\\gamma_2=E[(X-\\mu)^{4}]/\\sigma^{4}-3$ measuring tail heaviness relative to the normal.",
    },
  },
  {
    term: "Entropy",
    fa: "آنتروپی",
    def: {
      fa: "میانگین اطلاعات $H(X)=-\\sum p(x)\\log p(x)$ گسسته یا $h(X)=-\\int f(x)\\log f(x)\\,dx$ پیوسته؛ اندازه عدم‌قطعیت است.",
      en: "The average information $H(X)=-\\sum p(x)\\log p(x)$ for discrete or $h(X)=-\\int f(x)\\log f(x)\\,dx$ for continuous variables; a measure of uncertainty.",
    },
  },
  {
    term: "Independence",
    fa: "استقلال",
    def: {
      fa: "دو متغیر مستقل‌اند اگر $P(X\\in A,Y\\in B)=P(X\\in A)P(Y\\in B)$؛ به‌اشتراک‌گذاری اطلاعات ندارند.",
      en: "Two variables are independent if $P(X\\in A,Y\\in B)=P(X\\in A)P(Y\\in B)$; they share no information.",
    },
  },
  {
    term: "i.i.d.",
    fa: "مستقل و هم‌توزیع",
    def: {
      fa: "مخفف «independent and identically distributed»؛ نمونه‌ها مستقل و از یک توزیع مشترک پیروی می‌کنند، فرض پایه CLT و LLN.",
      en: "Abbreviation of «independent and identically distributed»; samples are independent and share one common distribution, the base assumption of CLT and LLN.",
    },
  },
  {
    term: "Conjugate Prior",
    fa: "پیشین مزدوج",
    def: {
      fa: "پیشینی که خانواده‌ی پسین را همان خانواده‌ی پیشین نگه می‌دارد، محاسبه بیزی را بسته‌شده می‌کند، مانند بتا برای برنولی.",
      en: "A prior that keeps the posterior in the same family as itself, closing Bayesian computation, e.g. Beta for Bernoulli.",
    },
  },
  {
    term: "Likelihood",
    fa: "درست‌نمایی",
    def: {
      fa: "تابع $L(\\theta;x)=p_\\theta(x)$ به‌عنوان تابعی از پارامتر $\\theta$ برای داده مشاهده‌شده $x$؛ پایه برآورد MLE.",
      en: "The function $L(\\theta;x)=p_\\theta(x)$ viewed as a function of the parameter $\\theta$ for observed data $x$; the basis of MLE.",
    },
  },
  {
    term: "Posterior",
    fa: "پسین",
    def: {
      fa: "توزیع پارامتر پس از مشاهده داده: $p(\\theta\\mid x)\\propto L(\\theta;x)\\,\\pi(\\theta)$ که قانون بیز آن را می‌دهد.",
      en: "The distribution of the parameter after observing data: $p(\\theta\\mid x)\\propto L(\\theta;x)\\,\\pi(\\theta)$ via Bayes' rule.",
    },
  },
  {
    term: "MLE",
    fa: "برآورد بیشینه درست‌نمایی",
    def: {
      fa: "مقدار $\\hat{\\theta}=\\arg\\max_\\theta L(\\theta;x)$ که داده را محتمل‌ترین می‌کند؛ تحت شرایط منظم بی‌گران، کارا و نرمال است.",
      en: "The value $\\hat{\\theta}=\\arg\\max_\\theta L(\\theta;x)$ that makes the data most probable; under regularity conditions it is asymptotically efficient and normal.",
    },
  },
  {
    term: "Method of Moments",
    fa: "روش گشتاوراورها",
    def: {
      fa: "برآورد با برابر گذاشتن گشتاورهای نظری با گشتاورهای نمونه‌ای $E[X^{k}]=\\frac{1}{n}\\sum X_i^{k}$ و حل دستگاه معادلات.",
      en: "Estimation by equating theoretical moments with sample moments $E[X^{k}]=\\frac{1}{n}\\sum X_i^{k}$ and solving the system.",
    },
  },
  {
    term: "CLT",
    fa: "قضیه حد مرکزی",
    def: {
      fa: "برای $X_i$ با میانگین $\\mu$ و واریانس $\\sigma^{2}$، $\\frac{\\sum X_i-n\\mu}{\\sigma\\sqrt{n}}\\xrightarrow{d}N(0,1)$؛ پایه تقریب نرمال.",
      en: "For $X_i$ with mean $\\mu$ and variance $\\sigma^{2}$, $\\frac{\\sum X_i-n\\mu}{\\sigma\\sqrt{n}}\\xrightarrow{d}N(0,1)$; the basis of the normal approximation.",
    },
  },
  {
    term: "LLN",
    fa: "قانون اعداد بزرگ",
    def: {
      fa: "میانگین نمونه به میانگین تئوری میل می‌کند: $\\frac{1}{n}\\sum X_i\\xrightarrow{p}E[X]$؛ پایه یادگیری آماری.",
      en: "The sample mean converges to the theoretical mean: $\\frac{1}{n}\\sum X_i\\xrightarrow{p}E[X]$; the basis of statistical learning.",
    },
  },
  {
    term: "Support",
    fa: "پشتیبانی (دامنه)",
    def: {
      fa: "مجموعه‌ای از مقادیر که PMF یا PDF روی آن مثبت است؛ دامنه‌ی توزیع را تعریف می‌کند، مانند $x\\ge0$ برای نمایی.",
      en: "The set of values where the PMF or PDF is positive; it defines the distribution's domain, e.g. $x\\ge0$ for the exponential.",
    },
  },
  {
    term: "Hazard Function",
    fa: "تابع خطر",
    def: {
      fa: "نرخ لحظه‌ای شکست در زمان $t$ به‌شرط بقا تا آن لحظه: $h(t)=\\frac{f(t)}{S(t)}=-\\frac{d}{dt}\\log S(t)$؛ پایه تحلیل بقا.",
      en: "The instantaneous failure rate at time $t$ conditional on survival up to then: $h(t)=\\frac{f(t)}{S(t)}=-\\frac{d}{dt}\\log S(t)$; the basis of survival analysis.",
    },
  },
  {
    term: "Survival Function",
    fa: "تابع بقا",
    def: {
      fa: "احتمال بقای فراتر از $t$: $S(t)=P(T>t)=1-F(t)$؛ مکمل CDF در مسائل زمان تا رویداد.",
      en: "The probability of surviving beyond $t$: $S(t)=P(T>t)=1-F(t)$; the complement of the CDF in time-to-event problems.",
    },
  },
  {
    term: "Quantile Function",
    fa: "تابع چارک",
    def: {
      fa: "معکوس تعمیم‌یافته‌ی CDF: $Q(p)=F^{-1}(p)$ که برای تولید عدد تصادفی و آزمون نیکویی برازش استفاده می‌شود.",
      en: "The generalized inverse of the CDF: $Q(p)=F^{-1}(p)$, used for random variate generation and goodness-of-fit testing.",
    },
  },
  {
    term: "Covariance",
    fa: "کوواریانس",
    def: {
      fa: "هم‌بسته‌بودن خطی $X$ و $Y$: $\\mathrm{Cov}(X,Y)=E[(X-\\mu_X)(Y-\\mu_Y)]$؛ علامت جهت وابستگی را نشان می‌دهد.",
      en: "The linear co-movement of $X$ and $Y$: $\\mathrm{Cov}(X,Y)=E[(X-\\mu_X)(Y-\\mu_Y)]$; its sign indicates the direction of dependence.",
    },
  },
  {
    term: "Correlation",
    fa: "همبستگی",
    def: {
      fa: "کوواریانس نرمال‌شده $\\rho=\\frac{\\mathrm{Cov}(X,Y)}{\\sigma_X\\sigma_Y}\\in[-1,1]$ که شدت رابطه خطی را اندازه می‌گیرد.",
      en: "The standardized covariance $\\rho=\\frac{\\mathrm{Cov}(X,Y)}{\\sigma_X\\sigma_Y}\\in[-1,1]$ measuring the strength of linear association.",
    },
  },
  {
    term: "Jensen's Inequality",
    fa: "نامساوی ینسن",
    def: {
      fa: "برای تابع محدب $g$، $E[g(X)]\\ge g(E[X])$ (و برای مقعر برعکس)؛ پایه بسیاری از نامساوی‌های احتمالی.",
      en: "For a convex function $g$, $E[g(X)]\\ge g(E[X])$ (reversed for concave); the foundation of many probabilistic inequalities.",
    },
  },
];
