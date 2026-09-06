export type Bi = { fa: string; en: string };

export type FoundationTopic = {
  id: string;
  title: Bi;
  def: Bi; // 2-3 sentence definition
  formula: string; // LaTeX (display)
  notes: Bi; // why it matters
};

export const foundations: FoundationTopic[] = [
  {
    id: "random-variable",
    title: { fa: "متغیر تصادفی", en: "Random Variable" },
    def: {
      fa: "نگاشت از فضای نمونه به اعداد حقیقی که خروجی‌های تصادفی را عددی می‌کند. با یک توزیع احتمال مشخص می‌شود و زیربنای تمام نظریه احتمال کاربردی است.",
      en: "A mapping from the sample space to the reals that quantifies random outcomes. It is described by a probability distribution and underpins all of applied probability.",
    },
    formula: "X:\\Omega\\to\\mathbb{R},\\qquad P(X\\in A)=P(\\{\\omega:X(\\omega)\\in A\\})",
    notes: {
      fa: "بدون این مفهوم نمی‌توان از رویدادهای انتزاعی به محاسبات عددی رفت؛ پایه تمام توزیع‌ها است.",
      en: "Without this concept one cannot move from abstract events to numerical computation; it grounds every distribution.",
    },
  },
  {
    id: "cdf",
    title: { fa: "تابع توزیع تجمعی", en: "Cumulative Distribution Function" },
    def: {
      fa: "تابع $F(x)=P(X\\le x)$ که احتمال تجمعی تا $x$ را به‌دست می‌دهد. این تابع پیوسته‌راست‌بالا، با حد صفر در $-\\infty$ و یک در $+\\infty$ است.",
      en: "The function $F(x)=P(X\\le x)$ giving cumulative probability up to $x$. It is right-continuous and non-decreasing, with limits 0 at $-\\infty$ and 1 at $+\\infty$.",
    },
    formula: "F_X(x)=P(X\\le x)=\\int_{-\\infty}^{x}f(t)\\,dt\\ \\ \\text{(continuous)},\\ \\ F_X(x)=\\sum_{t\\le x}p(t)\\ \\ \\text{(discrete)}",
    notes: {
      fa: "CDF زبان مشترک گسسته و پیوسته است؛ با داشتن آن تمام احتمالات قابل محاسبه‌اند.",
      en: "The CDF is the common language of discrete and continuous variables; from it all probabilities can be recovered.",
    },
  },
  {
    id: "pdf-pmf",
    title: { fa: "PDF و PMF", en: "PDF and PMF" },
    def: {
      fa: "PMF تابع $p(x)=P(X=x)$ برای گسسته و PDF چگالی $f(x)$ با $P(a\\le X\\le b)=\\int_a^b f$ برای پیوسته است. هر دو غیرمنفی و انتگرال/مجموع یک دارند.",
      en: "The PMF is $p(x)=P(X=x)$ for discrete variables, while the PDF is a density $f(x)$ with $P(a\\le X\\le b)=\\int_a^b f$ for continuous ones. Both are non-negative and integrate/sum to one.",
    },
    formula: "p(x)\\ge0,\\ \\sum_x p(x)=1;\\qquad f(x)\\ge0,\\ \\int_{-\\infty}^{\\infty}f(x)\\,dx=1",
    notes: {
      fa: "این توابع هسته توصیف هر توزیع هستند؛ از آن‌ها میانگین، واریانس و گشتاورها ساخته می‌شوند.",
      en: "These functions are the core description of any distribution; means, variances, and moments are built from them.",
    },
  },
  {
    id: "expectation",
    title: { fa: "امید ریاضی", en: "Expectation" },
    def: {
      fa: "میانگین احتمالی-وزنی متغیر، یعنی $E[X]=\\sum x\\,p(x)$ یا $\\int x\\,f(x)\\,dx$. این عملگر خطی است و مرکز ثقل توزیع را نشان می‌دهد.",
      en: "The probability-weighted average $E[X]=\\sum x\\,p(x)$ or $\\int x\\,f(x)\\,dx$. It is linear and gives the center of mass of the distribution.",
    },
    formula: "E[X]=\\sum_x x\\,p(x)=\\int_{-\\infty}^{\\infty}x\\,f(x)\\,dx",
    notes: {
      fa: "تمام اندازه‌های مرکزی و بسیاری از برآوردگرها روی امید بنا شده‌اند؛ خطی‌بودن آن کلید بسیاری از محاسبات است.",
      en: "All central measures and many estimators are built on expectation; its linearity unlocks a great deal of computation.",
    },
  },
  {
    id: "variance",
    title: { fa: "واریانس", en: "Variance" },
    def: {
      fa: "میانگین مربع انحراف از میانگین $\\mathrm{Var}(X)=E[(X-\\mu)^2]$. اندازه پراکندگی است و با $\\sigma^2$ نشان داده می‌شود.",
      en: "The mean squared deviation from the mean $\\mathrm{Var}(X)=E[(X-\\mu)^2]$. It measures spread and is denoted $\\sigma^2$.",
    },
    formula: "\\mathrm{Var}(X)=E[(X-\\mu)^{2}]=E[X^{2}]-\\mu^{2},\\qquad \\mu=E[X]",
    notes: {
      fa: "واریانس پایه نامساوی چبیشف و کران طوری–علمی است و نوسان برآوردگرها را مشخص می‌کند.",
      en: "Variance grounds Chebyshev-type bounds and governs the fluctuation of estimators.",
    },
  },
  {
    id: "moments",
    title: { fa: "گشتاورها", en: "Moments" },
    def: {
      fa: "گشت $k$ام $E[X^k]$ و گشتاور مرکزی $E[(X-\\mu)^k]$ هستند. مجموعه گشتاورها در بسیاری موارد توزیع را یکتا مشخص می‌کند.",
      en: "The $k$-th moment is $E[X^k]$ and the central moment is $E[(X-\\mu)^k]$. Under mild conditions the collection of moments uniquely determines the distribution.",
    },
    formula: "\\mu_k=E[X^{k}],\\qquad \\tilde\\mu_k=E[(X-\\mu)^{k}]",
    notes: {
      fa: "از گشتاورها میانگین، واریانس، چولگی و کشیدگی ساخته می‌شوند؛ تابع مولد گشت آن‌ها را فشرده می‌کند.",
      en: "Mean, variance, skewness, and kurtosis are all moments; the MGF packages them compactly.",
    },
  },
  {
    id: "independence",
    title: { fa: "استقلال", en: "Independence" },
    def: {
      fa: "دو متغیر مستقل‌اند اگر توزیع مشترکشان ضرب حاشیه‌ای‌ها باشد. در این صورت آگاهی از یکی اطلاعات درباره دیگری نمی‌دهد.",
      en: "Two variables are independent when their joint distribution factors into the marginals. Knowing one provides no information about the other.",
    },
    formula: "F_{X,Y}(x,y)=F_X(x)\\,F_Y(y)\\ \\ \\Longleftrightarrow\\ \\ X\\perp Y",
    notes: {
      fa: "استقلال فرض i.i.d. و کلید قانون اعداد بزرگ و CLT است؛ بدون آن بسیاری از قضایا فرومی‌ریزند.",
      en: "Independence underlies the i.i.d. assumption and unlocks both the LLN and the CLT.",
    },
  },
  {
    id: "covariance-correlation",
    title: { fa: "کوواریانس و همبستگی", en: "Covariance and Correlation" },
    def: {
      fa: "کوواریانس $\\mathrm{Cov}(X,Y)=E[(X-\\mu_X)(Y-\\mu_Y)]$ و همبستگی نرمال‌شده $\\rho\\in[-1,1]$ است. این اندازه‌ها شدت و جهت رابطه خطی را نشان می‌دهند.",
      en: "Covariance $\\mathrm{Cov}(X,Y)=E[(X-\\mu_X)(Y-\\mu_Y)]$ and the normalized correlation $\\rho\\in[-1,1]$ capture the strength and direction of linear association.",
    },
    formula: "\\rho_{X,Y}=\\frac{\\mathrm{Cov}(X,Y)}{\\sigma_X\\sigma_Y},\\qquad \\mathrm{Cov}(X,Y)=E[XY]-\\mu_X\\mu_Y",
    notes: {
      fa: "همبستگی صفر استقلال نمی‌دهد؛ وابستگی‌های غیرخطی را نشان نمی‌دهد.",
      en: "Zero correlation does not imply independence; nonlinear dependence is invisible to correlation.",
    },
  },
  {
    id: "conditional-probability",
    title: { fa: "احتمال شرطی و قانون بیز", en: "Conditional Probability and Bayes' Rule" },
    def: {
      fa: "احتمال $A$ به‌شرط $B$ یعنی $P(A\\mid B)=P(A\\cap B)/P(B)$. قانون بیز این را وارونه می‌کند و پایه استنتاج بیزی است.",
      en: "The probability of $A$ given $B$ is $P(A\\mid B)=P(A\\cap B)/P(B)$. Bayes' rule inverts this and is the engine of Bayesian inference.",
    },
    formula: "P(A\\mid B)=\\frac{P(B\\mid A)\\,P(A)}{P(B)},\\qquad P(B)=\\sum_i P(B\\mid A_i)P(A_i)",
    notes: {
      fa: "قانون بیز پل بین درست‌نمایی و پسین است و توزیع‌های مزدوج را ممکن می‌کند.",
      en: "Bayes' rule bridges likelihood and posterior and makes conjugate updating possible.",
    },
  },
  {
    id: "mgf",
    title: { fa: "تابع مولد گشتاور و تابع مشخصه", en: "MGF and Characteristic Function" },
    def: {
      fa: "MGF یعنی $M_X(t)=E[e^{tX}]$ که گشتاورها را با مشتق در صفر تولید می‌کند. تابع مشخصه $\\varphi_X(t)=E[e^{itX}]$ همیشه موجود است و توزیع را یکتا مشخص می‌کند.",
      en: "The MGF $M_X(t)=E[e^{tX}]$ generates moments by differentiation at zero. The characteristic function $\\varphi_X(t)=E[e^{itX}]$ always exists and uniquely determines the distribution.",
    },
    formula: "M_X(t)=E[e^{tX}],\\ \\ E[X^{k}]=M_X^{(k)}(0);\\qquad \\varphi_X(t)=E[e^{itX}]",
    notes: {
      fa: "این ابزارها اثبات CLT و حد پواسون و جمع توزیع‌ها را ساده می‌کنند.",
      en: "These tools simplify proofs of the CLT, the Poisson limit, and sums of independent variables.",
    },
  },
];
