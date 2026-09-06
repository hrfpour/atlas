export type Bi = { fa: string; en: string };

export type QuizQuestion = {
  id: string;
  question: Bi;
  options: Bi[]; // 4 options
  correct: number; // index
  explanation: Bi;
};

export const quiz: QuizQuestion[] = [
  {
    id: "q1-rare-events",
    question: {
      fa: "تعداد ایمیل‌های هرزنامه دریافتی در یک ساعت با نرخ میانگین $\\lambda$ را کدام توزیع مدل می‌کند؟",
      en: "Which distribution models the number of spam emails received per hour with mean rate $\\lambda$?",
    },
    options: [
      { fa: "دو جمله‌ای", en: "Binomial" },
      { fa: "پواسون", en: "Poisson" },
      { fa: "هندسی", en: "Geometric" },
      { fa: "نمایی", en: "Exponential" },
    ],
    correct: 1,
    explanation: {
      fa: "پواسون تعداد رویدادهای نادر و مستقل در واحد زمان را مدل می‌کند و میانگین و واریانس آن هر دو $\\lambda$ است.",
      en: "Poisson models the count of rare, independent events per unit time, with mean and variance both $\\lambda$.",
    },
  },
  {
    id: "q2-sum-bernoulli",
    question: {
      fa: "اگر $X=\\sum_{i=1}^{n}B_i$ با $B_i\\overset{iid}{\\sim}\\mathrm{Bern}(p)$، توزیع $X$ چیست؟",
      en: "If $X=\\sum_{i=1}^{n}B_i$ with $B_i\\overset{iid}{\\sim}\\mathrm{Bern}(p)$, what is the distribution of $X$?",
    },
    options: [
      { fa: "هندسی", en: "Geometric" },
      { fa: "پواسون", en: "Poisson" },
      { fa: "دو جمله‌ای", en: "Binomial" },
      { fa: "دو جمله‌ای منفی", en: "Negative Binomial" },
    ],
    correct: 2,
    explanation: {
      fa: "مجموع $n$ متغیر برنولی مستقل، دو جمله‌ای $\\mathrm{Bin}(n,p)$ با میانگین $np$ و واریانس $np(1-p)$ است.",
      en: "The sum of $n$ independent Bernoulli variables is Binomial $\\mathrm{Bin}(n,p)$ with mean $np$ and variance $np(1-p)$.",
    },
  },
  {
    id: "q3-bin-poisson-limit",
    question: {
      fa: "وقتی $n\\to\\infty$، $p\\to0$ و $np\\to\\lambda$، توزیع $\\mathrm{Bin}(n,p)$ به چه چیزی میل می‌کند؟",
      en: "As $n\\to\\infty$, $p\\to0$ and $np\\to\\lambda$, what does $\\mathrm{Bin}(n,p)$ converge to?",
    },
    options: [
      { fa: "نرمال", en: "Normal" },
      { fa: "پواسون", en: "Poisson" },
      { fa: "هندسی", en: "Geometric" },
      { fa: "نمایی", en: "Exponential" },
    ],
    correct: 1,
    explanation: {
      fa: "حد پواسون-دو جمله‌ای: برای تعداد زیادی آزمایش با احتمال موفقیت بسیار کم، دو جمله‌ای به پواسون نزدیک می‌شود.",
      en: "The Poisson limit of the binomial: many trials with very small success probability converge to Poisson.",
    },
  },
  {
    id: "q4-memoryless",
    question: {
      fa: "تنها توزیع پیوسته بی‌حافظه، یعنی $P(X>s+t\\mid X>s)=P(X>t)$، کدام است؟",
      en: "Which is the only continuous memoryless distribution, i.e. $P(X>s+t\\mid X>s)=P(X>t)$?",
    },
    options: [
      { fa: "گاما", en: "Gamma" },
      { fa: "وایبول", en: "Weibull" },
      { fa: "نمایی", en: "Exponential" },
      { fa: "لگاریتم-نرمال", en: "Lognormal" },
    ],
    correct: 2,
    explanation: {
      fa: "در میان پیوسته‌ها، فقط نمایی بی‌حافظه است؛ ویژگی کلیدی فاصله‌ی میان رویدادهای پواسون.",
      en: "Among continuous distributions, only the exponential is memoryless; the key property of Poisson inter-arrival times.",
    },
  },
  {
    id: "q5-sum-exp-gamma",
    question: {
      fa: "اگر $X=\\sum_{i=1}^{\\alpha}Y_i$ با $Y_i\\overset{iid}{\\sim}\\mathrm{Exp}(\\beta)$، توزیع $X$ چیست؟",
      en: "If $X=\\sum_{i=1}^{\\alpha}Y_i$ with $Y_i\\overset{iid}{\\sim}\\mathrm{Exp}(\\beta)$, what is the distribution of $X$?",
    },
    options: [
      { fa: "بتا", en: "Beta" },
      { fa: "گاما", en: "Gamma" },
      { fa: "کای-دو", en: "Chi-square" },
      { fa: "ارلانگ", en: "Erlang" },
    ],
    correct: 1,
    explanation: {
      fa: "مجموع $\\alpha$ نمایی مستقل، گامای $\\mathrm{Gamma}(\\alpha,\\beta)$ است؛ اگر $\\alpha$ صحیح باشد به آن ارلانگ هم می‌گویند.",
      en: "The sum of $\\alpha$ independent exponentials is $\\mathrm{Gamma}(\\alpha,\\beta)$; if $\\alpha$ is integer it is also called Erlang.",
    },
  },
  {
    id: "q6-ratio-normal-cauchy",
    question: {
      fa: "نسبت دو متغیر نرمال استاندارد مستقل، $C=Z_1/Z_2$، چه توزیعی دارد؟",
      en: "The ratio of two independent standard normals, $C=Z_1/Z_2$, has which distribution?",
    },
    options: [
      { fa: "نرمال", en: "Normal" },
      { fa: "تی استیودنت", en: "Student-t" },
      { fa: "کوشی", en: "Cauchy" },
      { fa: "اف", en: "F" },
    ],
    correct: 2,
    explanation: {
      fa: "نسبت دو نرمال استاندارد، کوشی استاندارد است؛ دم‌های بسیار سنگین و میانگین تعریف‌نشده دارد.",
      en: "The ratio of two standard normals is a standard Cauchy; extremely heavy tails and undefined mean.",
    },
  },
  {
    id: "q7-lognormal",
    question: {
      fa: "اگر $\\ln X\\sim N(\\mu,\\sigma^{2})$، توزیع $X$ چیست و چه ویژگی برجسته‌ای دارد؟",
      en: "If $\\ln X\\sim N(\\mu,\\sigma^{2})$, what is the distribution of $X$ and its main feature?",
    },
    options: [
      {
        fa: "لگاریتم-نرمال، چوله به راست با دم راست بلند",
        en: "Lognormal, right-skewed with a long right tail",
      },
      {
        fa: "نرمال، متقارن و زنگوله‌ای",
        en: "Normal, symmetric and bell-shaped",
      },
      {
        fa: "کوشی، بدون میانگین",
        en: "Cauchy, with no mean",
      },
      {
        fa: "پارتو، با دم قانون توان",
        en: "Pareto, with a power-law tail",
      },
    ],
    correct: 0,
    explanation: {
      fa: "توان نمایی یک متغیر نرمال، لگاریتم-نرمال می‌دهد؛ نامتقارن و چوله به راست، مناسب درآمد و اندازه‌ها.",
      en: "Exponentiating a normal yields lognormal; asymmetric and right-skewed, fitting incomes and sizes.",
    },
  },
  {
    id: "q8-hypergeometric",
    question: {
      fa: "از یک دسته ۵۲تایی ۵ کارت بدون جایگذاری می‌کشیم؛ تعداد قلب‌ها چه توزیعی دارد؟",
      en: "Drawing 5 cards without replacement from a 52-card deck, what is the distribution of hearts?",
    },
    options: [
      { fa: "دو جمله‌ای", en: "Binomial" },
      { fa: "پواسون", en: "Poisson" },
      { fa: "هایپرژئومتریک", en: "Hypergeometric" },
      { fa: "دو جمله‌ای منفی", en: "Negative Binomial" },
    ],
    correct: 2,
    explanation: {
      fa: "نمونه‌گیری بدون جایگذاری از جامعه متناهی، هایپرژئومتریک می‌دهد؛ وابستگی میان کشیده‌ها از ضریب تصحیح متناهی پدیدار می‌شود.",
      en: "Sampling without replacement from a finite population gives Hypergeometric; dependence shows up via the finite-population correction.",
    },
  },
  {
    id: "q9-mean-var",
    question: {
      fa: "کدام توزیع گسسته ویژگی $E[X]=\\mathrm{Var}(X)$ را دارد؟",
      en: "Which discrete distribution has the property $E[X]=\\mathrm{Var}(X)$?",
    },
    options: [
      { fa: "دو جمله‌ای", en: "Binomial" },
      { fa: "پواسون", en: "Poisson" },
      { fa: "هندسی", en: "Geometric" },
      { fa: "برنولی", en: "Bernoulli" },
    ],
    correct: 1,
    explanation: {
      fa: "پواسون ویژگی بارز $E[X]=\\mathrm{Var}(X)=\\lambda$ را دارد؛ آزمون بیش‌پراکندگی بر همین اساس ساخته می‌شود.",
      en: "Poisson has the signature $E[X]=\\mathrm{Var}(X)=\\lambda$; the basis of over-dispersion tests.",
    },
  },
  {
    id: "q10-chisq-sum-sq",
    question: {
      fa: "اگر $Z_i\\overset{iid}{\\sim}N(0,1)$، توزیع $Q=\\sum_{i=1}^{k}Z_i^{2}$ چیست؟",
      en: "If $Z_i\\overset{iid}{\\sim}N(0,1)$, what is the distribution of $Q=\\sum_{i=1}^{k}Z_i^{2}$?",
    },
    options: [
      { fa: "نرمال", en: "Normal" },
      { fa: "گاما", en: "Gamma" },
      { fa: "کای-دو", en: "Chi-square" },
      { fa: "تی استیودنت", en: "Student-t" },
    ],
    correct: 2,
    explanation: {
      fa: "مجموع مربع $k$ نرمال استاندارد مستقل، $\\chi^{2}_{k}$ است؛ هم‌خانواده با گامای $\\alpha=k/2,\\beta=1/2$.",
      en: "The sum of squares of $k$ independent standard normals is $\\chi^{2}_{k}$; same family as Gamma with $\\alpha=k/2,\\beta=1/2$.",
    },
  },
  {
    id: "q11-clt-normal",
    question: {
      fa: "بر اساس CLT، $\\frac{\\sum_{i=1}^{n}X_i-n\\mu}{\\sigma\\sqrt{n}}$ به چه توزیعی میل می‌کند؟",
      en: "By the CLT, $\\frac{\\sum_{i=1}^{n}X_i-n\\mu}{\\sigma\\sqrt{n}}$ converges to which distribution?",
    },
    options: [
      { fa: "نرمال استاندارد $N(0,1)$", en: "Standard normal $N(0,1)$" },
      { fa: "تی استیودنت $t_{n-1}$", en: "Student-t $t_{n-1}$" },
      { fa: "کای-دو $\\chi^{2}_{n}$", en: "Chi-square $\\chi^{2}_{n}$" },
      { fa: "کوشی", en: "Cauchy" },
    ],
    correct: 0,
    explanation: {
      fa: "قضیه حد مرکزی میل میانگین نرمال‌شده به $N(0,1)$ را تضمین می‌کند، هر توزیعی که $X_i$ داشته باشد با $\\sigma^{2}$ متناهی.",
      en: "The CLT guarantees the normalized sample mean converges to $N(0,1)$, regardless of the original $X_i$ distribution as long as $\\sigma^{2}$ is finite.",
    },
  },
  {
    id: "q12-t-vs-normal",
    question: {
      fa: "تی استیودنت وقتی $\\nu\\to\\infty$ به چه توزیعی میل می‌کند؟",
      en: "As $\\nu\\to\\infty$, Student-t converges to which distribution?",
    },
    options: [
      { fa: "نرمال استاندارد", en: "Standard normal" },
      { fa: "کوشی", en: "Cauchy" },
      { fa: "کای-دو", en: "Chi-square" },
      { fa: "اف", en: "F" },
    ],
    correct: 0,
    explanation: {
      fa: "تی با درجه آزادی بزرگ به نرمال استاندارد میل می‌کند؛ در عمل $\\nu\\ge30$ معمولاً نرمال جایگزین می‌شود.",
      en: "Student-t with large degrees of freedom approaches the standard normal; in practice $\\nu\\ge30$ is often approximated by the normal.",
    },
  },
];
